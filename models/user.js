"use strict";
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const logger = require('../lib/logger');

const userSchema = mongoose.Schema({
        name         : {type: String, maxlength: 100, required: true},
        email        : {type: String, maxlength: 150, required: true},
        password     : {type: String, required: false},
        is_verified  : {type: Boolean, required: true},
        gateway      : {type: String, maxlength: 50, required: true},
        role	 	 : {type: String, maxlength: 50, required: true}
}, { timestamps : { 
    createdAt   : 'created_at',
    updatedAt   : 'updated_at' 
}});

userSchema.methods.generate_hash = function(password) {

    try {

        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        
    } catch (err) {
        logger.error(err);
        return false;
    }
};

userSchema.pre('save', function(next){

    if(!this.password) return next();

    try {

        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null);
        return next();
        
    } catch (err) {
        logger.error(err);
        throw new Error('Password hashing failed');
    }

});

userSchema.methods.valid_password = function(password) {

    try {

        return bcrypt.compareSync(password, this.password);
        
    } catch (err) {
        logger.error(err)
        return false;
    }
};

module.exports = mongoose.model('user', userSchema,'users');