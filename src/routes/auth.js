const express = require('express');
const passport = require('passport');
const authcontroller = require('../app/controllers/AuthController');
const router = express.Router();
const {mongooseToObject, mulMgToObject} = require('../util/mongo');
  // login  with google
  router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
  //
  router.get(
      '/google/callback',
      passport.authenticate('google', { failureRedirect: '/' }),
      (req, res) => {
        res.redirect('/product/oppo-reno5');
      }
    );
  //
  router.get('/loginGoogle', authcontroller.ensureGuest ,(req, res) => {
    res.render('loginwithgoogle')
  })

  router.get("/inforWithGoogle",authcontroller.ensureAuth, async(req,res)=>{
    // res.json(req.user);
      res.render('inforLoginWithGoogle',{
        userinfo: mongooseToObject(req.user),
      })
  })

  //login with facebook
  //
  router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile','email'] }));
  // successRedirect co the thay the cho function ben duoi sau failureRedirect tham khao cach dung function o auth voi google
  //    function(req, res) {
	//      res.redirect('/product/oppo-reno5');
	//    }
	router.get('/facebook/callback',
	  passport.authenticate('facebook', { successRedirect : '/product/oppo-reno5', failureRedirect: '/loginFacebook' })
  );
    //
    router.get("/inforWithFacebook",authcontroller.ensureAuth, async(req,res)=>{
      // res.json(req.user);
        res.render('inforLoginWithFacebook',{
          userinfo: mongooseToObject(req.user),
        })
    })
    //
    router.get('/loginFacebook', authcontroller.ensureGuest ,(req, res) => {
      res.render('loginwithfacebook')
    })
    
  //chung
  router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/');
  });
module.exports = router;