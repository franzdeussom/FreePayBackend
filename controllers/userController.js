const express = require("express");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Pack = require("../models/Pack");
const helpers = require("../helpers/helpers");
const { validationResult } = require("express-validator");
const Souscription = require("../models/Souscription");
const Notification = require("../models/Notification");
const fs = require("fs");
const path = require("path");

const UserController = {
  async login(req, res) {
    try {
      const { Email, Mot_De_Passe } = req.body;
      let user = await User.findByEmail(
        isNaN(Email) ? Email : Number(Email),
        true
      );

      if (!user) {
        return res.send([]); //utilisateur introuvable.
      }

      const isPasswordValid = await User.comparePassword(
        Mot_De_Passe,
        user.Mot_De_Passe
      );

      if (!isPasswordValid) {
        return res.send([]); //mot de pass incorrect
      }

      //utilisateur connecté

      User.updateLastConnexionDate(
        helpers.getCurrentFormatedDate(),
        user.ID_Utilisateur
      ); //enregistrer la date de connexion

      const tmpUserSolde = Number(user.Solde_courant); //conserver le solde avant la verification des packs

      const token = helpers.generateJWT(
        { userId: user.ID_Utilisateur },
        "FreePay2024",
        36000
      ); //generation de son token

      const transaction = await Transaction.listUserTransaction(
        user.ID_Utilisateur
      ); //get all her transactions
      const pack = await Pack.userPackList(
        user.ID_Utilisateur,
        user.Solde_courant,
        user.derniere_connexion
      );

      var packs = pack.length > 0 ? pack[0] : [];

      if (pack.length > 0) {
        packs = pack[0];
        if (tmpUserSolde != packs.soldeUser) {
          //le solde a été ajutser, alors mettre à jour dans la base de donnée
          const resultUpdateSolde = await User.updateUserSolde(
            user.ID_Utilisateur,
            packs.soldeUser
          );
        }
        user.Solde_courant = packs.soldeUser ? packs.soldeUser : 0;
      }

      return res.json([
        { data: user, transaction: transaction, dataPacks: pack, token: token },
      ]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur", error: err });
    }
  },

  async signup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        Nom_Utilisateur,
        Prenom_Utilisateur,
        Date_Naissance,
        Email,
        Telephone,
        Mot_De_Passe,
        CodeInvitation,
      } = req.body;

      const welcomeBonus = 500;
      const welcomeText =
        "Suite à la création de votre compte, vous venez de gagner " +
        welcomeBonus +
        " XAF de bonus de bienvenue. Merci de nous avoir rejoint ! 🔥";

      const sendNotif = async (id) => {
        const result = await Notification.send({
          ID_Utilisateur: id,
          Contenu: welcomeText,
          Type_Notification: "Bienvenue",
          Date_Notification: helpers.getCurrentFormatedDate(),
          Lues: null,
        });
        let isPreventionSend;

        if (result) {
          isPreventionSend = await User.setNewNotif(id, 1);
        }
      };

      if (CodeInvitation) {
        //the user has set the id code, we need here to verify her email then the Invitation Code and get the owner ID
        const isUserWithEmail = await User.findByEmail(
          String(Email).toLowerCase(),
          false
        );
        const isUserWithPhone = await User.findByPhone(Telephone);

        if (!isUserWithEmail) {
          //email not found in database, we can continue and find the owner of the invitation Code
          if (!isUserWithPhone) {
            const isUserWithInvitationCode = await User.findByCodeParrainage(
              CodeInvitation
            );

            if (isUserWithInvitationCode.length > 0) {
              //invitation Code is correct, create the user

              const idParrain = String(
                isUserWithInvitationCode[0].ID_Utilisateur
              );

              //invitation code for the new user
              const length = Math.abs(6 - idParrain.length);

              const userCodeGenerated =
                (await User.generateRandomCode(length)) + idParrain;

              // save the user.
              const isUserCreaete = await User.save({
                Nom_Utilisateur: Nom_Utilisateur,
                Prenom_Utilisateur: Prenom_Utilisateur,
                Date_Naissance: Date_Naissance,
                Email: String(Email).toLowerCase(),
                Telephone: Telephone,
                Mot_De_Passe: Mot_De_Passe,
                code_parrainage: String(userCodeGenerated),
                new_notif: 0,
                derniere_connexion: null,
                Solde_courant: welcomeBonus,
                solde_commsion: 0,
                ID_Parrain: Number(idParrain),
                Role: "user",
              });

              if (isUserCreaete.length > 0) {
                sendNotif(isUserCreaete[0].insertID);

                return res.status(200).json([
                  {
                    isDone: true,
                    message:
                      "Merci de nous avoir rejoint, connectez-vous à votre compte, " +
                      Prenom_Utilisateur,
                  },
                ]);
              } else {
                //any errors on process
                return res.status(200).json([
                  {
                    isDone: false,
                    message:
                      "Une erreur est survenue lors de la création de votre compte. Ressayez plus tard !",
                  },
                ]);
              }
            } else {
              //user with the invitaion code doesn't found, when the user has submited an invitation code
              return res.status(200).json([
                {
                  isDone: false,
                  message:
                    "Aucun Utilisateur ne possède ce code d'invitation !",
                },
              ]);
            }
          } else {
            //error with the phone number, already used
            return res.status(200).json([
              {
                isDone: false,
                message:
                  "Ce numero de telephone est déjà en cours d'utilisation.",
              },
            ]);
          }
        } else {
          //error on the email
          return res.status(200).json([
            {
              isDone: false,
              message: "Un Utilisateur possède déjà cet email !",
            },
          ]);
        }
      } else {
        //no invitation code

        const isUserWithEmail = await User.findByEmail(
          String(Email).toLowerCase(),
          false
        ); //check the email if it's not already use.
        const isUserWithPhone = await User.findByPhone(Telephone); // check the phone number if...

        if (!isUserWithEmail) {
          //email available
          if (!isUserWithPhone) {
            //phone available

            let userCodeGenerated = 0;
            let isCodeUsed = true;

            do {
              userCodeGenerated = await User.generateRandomCode(6);
              isCodeUsed =
                (await User.findByCodeParrainage(userCodeGenerated).length) ==
                0;
            } while (isCodeUsed);

            const isUserCreaete = await User.save({
              Nom_Utilisateur: Nom_Utilisateur,
              Prenom_Utilisateur: Prenom_Utilisateur,
              Date_Naissance: Date_Naissance,
              Email: String(Email).toLowerCase(),
              Telephone: Telephone,
              Mot_De_Passe: Mot_De_Passe,
              code_parrainage: String(userCodeGenerated),
              new_notif: 0,
              derniere_connexion: null,
              Solde_courant: welcomeBonus,
              solde_commsion: 0,
              ID_Parrain: null,
              Role: "user",
            });

            if ([isUserCreaete].length > 0) {
              sendNotif(isUserCreaete[0].insertID);
              return res.status(200).json([
                {
                  isDone: true,
                  message:
                    "Merci de nous avoir rejoint, connectez-vous à votre compte, " +
                    Prenom_Utilisateur,
                },
              ]);
            } else {
              return res.status(200).json([
                {
                  isDone: false,
                  message:
                    "Une erreur est survenue lors de la création de votre compte. Ressayez plus tard !",
                },
              ]);
            }
          } else {
            //error with the phone number, aleready used
            return res.status(200).json([
              {
                isDone: false,
                message:
                  "Ce numero de telephone est déjà en cours d'utilisation.",
              },
            ]);
          }
        } else {
          //error on the email
          return res.status(200).json([
            {
              isDone: false,
              message: "Un Utilisateur possède déjà cet email !",
            },
          ]);
        }
      }
    } catch (error) {
      return res
        .status(400)
        .send({ error: "nous n'avons pas pu traiter votre requette" + error });
    }
  },

  async sendMail(req, res) {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ message: "Email pas fournie" });
    }

    // Trouver l'utilisateur par son email
    const user = await User.findByEmail(String(email).toLowerCase(), false);

    if (!user) {
      return res.status(402).json({ message: "Utilisateur introuvable" });
    }
    const resetToken = await User.generateRandomCode(7);

    const ismailSend = helpers.sendMail(
      email,
      resetToken,
      user.Prenom_Utilisateur
    );

    return ismailSend
      ? res.status(200).json([
          {
            message: "Email à été envoyé a votre adresse",
            code: resetToken - 237,
            iduser: user.ID_Utilisateur,
          },
        ])
      : res.status(400).send([]);
  },

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { ID_Utilisateur, newPassword } = req.body;
      const passewordHashed = await helpers.hashPassword(newPassword);

      const isDone = await User.updatePassword(ID_Utilisateur, passewordHashed);

      return isDone ? res.json({ isDone: isDone }) : res.send([]);
    } catch (error) {
      return res
        .status(400)
        .send([{ error: "erreur lors de l'execution  du changement!" }]);
    }
  },

  async delete(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).send(["bad request"]);
      }

      const result = await User.delete(id);
      return result ? res.status(200).json([{ isDone: result }]) : res.send([]);
    } catch (error) {
      console.log();
      return res.status(400).send([
        {
          error: "erreur lors de l'execution  de suppression! " + error.message,
        },
      ]);
    }
  },

  async getAllUser(req, res) {
    try {
      const offset = req.params.offset;

      const user = await User.all(Number(offset));
      const maxOffset = await User.countUser();

      return res.status(200).json([{ data: user, maxOffset: maxOffset }]);
    } catch (error) {
      return res
        .status(400)
        .send([{ message: "Erreur du serveur" + error.message }]);
    }
  },

  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        Nom_Utilisateur,
        Prenom_Utilisateur,
        Email,
        Telephone,
        ID_Utilisateur,
      } = req.body;
      const result = User.updateUser({
        Nom_Utilisateur: Nom_Utilisateur,
        Prenom_Utilisateur: Prenom_Utilisateur,
        Email: Email,
        Telephone: Telephone,
        ID_Utilisateur: ID_Utilisateur,
      });
      return result ? res.status(200).json([{ IsDone: true }]) : res.send([]);
    } catch (error) {
      return res.status(400).send({
        error:
          "erreur lors de l'execution  de la mise à jour ! " + error.message,
      });
    }
  },

  //(Get) admin endpoint
  async userTransactionAndSouscription(req, res) {
    try {
      const id = req.params.id;

      return res.status(200).json([
        {
          transactionList: await Transaction.listUserTransaction(id),
          souscriptionList: await Souscription.getUserSouscription(id),
          maxOffset: await Transaction.countUserTransaction(id),
        },
      ]);
    } catch (error) {
      return res
        .status(400)
        .send({ error: "erreur lors de l'execution  ! " + error.message });
    }
  },

  async changeUserRule(req, res) {
    try {
      const { id, role } = req.body;
      const idadmin = req.params.idadmin;

      if (idadmin != 1) {
        return res
          .status(400)
          .send({ message: "Erreur lors du traitement de données!" });
      }

      if (!id && !role) {
        return res
          .status(400)
          .send({ message: "Erreur lors du traitement de données!" });
      }

      const isDone = await User.changeUserRule(id, role);

      return isDone ? res.status(200).json([{ isDone: isDone }]) : res.send([]);
    } catch (error) {
      return res.status(400).send({
        error:
          "erreur lors de l'execution  de la mise à jour ! " + error.message,
      });
    }
  },

  async homerefresh(req, res) {
    try {
      const idUser = req.params.id;

      if (!idUser) {
        return res
          .status(400)
          .send({ error: " lors de l'execution d'actualisation !" });
      }

      const user = await User.findByID(idUser);
      const transaction = await Transaction.listUserTransaction(idUser); //get all her transactions

      return res.json([{ data: user, transaction: transaction }]);
    } catch (error) {
      return res.status(400).send({
        error: "erreur lors de l'execution d'actualisation ! " + error.message,
      });
    }
  },

  //@desc : change text option
  // @route : PATCH /woocoin
  // access private
  async wocoin(req, res) {
    const filePath = path.resolve(__dirname, "./files/data.json"); //chemin fichier

    try {
      let { textChange } = req.body;
      const fileData = fs.readFileSync(filePath, "utf-8"); //lecture du fichier
      const jsonData = JSON.parse(fileData); //convertir en objet json
      if (!textChange) {
        textChange = jsonData.textChange;
      }
      jsonData.textChange = textChange;
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8"); //sauvegarder le fichier

      res.status(200).json({ textChange: jsonData.textChange });
    } catch (error) {
      res.status(404).json({ error: "something wrong" });
      console.log(error);
    }
  },

  //@desc change datas concerning whatsapp
  //@route PATCH /whatsappDatas
  //@ access private
  async getWhatsappData(req, res) {
    const filepath = path.resolve(__dirname, "./files/data.json");

    try {
      let { text, tel, mail } = req.body;
      const fileData = fs.readFileSync(filepath, "utf-8");
      const jsonData = JSON.parse(fileData);
      if (!text) {
        text = jsonData.text;
      }
      if (!tel) {
        tel = jsonData.tel;
      }
      if (!mail) {
        mail = jsonData.mail;
      }

      jsonData.text = text;
      jsonData.tel = tel;
      jsonData.mail = mail;
      fs.writeFileSync(filepath, JSON.stringify(jsonData, null, 2), "utf-8");

      res
        .status(200)
        .json({ text: jsonData.text, tel: jsonData.tel, mail: jsonData.mail });
    } catch (error) {
      res.status(404).json({ error: "something wrong !!" });
    }
  },
};

module.exports = UserController;
