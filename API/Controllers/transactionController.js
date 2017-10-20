var mongoose = require('mongoose');
var _        = require('lodash');
var User     = require('../Models/user');
var Bill     = require('../Models/Bill');
var async    = require('async');
var Friend = require('../Models/friend');
var friendController = require('./friendController');
var groupController = require('./groupController');
var FriendSchema = Friend.FriendSchema;
var description;
var createdBy ;
var splitMode ;
var amount    ;
var friendsArray ;	
var group ;
var groupId ;
var membersArray ;
var paidByName ;
var paidByPhone ;
var commonArray ;

// For adding bill
module.exports.addBill = function(req,res)
{
	 description = req.body.description;
	 createdBy = req.body.createdBy;
	 splitMode = req.body.splitMode;
	 amount    = req.body.amount;
	 friendsArray = req.body.friends;
	 group = req.body.groups;
	 paidByName = req.body.paidByName;
	 paidByPhone = req.body.paidByPhone;	
	 commonArray = _.union(friendsArray,membersArray);
	 console.log(commonArray);

	if(!group)
	{
		if(friendsArray.length > 2)
		{
			// For anonymous Group
			groupController.addAnonymousGroup(friendsArray,amount,function(err,groupAdded)
			{
				if(err)		return err;
				console.log('group success');
				groupId = groupAdded.groupId;
				addBillForTransaction(res,friendsArray);
			});
		}
		else
		{
			//adding with individual person
			var otherMember = _.reject(friendsArray,{number:createdBy});
			console.log("otherMember",otherMember);
			friendController.addFriend(createdBy,otherMember[0].number,otherMember[0].name,function(err,friendsCallback)
			{
				if(err)		return err;
				console.log('success');
				addBillForTransaction(res,friendsArray);
			});
		}
	}
	else if(group && !friendsArray)
	{
		//Only group is present
		console.log('Group Exist');
		groupId = group.groupId;
		membersArray = group.members;
		addBillForTransaction(res,membersArray);
	}
	else if(group && friendsArray)
	{
		//Both are present
		groupId = group.groupId;
		membersArray = group.members;
		var commonArray = _.union(friendsArray,membersArray);
		console.log(commonArray);
		groupController.makeFriendsWithoutCreatingGroup(commonArray,function(err,success)
		{
			if(err)		return err;
			console.log('only friend success');
			addBillForTransaction(res,commonArray);
		});
	}
};

function addBillForTransaction(res,memberArray)
{
	var bill = new Bill();
	bill.description = description;
	bill.paidBy = paidByPhone;
	bill.splitMode = splitMode;
	bill.amount = amount;
	bill.createdBy = createdBy;
	bill.groupId = groupId;
	if(splitMode == "equally")
	{
		addBillEqually(bill,memberArray,function(err,savedBill)
		{
			if(err)		return err;
			res.send(savedBill);
		});
	}
	else if(splitMode == "unequally")
	{
		addBillUnEqually(bill,memberArray,function(err,savedBill)
		{
			if(err)		return err;
			res.send(savedBill);
		});
	}
};

function addBillUnEqually(bill,memberArray,callback)
{
	console.log("saving bill");
	var perHeadAmount = bill.amount/memberArray.length;
	
	for(var i=0;i<memberArray.length;i++)
	{
		memberArray[i].amount = memberArray[i].amount - perHeadAmount;
	}
	bill.splitBetween = memberArray;
	console.log(bill);
	bill.save(function(err,billSaved)
	{
		if(err)	return err;
		callback(null,billSaved);
	});
};

function addBillEqually(bill,memberArray,callback)
{
	console.log("saving bill");
	var perHeadAmount = bill.amount/memberArray.length;
	
	for(var i=0;i<memberArray.length;i++)
	{
		if(memberArray[i].number == bill.paidBy)
		{
			memberArray[i].amount = amount - perHeadAmount;
		}
		else
		{
			memberArray[i].amount = - perHeadAmount;
		}
		
	}
	bill.splitBetween = memberArray;
	bill.save(function(err,billSaved)
	{
		if(err)		return err;
		console.log("bill saved");
		callback(null,billSaved);
	});
	console.log(bill);
};


