"use strict";
const fs = require('fs');
const path = require('path');
const sesMailer = require('../config/ses');
const stringHelper = require('./string');
const logger = require('./logger');

const send = (to, subject, template, data) => {

    return new Promise((resolve, reject) => {

        const template_dir = __dirname+'/../static/email_templates/';

        fs.readFile(path.resolve(template_dir + template), (err, txt) => {
            if(err){
                logger.error(err);
                return reject(err);
            } 

            let body = txt.toString('utf8');
            
            const content = stringHelper.replace_text(body, data);

            const options = {
                from    : process.env.DEFAULT_FROM_EMAIL,
                to      : to,
                subject : subject,
                html    : content
            }

            sesMailer.sendMail(options, function(err, info) {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                resolve(info);
            });
        });
    });
}

module.exports = {
    send
}