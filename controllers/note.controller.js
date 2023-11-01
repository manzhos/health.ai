const DB = require('../db')
// const fs = require('fs')
// const uuid = require('uuid')
// const avatar = uuid.v4() + ".jpg"
require('dotenv').config()

class NoteController {  
  async createNote(req, res){
    // save to DB
    const { title, note, client_id, doctor_id, procedure_id, doc_type, invoice } = req.body;
    const sql = 'INSERT INTO notes (title, note, client_id, doctor_id, procedure_id, ts, doc_type, invoice) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
    let ts = new Date(),
        services = [invoice];
    // console.log('try to save: ', title, note, client_id, doctor_id, procedure_id, doc_type, JSON.stringify(services), ts);
    const newNote = await DB.query(sql, [title ? title : '', note ? note : '', client_id, doctor_id, procedure_id, ts, doc_type ? doc_type : 0, invoice ? JSON.stringify(services) : null])
    // console.log('newNote:', newNote.rows[0])
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
    const {title, note, client_id, doctor_id, procedure_id, bill} = req.body;
    console.log(id, title, note, client_id, doctor_id, procedure_id, bill);
    const sql =`
      UPDATE notes SET
      title        = $2,
      note         = $3,
      client_id    = $4,
      doctor_id    = $5,
      procedure_id = $6,
      bill         = $7
      WHERE id = $1;`
    await DB.query(sql, [id, title, note, client_id, doctor_id, procedure_id, bill])
    console.log(`note #${id} was updates`)
    res.send(true) 
  }
  
  async deleteNote(req, res){
    console.log('delete note by ID', req.param.id)
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
    let {note, timetable_id, client_id, doctor_id, procedure_id, services, botox_what, cost, medind, diagnosis} = req.body;
    const sql = 'INSERT INTO notes (title, note, client_id, doctor_id, procedure_id, ts, doc_type, invoice) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    let ts = new Date();
    let details = {
      'timetable_id': timetable_id,
      'cost'        : cost,
      'medind'      : medind,
      'diagnosis'   : diagnosis,
      'botox_what'  : botox_what
    };
    console.log('createDoc:', 'invoice', note, client_id, doctor_id, procedure_id, JSON.stringify({'details': details, 'services': services}), ts);
    const newDoc = await DB.query(sql,['invoice_' + timetable_id, note, client_id, doctor_id, procedure_id, ts, 1, JSON.stringify({'details': details, 'services': services})]);
    console.log('newDoc:', newDoc.rows);
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
    // console.log('get Invoices:')
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
        JOIN procedures p ON p.id = n.procedure_id
        WHERE n.doc_type = 1
        AND NOT n.archive
        ORDER BY ts DESC;`
      const invoices = await DB.query(sql)
      // console.log(invoices.rows)
      return res.send(invoices.rows)
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async getInvoice(req, res){
    const number = req.params.number;
    console.log(`get Invoice by id=${number}`)
    try{
      const sql = `
        SELECT 
          *
        FROM invoices
        WHERE number = $1
        LIMIT 1;`
      const invoice = await DB.query(sql, [number]);
      console.log(invoice.rows)
      return res.send(invoice.rows[0])
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async updateInvoice(req, res){
    const id = req.params.id;
    const { invoice } = req.body;
    console.log(`save invoice >> ${id} << data:`, invoice);
    const sql =`
      UPDATE invoices SET
        title = $2 
      WHERE id = $1 
      RETURNING *;`
    const inv = await DB.query(sql, [id, invoice.title]);
    // console.log(`invoice #${id} was updates:`, inv.rows[0]);
    res.send(inv.rows[0]);
  }

  async updateInvoices(req, res){
    const { invoice } = req.body;
    // console.log('save invoice data:', invoice);
    const sql =`UPDATE notes SET bill = $2 WHERE id = $1 RETURNING *;`
    const note = await DB.query(sql, [invoice.id, invoice]);
    // console.log(`note #${note.id} was updates:`, note.rows[0]);
    res.send(note.rows[0]);
  }

  async setInvoicePaid(req, res){
    const id = req.params.id
    // console.log('set invoice paid:', id);
    const sql =`UPDATE notes SET paid = NOT paid WHERE id = $1 RETURNING *;`
    const invoice = await DB.query(sql, [id]);
    // console.log(`the invoice #${id} was paid:`, invoice.rows[0]);
    res.send(invoice.rows[0]);
  }

