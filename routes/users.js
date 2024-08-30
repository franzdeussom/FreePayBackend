const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');
const { changePassewordValidationRules } = require('../middleware/validation'); // Importe les règles


//authentification route

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/password-reset/:email', userController.sendMail);

router.post('/password-reset/', changePassewordValidationRules(), userController.changePassword);

module.exports = router;