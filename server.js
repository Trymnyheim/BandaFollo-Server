const express = require('express');
const cors = require('cors');
const path = require('path')
const app = express();
const port = 3001;
const host = '0.0.0.0';
const dbManager = require('./db/dbManager');

const allowedOrigins = ['https://bandafollo.no', 'http://localhost:5173'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by server'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.send('<p>Server for Banda Follo\'s website. <a href="https://www.bandafollo.no">Click here<a> to visit.<p>')
})

const userRouter = require('./routes/userRouter');
app.use('/user', userRouter);

const emailRouter = require('./routes/emailRouter')
app.use('/email', emailRouter);

const holidayRouter = require('./routes/holidayRouter');
app.use('/holiday', holidayRouter);

const commercialRouter = require('./routes/commercialRouter');
app.use('/commercial', commercialRouter);

app.use('/uploads/commercial', express.static(path.join(__dirname, 'uploads/commercial')));

const server = app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
})

const setupShutdownHooks = require('./utils/shutdown');
setupShutdownHooks({ db: dbManager, server });

// Printing the amount of page loads:
const logger = require('./db/Logger');
setTimeout(async () => {
    const loadCount = await logger.getLoads();
    console.log('\n' + loadCount);
}, 1000);
