const {validationResult} = require('express-validator');
const Transaction = require('../models/Transaction');
const helepers = require('../helpers/helpers');
const User = require('../models/User');
const fs = require("fs");
const path = require("path");


const TransactionController = {
    async save(req, res){
        try{
            const errors = validationResult(req);

                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array()});
                 }
                
                const { Type_Transaction, Montant, ID_Utilisateur, mobileTransactionID } = req.body;

            

                if(Type_Transaction == "Dépot"){
                    if(!mobileTransactionID){
                        return res.status(400).send({message: "Id de transaction mobile est obligatoire."});
                    }
                    if(!await Transaction.isMobileIDTranscationValid(mobileTransactionID)){
                        return res.status(402).send({message: "Echec ID Transaction Mobile"});
                    }
                }
                
                if(Type_Transaction == "Retrait"){
                    const resp = await  User.updateUserSoldeReduice(ID_Utilisateur, Montant);
                }
            
                const result = await Transaction.save(
                    {
                        Date_Transaction: helepers.getCurrentFormatedDate(),
                        Type_Transaction: Type_Transaction,
                        Montant: Montant,
                        Mode_Paiement: "Porte de feuille Mobile",
                        ID_Pack: null,
                        ID_Utilisateur: ID_Utilisateur,
                        Statut_Transaction: "Traitement en cours..."
                    }, mobileTransactionID)

        return res.status(200).json([result]);

        }catch(error){
            console.log(error);
            return res.status(400).json([{message: error.message}]);
        }
    },

   async getMyTransactionList(req, res){
        try {
            const offset = req.params.offset;
            const idUser = req.params.id;


            if(!idUser || !offset){
                return res.status(400).send({message: "id and offset doesn't set", params: req.params});
            }

            const transactionList = await Transaction.getMyTransactionList(Number(idUser), Number(offset));
            const maxOffset = await Transaction.countUserTransaction(idUser);
            

            return res.status(200).send([{list : transactionList, maxOffset: maxOffset}]);

        } catch (error) {
            return res.status(400).json([{message: error.message}]);
        }
    },

    async getDepotRequest(req, res){
        try {

            const result = await Transaction.getDepotRequest();

            return  res.status(200).json([{depotRequestList: result}]);

        } catch (error) {
            console.log(error);
            return res.status(400).json([{message: error.message}]);
        }
    },

    async getRetraitRequest(req, res){
        //Obtnir les demande de retrait
        try {

            const result = await Transaction.getRetraitRequest();

            return  res.status(200).json([{retraitRequestList: result}]);

        } catch (error) {
            console.log(error);
            return res.status(400).json([{message: error.message}]);
        }
    },

   async updateRetraitState(req, res){
        //Redefinir le statut des demandes de retrait: approuver
        try {
             const {idTransaction, status, idUser, montant} = req.body;
             if(!idTransaction){
                return res.status(400).json([{message: "ID non defini"}]);
             } 
             const result = await Transaction.updateRetraitState(idTransaction, status, idUser, montant);
             if(result){
                isPreventionSend = await User.setNewNotif(idUser, 1);
            }

             return  result ? res.status(200).json([{isDone: result}]): res.send([]);

        } catch (error) {
            console.log(error);
            return res.status(400).json([{message: error.message}]);
        }
    },

    async updateDepotState(req, res){
        //Redefinir le statut des demandes de depot: approuvée
        try {
             const {idTransaction, idUser, montant} = req.body;
             if(!idTransaction){
                return res.status(400).json([{message: "ID non defini"}]);
             } 
             const result = await Transaction.updateDepotState(idTransaction, idUser, montant);
             if(result){
                isPreventionSend = await User.setNewNotif(idUser, 1);
            }

             return  result ? res.status(200).json([{isDone: result}]): res.send([]);

        } catch (error) {
            return res.status(400).json([{message: error.message}]);
        }
    },

    async getTotalAmount(req, res){
        //Obtenir les revenue total encaissés
        try {
            const result = await Transaction.getAllDepot();
            const retraitResult = await Transaction.getAllRetrait();

            return  res.status(200).json([{total: result, totalRetrait: retraitResult}]);
        } catch (error) {
            return res.status(400).json([{message: error.message}]);   
        }
    },
   
 async getTransactionOptiion(req, res){

    try {
        const filepath = path.resolve(__dirname, "./files/data.json");
        const fileData = fs.readFileSync(filepath, "utf-8");
        const jsonData = JSON.parse(fileData);
        
        const options = {
        retrait: {
          minRetrait: jsonData.minRetrait,
          tax: jsonData.tax,
          applyTax: jsonData.applyTax,
          text: jsonData.textRetrait,
        },
        depot: {
          orange: jsonData.orange,
          MTN: jsonData.MTN,
          verify: jsonData.verify,
          minDepot: jsonData.minDepot,
          OrangeTransactionIDLength: jsonData.OrangeTransactionIDLength,
          MTNTransactionIDLength: jsonData.MTNTransactionIDLength,
          pays: jsonData.pays,
          info: jsonData.info,
        },
      };

      return res.status(200).json({ options: options });
    } catch (error) {
      res.status(404).json({ error: error });
    }
    },

    async echecsTransact(req, res){
        try {
            const {idTransaction, status, idUser, montant} = req.body;
             if(!idTransaction){
                return res.status(400).json([{message: "ID non defini"}]);
             } 
            
             const result = await Transaction.updateRetratState(idTransaction, status, idUser, montant);
             if(result){
                isPreventionSend = await User.setNewNotif(idUser, 1);
            }

             return  result ? res.status(200).json([{isDone: result}]): res.send([]);
        } catch (error) {
            return res.status(400).json([{message: error.message}]);
        }
    },

    async echecDepotTransaction(req, res){
        try {
            const {idTransaction, idUser} = req.body;
             if(!idTransaction){
                return res.status(400).json([{message: "ID non defini"}]);
             } 
            
             const result = await Transaction.setTransactAsFailed(idTransaction, idUser);
             if(result){
                isPreventionSend = await User.setNewNotif(idUser, 1);
            }

             return  result ? res.status(200).json([{isDone: result}]): res.send([]);
        } catch (error) {
            console.log(error);
            return res.status(400).json([{message: error.message}]);
        }
    },

    //access GET & PUT /update-parameters
    async updateParameters(req, res) {
        const filepath = path.resolve(__dirname, "./files/data.json");
        const fileData = fs.readFileSync(filepath, "utf-8");
        const jsonData = JSON.parse(fileData);
    
        try {
          let {
            minRetrait,
            tax,
            applyTax,
            textRetrait,
            orange,
            MTN,
            verify,
            minDepot,
            OrangeTransactionIDLength,
            MTNTransactionIDLength,
            pays,
            info,
          } = req.body;
      
          jsonData.minRetrait = minRetrait ? minRetrait : jsonData.minRetrait;
          jsonData.tax = tax ? tax: jsonData.tax;
          jsonData.applyTax = applyTax ? applyTax:jsonData.applyTax;
          jsonData.textRetrait = textRetrait ? textRetrait : jsonData.textRetrait;
          jsonData.Orange = orange ? orange : jsonData.Orange;
          jsonData.MTN = MTN ? MTN : jsonData.MTN;
          jsonData.verify = verify ? verify : jsonData.verify;
          jsonData.minDepot = minDepot ? minDepot : jsonData.minDepot;
          jsonData.OrangeTransactionIDLength = OrangeTransactionIDLength ? OrangeTransactionIDLength : jsonData.OrangeTransactionIDLength;
          jsonData.MTNTransactionIDLength = MTNTransactionIDLength ? MTNTransactionIDLength : jsonData.MTNTransactionIDLength;
          jsonData.pays = pays ? pays : jsonData.pays;
          jsonData.info = info ? info : jsonData.info;
      
          fs.writeFileSync(filepath, JSON.stringify(jsonData, null, 2), "utf-8");
          
          return res
            .status(200)
            .json([{ result: "requete executee", option: jsonData }]);
        } catch (error) {
          return res.status(400).json([{ message: error.message }]);
        }
      },
}

module.exports = TransactionController;