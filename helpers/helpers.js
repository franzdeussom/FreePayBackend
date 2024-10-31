const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
//const fs = require('fs');

exports.generateJWT = (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, { expiresIn }); // Générer un token JWT
};

exports.sendMail =  async (email, code, username) =>{
    let isMailSend = false;
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'freepay.online.service@gmail.com',
            pass: 'kyuh abvn spro olpk'
        }
    });

    const mailOptions = {
        from : 'freepay.online.service@gmail.com',
        to : email,
        mimeType: 'text/html',
        subject: 'Code de Recupération',
        html: `<p>Bonjour ${username},</p><p>Vous avez demandé à réinitialiser votre mot de passe.</p> <p>Votre code de rénitialisation : ${code} </p> <p>Veuillez prendre en compte que ce code expire en 90 secondes.</p> <br>Merci ! <br>FreePay, La direction.`
    };
    transporter.sendMail(mailOptions, (error, info)=>{
        if(!error){
            isMailSend = true;

        }else{
            isMailSend = false;
        }
    });

    return isMailSend;
};
 
exports.hashPassword = async (password)=> {
        const saltRounds = 10; // Ajustez le nombre de rounds en fonction de vos besoins de sécurité
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
 }

 exports.getCurrentFormatedDate = ()=>{
        const year = new Date().getFullYear();
        let months = new Date().getMonth() + 1;
        let day = new Date().getDate();
        if(day < 10){
            day = '0'+day;
        }
        if(months < 10){
            months = '0'+months;
        }
        return ''+day+'.'+months+'.'+year;
 }

exports.getDateSplited = (date)=>{
        const Date = String(date).split('.');
        const Year = Number.parseInt(currentDate[2]);
        const Months = Number.parseInt(currentDate[1]);
        const Day = Number.parseInt(currentDate[0]);

        return Year+"-"+Months+"-"+Day;
 }

 exports.calculateGain = (dateSouscription, duree, Taux_Rendement, prix, soldeUser, derniere_connexion) =>{
    const checkDateResult = this.getRestantDayOfPack(dateSouscription, duree);

        if(derniere_connexion != this.getCurrentFormatedDate()){

            if(checkDateResult.isStillValid){
                const jourSansConnexion = this.getRestantDayOfPack(derniere_connexion, 0).jourRestants; //nombre de jour que l'utilisateur a fait sans se connecter

                if( jourSansConnexion > 0 ){
                    //au
                    const dailyGain = ((prix * Taux_Rendement) / 100) * jourSansConnexion;
                    return  {newSole: Number.parseFloat(soldeUser)+dailyGain, expireIn: checkDateResult.jourRestants, isStillValid: checkDateResult.isStillValid};
                }
                
                const dailyGain = ((prix * Taux_Rendement) / 100);
                
    
                return  {newSole: Number.parseFloat(soldeUser)+dailyGain, expireIn: checkDateResult.jourRestants, isStillValid: checkDateResult.isStillValid};
            }else{
                //pack expiré mais utilisateur possède des jours sans conenxion, auxquels le revenu de son pack doit etre payer

                const jourSansConnexion = this.getRestantDayOfPack(derniere_connexion, 0).jourRestants; //nombre de jour que l'utilisateur a fait sans se connecter
                
                if( jourSansConnexion > 0){
                    const dailyGain = ((prix * Taux_Rendement) / 100) * jourSansConnexion;
                    return  {newSole: Number.parseFloat(soldeUser)+dailyGain, expireIn: checkDateResult.jourRestants, isStillValid: checkDateResult.isStillValid};
                }
            }    
        }
       
    return {newSole: Number.parseFloat(soldeUser), expireIn: checkDateResult.jourRestants, isStillValid: checkDateResult.isStillValid};
} 

exports.getPackExpireDate = (souscripionDate, duree)=>{
        const [jour, mois, annee] = String(souscripionDate).split('.').map(Number);
        const date = new Date(annee, mois -1, jour);
        date.setDate(date.getDate() + duree);
        let jourExpiration = date.getDate();
        let moisExpiration = date.getMonth()+1;
        const anneeExpiration = date.getFullYear();
        if(moisExpiration < 10){
            moisExpiration = '0'+moisExpiration;
        }
        if(jourExpiration < 10){
            jourExpiration = '0'+jourExpiration;
        }

        return ''+jourExpiration+'.'+moisExpiration+'.'+anneeExpiration;
}

 exports.getRestantDayOfPack = (dateSouscription, duree)=>{
        const [jourSouscription, moisSouscription, anneeSouscription] = String(this.getCurrentFormatedDate()).split('.').map(Number);
        const [jour, mois, annee] = this.getPackExpireDate(dateSouscription, duree).split('.').map(Number);

        const SouscriptionDate = new Date(anneeSouscription, moisSouscription-1, jourSouscription);
        const dateExpire = new Date(annee, mois-1, jour);
        const difference =dateExpire.getTime() - SouscriptionDate.getTime();
        const nbrJour = difference / (1000 * 3600 * 24);

        return {jourRestants: duree > 0 ? nbrJour: Math.abs(nbrJour), isStillValid: nbrJour >= 0 };
 }

 /*exports.writeFile = ()=>{
    try{
        fs.writeFileSync("whatsapp.txt", "698403201-654229770");
        console.log('Fichier creer');
    }catch(err){
        console.log(err);
    }
    
 }

 exports.getFile = ()=>{
    const data = fs.readFileSync('whatsapp.txt', 'utf8');
    console.log('data read', data);
 }*/
  