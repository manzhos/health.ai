const DB = require('../db');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const { isFakeDomainOnline, isFakeEmailOnline } = require('fakefilter');
const { faker } = require('@faker-js/faker');
const cron = require('node-cron');

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
    const {lastname, email, phone, source} = req.body;
    console.log('query:', lastname, email.split('@')[1], phone.replace(/[^\d]/g, ''), source);
    // validate email
    const errors = validationResult(req)
    console.log('errors:', errors)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Check fields data'
      })
    }

    // test email for fake
    console.log('isFakeDomainOnline:', await isFakeDomainOnline(email.split('@')[1]));
    console.log('isFakeEmailOnline:', await isFakeEmailOnline(email));
    const isFakeDomain = await isFakeDomainOnline(email.split('@')[1]);
    const isFakeEmail = await isFakeEmailOnline(email);

    if(isFakeDomain.isFakeDomain || isFakeEmail.isFakeDomain)
        return res.status(400).json({
        message: 'Email or domain is fake'
      });

    const sql = `
      INSERT INTO leads 
        (lastname, email, phone, source, ts, archive) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`;
    const ts = new Date();
    const newLead = await DB.query(sql, [lastname, email, phone.replace(/[^+\d]/g, ''), source, ts, false]);
    console.log('New Lead:', newLead);
    res.status(200).json({lead: newLead});
    res.status(200);
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

}

module.exports = new LoyaltyController()