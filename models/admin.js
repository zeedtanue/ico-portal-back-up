var mongoose = require('mongoose');
//var bcrypt   = require('bcrypt-nodejs');


var adminSchema = mongoose.Schema({
	items 	: [{
				name : {type : String, required : true}, 
	          	price : {type : Number, required: true},
	          	uploadRequired : {type : Boolean, required: true}, 
	          	fieldType     : {type : String, required : true},
	          	fieldValues   : [{name : {type : String, required : true}, price : {type : Number, required : true}}],
	          	default		: String, 
	          	specification : String,
	          	label         : String,
	          	inputType     : String
	          }],
    tokens	: [{
    			name : {type : String, required : true},
			  	information : {type : String},
			  	price : {type : Number, required : true}
			  }]

});
module.exports = mongoose.model('admin', adminSchema,'admin');