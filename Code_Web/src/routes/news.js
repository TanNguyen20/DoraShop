const express = require('express');
const router = express.Router();
const newcontroller = require('../app/controllers/NewsController');
 router.get('/',newcontroller.index);

 module.exports = router;