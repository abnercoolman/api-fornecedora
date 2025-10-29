const { get } = require("httpie");

const API_URL = "http://localhost:3000/openfinance";
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

        // 2. Listar todos os consentimentos (novo endpoint)
        console.log("\n2. Listando todos os consentimentos...");
        const consentsListResponse = await get(`${API_URL}/consents`, {
            headers,
        });
        console.log("Lista de consentimentos:", consentsListResponse.data);
        console.log(
            `Total de consentimentos ativos: ${consentsListResponse.data.length}`
        );

        // 3. Consultar consentimento específico
        const consentId = "consent_001"; // Usando um consentimento existente do database.json
        console.log("\n3. Consultando status do consentimento específico...");
        const consentResponse = await get(`${API_URL}/consents/${consentId}`, {
            headers,
        });
        console.log("Status do consentimento:", consentResponse.data);

        // Verificar se o consentimento está ativo antes de prosseguir
        if (consentResponse.data.status !== "active") {
            console.log(
                "Consentimento não está ativo. Interrompendo testes de dados protegidos."
            );
            return;
        }

        // 4. Buscar dados do cliente (sem middleware de consentimento)
        console.log("\n4. Buscando dados do cliente...");
        const customerResponse = await get(`${API_URL}/customers/cus_001`, {
            headers,
        });
        console.log("Dados do cliente:", customerResponse.data);

        // 5. Buscar contas do cliente (sem middleware de consentimento)
        console.log("\n5. Buscando contas do cliente...");
        const accountsResponse = await get(
            `${API_URL}/customers/cus_001/accounts`,
            {
                headers,
            }
        );
        console.log("Contas do cliente:", accountsResponse.data);

        // 6. Buscar saldo da conta (sem middleware de consentimento)
        console.log("\n6. Buscando saldo da conta...");
        const balanceResponse = await get(
            `${API_URL}/accounts/acc_001/balance`,
            {
                headers,
            }
        );
        console.log("Saldo da conta:", balanceResponse.data);

        // 7. Buscar transações da conta (sem middleware de consentimento)
        console.log("\n7. Buscando transações da conta...");
        const transactionsResponse = await get(
            `${API_URL}/accounts/acc_001/transactions`,
            {
                headers,
            }
        );
        console.log("Transações da conta:", transactionsResponse.data);

        console.log("\n=== Fluxo de teste atualizado ===");
        console.log(
            "IMPORTANTE: A verificação de consentimento agora deve ser feita pela API consumidora"
        );
        console.log(
            "1. Use GET /consents/ para listar todos os consentimentos ativos da aplicação"
        );
        console.log(
            "2. Use GET /consents/:id para verificar se um consentimento específico está ativo"
        );
        console.log(
            "3. Se ativo, prossiga com as chamadas para os endpoints de dados"
        );
        console.log(
            "4. Se inativo, não faça chamadas para endpoints que requerem consentimento"
        );

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
