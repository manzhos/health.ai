const DB = require('../db')

class TimeTableController {
  async createRecord(req, res){
    const {procedure_id, user_id, date, time} = req.body
    const sql = 'INSERT INTO timetable (procedure_id, user_id, date, time, ts) VALUES ($1, $2, $3, $4, $5) RETURNING *'
    let ts = new Date()
    const newProcedure = await DB.query(sql,[procedure_id, user_id, date, time, ts])
    res.send(newProcedure.rows[0])
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