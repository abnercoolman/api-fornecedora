const fs = require("fs");
const path = require("path");
const config = require("../config/config");

const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers[config.auth.apiKeyHeader];

    if (!apiKey) {
        return res.status(401).json({ error: "API Key não fornecida" });
    }

    const dbPath = path.join(__dirname, "..", "..", config.database.path);
    const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    // Encontra o clientAppId correspondente à API key
    const clientAppId = Object.keys(database.apiKeys).find(
        (key) => database.apiKeys[key] === apiKey
    );

    if (!clientAppId) {
        return res.status(401).json({ error: "API Key inválida" });
    }

    // Define o clientAppId no request para uso nos controladores
    req.clientAppId = clientAppId;
    next();
};

module.exports = {
    verifyApiKey,
};
