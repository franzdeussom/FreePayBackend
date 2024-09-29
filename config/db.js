const mysql = require('mysql2');
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'FREEPAY'
    }
);
db.connect((err)=> {
        if(err){
            console.error('Erreur de connexion a la base de données:', err);
            return;
        } 
        console.log('Connexion etablie avec la bd.'); 
});

module.exports = db;

