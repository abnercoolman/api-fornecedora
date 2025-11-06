const config = {
    port: process.env.PORT || 7856,
    database: {
        path: "database.json",
    },
    auth: {
        apiKeyHeader: "x-api-key",
    },
    consent: {
        defaultExpirationMonths: 6,
        consentExpirationMs: 6 * 30 * 24 * 60 * 60 * 1000, // 6 meses em milissegundos
    },
};

module.exports = config;
