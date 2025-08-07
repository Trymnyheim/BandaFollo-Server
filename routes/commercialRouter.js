const express = require('express');
const path = require('path');
const multer = require('multer');
const commercialRouter = express.Router();
const CommercialManager = require('../db/CommercialManager.js');
const { UserManager } = require('../db/UserManager');

const storage = multer.diskStorage({
    destination: 'uploads/commercial/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

commercialRouter.get('/get_commercials', async (req, res) => {
    try {
        const data = await CommercialManager.getCommercials();
        res.json({ commercials: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Something went wrong retrieving commercial data.'});
    }
})

commercialRouter.post('/add_commercial', UserManager.authenticateToken,
    upload.single('image'), async (req, res) => {
        const { title, text, disclaimer } = req.body;
        const image = req.file?.filename;
        try {
            console.log({title, text, disclaimer, image})
            await CommercialManager.addCommercial({title, text, disclaimer, image});
            res.json({success: true});
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to upload commercial.' });
        }
    }
)

commercialRouter.post('/remove_commercial', UserManager.authenticateToken, 
    async (req, res) => {
        const { title } = req.body;
        if (!title) 
            return res.status(400).json({ error: 'Missing title' });
        try {
            await CommercialManager.removeCommercial(title);
            res.json({success: true});
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to remove commercial.' });
        }
    }
)

module.exports = commercialRouter; 