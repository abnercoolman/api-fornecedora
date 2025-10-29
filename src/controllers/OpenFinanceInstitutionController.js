const fs = require("fs");
const path = require("path");
const config = require("../config/config");

class OpenFinanceInstitutionController {
    async getInstitutionData(req, res) {
        try {
            const dbPath = path.join(__dirname, "..", "..", config.database.path);
            const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));

            if (!database.institution) {
                return res.status(404).json({ error: "Dados da instituição não encontrados" });
            }

            res.json(database.institution);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OpenFinanceInstitutionController;