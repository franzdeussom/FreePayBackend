const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

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
                const dailyGain = ((prix * Taux_Rendement) / 100);
                
    
                let gain  = 0;
                for (let index = 0; index <= (Math.abs(duree - checkDateResult.jourRestants)); index++) {
                   gain = gain + dailyGain;  
                }
                return  {newSole: Number.parseFloat(soldeUser)+gain, expireIn: checkDateResult.jourRestants, isStillValid: checkDateResult.isStillValid};
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
        const difference = SouscriptionDate.getTime() - dateExpire.getTime();
        const nbrJour = Math.abs(difference / (1000 * 3600 * 24));

        return {jourRestants: nbrJour, isStillValid: nbrJour >= 0 };
 }
  