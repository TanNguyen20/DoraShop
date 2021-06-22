const express = require('express');
const router = express.Router();
const productcontroller = require('../app/controllers/ProductController');

router.get('/addtocart',productcontroller.addtocart);
router.post('/store',productcontroller.store);
router.get('/order/:productslug',productcontroller.order);
router.post('/processorder/:productslug',productcontroller.processorder);
router.post('/handle-form-actions',productcontroller.handleFormActions);
router.get('/:id/edit',productcontroller.edit);
router.patch('/:id/restore',productcontroller.restore);
router.put('/:id',productcontroller.update);
// soft delete
router.delete('/:id',productcontroller.delete);
router.delete('/:id/destroy',productcontroller.destroy);
router.get('/create',productcontroller.create);
router.get('/:slug',productcontroller.show);

module.exports = router;