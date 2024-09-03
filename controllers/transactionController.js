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
    }
}

module.exports = TransactionController;