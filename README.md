# Documentação das Rotas Open Finance

## Visão Geral

Este documento descreve as rotas da API Fornecedora para o Open Finance, incluindo sua segregação entre rotas públicas (externas) e privadas (internas), bem como os testes associados.

### Nova Arquitetura de Consentimento

A API foi refatorada para implementar uma nova arquitetura onde:

-   **API Consumidora** é responsável por verificar o status do consentimento antes de fazer chamadas
-   **API Fornecedora** realiza verificação interna de consentimento em cada endpoint protegido
-   **Middleware de consentimento** foi removido das rotas públicas
-   **Verificação de consentimento** é feita internamente pelos controladores usando o método `findActiveByCustomerAndApp`

## Estrutura das Rotas

### Rotas Públicas (Externas) - `/openfinance`

Todas as rotas públicas requerem:

-   Header `x-api-key`: Chave de API válida

**Importante**: As rotas de dados (customers, accounts) fazem verificação interna de consentimento ativo. A API consumidora deve verificar o status do consentimento usando o endpoint `/consents/:id` antes de fazer chamadas para endpoints protegidos.

#### Endpoints Disponíveis

1. **Identificação da Instituição**

    ```
    GET /institution
    ```

    - Retorna os dados de identificação da instituição
    - Requer apenas API Key (não necessita de consentimento)
    - Exemplo de resposta:

    ```json
    {
        "id": "if_001",
        "name": "bnk_001",
        "status": true
    }
    ```

2. **Consulta de Consentimento**

    ```
    GET /consents/:consentId
    ```

    - Retorna os dados do consentimento e seu status
    - Usado pela API consumidora para verificar se o consentimento está ativo antes de fazer outras chamadas
    - Requer apenas API Key (não necessita de consentimento)
    - Exemplo de resposta:

    ```json
    {
        "_id": "consent_001",
        "customerId": "cus_001",
        "clientAppId": "app_openfinance_001",
        "permissions": ["accounts", "transactions"],
        "status": "active",
        "createdAt": "2025-01-15T10:00:00Z",
        "expiresAt": "2025-07-15T10:00:00Z"
    }
    ```

3. **Dados do Cliente**

    ```
    GET /customers/:customerId
    ```

    - Retorna os dados básicos do cliente
    - Verifica internamente se existe consentimento ativo para o cliente e aplicação
    - Exemplo de resposta:

    ```json
    {
        "_id": "cus_001",
        "name": "Maria Silva",
        "cpf": "12345678900"
    }
    ```

4. **Contas do Cliente**

    ```
    GET /customers/:customerId/accounts
    ```

    - Lista todas as contas do cliente
    - Verifica internamente se existe consentimento ativo com permissão "accounts"
    - Exemplo de resposta:

    ```json
    [
        {
            "_id": "acc_001",
            "type": "credit-card",
            "branch": "0001",
            "number": "12345-6"
        },
        {
            "_id": "acc_002",
            "type": "checking",
            "branch": "0001",
            "number": "12345-7"
        }
    ]
    ```

5. **Saldo da Conta**

    ```
    GET /accounts/:accountId/balance
    ```

    - Retorna o saldo e limites da conta
    - Verifica internamente se existe consentimento ativo com permissão "accounts"
    - Exemplo de resposta (cartão de crédito):

    ```json
    {
        "balance": -1500.75,
        "creditCardLimit": 5000,
        "availableLimit": 3499.25
    }
    ```

6. **Transações da Conta**
    ```
    GET /accounts/:accountId/transactions
    ```
    - Lista as transações da conta
    - Verifica internamente se existe consentimento ativo com permissão "transactions"
    - Exemplo de resposta:
    ```json
    [
        {
            "_id": "txn_001",
            "date": "2025-01-15",
            "description": "Compra no supermercado",
            "amount": 150,
            "type": "debit",
            "currentInstallment": 2,
            "totalInstallments": 6
        }
    ]
    ```

### Rotas Privadas (Internas) - `/internal/openfinance`

Rotas de gerenciamento de consentimento que não requerem API Key:

