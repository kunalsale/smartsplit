var mongoose = require('mongoose');
var User = mongoose.model('User');
var Friend = require('../Models/friend');
var async = require('async');

module.exports.addAFriend = function(req,res)
{
	var userNumber = req.body.userNumber;
	var friendName = req.body.name;
	var friendNumber = req.body.mobileNumber;
	friend(userNumber,friendNumber,friendName, function(err,result)
	{
		if(err) return err;
		res.end("Success");
	});
};

function friend(userNumber,friendNumber,friendName,callback)
{
	console.log(userNumber,friendNumber);

	User.findOne({mobileNumber:friendNumber}, function(err,isUserFriend)
	{
		if(err)
		{
		 callback(err,null);
		 return;
		}

		var FriendSchema = Friend.FriendSchema;
		if(isUserFriend)  //does user exists in User DB
		{
		  console.log("user friend ",isUserFriend);
		  let userFriend = new FriendSchema();
		  userFriend.friendName = isUserFriend.name;
		  userFriend.friendEmail = isUserFriend.email;
	          userFriend.friendNumber = isUserFriend.mobileNumber;

		  var friends = isUserFriend.friends;
		  for(var i=0; i<friends.length; i++)
		  {
			var friend = friends[i];
			if(friend.number === userNumber) //Does admin(request maker) exists in friend's friend list
			{
				console.log("Exists");
				callback(null,"Exist");
				return;   //Because already friend
			}
		  }

		  User.update({mobileNumber:userNumber},    //adding frind in admin's friend list
			      { "$push": { "friends": userFriend } },
			      { "new": true, "upsert": true },
			      function (err, user)
		 	{
			if(err)	return err;
			console.log(user);
			var friend = new FriendSchema();
			User.findOne({mobileNumber:userNumber},function(err,userData)  //adding self in friend's friend list.
			{
				if(err) return err;
				friend.name = userData.name;
	          		friend.email = userData.email;
	                  	friend.number = userData.mobileNumber;
		          	User.update({mobileNumber:userFriend.number},{ "$push": { "friends": friend } },{ "new": true, "upsert": true },
					function (err, user)
					{
					console.log(user)
					if(err)	return err;
					callback(null,user);
					return;
			  		});
		        });
		  });
		}
		else   //friend does not exists in user DB
		{
			var userFriend = new User();   //adding friend as unregistered user
			userFriend.name = friendName;
			userFriend.mobileNumber = friendNumber;
			userFriend.isRegistered = false;
			userFriend.save(function(err,user)
			{
				if(err)	return err;
				console.log("Added Friend");
				var friend = new FriendSchema();
				friend.name = friendName;
				friend.number = friendNumber;
				User.update({mobileNumber:userNumber},    //adding this newly created user in self friend list
			      	{ "$push": { "friends": friend } },
			      	{ "new": true, "upsert": true },
			      	function (err, user)
		 		{
			 		if(err) return err;
					User.findOne({mobileNumber:userNumber},function(err,user)
					{
						var friendUser = new FriendSchema();
						friendUser.name = user.name;
						friendUser.number = user.mobileNumber;
						User.update({mobileNumber:friendNumber},  //adding self in newly created user's friend list
			      			{ "$push": { "friends": friendUser } },
			      			{ "new": true, "upsert": true },
			      			function (err, user)
		 				{
						console.log('Added user that doesnt exists');
						callback(null,"Success");
						return;
		 				});
					});
				});
			});
		}
	});
};

module.exports.addFriend = function(userNumber,friendNumber,friendName,callback)
{
	console.log(friendNumber);
	friend(userNumber,friendNumber,friendName, function(err,result)
	{
		if(err)
    {
      console.log("check 1");
      callback(err,null);
    }
    else {
      console.log("check 2");
        callback(null,result);
    }

	});
};
