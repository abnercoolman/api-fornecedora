const express = require("express");
const router = express.Router();

const OpenFinanceCustomerController = require("../controllers/OpenFinanceCustomerController");
const OpenFinanceAccountController = require("../controllers/OpenFinanceAccountController");
const OpenFinanceInstitutionController = require("../controllers/OpenFinanceInstitutionController");
const OpenFinanceConsentController = require("../controllers/OpenFinanceConsentController");
const { verifyApiKey } = require("../middlewares/auth.middleware");

const customerController = new OpenFinanceCustomerController();
const accountController = new OpenFinanceAccountController();
const institutionController = new OpenFinanceInstitutionController();
const consentController = new OpenFinanceConsentController();

// Middleware de autenticação para todas as rotas Open Finance
router.use(verifyApiKey);

// Rota de identificação da instituição (requer apenas API Key)
router.get("/institution", (req, res) => institutionController.getInstitutionData(req, res));

// Rota para consulta de consentimento (requer apenas API Key)
router.get("/consents/:id", (req, res) => consentController.getById(req, res));

// Rotas de Cliente (requerem apenas API Key - verificação de consentimento será feita pela API consumidora)
router.get("/customers/:id", (req, res) =>
    customerController.getById(req, res)
);
router.get("/customers/:id/accounts", (req, res) =>
    customerController.getAccounts(req, res)
);

// Rotas de Conta (requerem apenas API Key - verificação de consentimento será feita pela API consumidora)
router.get("/accounts/:id/balance", (req, res) =>
    accountController.getBalance(req, res)
);
router.get("/accounts/:id/transactions", (req, res) =>
    accountController.getTransactions(req, res)
);

module.exports = router;