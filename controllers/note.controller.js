const DB = require('../db')
// const fs = require('fs')
// const uuid = require('uuid')
// const avatar = uuid.v4() + ".jpg"
require('dotenv').config()

class NoteController {  
  async createNote(req, res){
    // save to DB
    const {title, note, client_id, doctor_id, procedure_id, } = req.body
    const sql = 'INSERT INTO notes (title, note, client_id, doctor_id, procedure_id, ts, doc_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
    let ts = new Date()
    // console.log('try to save: ', title, note, client_id, doctor_id, procedure_id, ts)
    const newNote = await DB.query(sql,[title ? title : '', note, client_id, doctor_id, procedure_id, ts, 0])
    // console.log('newNote:', newNote.rows)
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
        JOIN procedures p ON p.id = n.procedure_id
        WHERE doc_type=0
        ;`
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
    const sql = `SELECT id, title, note, client_id, doctor_id, procedure_id FROM notes WHERE doc_type=0 AND id = $1;`
    const note = await DB.query(sql,[id])
    // console.log(`note #${id}:`, note.rows[0])
    res.send(note.rows[0])
  }

  async getNoteClient(req, res){
    // console.log('get note by Doc & Client')
    const client_id = req.params.id
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
      JOIN procedures p ON p.id = n.procedure_id
      WHERE doc_type = 0
      AND client_id = $1;
      `
    const note = await DB.query(sql,[client_id])
    // console.log(`note for ${client_id}:`, note.rows)
    res.send(note.rows)
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


  // Controls for Docs
  
  async createDoc(req, res){
    // save to DB
    let {note, client_id, doctor_id, procedure_id, services, cost, medind, diagnosis} = req.body;
    const sql = 'INSERT INTO notes (title, note, client_id, doctor_id, procedure_id, ts, doc_type, invoice) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    let ts = new Date();
    services.push({
      'cost'      : cost,
      'medind'    : medind,
      'diagnosis' : diagnosis
    });
    console.log('createDoc:', 'invoice', note, client_id, doctor_id, procedure_id, JSON.stringify(services), ts);
    const newDoc = await DB.query(sql,['invoice', note, client_id, doctor_id, procedure_id, ts, 1, JSON.stringify(services)]);
    // console.log('newDoc:', newDoc.rows);
    res.send(newDoc.rows[0]);
  }

  async getDocs(req, res){
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
          p.procedure    AS procedure,
          n.ts AS ts
        FROM notes n
        JOIN users uc ON (uc.id = n.client_id)
        JOIN users ud ON (ud.id = n.doctor_id)
        JOIN procedures p ON p.id = n.procedure_id
        WHERE doc_type = 1;`
      const notes = await DB.query(sql)
      // console.log(notes.rows)
      return res.send(notes.rows)
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async getDoc(req, res){
    // console.log('get note by ID:')
    const id = req.params.id
    const sql = `SELECT id, title, note, client_id, doctor_id, procedure_id FROM notes WHERE doc_type = 1 AND id = $1;`
    const note = await DB.query(sql,[id])
    // console.log(`note #${id}:`, note.rows[0])
    res.send(note.rows[0])
  }

  async getInvoices(req, res){
    console.log('get Invoices:')
    // invoice:: doc_type = 1
    try{
      const sql = `
        SELECT 
          n.id AS id,
          n.title AS title,
          n.note  AS note,
          n.client_id  AS client_id,
          n.invoice    AS services,
          n.bill       AS bill,
          n.paid       AS paid,
          uc.firstname AS client_firstname,
          uc.lastname  AS client_lastname,
          n.doctor_id  AS doctor_id,
          ud.firstname AS doctor_firstname,
          ud.lastname  AS doctor_lastname,
          n.procedure_id AS procedure_id,
          p.procedure    AS procedure,
          p.cost         AS procedure_cost,
          n.ts AS ts
        FROM notes n
        JOIN users uc ON (uc.id = n.client_id)
        JOIN users ud ON (ud.id = n.doctor_id)
        JOIN timetable tt ON tt.id = n.procedure_id
        JOIN procedures p ON p.id = tt.procedure_id
        WHERE doc_type = 1
        ORDER BY ts DESC;`
      const invoices = await DB.query(sql)
      console.log(invoices.rows)
      return res.send(invoices.rows)
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async updateInvoices(req, res){
    const {invoice} = req.body;
    // console.log('save invoice data:', invoice);
    const sql =`UPDATE notes SET bill = $2 WHERE id = $1 RETURNING *;`
    const note = await DB.query(sql, [invoice.id, invoice]);
    // console.log(`note #${note.id} was updates:`, note.rows[0]);
    res.send(note.rows[0]);
  }

  async setInvoicePaid(req, res){
    const id = req.params.id
    console.log('set invoice paid:', id);
    const sql =`UPDATE notes SET paid = NOT paid WHERE id = $1 RETURNING *;`
    const invoice = await DB.query(sql, [id]);
    console.log(`the invoice #${id} was paid:`, invoice.rows[0]);
    res.send(invoice.rows[0]);
  }

  async updateDoc(req, res){
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
  
  async deleteDoc(req, res){
    // console.log('delete note by ID', req.param.id)
    const id = req.params.id
    // const sql = `DELETE FROM notes WHERE id = $1 RETURNING firstname, lastname;`
    const sql = `UPDATE notes SET archive = true WHERE id = $1;`    
    const noteDeleted = await DB.query(sql, [id])
    // console.log(`note #${id}: ${noteDeleted} with SQL: ${sql}`)
    res.send(noteDeleted)    
  }

  async getDocClient(req, res){
    // console.log('get docs by Doc & Client')
    const client_id = req.params.id
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
      p.procedure    AS procedure,
      n.ts AS ts,
      n.invoice AS invoice
      FROM notes n
      JOIN users uc ON (uc.id = n.client_id)
      JOIN users ud ON (ud.id = n.doctor_id)
      JOIN procedures p ON p.id = n.procedure_id
      WHERE doc_type = 1
      AND client_id = $1
    ;`
    const note = await DB.query(sql,[client_id])
    // console.log(`note for ${client_id}:`, note.rows)
    res.send(note.rows)
  }

}
module.exports = new NoteController()