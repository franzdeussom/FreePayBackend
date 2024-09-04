const Notification = require('../models/Notification');
const {validationResult} = require('express-validator');
const helpers = require('../helpers/helpers');
const User = require('../models/User');

const NotificationController = {
   async send(req, res){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                res.status(400).send([{message: errors.array()}]);
            }

            const  { ID_Utilisateur, Contenu, Type_Notification, Lues} = req.body;


            const result = await Notification.send(
                                {
                                    ID_Utilisateur : ID_Utilisateur,
                                    Contenu: Contenu,
                                    Type_Notification: Type_Notification,
                                    Date_Notification: helpers.getCurrentFormatedDate(),
                                    Lues: Lues ? Lues : null
                                }
            )
            let isPreventionSend;

            if(result){
                isPreventionSend = await User.setNewNotif(ID_Utilisateur, 1);
            }

            return result ? res.status(200).json([{data : result.notificationData}]):res.send([]);
        } catch (error) {
            console.error(error);
            res.status(400).send([{message: error.message}]);
        }
    },

    async getUserNotification(req, res){
        try {
            const id = req.params.id;

            if(!id){
                return res.status(400).send({message: 'ID pas défini'})
            }

        return res.status(200).json([{notificationList: await Notification.getUserNotif(id) }]); 
        } catch (error) {
            return res.status(400).send([error]);
        }
            
    },
    
    async deleteNotif(req, res){
        try {
            const id = req.params.id;
            if(!id){
                return res.status(400).send({message: 'ID pas défini'})
            }
            
          const isNotifDeleted = await Notification.deleteNotif(id);

        return isNotifDeleted ? res.status(200).json(isNotifDeleted): res.send([]);
        } catch (error) {
            return res.status(400).send([error]);
        }
    },

    async deleteAllNotif(req, res){
        try {
            const id = req.params.id;
            if(!id){
                return res.status(400).send({message: 'ID pas défini'})
            }
            
          const isNotifDeleted = await Notification.deleteAllUserNotif(id);

        return isNotifDeleted ? res.status(200).json(isNotifDeleted): res.send([]);
        } catch (error) {
            return res.status(400).send([error]);
        }
    },

    async updateNotifValue(req, res){
        try {
            const idUser = req.params.id;
            const result = await User.setNewNotif(idUser, 0);

            return result ? res.status(200).json([{isDone: result}]): res.send([]); 

        } catch (error) {
            return res.status(400).send([error]);
        }
    }
}

module.exports = NotificationController