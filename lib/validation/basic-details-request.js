"use strict";
const logger = require('../logger');
const errorMsg = require('../messages').error;

module.exports = (req, res, next) => {

    req.checkBody('first_name')
		.trim()
		.isLength({max: 250}).withMessage('Maximum 250 characters allowed.')
		.isLength({min:1}).withMessage("'First Name' is required.")
        .exists().withMessage("Request was missing the 'first_name' parameter.");

    req.checkBody('last_name')
		.trim()
		.isLength({max: 250}).withMessage('Maximum 250 characters allowed.')
		.isLength({min:1}).withMessage("'Last Name' is required.")
        .exists().withMessage("Request was missing the 'last_name' parameter.");
    
}