const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const packController = require('../controllers/packController');
const notifController = require('../controllers/notificationController');
const souscriptionController = require('../controllers/sosucriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');
const { changePassewordValidationRules, saveSouscriptionValidationnRules, updateValidationRules } = require('../middleware/validation'); // Importe les règles

//authentification route

router.post('/login', userController.login);

router.post('/signup', userController.signup);

router.get('/password-reset/:email', userController.sendMail);

router.put('/users', authMiddleware, updateValidationRules(), userController.updateUser);

router.get('/pack/', authMiddleware, packController.getAllPack);

router.post('/souscription', authMiddleware, saveSouscriptionValidationnRules(), souscriptionController.save);

router.post('/password-reset/', changePassewordValidationRules(), userController.changePassword);

router.get('/notification/:id', authMiddleware, notifController.getUserNotification);

router.delete('/notification-unique/:id', authMiddleware, notifController.deleteNotif);

router.delete('/notification-all/:id', authMiddleware, notifController.deleteAllNotif);

module.exports = router;