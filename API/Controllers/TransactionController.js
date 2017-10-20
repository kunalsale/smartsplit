var mongoose         = require('mongoose');
var User             = mongoose.model('User');
var jwt              = require('jsonwebtoken');
var mongoose         = require('mongoose');
var Bill             = require('../Models/Bill');
var Member           = require('../Models/members');
var Group            = require('../Models/groups');
var friendController = require('./friendController');
var groupController  = require('./groupController');

module.exports.addABill = function(req,res)
{
  if (req.headers["x-access-token"])
   {
       jwt.verify(req.headers["x-access-token"],req.body.createdBy,function(err,token)
       {
           if(err)
           {
               res.json({"success":false,"message":"Invalid auth token"});
           }
           else
           {
             console.log("authentication successful");
             var newBill = Bill();
             newBill.description = req.body.description;
             newBill.amount = req.body.amount;
             newBill.paidBy = req.body.paidBy;
             newBill.splitMode = req.body.splitMode;
             newBill.splitBetween = req.body.splitBetween;
             newBill.createdBy = req.body.createdBy;    //This will be definetly a registerUser
             newBill.timeStamp = Date.now();
             newBill.groupId = req.body.groupId;


            var tempGroup = new Group();
            var membersArray = req.body.splitBetween;

             for(var i=0;i<membersArray.length;i++)
           	{
           		tempGroup.members.push(membersArray[i]);
           	}

             var indexOfCreator = -1;
             for(var j=0;j<tempGroup.members.length;j++)
             {
               if (tempGroup.members[j].memberPhone == req.body.createdBy)
               {
                 indexOfCreator = j;
                 break;
               }
             }

             if(indexOfCreator > -1)
             {
               tempGroup.members.splice(indexOfCreator,1);
             }
             else
             {
               console.log("creator hi nhi hai array me");
                return;
             }

             //now check if each element in array is user & friend
             if (tempGroup.members.length > 0 && tempGroup.members.length == 1)   //only a friend
             {
               checkAndAddFriend(req.body.createdBy,tempGroup.members,0,function(err,reult)
             {
               if(err)
               {
                 console.log(err);
               }
               else {
                 console.log("add bill here");
                 newBill.save(function(err,success)
               {
                 if(err)
                 {
                   res.json({success:false,message:"Unable to save bill"});
                 }
                 else {
                   res.json({success:true,message:"bill added successfully"});
                 }
               });
               }
             });
             }
             else  //group
             {
               console.log("yaha aaya bhi ya nahi");
               Group.findOne({groupId:req.body.groupId},function(err,group)
             {
               if(group)  //group found, just add the transaction
               {
                 console.log("sidhe hi add ho gya");
                 newBill.save(function(err,success)
               {
                 if(err)
                 {
                   res.json({success:false,message:"Unable to save bill"});
                 }
                 else {
                   res.json({success:true,message:"bill added successfully"});
                 }
               });
               }
               else //group not found
               {
                 console.log("ye bhi theek hua");
                 groupController.addGroupForTransaction(req.body.createdBy,req.body.splitBetween,newBill.amount,req.body.groupId,"SS-Default",function(err,result)
               {
                 newBill.save(function(err,success)
               {
                 if(err)
                 {
                   res.json({success:false,message:"Unable to save bill"});
                 }
                 else {
                   res.json({success:true,message:"bill added successfully"});
                 }
               });
               });
               }

             });

             }

    }

});
}
else
{
  res.json({"success":false,"message":"Auth token required"});
}


function checkAndAddFriend(creatorNumber,membersArray,counter,callback)
{
  console.log("checkAndAddFriend called");
  if(counter == membersArray.length)
  {
    callback(null,true);
    return;
  }
  else {
    friendController.addFriend(creatorNumber,membersArray[counter].memberPhone,membersArray[counter].memberName,function(err,success)
  {
    if (err) {
      callback(false,null);
    }
    else {
      checkAndAddFriend(creatorNumber,membersArray,counter+1,function(err,result)
    {
      if (err) {
        callback(false,null);
        return;
      }
      else {
        callback(null,true);
        return;
      }
    });
    }
  });
  }
}
}
