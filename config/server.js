const express = require('express');
const cors = require('cors');
const routes = require('../routes/users')
const db = require('./db');
const denv = require('dotenv');

const app = express();

//activation des cors pour requetes de différents domaines
app.use(cors());
app.use(express.json());

denv.config();


const PORT = 3000;

app.use('/api', routes);

app.listen(PORT, ()=> {
    console.log('Serveur ecoute sur le port ' + PORT);
});

