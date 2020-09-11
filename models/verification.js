"use strict";
const mongoose = require('mongoose');

const verificationSchema = mongoose.Schema({
    email   : {type: String, maxlength: 150, required: true, unique: true, ref: 'User'},
    token   : {type: String, unique : true, required : true},
}, { timestamps : { 
    createdAt   : 'created_at',
    updatedAt   : 'updated_at' 
}});

module.exports = mongoose.model('verification', verificationSchema, 'verifications');