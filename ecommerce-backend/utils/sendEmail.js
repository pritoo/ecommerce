const nodeMailer =require("nodemailer");

const sendEmail =async (options)=>{

    const transporter = nodeMailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth:{
            user:"5684cea6e95354",
            pass:"7a1c89f78cc6ab"
        },
    });
console.log(transporter)
    const mailOptions ={
        from:process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    }
console.log(mailOptions)
    await transporter.sendMail(mailOptions)
}

module.exports=sendEmail;