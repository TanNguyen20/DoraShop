//khong dung file nay
const express = require('express');
const router = express.Router();
const coursescontroller = require('../app/controllers/CoursesController');

router.post('/store',coursescontroller.store);
router.post('/handle-form-actions',coursescontroller.handleFormActions);
router.get('/:id/edit',coursescontroller.edit);
router.patch('/:id/restore',coursescontroller.restore);
router.put('/:id',coursescontroller.update);
// soft delete
router.delete('/:id',coursescontroller.delete);
router.delete('/:id/destroy',coursescontroller.destroy);
router.get('/create',coursescontroller.create);
router.get('/:slug',coursescontroller.show);

module.exports = router;