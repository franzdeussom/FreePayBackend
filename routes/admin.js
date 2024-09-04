const express = require('express');
const packController = require('../controllers/packController');
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');
const NotificationController = require('../controllers/notificationController')
const { createPacksValidationRules, updateRetraitState, notificationValidationRules, updateValidationRules, transactionValidationRules} = require('../middleware/validation'); // Importe les règles
const authToken = require('../middleware/authMiddleware');
const router = express.Router();


//admin route

router.post('/pack/', authToken, createPacksValidationRules(), packController.create);
router.put('/pack', authToken, updateValidationRules(), packController.update);

router.delete('/pack/:id',authToken, packController.deletePack);
router.get('/users', authToken, userController.getAllUser);
router.post('/notification', authToken, notificationValidationRules(), NotificationController.send)
router.get('/transaction-souscription/:id', authToken, userController.userTransactionAndSouscription);

router.put('/transaction-state', authToken, updateRetraitState(), transactionController.updateRetraitState);
router.get('/transaction-total', authToken, transactionController.getTotalAmount);
router.get('transaction-request', authToken, transactionController.getRetraitRequest);

module.exports = router;