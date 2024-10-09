const db = require('../config/db');
const helpers = require('../helpers/helpers');

class Souscription{
    constructor(
        id_souscription,
        id_utilisateur,
        id_pack,
        date_souscription,
        montant_investi,
        Statut
    ){
        this.id_souscription = id_souscription;
        this.id_utilisateur = id_utilisateur;
        this.id_pack = id_pack;
        this.date_souscription = date_souscription;
        this.montant_investi = montant_investi;
        this.Statut = Statut;
    }

    static async doSouscription(souscription){
        const [rows] = await db.promise().query(
            'INSERT INTO souscriptions_pack (id_utilisateur, id_pack, date_souscription, montant_investi, Statut) VALUES(?,?,?,?,?)',
            [souscription.id_utilisateur, souscription.id_pack, souscription.date_souscription, souscription.montant_investi, souscription.Status]
        );

        return rows.affectedRows == 1 ? rows.insertId:null;
    }
    static async updateParrainSoldeCommission(id_parrain, commissionParrain){
        const [rows] = await db.promise().query(
            'UPDATE utilisateurs SET solde_commsion = solde_commsion + ?, Solde_courant = Solde_courant + ? WHERE ID_Utilisateur = ? ',
            [commissionParrain, commissionParrain, id_parrain]
        );  
    

        return rows.affectedRows == 1;
    }

    static async removeSouscription(idSouscription, idUser){
            const [rows] = await db.promise().query(
                "DELETE FROM souscriptions_pack WHERE id_souscription IN (" + idSouscription.map(Number).join(',') + ") AND id_utilisateur = ?",
                [idUser]
            )
            return rows.affectedRows == 0;
    }

    static async getUserSouscription(id){
            const query ="SELECT souscriptions_pack.id_souscription, souscriptions_pack.id_utilisateur, souscriptions_pack.id_pack, souscriptions_pack.date_souscription, souscriptions_pack.montant_investi, packs.Nom_Pack, packs.Duree_Pack FROM souscriptions_pack, packs WHERE souscriptions_pack.id_pack = packs.ID_Pack AND souscriptions_pack.id_utilisateur = ?"
            let packs = [];

            const [result] = await db.promise().query(
                query,
                [id]
            )

            if(result.length > 0){
                //l'utilisateur possède des packs auxquels il a souscrit, alors determiner la date d'expiration de chaque pack.
                result.forEach((pack, i) => {
                    const checkDate = helpers.getPackExpireDate(pack.date_souscription, pack.Duree_Pack);
                   
                        packs.push(pack);
                        packs[i].expiredIn = checkDate;                    
                });

                return packs;
            }
        
        return [];
    }

}

module.exports = Souscription;