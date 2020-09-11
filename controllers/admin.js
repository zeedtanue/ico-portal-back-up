"use strict";
const logger = require('../lib/logger');
const Handler = require('../lib/handler');
const errorMsg = require('../lib/messages').error;
const successMsg = require('../lib/messages').success;
const aws_s3 = require('../lib/aws-s3');
const IcoModel = require('../models/ico');
const AdminModel = require('../models/admin');
const path = require('path');


const User = require('../models/user');


exports.loadIcoList = async(req, res) => {

    try {
        const { err: fetchErr, data: icos } = await Handler(IcoModel.find({}));
        if (fetchErr || !icos) return res.status(500).json(errorMsg.internal);
        return res.json(icos);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.getIcoDetails = async(req, res) => {

    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico || ico.email != req.user.email) return res.status(400).json(errorMsg.ico_not_found);
        return res.status(200).json(ico);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.changeFormStatus = async(req, res) => {

    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico) return res.status(400).json(errorMsg.ico_not_found);
        if (!req.body.changeSDStatus || !req.body.changeRGStatus)
            return res.status(400).json(errorMsg.invalid_request);
        switch (ico.sdStatus) {
            case "Submitted" || "Scope Confirmed" || "Change Request Submitted":
                ico.sdStatus = (req.body.changeSDStatus === "Scope Confirmed") || (req.body.changeSDStatus === "Invoice Sent") ? req.body.changeSDStatus : ico.sdStatus;
                break;
            case "Invoice Sent":
                ico.sdStatus = req.body.changeSDStatus === "Scope Completed" ? req.body.changeSDStatus : ico.sdStatus;
                break;
            case "Scope Completed":
                if (req.body.changeRGStatus) {
                    switch (ico.rgStatus, req.body.changeRGStatus) {
                        case ("Design Requested" || req.body.changeRGStatus) && "Design Completed":
                            if (req.body.protoURL) {
                                ico.rgStatus = "Design Completed";
                                ico.protoURL = req.body.protoURL;
                            } else
                                return res.status(400).json(errorMsg.marvel_link_not_found);
                            break;
                        case "Design Confirmed" && "Second Invoice Sent":
                            ico.rgStatus = "Second Invoice Sent";
                            break;
                        case ("Second Invoice Sent" || req.body.changeRGStatus) && "Development in Progress":
                            if (req.body.testURL) {
                                ico.rgStatus = "Development in Progress";
                                ico.testURL = req.body.testURL;
                            } else
                                return res.status(400).json(errorMsg.test_link_not_found);
                            break;
                        case "Development in Progress" && "Development Completed":
                            ico.rgStatus = "Development Completed";
                            break;
                        case "Development Completed" && "Third Invoice Sent":
                            ico.rgStatus = "Third Invoice Sent";
                            break;
                        case ("Third Invoice Sent" || req.body.changeRGStatus) && "Deployment in Progress":
                            if (req.body.liveURL) {
                                ico.rgStatus = "Deployment in Progress";
                                ico.liveURL = req.body.liveURL;
                            } else
                                return res.status(400).json(errorMsg.link_not_found);
                            break;
                        case "Deployment in Progress" && "ICO Solution Deployed. Final Invoice Sent":
                            ico.rgStatus = "ICO Solution Deployed. Final Invoice Sent";
                            break;
                        case "ICO Solution Deployed. Final Invoice Sent" && "Payment Pending":
                            ico.rgStatus = "Payment Pending";
                            break;
                        case "Payment Pending" && "Closed":
                            ico.rgStatus = "Closed";
                            break;
                        default:
                            return res.json(errorMsg.invalid_request);
                    }
                }
                break;
            default:
                return res.json(errorMsg.invalid_request);
        }

        await Handler(ico.save());
        return res.json(successMsg.ico_status_updated);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.editSDForm = async(req, res) => {

    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico) return res.status(400).json(errorMsg.ico_not_found);

        let elements = ['projectName', 'companyName', 'tokenName', 'firstName',
            'lastName', 'corrEmail', 'corrPhone', 'resAddress1', 'resAddress2',
            'resState', 'resCity', 'resZip', 'resCountry'
        ].filter(element => req.body[element]);

        for (let element of elements)
            ico[element] = req.body[element];


        ico.items = [];
        for (let item of ico.items) {
            if (req.body[item.name]) {
                switch (req.body[item.name]) {
                    case 'uploadRequired':
                        item.uploadRequired = true;
                        break;
                    case 'nouploadRequired':
                        item.uploadRequired = false;
                        break;
                    case 'no': // ico.items = ico.items.filter(item => item.values.length === 0)
                        if (item.values.length === 0) {
                            ico.items.splice(i, 1);
                            i--;
                        }
                        break;
                    case NaN:
                        item.price = parseInt(req.body[item.name]);
                        break;
                    case 'yes' || 'owner' || 'btm':
                        if (item.length === 0) {
                            ico.items.splice(i, 1);
                            i--;
                        }
                        break;
                    default:
                        if (item.values.length !== 0 && Array.isArray(req.body[item.name]))
                            item.values = req.body[item.name];
                }
            }
        }

        ico.customContent = req.body.customContent === 'yes' ? true : false

        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin) return res.status(400).json(errorMsg.fields_not_found);

        admin.items = admin.items.filter(item => req.body[item.name])
        for (let item of admin.items) {
            let newItem = { name: item.name, price: item.price }
            switch (req.body[item.name], item.fieldType) {
                case 'btm' && 'designElem':
                    newItem.uploadRequired = false;
                    break;
                case 'owner' && 'designElem':
                    newItem.uploadRequired = item.uploadRequired;
                    break;
                case 'yes' && ('yes-no' || 'mandatory'):
                    newItem.uploadRequired = item.uploadRequired;
                    break;
            }
            ico.items.push(newItem)
        }

        await Handler(ico.save());
        return res.json(successMsg.sdform_updated);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.editRGForm = async(req, res) => {

    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico) return res.status(400).json(errorMsg.ico_not_found);

        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin) return res.status(400).json(errorMsg.fields_not_found);

        let designElements = ['template', 'colorScheme'].filter(element => req.body[element]);
        for (let element of designElements)
            ico[element] = req.body[element];

        let websiteElements = ['slogan', 'briefProductDescription', 'briefIcoDescription',
            'briefTokenDescription', 'oneLineTokenDescription', 'keyFeatures',
            'keyFeature1', 'keyFeature2', 'keyFeature3', 'keyFeature4'
        ].filter(element => req.body[element]);
        for (let element of websiteElements)
            ico.websiteContent[element] = req.body[element];

        let arrayElements = ['teamMembers', 'advisors', 'roadMap', 'partners']
            .filter(element => req.body[element] && Array.isArray(req.body[element]));
        for (let element of arrayElements)
            ico[element] = req.body[element];

        let tokenElements = ['icoWebsiteDomain', 'totalSupply', 'symbol', 'totalSale']
            .filter(element => req.body[element]);
        for (let element of tokenElements)
            ico.token[element] = req.body[element];

        let tokenStandard = req.body.tokenStandard ? admin.tokens.find(function(obj) { return obj.name === req.body.tokenStandard }) : false;
        if (tokenStandard) {
            ico.token.tokenStandard = tokenStandard.name;
            ico.token.price = tokenStandard.price;
        }

        let tokenBoolElements = ['mintableToken', 'burnableToken', 'refundPolicy']
            .filter(element => req.body[element]);
        for (let element of tokenBoolElements)
            ico.token[element] = req.body[element] === 'yes' ? true : false;

        ico.preIco.needed = req.body.preIcoNeeded == 'yes' ? true : false;
        if (ico.preIco.needed) {
            ico.preIco.startDate = req.body.preIcoStartDate ? new Date(req.body.preIcoStartDate) : undefined;
            ico.preIco.endDate = req.body.preIcoEndDate ? new Date(req.body.preIcoEndDate) : undefined;
            ico.preIco.minContribution = req.body.preIcoMinContribution || undefined;
            ico.preIco.pricing = (req.body.preIcoPricing && Array.isArray(req.body.preIcoPricing) && req.body.preIcoPricing.length != 0) ?
                req.body.preIcoPricing : undefined;
        }

        ico.ico.startDate = req.body.IcoStartDate ? new Date(req.body.IcoStartDate) : undefined;
        ico.ico.endDate = req.body.IcoEndDate ? new Date(req.body.IcoEndDate) : undefined;
        ico.ico.minContribution = req.body.IcoMinContribution || undefined;
        ico.ico.softCap = (ico.token.refundPolicy && req.body.IcoSoftCap) ? req.body.IcoSoftCap : undefined;
        ico.ico.pricing = (req.body.IcoPricing && Array.isArray(req.body.IcoPricing) && req.body.IcoPricing.length != 0) ?
            req.body.IcoPricing : undefined;

        await Handler(ico.save());
        return res.json(successMsg.sdform_updated);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.uploadFiles = async(req, res) => {

    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico || ico.sdStatus != "Scope Completed") return res.status(400).json(errorMsg.ico_not_found);

        for (let item of ico.items) {
            let name = item.name
            if (req.body[name]) {
                item.files.push({
                    filename: null,
                    url: req.body[name]
                })
            } else if (req.files && req.files[name]) {
                const { err: s3SaveErr, data: savedImage } = await Handler(aws_s3.saveImageAndGetURl(req.files[name], ico._id + "_" + name + (path.extname(req.files[name].name)).toLowerCase()))
                if (s3SaveErr) {
                    logger.error(s3SaveErr);
                    return res.status(500).json(errorMsg.internal);
                }

                item.files.push({
                    filename: savedImage.name,
                    url: savedImage.url
                })

                
            }
            await Handler(ico.save());
        }


        return res.json(successMsg.file_uploaded);

        if (ico.sdStatus == "Scope Completed") {
            var i = 0;
            for (i = 0; i < ico.items.length; i++) {
                if (ico.items[i].uploadRequired && req.files[ico.items[i].name] && !Array.isArray(req.files[ico.items[i].name])) {
                    break;
                }
            }
            if (i != ico.items.length) {
                const filename = ico._id + "_" + ico.items[i].name + (path.extname(req.files[ico.items[i].name].name)).toLowerCase();
                const { err: s3SaveErr, data: savedFile } = await Handler(aws_s3.saveImageAndGetURl(req.files[ico.items[i].name], filename))
                if (s3SaveErr) {
                    logger.error(s3SaveErr);
                    return res.status(500).json(errorMsg.internal);
                }
                ico.items[savedFile.i].files.push({ url: savedFile.url, filename: savedFile.name });
                await Handler(ico.save());
                return res.json(successMsg.file_uploaded);
            } else
                return res.status(400).json(errorMsg.invalid_ico_id);
        } else
            return res.status(400).json(errorMsg.invalid_ico_id);

    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.getAllItems = async(req, res) => {

    try {
        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin)
            return res.status(400).json(errorMsg.fields_not_found);
        return res.status(200).json(admin.items);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.addItems = async(req, res) => {
    let request = req.body;
    try {
        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin)
            return res.status(400).json(errorMsg.fields_not_found);
        for (let item of admin.items) {
            if (req.body.name === item.name) {
                return res.json(errorMsg.field_already_exist);
            }
        }
        let [name, label, price, specification] = [request.name, request.label, request.price, request.specification]
        let item = { name, label, price, specification }
        switch (request.inputType) {
            case "upload":
                item.inputType = request.inputType;
                item.uploadRequired = true;
                item.fieldType = "mandatory";
                break;
            case "radio":
                if (request.inputAnswers !== "yes/no" && request.inputAnswers !== 'designElem')
                    return res.status(400).json(errorMsg.invalid_input_type);
                else {
                    item.inputType = request.inputType;
                    item.fieldType = request.inputAnswers;
                    item.uploadRequired = request.inputAnswers === 'designElem' ? true : false;
                }
                break;
            case "checkbox":

                item.fieldType = 'array';
                item.uploadRequired = false;
                if (request.default)
                    item.default = request.default;
                if (request.inputAnswers && Array.isArray(request.inputAnswers) &&
                    request.inputAnswersPrice && Array.isArray(request.inputAnswersPrice) &&
                    request.inputAnswersPrice.length === request.inputAnswers.length) {
                    item.fieldValues = request.inputAnswers.reduce((acc, curr, index) => [...acc, { name: curr, price: inputAnswersPrice[index] }], [])
                        // item.fieldValues = request.inputAnswers.map((val, index) => {
                        //     return { name: val, price: inputAnswersPrice[index] }
                        // });
                } else
                    return res.status(400).json(errorMsg.invalid_input_type);

                break;
            case "textbox":
                item.fieldType = 'textbox';
                item.uploadRequired = false;
                break;
            default:
                return res.status(400).json(errorMsg.invalid_input_type);
        }
        admin.items.push(item);
        await Handler(admin.save());
        return res.json(successMsg.new_item_added);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.modifyItemPrice = async(req, res) => {

    try {
        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin)
            return res.status(400).json(errorMsg.fields_not_found);
        let itemPresent = false;
        for (let item of admin.items) {
            if (item.name === req.params.name) {
                itemPresent = true;
                item.price = req.body.price;
                item.uploadRequired = true;
            }
        }
        if (!itemPresent)
            return res.json(errorMsg.item_not_found);
        await Handler(admin.save());
        return res.json(successMsg.item_price_updated);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.removeItem = async(req, res) => {

    try {
        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin)
            return res.status(400).json(errorMsg.fields_not_found);

        admin.items = admin.items.filter(item => item.name !== req.params.name)

        await Handler(admin.save());
        return res.json(successMsg.item_removed);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.removeUser = async(req, res) => {

    try {

        if (!req.body.email) return res.json(errorMsg.email_not_found_req);

        const {error:delError, data: successData} = await Handler(User.findOneAndDelete({ email: req.body.email }));

        if (delError){

            return res.status(500).json(errorMsg.internal);

        } else if (!successData && !delError){

            return res.json(errorMsg.user_not_found);

        } else {

            return res.json(successMsg.user_removed);

        }

    } catch (error) {

        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.addTokenStandard = async(req, res) => {

    try {
        
        if(!req.body.name || !req.body.price) return res.json(errorMsg.invalid_request); 

        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin)
            return res.status(400).json(errorMsg.fields_not_found);
        for (let token of admin.tokens) {
            if (req.body.name === token.name) {
                return res.json(errorMsg.token_type_already_exist);
            }
        }
        const inInfo = req.body.information ? req.body.information : "";
        admin.tokens.push({
            name: req.body.name,
            information: inInfo,
            price:req.body.price
        });
        await Handler(admin.save());
        return res.json(successMsg.token_type_added);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.removeTokenStandard = async(req, res) => {

    try {

        if(!req.params.name) return res.json(errorMsg.invalid_request);
        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin)
            return res.status(400).json(errorMsg.fields_not_found);

        
        
        for (let token of admin.tokens){

            const tokenIndex = admin.tokens.indexOf(token)

            if(token.name === req.params.name){

                admin.tokens.splice(tokenIndex, 1);
                await Handler(admin.save());
                return res.json(successMsg.token_type_removed);
            }
        }

        return res.json(errorMsg.token_type_not_found);

    } catch (error) {
        
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}
