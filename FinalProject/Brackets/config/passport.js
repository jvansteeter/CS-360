var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy(function (username, password, done)
{
	console.log("in passport.js");
	User.findOne({ username: username }, function (err, user)
	{
		if (err)
		{
			return done(err);
		}
		if(!user)
		{
			return done(null, false, { message: 'Incorrect username.' });
		}
		if(!user.checkPassword(password))
		{
			return done(null, false, { message: 'Incorrectpassword.' });
		}
		console.log("returning user");
		return done(null, user);
	});
}));

passport.use(new FacebookStrategy(
{
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://hearts:3000/index.html"
},
function(accessToken, refreshToken, profile, done) 
{
    User.findOrCreate({ username: username }, function (err, user) 
    {
    	if (err) 
    		{ return done(err); }
    	done(null, user);
    });
  }
));