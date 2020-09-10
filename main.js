"use strict";
const express = require('express');
const https = require("https");
const fs = require("fs");
const path = require("path");
const flash = require('connect-flash');
const morgan = require('morgan');
const validator = require('express-validator');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

// load env configurations
require('dotenv').config();

// load config files
const db = require('./config/db');
const ses = require('./config/ses');
const redis = require('./config/redis');
const passport = require('./config/passport');

// load lib files
const logger = require('./lib/logger');
const customValidations = require('./lib/validation/custom-validation');

const app = express();

// check connections
db.mongo_conn.once('open', () => { logger.info('connected to mongodb') });
redis.on('connect', () => { logger.info('connected to redis') })

// check for connection errors
db.mongo_conn.on('error', (err) => { logger.error('mongodb connection error', err) });
redis.on('error', (err) => { logger.error('redis connection error', err) });

app.use(morgan('dev'));
app.use(cookieParser());
app.use(fileUpload());
app.use(validator());
app.use(validator({ customValidators: customValidations }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(flash());
app.use(passport.initialize());

const userRoutes = require('./routes/user');
const icoRoutes = require('./routes/ico');
const adminRoutes = require('./routes/admin');

app.use('/api/user', userRoutes);
app.use('/api/ico', icoRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        status_code: 404,
        message: 'Not found'
    });
});

const port = process.env.PORT || 3000;
const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}

const server = https.createServer(httpsOptions, app).listen(port, () => {
    logger.info('server running on port', port)
});