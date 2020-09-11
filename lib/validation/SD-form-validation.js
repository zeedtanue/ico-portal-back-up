"use strict";
const logger = require('../logger');
const errorMsg = require('../messages').error;





module.exports = (req, res, next) => {

	req.checkBody('companyName')
        .trim()
        .validateWords(3).withMessage("VO")
		.isLength({max: 100}).withMessage('Maximum 100 characters allowed.')
		.isLength({min:1}).withMessage("'Company Name' is required.")
        .exists().withMessage("Request was missing the 'companyName' parameter.");
    
    req.checkBody('projectName')
        .trim()
        .isLength({max: 100}).withMessage('Maximum 100 characters allowed')
        .isLength({min:1}).withMessage("'Project Name' is required.")
        .exists().withMessage("Request was missing the 'projectName' parameter.");
    
    req.checkBody('icoName')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'ICO Name' is required")
        .exists().withMessage("Request was missing the 'icoName' parameter");

    req.checkBody('tokenName')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'Token Name' is required")
        .exists().withMessage("Request was missing the 'tokenName' parameter");
    
    req.checkBody('firstName')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'First Name' is required")
        .exists().withMessage("Request was missing the 'firstName' parameter");
        
    req.checkBody('lastName')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'Last Name' is required")
        .exists().withMessage("Request was missing the 'lastName' parameter");
        
        
    req.checkBody('corrEmail')
		.trim()
		.isLength({max: 100}).withMessage('Maximum 100 characters allowed.')
        .isEmail().withMessage('Please enter a valid email.')
		.isLength({min:1}).withMessage("'Email' is required.")
        .exists().withMessage("Request was missing the 'corrEmail' parameter.");

    req.checkBody('corrPhone')
        .trim()
        .isLength({max:15}).withMessage("Maximum 15 character allowed")
        .isNumeric().withMessage("Phone Number must be in numeric ")
        .isLength({min:1}).withMessage("'Corrporate Phone' number is required")
        .exists().withMessage("Request was missing the 'corrPhone' parameter");

    req.checkBody('resAddress1')
        .trim()
        .isLength({max:150}).withMessage("Maximum 150 characters allowed")
        .isLength({min:1}).withMessage("Please enter your Unit number, Appartment Name at Line 1")
        .exists().withMessage("Request was missing the 'resAddress1' parameter");

    req.checkBody('resAddress2')
        .trim()
        .isLength({max:150}).withMessage("Maximum 150 characters allowed")
    
    req.checkBody('resState')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'State name' is required")
        .exists().withMessage("Request was missing the 'resState' parameter");

    req.checkBody('resCountry')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'Country' is required")
        .exists().withMessage("Request was missing the 'resCountry' parameter");

    req.checkBody('resCity')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'City' is required")
        .exists().withMessage("Request was missing the 'resCity' parameter");
    
    req.checkBody('resZip')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'Zip Code' is required")
        .isNumeric().withMessage("Zip code must be numeric")
        .exists().withMessage("Request was missing the'resZip' parameter");
    
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