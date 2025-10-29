const BaseModel = require("./base.model");

class Transaction extends BaseModel {
    constructor() {
        super("transactions");
    }

    async validate(data) {
        const errors = [];

        // Required fields
        if (!data.date) errors.push("Data é obrigatória");
        if (!data.description) errors.push("Descrição é obrigatória");
        if (data.amount === undefined) errors.push("Valor é obrigatório");
        if (!data.type) errors.push("Tipo é obrigatório");
        if (!data.category) errors.push("Categoria é obrigatória");
        if (data.currentInstallment === undefined)
            errors.push("Número da parcela atual é obrigatório");
        if (data.totalInstallments === undefined)
            errors.push("Total de parcelas é obrigatório");

        // Format validations
        if (data.date && isNaN(Date.parse(data.date))) {
            errors.push("Data inválida");
        }

        if (data.amount !== undefined && typeof data.amount !== "number") {
            errors.push("Valor deve ser numérico");
        }

        if (data.type && !["credit", "debit"].includes(data.type)) {
            errors.push("Tipo de transação inválido");
        }

        // Business rules
        if (
            data.currentInstallment !== undefined &&
            data.totalInstallments !== undefined
        ) {
            if (data.currentInstallment < 1) {
                errors.push("Número da parcela atual deve ser maior que zero");
            }
            if (data.totalInstallments < 1) {
                errors.push("Total de parcelas deve ser maior que zero");
            }
            if (data.currentInstallment > data.totalInstallments) {
                errors.push(
                    "Número da parcela atual não pode ser maior que o total de parcelas"
                );
            }
        }

        if (data.amount !== undefined && data.amount <= 0) {
            errors.push("Valor deve ser maior que zero");
        }

        return errors;
    }

    async create(data) {
        const errors = await this.validate(data);
        if (errors.length > 0) {
            throw new Error(errors.join("; "));
        }

        // Ajusta o valor para negativo se for débito
        const transaction = {
            ...data,
            amount:
                data.type === "debit"
                    ? -Math.abs(data.amount)
                    : Math.abs(data.amount),
        };

        const newTransaction = await super.create(transaction);

        // Atualiza o saldo da conta
        const accountModel = new (require("./Account"))();
        const account = await accountModel.getById(data.accountId);
        if (account) {
            account.balance += transaction.amount;
            await accountModel.update(account._id, account);
            await accountModel.addTransaction(account._id, newTransaction._id);
        }

        return newTransaction;
    }

    async update(id, data) {
        const errors = await this.validate({ ...data, _id: id });
        if (errors.length > 0) {
            throw new Error(errors.join("; "));
        }

        // Ajusta o valor para negativo se for débito
        const transaction = {
            ...data,
            amount:
                data.type === "debit"
                    ? -Math.abs(data.amount)
                    : Math.abs(data.amount),
        };

        return super.update(id, transaction);
    }
}

module.exports = Transaction;
