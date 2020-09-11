var AWS = require('aws-sdk')
var fs = require("fs");
// var moment = require('moment')
// var conf = require('../lib/config')
// var logger = require('./logger')
require('dotenv').config({path : '../'});
AWS.config.accessKeyId = process.env.AWS_S3_ACCESSKEY_ID
AWS.config.secretAccessKey = process.env.AWS_S3_SECRETACCESSKEY
AWS.config.region = process.env.AWS_S3_REGION
AWS.config.signatureVersion= 'v4'
//AWS.config.s3_host_name = 's3-us-east-2.amazonaws.com'
var s3 = new AWS.S3()

var bucketParams = {Bucket: process.env.AWS_S3_BUCKET};
s3.createBucket(bucketParams)

var s3Bucket = new AWS.S3( { params: {Bucket: process.env.AWS_S3_BUCKET} } )

async function uploadGetUrl(file, name, i, j) {
    return new Promise(function(resolve,reject){
        var data = {Key: name, Body: file.data }
        //console.log(data)
        s3Bucket.putObject(data, function(err, data){
            if (err) {
                //console.log(data);
                throw err; 
                //logger.error(err); 
                reject(err);
            } 
        });
        //console.log('data : '+data.Body);
        //Expires max only 7 days as per AWS v4 documentation
        var urlParams = {Bucket: process.env.AWS_S3_BUCKET, Key: data.Key, Expires: 604800}
        s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
            if (err) { 
                console.log('Error in getUrl');
                //logger.error('Error getting url: ', err);
                reject(err);
            } else {
                console.log(url)
                resolve({url,i,j,name : urlParams.Key});

            }        
        })
    })
}

// sample: var params = {Bucket: conf.aws_s3.bucketName, Key: data.Key, Expires: moment().add(6,'day')}
function getSignedUrl(name, i) {
    params = {Bucket : process.env.AWS_S3_BUCKET, Key: name, Expires: 604800};
    return new Promise(function(resolve,reject){
        s3Bucket.getSignedUrl('getObject', params, function(err, url){
            if (err) { 
                //logger.error('Error getting url: ', err);
                reject(err);
            } else {
                console.log(url);
                resolve({url, i})
            }        
        })
    })
}

function deleteImage(name,i){
    params = {Bucket : process.env.AWS_S3_BUCKET, Key: name};
    return new Promise(function(resolve, reject){
        s3Bucket.deleteObject(params, function(err, data){
            if(err)
                reject(err);
            else
                resolve({name, i});
        });
    });
}

/* var params = {Bucket: conf.aws_s3.bucketName};
s3.listObjects(params, function(err, data){
  var bucketContents = data.Contents;
    for (var i = 0; i < bucketContents.length; i++){
      var urlParams = {Bucket: conf.aws_s3.bucketName, Key: bucketContents[i].Key};
        s3.getSignedUrl('getObject',urlParams, function(err, url){
          console.log('the url of the image is', url);
        });
    }
}); */

module.exports = {
    saveImageAndGetURl: uploadGetUrl,
    getSignedUrl: getSignedUrl,
    deleteObject: deleteImage
}