const DB = require('../db')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

  async deleteLoyalty(req, res){  
    const id = req.params.id;
    const del = await DB.query('DELETE FROM loyalty WHERE invoice_id = $1;', [id]);
    // console.log('res:', del);
    res.send(true);
  }
}

module.exports = new LoyaltyController()