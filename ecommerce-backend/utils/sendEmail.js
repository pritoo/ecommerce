const nodeMailer =require("nodemailer");

const sendEmail =async (options)=>{

    const transporter = nodeMailer.createTransport({
         host: process.env.SMPT_HOST,
         port:  process.env.SMPT_PORT,
        // secure: true,
         service: process.env.SMPT_SERVICE,
       // port: 2525,
        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD,
            //clientSecret: process.env.JWT_SECRET,
        },
    });
//console.log(transporter)
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