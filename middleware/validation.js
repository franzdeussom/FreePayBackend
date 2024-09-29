const { check, validationResult } = require('express-validator');


exports.changePassewordValidationRules = () => {
    return [
      check('ID_Utilisateur').notEmpty().withMessage('ID doit etre defini'),
      check('newPassword').notEmpty().withMessage("le nouveau mot de passe doit etre defini")
    ];
};

exports.createUser = ()=>{
    return [
      check('Nom_Utilisateur').notEmpty().withMessage(''),
      check('Prenom_Utilisateur').notEmpty().withMessage(''),
      check('Date_Naissance').notEmpty().withMessage(''),
      check('Email').notEmpty().withMessage(''),
      check('Telephone').notEmpty().withMessage(''),
      check('Mot_De_Passe').notEmpty().withMessage(''),
    ]
}

exports.createPacksValidationRules = () =>{
    return[
      check('Nom_Pack').notEmpty().withMessage('le Nom du pack doit etre défini!'),
      check('Description').notEmpty().withMessage('la Description du pack doit etre défini!'),
      check('Montant_Minimal').notEmpty().withMessage('le Montant Minimal du pack doit etre défini!'),
      check('Taux_Rendement').notEmpty().withMessage('le Taux de Rendement du pack doit etre défini!'),
      check('commission_parrain').notEmpty().withMessage('la commission du parrain du pack doit etre défini!'),
      check('Duree_Pack').notEmpty().withMessage('la Durée du pack doit etre défini!')   
    ]
}

exports.UpdatePacksValidationRules = () =>{
  return[
    check('ID_Pack').notEmpty().withMessage('l ID du pack doit etre défini!'),
    check('Nom_Pack').notEmpty().withMessage('le Nom du pack doit etre défini!'),
    check('Description').notEmpty().withMessage('la Description du pack doit etre défini!'),
    check('Montant_Minimal').notEmpty().withMessage('le Montant Minimal du pack doit etre défini!'),
    check('Taux_Rendement').notEmpty().withMessage('le Taux de Rendement du pack doit etre défini!'),
    check('commission_parrain').notEmpty().withMessage('la commission du parrain du pack doit etre défini!'),
    check('Duree_Pack').notEmpty().withMessage('la Durée du pack doit etre défini!')   
  ]
}


exports.saveSouscriptionValidationnRules = () =>{
  return [
    check('id_utilisateur').notEmpty().withMessage('le user doit etre identifié pour continuer!'),
    check('id_pack').notEmpty().withMessage('le pack doit etre identifié pour continuer'),
    check('montant_investi').notEmpty().withMessage('le Montant Investi est Obligatoire!')
  ]
}

exports.transactionValidationRules = ()=>{
    return [
      check('Type_Transaction').notEmpty().withMessage("Type de transaction requis"),
      check('Montant').notEmpty().withMessage("Montant de la trasaction requis"),
      check('ID_Utilisateur').notEmpty().withMessage("id de l'utilisateur requis"),
    ]
}

exports.updateValidationRules = ()=>{
  //user
      return [
        check('ID_Utilisateur').notEmpty().withMessage("ID introuvable"),
        check('Nom_Utilisateur').notEmpty().withMessage("Nom d'utilisateur attendu"),
        check('Email').notEmpty().withMessage('Email Obligatoire !'),
        check('Telephone').notEmpty().withMessage('Telephone requis!'),
        check("Prenom_Utilisateur").notEmpty().withMessage('Prenom Obligatoire'),
    
      ]
}

exports.notificationValidationRules = ()=>{
    return [
      check('ID_Utilisateur').notEmpty().withMessage("L'id de l'utisateur doit etre defini"),
      check('Contenu').notEmpty().withMessage("Aucun Contenu defini"),
      check('Type_Notification').notEmpty().withMessage("Type de notification doit etre defini"),

    ]
}

exports.updateRetraitState = ()=>{
    return [
      check('idTransaction').notEmpty().withMessage('ID non défini'),
      check('status').notEmpty().withMessage('status non défini'),
      check('idUser').notEmpty().withMessage('id U non défini'),
      check('montant').notEmpty().withMessage('montant non défini'),
    ]
}

exports.updateDepotState = ()=>{
  return [
    check('idTransaction').notEmpty().withMessage('ID non défini'),
    check('status').notEmpty().withMessage('status non défini'),
    check('idUser').notEmpty().withMessage('id U non défini'),
    check('montant').notEmpty().withMessage('montant non défini'),
  ]
}

exports.createPublicationValidationRules = () =>{
  return [
    check('contenu').notEmpty().withMessage("Contenu obligatoire !"),
    check('nom').notEmpty().withMessage("Le nom de la publication est Obligatoire !"),
    check('prenom').notEmpty().withMessage('Le prenom est Obligatoire'),
    check('nbrCommentaire').notEmpty().withMessage('Le nombre de commentaire est Obligatoire'),
    check('nbrLike').notEmpty().withMessage('Le nombre de like de la pub est Obligatoire'),
    check('bgcolor').notEmpty().withMessage('La couleur dAP de la pub est Obligatoire'),
    check('id_admin').notEmpty().withMessage('ID admin de la pub est Obligatoire'),
  ]
}