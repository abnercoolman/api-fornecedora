const Customer = require("../models/Customer");
const Consent = require("../models/Consent");

class OpenFinanceCustomerController {
    constructor() {
        this.customerModel = new Customer();
        this.consentModel = new Consent();
    }

    async getById(req, res) {
        try {
            // Verifica se o consentimento tem permissão para acessar dados do cliente
            if (!req.consent || req.consent.customerId !== req.params.id) {
                return res
                    .status(403)
                    .json({
                        error: "Consentimento não autorizado para este cliente",
                    });
            }

            const customer = await this.customerModel.getById(req.params.id);
            if (!customer) {
                return res
                    .status(404)
                    .json({ error: "Cliente não encontrado" });
            }

            // Retorna apenas os dados permitidos pelo Open Finance
            const { _id, name, cpf } = customer;
            res.json({ _id, name, cpf });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAccounts(req, res) {
        try {
            // Verifica se o consentimento tem permissão para acessar contas
            if (!req.consent || req.consent.customerId !== req.params.id) {
                return res
                    .status(403)
                    .json({
                        error: "Consentimento não autorizado para este cliente",
                    });
            }

            if (!req.consent.permissions.includes("accounts")) {
                return res
                    .status(403)
                    .json({
                        error: "Consentimento não possui permissão para acessar contas",
                    });
            }

            const accounts = await this.customerModel.getAccounts(
                req.params.id
            );

            // Retorna apenas os dados permitidos pelo Open Finance
            const filteredAccounts = accounts.map((account) => ({
                _id: account._id,
                type: account.type,
                branch: account.branch,
                number: account.number,
            }));

            res.json(filteredAccounts);
        } catch (error) {
            if (error.message === "Cliente não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OpenFinanceCustomerController;
