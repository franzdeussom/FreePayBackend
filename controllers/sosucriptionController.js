const Souscription = require('../models/Souscription');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const {validationResult} = require('express-validator');
const helpers = require('../helpers/helpers');
const User = require('../models/User');

const SouscriptionController = {
        async save(req, res){
            try {
                const errors = validationResult(req);
                if(!errors.isEmpty()){
                    return res.status(400).json({ errors: errors.array()});
                }

                const { id_utilisateur, id_pack, montant_investi, id_parrainUtilisateur, commissionParrain, Type_Transaction, Duree_Pack } = req.body;

                const result = await Souscription.doSouscription({id_utilisateur: id_utilisateur, id_pack: id_pack, date_souscription: helpers.getCurrentFormatedDate(), montant_investi: montant_investi, Status: "En Cours" })
                var resultComission;

                if(id_parrainUtilisateur && commissionParrain){
                    //ajouter la comission du parrain apres la souscription de son filleul, ssi le parain du user existe
                    resultComission = await Souscription.updateParrainSoldeCommission(id_parrainUtilisateur, commissionParrain);
                }
                const transactionResult = await Transaction.save(
                                                        {
                                                            Date_Transaction: helpers.getCurrentFormatedDate(), 
                                                            Type_Transaction: Type_Transaction,
                                                            Montant: montant_investi,
                                                            Mode_Paiement: "Porte Feuille Mobile",
                                                            ID_Utilisateur: id_utilisateur,
                                                            ID_Pack: id_pack,
                                                            Statut_Transaction: result ? "Reussie":"Echec"
                                                        }, null
                                                );
                let resultSoldeUpdate;

                if(transactionResult && result){
                    resultSoldeUpdate = await User.updateUserSoldeReduice(id_utilisateur, montant_investi);
                }
                const notificationSending = await Notification.send(
                                                {
                                                    Date_Notification: helpers.getCurrentFormatedDate(),
                                                    Type_Notification: Type_Transaction,
                                                    Contenu: "L'achat de Package effectué. montant débité de votre solde " + montant_investi,
                                                    ID_Utilisateur: id_utilisateur,
                                                    Lues: 0
                                                }
                );

                if(notificationSending){
                    //mettre a jour l'attribu dans le champs du user pour prevenir l'user d'une nouvelle notif a la prochaine connexion
                    const prevenirUser = await User.setNewNotif(id_utilisateur, 1);
                }
                
                return result ? res.status(200).json(
                                                    [
                                                        {
                                                            insertID: result,
                                                            expiredIn: helpers.getRestantDayOfPack(helpers.getCurrentFormatedDate(), Duree_Pack).jourRestants, 
                                                            resultComission: resultComission, 
                                                            transactionData: transactionResult.transactionData, 
                                                            notifData: notificationSending
                                                        }
                                                    ]): res.send([]);

            } catch (error) {
                console.error(error);
                return res.status(400).send([{message: 'Impossible de souscrire à ce pack pour le moment'}]);
            }
        }

}

module.exports = SouscriptionController;