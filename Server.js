var express = require('express');
var config  = require('./config');
var app     = express();
var port = 3000;

var mongoose = require('mongoose'),
User         = require('./API/Models/user'), //created model loading here
bodyParser   = require('body-parser');

console.log(config.dbUrl);
// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./API/Routes/Routes'); //importing route
routes(app); //register the route

app.listen(config.port,function(){
  console.log('Server started on port ' + port);
});
