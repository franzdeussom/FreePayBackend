const express = require("express");
const packController = require("../controllers/packController");
const userController = require("../controllers/userController");
const transactionController = require("../controllers/transactionController");
const NotificationController = require("../controllers/notificationController");
const publicationController = require("../controllers/publicationController");

const {
  createPacksValidationRules,
  updateDepotState,
  createPublicationValidationRules,
  updateRetraitState,
  notificationValidationRules,
  UpdatePacksValidationRules,
} = require("../middleware/validation"); // Importe les règles
const authToken = require("../middleware/authMiddleware");
const router = express.Router();

//admin route

router.post(
  "/pack/",
  authToken,
  createPacksValidationRules(),
  packController.create
);

router.put(
  "/pack",
  authToken,
  UpdatePacksValidationRules(),
  packController.update
);

router.delete("/pack/:id", authToken, packController.deletePack);
router.patch("/allPacks", authToken, packController.getAllPack);

router.delete("/users/:id", authToken, userController.delete);

router.get("/users/:offset", authToken, userController.getAllUser);

router.get("/woocoin", authToken, userController.wocoin);

router.get("/whatsappDatas", authToken, userController.getWhatsappData);

//allInformations
router.get(
  "/allInformations",
  authToken,
  transactionController.getTransactionOptiion
);
router.patch(
  "/allInformations",
  transactionController.updateTransactionOptiion
);

router.post(
  "/notification",
  authToken,
  notificationValidationRules(),
  NotificationController.send
);

router.get(
  "/transaction-souscription/:id",
  authToken,
  userController.userTransactionAndSouscription
);

router.post(
  "/transaction-echecs",
  authToken,
  transactionController.echecsTransact
);

router.post(
  "/transaction-depot-echec",
  authToken,
  transactionController.echecDepotTransaction
);

router.get("/my-pub/:id", authToken, publicationController.getMyPub);

router.put(
  "/publication",
  authToken,
  createPublicationValidationRules(),
  publicationController.update
);

router.delete("/publication/:id", authToken, publicationController.delete);

router.post(
  "/publication",
  authToken,
  createPublicationValidationRules(),
  publicationController.create
);

router.put(
  "/transaction-state",
  authToken,
  updateRetraitState(),
  transactionController.updateRetraitState
);

router.get(
  "/transaction-total",
  authToken,
  transactionController.getTotalAmount
);

router.get(
  "/transaction-request",
  authToken,
  transactionController.getRetraitRequest
);

router.get(
  "/transaction-depot",
  authToken,
  transactionController.getDepotRequest
);

router.put(
  "/transaction-depot",
  authToken,
  updateDepotState(),
  transactionController.updateDepotState
);

router.put("/user-rule/:idadmin", authToken, userController.changeUserRule);

router.get(
  "/list-transactions/:id/:offset",
  authToken,
  transactionController.getMyTransactionList
);

module.exports = router;
