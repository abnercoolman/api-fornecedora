const express = require("express");
const router = express.Router();

const OpenFinanceCustomerController = require("../controllers/OpenFinanceCustomerController");
const OpenFinanceAccountController = require("../controllers/OpenFinanceAccountController");
const OpenFinanceInstitutionController = require("../controllers/OpenFinanceInstitutionController");
const { verifyApiKey } = require("../middlewares/auth.middleware");
const { verifyConsent } = require("../middlewares/consent.middleware");

const customerController = new OpenFinanceCustomerController();
const accountController = new OpenFinanceAccountController();
const institutionController = new OpenFinanceInstitutionController();

// Middleware de autenticação para todas as rotas Open Finance
router.use(verifyApiKey);

// Rota de identificação da instituição (requer apenas API Key)
router.get("/institution", (req, res) => institutionController.getInstitutionData(req, res));

// Rotas de Cliente (requerem API Key e Consentimento)
router.get("/customers/:id", verifyConsent, (req, res) =>
    customerController.getById(req, res)
);
router.get("/customers/:id/accounts", verifyConsent, (req, res) =>
    customerController.getAccounts(req, res)
);

// Rotas de Conta (requerem API Key e Consentimento)
router.get("/accounts/:id/balance", verifyConsent, (req, res) =>
    accountController.getBalance(req, res)
);
router.get("/accounts/:id/transactions", verifyConsent, (req, res) =>
    accountController.getTransactions(req, res)
);

module.exports = router;