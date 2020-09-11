"use strict";
const express = require('express');
const router = express.Router();
const passport = require('passport');
const icoController = require('../controllers/ico');

// load middlewares
const jwtAuth = passport.authenticate('jwt');
const emailVerfCheck = require('../lib/middleware/email-verification-check');
const SDFormValidation = require('../lib/validation/SD-form-validation');
const RGFormValidation = require('../lib/validation/RG-form-validation');
const fileValidation = require('../lib/validation/custom-validation');

// const path = process.env.ICO_USER_PATH || '/user/ico';

router.get('/dashboard', [jwtAuth, emailVerfCheck], icoController.loadIcoList);
router.get('/new', [jwtAuth, emailVerfCheck], icoController.createNewIco);
router.post('/new/:id', [jwtAuth, emailVerfCheck, SDFormValidation], icoController.saveSDForm);
router.post('/requirementGathering/:id', [jwtAuth, emailVerfCheck, RGFormValidation], icoController.saveRGForm);
router.get('/:id', [jwtAuth, emailVerfCheck], icoController.getIcoDetails);
router.post('/:id', [jwtAuth, emailVerfCheck], icoController.submitIcoDetails);
router.post('/upload/:id', [jwtAuth, fileValidation.limitFileType], icoController.uploadFiles);
//---Unnecessary route---
// router.post('/removeUpload/:id', jwtAuth, icoController.removeFiles);

module.exports = router;