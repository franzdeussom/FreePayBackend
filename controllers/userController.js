const express = require("express");
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Pack = require('../models/Pack');
const helpers = require('../helpers/helpers');
const { validationResult } = require('express-validator');
const Souscription = require("../models/Souscription");


 const UserController = {

    async login(req, res){
      try{
        const { Email, Mot_De_Passe } = req.body;

        let user = await User.findByEmail(Email);

        if(!user){
            return res.send([]); //utilisateur introuvable.
        }

        const isPasswordValid = await User.comparePassword(Mot_De_Passe, user.Mot_De_Passe);
        
        if(!isPasswordValid){
            return res.send([]); //mot de pass incorrect
        }

        //utilisateur connecté

        User.updateLastConnexionDate(helpers.getCurrentFormatedDate(), user.ID_Utilisateur);//enregistrer la date de connexion

        const tmpUserSolde = Number(user.Solde_courant);//conserver le solde avant la verification des packs

        const token = helpers.generateJWT({userId: user.ID_Utilisateur}, 'FreePay2024', 36000);//generation de son token


        const transaction = await Transaction.listUserTransaction(user.ID_Utilisateur, user.Solde_courant);//get all her transactions
        const packs = await Pack.userPackList(user.ID_Utilisateur, user.Solde_courant, user.derniere_connexion);
  
        if(tmpUserSolde != packs.soldeUser){
          //le solde a été ajutser, alors mettre à jour dans la base de donnée
          const resultUpdateSolde = await User.updateUserSolde(user.ID_Utilisateur, packs.soldeUser);
        }

        user.Solde_courant = packs.soldeUser;

        return res.json([{ data: user, transaction: transaction, dataPacks: packs, token: token}]);

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
        return res.status(402).json({ message: 'Utilisateur introuvable' });
      }
      const resetToken = await User.generateRandomCode(7);

       const ismailSend = helpers.sendMail(email, resetToken, user.Prenom_Utilisateur);
      
       return ismailSend ? res.status(200).json([{message: 'Email à été envoyé a votre adresse', code: (resetToken - 237), iduser: user.ID_Utilisateur}]) : res.status(400).send([]);
  
    },

    async changePassword(req, res){
       
      try {
            const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array()
              });
            }
            
            const { ID_Utilisateur, newPassword } = req.body;
            const passewordHashed = await helpers.hashPassword(newPassword);

            const isDone = await User.updatePassword(ID_Utilisateur, passewordHashed);
            
          return isDone ? res.json({isDone: isDone}) : res.send([]);

      } catch (error) {
        return res.status(400).send([{error: "erreur lors de l'execution  du changement!"}]);
      }
        
    },

    async delete(req, res){
          try {
              const id = req.params.id;
              if(!id){
                  return res.status(400).send(['bad request']);
              }

              const result = await User.delete(id);
              return  result ? res.status(200).json([{isDone: result}]): res.send([]);
              
          } catch (error) {
              console.log(error);
              return res.status(400).send([{error: "erreur lors de l'execution  de suppression!"}]);
          }
    },

    async getAllUser(req, res){
        try {
          const user = await User.all();

          return res.status(200).json([{data: user}]);
        } catch (error) {
          console.error(error);
          return res.status(400).send([{message:'Erreur du serveur'}]);
        }
    },

   async updateUser(req, res){
          try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array()}); 
                }
                const { Nom_Utilisateur, Prenom_Utilisateur, Email, Telephone, ID_Utilisateur }= req.body;
                const result = User.updateUser(
                                              {Nom_Utilisateur: Nom_Utilisateur, 
                                               Prenom_Utilisateur: Prenom_Utilisateur,
                                               Email: Email,
                                               Telephone: Telephone,
                                               ID_Utilisateur: ID_Utilisateur
                                              });
               return result ? res.status(200).json([{IsDone: true }]): res.send([]);                                
          } catch (error) {
              console.log(error);
              return res.status(400).send({error: "erreur lors de l'execution  de la mise à jour !"})
          }
    },

    //(Get) admin endpoint
    async userTransactionAndSouscription(req, res){
        const id = req.params.id;
        
        return res.status(200).json([{
                                      transactionList: await Transaction.listUserTransaction(id), 
                                      souscriptionList: await Souscription.getUserSouscription(id) 
                                    }]);
    },

    async wocoin(req, res){
      const option = {
            text: "Comming Soon! 2025 🤫"
      }
      return res.status(200).json([option]);
    }
}

module.exports = UserController;