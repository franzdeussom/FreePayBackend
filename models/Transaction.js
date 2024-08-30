const db = require('../config/db');

class Transaction{

    constructor(
        ID_Transaction,
        Date_Transaction,
        Type_Transaction,
        Montant,
        Mode_Paiement,
        ID_Utilisateur,
        ID_Pack,
        Statut_Transaction
     ){
        this.ID_Transaction = ID_Transaction;
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
            return rows.length > 0 ? rows[0]:[];
     }


     static async save(transaction){
        
     }


}

module.exports = Transaction;