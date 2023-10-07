const nodemailer = require('nodemailer');

const sendEmail =async  options =>{
    //1> create transporter
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            password: process.env.EMAIL_PASSWORD

        }
        //Activate in gmail "less secure app options "
    })
    //2> define the email options 

    const mailOptions = {
        from:'Siddharth Gupta <Sidd@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message
        //html:
    }


    //3> Actually send the email 
     await transporter.sendMail(mailOptions);

}

module.exports=sendEmail;