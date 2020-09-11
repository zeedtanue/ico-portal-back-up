"use strict";
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const FacebookStrategy= require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const redis = require('../config/redis');
const errorMsg = require('../lib/messages').error;
const User = require('../models/user');

// serialize user
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

// de-serialize user
passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

// local strategy
passport.use('local', new LocalStrategy({
	usernameField 	: 'email',
   	passwordField 	: 'password',
   	session			: false
}, (email, password, done) => {

	User.findOne({email}).then(user => {

		if(!user) return done(null, null, errorMsg.login_failed);
		else if(user.gateway != 'local') return done(null, null, errorMsg.login_failed);
		else if(!user.valid_password(password)) return done(null, null, errorMsg.login_failed);
		else if(!user.is_verified) return done(null, null, errorMsg.email_not_verified);

		return done(null, user);

	}).catch(err => {
		return done(err, null);
	});
}));


// jwt strategy
passport.use('jwt', new JwtStrategy({
    jwtFromRequest  : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey     : process.env.JWT_SECRET
}, (payload, done) => {

	redis.get(payload.sub, (err, reply) => {

		if(err) return done(err, null);
		else if(!reply) return done(null, null);
		
		User.findById(payload.sub).then(user => {

			if(!user) return done(null, null);
			else if(!user.is_verified) return done(null, null);
	    	
	    	return done(null, user);

	    }).catch(err => {
	    	return done(err, null);
	    });
	});
}));


// jwt strategy for admin login
passport.use('jwt-admin', new JwtStrategy({
    jwtFromRequest  : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey     : process.env.JWT_SECRET
}, (payload, done) => {

	redis.get(payload.sub, (err, reply) => {

		if(err) return done(err, null);
		else if(!reply) return done(null, null);

		User.findById(payload.sub).then(user => {

	    	if(!user) return done(null, null);
	    	else if(user.role != 'admin') return done(null, null);
	    	
	    	return done(null, user);

	    }).catch(err => {
	    	return done(err, null);
	    });
	});
}));


// facebook login strategy
passport.use('facebook', new FacebookStrategy({
	clientID   		: process.env.FACEBOOK_CLIENT_ID,
    clientSecret 	: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL 	: process.env.FACEBOOK_CALLBACK_URL,
    profileFields   : ['id', 'displayName', 'email'],
    scope 			: ['public_profile', 'email'],
    failureRedirect	: '/signup'
}, (access_token, refresh_token, profile, done) => {

	User.findOne({ email: profile.emails[0].value }).then(user => {

		if(user) return done(null, user);
		
		User.create({
			name 		: profile.displayName,
			email 		: profile.emails[0].value,
			gateway		: 'facebook',
			is_verified	: true,
			role 		: 'user'
		}).then(new_user => {
			return done(null, new_user);
		}).catch(err => {
			return done(err, null);
		})

	}).catch(err => {
		return done(err, null);
	});
}));


// google login strategy
passport.use('google', new GoogleStrategy({
	clientID        : process.env.GOOGLE_CLIENT_ID,
    clientSecret    : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL     : process.env.GOOGLE_CALLBACK_URL,
    assReqToCallback: true,
    scope 			: ['profile', 'email'],
    failureRedirect : '/signup'
}, (access_token, refresh_token, profile, done) => {

	User.findOne({ email: profile.emails[0].value }).then(user => {

		if(user) return done(null, user);
		
		User.create({
			name 		: profile.displayName,
			email 		: profile.emails[0].value,
			gateway		: 'google',
			is_verified	: true,
			role 		: 'user'
		}).then(new_user => {
			return done(null, new_user);
		}).catch(err => {
			return done(err, null);
		});

	}).catch(err => {
		return done(err, null);
	});
}));

module.exports = passport;