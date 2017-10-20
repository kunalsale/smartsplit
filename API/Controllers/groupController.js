var _                = require('lodash');
var shortId          = require('shortid');
var async            = require('async');

//Models 
var mongoose         = require('mongoose');
var User             = mongoose.model('User');
var Group            = require('../Models/groups');
var Friend           = require('../Models/friend');
var GroupId          = require('../Models/groupId');
var Group            = require('../Models/groups');
var Member           = require('../Models/members');

module.exports.addGroup = function(req,res)
{
	initializeVariableAndAddGroup(req.body.groupName,req.body.members,req.body.amount,function(err,success)
	{
		if(err)		return err;
		res.send({'success':true});
	});	
};

function initializeVariableAndAddGroup(groupName,memberArray,amount,finalCallback)
{
	var group = new Group();
	console.log(memberArray);	
	var groupId = shortId.generate();
	group.groupName = groupName;
	group.groupId = groupId;
	group.amount = amount;
	var MemberSchema = Member.MemberSchema;
	var GroupSchema = Group.GroupSchema;
	var GroupIdSchema = GroupId.GroupSchema;
	for(var i=0;i<memberArray.length;i++)
	group.members.push(memberArray[i]);
	console.log(group);
	group.save(function(err,groupAdded)
	{
		if(err)	return err;
		console.log("groupAdded");
		var count = 0;
		makeEachOtherFriendsInTheGroup(memberArray,function(err,success)
		{
			if(err) return err;
			if(count == memberArray.length-1)
			{
			finalCallback(null,groupAdded);
			}
			count++;
		});
	});
};

function makeEachOtherFriendsInTheGroup(memberArray,finalCallback)
{
	async.each(memberArray,function(mem,callback)
		{
			console.log("inside");
			User.findOne({mobileNumber:mem.number},function(err,doUserExist)
			{
				if(err)  return err;
				console.log(doUserExist);
				if(doUserExist)
				{
					var intersection = [];
					var modifiedArray = [];
					var friendArray = doUserExist.friends;
					// This for loop is to remove _id from friendArray
					for(var i=0;i<friendArray.length;i++)
					{
					   intersection.push({name:friendArray[i].name,number:friendArray[i].number});
					}
					console.log("intersection",intersection);
					// Gives friends which are not present in the array of user
					console.log("memberArray",memberArray);
					var modifiedArray = _.differenceWith(memberArray,intersection,_.isEqual);
					console.log("modifiedArray",modifiedArray);
					for(var i=0;i<modifiedArray.length;i++)
					{		
						if(modifiedArray[i].number == mem.number)
						{
							modifiedArray.splice(i,1);
						}
					}
					// Adds members in the friendsArray 
					User.update({mobileNumber:mem.number},{"$addToSet":{"friends":{"$each":modifiedArray}}},
						function(err,nonExistingUserMembersx)
						{	
							if(err)	return err;
							finalCallback(null,"Added Friend");
							console.log('Added');	
						});
				}
				else
				{
					var updated = [];
					console.log("else");
					var user = new User();
					console.log(mem);
					user.name = mem.name;
					user.mobileNumber = mem.number;
					user.isRegistered = false;
					console.log(user);
					for(var i=0;i<memberArray.length;i++)
					{
					   updated.push(memberArray[i]);
					}
					console.log("updated",updated);
					for(var i=0;i<updated.length;i++)
					{
						if(updated[i].number == mem.number)
						{
							updated.splice(i,1);
						}
					}
					console.log("updated",updated);
					user.save(function(error,userCreated)
					{
						if(error)	return error;
						User.update({mobileNumber:mem.number},{"$addToSet":{"friends":{"$each":updated}}},
						function(err,nonExistingUserMembersx)
						{	
							if(err)	return err;
							finalCallback(null,"Added Friend");
						});
					});
				}
			});	
		});
};

module.exports.makeFriendsWithoutCreatingGroup = function(memberArray,finalCallback)
{
	var memberArrayWithoutAmount = [];
	async.forEach(memberArray,function(member,callback)
	{
		memberArrayWithoutAmount.push({name:member.name,number:member.number});	
	});
	console.log("memberArrayWithoutAmount",memberArrayWithoutAmount);
	
	var count = 0 ;
	makeEachOtherFriendsInTheGroup(memberArrayWithoutAmount,function(err,success)
	{
		if(err) return err;
		console.log(count);
		if(count == memberArrayWithoutAmount.length-1)
		{
			console.log("final");
			finalCallback(null,success);
		}
		count++;
	});
};

module.exports.addAnonymousGroup = function(memberArray,amount,callback)
{
	var memberArrayWithoutAmount = [];
	async.forEach(memberArray,function(member,callback)
	{
			memberArrayWithoutAmount.push({name:member.name,number:member.number});	
	});
	initializeVariableAndAddGroup("Created By SmartSplit",memberArrayWithoutAmount,amount,function(err,groupAdded)
	{
		if(err)		return err;
		callback(null,groupAdded);
	});
};

module.exports.getCommonGroups = function(req,res)
{
	var userNumber = req.body.userNumber;
	var friendNumber = req.body.friendNumber;

	Group.find({"members.memberPhone":{ $all: [userNumber,number] } },function(err,data)
	{
		if(err) return err;
		console.log(data);
	});
};

