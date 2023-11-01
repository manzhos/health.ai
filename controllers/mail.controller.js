const nodemailer = require('nodemailer');
const DB = require('../db');
require('dotenv').config();
const { faker } = require('@faker-js/faker');

class MailController {
  async fakeMail(req, res){
    const subj = ['FB', 'Google Search', 'Instagram', 'Youtube', 'TikTok', 'Landing Botox', 'Botox_SaleAction March 2023'];
    const type = ['Leads', 'lead_1day', 'lead_3day', 'lead_7day', 'Welcome', 'Clients', 'Staff', 'Botox', 'Botox_SaleAction March 2023', 'Sculptra'];
    
    for(let k=0; k<200; k++){
      const s = Math.floor(Math.random() * subj.length)
      const t = Math.floor(Math.random() * type.length)
      const newMail = {
        'subject'   : subj[s],
        'body'      : faker.random.words(15),
        'type'      : type[t],
        'sendstate' : false,
        'senddate'  : faker.date.betweens('2023-02-20T00:00:00.000Z', '2023-04-05T00:00:00.000Z', 1)[0],
        'ts'        : faker.date.betweens('2023-02-20T00:00:00.000Z', '2023-03-05T00:00:00.000Z', 1)[0]
      }
  
      const sql = `
        INSERT INTO mails 
          (subject, body, type, sendstate, senddate, ts) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`;
      
      const nM = await DB.query(sql, [newMail.subject, newMail.body, newMail.type, newMail.sendstate, newMail.senddate, newMail.ts]);
      console.log('New Lead:', nM);
    }
    // res.status(200).json({lead: newLead});
    res.status(200).json({stat: 'OK'});    
  }

  async getMail(req, res){
    const mails = await DB.query(`
      SELECT * FROM mails
      WHERE NOT archive 
      ORDER BY ts DESC
    ;`, []);
    // console.log('mails:', mails);
    return res.send(mails.rows)
  }

  async createMail(req, res){
    let {subject, body, type, send_date, date, time, adressee} = req.body;
    const mailList = adressee.split(',');
    console.log('adressee:', typeof(mailList), mailList);
    const ts = new Date();
    if(!date && !send_date) return;
    let sd;
    if(!send_date){
      sd = date.split(' ');
      console.log('sd', sd);
      sd[4] = (time ? time : '00') + ':00';
      // console.log('date, time:', ts.join(' '));
    }
    const sendDate = send_date || new Date(sd.join(' '));
    console.log('sendDate:', sendDate);
    const sql = `
      INSERT INTO mails 
      (subject, body, type, senddate, adressee, ts) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const newMail = await DB.query(sql, [subject, body, type, sendDate, mailList, ts]);
    console.log('NEW MAIL:', newMail);
    res.send(newMail.rows[0]);
  }

  async addMail(mailTo, subject, body, type, senddate){
    // console.log('mailTo, subject, body, type, senddate:', mailTo, subject, body, type, senddate);
    const ts = new Date();
    const sql = `
      INSERT INTO mails 
      (subject, body, type, senddate, adressee, ts) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const newMail = await DB.query(sql, [subject, body, type, senddate, mailTo, ts]);
    // console.log('NEW MAIL:', newMail);
    return newMail.rows[0];
  }

  async updateMail(req, res){
    const id = req.params.id
    const {subject, body, type, senddate, adressee} = req.body;
    const mailList = adressee.split(',');
    // console.log('adressee:', typeof(mailList), mailList);

    const sql =`
      UPDATE mails SET
        subject   = $2,
        body      = $3,
        type      = $4,
        senddate  = $5,
        adressee  = $6
      WHERE id = $1;`
    await DB.query(sql, [id, subject, body, type, senddate, mailList]);
    
    res.send(true);
  }

  async deleteMail(req, res){
    const id = req.params.id
    // console.log('delete mail by ID:', id)
    const sql =`UPDATE mails SET archive = true WHERE id = $1;`    
    const mailDeleted = await DB.query(sql, [id])
    // console.log(`mail #${id} with SQL: ${sql}. `, mailDeleted)
    res.send(mailDeleted)    
  }

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
        to:       mailTo  || 'manzhos@gmail.com',
        subject:  subject || 'testmail',
        html:     `<div className="email" style="border: 0px solid white; padding: 20px; font-family: sans-serif;  line-height: 2; font-size: 16px;">
                    <h2>Hello</h2>
                    <p>${text || 'Welcome'}</p>
                    <p> </p>
                    <p>Sincerely your,<br/>Health.SY-way.com</p>
                  </div>`
      });
      // console.log('Send:', send);
      return send;
    }catch(err){ console.error(err)}
  }

  async sendMail(mailTo, subject, text){
    const transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    // console.log('transport:', transport);
    // console.log('mailTo, subject, text:', mailTo, subject, text);
    try{
      const send = await transport.sendMail({
        from:     process.env.MAIL_FROM,
        to:       mailTo  || 'manzhos@gmail.com',
        subject:  subject || 'Stunning You',
        html:     `<div className="email" style="border: 0px solid white; padding: 20px; font-family: sans-serif;  line-height: 2; font-size: 16px;">
                    <h2>Hello</h2>
                    <p>${text || 'Welcome'}</p>
                    <p>&nbsp;</p>
                    <p>Sincerely your,<br/>Health.SY-way.com</p>
                  </div>`
      });
      // console.log('Send:', send);
      return true;
    }catch(err){ console.error(err)}
  }

  async sendQueueMail(){
    const now = Date.now();
    // console.log('NOW:', now);
    // const queueStart  = Math.trunc(now / 1000 / 60) * 60 * 1000;
    const queueStart  = 207097200 * 1000;
    const queueEnd    = (Math.trunc(now / 1000 / 60) + 1) * 60 * 1000;
    // console.log('queueTime:', new Date(queueStart), new Date(queueEnd));

    const mailQueue = await DB.query(`
      SELECT * FROM mails
      WHERE NOT archive 
      AND NOT sendstate
      AND ROUND(extract(EPOCH FROM senddate)*1000, 0) BETWEEN $1 AND $2
    ;`, [queueStart, queueEnd]);

    // console.log('mailQueue:', mailQueue.rows);

    mailQueue.rows.map(async (mail) => {
      // console.log(mail);
      if(mail.adressee && (mail.subject || mail.body)){
        const res = await this.sendMail(mail.adressee.join(', '), mail.subject, mail.body);
        if(res) {
          const sql =`UPDATE mails SET sendstate = true WHERE id = $1;`
          await DB.query(sql, [mail.id]);
        }
      }
    });
  }
}

module.exports = new MailController()