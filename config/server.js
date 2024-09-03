const express = require('express');
const cors = require('cors');
const routesUser = require('../routes/users')
const routesAdmin = require('../routes/admin')

const db = require('./db');
const denv = require('dotenv');

const app = express();

//activation des cors pour requetes de différents domaines
app.use(cors());
app.use(express.json());

denv.config();


const PORT = 3000;

app.use('/api', routesUser); //user's route
app.use('/api/admin', routesAdmin);


app.listen(PORT, ()=> {
    console.log('Serveur ecoute sur le port ' + PORT);
});

