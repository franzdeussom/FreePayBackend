const Publication = require('../models/Publication');
const helpers = require('../helpers/helpers');
const { validationResult } = require('express-validator');
const express = require("express");

const publicationController = {
    async create(req, res){
        try {
                 const errors = validationResult(req);
                if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array()});
                }

                const {contenu, nom, prenom, id_admin, nbrLike, nbrCommentaire, bgcolor } = req.body;

                const resutl = await Publication.create(
                    {
                        datePublication: helpers.getCurrentFormatedDate(),
                        contenu: contenu,
                        nom: nom,
                        prenom: prenom,
                        id_admin: id_admin,
                        nbrLike: nbrLike,
                        nbrCommentaire: nbrCommentaire,
                        bgcolor: bgcolor,
                        profilUrl: null
                    }
                );
    
            return resutl.length > 0 ? res.status(200).json([{insertId: resutl[0].insertID, date: helpers.getCurrentFormatedDate()}]):res.send([]);
   
        } catch (error) {
            console.log(error);
            return res.status(400).send([{error: "erreur lors de l'execution  du changement!"}]);
        }
    },

    async update(req, res){
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                 return res.status(400).json({ errors: errors.array()});
            }

            const {contenu, nom, prenom, id_admin, nbrLike, nbrCommentaire, bgcolor } = req.body;

            const resutl = await Publication.update(
                {
                    datePublication: helpers.getCurrentFormatedDate(),
                    contenu: contenu,
                    nom: nom,
                    prenom: prenom,
                    id_admin: id_admin,
                    nbrLike: nbrLike,
                    nbrCommentaire: nbrCommentaire,
                    bgcolor: bgcolor,
                    profilUrl: null
                }
            );
            
            return resutl.length > 0 ? res.status(200).json(resutl):res.send([]);
        
        } catch (error) {
            console.error(error);
            return res.status(400).send([{error: "erreur lors de l'execution  de creation!"}]);
        }
       },

    async delete(req, res){
        try {
            const id = req.params.id;
            if(!id){
                return res.status(400).send([{error: "Id introuvable!"}]); 
            }

            const result = await Publication.delete(id);
            
            return result.length > 0 ? res.status(200).json([result]):res.send([]);

        } catch (error) {
            console.error(error);
            return res.status(400).send([{error: "Erreur lors de la suppréssion!"}]);
            
        }
    },

    async getMyPub(req, res){
        try {
            const id_admin = req.params.id;
            if(!id_admin){
                return res.status(400).send([{error: "Id introuvable!"}]); 
            }

            return res.status(200).json(await Publication.getMyPub(id_admin));
        } catch (error) {
            console.error(error);
            return res.status(400).send([{error: "Erreur!"}]);
        }
    },

    async getAllPub(req, res){
        try {

            return res.status(200).json(await Publication.getAllPublication());
        } catch (error) {   
            console.error(error);
            return res.status(400).send([{error: "Erreur lors du chargement de l'actualité !"}]);
        }
    }
}

module.exports = publicationController;