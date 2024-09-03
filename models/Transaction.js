const db = require('../config/db');

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
                'SELECT * FROM transactions WHERE ID_Utilisateur = ?',
                [idUser]
            );
            return rows.length > 0 ? rows:[];
     }


     static async save(transaction, mobileTransactionID){
            const [result] = await db.promise().query(
                'INSERT INTO transactions (mobileTransactionID, Date_Transaction, Type_Transaction, Montant, Mode_Paiement, ID_Pack, ID_Utilisateur, Statut_Transaction)',
                [mobileTransactionID, transaction.Date_Transaction, transaction.Type_Transaction, transaction.Montant, transaction.Mode_Paiement, transaction.ID_Pack, transaction.ID_Utilisateur, transaction.Statut_Transaction]
            );
            let transact = new Transaction();
            Object.assign(transact, transaction);
            transact.ID_Transaction = result.insertId;

            return result.affectedRows == 1 ? {transactionData: transact}:[];
     }

     static async isMobileIDTranscationValid(id){
         const [result] = await db.promise().query(
            'SELECT * FROM transactions WHERE mobileID = ?',
            [id]
         );

        return result.length == 0;
     }

}

module.exports = Transaction;