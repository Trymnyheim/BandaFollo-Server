const db = require('./dbManager');
const fs = require('fs');
const path = require('path');

class CommercialManager {

    async init() {
        try {
            // Create tables if necessary
            await db.run(`
                CREATE TABLE IF NOT EXISTS commercial (
                    title VARCHAR(255) PRIMARY KEY,
                    text TEXT,
                    disclaimer TEXT,
                    image VARCHAR(255)
                );
            `);
        } catch (err) {
            console.error('Init of Commercial failed:', err);
            throw err;
        }
    }

    async getCommercials() {
        try {
            return await db.all('SELECT * FROM commercial');
        } catch (err) {
            throw new Error('Unable to retrieve commercial data');
        }
    }

    async addCommercial({ title, text, disclaimer, image }) {
        try {
            // Check if title already exists:
            const existing = await db.get('SELECT title FROM commercial WHERE title = ?', [title]);
            if (existing) {
                if (image) {
                    await this.deleteImage(image); // Remove freshly uploaded image
                }
                throw new Error(`Commercial with title "${title}" already exists.`);
            }

            await db.run(`
                INSERT INTO commercial (title, text, disclaimer, image)
                VALUES (?, ?, ?, ?)
            `, [title, text, disclaimer, image]);

        } catch (err) {
            console.error(err);
            throw new Error('Unable to store commercial data');
        }
    }

    async removeCommercial(title) {
        try {
            const commercial = await db.get(
                'SELECT image FROM commercial WHERE title = ?', [title]);
            await db.run('DELETE FROM commercial WHERE title = ?', [title]);

            // Delete image:
            if (commercial?.image)
                await this.deleteImage(commercial.image);
        } catch (err) {
            throw new Error(`Unable to remove commercial "${title}"`)
        }
    }

    async deleteImage(image) {
        const filePath = path.join(__dirname, '../uploads/commercial', image);
        try {
            await fs.promises.unlink(filePath);
        } catch (err) {
            console.warn(`Failed to delete unused image: ${filePath}`, err.message);
        }
    }
}

const commercialInstance = new CommercialManager();

(async () => {
    await commercialInstance.init();
})();

module.exports = commercialInstance;
