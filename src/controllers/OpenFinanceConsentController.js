const Consent = require("../models/Consent");
const Customer = require("../models/Customer");

class OpenFinanceConsentController {
    constructor() {
        this.consentModel = new Consent();
        this.customerModel = new Customer();
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

            // Verifica se já existe um consentimento ativo para este cliente e aplicação
            const existingConsent =
                await this.consentModel.findActiveByCustomerAndApp(
                    req.body.customerId,
                    req.clientAppId
                );

            if (existingConsent) {
                return res.status(409).json({
                    error: "Já existe um consentimento ativo para este cliente e aplicação",
                    consentId: existingConsent._id,
                });
            }

            // Valida as permissões solicitadas
            const validPermissions = ["accounts", "transactions"];
            const invalidPermissions = req.body.permissions.filter(
                (p) => !validPermissions.includes(p)
            );

            if (invalidPermissions.length > 0) {
                return res.status(400).json({
                    error: `Permissões inválidas: ${invalidPermissions.join(
                        ", "
                    )}`,
                });
            }

            // Cria o novo consentimento
            const consent = await this.consentModel.create({
                customerId: req.body.customerId,
                clientAppId: req.clientAppId,
                permissions: req.body.permissions,
            });

            res.status(201).json(consent);
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

    async getById(req, res) {
        try {
            const consent = await this.consentModel.getById(req.params.id);
            if (!consent) {
                return res
                    .status(404)
                    .json({ error: "Consentimento não encontrado" });
            }

            // Verifica se o consentimento pertence à aplicação que está fazendo a requisição
            if (consent.clientAppId !== req.clientAppId) {
                return res
                    .status(403)
                    .json({
                        error: "Acesso não autorizado a este consentimento",
                    });
            }

            res.json(consent);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async revoke(req, res) {
        try {
            const consent = await this.consentModel.getById(req.params.id);
            if (!consent) {
                return res
                    .status(404)
                    .json({ error: "Consentimento não encontrado" });
            }

            // Verifica se o consentimento pertence à aplicação que está fazendo a requisição
            if (consent.clientAppId !== req.clientAppId) {
                return res
                    .status(403)
                    .json({
                        error: "Acesso não autorizado a este consentimento",
                    });
            }

            // Revoga o consentimento
            await this.consentModel.revoke(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OpenFinanceConsentController;
