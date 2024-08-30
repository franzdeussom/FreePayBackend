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
            user: 'franzdeussom111@gmail.com',
            pass: 'pdea vpri nfhh scjg'
        }
    });

    const mailOptions = {
        from : 'franzdeussom111@gmail.com',
        to : email,
        mimeType: 'text/html',
        subject: 'Code de Recupération',
        html: `<p>Bonjour ${username},</p><p>Vous avez demandé à réinitialiser votre mot de passe.</p> <p>Votre code de rénitialisation : ${code} </p> <p>Veuillez prendre en compte que ce code expire en 60 secondes.</p> <br>Merci ! <br>La Direction.`
    };
    transporter.sendMail(mailOptions, (error, info)=>{
        if(!error){
            isMailSend = true;
            console.log('ismail send', isMailSend);

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
  