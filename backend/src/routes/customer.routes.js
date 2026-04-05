const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// All routes here are admin only
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id/status', customerController.updateStatus);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
