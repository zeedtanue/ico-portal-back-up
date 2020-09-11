"use strict";
const errorMsg = require('../messages').error;

const check_email_verification = (req, res, next) => {

    if (req.user && req.user.gateway === 'local' && req.user.is_verified) {
        return next();
    }

    return res.status(401).json(errorMsg.email_not_verified);
}

module.exports = check_email_verification;