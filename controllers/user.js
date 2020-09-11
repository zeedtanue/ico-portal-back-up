"use strict";
const passport = require('passport');
const logger = require('../lib/logger');
const Handler = require('../lib/handler');
const tokenHelper = require('../lib/token');
const mailer = require('../lib/mailer');
const redis = require('../config/redis');
const errorMsg = require('../lib/messages').error;
const successMsg = require('../lib/messages').success;
const User = require('../models/user');
const Verification = require('../models/verification');

//Make sure HOST variable in .env file is in the form similar to 'https://localhost:3000' 
//without extra characters, or invalid routes will be produced
const userPath = process.env.HOST+'/api/user';

exports.load_login = async(req, res) => {

    res.send("Load Login");
}

exports.process_login = async(req, res) => {

    passport.authenticate('local', (err, user, message) => {

        if (err) {
            logger.error(err);
            return res.status(500).json(message);
        }

        try {

            if (!user) return res.status(401).json(message);

            const token = tokenHelper.genAccessToken(user);
            redis.set(user.id, token, 'EX', 850000);

            return res.json({ token });

        } catch (err) {
            logger.error(err);
            return res.status(500).json(errorMsg.internal);
        }

    })(req, res);
}


exports.process_facebook_callback = async(req, res) => {

    try {

        if (!req.user) return res.send(401).json(errorMsg.login_failed);

        const token = tokenHelper.genAccessToken(req.user);
        redis.set(req.user.id, token, 'EX', process.env.ACCESS_TOKEN_EXPIRY);

        return res.json({ token });

    } catch (err) {
        logger.error(err);
        return res.status(500).json(errorMsg.internal);
    }
}


exports.process_google_callback = async(req, res) => {

    try {
        

        if (!req.user) return res.status(401).json(errorMsg.login_failed);

        const token = tokenHelper.genAccessToken(req.user);
        redis.set(req.user.id, token, 'EX', process.env.ACCESS_TOKEN_EXPIRY);

        return res.json({ token });

    } catch (err) {
        logger.error(err);
        return res.status(500).json(errorMsg.internal);
    }
}


exports.logout = async(req, res) => {

    req.logout();
    res.redirect(userPath + '/login');
}


exports.process_signup = async(req, res) => {

    try {

        const { err: error, data: user } = await Handler(User.findOne({ email: req.body.email }));
        if (error) return res.status(500).json(errorMsg.internal);
        else if (user) return res.status(400).json(errorMsg.email_already_registered);

        const user_data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            is_verified: false,
            gateway: 'local',
            role: 'user'
        };

        const { err: error1, data: new_user } = await Handler(User.create(user_data));
        if (error1 || !new_user) return res.status(500).json(errorMsg.internal);

        const verf_token = tokenHelper.genVerificationToken();
        const where = { 'email': new_user.email };
        const verf_token_data = {
            email: new_user.email,
            token: verf_token
        }
        const options = { upsert: true, new: true }
        const { err: error2, data: status } = await Handler(Verification.findOneAndUpdate(where, verf_token_data, options));
        if (error2 || !status) return res.status(500).json(errorMsg.internal);

        const [to, subject, template ]= [new_user.email, "Email address verification",  "verification.html" ];
        const ps_link = `${process.env.HOST}/api/user/verify?token=${verf_token}`;
        const data = { ps_link, ps_text: 'Activate account' };
        const { err: err } = await Handler(mailer.send(to, subject, template, data));
        if (err) return res.status(500).json(errorMsg.internal);

        return res.json(successMsg.user_registered);

    } catch (err) {
        logger.error(err);
        res.status(500).json(errorMsg.internal);
    }
}


exports.verification_failed = function (req,res) {

    return res.send("Invalid or Used Verification Link");
}

exports.verify_email = async(req, res) => {

    try {

        const token = req.query.token;
        if (!token) return res.redirect(userPath + '/verification_failed');

        const { err: t_err, data: token_data } = await Handler(Verification.findOne({ token }));
        if (t_err || !token_data) return res.redirect(userPath + '/verification_failed');

        const options = { is_verified: true };
        const { err: u_err } = await Handler(User.update({ email: token_data.email }, options));
        if (u_err) return res.redirect(userPath + '/verification_failed');

        res.redirect(userPath + '/login');

    } catch (err) {
        logger.error(err);
        return res.status(500).json(errorMsg.internal);
    }
}


exports.resend_verify_email = async(req, res) => {

    try {

        if (!req.body.email) return res.send(errorMsg.invalid_request);

        const { err: u_err, data: user } = await Handler(User.findOne({ email: req.body.email }));
        if (u_err) return res.status(500).json(errorMsg.internal);
        else if (!user) return res.status(400).json(errorMsg.user_not_found);
        else if (user.is_verified) return res.status(400).json(errorMsg.email_already_verified);

        const { err: v_err, data: token_data } = await Handler(Verification.findOne({ email: user.email }));
        if (v_err) return res.status(500).json(errorMsg.internal);

        const to = user.email;
        const subject = 'Email address verification';
        const template = 'verification.html';
        let ps_link = '';

        if (token_data) {

            ps_link = process.env.HOST + '/api/user/verify?token=' + token_data.token;

        } else {

            const verf_token = tokenHelper.genVerificationToken();
            const verf_token_data = {
                email: user.email,
                token: verf_token
            }
            const { err: t_err, data: new_token } = await Handler(Verification.create(verf_token_data));
            if (t_err || !new_token) return res.status(500).json(errorMsg.internal);

            ps_link = process.env.HOST + '/api/user/verify?token=' + verf_token;
        }

        const data = { ps_link, ps_text: 'Activate account' };

        const { err: m_err } = await Handler(mailer.send(to, subject, template, data));
        if (m_err) return res.status(500).json(errorMsg.internal);

        return res.json(successMsg.verf_email_re_sent);

    } catch (err) {
        logger.error(err);
        return res.status(500).json(errorMsg.internal);
    }
}

