const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./dbManager');
require('dotenv').config();

class UserManager {

    async init() {
        try {
            // Create tables if necessary
            await db.run(`
                CREATE TABLE IF NOT EXISTS user (
                    username VARCHAR(50) PRIMARY KEY,
                    password TEXT,
                    name VARCHAR(50)
                );
            `);
            // TO BE REMOVED:
            UserManager.register('admin', 'Adminadmin123.', 'Admin');
        } catch (err) {
            console.error('Init of UserManager failed:', err);
            throw err;
        }
    }

    static async authenticate(username, password) {
        try {
            const user = await db.get('SELECT * FROM user WHERE username = ?', [username]);
            if (!user)
                return null; // User not found
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                console.log(`User ${username} logged in.`);
                return { username: user.username, name: user.name }; // return only safe fields
            }
            return null;
        } catch (err) {
            console.error('Authentication error:', err);
            throw new Error('Error accessing user database');
        }
    }

    static async register(username, password, name) {
        const hash = await bcrypt.hash(password, 10);
        try {
            await db.run(`
                INSERT OR IGNORE INTO user (username, password, name)
                VALUES (?, ?, ?)
                `, [username, hash, name])
        } catch (err) {
            console.error(err);
            throw new Error('Unable to store user details');
        }
    }
           

    static getToken(user) {
        return jwt.sign(
            { username: user.username, name: user.name },
            process.env.TOKEN_KEY,
            { expiresIn: '1h' }
        );
    }

    static authenticateToken(req, res, next) {
        const authHeader = req.get('Authorization');
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
}

const userInstance = new UserManager();

(async () => {
    await userInstance.init();
})();

module.exports = {
    userInstance,
    UserManager
};