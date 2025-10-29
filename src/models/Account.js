const BaseModel = require("./base.model");

class Account extends BaseModel {
    constructor() {
        super("accounts");
    }

    async validate(data) {
        const errors = [];

        // Required fields
        if (!data.type) errors.push("Tipo de conta é obrigatório");
        if (!data.branch) errors.push("Agência é obrigatória");
        if (!data.number) errors.push("Número da conta é obrigatório");
        if (data.balance === undefined) errors.push("Saldo é obrigatório");

        // Format validations
        if (data.type && !["checking", "credit-card"].includes(data.type)) {
            errors.push("Tipo de conta inválido");
        }

        if (data.type === "credit-card" && data.creditCardLimit === undefined) {
            errors.push(
                "Limite do cartão de crédito é obrigatório para contas do tipo cartão"
            );
        }

        // Business rules
        if (data.creditCardLimit !== undefined && data.creditCardLimit < 0) {
            errors.push("Limite do cartão de crédito deve ser positivo");
        }

        return errors;
    }

    async create(data) {
        const errors = await this.validate(data);
        if (errors.length > 0) {
            throw new Error(errors.join("; "));
        }

        const account = {
            ...data,
            transactions: [],
        };

        return super.create(account);
    }

    async update(id, data) {
        const errors = await this.validate({ ...data, _id: id });
        if (errors.length > 0) {
            throw new Error(errors.join("; "));
        }

        return super.update(id, data);
    }

    async getTransactions(accountId) {
        const account = await this.getById(accountId);
        if (!account) {
            throw new Error("Conta não encontrada");
        }

        const transactionModel = new (require("./Transaction"))();
        const transactions = [];

        for (const transactionId of account.transactions) {
            const transaction = await transactionModel.getById(transactionId);
            if (transaction) {
                transactions.push(transaction);
            }
        }

        return transactions;
    }

    async getBalance(accountId) {
        const account = await this.getById(accountId);
        if (!account) {
            throw new Error("Conta não encontrada");
        }

        return {
            balance: account.balance,
            creditCardLimit:
                account.type === "credit-card"
                    ? account.creditCardLimit
                    : undefined,
            availableLimit:
                account.type === "credit-card"
                    ? account.creditCardLimit + account.balance // Para cartão de crédito, limite disponível = limite - fatura atual
                    : account.balance, // Para conta corrente, limite disponível = saldo
        };
    }

    async addTransaction(accountId, transactionId) {
        const account = await this.getById(accountId);
        if (!account) {
            throw new Error("Conta não encontrada");
        }

        account.transactions.push(transactionId);
        return this.update(accountId, account);
    }
}

module.exports = Account;
