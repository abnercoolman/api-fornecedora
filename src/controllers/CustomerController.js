const Customer = require("../models/Customer");

class CustomerController {
    constructor() {
        this.customerModel = new Customer();
    }

    async getAll(req, res) {
        try {
            const customers = await this.customerModel.getAll();
            res.json(customers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const customer = await this.customerModel.getById(req.params.id);
            if (!customer) {
                return res
                    .status(404)
                    .json({ error: "Cliente não encontrado" });
            }
            res.json(customer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const customer = await this.customerModel.create(req.body);
            res.status(201).json(customer);
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
            const customer = await this.customerModel.update(
                req.params.id,
                req.body
            );
            if (!customer) {
                return res
                    .status(404)
                    .json({ error: "Cliente não encontrado" });
            }
            res.json(customer);
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
            const success = await this.customerModel.delete(req.params.id);
            if (!success) {
                return res
                    .status(404)
                    .json({ error: "Cliente não encontrado" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAccounts(req, res) {
        try {
            const accounts = await this.customerModel.getAccounts(
                req.params.id
            );
            res.json(accounts);
        } catch (error) {
            if (error.message === "Cliente não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CustomerController;
