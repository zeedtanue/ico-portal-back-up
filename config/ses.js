"use strict";
const nodemailer = require('nodemailer');

const transporterSES = nodemailer.createTransport({
    service : process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD
    }

});

module.exports = transporterSES;
