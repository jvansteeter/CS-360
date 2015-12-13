var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');

//setup mongoose
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/brackets');

// setup models and configurations
require("./user.js");
require("./match.js");
require("./round.js");
require("./tournament.js");
require("./config/passport.js");
require("./hosts.js");

// setup routes
var index = require("./routes/index.js");
var api = require("./routes/api.js");
//var users = require('./routes/users');

var app = express();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

// setup passport
var configAuth = require('./config/auth.js');
app.use(session({secret: configAuth.session.secret, 
                 resave: true,
                 saveUninitialized: true 
               }));
app.use(passport.initialize());
app.use(passport.session());
//app.use('/', index);
app.use('/api', api);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) 
{
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') 
{
  app.use(function(err, req, res, next) 
  {
    res.status(err.status || 500);
    res.render('error', 
    {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) 
{
  res.status(err.status || 500);
  res.render('error', 
  {
    message: err.message,
    error: {}
  });
});*/

module.exports = app;