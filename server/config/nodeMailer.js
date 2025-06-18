import nodemailer from "nodemailer" 

//transporter
const transporter = nodemailer.createTransport({
    host : 'smtp-relay.brevo.com',
    port : 587,
    auth : {
        user : process.env.SMTP_User,
        pass : process.env.SMTP_PASSWORD
    }
});

export default transporter;