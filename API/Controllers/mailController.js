'use strict'
var nodemailer = require('nodemailer');
var config = require('./mailConfig.js')
var to,subject,text,mailOptions;

// Creating smtp object for sending mail
var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
      user: config.email,
      pass: config.password
  }
});

// For sending mail on successful registration
module.exports.registrationMail = function(user)
{
  to = user.email;
  subject = 'Registration Successfully';
  text = "Hi "+ user.name+",\n You have successfully created an account";
  prepareMailOption();
  sendMail();
}

// For sending link on registered email address for resetting password
module.exports.forgotPassword = function(user)
{
  console.log("Hit");
  to = user.email;
  subject = 'Forgot Password';
  text = "http://smartsplit.demo.com/forgotPassword";
  prepareMailOption();
  sendMail();
}

function prepareMailOption()
{
  // setup email data with unicode symbols
  mailOptions = { // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // html body
  };
}

// sends mail
function sendMail()
{
  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, (error, info) => {
  if (error) {
      return console.log(error);
  }
  console.log('Message sent: %s', info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}
