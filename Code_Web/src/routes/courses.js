const express = require('express');
const router = express.Router();
const coursescontroller = require('../app/controllers/CoursesController');
 
 router.post('/store',coursescontroller.store);
 router.post('/handle-form-actions',coursescontroller.handleFormActions);
 router.get('/:id/edit',coursescontroller.edit);
 router.put('/:id',coursescontroller.update);
 router.delete('/:id',coursescontroller.delete);
 router.get('/create',coursescontroller.create);
 router.get('/:slug',coursescontroller.show);

 module.exports = router;