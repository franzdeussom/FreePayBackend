
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Importer la connexion à la base de données

// Définition de la classe User
class User {

  constructor(
    ID_Utilisateur,
    Nom_Utilisateur,
    Prenom_Utilisateur,
    Date_Naissance,
    Email,
    Telephone,
    Mot_De_Passe,
    Solde_courant,
    solde_commsion,
    Role,
    ID_Parrain,
    code_parrainage,
  ) {
    this.ID_Utilisateur = ID_Utilisateur;
    this.Nom_Utilisateur = Nom_Utilisateur;
    this.Prenom_Utilisateur = Prenom_Utilisateur;
    this.Date_Naissance = Date_Naissance;
    this.Email = Email;
    this.Telephone = Telephone;
    this.Mot_De_Passe = Mot_De_Passe;
    this.Solde_courant = Solde_courant;
    this.solde_commsion = solde_commsion;
    this.Role = Role;
    this.ID_Parrain = ID_Parrain;
    this.code_parrainage = code_parrainage;
  }

  // Méthodes d'instance

  static async save(user) {
    try {
      // Hacher le mot de passe avant de l'enregistrer
      const Mot_De_Passe = await bcrypt.hash(user.Mot_De_Passe, 10);

      // Enregistrer l'utilisateur dans la base de données
      const [rows] = await db.promise().query(
        'INSERT INTO utilisateurs SET ?',
        Mot_De_Passe
      );

      if (rows.affectedRows === 1) {
        return true; // Insertio réussie
      } else {
        return false; // Échec de l'insertion
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async updatePassword(id, password){
      try {
        const [rows] = await db.promise().query(
          'UPDATE utilisateurs SET Mot_De_Passe = ? WHERE ID_utilisateur = ?',
          [password, id]
        );

        if (rows.affectedRows === 1) {
          return true; // Insertio réussie
        } else {
          return false; // Échec de l'insertion
        }
      } catch (error) {
        
      }
  }

  async update() {
    try {
      // Mettre à jour l'utilisateur dans la base de données
      const [rows] = await db.promise().query(
        'UPDATE utilisateurs SET ? WHERE ID_Utilisateur = ?',
        [this, this.ID_Utilisateur]
      );

      if (rows.affectedRows === 1) {
        return true; // Mise à jour réussie
      } else {
        return false; // Échec de la mise à jour
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete() {
    try {
      const [rows] = await db.promise().query(
        'DELETE FROM utilisateurs WHERE ID_Utilisateur = ?',
        [this.ID_Utilisateur]
      );

      if (rows.affectedRows === 1) {
        return true; // Suppression réussie
      } else {
        return false; // Échec de la suppression
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

 static async comparePassword(password, passewordHashed) {
   return await bcrypt.compare(password, passewordHashed); // Compare le mot de passe avec le hachage
    //return password == passewordHashed;
  }

  
// Fonction pour rechercher un utilisateur par son code de parrainage
static async findByCodeParrainage(codeParrainage) {
  try {
    const [rows] = await db.promise().query('SELECT * FROM utilisateurs WHERE code_parrainage = ?', [codeParrainage]);
    return rows.length > 0 ? rows[0] : null; // Renvoyer l'utilisateur si trouvé, sinon null
  } catch (error) {
    console.error('Erreur:', error);
    throw error; 
  }
};

  // Méthodes statiques pour interagir avec la base de données

  static async findByEmail(email) {
    try {
      const [rows] = await db.promise().query(
        'SELECT * FROM utilisateurs WHERE Email = ?',
        [email]
      );
      if (rows.length > 0) {
        // Créer un nouvel objet User à partir des données de la base de données
        return new User(
          rows[0].ID_Utilisateur,
          rows[0].Nom_Utilisateur,
          rows[0].Prenom_Utilisateur,
          rows[0].Date_Naissance,
          rows[0].Email,
          rows[0].Telephone,
          rows[0].Mot_De_Passe,
          rows[0].Solde_courant,
          rows[0].solde_commsion,
          rows[0].Role,
          rows[0].ID_Parrain,
          rows[0].code_parrainage
        );
      } else {
        return null; // Renvoie null si non trouvé
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM utilisateurs WHERE ID_Utilisateur = ?',
        [id]
      );
      if (rows.length > 0) {
        // Créer un nouvel objet User à partir des données de la base de données
        return new User(
          rows[0].ID_Utilisateur,
          rows[0].Nom_Utilisateur,
          rows[0].Prenom_Utilisateur,
          rows[0].Date_Naissance,
          rows[0].Email,
          rows[0].Telephone,
          rows[0].Mot_De_Passe,
          rows[0].Solde_courant,
          rows[0].solde_commsion,
          rows[0].Role,
          rows[0].ID_Parrain,
          rows[0].code_parrainage
        );
      } else {
        return []; // Renvoie null si non trouvé
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findByResetPasswordToken(ResetPasswordToken)  {
    try {
      const [rows] = await db.query(
        'SELECT * FROM utilisateurs WHERE ResetPasswordToken = ?',
        [ResetPasswordToken]
      );
      if (rows.length > 0) {
        // Créer un nouvel objet User à partir des données de la base de données
        return new User(
          rows[0].ID_Utilisateur,
          rows[0].Nom_Utilisateur,
          rows[0].Prenom_Utilisateur,
          rows[0].Date_Naissance,
          rows[0].Email,
          rows[0].Telephone,
          rows[0].Mot_De_Passe,
          rows[0].Solde_courant,
          rows[0].solde_commsion,
          rows[0].Role,
          rows[0].ID_Parrain,
          rows[0].code_parrainage
        );
      } else {
        return null; // Renvoie null si non trouvé
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async generateRandomCode(length) {
    const characters = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}

module.exports = User;