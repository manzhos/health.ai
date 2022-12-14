const DB = require('../db')
const bcrypt = require('bcryptjs')

class TimeTableController {
  async createRecord(req, res){
    // console.log('Create Procedure:', req.body)
    const {procedure_id, user_id, date, time} = req.body
    const duration = await DB.query('SELECT duration FROM procedures WHERE id=$1',[procedure_id])
    const sql = 'INSERT INTO timetable (procedure_id, user_id, date, time, ts, duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
    let ts = new Date()
    const newProcedure = await DB.query(sql,[procedure_id, user_id, date, time, ts, duration.rows[0].duration])
    res.send(newProcedure.rows[0])
  }

  async createConsult(req, res){
    const {name, age, sex, procedure_id, note, info, email} = req.body
    console.log('name, age, sex, procedure_id, note, info, email:', name, age, sex, procedure_id, note, info, email)
    let user,
        ts = new Date();
    // check client in database
    user = await DB.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if(!user.rows || !user.rows.length){
      // create new user
      let n = name.split(' ');
      console.log('name:', n);
      let password = '111';
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await DB.query(
        `INSERT INTO users (firstname, lastname, email, ts, usertype_id, promo, confirm, password) 
          VALUES ($1, $2, $3, $4, 3, true, false, $5) RETURNING *`, 
          [n[0], n[1], email, ts, hashedPassword]);
    }
    console.log('user:', user.rows[0]);
    // const duration = await DB.query('SELECT duration FROM procedures WHERE id=$1',[procedure_id])
    const sql = 'INSERT INTO timetable (procedure_id, user_id, date, time, ts, duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
    // let ts = new Date()
    // const newProcedure = await DB.query(sql,[procedure_id, user_id, date, time, ts, duration.rows[0].duration])
    // res.send(newProcedure.rows[0])
  }

  async getRecords(req, res){
    // console.log('get all records:');
    const sql = `
      SELECT 
        u.user AS user,
        p.procedure AS procedure,
        p.date AS date,
        p.time AS time,
        pt.proceduretype AS proceduretype
      FROM timetable tt
      JOIN users u ON u.id = t.user_id
      JOIN procedures p ON p.id = t.procedure_id
      JOIN procedure_types pt ON pt.id = p.id
    `
    // console.log('SQL:', sql);
    const records = await DB.query(sql)
    // console.log(records.rows)
    res.send(records.rows)
  }

  async getRecord(req, res){
    console.log('get records by ID:')
    const id = req.params.id
    const sql = 'SELECT * FROM records WHERE id = $1'
    const record = await DB.query(sql,[id])
    console.log(`record #${id}:`, record.rows[0])
    res.send(record.rows[0])
  }
  
  async updateRecord(req, res){
    const id = req.params.id
    const sql =``

  }
  async deleteRecord(req, res){
    console.log('delete Record by ID')
  }
}

module.exports = new TimeTableController()