const DB = require('../db')

class ProcedureController {
  async createProcedure(req, res){
    const {procedure, proceduretype_id, time, cost} = req.body
    const sql = 'INSERT INTO procedures (procedure, proceduretype_id, time, cost, ts) VALUES ($1, $2, $3, $4, $5) RETURNING *'
    const ts = new Date()
    // console.log(procedure, proceduretype_id, time, cost, ts)    
    const newProcedure = await DB.query(sql, [procedure, proceduretype_id, time, cost, ts])
    // console.log('newProcedure:', newProcedure)
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
        pt.proceduretype AS proceduretype
      FROM procedures p
      JOIN procedure_types pt ON pt.id = p.proceduretype_id
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

  async getProcedureTypes(req, res){
    // console.log('get Procedure Types:')
    const sql = `SELECT * FROM procedure_types;`
    const proceduretypes = await DB.query(sql)
    // console.log('procedure types:', proceduretypes.rows)
    res.send(proceduretypes.rows)    
  }
}

module.exports = new ProcedureController()