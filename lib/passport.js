var LocalStrategy = require('passport-local').Strategy;
var passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
var FacebookStrategy = require('passport-facebook');
var GoogleStrategy = require('passport-google-oauth');
require('dotenv').config({path : '../'});
const client = require('./redis');

const logger = require('./logger');
const errorMsg = require('./messages').error;
const successMsg = require('./messages').success;
var User = require('../controller/models/user');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });


    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    /////For local signup/////////////
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        process.nextTick(function() {

        User.find(  { 'local.email' :  email} , function(err, user) {
            if (err)
                return done(err);

            if (user.length > 0) {
                return done(null, false, errorMsg.email_already_registered);
                
            }else{
                var newUser = new User();
                newUser.local.email         = email;
                newUser.local.password      = newUser.generateHash(password);
                newUser.local.name          = req.body.name;
                newUser.local.isVerified    = false;
                newUser.local.gateway       = 'local';
                newUser.local.role          = 'user';

                newUser.save(function(err) {
                    if (err)
                        throw done(err);

                    return done(null, newUser, successMsg.user_registered);
                });
            }

        });    

        });
    }));

    ///FACEBOOK/GOOGLE SIGN UP ///

    // passport.use('setPassword-signup', new LocalStrategy({
    //     usernameField : 'password',
    //     passwordField : 'password',
    //     passReqToCallback : true
    // },
    // function(req, username, password, done) {
    //     //console.log(username);
    //     //console.log(password);
    //     process.nextTick(function() {

    //     User.findById(req.session.passport.user, function(err,users){
    //         console.log(users);
    //         if (err)
    //             return done(err);
    //         if(!users)
    //             return done(null,false,req.flash('signupMessage','User not authenticated'));
    //         else{
    //             if(users.facebook.email){
    //                 users.email=users.facebook.email;
    //                 users.name =users.facebook.name;
    //             }
    //             else{
    //                 users.email=users.google.email;
    //                 users.name =users.google.name;
    //             }
    //     User.find({ 'local.email' :  users.email }, function(err, emailusers) {
    //         if (err)
    //             return done(err);

    //         if (emailusers.length!=0) {
    //             console.log('user found');
    //             User.findByIdAndRemove(req.session.passport.user,function(req,res){});
    //             return done(null, false, req.flash('signupMessage', 'Email is already registered.'));
    //         }
    //     else{
    //     //console.log('This email is not in database');
    //     // User.find({'local.username' : username}, function(err,nameusers){
    //     //     if (err)
    //     //         return done(err);
            
    //     //     if (nameusers.length!=0) {
    //     //         console.log('username already taken');
    //     //         return done(null, false, req.flash('signupMessage', 'This username is taken.'));
    //     //     }

    //     //     else{   
    //             var newUser = new User();
    //             console.log(users);
    //             newUser.local.email    = users.email;
    //             newUser.local.password = newUser.generateHash(password);
    //             newUser.local.name     = users.name;
    //             newUser.local.isVerified= true;
    //             console.log(newUser);
    //             //newUser.local.username = username;
    //             User.findByIdAndRemove(req.session.passport.user,function(req,res){}).then(
    //             newUser.save(function(err) {
    //                 if (err)
    //                     throw err;
    //                 return done(null, newUser);
    //             }));

    //     }});    

    //     // }
    //     // });
    //     }
    //     });
    // });
    // }));
    ///LOGIN///

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        User.findOne({ 'local.email' :  email }, function(err, user) {
            console.log('local-login');
            if (err)
                return done(err);
            if (!user)
                return done(null, false, {message : 'User not found'});
            else if(user.local.gateway != 'local')
                return done(null, false, {message : 'User registered through '+user.local.gateway});
            if (!user.validPassword(password))
                return done(null, false, {message : 'Oops! Wrong password.'}); 


            return done(null, user, {message : 'Logged In Successfully'});
        });

    }));

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : process.env.JWT_SECRET
    }, 
        function (payload, done) {
            client.get(payload.id, function(err,reply){
                if (err || !reply){ 
                    if(err) logger.error(err);
                    return done(null, false);
                }else{
        	       
                    User.findById(payload.id)
                        .then(user => {
                                
                            return done(null, user);
                        })
                        .catch(err => {
                            return done(err);
                        });
                }
            })
     	}
    ));

    passport.use('jwt-admin', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : process.env.JWT_SECRET
    }, 
        function (payload, done) {

            client.get(payload.id, function(err,reply){
            	console.log(reply);
                if (err || !reply){ 
                    console.log(err);
                    console.log(reply);
                    return done(null, false);
                }
                else{
                    console.log("Reply-------------------"+reply);
                    return User.findById(payload.id)
                        .then(user => {
                            if(user.local.role == 'admin')
                                return done(null, user);
                            else
                                return done(null, false);
                        })
                        .catch(err => {
                            return done(err);
                        });
                }
            })
        }
    ));




    // /////FACEBOOK///

    passport.use(new FacebookStrategy.Strategy({

        clientID        : process.env.FACEBOOK_CLIENT_ID,
        clientSecret    : process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL     : process.env.FACEBOOK_CALLBACK_URL,
        //profileURL      : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        profileFields   : ['id', 'displayName', 'email']

    },
     function(req,token, refreshToken, profile, done) {

        process.nextTick(function() {

            User.findOne({ 'local.email' : profile.emails[0].value }, function(err, user) {

                if (err)
                    return done(err);

                if (user) {
                    return done(null, user);
                } else {
                    var newUser = new User();               
                    //newUser.local.id    = profile.id;                                       
                    newUser.local.name  = profile.displayName;
                    newUser.local.email = profile.emails[0].value;
                    newUser.local.gateway = 'facebook';
                    newUser.local.isVerified = true;
                    newUser.local.role       = 'user';
                    // var date = new Date();
                    // date.setSeconds(date.getSeconds()+300);
                    // newUser.expireAt  = date;
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });
        });
    }));


    ///GOOGLE///

     passport.use(new GoogleStrategy.OAuth2Strategy({

        clientID        : process.env.GOOGLE_CLIENT_ID,
        clientSecret    : process.env.GOOGLE_CLIENT_SECRET,
        callbackURL     : process.env.GOOGLE_CALLBACK_URL,
        assReqToCallback : true

    },
    function(req, token, refreshToken, profile, done) {

        process.nextTick(function() {

            User.findOne({ 'local.email' : profile.emails[0].value }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    return done(null, user);
                } else {
                    console.log(profile);
                    var newUser          = new User();
                    //newUser.local.id    = profile.id;
                    //newUser.local.token = token;
                    newUser.local.name  = profile.displayName;
                    newUser.local.email = profile.emails[0].value;
                    newUser.local.isVerified  = true;
                    newUser.local.gateway     = 'google';
                    newUser.local.role        = 'user';
                    // var date = new Date();
                    // date.setSeconds(date.getSeconds()+300);
                    // newUser.expireAt  = date;
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });

                }
            });
        });

    }));


 };