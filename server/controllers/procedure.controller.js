const DB = require('../db')

class ProcedureController {
  async createProcedure(req, res){
    const {procedure, type_id, time, cost} = req.body
    const sql = 'INSERT INTO procedures (procedure, type_id, time, cost, ts) VALUES ($1, $2, $3, $4, $5) RETURNING *'
    let ts = new Date()
    const newProcedure = await DB.query(sql,[procedure, type_id, time, cost, ts])
    res.send(newProcedure.rows[0])
  }
  async getProcedures(req, res){
    // console.log('get all procedures:');
    const sql = `
      SELECT 
        p.id AS id,
        p.procedure AS procedure,
        p.time AS time,
        p.cost AS cost,
        pt.proceduretype AS type
      FROM procedures p
      JOIN procedure_types pt ON pt.id = p.type_id
      ORDER BY procedure 
    `
    // console.log('SQL:', sql);
    const procedures = await DB.query(sql)
    // console.log(procedures.rows)
    res.send(procedures.rows)
  }
  async getProcedure(req, res){
    console.log('get procedures by ID:')
    const id = req.params.id
    const sql = 'SELECT * FROM procedures WHERE id = $1'
    const procedure = await DB.query(sql,[id])
    console.log(`procedure #${id}:`, procedure.rows[0])
    res.send(procedure.rows[0])
  }
  async updateProcedure(req, res){
    const id = req.params.id
    const sql =``

  }
  async deleteProcedure(req, res){
    console.log('delete Procedure by ID')
  }
}

module.exports = new ProcedureController()