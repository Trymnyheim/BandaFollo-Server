const db = require('./dbManager');

class Logger {

    async init() {
        try {
            await db.run(`
                CREATE TABLE IF NOT EXISTS log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entity VARCHAR(50),
                    message TEXT,
                    time DATETIME,
                    success BOOLEAN,
                    user VARCHAR(50)
                );
            `);
        } catch (err) {
            console.error('Init of Logger failed:', err);
            throw err;
        }
    }

    async log(entity, message, success, user) {
        const time = new Date().toISOString();
        try {
            await db.run(`
                INSERT INTO log (entity, message, time, success, user)
                VALUES(?, ?, ?, ?, ?)
            `, [entity, message, time, success, user]);
        } catch (err) {
            console.error('Error storing log-entry:', err);
        }
    }

    async getLogs() {
        try {
            const logs = await db.all('SELECT * FROM log ORDER BY time DESC');
            return logs;
        } catch (err) {
            console.error('Error retrieving logs', err);
            return [];
        }
    }

    async getErrors() {
        try {
            const logs = await db.all('SELECT * FROM log WHERE success = 0 ORDER BY time DESC');
            if (logs.length === 0)
                return 'No errors logged';
            return logs;
        } catch (err) {
            console.error('Error retrieving logs', err);
            return [];
        }
    }

    async getUserLogs(username) {
        try {
            const logs = await db.all('SELECT * FROM log WHERE user = ? ORDER BY time DESC',
                [username]
            );
            return logs;
        } catch (err) {
            console.error('Error retrieving logs', err);
            return [];
        }
    }

    async getLoads() {
        try {
            const row = await db.get(`
                SELECT COUNT(*) AS count
                FROM log
                WHERE entity = "holidayRouter"
                AND message = "Retrieval of holiday-data."
            `);
            return 'Amount of page-loads: ' + row.count;
        } catch (err) {
            console.error('Error counting page-loads', err);
            return 'Unable to count';
        }
    }
}

const loggerInstance = new Logger();

(async () => {
    await loggerInstance.init();
})();

module.exports = loggerInstance;