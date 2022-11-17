const DB = require('../db')

class ProcedureController {
  async createProcedure(req, res){
    const {procedure, proceduretype_id, duration, cost} = req.body
    const sql = 'INSERT INTO procedures (procedure, proceduretype_id, duration, cost, ts) VALUES ($1, $2, $3, $4, $5) RETURNING *'
    const ts = new Date()
    // console.log(procedure, proceduretype_id, duration, cost, ts)    
    const newProcedure = await DB.query(sql, [procedure, proceduretype_id, duration, cost, ts])
    // console.log('newProcedure:', newProcedure)
    res.send(newProcedure.rows[0])
  }
  async getProcedures(req, res){
    // console.log('get all procedures:');
    const sql = `
      SELECT 
        p.id AS id,
        p.procedure AS procedure,
        p.duration AS duration,
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

  async getUserProcedures(req, res){
    const user_id = req.params.user_id
    // console.log('get Procedures for user:', user_id)
    const sql = `
      SELECT 
        tt.id,
        p.procedure,
        tt.duration,
        date,
        time,
        cost
      FROM timetable tt
      JOIN procedures p ON p.id = tt.procedure_id
      JOIN procedure_types pt ON pt.id = p.proceduretype_id
      WHERE tt.user_id = $1
      ;`
    const proceduretypes = await DB.query(sql, [user_id])
    // console.log('procedures:', proceduretypes.rows)
    res.send(proceduretypes.rows)    
  }

  async getDoctorProcedures(req, res){
    const doctor_id = req.params.doctor_id
    // console.log('get Procedures for user:', doctor_id)
    const sql = `
      SELECT 
        tt.id,
        tt.procedure_id AS procedure_id,
        tt.user_id AS client_id,
        uc.firstname AS client_firstname,
        uc.lastname AS client_lastname,
        tt.doctor_id AS doctor_id,
        p.procedure,
        tt.duration,
        date,
        time,
        cost
      FROM timetable tt
      JOIN procedures p ON p.id = tt.procedure_id
      JOIN procedure_types pt ON pt.id = p.proceduretype_id
      JOIN users uc ON uc.id = tt.user_id
      WHERE tt.doctor_id = $1
      ;`
    const proceduretypes = await DB.query(sql, [doctor_id])
    // console.log('procedures:', proceduretypes.rows)
    res.send(proceduretypes.rows)    
  }

}

module.exports = new ProcedureController()