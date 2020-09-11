"use strict";
const logger = require('../logger');
const errorMsg = require('../messages').error;

module.exports = (req, res, next) => {

	req.checkBody('template')
		.trim()
		.isLength({max: 100}).withMessage('Maximum 100 characters allowed.')
		.isLength({min:1}).withMessage("'Company Name' is required.")
        .exists().withMessage("Request was missing the 'companyName' parameter.");
    
    req.checkBody('colorScheme')
        .isLength({max: 100}).withMessage('Maximum 100 characters allowed')
        .isLength({min:1}).withMessage("'Color Schema' is required.")
        .exists().withMessage("Request was missing the 'projectName' parameter.");
    
    req.checkBody('teamMembers')
        .trim()
        .isLength({min:1}).withMessage("'ICO Name' is required")
        .exists().withMessage("Request was missing the 'icoName' parameter");

    req.checkBody('advisors')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'Advisor' is required")
        .exists().withMessage("Request was missing the 'advisor' parameter");
    
    req.checkBody('roadMap')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed")
        .isLength({min:1}).withMessage("'Roadmap' is required")
        .exists().withMessage("Request was missing the 'roadmap' parameter");
        
    req.checkBody('partners')
        .trim()
        .isLength({max:100}).withMessage("Maximum 100 characters allowed");
        
    req.checkBody('slogan')
        .trim()
        .isLength({min:1}).withMessage("'Slogan' is required")
        .validateWords(20).withMessage("20 words maximum is allowed")
        .exists().withMessage("Request was missing the 'slogan' parameter");
    
    req.checkBody('briefProductDescription')
        .trim()
        .validateWords(200).withMessage("200 words maximum is allowed")
        .isLength({min:1}).withMessage("'Product Description' is required")
        .exists().withMessage("Request was missing the 'briefProductDescription' parameter");

    req.checkBody('briefTokenDescription')
        .trim()
        .isLength({min:1}).withMessage("'BriefTokenDescription' is required")
        .exists().withMessage("Request was missing the 'briefTokenDescription' parameter");
        
    req.checkBody('oneLineTokenDescription')
        .trim()
        .validateWords(20).withMessage("20 words maximum is allowed")
        .isLength({min:1}).withMessage("'One Line Token Description' is required")
        .exists().withMessage("Request was missing the 'oneLineTokenDescription' parameter");

    req.checkBody('keyFeatures')
        .trim()
        .validateWords(20).withMessage("20 words maximum is allowed")
        .isLength({min:1}).withMessage("'keyFeatures' is required")
        .exists().withMessage("Request was missing the 'keyFeatures' parameter");

    req.checkBody('keyFeature1')
        .trim()
        .validateWords(10).withMessage("10 words maximum is allowed")
    
    req.checkBody('keyFeature2')
        .trim()
        .validateWords(10).withMessage("10 words maximum is allowed")

    req.checkBody('keyFeature3')
        .trim()
        .validateWords(10).withMessage("10 words maximum is allowed")
    
    req.checkBody('keyFeature4')
        .trim()
        .validateWords(10).withMessage("10 words maximum is allowed")
    
    req.checkBody('icoWebsiteDomain')
        .trim()
        .isLength({max:100}).withMessage("maximum 100 characters is allowed")

    req.checkBody('totalSupply')
        .trim()
        .isNumeric().withMessage("'Total Supply' must be number and no decimal")
        .isLength({min: 1}).withMessage("'Total Supply' is required")
        .exists().withMessage("Request is missing 'totalSupply'")

    req.checkBody('symbol')
        .trim()
        .isLength({max:5}).withMessage("Maximum 5 characters allowed")
        .isLength({min: 1}).withMessage("'Total Supply' is required")
        

        req.checkBody('totalSale')
        .trim()
        .isNumeric().withMessage("'Total Sale' must be number and no decimal")
        .isLength({min: 1}).withMessage("'Total Sale' is required")
        .exists().withMessage("Request is missing 'totalSale'")
    
    
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