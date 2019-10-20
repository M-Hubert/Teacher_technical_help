const router = require('express').Router()
const config = require('../config.json')
const passport = require('passport')
const MicrosoftStrategy = require('passport-microsoft').Strategy
const User = require('../modules/userSchema')

passport.serializeUser(function (user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new MicrosoftStrategy({
    clientID: config.Microsoft.clientId,
    clientSecret: config.Microsoft.clientSecret,
    callbackURL: config.url.main+"microsoft/redirect"
    },(accessToken, refreshToken, profile, done)=> {
            done(null, profile)
    }
))

//Get default URL.
router.get('/', passport.authenticate('microsoft', {
    scope: 'user.read',
}))

router.get('/redirect', passport.authenticate('microsoft', {failureRedirect: '/'}), 
(req, res) => {
    User.find({email: req.session.passport.user.emails[0].value}).then((users) => {
        if (users[0] == undefined){
            res.redirect('/')
        } else {
            req.session.connection = 'connect'
            req.session.userInfo = users[0]
            res.redirect('/teacher')
        }
    })
});

module.exports = router