require('dotenv').config();
const express = require('express');
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const { UserManager } = require('../db/UserManager'); 

userRouter.post('/login', async (req, res) => {
    try {
        const user = await UserManager.authenticate(req.body.username, req.body.password);
        if (!user) {
            return res.status(401).json({error: 'Invalid login credentials.'});
        }
        const accessToken = UserManager.getToken(user)
        res.json({user, accessToken })
        console.log(`Logged in: ${user.name}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err.message});
    }

    
})

userRouter.get('/validate', UserManager.authenticateToken, async (req, res) => {
    try {
        const { username, name } = req.user;
        res.json({ username, name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = userRouter;