/*module.exports.addBill = function(req,res)
{
	var createdBy = req.body.createdBy;
	var splitMode = req.body.splitMode;
	var amount    = req.body.amount;
	var friendsArray = req.body.friends;
	var group = req.body.groups;
	var groupId = req.body.groupId;
	var membersArray = group.members;
	var paidByName = req.body.paidByName;
	var paidByPhone = req.body.paidByPhone;	
	var commonArray = _.union(friendsArray,membersArray);
	console.log(commonArray);

	if(splitMode == "equally")
	{
		var totalMembers  = (friendsArray.length + membersArray.length);
		var perHeadAmount = amount/totalMembers;
		var intersection  = _.intersectionWith(membersArray,friendsArray,_.isEqual);
		console.log("intersection",intersection);
		User.findOne({mobileNumber:paidByPhone},function(err,paidByUser)
		{
			if(err) return err;
			var friendWithoutId = [];
			var friends = paidByUser.friends;
			console.log(friends);
			// This for loop is to remove _id from friendArray
			for(var i=0;i<friends.length;i++)
			{
				friendWithoutId.push({memberName:friends[i].friendName,memberPhone:friends[i].friendNumber});
			}
			console.log("friendWithoutId",friendWithoutId);
			console.log("friendsArray",friendsArray);
			var notFriends = _.differenceWith(friendsArray,friendWithoutId,_.isEqual);
			console.log("notFriends",notFriends);
			var count = 0;
			makeEachOthersFRiends(notFriends,paidByUser,function(err,result)
			{
				if(err) return err;
				console.log(count,notFriends.length -1);
				if(count == notFriends.length -1)
				{
					console.log(result);
					addBillEqually(perHeadAmount,commonArray,paidByName,paidByPhone,splitMode,groupId,createdBy,amount,req.body.description);
				}
				
				count++;
			});
		});
			
	}
	else if(splitMode == 'unequally')
	{
	}
};

function addBillUnEqually(commonArray,paidByName,paidByPhone,splitMode,groupId,createdBy,amount,description)
{
	var bill = new Bill();
	bill.description = description;
	bill.paidBy = paidByPhone;
	bill.splitMode = splitMode;
	bill.amount = amount;
	bill.createdBy = createdBy;
	bill.groupId = groupId;
	bill.splitBetween = commonArray;
	console.log(bill);
	bill.save(function(err,billSaved)
	{
		if(err)	return err;
		console.log(billSaved);
	});
}

function addBillEqually(perHeadAmount,commonArray,paidByName,paidByPhone,splitMode,groupId,createdBy,amount,description)
{
	console.log("saving bill");
	var bill = new Bill();
	bill.description = description;
	bill.paidBy = paidByPhone;
	bill.splitMode = splitMode;
	bill.amount = amount;
	bill.createdBy = createdBy;
	bill.groupId = groupId
	for(var i=0;i<commonArray.length;i++)
	{
		commonArray[i].amount = perHeadAmount;
	}
	bill.splitBetween = commonArray;
	console.log(bill);
	bill.save(function(err,billSaved)
	{
		if(err)	return err;
		console.log(billSaved);
	});
};


function makeEachOthersFRiends(notFriends,paidByUser,callback1)
{
	console.log("makeEachOthersFRiends");
	var paidByFriend = new FriendSchema();
	paidByFriend.friendName = paidByUser.name;
	paidByFriend.friendNumber = paidByUser.mobileNumber;
	async.eachOf(notFriends,function(friend,key,callback)
	{
		console.log("friend",friend);
		User.findOne({mobileNumber:friend.memberPhone},function(err,doUserExists)
		{
			if(err)		return err;
			if(doUserExists)
			{
				makeFriendToUserthatExist(paidByFriend,doUserExists,function(err,friendsNow)
				{
					if(err)	return err;
					callback1(null,"Added Everyone");
				});
			}
			else
			{
				createUserAndThenMakeFriend(paidByFriend,friend,function(err,friendsNow)
				{
					if(err)	return err;
					callback1(null,"Added Everyone");
				});
			}
			console.log(key);
			
		});
	});

	console.log("After each");
};

function makeFriendToUserthatExist(paidByFriend,doUserExists,callback)
{
	console.log("makeFriendToUserthatExist");
	doUserExists.friends.push(paidByFriend);
	doUserExists.save(function(err,savedFriend)
	{
		if(err)	return err;
		console.log("EXist but not friend",savedFriend);
		var userFriend = new FriendSchema();
		userFriend.friendName = doUserExists.mobileNumber;
		userFriend.friendNumber = doUserExists.name;
		User.update({mobileNumber:paidByFriend.friendNumber},    //adding frind in admin's friend list
		{ "$push": { "friends": userFriend } },
		{ "new": true, "upsert": false },
		function (err, user)		
		{
			if(err) return err;
			callback(null,"Added");
		});
	});
};

function createUserAndThenMakeFriend(paidByFriend,friend,callback)
{	
	console.log("createUserAndThenMakeFriend",friend);
	var createMemberUser  = new User();
	createMemberUser.name = friend.memberName;
	createMemberUser.mobileNumber = friend.memberPhone;
	createMemberUser.isRegistered = false;
	createMemberUser.save(function(err,createdUser)
	{
		if(err) return err;
		console.log(createdUser);
		createdUser.friends.push(paidByFriend);
		createdUser.save(function(err,savedFriend)
		{
			if(err)	return err;
			console.log("EXist but not friend",savedFriend);
			var userFriend = new FriendSchema();
			userFriend.friendName = savedFriend.mobileNumber;
			userFriend.friendNumber = savedFriend.name;
			User.update({mobileNumber:paidByFriend.friendNumber},    //adding frind in admin's friend list
			{ "$push": { "friends": userFriend } },
			{ "new": true, "upsert": false },
			function (err, user)		
			{
				if(err) return err;
				callback(null,"Added");
			});
		});
	});
};
*/

