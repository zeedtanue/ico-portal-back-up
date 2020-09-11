"use strict";
const mongoose = require('mongoose');

const icoSchema = mongoose.Schema({
    first_name: { type: String, maxlength: 250 },
    last_name: { type: String, maxlength: 250 },
    email: { type: String, maxlength: 120 },
    phone: { type: String, maxlength: 15 },
    address_1: { type: String, maxlength: 250 },
    address_2: { type: String, maxlength: 250 },
    state: { type: String, maxlength: 150 },
    postal_code: { type: String, maxlength: 15 },
    res_country: { type: String, maxlength: 150 },

    project_name: { type: String, maxlength: 100 },
    company_name: { type: String, maxlength: 250 },
    token_name: { type: String, maxlength: 250 },
    ico_name: { type: String, maxlength: 250 },

    sdStatus    :   {type : String, required : true, default : "Incomplete"},
    requirementsOverview_attachments : [{name : {type : String, required : true}, url : {type : String , required : true}}],
    items       :   [{name      : {type : String, required : true},
        values  : [String],
        price   : {type : Number, required : true},
        uploadRequired : {type : Boolean, required : true, default : false},
        files   : [{
            url     : {type : String},
            filename: {type : String}
        }]}],

    color: {
        primary: { type: String, maxlength: 250 },
        secondary: { type: String, maxlength: 250 },
        tertiary: { type: String, maxlength: 250 },
    },
    logo: {
        file_name: { type: String, maxlength: 250 },
        url: { type: String },
    },
    mascot: {
        file_name: { type: String, maxlength: 250 },
        url: { type: String },
    },
    videos: { type: Array },
    images: { type: Array },
    brand_guide: { type: String },
    white_paper: { type: String },
    team_members: [{
        name: { type: String, maxlength: 250 },
        bio: { type: String },
        photo: { type: String },
        profile: { type: String }
    }],

    team_advisors: [{
        name: { type: String, maxlength: 250 },
        bio: { type: String },
        photo: { type: String },
        profile: { type: String }
    }],

    roadmap: {
        title: { type: String, maxlength: 250 },
        detail: { type: String },
        end_date: { type: String, maxlength: 50 },
    },

    partners: [{
        company_name: { type: String, maxlength: 250 },
        company_logo: { type: String },
    }],

    website: {
        template: { type: Number, default: 1 },
        slogan: { type: String, maxlength: 50 },
        brief_desc: { type: String },
        domain: { type: String, maxlength: 250 },

        token: {
            name: { type: String, maxlength: 250 },
        },

        key_features: [{
            title: { type: String, maxlength: 250 },
            description: { type: String },
        }],
        ico_desc: { type: String, maxlength: 200 },
        token_desc: [{
            one_line: { type: String, maxlength: 30 },
            brief: { type: String, maxlength: 200 },
        }],
        token_distribution: [{
            name: { type: String, maxlength: 250 },
            percentage: { type: Number, max: 100, default: 0 },
        }],


    }
});

module.exports = mongoose.model('ico', icoSchema, 'ico');