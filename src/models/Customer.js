const BaseModel = require("./base.model");
const { validateCPF, validateEmail } = require("../utils/validators");

class Customer extends BaseModel {
    constructor() {
        super("customers");
    }

    async validate(data) {
        const errors = [];

        // Required fields
        if (!data.name) errors.push("Nome é obrigatório");
        if (!data.cpf) errors.push("CPF é obrigatório");
        if (!data.email) errors.push("Email é obrigatório");

        // Format validations
        if (data.cpf && !validateCPF(data.cpf)) {
            errors.push("CPF inválido");
        }

        if (data.email && !validateEmail(data.email)) {
            errors.push("Email inválido");
        }

        // Business rules
        if (data.cpf) {
            const existingCustomer = await this.findByCPF(data.cpf);
            if (existingCustomer && existingCustomer._id !== data._id) {
                errors.push("CPF já cadastrado");
            }
        }

        return errors;
    }

    async findByCPF(cpf) {
        const customers = await this.getAll();
        return customers.find((customer) => customer.cpf === cpf);
    }

    async create(data) {
        const errors = await this.validate(data);
        if (errors.length > 0) {
            throw new Error(errors.join("; "));
        }

        const customer = {
            ...data,
            accounts: [],
        };

        return super.create(customer);
    }

    async update(id, data) {
        const errors = await this.validate({ ...data, _id: id });
        if (errors.length > 0) {
            throw new Error(errors.join("; "));
        }

        return super.update(id, data);
    }

    async getAccounts(customerId) {
        const customer = await this.getById(customerId);
        if (!customer) {
            throw new Error("Cliente não encontrado");
        }

        const accountModel = new (require("./Account"))();
        const accounts = [];

        for (const accountId of customer.accounts) {
            const account = await accountModel.getById(accountId);
            if (account) {
                accounts.push(account);
            }
        }

        return accounts;
    }
}

module.exports = Customer;