  async createInvoice(req, res){ 
    const {inv_title, perform_procedure_id} = req.body;
    // console.log('title:', inv_title);
    // console.log('perform_procedure_id:', perform_procedure_id);

    const invoice = await DB.query(`
      SELECT * FROM invoices
      WHERE ARRAY[${perform_procedure_id.join(',')}] && perform_procedure_id
    `)
    // console.log('invoices:', invoice);
    if(invoice?.rows?.length) {
      res.send(invoice.rows[0]);
      return;
    }

    let inv_number,
        lastNumber = await DB.query('SELECT number FROM invoices ORDER BY number DESC LIMIT 1');
    if(lastNumber.rows[0]?.number) lastNumber = lastNumber.rows[0].number;
    else lastNumber = '000001';
    console.log('lastNumber:', lastNumber);
    
    const year = Number(String(lastNumber).slice(0, 4));
    const currentYear = new Date().getFullYear();
    // console.log('year:', year, ' || currentYear:', currentYear, currentYear > year);

    if(currentYear > year) inv_number = Number(currentYear + '000001');
    else inv_number = Number(lastNumber) + 1;

    const ts = new Date();

    const newInvoice = await DB.query('INSERT INTO invoices (number, title, ts, perform_procedure_id) VALUES ($1, $2, $3, $4) RETURNING *', [inv_number, inv_title, ts, perform_procedure_id]);
    // console.log(`newInvoice:`, newInvoice);
    res.send(newInvoice.rows[0]);
  }

  async getPerfProcedures(req, res){ 
    let {ids} = req.body,
        additionalIds;
    console.log('getPerfProcedures for', ids);
    try{
      if(ids.length === 1) additionalIds = await DB.query(`SELECT perform_procedure_id FROM invoices WHERE ${ids[0]} = ANY (perform_procedure_id) LIMIT 1`);
      console.log('additionalIds?.rows[0]:', additionalIds?.rows[0]?.perform_procedure_id)
      if(additionalIds?.rows[0]?.perform_procedure_id?.length > 1) ids = additionalIds.rows[0].perform_procedure_id;
      ids = ids.join(',');
      console.log('updated ids:', ids);

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
        JOIN procedures p ON p.id = n.procedure_id
        WHERE n.doc_type = 1
        AND NOT n.archive
        AND n.id IN(${ids})
        ORDER BY ts DESC;`
      const perfProcedure = await DB.query(sql)
      console.log('perfProcedure.rows', perfProcedure.rows)
      return res.send(perfProcedure.rows)
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async updateDoc(req, res){
    const id = req.params.id;
    let {note, timetable_id, client_id, doctor_id, procedure_id, services, botox_what, cost, medind, diagnosis} = req.body;
    const sql = `
      UPDATE notes SET
        note         = $2, 
        client_id    = $3, 
        doctor_id    = $4, 
        procedure_id = $5, 
        invoice      = $6
      WHERE id = $1
    `;
    const details = {
      'timetable_id': timetable_id,
      'cost'        : cost,
      'medind'      : medind,
      'diagnosis'   : diagnosis,
      'botox_what'  : botox_what
    };
    console.log('updateDoc:', id, note, client_id, doctor_id, procedure_id, JSON.stringify({'details': details, 'services': services}));
    try {
      const updatedDoc = await DB.query(sql, [id, note, client_id, doctor_id, procedure_id, JSON.stringify({'details': details, 'services': services})]);
      console.log('updatedDoc:', updatedDoc.rows);
      res.send(true);
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
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
    const note = await DB.query(sql, [client_id])
    // console.log(`note for ${client_id}:`, note.rows)
    res.send(note.rows)
  }

  async getProcedureDataFromInvoice(req, res){
    const title = 'invoice_' + req.params.id;
    console.log('getProcedureDataFromInvoice FOR:', title);
    const sql = `
      SELECT * FROM notes WHERE title = $1
    ;`
    try{
      const invoice = await DB.query(sql, [title]);
      console.log('invoice.rows[0]:', invoice.rows[0]);
      res.send(invoice.rows[0]);
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

}
module.exports = new NoteController()