var mongoose = require('mongoose');
var Member = require('./members');
var Schema = mongoose.Schema;

var Bill = new Schema({

description:{
  type:String,
  required:true
},
amount:{
	type:Number,
	required:true
},
paidBy:{
	type:String,
	required:true
},
splitMode:{
  type:Boolean,
  required:true
},
splitBetween:[{type:Member}],
createdBy:{
  type:String,
  required:true
},
timeStamp:{
  type:Date,
  required:false
},
groupId:{
  type:String,
  required:false
}
});

module.exports = mongoose.model('Bill',Bill);
