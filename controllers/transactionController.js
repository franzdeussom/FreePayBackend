const {validationResult} = require('express-validator');
const Transaction = require('../models/Transaction');
const helepers = require('../helpers/helpers');

const TransactionController = {
    async save (req, res){
        try{
            const errors = validationResult(req);

                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array()});
                 }
                
                const { Type_Transaction, Montant, ID_Utilisateur, mobileTransactionID } = req.body;

                if(!mobileTransactionID){
                    return res.status(400).send({message: "Id de transaction mobile est obligatoire."});
                }

                if(Type_Transaction == "Dépot"){
                    if(!await Transaction.isMobileIDTranscationValid(mobileTransactionID)){
                        return res.status(400).send({message: "Echec ID Transaction Mobile"});
                    }
                }

            
                const result = await Transaction.save(
                    {
                        Date_Transaction: helepers.getCurrentFormatedDate(),
                        Type_Transaction: Type_Transaction,
                        Montant: Montant,
                        Mode_Paiement: "Porte de feuille Mobile",
                        ID_Pack: null,
                        ID_Utilisateur: ID_Utilisateur,
                        Status_Transaction: Type_Transaction === "Dépot" ? "Reussi":"Traitement en cours..."
                    }, mobileTransactionID)

        return res.status(200).json([result]);

        }catch(error){
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
             
             return  result ? res.status(200).json([{isDone: result}]): res.send([]);

        } catch (error) {
            console.log(error);
            return res.status(400).json([{message: error.message}]);
        }
    },

    async getTotalAmount(req, res){
        //Obtenir les revenue total encaissés
        try {
            const result = await Transaction.getAllDepot();
            const retraitResult = await Transaction.getAllRetrait();

            return  res.status(200).json([{total: result[0], totalRetrait: retraitResult[0]}]);
        } catch (error) {
            console.log(error);
            return res.status(400).json([{message: error.message}]);   
        }
    },

    async getTransactionOptiion(req, res){
        const options = {
            min: 4700,
            Text: "Vos demandes de retraits sont traitées et vous recevrez votre accréditation au plus tard pendant 72h !"
        }

        return res.status(200).json([{options: options}]);
    }
}

module.exports = TransactionController;