'use strict';
var express = require('express');

module.exports = function(app) {
  var setupController = require('../Controllers/UserSetupController'),
  friendController = require('../Controllers/friendController'),
  groupController = require('../Controllers/groupController'),
  transactionController = require('../Controllers/transactionController');
  var apiRoutes =  express.Router();

  app.get('/',function(req,res){
    res.send('We are happy to see you using SmartSplit');
  });

  // registerUser Route
  app.route('/signUp')
    .post(setupController.registerUser);

  // signIn Route
  app.route('/signIn')
     .post(setupController.signIn);

  app.route('/forgotPassword')
     .post(setupController.forgotPassword);

  // add a bill route
  //app.route('/addABill')
    //.post(transactionController.addABill);

  // add a bill route
  app.route('/addAFriend')
    .post(friendController.addAFriend);

  // add a bill route
  app.route('/addABill')
    .post(transactionController.addBill);

  // add a bill route
  app.route('/addGroup')
    .post(groupController.addGroup);

  app.route('/getCommonGroups')
    .post(groupController.getCommonGroups);
};
