var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy(function(username, password, done)
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
		return done(null, user);
	});
}))