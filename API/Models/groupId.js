var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupId = new Schema(
  {
    groupId:String
  }
);

module.exports = GroupId;
module.exports.GroupSchema = mongoose.model('GroupId',GroupId);
