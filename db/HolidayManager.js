const db = require('./dbManager');

class HolidayManager {

    constructor() {
        this.ALLOWED_HOLIDAYS = ["", 'summer', 'christmas', 'easter'];

    }

    async init() {
        try {
            // Create tables if necessary
            await db.exec(`
                CREATE TABLE IF NOT EXISTS holiday (
                    holiday TEXT PRIMARY KEY,
                    is_active BOOLEAN NOT NULL CHECK (is_active IN (0, 1))
                );
                INSERT OR IGNORE INTO holiday (holiday, is_active) VALUES 
                    ('summer', 0),
                    ('christmas', 0),
                    ('easter', 0);
            `);
            await db.exec(`
                CREATE TABLE IF NOT EXISTS hours (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    holiday TEXT NOT NULL,
                    day TEXT NOT NULL,
                    time TEXT NOT NULL,
                    FOREIGN KEY (holiday) REFERENCES holiday(holiday) ON DELETE CASCADE ON UPDATE CASCADE
                );
            `);
        } catch (err) {
            console.error('Init of Holiday failed:', err);
            throw err;
        }
    }

    // Get active holiday and hours
    async getHoliday() {
        try {
            const activeHoliday = await db.get('SELECT holiday FROM holiday WHERE is_active = 1');
            if (!activeHoliday) {
                return { holiday: null, hours: {} };
            }

            const hours = await this.getHours(activeHoliday.holiday);
            return {
                holiday: activeHoliday.holiday,
                hours: {
                    [activeHoliday.holiday]: hours
                }
            };
        } catch (err) {
            throw new Error(`Unable to retrieve holiday data\n${err}`);
        }
    }

    // Get all holidays + their hours (admin)
    async getHolidays() {
        try {
            const holidays = await db.all('SELECT holiday, is_active FROM holiday');
            const hours = {};
            for (const { holiday } of holidays) {
                hours[holiday] = await this.getHours(holiday);
            }

            return {
                holidays,
                hours
            };
        } catch (err) {
            throw new Error(`Unable to retrieve holiday data\n${err}`);
        }
    }

    // Get hours for one holiday
    async getHours(holiday) {
        if (!this.isAllowed(holiday)) {
            throw new Error(`Invalid holiday name: ${holiday}`);
        }

        try {
            return await db.all('SELECT day, time FROM hours WHERE holiday = ?', [holiday]);
        } catch (err) {
            throw new Error(`Unable to retrieve hours for ${holiday}:\n${err}`);
        }
    }

    // Set active holiday (admin)
    async setActiveHoliday(holiday) {
        if (!this.isAllowed(holiday)) {
            throw new Error(`Invalid holiday: ${holiday}`);
        }

        try {
            await db.run('BEGIN TRANSACTION');
            await db.run('UPDATE holiday SET is_active = 0'); // Sets all to inactive
            if (holiday)
                await db.run('UPDATE holiday SET is_active = 1 WHERE holiday = ?', [holiday]);
            await db.run('COMMIT');
        } catch (err) {
            await db.run('ROLLBACK');
            throw new Error(`Failed to set active holiday\n${err}`);
        }
    }

    // Replace all hours for holidays
    async setHours(hours) {
        const holidays = Object.keys(hours);

        for (const holiday of holidays) {
            if (!this.isAllowed(holiday)) {
                throw new Error(`Invalid holiday: ${holiday}`);
            }
        }

        try {
            await db.run('BEGIN TRANSACTION');
            for (const holiday of holidays) {
                await db.run('DELETE FROM hours WHERE holiday = ?', [holiday]);

                const entries = hours[holiday];
                for (const { day, time } of entries) {
                    await db.run(
                        'INSERT INTO hours (holiday, day, time) VALUES (?, ?, ?)',
                        [holiday, day, time]
                    );
                }
            }
            await db.run('COMMIT');
        } catch (err) {
            await db.run('ROLLBACK');
            throw new Error(`Failed to set hours\n${err}`);
        }
    }


    isAllowed(holiday) {
        if (this.ALLOWED_HOLIDAYS.includes(holiday))
            return true;
        return false;
    }
}




const holidayInstance = new HolidayManager();

(async () => {
    await holidayInstance.init();
})();

module.exports = holidayInstance;
