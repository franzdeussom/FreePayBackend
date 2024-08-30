const { check, validationResult } = require('express-validator');


exports.changePassewordValidationRules = () => {
    return [
      check('ID_Utilisateur').notEmpty().withMessage('ID doit etre defini'),
      check('newPassword').notEmpty().withMessage("le nouveau mot de passe doit etre defini")
    ];
};