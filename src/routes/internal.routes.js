const express = require("express");
const router = express.Router();

const CustomerController = require("../controllers/CustomerController");
const AccountController = require("../controllers/AccountController");
const TransactionController = require("../controllers/TransactionController");
const OpenFinanceConsentController = require("../controllers/OpenFinanceConsentController");

const customerController = new CustomerController();
const accountController = new AccountController();
const transactionController = new TransactionController();
const consentController = new OpenFinanceConsentController();

// Rotas de Gerenciamento de Consentimento (acesso interno)
router.post("/openfinance/consents", (req, res) => consentController.create(req, res));
router.delete("/openfinance/consents/:id", (req, res) => consentController.revoke(req, res));

// Rotas de Clientes
router.get("/customers", (req, res) => customerController.getAll(req, res));
router.get("/customers/:id", (req, res) => customerController.getById(req, res));
router.post("/customers", (req, res) => customerController.create(req, res));
router.put("/customers/:id", (req, res) => customerController.update(req, res));
router.delete("/customers/:id", (req, res) => customerController.delete(req, res));
router.get("/customers/:id/accounts", (req, res) => customerController.getAccounts(req, res));

// Rotas de Contas
router.get("/accounts", (req, res) => accountController.getAll(req, res));
router.get("/accounts/:id", (req, res) => accountController.getById(req, res));
router.post("/accounts", (req, res) => accountController.create(req, res));
router.put("/accounts/:id", (req, res) => accountController.update(req, res));
router.delete("/accounts/:id", (req, res) => accountController.delete(req, res));
router.get("/accounts/:id/transactions", (req, res) => accountController.getTransactions(req, res));
router.get("/accounts/:id/balance", (req, res) => accountController.getBalance(req, res));

// Rotas de Transações
router.get("/transactions", (req, res) => transactionController.getAll(req, res));
router.get("/transactions/:id", (req, res) => transactionController.getById(req, res));
router.post("/transactions", (req, res) => transactionController.create(req, res));
router.put("/transactions/:id", (req, res) => transactionController.update(req, res));
router.delete("/transactions/:id", (req, res) => transactionController.delete(req, res));
router.get("/accounts/:accountId/transactions", (req, res) => transactionController.getByAccount(req, res));

module.exports = router;
