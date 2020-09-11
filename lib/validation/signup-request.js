"use strict";
const logger = require('../logger');
const errorMsg = require('../messages').error;

module.exports = (req, res, next) => {

	req.checkBody('name')
		.trim()
		.isLength({max: 100}).withMessage('Maximum 100 characters allowed.')
		.isLength({min:1}).withMessage("'Name' is required.")
        .exists().withMessage("Request was missing the 'name' parameter.");

    req.checkBody('email')
		.trim()
		.isLength({max: 100}).withMessage('Maximum 150 characters allowed.')
        .isEmail().withMessage('Please enter a valid email.')
		.isLength({min:1}).withMessage("'Email' is required.")
        .exists().withMessage("Request was missing the 'email' parameter.");

    req.checkBody('password')
		.trim()
		.isLength({min:6}).withMessage("'Password' must be at least 6 characters long.")
        .exists().withMessage("Request was missing the 'password' parameter.");

    try{

    	req.asyncValidationErrors().then(() => {

    		next();

    	}).catch(errors => {

    		const param_errors = {}

    		errors.forEach(error => {
    			param_errors[error.param] = error.msg;
    		});

    		const response = Object.assign({}, errorMsg.validation_failed);
    		response['errors'] = param_errors;

    		res.status(400).send(response);
    	});

    }catch(err){
    	logger.error(err);
    	res.status(500).json(errorMsg.internal);
    }
}