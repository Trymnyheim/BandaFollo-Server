const sqlite3 = require('sqlite3');
const path = require('path');
const { promisify } = require('util');

class DBManager {
    
    constructor(dbPath = './db/db.sqlite') {
        this.db = new sqlite3.Database(path.resolve(dbPath), (err) => {
            if (err) {
                console.error('Failed to connect to DB:', err.message);
            } else {
                console.log('Connected to DB:', dbPath);
            }
        });
        
        this.runAsync = promisify(this.db.run.bind(this.db));
        this.getAsync = promisify(this.db.get.bind(this.db));
        this.allAsync = promisify(this.db.all.bind(this.db));
        this.execAsync = promisify(this.db.exec.bind(this.db));
        
        DBManager.instance = this;
    }

    async run(sql, params = []) {
        return this.runAsync(sql, params);
    }

    async get(sql, params = []) {
        return this.getAsync(sql, params);
    }

    async all(sql, params = []) {
        return this.allAsync(sql, params);
    }

    async exec(sql) {
        return this.execAsync(sql);
    }

    close() {
        this.db.close((err) => {
            if (err) console.error('Error closing DB:', err.message);
            else console.log('DB connection closed.');
        });
    }
}

module.exports = new DBManager(); // singleton