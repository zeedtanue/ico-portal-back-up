"use strict";
const express = require('express');
const router = express.Router();
const passport = require('passport');
const adminController = require('../controllers/admin');

// load middlewares
const jwtAdmin = passport.authenticate('jwt-admin');


router.get('/dashboard', jwtAdmin, adminController.loadIcoList);
router.get('/ico/:id', jwtAdmin, adminController.getIcoDetails);
router.post('/ico/:id', jwtAdmin, adminController.changeFormStatus);
router.post('/ico/sdForm/:id', jwtAdmin, adminController.editSDForm);
router.post('/ico/rgForm/:id', jwtAdmin, adminController.editRGForm);
router.post('/ico/upload/:id', jwtAdmin, adminController.uploadFiles);

router.get('/items', jwtAdmin, adminController.getAllItems);
router.post('/items/add', jwtAdmin, adminController.addItems);
router.post('/items/modifyPrice/:name', jwtAdmin, adminController.modifyItemPrice);
router.post('/items/remove/:name', jwtAdmin, adminController.removeItem);

router.post('/removeUser', jwtAdmin, adminController.removeUser);
router.post('/tokenStandard/add', jwtAdmin, adminController.addTokenStandard);
router.post('/tokenStandard/remove/:name', jwtAdmin, adminController.removeTokenStandard);

module.exports = router;