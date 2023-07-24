const DB = require('../db');
const mailController = require('./mail.controller');
const genPass = require('generate-password');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class ReceptionController {  
  async createReception(req, res){
    // save to DB
    const {doctor_id, date, time} = req.body;
    console.log(doctor_id, date, time);
    const reception = await DB.query(`SELECT * FROM reception_hours WHERE date = $1`, [date]);
    console.log('reception', reception);
    if (reception.rows && reception.rows.length) {
      console.warn('\n\n\nalarm\n\n\n');
      return res.status(400).json({ message: 'Reception already exist' });
      // this.updateReception(req, res);
    }
    const sql = 'INSERT INTO reception_hours (doctor_id, date, time, ts) VALUES ($1, $2, $3, $4) RETURNING *';
    let ts = new Date();
    try{
      console.log('try');
      const newReception = await DB.query(sql, [doctor_id, date, time, ts]);
      console.log('new reception', newReception);
      return res.send(newReception.rows[0]);
    } catch (err) {
      console.log(`Error: ${err}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async getReception(req, res){
    const id = req.params.id
    // console.log('get reception by ID:', id)
    try{
      const sql = `SELECT * FROM reception_hours WHERE id = $1;`
      // console.log(`sql:\n #${sql}:`)
      const reception = await DB.query(sql, [id])
      // console.log(`reception #${id}:`, reception.rows[0])
      res.send(reception.rows[0])
    }catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async updateReception(req, res){
    const id = req.params.id;
    // console.log(`try to update reception ${id}`);

    // save to DB
    const {doctor_id, date, time} = req.body;
    // console.log(doctor_id, date, time);
    const sql =`UPDATE reception_hours SET time = $1 WHERE id = $2;`;
    try{
      await DB.query(sql, [time, id]);
      // console.log(`reception #${id} was updates`)
      return res.send(true);
    } catch (err) {
      console.log(`Error: ${err}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }
  
  async deleteReception(req, res){
    const id = req.params.id
    // console.log('delete reception by ID:', id)
    const sql = `DELETE FROM receptions WHERE id = $1 RETURNING *;`
    try{
      const receptionDeleted = await DB.query(sql, [id])
      // console.log(`reception #${id} with SQL: ${sql}. `, receptionDeleted)
      return res.send(receptionDeleted)    
    } catch (err) {
      console.log(`Erroe ${err}`);
      return res.status(500),json({message: " The connncetion with DB was lost."});
    }
  }

  async getReceptionByDoctor(req, res){
    const id = req.params.id;
    // console.log(`filter reception hours for doctor ${id}`);
    const sql = `SELECT * FROM reception_hours WHERE doctor_id = $1;`;
    try{
      const reception = await DB.query(sql, [id]);
      // console.log('reception:', reception.rows);
      return res.send(reception.rows);
    } catch (err) {
      console.log(`Error: ${err}`);
      return res.status(500).json({message: "The connection with DB was lost."});
    }
  }

}
module.exports = new ReceptionController()