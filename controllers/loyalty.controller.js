const DB = require('../db');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const { isFakeDomainOnline, isFakeEmailOnline } = require('fakefilter');
const { faker } = require('@faker-js/faker');
const cron = require('node-cron');
const mailController = require('./mail.controller');
const API_URL  = process.env.API_URL;

class LoyaltyController {  
  async createLoyalty(req, res){  
    // "id" SERIAL4 PRIMARY KEY,
    // "client_id" INT4,
    // "invoice_id" INT2,
    // "ref" BOOLEAN DEFAULT false,
    // "ref_id" INT4,
    // "multiply" INT2 DEFAULT 1,
    // "points" INT4,
    // "ts" TIMESTAMPTZ
    const {client_id, invoice_id, ref, ref_id, multiply, points} = req.body;
    const ts = new Date();
    // console.log('client_id, invoice_id, ref, ref_id, multiply, points, ts:\n', client_id, invoice_id, ref, ref_id, multiply, points, ts);
    const sql = 'INSERT INTO loyalty (client_id, invoice_id, ref, ref_id, multiply, points, ts) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const newLoyalty = await DB.query(sql, [client_id, invoice_id, ref, ref_id, multiply, points, ts]);
    // console.log('newLoyalty:', newLoyalty);
    res.send(newLoyalty.rows[0]);
  }

  async seedFakeLead(req, res) {

    const source = ['FB', 'Google Search', 'Instagram', 'Youtube', 'TikTok', 'Landing Botox', 'Botox_SaleAction March 2023'];
    
    for(let k=0; k<200; k++){
      const i = Math.floor(Math.random() * source.length)
      const newLead = {
        'firstname' : faker.name.firstName(),
        'lastname'  : faker.name.lastName(),
        'email'    : faker.internet.email(),
        'phone'     : faker.phone.number(),
        'source'    : source[i],
        'ts'        : faker.date.betweens('2023-02-20T00:00:00.000Z', '2023-03-02T00:00:00.000Z', 1)[0]
      }
  
      const sql = `
        INSERT INTO leads 
          (firstname, lastname, email, phone, source, ts, archive) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`;
      
      const nL = await DB.query(sql, [newLead.firstname, newLead.lastname, newLead.email, newLead.phone.replace(/[^+\d]/g, ''), newLead.source, newLead.ts, false]);
      console.log('New Lead:', nL);
    }
    // res.status(200).json({lead: newLead});
    res.status(200).json({stat: 'OK'});
  }

