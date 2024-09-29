const db = require('../config/db');
const helpers = require('../helpers/helpers');

class Publication{
    constructor(
        id,
        datePublication,
        contenu,
        nom,
        prenom,
        id_admin,
        nbrLike,
        nbrCommentaire,
        bgcolor,
        profilUrl
    ){
        this.id = id;
        this.datePublication = datePublication;
        this.nom = nom,
        this.contenu = contenu;
        this.prenom = prenom;
        this.nbrCommentaire = nbrCommentaire;
        this.bgcolor = bgcolor;
        this.nbrLike = nbrLike;
        this.id_admin = id_admin;
        this.profilUrl = profilUrl;
    }

    static async create(publication){
        const [rows] = await db.promise().query(
            'INSERT INTO publications (datePublication, contenu, bgcolor, nom, prenom,  nbrCommentaire, nbrLike, profilUrl, id_admin) VALUES (?,?,?,?,?,?,?,?,?)',
            [publication.datePublication, publication.contenu, publication.bgcolor, publication.nom, publication.prenom, publication.nbrCommentaire, publication.nbrLike, publication.profilUrl, publication.id_admin]
        )

        return rows.affectedRows == 1 ? [{insertID: rows.insertId }]:[];
    }

    static async update(publication){
            const [rows] = await db.promise().query(
                'UPDATE publications SET datePublication = ?, contenu = ?, bgColor = ?, nom = ?, prenom = ?, nbrCommentaire = ?, nbrLike = ?, profilUrl = ? WHERE id_admin = ? AND id = ?',
                [publication.datePublication, publication.contenu, publication.bgcolor,publication.nom, publication.prenom, publication.nbrCommentaire, publication.nbrLike, publication.profilUrl, publication.id_admin, publication.id]

            )

            return rows.affectedRows == 1 ? [{isDone: true, datePublication: publication.datePublication}]:[];
    }

    static async delete(id){
        const [rows] = await db.promise().query(
            'DELETE FROM publications WHERE id = ?',
            [id]
        );
        return rows.affectedRows == 1 ? [{isDone : true}]:[];
    }

    static async getAllPublication(){
        const [result] = await db.promise().query(
            'SELECT * FROM publications'
        )

        return result ? [{data: result}]:[];
    }

    static async getMyPub(id_admin){
        //admin endpoint
        const [result] = await db.promise().query(
            'SELECT * FROM publications WHERE id_admin = ?',
            [id_admin]
        )

        return result ? [{data: result}]:[];
    }
}

module.exports = Publication;