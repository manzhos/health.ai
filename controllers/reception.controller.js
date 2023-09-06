const DB = require('../db');
const mailController = require('./mail.controller');
const genPass = require('generate-password');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class ReceptionController {  
  async createReception(req, res){
    // save to DB
    const {doctor_id, time, repeat} = req.body;
    let date = new Date(req.body.date);
    console.log(doctor_id, date, time, repeat);
    // console.log('reception', reception.rows[0]);
    const ts = new Date();
    const arrDate = [];
    arrDate.push(new Date(Object.assign(date)));

    if(repeat){
      switch(repeat){
        case 'week':
          while (date.getFullYear() <= ts.getFullYear()){
            const insDate = Object.assign(date.setDate(date.getDate() + 7));
            // console.log('added date:', date);
            arrDate.push(new Date(insDate));
          }
          break;
          case 'twoWeek':
          while (date.getFullYear() <= ts.getFullYear()){
            const insDate = Object.assign(date.setDate(date.getDate() + 14));
            // console.log('added date:', date);
            arrDate.push(Object.assign(insDate));
          }
          break;
          case 'month':
          while (date.getFullYear() <= ts.getFullYear()){
            const insDate = Object.assign(date.setMonth(date.getMonth() + 1));
            // console.log('added date:', date);
            arrDate.push(Object.assign(insDate));
          }
          break;
      }
    }
    // console.log('arrDate:', arrDate);

    const sqlUpd = `UPDATE reception_hours SET time = $2 WHERE date = $1;`;
    const sqlIns = 'INSERT INTO reception_hours (doctor_id, date, time, ts) VALUES ($1, $2, $3, $4) RETURNING *';

    for(const d of arrDate){
      // console.log('Date:', d)
      const reception = await DB.query(`SELECT * FROM reception_hours WHERE date = $1`, [d]);
      // console.log('RECEPTION', reception.rows[0]);
      if (reception.rows && reception.rows.length) {
        try{
          DB.query(sqlUpd, [d, time]);
          // console.log(`reception on ${d} was updates`)
        } catch (err) {
          console.log(`Error: ${err}`)  
          return res.status(500).json({message: "The connection with DB was lost."})
        }
      } else {
        try{
          // console.log('try insert:', doctor_id, d, time, ts);
          DB.query(sqlIns, [doctor_id, d, time, ts]);
        } catch (err) {
          console.log(`Error: ${err}`)  
          return res.status(500).json({message: "The connection with DB was lost."})
        }
      }
    }
    return res.status(200).json({message: "All receipt hours are filled."})
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
    console.log('req:', req);
    const id = req.params.id;
    console.log(`try to update reception ${id}`);

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