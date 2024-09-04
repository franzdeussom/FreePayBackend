const db = require('../config/db');
const helpers = require('../helpers/helpers');
const Souscription = require('./Souscription');

class Pack{
    constructor(
        ID_Pack,
        Nom_Pack,
        Description,
        Montant_Minimal,
        Taux_Rendement,
        commission_parrain,
        Duree_Pack,
        Conditions,
        expiredIn,
        JoursRestant
    ){
        this.ID_Pack = ID_Pack;
        this.Description = Description;
        this.Nom_Pack = Nom_Pack;
        this.Montant_Minimal = Montant_Minimal;
        this.Taux_Rendement = Taux_Rendement;
        this.commission_parrain = commission_parrain;
        this.Duree_pack = Duree_Pack;
        this.Conditions = Conditions;
        this.expiredIn = expiredIn;
        this.JoursRestant = JoursRestant;
    }

    static async save(pack){
        //admin endpoint
        const [rows] = await db.promise().query(
            'INSERT INTO packs (Nom_Pack, Description, Montant_Minimal, Taux_Rendement, commission_parrain, Duree_Pack, Conditions) VALUES (?,?,?,?,?,?,?)',
            [pack.Nom_Pack, pack.Description, pack.Montant_Minimal, pack.Taux_Rendement, pack.commission_parrain, pack.Duree_Pack, pack.Conditions]       
        );

        return  {isDone: rows.affectedRows == 1, insertId: rows.insertId };
    }

    static async getList(){
        const [rows] = await db.promise().query(
            'SELECT * FROM packs'
        );
         return rows.length > 0 ? rows: [];
    }

    static async userPackList(iduser, userSolde, lastConnection){
        const query ="SELECT souscriptions_pack.id_souscription, souscriptions_pack.id_utilisateur, souscriptions_pack.id_pack, souscriptions_pack.date_souscription, souscriptions_pack.montant_investi, packs.Taux_Rendement, packs.Duree_Pack FROM souscriptions_pack, packs WHERE souscriptions_pack.id_pack = packs.ID_Pack AND souscriptions_pack.id_utilisateur = ?"
        let packs = [];
        let packExpiredID = [];//collections des ID de souscriptions expirées
        
        const [rows] = await db.promise().query(query, [iduser]);
        
        if(rows.length > 0){
            //l'utilisateur possède des packs auxquels il a souscrit, alors calculer les revenues de chaque packs et ajuster son solde
            rows.forEach((pack, i) => {
                const checkDate = helpers.calculateGain(
                                                        pack.date_souscription, 
                                                        pack.Duree_Pack, 
                                                        pack.Taux_Rendement,
                                                        pack.montant_investi, 
                                                        userSolde, 
                                                        lastConnection //deniere connecion de l'utilisateur
                                                        );
               
                //detecter les pack expirér
                if(checkDate.isStillValid){
                    packs.push(pack);
                    packs[i].expiredIn = checkDate.expireIn;
                    userSolde = checkDate.newSole; 
                }else{
                    packExpiredID.push(Number(pack.id_souscription));
                }
                
            });
        }

        let resultUpdateExpiration = null;

        if(packExpiredID.length > 0){
            //supprimer la souscriptioin expiré de l'utilisateur courrant
            resultUpdateExpiration = Souscription.removeSouscription(packExpiredID, iduser);
        }

        return rows.length > 0 ? {pack: packs, soldeUser: userSolde, packExpiredID: packExpiredID, updateDone: resultUpdateExpiration }: [];
    }

    static async deletePack(id){
        const [rows] = await db.promise().query(
            'DELETE FROM packs WHERE ID_Pack = ?',
            [id]
        )

        return rows.affectedRows == 1;
    }

    static async update(pack){
            const [rows] = await db.promise().query(
                'UPDATE packs SET Nom_Pack = ?, Description = ?, Montant_Minimal = ?, Taux_Rendement = ?, commission_parrain = ?, Duree_Pack = ?, Conditions = ? WHERE ID_Pack = ?',
                [pack.Nom_Pack, pack.Description, pack.Montant_Minimal, pack.Taux_Rendement, pack.commission_parrain, pack.Duree_Pack, pack.Conditions, pack.ID_Pack]

            )

            return rows.affectedRows == 1;
    }


}

module.exports = Pack;
