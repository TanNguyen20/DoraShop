// import all the things we need  
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy  = require('passport-facebook').Strategy;

const mongoose = require('mongoose');
const User = require('../app/models/user');

module.exports = function (passport) {
  passport.use(
    //google
    new GoogleStrategy(
      {
        clientID: '1034135528297-f2v8ot1ve3g767fkk74ga33m322g7ff5.apps.googleusercontent.com',
        clientSecret: '1G5o06_vgOfruCf1a_mUgsj0',
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        //get the user data from google 
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          email: profile.emails[0].value
        }

        try {
          //find the user in our database 
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            //If user present in our database.
            done(null, user)
          } else {
            // if user is not preset in our database save user data to database.
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  );
  // facebook
  passport.use(
    new FacebookStrategy(
    {
      clientID: '795285031127110',
      clientSecret:'4841b19498c516218409d8acc1c11ff1',
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails','name','photos'],
    },
    
    async (accessToken, refreshToken, profile, done) => {
      //get the user data from facbook 
      const newUser1 = {
        facebookId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
      }

      try {
        //find the user in our database 
        let user = await User.findOne({ facebookId: profile.id })

        if (user) {
          //If user present in our database.
          done(null, user)
        } else {
          // if user is not preset in our database save user data to database.
          user = await User.create(newUser1)
          done(null, user)
        }
      } catch (err) {
        console.error(err)
      }
    }
  ));
  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
} 