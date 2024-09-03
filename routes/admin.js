const express = require('express');
const packController = require('../controllers/packController');
const userController = require('../controllers/userController');
const NotificationController = require('../controllers/notificationController')
const { createPacksValidationRules, notificationValidationRules } = require('../middleware/validation'); // Importe les règles
const authToken = require('../middleware/authMiddleware');
const router = express.Router();


//admin route

router.post('/pack/', authToken, createPacksValidationRules(), packController.create);
router.delete('/pack/:id',authToken, packController.deletePack);
router.get('/users', authToken, userController.getAllUser);
router.post('/notification', authToken, notificationValidationRules(), NotificationController.send)
router.get('/transaction-souscription/:id', authToken, userController.userTransactionAndSouscription);


module.exports = router;