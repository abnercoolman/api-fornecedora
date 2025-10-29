const Account = require("../models/Account");
const Customer = require("../models/Customer");

class AccountController {
    constructor() {
        this.accountModel = new Account();
        this.customerModel = new Customer();
    }

    async getAll(req, res) {
        try {
            const accounts = await this.accountModel.getAll();
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const account = await this.accountModel.getById(req.params.id);
            if (!account) {
                return res.status(404).json({ error: "Conta não encontrada" });
            }
            res.json(account);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            // Verifica se o cliente existe
            const customer = await this.customerModel.getById(
                req.body.customerId
            );
            if (!customer) {
                return res
                    .status(404)
                    .json({ error: "Cliente não encontrado" });
            }

            // Cria a conta
            const account = await this.accountModel.create(req.body);

            // Adiciona a conta ao cliente
            customer.accounts.push(account._id);
            await this.customerModel.update(customer._id, customer);

            res.status(201).json(account);
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
            const account = await this.accountModel.update(
                req.params.id,
                req.body
            );
            if (!account) {
                return res.status(404).json({ error: "Conta não encontrada" });
            }
            res.json(account);
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
            const account = await this.accountModel.getById(req.params.id);
            if (!account) {
                return res.status(404).json({ error: "Conta não encontrada" });
            }

            // Remove a conta do cliente
            const customer = await this.customerModel.getById(
                req.body.customerId
            );
            if (customer) {
                customer.accounts = customer.accounts.filter(
                    (id) => id !== account._id
                );
                await this.customerModel.update(customer._id, customer);
            }

            // Deleta a conta
            await this.accountModel.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTransactions(req, res) {
        try {
            const transactions = await this.accountModel.getTransactions(
                req.params.id
            );
            res.json(transactions);
        } catch (error) {
            if (error.message === "Conta não encontrada") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async getBalance(req, res) {
        try {
            const balance = await this.accountModel.getBalance(req.params.id);
            res.json(balance);
        } catch (error) {
            if (error.message === "Conta não encontrada") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AccountController;
