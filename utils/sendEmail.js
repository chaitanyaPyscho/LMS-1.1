import nodemailer from 'nodemailer';

const sendEmail = async function (email, subject, message){
    let transporter = nodemailer.createTransport({
        host : process.env.SMTP_HOST,
        port : process.env.SMTP_HOST,
        secure : false,
        auth : {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: process.env.SMTP_FROM_MAIL,
        to: email,
        subject : subject,
        html: message,
    });
}
export default sendEmail;