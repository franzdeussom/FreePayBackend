const Pack = require('../models/Pack');
const {validationResult} = require('express-validator');
const helpers = require('../helpers/helpers');



const PackController = {
    async create(req, res){
        //add authorization bearer

        try {
            const errors = validationResult(req);

                if (!errors.isEmpty()) {

                  return res.status(400).json({ errors: errors.array()

                });
             }

                const { Nom_Pack, Description, Montant_Minimal, Taux_Rendement, commission_parrain, Duree_Pack, Conditions } = req.body;
            
                const result = await Pack.save({ Nom_Pack, Description, Montant_Minimal, Taux_Rendement, commission_parrain, Duree_Pack, Conditions })
                
                let packData = new Pack();
                Object.assign(packData, req.body);
                packData.ID_Pack = result.isDone ? result.insertId : null;
            
          return result.isDone ? res.status(200).json([{data: packData }]): res.send([]);
        
        } catch (error) {

            console.error(error);

            return res.status(400).send({error: "Erreur lors de la création!"});
        }
      },

      async getAllPack(req, res){
    
       
        return res.status(200).json([{listPack: await Pack.getList()}]);
      },

      async deletePack(req, res){
        const idPack  = req.params.id;

        if(!idPack){
            return res.status(400).send({error: "Impossible de supp ce pack !"});
        }
        const result = await Pack.deletePack(idPack);
        return result ? res.status(200).json([{isDone: result}]):res.send([]);

      }
}

module.exports = PackController;