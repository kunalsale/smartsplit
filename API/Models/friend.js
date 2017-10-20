var mongoose = require('mongoose');
//var Transaction = require('./transaction');
var Schema = mongoose.Schema;

var Friend = new Schema({

name:{
	type:String,
	required:true
},
email:{
	type:String,
	required:false
},
number:{
	type:String,
	required:true
}
});

module.exports = Friend;
module.exports.FriendSchema = mongoose.model('Friend',Friend);
