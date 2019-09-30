const nodemailer = require('nodemailer')
const config = require('../config.json')

//mailer configuration
const transporter = nodemailer.createTransport({
    service: config.mailer.service,
    auth: {
      user: config.mailer.user,
      pass: config.mailer.password
    }, tls: {
      rejectUnauthorized: false
    }
});

  //mailer message parameters
let MailerOptions = {
    from: '"'+config.mailer.sender+'" <'+config.mailer.user+'>',
    to: config.mailer.receiver,
    subject: 'Les profs ont besoins d\'aide !',
    text: 'test of mailer',
    html: ''
}

const mailer = {
    send: function(user, category, description, email) {
        MailerOptions.text = "utilisateur: "+user+"\ncatégorie: "+category+"\ndéscription: "+description
        MailerOptions.html = '<div style="width: 300px; height: 400px; border: 5px solid rgb(49, 49, 49); padding: 10px;"><h1 style="text-align: center; padding-top: 20px;">'+user+' a besoin d\'aide</h1><p style="text-align: center;">user: '+user+'<br>category: '+category+'<br>description: '+description+'<br>mail: '+email+'</p></div>'
        transporter.sendMail(MailerOptions)
    }
}

module.exports = mailer
