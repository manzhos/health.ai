const DB = require('../db')
// const fs = require('fs')
// const uuid = require('uuid')
// const avatar = uuid.v4() + ".jpg"
require('dotenv').config()

class NoteController {  
  async createNote(req, res){
    // save to DB
    const {title, note, client_id, doctor_id, procedure_id} = req.body
    const sql = 'INSERT INTO notes (title, note, client_id, doctor_id, procedure_id, ts) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
    let ts = new Date()
    console.log('try to save: ', title, note, client_id, doctor_id, procedure_id, ts)
    const newNote = await DB.query(sql,[title, note, client_id, doctor_id, procedure_id, ts])
    res.send(newNote.rows[0]);
  }

  async getNotes(req, res){
    // console.log('get all notes:')    
    try{
      const sql = `
        SELECT 
          n.id AS id,
          n.title AS title,
          n.note  AS note,
          n.client_id  AS client_id,
          uc.firstname AS client_firstname,
          uc.lastname  AS client_lastname,
          n.doctor_id  AS doctor_id,
          ud.firstname AS doctor_firstname,
          ud.lastname  AS doctor_lastname,
          n.procedure_id AS procedure_id,
          p.procedure    AS procedure
        FROM notes n
        JOIN users uc ON (uc.id = n.client_id)
        JOIN users ud ON (ud.id = n.doctor_id)
        JOIN procedures p ON p.id = n.procedure_id;`
      const notes = await DB.query(sql)
      // console.log(notes.rows)
      return res.send(notes.rows)
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async getNote(req, res){
    // console.log('get note by ID:')
    const id = req.params.id
    const sql = `SELECT id, title, note, client_id, doctor_id, procedure_id FROM notes WHERE id = $1;`
    const note = await DB.query(sql,[id])
    // console.log(`note #${id}:`, note.rows[0])
    res.send(note.rows[0])
  }

  async updateNote(req, res){
    const id = req.params.id
    const {title, note, client_id, doctor_id, procedure_id} = req.body
    // console.log(id, title, note, client_id, doctor_id, procedure_id);
    const sql =`
      UPDATE notes SET
        title        = $2,
        note         = $3,
        client_id    = $4,
        doctor_id    = $5,
        procedure_id = $6
      WHERE id = $1;`
    await DB.query(sql, [id, title, note, client_id, doctor_id, procedure_id])
    // console.log(`note #${id} was updates`)
    res.send(true) 
  }
  
  async deleteNote(req, res){
    // console.log('delete note by ID', req.param.id)
    const id = req.params.id
    // const sql = `DELETE FROM notes WHERE id = $1 RETURNING firstname, lastname;`
    const sql = `UPDATE notes SET archive = true WHERE id = $1;`    
    const noteDeleted = await DB.query(sql, [id])
    // console.log(`note #${id}: ${noteDeleted} with SQL: ${sql}`)
    res.send(noteDeleted)    
  }

}

module.exports = new NoteController()