  async addLead(req, res) {
    const {firstname, email, phone, source, message, bookfree} = req.body;
    let p;
    if(phone) p = phone.replace(/[^\d]/g, '')
    console.log('query:', firstname, email, p, source, bookfree);
    
    if(email){
      // validate email

      // const errors = validationResult(req)
      // console.log('errors:', errors)
      // if (!errors.isEmpty()) {
      //   const errorMessageHtml = `
      //   <html>
      //     <head>
      //       <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      //       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      //       <title>Stunning You.</title>

      //       <style>
      //         .text-center{
      //           text-align: center;
      //           font-size: large;
      //           font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
      //           color: #381d11;
      //         }
      //       </style>

      //     </head>

      //     <body>
      //       <div style="width:100vw; height:90vh; display: flex; align-items: center; justify-content: center;">
      //         <div style="width: 400px;  border: 1px black solid; border-radius: 30px; padding: 30px 45px; box-shadow: 0px 5px 20px 1px rgba(0, 0, 0, .2);">
      //           <p class="text-center">Somthing was wrong.</p>
      //           <p class="text-center">Please return and check the field.</p>
      //         </div>
      //       </div>
      //     </body>
      //   </html>
      //   `
      //   return res.status(400).send(errorMessageHtml)
      // }

      // test email for fake

      // console.log('isFakeDomainOnline:', await isFakeDomainOnline(email.split('@')[1]));
      // console.log('isFakeEmailOnline:', await isFakeEmailOnline(email));
      // const isFakeDomain = await isFakeDomainOnline(email.split('@')[1]);
      // const isFakeEmail = await isFakeEmailOnline(email);
  
      // if(isFakeDomain.isFakeDomain || isFakeEmail.isFakeDomain)
      //   return res.status(400).json({
      //   message: 'Email or domain is fake'
      // });
    }

    const sql = `
      INSERT INTO leads 
        (firstname, email, phone, source, ts, message, archive) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`;
    const ts  = new Date(),
          tel = phone?.replace(/[^+\d]/g, '');
    const newLead = await DB.query(sql, [firstname, email || '', tel || null, source, ts, message, false]);
    console.log('New Lead:', newLead);

    // mailing
    // ## email, subject, body, type, senddate
    let subject, body, type, senddate;
    // mail to clinic
    const clinicEmail = "info@stunning-you.com"
    subject = 'New Lead';
    body    = `WOW! We have a new lead:<br/>
              Name: <strong>${firstname}</strong><br/>
              Email: <strong>${email}</strong>
              Phone: <strong>${tel}</strong>
              Message: <br/>
              ${message}
              `;
    type = `New Lead`;
    // add 5 min after registration for first mail
    senddate = new Date(ts.getTime() + 5*60*1000);

    mailController.addMail([clinicEmail], subject, body, type, senddate);

    // // welcome mail
    // subject = 'Welcome to the Stunning you';
    // body    = `Welcome to the beauty club.<br/>
    //           You can become a full member of all programs, discounts and bonuses by registering at the link:
    //           <a href="${API_URL}/leaduser/${newLead.rows[0].id}">Be beauty!</a>
    //           `;
    // type = `Welcome`;
    // // add 5 min after registration for first mail
    // senddate = new Date(ts.getTime() + 5*60*1000);

    // mailController.addMail([email], subject, body, type, senddate);

    // // 1 day after
    // subject = 'Hello again';
    // body    = `Welcome to the beauty club.<br/>
    //           You can become a full member of all programs, discounts and bonuses by registering at the link:
    //           <a href="${API_URL}/leaduser/${newLead.rows[0].id}">Be beauty!</a>
    //           `;
    // type = `lead_1day`;
    // // add 1 day after registration for first mail
    // senddate = new Date(ts.getTime() + 24*60*60*1000);
    // mailController.addMail([email], subject, body, type, senddate);

    // // 3 day after
    // subject = 'We miss you';
    // body    = `Welcome to the beauty club.<br/>
    //           You can become a full member of all programs, discounts and bonuses by registering at the link:
    //           <a href="${API_URL}/leaduser/${newLead.rows[0].id}">Be beauty!</a>
    //           `;
    // type = `lead_3day`;
    // // add 1 day after registration for first mail
    // senddate = new Date(ts.getTime() + 3*24*60*60*1000);
    // mailController.addMail([email], subject, body, type, senddate);

    // // 7 day after
    // subject = 'We miss you';
    // body    = `Welcome to the beauty club.<br/>
    //           You can become a full member of all programs, discounts and bonuses by registering at the link:
    //           <a href="${API_URL}/api/leaduser/${newLead.rows[0].id}">Be beauty!</a>
    //           `;
    // type = `lead_7day`;
    // // add 1 day after registration for first mail
    // senddate = new Date(ts.getTime() + 7*24*60*60*1000);
    // mailController.addMail([email], subject, body, type, senddate);

    const thankYouHtml = `
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <title>Stunning You.</title>
    
        <style>
          .text-center{
            text-align: center;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            color: #381d11;
          }
        </style>
    
      </head>
    
      <body style="margin: 0">
        <div style="width:100vw; height:90vh; display: flex; align-items: center; justify-content: center;">
          <div style="width: 400px; border: 1px black solid; border-radius: 30px; padding: 30px 45px; box-shadow: 0px 5px 20px 1px rgba(0, 0, 0, .2);">
            <h1 class="text-center">Your message has&nbsp;been&nbsp;sent.<br/><br/>Thank you!</h1>
          </div>
        </div>
      </body>
    </html>    
    `
    if(bookfree) res.send(newLead.rows[0]);
    else res.status(200).send(thankYouHtml);
  }

  async sumLead(req, res) {
    // console.log('leads sum');
    const dayStart = req.query.daystart;
    const dayEnd = req.query.dayend;
    // console.log(dayStart, dayEnd);
    const count = await DB.query(`
      SELECT COUNT(id) FROM leads 
      WHERE ROUND(extract(EPOCH FROM ts)*1000, 0) between $1 AND $2
      GROUP by id;
    `, [dayStart, dayEnd]);
    res.status(200).json({message:'OK', countLead:count.rowCount});
  }

  async deleteLoyalty(req, res){  
    const id = req.params.id;
    const del = await DB.query('DELETE FROM loyalty WHERE invoice_id = $1;', [id]);
    // console.log('res:', del);
    res.send(true);
  }

  async getTrafficSource(req, res){
    const {page, source} = req.body;
    console.log('source:', source, page);
    if(!page || !source || source === '') return;

    const sql = `
      INSERT INTO traffic 
        (page, source, ts) 
      VALUES ($1, $2, $3) 
      RETURNING *`;
    const ts  = new Date();
    const newTrafficSource = await DB.query(sql, [page, source, ts]);
    // console.log('newTrafficSource:', newTrafficSource);
  }

}

module.exports = new LoyaltyController()