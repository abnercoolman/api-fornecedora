const express = require("express");
const app = express();

// Middlewares
app.use(express.json());

// Rotas
const internalRoutes = require("./routes/internal.routes");
const openFinanceRoutes = require("./routes/openfinance.routes");

// Rotas internas (sem autenticação)
app.use("/", internalRoutes);

// Rotas Open Finance (com autenticação e consentimento)
app.use("/openfinance", openFinanceRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Erro interno do servidor" });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

module.exports = app;
