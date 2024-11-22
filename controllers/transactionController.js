const { validationResult } = require("express-validator");
const Transaction = require("../models/Transaction");
const helepers = require("../helpers/helpers");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

const TransactionController = {
  async save(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { Type_Transaction, Montant, ID_Utilisateur, mobileTransactionID } =
        req.body;

      if (Type_Transaction == "Dépot") {
        if (!mobileTransactionID) {
          return res
            .status(400)
            .send({ message: "Id de transaction mobile est obligatoire." });
        }
        if (
          !(await Transaction.isMobileIDTranscationValid(mobileTransactionID))
        ) {
          return res
            .status(402)
            .send({ message: "Echec ID Transaction Mobile" });
        }
      }

      if (Type_Transaction == "Retrait") {
        const resp = await User.updateUserSoldeReduice(ID_Utilisateur, Montant);
      }

      const result = await Transaction.save(
        {
          Date_Transaction: helepers.getCurrentFormatedDate(),
          Type_Transaction: Type_Transaction,
          Montant: Montant,
          Mode_Paiement: "Porte de feuille Mobile",
          ID_Pack: null,
          ID_Utilisateur: ID_Utilisateur,
          Statut_Transaction: "Traitement en cours...",
        },
        mobileTransactionID
      );

      return res.status(200).json([result]);
    } catch (error) {
      console.log(error);
      return res.status(400).json([{ message: error.message }]);
    }
  },

  async getMyTransactionList(req, res) {
    try {
      const offset = req.params.offset;
      const idUser = req.params.id;

      if (!idUser || !offset) {
        return res
          .status(400)
          .send({ message: "id and offset doesn't set", params: req.params });
      }

      const transactionList = await Transaction.getMyTransactionList(
        Number(idUser),
        Number(offset)
      );
      const maxOffset = await Transaction.countUserTransaction(idUser);

      return res
        .status(200)
        .send([{ list: transactionList, maxOffset: maxOffset }]);
    } catch (error) {
      return res.status(400).json([{ message: error.message }]);
    }
  },

  async getDepotRequest(req, res) {
    try {
      const result = await Transaction.getDepotRequest();

      return res.status(200).json([{ depotRequestList: result }]);
    } catch (error) {
      console.log(error);
      return res.status(400).json([{ message: error.message }]);
    }
  },

  async getRetraitRequest(req, res) {
    //Obtnir les demande de retrait
    try {
      const result = await Transaction.getRetraitRequest();

      return res.status(200).json([{ retraitRequestList: result }]);
    } catch (error) {
      console.log(error);
      return res.status(400).json([{ message: error.message }]);
    }
  },

  async updateRetraitState(req, res) {
    //Redefinir le statut des demandes de retrait: approuver
    try {
      const { idTransaction, status, idUser, montant } = req.body;
      if (!idTransaction) {
        return res.status(400).json([{ message: "ID non defini" }]);
      }
      const result = await Transaction.updateRetraitState(
        idTransaction,
        status,
        idUser,
        montant
      );
      if (result) {
        isPreventionSend = await User.setNewNotif(idUser, 1);
      }

      return result ? res.status(200).json([{ isDone: result }]) : res.send([]);
    } catch (error) {
      console.log(error);
      return res.status(400).json([{ message: error.message }]);
    }
  },

  async updateDepotState(req, res) {
    //Redefinir le statut des demandes de depot: approuvée
    try {
      const { idTransaction, idUser, montant } = req.body;
      if (!idTransaction) {
        return res.status(400).json([{ message: "ID non defini" }]);
      }
      const result = await Transaction.updateDepotState(
        idTransaction,
        idUser,
        montant
      );
      if (result) {
        isPreventionSend = await User.setNewNotif(idUser, 1);
      }

      return result ? res.status(200).json([{ isDone: result }]) : res.send([]);
    } catch (error) {
      return res.status(400).json([{ message: error.message }]);
    }
  },

  async getTotalAmount(req, res) {
    //Obtenir les revenue total encaissés
    try {
      const result = await Transaction.getAllDepot();
      const retraitResult = await Transaction.getAllRetrait();

      return res
        .status(200)
        .json([{ total: result, totalRetrait: retraitResult }]);
    } catch (error) {
      return res.status(400).json([{ message: error.message }]);
    }
  },

  //@desc GET all informations that can change
  //@route GET /allInformations
  //@access private
  async getTransactionOptiion(req, res) {
    const filepath = path.resolve(__dirname, "./files/data.json");
    const fileData = fs.readFileSync(filepath, "utf-8");
    const jsonData = JSON.parse(fileData);

    try {
      const options = {
        retrait: {
          minRetrait: jsonData.minRetrait,
          tax: jsonData.tax,
          applyTax: jsonData.applyTax,
          textRetrait: jsonData.textRetrait,
        },
        depot: {
          orange: jsonData.orange,
          MTN: jsonData.MTN,
          verify: jsonData.verify,
          minDepot: jsonData.minDepot,
          OrangeTransactionIDLength: jsonData.OrangeTransactionIDLength,
          MTNTransactionIDLength: jsonData.MTNTransactionIDLength,
          pays: jsonData.pays,
          info: jsonData.info,
        },
      };

      return res.status(200).json({ options: options });
    } catch (error) {
      res.status(404).json({ error: error });
    }
  },

  //@desc update all informations that can change
  //@route PATCH /allInformations
  //@access private
  async updateTransactionOptiion(req, res) {
    const filepath = path.resolve(__dirname, "./files/data.json");
    const fileData = fs.readFileSync(filepath, "utf-8");
    const jsonData = JSON.parse(fileData);
    let {
      textWhatsapp,
      mail,
      tel,
      textChange,
      minRetrait,
      tax,
      applyTax,
      textRetrait,
      orange,
      MTN,
      verify,
      minDepot,
      OrangeTransactionIDLength,
      MTNTransactionIDLength,
      pays,
      info,
      infoPack,
      htmlSalutation,
      htmlSalutation2,
      htmlSalutation3,
    } = req.body;

    if (!textWhatsapp) {
      textWhatsapp = jsonData.textWhatsapp;
    }

    if (!htmlSalutation) {
      htmlSalutation = jsonData.htmlSalutation;
    }

    if (!htmlSalutation2) {
      htmlSalutation2 = jsonData.htmlSalutation2;
    }
    if (!htmlSalutation3) {
      htmlSalutation3 = jsonData.htmlSalutation3;
    }

    if (!tel) {
      tel = jsonData.tel;
    }

    if (!textChange) {
      textChange = jsonData.textChange;
    }

    if (!mail) {
      mail = jsonData.mail;
    }

    if (!minRetrait) {
      minRetrait = jsonData.minRetrait;
    }

    if (!tax) {
      tax = jsonData.tax;
    }

    if (!applyTax) {
      applyTax = jsonData.applyTax;
    }

    if (!textRetrait) {
      textRetrait = jsonData.textRetrait;
    }

    if (!orange) {
      orange = jsonData.orange;
    }

    if (!MTN) {
      orange = jsonData.MTN;
    }

    if (!verify) {
      verify = jsonData.verify;
    }

    if (!minDepot) {
      minDepot = jsonData.minDepot;
    }

    if (!OrangeTransactionIDLength) {
      OrangeTransactionIDLength = jsonData.OrangeTransactionIDLength;
    }

    if (!MTNTransactionIDLength) {
      MTNTransactionIDLength = jsonData.MTNTransactionIDLength;
    }

    if (!pays) {
      pays = jsonData.pays;
    }

    if (!info) {
      info = jsonData.info;
    }

    if (!infoPack) {
      infoPack = jsonData.infoPack;
    }

    jsonData.htmlSalutation = htmlSalutation;
    jsonData.htmlSalutation2 = htmlSalutation2;
    jsonData.htmlSalutation3 = htmlSalutation3;
    jsonData.textWhatsapp = textWhatsapp;
    jsonData.tel = tel;
    jsonData.mail = mail;
    jsonData.minRetrait = minRetrait;
    jsonData.textChange = textChange;
    jsonData.tax = tax;
    jsonData.applyTax = applyTax;
    jsonData.textRetrait = textRetrait;
    jsonData.orange = orange;
    jsonData.MTN = MTN;
    jsonData.verify = verify;
    jsonData.minDepot = minDepot;
    jsonData.OrangeTransactionIDLength = OrangeTransactionIDLength;
    jsonData.MTNTransactionIDLength = MTNTransactionIDLength;
    jsonData.pays = pays;
    jsonData.info = info;
    jsonData.infoPack = infoPack;

    fs.writeFileSync(filepath, JSON.stringify(jsonData, null, 2), "utf-8");
    const options = {
      whatsapp: {
        textWhatsapp: jsonData.textWhatsapp,
        tel: jsonData.tel,
        mail: jsonData.mail,
      },
      woocoin: {
        textChange: jsonData.textChange,
      },
      retrait: {
        minRetrait: jsonData.minRetrait,
        tax: jsonData.tax,
        applyTax: jsonData.applyTax,
        textRetrait: jsonData.textRetrait,
      },
      depot: {
        orange: jsonData.orange,
        MTN: jsonData.MTN,
        verify: jsonData.verify,
        minDepot: jsonData.minDepot,
        OrangeTransactionIDLength: jsonData.OrangeTransactionIDLength,
        MTNTransactionIDLength: jsonData.MTNTransactionIDLength,
        pays: jsonData.pays,
        info: jsonData.info,
      },
      pack: {
        infoPack: jsonData.infoPack,
      },
      salutation: {
        htmlSalutation: jsonData.htmlSalutation,
        htmlSalutation2: jsonData.htmlSalutation2,
        htmlSalutation3: jsonData.htmlSalutation3,
      },
    };

    return res.status(200).json({ options: options });
  },

  async echecsTransact(req, res) {
    try {
      const { idTransaction, status, idUser, montant } = req.body;
      if (!idTransaction) {
        return res.status(400).json([{ message: "ID non defini" }]);
      }

      const result = await Transaction.updateRetratState(
        idTransaction,
        status,
        idUser,
        montant
      );
      if (result) {
        isPreventionSend = await User.setNewNotif(idUser, 1);
      }

      return result ? res.status(200).json([{ isDone: result }]) : res.send([]);
    } catch (error) {
      return res.status(400).json([{ message: error.message }]);
    }
  },

  async echecDepotTransaction(req, res) {
    try {
      const { idTransaction, idUser } = req.body;
      if (!idTransaction) {
        return res.status(400).json([{ message: "ID non defini" }]);
      }

      const result = await Transaction.setTransactAsFailed(
        idTransaction,
        idUser
      );
      if (result) {
        isPreventionSend = await User.setNewNotif(idUser, 1);
      }

      return result ? res.status(200).json([{ isDone: result }]) : res.send([]);
    } catch (error) {
      console.log(error);
      return res.status(400).json([{ message: error.message }]);
    }
  },
};

module.exports = TransactionController;
