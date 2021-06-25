const express = require('express');
// const Account = require('../models/account');
// const Order = require('../models/order');
// const {mongooseToObject, mulMgToObject} = require('../../util/mongo');

class UsersController{
    ensureAuth(req, res, next) {
        if (req.isAuthenticated()) {
          return next()
        } else {
          res.redirect('/laptop')
        }
    }
    // if user is authenticated and going to login page then redirected to home page if not authenticated redirected to login page  .
    ensureGuest(req, res, next) {
        if (!req.isAuthenticated()) {
          return next();
        } else {
          res.redirect('/product/samsung-galaxy-s20');
        }
    }
}

module.exports = new UsersController();