const { get } = require("httpie");

const API_URL = "http://localhost:7856/openfinance";
const headers = {
    "x-api-key": "key_app_management_001",
};

async function testOpenFinanceEndpoints() {
    try {
        console.log("\n=== Testando endpoints do Open Finance ===\n");

        // 1. Buscar dados da instituição
        console.log("1. Buscando dados da instituição...");
        const institutionResponse = await get(`${API_URL}/institution`, {
            headers,
        });
        console.log("Dados da instituição:", institutionResponse.data);

        // Obtendo consentimento existente para os testes
        const consentId = "consent_001"; // Usando um consentimento existente do database.json

        // 2. Buscar dados do cliente
        console.log("\n2. Buscando dados do cliente...");
        const customerResponse = await get(`${API_URL}/customers/cus_001`, {
            headers: {
                ...headers,
                "x-consent-id": consentId,
            },
        });
        console.log("Dados do cliente:", customerResponse.data);

        // 3. Buscar contas do cliente
        console.log("\n3. Buscando contas do cliente...");
        const accountsResponse = await get(`${API_URL}/customers/cus_001/accounts`, {
            headers: {
                ...headers,
                "x-consent-id": consentId,
            },
        });
        console.log("Contas do cliente:", accountsResponse.data);

        // 4. Buscar saldo da conta
        console.log("\n4. Buscando saldo da conta...");
        const balanceResponse = await get(`${API_URL}/accounts/acc_001/balance`, {
            headers: {
                ...headers,
                "x-consent-id": consentId,
            },
        });
        console.log("Saldo da conta:", balanceResponse.data);

        // 5. Buscar transações da conta
        console.log("\n5. Buscando transações da conta...");
        const transactionsResponse = await get(`${API_URL}/accounts/acc_001/transactions`, {
            headers: {
                ...headers,
                "x-consent-id": consentId,
            },
        });
        console.log("Transações da conta:", transactionsResponse.data);

        console.log("\nTodos os testes passaram com sucesso!");
    } catch (error) {
        console.error("\nErro durante os testes:", error.message);
        if (error.data) {
            console.error("Detalhes do erro:", error.data);
        }
        process.exit(1);
    }
}

testOpenFinanceEndpoints();
