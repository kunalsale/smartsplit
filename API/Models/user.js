var mongoose = require('mongoose');
var Friend = require('./friend');
var GroupId = require('./groupId');
var Schema = mongoose.Schema;

var User = new Schema({

name:{
	type:String,
	required:true
},
email:{
	type:String,
	required:false
},
mobileNumber:{
	type:String,
	required:true
},
password:{
	type:String,
	required:false
},
isRegistered:{
	type:Boolean,
	required:true
},
friends:[{type:Friend}]
});

module.exports = mongoose.model('User', User);
