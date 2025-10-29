const fs = require("fs");
const path = require("path");
const config = require("../config/config");

class BaseModel {
    constructor(collection) {
        this.collection = collection;
        this.dbPath = path.join(process.cwd(), config.database.path);
    }

    _readDatabase() {
        return JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
    }

    _writeDatabase(data) {
        fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    }

    _generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    }

    getAll() {
        const db = this._readDatabase();
        return db[this.collection] || [];
    }

    getById(id) {
        const items = this.getAll();
        return items.find((item) => item._id === id);
    }

    create(data) {
        const db = this._readDatabase();
        const items = db[this.collection] || [];

        const newItem = {
            ...data,
            _id: this._generateId(this.collection.slice(0, 3)),
        };

        items.push(newItem);
        db[this.collection] = items;

        this._writeDatabase(db);
        return newItem;
    }

    update(id, data) {
        const db = this._readDatabase();
        const items = db[this.collection] || [];

        const index = items.findIndex((item) => item._id === id);
        if (index === -1) return null;

        const updatedItem = { ...items[index], ...data };
        items[index] = updatedItem;

        db[this.collection] = items;
        this._writeDatabase(db);

        return updatedItem;
    }

    delete(id) {
        const db = this._readDatabase();
        const items = db[this.collection] || [];

        const index = items.findIndex((item) => item._id === id);
        if (index === -1) return false;

        items.splice(index, 1);
        db[this.collection] = items;

        this._writeDatabase(db);
        return true;
    }
}

module.exports = BaseModel;
