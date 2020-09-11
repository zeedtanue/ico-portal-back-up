"use strict";
const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/user');

// load middlewares
const jwtAuth = passport.authenticate('jwt');
const facebookAuth = passport.authenticate('facebook');
const googleAuth = passport.authenticate('google');
const loginValidation = require('../lib/validation/login-request')
const signupValidation = require('../lib/validation/signup-request');

router.get('/login', userController.load_login);
router.post('/login', loginValidation, userController.process_login);
router.get('/auth/facebook', facebookAuth);
router.get('/auth/facebook/callback', facebookAuth,userController.process_facebook_callback);
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuth, userController.process_google_callback);
router.get('/logout', userController.logout);

router.post('/signup', signupValidation, userController.process_signup);
router.get('/verify', userController.verify_email);
router.post('/resend', userController.resend_verify_email);
router.get('/verification_failed', userController.verification_failed);

module.exports = router;
