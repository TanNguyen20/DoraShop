const express = require('express');
const router = express.Router();
const ordercontroller = require('../app/controllers/OrderController');

// router.get('/order/:productslug',productcontroller.order);
// router.post('/processorder/:productslug',productcontroller.processorder);
router.post('/handle-form-actions',ordercontroller.handleFormActions);
router.patch('/:id/restore',ordercontroller.restore);
// soft delete
router.delete('/:id',ordercontroller.delete);
router.delete('/:id/destroy',ordercontroller.destroy);

module.exports = router;