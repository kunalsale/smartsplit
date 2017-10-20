var mongoose = require('mongoose');
var Member = require('./members');
var Schema = mongoose.Schema;

var Group = new Schema(
{
groupName:String,
groupId:String,
members:[{type:Member}],
amount:Number
});

module.exports = mongoose.model('Group',Group);
