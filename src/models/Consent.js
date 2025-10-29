const BaseModel = require("./base.model");
const config = require("../config/config");

class Consent extends BaseModel {
    constructor() {
        super("consents");
    }

    async validate(data) {
        const errors = [];

        // Required fields
        if (!data.customerId) errors.push("ID do cliente é obrigatório");
        if (!data.clientAppId)
            errors.push("ID da aplicação cliente é obrigatória");
        if (!data.permissions || !Array.isArray(data.permissions))
            errors.push("Permissões são obrigatórias");
        if (!data.status) errors.push("Status é obrigatório");

        // Format validations
        if (
            data.permissions &&
            !data.permissions.every((p) =>
                ["accounts", "transactions"].includes(p)
            )
        ) {
            errors.push("Permissões inválidas");
        }

        if (data.status && !["active", "revoked"].includes(data.status)) {
            errors.push("Status inválido");
        }

        // Business rules
        if (data.customerId) {
            const customerModel = new (require("./Customer"))();
            const customer = await customerModel.getById(data.customerId);
            if (!customer) {
                errors.push("Cliente não encontrado");
            }
        }

        if (data.clientAppId) {
            const db = this._readDatabase();
            if (!db.apiKeys[data.clientAppId]) {
                errors.push("Aplicação cliente não encontrada");
            }
        }

        return errors;
    }

    async create(data) {
        const now = new Date();
        const expirationDate = new Date(now.getTime());
        expirationDate.setMonth(expirationDate.getMonth() + config.consent.defaultExpirationMonths);

        const consentData = {
            ...data,
            status: "active",
            createdAt: now.toISOString(),
            expiresAt: expirationDate.toISOString(),
        };

        const errors = await this.validate(consentData);
        if (errors.length > 0) {
            throw new Error(errors.join("; "));
        }

        return super.create(consentData);
    }

    async update(id, data) {
        const errors = await this.validate({ ...data, _id: id });
        if (errors.length > 0) {
            throw new Error(errors.join("; "));
        }

        return super.update(id, data);
    }

    async revoke(id) {
        const consent = await this.getById(id);
        if (!consent) {
            throw new Error("Consentimento não encontrado");
        }

        return this.update(id, { ...consent, status: "revoked" });
    }

    async findActiveByCustomerAndApp(customerId, clientAppId) {
        const consents = await this.getAll();
        return consents.find(
            (consent) =>
                consent.customerId === customerId &&
                consent.clientAppId === clientAppId &&
                consent.status === "active" &&
                new Date(consent.expiresAt) > new Date()
        );
    }

    async isValid(consentId) {
        const consent = await this.getById(consentId);
        if (!consent) return false;

        return (
            consent.status === "active" &&
            new Date(consent.expiresAt) > new Date()
        );
    }

    async hasPermission(consentId, permission) {
        const consent = await this.getById(consentId);
        if (!consent) return false;

        return (
            consent.status === "active" &&
            new Date(consent.expiresAt) > new Date() &&
            consent.permissions.includes(permission)
        );
    }
}

module.exports = Consent;
