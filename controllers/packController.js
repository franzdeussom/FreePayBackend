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

            return res.status(400).send({error: "Erreur lors de la création! " + error.message});
        }
      },

      async getAllPack(req, res){
    
       try {
        const info = "Le prix des packages pourrait varier à chaque instant selon la tendance de variation des valeurs des cryptomonais pris en charges par nos IA pour la collecte des données. Les revenues quotidiens pourraient augmenter ou diminuer selon les variations, nous faisons le maximum pour conserver une certaine stabilité gràce a nos IA."
        
        return res.status(200).json([{listPack: await Pack.getList(), info: info}]);

       } catch (error) {
        return res.status(400).json([{error: error.message}]);
       }
      },

      async deletePack(req, res){
        try {
            const idPack  = req.params.id;
                if(!idPack){
                  return res.status(400).send({error: "Impossible de supp ce pack !"});
              }
            const result = await Pack.deletePack(idPack);

            return result ? res.status(200).json([{isDone: result}]):res.send([]);
        } catch (error) {
          return res.status(400).json([{error: error.message}]);

        }
        
      },

      async update(req, res){
            try {

              const errors = validationResult(req);

              if (!errors.isEmpty()) {

                return res.status(400).json({ errors: errors.array()});
              }

              const { ID_Pack, Nom_Pack, Description, Montant_Minimal, Taux_Rendement, commission_parrain, Duree_Pack, Conditions } = req.body;

              const result = await Pack.update({
                              Nom_Pack: Nom_Pack,
                              ID_Pack: ID_Pack,
                              Description: Description,
                              Montant_Minimal: Montant_Minimal,
                              Taux_Rendement: Taux_Rendement,
                              commission_parrain: commission_parrain,
                              Duree_Pack: Duree_Pack,
                              Conditions: Conditions
              });
              
              return result ? res.status(200).json([{isDone: result}]): res.send([]);
              
            } catch (error) {
              return res.status(400).send({error: "Erreur lors de la création!"});  
            }
      }
}

module.exports = PackController;