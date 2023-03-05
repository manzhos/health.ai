const nodemailer = require('nodemailer');
require('dotenv').config();

class MailController {
  async _sendMail(req, res){
    const transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    // console.log('transport:', transport);
    const {text, mailTo, subject} = req.body;
    // console.log('text, mailTo, subject:', text, mailTo, subject);

    try{
      const send = await transport.sendMail({
        from:     process.env.MAIL_FROM,
        to:       mailTo || 'manzhos@gmail.com',
        subject:  subject || 'testmail',
        html:     `<div className="email" style="border: 0px solid white; padding: 20px; font-family: sans-serif;  line-height: 2; font-size: 16px;">
                    <h2>Hello</h2>
                    <p>${text || 'Welcome'}</p>
                    <p>&nbsp</p>
                    <p>Sincerely your,<br/>Health.SY-way.com</p>
                  </div>`
      });
      console.log('Send:', send);
      return send;
    }catch(err){ console.error(err)}
  }
}

module.exports = new MailController()