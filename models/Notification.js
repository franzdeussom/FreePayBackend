const db = require('../config/db');


class Notification{
    constructor(
        ID_Notification,
        Date_Notification,
        Type_Notification,
        Contenu,
        ID_Utilisateur,
        Lues
    ){
        this.ID_Notification = ID_Notification;
        this.Date_Notification = Date_Notification;
        this.Type_Notification = Type_Notification;
        this.Contenu = Contenu;
        this.ID_Utilisateur = ID_Utilisateur;
        this.Lues = Lues;
    }

    static async send(notification){
        const [rows] = await db.promise().query(
            'INSERT INTO notifications (Date_Notification, Type_Notification, Contenu,ID_Utilisateur, Lues) VALUES(?,?,?,?,?)',
            [notification.Date_Notification, notification.Type_Notification, notification.Contenu, notification.ID_Utilisateur, notification.Lues]
        )
        notification.ID_Notification = rows.affectedRows == 1 ? rows.insertId : null;
        return rows.affectedRows == 1 ?  [notification]:[];
    }

    static async getUserNotif(id){
        const [rows] = await db.promise().query(
            'SELECT * FROM notifications WHERE ID_Utilisateur = ? ORDER BY ID_Utilisateur DESC',
            [id]
        )

        return rows.length > 0 ? rows: [];
    }

    static async deleteNotif(id){
            const [rows] = await db.promise().query(
                'DELETE FROM notifications WHERE ID_Notification = ?',
                [id]
            )

            return rows.affectedRows == 1 ? [{isDone : true}]:null;
    }

    static async deleteAllUserNotif(id_user){
            const [rows] = await db.promise().query(
                'DELETE FROM notifications WHERE ID_Utilisateur = ?',
                [id_user]
            )

            return rows.affectedRows == 1 ? [{isDone : true}]:null;
    }
}

module.exports = Notification;