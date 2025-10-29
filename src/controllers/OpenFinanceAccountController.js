const Account = require("../models/Account");
const Customer = require("../models/Customer");
const Consent = require("../models/Consent");

class OpenFinanceAccountController {
    constructor() {
        this.accountModel = new Account();
        this.customerModel = new Customer();
        this.consentModel = new Consent();
    }

    async getBalance(req, res) {
        try {
            const account = await this.accountModel.getById(req.params.id);
            if (!account) {
                return res.status(404).json({ error: "Conta não encontrada" });
            }

            // Encontra o cliente dono da conta
            const customers = await this.customerModel.getAll();
            const customer = customers.find((c) =>
                c.accounts.includes(account._id)
            );
            if (!customer) {
                return res
                    .status(404)
                    .json({ error: "Cliente não encontrado" });
            }

            // Verifica se o consentimento tem permissão para acessar a conta
            if (!req.consent || req.consent.customerId !== customer._id) {
                return res
                    .status(403)
                    .json({
                        error: "Consentimento não autorizado para esta conta",
                    });
            }

            if (!req.consent.permissions.includes("accounts")) {
                return res
                    .status(403)
                    .json({
                        error: "Consentimento não possui permissão para acessar saldo",
                    });
            }

            const balance = await this.accountModel.getBalance(req.params.id);
            res.json(balance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTransactions(req, res) {
        try {
            const account = await this.accountModel.getById(req.params.id);
            if (!account) {
                return res.status(404).json({ error: "Conta não encontrada" });
            }

            // Encontra o cliente dono da conta
            const customers = await this.customerModel.getAll();
            const customer = customers.find((c) =>
                c.accounts.includes(account._id)
            );
            if (!customer) {
                return res
                    .status(404)
                    .json({ error: "Cliente não encontrado" });
            }

            // Verifica se o consentimento tem permissão para acessar transações
            if (!req.consent || req.consent.customerId !== customer._id) {
                return res
                    .status(403)
                    .json({
                        error: "Consentimento não autorizado para esta conta",
                    });
            }

            if (!req.consent.permissions.includes("transactions")) {
                return res
                    .status(403)
                    .json({
                        error: "Consentimento não possui permissão para acessar transações",
                    });
            }

            const transactions = await this.accountModel.getTransactions(
                req.params.id
            );

            // Filtra apenas os dados permitidos pelo Open Finance
            const filteredTransactions = transactions.map((transaction) => ({
                _id: transaction._id,
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                currentInstallment: transaction.currentInstallment,
                totalInstallments: transaction.totalInstallments,
            }));

            res.json(filteredTransactions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OpenFinanceAccountController;
