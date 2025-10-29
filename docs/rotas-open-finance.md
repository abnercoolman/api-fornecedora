# Documentação das Rotas Open Finance

## Visão Geral
Este documento descreve as rotas da API Fornecedora para o Open Finance, incluindo sua segregação entre rotas públicas (externas) e privadas (internas), bem como os testes associados.

## Estrutura das Rotas

### Rotas Públicas (Externas) - `/openfinance`
Todas as rotas públicas requerem:
- Header `x-api-key`: Chave de API válida
- Header `x-consent-id`: ID do consentimento válido e ativo (exceto para a rota /institution)

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

2. **Dados do Cliente**
   ```
   GET /customers/:customerId
   ```
   - Retorna os dados básicos do cliente
   - Exemplo de resposta:
   ```json
   {
     "_id": "cus_001",
     "name": "Maria Silva",
     "cpf": "12345678900"
   }
   ```

3. **Contas do Cliente**
   ```
   GET /customers/:customerId/accounts
   ```
   - Lista todas as contas do cliente
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

4. **Saldo da Conta**
   ```
   GET /accounts/:accountId/balance
   ```
   - Retorna o saldo e limites da conta
   - Exemplo de resposta (cartão de crédito):
   ```json
   {
     "balance": -1500.75,
     "creditCardLimit": 5000,
     "availableLimit": 3499.25
   }
   ```

5. **Transações da Conta**
   ```
   GET /accounts/:accountId/transactions
   ```
   - Lista as transações da conta
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
    "x-consent-id": "consent_001"
};
```

### Cenários de Teste

1. **Busca de Dados da Instituição**
   - Testa a rota GET /institution
   - Verifica se retorna os dados de identificação da instituição
   - Valida autenticação apenas com API Key (sem necessidade de consentimento)

2. **Busca de Dados do Cliente**
   - Testa a rota GET /customers/:customerId
   - Verifica se retorna os dados básicos do cliente

3. **Busca de Contas do Cliente**
   - Testa a rota GET /customers/:customerId/accounts
   - Verifica se lista todas as contas associadas ao cliente

4. **Busca de Saldo da Conta**
   - Testa a rota GET /accounts/:accountId/balance
   - Verifica se retorna informações de saldo e limites

5. **Busca de Transações da Conta**
   - Testa a rota GET /accounts/:accountId/transactions
   - Verifica se lista o histórico de transações

### Executando os Testes
Para executar os testes:
```bash
npm run test:openfinance
```

### Dados de Teste
Os testes utilizam dados pré-configurados no arquivo `database.json`:
- Cliente: cus_001 (Maria Silva)
- Contas: acc_001 (cartão) e acc_002 (corrente)
- Consentimento: consent_001 (ativo)
- API Key: key_app_management_001

## Observações Importantes
1. Todas as rotas públicas requerem autenticação via API Key
2. O consentimento deve estar ativo e ter as permissões necessárias
3. O consentimento deve pertencer ao cliente cujos dados estão sendo acessados
4. As rotas de gerenciamento de consentimento são isoladas como rotas internas
5. Os testes focam apenas nas operações de leitura (GET) que são públicas