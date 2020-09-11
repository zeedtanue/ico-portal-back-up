"use strict";
const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');

const generateAccessToken = (user, seconds = process.env.ACCESS_TOKEN_EXPIRY) => {

    return jwt.sign({
        sub: user.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_EXPIRY)
    }, process.env.JWT_SECRET);
}

const generateVerificationToken = () => {

    return uuid();
}

module.exports = {
    genAccessToken: generateAccessToken,
    genVerificationToken: generateVerificationToken
};