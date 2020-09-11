var aws = require('aws-sdk');
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport'); 
require('dotenv').config({path : '../'});
var transporterSES = nodemailer.createTransport( ses({
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
}));


function sendSES(to, subject, body) {
    var mailOptions = {
        from: process.env.DEFAULT_FROM_EMAIL,
        to: to,
        subject: subject,
        html: body
    };
    
    return new Promise((ok, fail) => {
        transporterSES.sendMail(mailOptions, function(error, info) {
            if (error) {
                return fail(error);
            }
            return ok();
        });
    });
}

module.exports = {sendSES : sendSES};