1. **Criar Consentimento**

    ```
    POST /consents
    ```

2. **Revogar Consentimento**
    ```
    DELETE /consents/:consentId
    ```

## Testes

### Arquivo de Teste

O arquivo `test/openfinance.test.js` contém testes automatizados para as rotas públicas do Open Finance.

### Configuração dos Testes

```javascript
const API_URL = "http://localhost:3000/openfinance";
const headers = {
    "x-api-key": "key_app_management_001",
};
```

**Nota**: Os testes foram atualizados para remover o header `x-consent-id`, pois a verificação de consentimento agora é feita internamente pelos controladores.

### Cenários de Teste

1. **Busca de Dados da Instituição**

    - Testa a rota GET /institution
    - Verifica se retorna os dados de identificação da instituição
    - Valida autenticação apenas com API Key (sem necessidade de consentimento)

2. **Consulta de Consentimento**

    - Testa a rota GET /consents/:consentId
    - Verifica se retorna os dados do consentimento e seu status
    - Valida que a API consumidora pode verificar o status antes de fazer outras chamadas

3. **Busca de Dados do Cliente**

    - Testa a rota GET /customers/:customerId
    - Verifica se retorna os dados básicos do cliente
    - Valida verificação interna de consentimento ativo

4. **Busca de Contas do Cliente**

    - Testa a rota GET /customers/:customerId/accounts
    - Verifica se lista todas as contas associadas ao cliente
    - Valida verificação interna de consentimento com permissão "accounts"

5. **Busca de Saldo da Conta**

    - Testa a rota GET /accounts/:accountId/balance
    - Verifica se retorna informações de saldo e limites
    - Valida verificação interna de consentimento com permissão "accounts"

6. **Busca de Transações da Conta**
    - Testa a rota GET /accounts/:accountId/transactions
    - Verifica se lista o histórico de transações
    - Valida verificação interna de consentimento com permissão "transactions"

### Executando os Testes

Para executar os testes:

```bash
npm run test:openfinance
```

### Dados de Teste
Os testes utilizam dados pré-configurados no arquivo `database.json`:
- Cliente: cus_001 (Maria Silva)
- Contas: acc_001 (cartão) e acc_002 (corrente)
- Consentimento: consent_001 (ativo, associado a app_openfinance_001)
- API Key: key_app_management_001 (mapeada para app_openfinance_001)

## Nova Arquitetura de Verificação de Consentimento

### Fluxo Recomendado para API Consumidora
1. **Verificar Status do Consentimento**: Fazer chamada para `GET /consents/:id` para verificar se o consentimento está ativo
2. **Se Ativo**: Prosseguir com chamadas para endpoints de dados (customers, accounts)
3. **Se Inativo**: Não fazer chamadas para endpoints protegidos e tratar adequadamente

### Verificação Interna nos Controladores
- Cada endpoint protegido usa o método `findActiveByCustomerAndApp` do modelo Consent
- Verifica se existe consentimento ativo para o `customerId` e `clientAppId`
- Valida permissões específicas quando necessário ("accounts", "transactions")
- Retorna erro 403 se o consentimento não for válido

### Benefícios da Nova Arquitetura
- **Responsabilidade Clara**: API consumidora gerencia o fluxo de consentimento
- **Segurança Dupla**: Verificação tanto na API consumidora quanto na fornecedora
- **Flexibilidade**: Permite diferentes estratégias de cache e otimização na API consumidora
- **Manutenibilidade**: Código mais limpo sem middleware complexo

## Observações Importantes
1. Todas as rotas públicas requerem autenticação via API Key
2. A verificação de consentimento é feita internamente pelos controladores
3. API consumidora deve verificar status do consentimento antes de fazer chamadas
4. O consentimento deve estar ativo e ter as permissões necessárias
5. O consentimento deve pertencer ao cliente cujos dados estão sendo acessados
6. As rotas de gerenciamento de consentimento são isoladas como rotas internas
7. Os testes focam apenas nas operações de leitura (GET) que são públicas
