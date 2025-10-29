const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

class TransactionController {
    constructor() {
        this.transactionModel = new Transaction();
        this.accountModel = new Account();
    }

    async getAll(req, res) {
        try {
            const transactions = await this.transactionModel.getAll();
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const transaction = await this.transactionModel.getById(
                req.params.id
            );
            if (!transaction) {
                return res
                    .status(404)
                    .json({ error: "Transação não encontrada" });
            }
            res.json(transaction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            // Verifica se a conta existe
            const account = await this.accountModel.getById(req.body.accountId);
            if (!account) {
                return res.status(404).json({ error: "Conta não encontrada" });
            }

            // Para cartões de crédito, verifica se há limite disponível
            if (account.type === "credit-card" && req.body.type === "debit") {
                const balance = await this.accountModel.getBalance(account._id);
                if (Math.abs(req.body.amount) > balance.availableLimit) {
                    return res
                        .status(400)
                        .json({ error: "Limite de crédito insuficiente" });
                }
            }

            // Para contas correntes, verifica se há saldo suficiente
            if (account.type === "checking" && req.body.type === "debit") {
                if (Math.abs(req.body.amount) > account.balance) {
                    return res
                        .status(400)
                        .json({ error: "Saldo insuficiente" });
                }
            }

            // Cria a transação
            const transaction = await this.transactionModel.create({
                ...req.body,
                accountId: account._id,
            });

            res.status(201).json(transaction);
        } catch (error) {
            if (
                error.message.includes("obrigatório") ||
                error.message.includes("inválido")
            ) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const transaction = await this.transactionModel.update(
                req.params.id,
                req.body
            );
            if (!transaction) {
                return res
                    .status(404)
                    .json({ error: "Transação não encontrada" });
            }
            res.json(transaction);
        } catch (error) {
            if (
                error.message.includes("obrigatório") ||
                error.message.includes("inválido")
            ) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const transaction = await this.transactionModel.getById(
                req.params.id
            );
            if (!transaction) {
                return res
                    .status(404)
                    .json({ error: "Transação não encontrada" });
            }

            // Remove a transação da conta
            const account = await this.accountModel.getById(
                transaction.accountId
            );
            if (account) {
                account.transactions = account.transactions.filter(
                    (id) => id !== transaction._id
                );
                account.balance -= transaction.amount; // Reverte o efeito da transação no saldo
                await this.accountModel.update(account._id, account);
            }

            // Deleta a transação
            await this.transactionModel.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getByAccount(req, res) {
        try {
            const account = await this.accountModel.getById(
                req.params.accountId
            );
            if (!account) {
                return res.status(404).json({ error: "Conta não encontrada" });
            }

            const transactions = await this.accountModel.getTransactions(
                account._id
            );
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TransactionController;
