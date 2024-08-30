const express = require("express");
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const helpers = require('../helpers/helpers');
const { validationResult } = require('express-validator');


 const UserController = {

    async login(req, res){
      try{
        const { Email, Mot_De_Passe } = req.body;

        const user = await User.findByEmail(Email);

        if(!user){
            return res.send([]); //utilisateur introuvable.
        }

        const isPasswordValid = await User.comparePassword(Mot_De_Passe, user.Mot_De_Passe);
        
        if(!isPasswordValid){
            return res.send([]); //mot de pass incorrect
        }
        
        const token = helpers.generateJWT({userId: user.ID_Utilisateur}, 'FreePay2024', 36000);


        const transaction = await Transaction.listUserTransaction(user.ID_Utilisateur);
        
        return res.json([{ data: user, transaction: transaction, token: token}]);

      }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    },

    async signup(req, res){
        const { Nom_Utilisateur, Prenom_Utilisateur, Mot_De_Passe, Date_Naiss, Telephone, Email, code_invitation} = req.body;
    },

    async sendMail(req, res){
      const { email } = req.params;
      if(!email){
        return res.status(400).json({message: 'Email pas fournie'});
      }

      // Trouver l'utilisateur par son email
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      const resetToken = await User.generateRandomCode(7);

       const ismailSend = helpers.sendMail(email, resetToken, user.Prenom_Utilisateur);
      
       return ismailSend ? res.status(200).json([{message: 'Email à été envoyé a votre adresse', code: resetToken, iduser: user.ID_Utilisateur}]) : res.status(400).send([]);
  
    },

    async changePassword(req, res){
       const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array()
        });
      }

        const { ID_Utilisateur, newPassword } = req.body;
        const passewordHashed = await helpers.hashPassword(newPassword);

        const isDone = await User.updatePassword(ID_Utilisateur, passewordHashed);
        
        return res.json({isDone: isDone});
    } 
}

module.exports = UserController;