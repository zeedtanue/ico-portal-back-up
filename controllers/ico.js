"use strict";
const logger = require('../lib/logger');
const Handler = require('../lib/handler');
const errorMsg = require('../lib/messages').error;
const successMsg = require('../lib/messages').success;
const aws_s3 = require('../lib/aws-s3');
const IcoModel = require('../models/ico');
const AdminModel = require('../models/admin');
const mailer = require('../lib/mailer');
const path = require('path');

const mailList =[process.env.ADMIN_ONE, process.env.ADMIN_TWO];

exports.loadIcoList = async(req, res) => {

    try {
        const { err: fetchErr, data: icos } = await Handler(IcoModel.find({ email: req.user.email }));
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

exports.submitIcoDetails = async(req, res) => {

    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico || ico.email != req.user.email) return res.status(400).json(errorMsg.ico_not_found);
        if (ico.sdStatus == "Scope Completed") return res.status(400).json(errorMsg.access_denied);
        let canSubmit = true;
        if (req.body.changeSDStatus && req.body.changeSDStatus == "Submitted" && ico.sdStatus == "Incomplete") {

            elements = ['companyName', 'projectName', 'icoName', 'tokenName', 'firstName',
                'lastName', 'corrEmail', 'corrPhone', 'resAddress1', 'resAddress2',
                'resState', 'resCountry', 'resZip', 'resCity'
            ];
            for (let element in elements) {
                if (!ico[element] && canSubmit) {
                    canSubmit = false;
                    break;
                }
            }

            if (canSubmit) {
                ico.sdStatus = "Submitted";
                await Handler(ico.save());
                return res.json(successMsg.ico_created);
            } else {
                return res.status(400).json(errorMsg.details_missing);
            }

        } else if (req.body.changeRGStatus && req.body.changeRGStatus == "Design Requested" && ico.rgStatus == "Form Complete") {

            ico.rgStatus == "Design Requested";
            await Handler(ico.save());
            return res.json(successMsg.ico_status_updated);

        } else {
            return res.json(errorMsg.invalid_request);
        }

    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.uploadFiles = async(req, res) => {
    if (!req.params.id) return res.status(400).json(errorMsg.invalid_ico_id);
    if (!req.files) return res.status(400).json(errorMsg.filename_not_found);
    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico || ico.email != req.user.email) return res.status(400).json(errorMsg.ico_not_found);

        if (ico.sdStatus != "Scope Completed") {
            if (req.files.sdFile && !Array.isArray(req.files.sdFile)) {

                const image_name = ico._id + "_sdFile_" + req.files.sdFile.name;
                const { err: s3SaveErr, data: savedImage } = await Handler(aws_s3.saveImageAndGetURl(req.files['sdFile'], image_name))
                if (s3SaveErr) {
                    logger.error(s3SaveErr);
                    return res.status(500).json(errorMsg.internal);
                }
                ico.requirementsOverview_attachments.push({ url: savedImage.url, name: savedImage.name });
                await Handler(ico.save());
                return res.json(successMsg.file_uploaded);
            }
        } else if (ico.sdStatus == "Scope Completed") {
            for (var i = 0; i < ico.items.length; i++) {
                const filename = ico._id + "_" + ico.items[i].name + (path.extname(req.files[ico.items[i].name].name)).toLowerCase();
                const { err: s3SaveErr, data: savedFile } = await Handler(aws_s3.saveImageAndGetURl(req.files[ico.items[i].name], filename))
                if (s3SaveErr) {
                    logger.error(s3SaveErr);
                    return res.status(500).json(errorMsg.internal);
                }
                ico.items[i].files.push({ url: savedFile.url, filename: savedFile.name });
                await Handler(ico.save());
                }
                return res.json(successMsg.file_uploaded);
        
        } else
            return res.status(400).json(errorMsg.invalid_ico_id);

    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}
//--- Unecessary function --- 
// exports.removeFiles = async(req, res) => {

//     try {

//     } catch (error) {
//         logger.error(error);
//         res.status(500).json(errorMsg.internal);
//     }
// }

exports.createNewIco = async(req, res) => {
    try {
        const newIco = new IcoModel();
        newIco.email = req.user.email;
        await Handler(newIco.save());
        return res.json({ id: newIco._id });
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.saveSDForm = async(req, res) => {

    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico || ico.email !== req.user.email || ico.sdStatus === "Scope Completed")
            return res.status(400).json(errorMsg.ico_not_found);

        let bodyElements = ['companyName', 'projectName', 'icoName', 'tokenName', 'firstName', 'lastName',
            'corrEmail', 'corrPhone', 'resAddress1', 'resAddress2', 'resState', 'resCountry',
            'resZip', 'resCity'
        ].filter(element => req.body[element]);
        for (let element of bodyElements)
            ico[element] = req.body[element];

        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin)
            return res.status(400).json(errorMsg.ico_data_not_found);

        ico.customContent = (req.body.icoContent === 'yes') ? true : false;
        ico.items = [];

        for (let item of admin.items) {
            let name = item.name;
            console.log(name);
            let newItem = {
                name,
                price: item.price,
                uploadRequired: item.uploadRequired
            }
            if (item.fieldType == 'array') {
                // let itemPrice = item.price;
                let itemValues = [];
                if (item.default)
                    itemValues.push(item.default);
                let filteredValues = item.fieldValues.filter(value => req.body[name] && req.body[name].includes(value.name))
                newItem.price = filteredValues.reduce((sum, value) => sum + value.price, item.price)
                newItem.values = [...itemValues, ...(filteredValues.map(value => value.name))]
                    // for (let value of filteredValues) {
                    // if (req.body[name] && req.body[name].includes(value.name)) {
                    // itemPrice += value.price;
                    // itemValues.push(value.name)
                    // }
                    // }
                    // newItem.price = itemPrice
                    // newItem.values = itemValues
            } else if (item.fieldType == 'designElem' && req.body[name] && req.body[name] == 'btm')
                newItem.uploadRequired = false
            ico.items.push(newItem)
        }
        if (req.body.additionalBrief) {
            ico.requirementsOverview_text = req.body.additionalBrief;
        }

        if (ico.sdStatus !== "Incomplete") {
            ico.sdStatus = "Change Request Submitted";
            //SEND EMAIL TO ADMIN
            const[to, subject, template] = [mailList, "SD submitted", "verification.html"];
            const { err: err } = await Handler(mailer.send(to, subject, template));
            if (err) return res.status(500).json(errorMsg.internal); 
        }
        await Handler(ico.save());
        // SEND EMAIL TO USER
        const[ to, subject, template] = [ico.corrEmail, "SD submitted", "verification.html"];
        const { err: err } = await Handler(mailer.send(to, subject, template));
        if (err) return res.status(500).json(errorMsg.internal);
        return res.json(successMsg.ico_saved);
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}

exports.saveRGForm = async(req, res) => {

    try {
        const { err: fetchErr, data: ico } = await Handler(IcoModel.findById(req.params.id));
        if (fetchErr) return res.status(500).json(errorMsg.internal);
        if (!ico || ico.email !== req.user.email)
            return res.status(400).json(errorMsg.ico_not_found);
        if (ico.sdStatus === "Scope Completed")
            return res.status(400).json(errorMsg.access_denied);
        const { err: adminErr, data: admin } = await Handler(AdminModel.findOne());
        if (adminErr) return res.status(500).json(errorMsg.internal);
        if (!admin)
            return res.status(400).json(errorMsg.ico_data_not_found);

        let rgcomplete = true;

        let bodyElements = ['template', 'colorScheme', 'teamMembers',
            'advisors', 'roadMap', 'partners'
        ].filter(element => (element === 'template' && req.body[element]) ||
            (element === 'colorScheme' && req.body[element]) ||
            req.body[element] && Array.isArray(req.body[element]));
        for (let element of bodyElements)
            ico[element] = req.body[element];

        let websiteContentElements = ['slogan', 'briefProductDescription', 'briefIcoDescription',
            'briefTokenDescription', 'oneLineTokenDescription', 'keyFeatures',
            'keyFeature1', 'keyFeature2', 'keyFeature3', 'keyFeature4'
        ].filter(element => ico.customContent && req.body[element]);
        for (let element of websiteContentElements)
            ico.websiteContent[element] = req.body[element];

        let tokenElements = ['icoWebsiteDomain', 'totalSupply', 'symbol', 'totalSale']
            .filter(element => req.body[element]);
        for (let element of tokenElements)
            ico.token[element] = req.body[element];

        if (req.body.tokenStandard) {
            var tokenStandard = admin.tokens.find(function(obj) { return obj.name === req.body.tokenStandard });
            if (tokenStandard) {
                ico.token.tokenStandard = tokenStandard.name;
                ico.token.price = tokenStandard.price;
            }
        }

        for (let element of['mintableToken', 'burnableToken', 'refundPolicy'])
            ico.token[element] = (req.body[element] === 'yes') ? true : false;

        ico.preIco.needed = (req.body.preIcoNeeded === 'yes') ? true : false;

        if (ico.preIco.needed) {
            if (req.body.preIcoStartDate)
                ico.preIco.startDate = new Date(req.body.preIcoStartDate);
            if (req.body.preIcoEndDate)
                ico.preIco.endDate = new Date(req.body.preIcoEndDate);
            if (req.body.preIcoMinContribution)
                ico.preIco.minContribution = req.body.preIcoMinContribution;
            if (req.body.preIcoPricing && Array.isArray(req.body.preIcoPricing) && req.body.preIcoPricing.length !== 0)
                ico.preIco.pricing = req.body.preIcoPricing;
        }

        if (req.body.IcoStartDate)
            ico.ico.startDate = new Date(req.body.IcoStartDate);
        if (req.body.IcoEndDate)
            ico.ico.endDate = new Date(req.body.IcoEndDate);
        if (req.body.IcoMinContribution)
            ico.ico.minContribution = req.body.IcoMinContribution;
        if (ico.token.refundPolicy && req.body.IcoSoftCap)
            ico.ico.softCap = req.body.IcoSoftCap;
        if (req.body.IcoPricing && Array.isArray(req.body.IcoPricing) && req.body.IcoPricing.length !== 0)
            ico.ico.pricing = req.body.icoPricing;

        for (let item of ico.items) {
            let name = item.name
            if (item.uploadRequired && req.body[name] && item.files.length !== 0) {
                item.files.push({ url: req.body[name], filename: null });
                await Handler(ico.save());
            } else rgcomplete = false;
        }
        await Handler(ico.save());

        if (rgcomplete && (ico.rgStatus !== "Incomplete" || ico.rgStatus !== "Form Complete")) {
            ico.rgStatus = "Design Requested";
            ico.request = ico.request + 1;

            /////Send EMAIL to ADMIN here
            const [to, subject, template, ps_link] = [mailList, "RG Submitted", "verification.html", `${process.env.HOST}/api/admin/dashboard`];
            const { err: err } = await Handler(mailer.send(to, subject, template, ps_link));
            if (err) return res.status(500).json(errorMsg.internal);
        } else if (rgcomplete) {
            ico.rgStatus = "Form Complete";

            //send Email to USER 
            const [to, subject, template]= [ico.corrEmail, "RG Submitted", "verification.html"];
            const {err:err} = await Handler(mailer.send(to, subject, template));
            if (err) return res.status(500).json(errorMsg.internal);
        } else if (!rgcomplete)
            ico.rgStatus = "Incomplete";

        const { err, data: newico } = await Handler(ico.save());
        return res.json({ newico })
            ///////Send MAIL
    } catch (error) {
        logger.error(error);
        res.status(500).json(errorMsg.internal);
    }
}