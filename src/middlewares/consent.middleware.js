const fs = require("fs");
const path = require("path");
const config = require("../config/config");

const verifyConsent = (req, res, next) => {
    const consentId = req.headers["x-consent-id"];

    if (!consentId) {
        return res
            .status(401)
            .json({ error: "ID do consentimento não fornecido" });
    }

    const dbPath = path.join(__dirname, "..", "..", config.database.path);
    const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    const consent = database.consents?.find((c) => c._id === consentId);

    if (!consent) {
        return res.status(403).json({ error: "Consentimento não encontrado" });
    }

    if (consent.status !== "active") {
        return res.status(403).json({ error: "Consentimento inativo" });
    }

    const expiresAt = new Date(consent.expiresAt);
    if (expiresAt < new Date()) {
        return res.status(403).json({ error: "Consentimento expirado" });
    }

    // Adiciona o consentimento ao request para uso posterior
    req.consent = consent;
    next();
};

module.exports = {
    verifyConsent,
};
