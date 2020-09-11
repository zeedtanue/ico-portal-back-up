"use strict";
const errorMsg = require('../messages').error;
const path = require('path');

const isValidFile = (value, filename, filesize) => {

    const file_types = ['.jpg', '.jpeg', '.png', '.pdf', '.ppt', '.pptx', '.doc', '.docs'];
    
    if (filesize > 5242880)
        return false;

    const extension = (path.extname(filename)).toLowerCase();
    return (file_types.includes(extension));
}

const validateWords = (value, maxsize) => {

    if(value){
        var size = value.split(' ').filter(function(n) { return n != '' }).length;
        return maxsize>=size;
    }
    
    return false;
}

const limitFileType = (req,res,next) =>{
    if (!req.files) return res.status(400).json(errorMsg.file_not_found)
    const file_ext = path.extname(req.files.sdFile.name)
    
    const extension = ['.doc','.pdf'];

    if (extension.includes(file_ext)) {
        return next();
    }

    return res.status(400).json(errorMsg.invalid_file);
}

module.exports = {
    isValidFile     : isValidFile,
    validateWords   : validateWords,
    limitFileType   : limitFileType
}