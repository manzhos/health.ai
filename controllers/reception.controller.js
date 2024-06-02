const DB = require('../db');
const mailController = require('./mail.controller');
const genPass = require('generate-password');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class ReceptionController {  
  async createReception(req, res){
    // save to DB
    const {doctor_id, receptionList} = req.body;
    const ts = new Date();
    console.log('doctor ID:', doctor_id);
    console.log('reception', receptionList);

    const recDates = receptionList.map((rec) => {
      // console.log('rec:', new Date(rec.start).toDateString())
      return new Date(rec.start).toDateString()
    })
    const uniqueRecDates = [...new Set(recDates)]

    console.log('recDates:', recDates)
    console.log('uniqueRecDates:', uniqueRecDates)

    // const sqlGet = 'SELECT * FROM reception_hours WHERE doctor_id = $1 AND date = ANY($2);'
    // const existReception = await DB.query(sqlGet, [doctor_id, uniqueRecDates]);
    // console.log('existReception', existReception);

    const idDel = []
    const sqlMarkDel = `SELECT id FROM reception_hours WHERE doctor_id = $1;`
    try{
      const markForDelRecord = await DB.query(sqlMarkDel, [doctor_id])
      console.log('ID for del Record', markForDelRecord);
      markForDelRecord.rows.map((rec) => { idDel.push(rec.id) })
    } catch (err) {
      console.log(`Error: ${err}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }

    const newRecList = {}
    for(let d in uniqueRecDates){
      newRecList[uniqueRecDates[d]] = {}
      receptionList.map((rec) => {
        if(new Date(rec.start).toDateString() === uniqueRecDates[d]){
          const id = Object.keys(newRecList[uniqueRecDates[d]]).length,
                dateStart = new Date(rec.start),
                dateEnd   = new Date(rec.end),
                start = dateStart.getHours() * 60 + dateStart.getMinutes(),
                end   = dateEnd.getHours()   * 60 + dateEnd.getMinutes()

          newRecList[uniqueRecDates[d]][id] = {
              'start': start,
              'end': end
            }

          }
        }
      )
    }
    console.log('newRecList:', newRecList)

    //insert reception times
    const sqlIns = 'INSERT INTO reception_hours (doctor_id, date, time, ts) VALUES ($1, $2, $3, $4) RETURNING *'
    try{
      for (const record in newRecList) {
        const newRecord = await DB.query(sqlIns, [doctor_id, record, newRecList[record], ts]);
        console.log('newRecord', newRecord);
      }
      console.log('Records inserted successfully!');
      
    // const sqlDel = `DELETE FROM reception_hours WHERE doctor_id = $2 ANDdate = ANY($1);`
      const sqlDel = `DELETE FROM reception_hours WHERE id = ANY($1);`
      console.log('idDel', idDel)
      const delRecord = await DB.query(sqlDel, [idDel])
      console.log('delRecord', delRecord);

      return res.status(200).json({message: "All receipt hours are filled."})
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
  
  async updReception(req, res){
    console.log(`try to update reception`);
    // save to DB
    const {doctor_id, date, time} = req.body;
    console.log(doctor_id, date, time);
    if(!doctor_id || !date || !time) return  res.status(400).json({message: "Not full data."})

    // find exists record
    let rec
    try{
      const sql =`SELECT * FROM reception_hours WHERE date = $1;`;
      rec = await DB.query(sql, [date]);
      console.log(`found #${rec}`)
    } catch (err) {
      console.log(`Error: ${err}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }

    if(rec){
      // update
      const sql =`UPDATE reception_hours SET time = $1 WHERE date = $2;`;
      try{
        await DB.query(sql, [time, date]);
        console.log(`reception #${id} was updates`)
        return res.send(true);
      } catch (err) {
        console.log(`Error: ${err}`)  
        return res.status(500).json({message: "The connection with DB was lost."})
      }
    } else {
      // insert
      const ts  = new Date();
      const sql =`INSERT INTO reception_hours (doctor_id, date, time, ts) VALUES ($1, $2, $3, $4) RETURNING *`;
      try{
        const newRec = await DB.query(sql, [doctor_id, date, time, ts]);
        console.log(`reception ${newRec} was inserted`)
        return res.send(true);
      } catch (err) {
        console.log(`Error: ${err}`)  
        return res.status(500).json({message: "The connection with DB was lost."})
      }

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