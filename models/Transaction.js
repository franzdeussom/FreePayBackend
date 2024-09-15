const db = require('../config/db');
const Notification = require("./Notification");
const helpers = require('../helpers/helpers');
const User = require('./User');

class Transaction{

    constructor(
        ID_Transaction,
        mobileTransactionID,
        Date_Transaction,
        Type_Transaction,
        Montant,
        Mode_Paiement,
        ID_Utilisateur,
        ID_Pack,
        Statut_Transaction
     ){
        this.ID_Transaction = ID_Transaction;
        this.mobileTransactionID = mobileTransactionID;
        this.Date_Transaction = Date_Transaction;
        this.Type_Transaction = Type_Transaction;
        this.Montant = Montant;
        this.Mode_Paiement = Mode_Paiement;
        this.ID_Pack = ID_Pack;
        this.ID_Utilisateur = ID_Utilisateur;
        this.Statut_Transaction = Statut_Transaction;
     }

     static async listUserTransaction(idUser){
            const [rows] = await db.promise().query(
                'SELECT * FROM transactions WHERE ID_Utilisateur = ? ORDER BY ID_Transaction DESC',
                [idUser]
            );
            return rows.length > 0 ? rows:[];
     }


     static async save(transaction, mobileTransactionID){
            const [result] = await db.promise().query(
                'INSERT INTO transactions (mobileTransactionID, Date_Transaction, Type_Transaction, Montant, Mode_Paiement, ID_Pack, ID_Utilisateur, Statut_Transaction) VALUES(?,?,?,?,?,?,?,?)',
                [mobileTransactionID, transaction.Date_Transaction, transaction.Type_Transaction, transaction.Montant, transaction.Mode_Paiement, transaction.ID_Pack, transaction.ID_Utilisateur, transaction.Statut_Transaction]
            );
            let transact = new Transaction();
            Object.assign(transact, transaction);
            transact.ID_Transaction = result.insertId;

            return result.affectedRows == 1 ? {transactionData: transact}:[];
     }

     static async isMobileIDTranscationValid(id){
         const [result] = await db.promise().query(
            'SELECT * FROM transactions WHERE mobileTransactionID = ?',
            [id]
         );

        return result.length == 0;
     }

     //admin
     static async getRetraitRequest(){
        const [rows] = await db.promise().query(
            "SELECT utilisateurs.ID_Utilisateur, utilisateurs.Nom_Utilisateur, utilisateurs.Prenom_Utilisateur, utilisateurs.Telephone, transactions.Montant, transactions.Date_Transaction FROM utilisateurs, transactions WHERE transactions.ID_Utilisateur = utilisateurs.ID_Utilisateur AND Type_Transaction = 'Retrait'"
        )

        return rows.length == 0 ? []:rows;
     }

     static async getDepotRequest(){
        const [rows] = await db.promise().query(
            "SELECT utilisateurs.ID_Utilisateur, utilisateurs.Nom_Utilisateur, utilisateurs.Prenom_Utilisateur, utilisateurs.Telephone,transactions.ID_Transaction, transactions.Montant, transactions.Date_Transaction, transactions.mobileTransactionID FROM utilisateurs, transactions WHERE transactions.ID_Utilisateur = utilisateurs.ID_Utilisateur AND Statut_Transaction = 'Traitement en cours...'"
        )

        return rows.length == 0 ? []:rows;
     }

     static async getAllDepot(){
        const query = "SELECT SUM(transactions.Montant) as TOTAL FROM transactions WHERE Type_Transaction = 'Dépot' AND Statut_Transaction = ?"
        const [rows] = await db.promise().query(query,
            ['Approuvée']
        );
        return rows;
     }

     static async getAllRetrait(){
        const query = "SELECT SUM(transactions.Montant) as TOTAL FROM transactions WHERE Type_Transaction = 'Retrait' AND Statut_Transaction = 'Approuvée'"
        const [rows] = await db.promise().query(
            query
        );
        return rows;
     }

     static async updateRetraitState(idTransaction, value, id_user, montant){
            value = 'Approuvée';
            const [rows] = await db.promise().query(
                'UPDATE transactions SET Statut_Transaction = ? WHERE ID_Transaction = ?',
                [value, idTransaction]
            )
            const notifiResult = await Notification.send({ 
                            ID_Utilisateur : id_user,
                            Date_Transaction: helpers.getCurrentFormatedDate(),
                            Type_Notification: "Retrait",
                            Contenu: "Votre demande de retrait à été approuvé et vos fonds ont été transféré à votre numero de Telephone d'inscription. Montant : " + montant + ' XAF',
                            Lues: null
            });

            return rows.affectedRows == 1 ? true:false;
     }

     static async updateDepotState(idTransaction, id_user, montant){
            const value = 'Approuvée';
            const [rows] = await db.promise().query(
                'UPDATE transactions SET Statut_Transaction = ?, Montant = ? WHERE ID_Transaction = ?',
                [value, montant, idTransaction]
            )
            const notifiResult = await Notification.send({ 
                            ID_Utilisateur : id_user,
                            Date_Transaction: helpers.getCurrentFormatedDate(),
                            Type_Notification: "Dépot",
                            Contenu: "Dépot effectué avec succès, Montant : " + montant + ' XAF',
                            Lues: null
            });

            const updateSoldeRslt = await User.addSolde(id_user, montant);

            return rows.affectedRows == 1 ;
     }

     static async updateRetratState(id, value, id_user, montant){
        const [rows] = await db.promise().query(
            'UPDATE transactions SET Statut_Transaction = ? WHERE ID_Transaction = ?',
            ['Echec', id]
        )
        const notifiResult = await Notification.send({ 
                        ID_Utilisateur : id_user,
                        Date_Transaction: helpers.getCurrentFormatedDate(),
                        Type_Notification: "Retrait",
                        Contenu: "Votre demande de retrait à été approuvé et vos fonds ont été transféré à votre numero de Telephone d'inscription. Montant : " + montant + ' XAF',
                        Lues: null
        });

        return rows.affectedRows == 1 ? true:false;
     }


     static async setTransactAsFailed(id, id_user){
        const [rows] = await db.promise().query(
            'UPDATE transactions SET Statut_Transaction = ? WHERE ID_Transaction = ?',
            ['Echec', id]
        )
        const notifiResult = await Notification.send({ 
                        ID_Utilisateur : id_user,
                        Date_Transaction: helpers.getCurrentFormatedDate(),
                        Type_Notification: "Dépot",
                        Contenu: "Echec de Transaction.",
                        Lues: null
        });

        return rows.affectedRows == 1 ? true:false;
     }
     

}

module.exports = Transaction;