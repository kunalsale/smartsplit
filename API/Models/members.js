var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Member = new Schema(
{
name:String,
amount:Number,
number:String
});

module.exports = Member;
module.exports.MemberSchema = mongoose.model('Member',Member);
