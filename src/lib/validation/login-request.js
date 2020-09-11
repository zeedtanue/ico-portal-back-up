"use strict";
const logger = require('../logger');
const errorMsg = require('../messages').error;

module.exports = (req, res, next) => {

    req.checkBody('email')
		.trim()
		.isLength({min:1}).withMessage("'Email' is required.")
        .exists().withMessage("Request was missing the 'email' parameter.");

    req.checkBody('password')
		.trim()
		.isLength({min:1}).withMessage("'Password' is required.")
        .exists().withMessage("Request was missing the 'password' parameter.");

    try{
        
        req.asyncValidationErrors().then(() => {

    		next();

    	}).catch(errors => {

    		const param_errors = {}

    		errors.forEach(error => {
    			param_errors[error.param] = error.msg;
    		});

    		const response = Object.assign({}, errorMsg.login_failed);
    		response['errors'] = param_errors;

    		res.status(400).send(response);
    	});

    }catch(err){
        logger.error(err);
        res.status(500).json(errorMsg.internal);
    }
}