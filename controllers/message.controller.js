const DB = require('../db')
const fs = require('fs')
const uuid = require('uuid')

class MessageController {  
  async createMessage(req, res){
    let {clientId, body, note, age, ticket} = req.body;
    console.log('clientId, body, note, age:', clientId, ticket, body, note, age);
    if(!clientId) return res.status(400).json({message: "Relogin please."})

    if(!ticket) ticket = uuid.v4();
    const ts  = new Date();
    body.age  = age;
    body.note = note;
    const sql = `INSERT INTO messages (ticket, client_id, body, ts, status) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    // auto answer
    const bodyAns = {};
    if(body.procedureId && body.procedureId !== 0) {
      const procedure = await DB.query(`SELECT id, procedure, duration, cost FROM procedures WHERE id = $1 LIMIT 1`, [body.procedureId]);
      // console.log('procedure:', procedure);
      bodyAns.procedureId = body.procedureId;
      bodyAns.answer = 1;
      bodyAns.note = `
        Hello. This conversation has been assigned ticket ${ticket}. At your request regarding the ${procedure.rows[0].procedure}, a preliminary cost has been formed in the amount of: ${procedure.rows[0].cost} EUR.
        The indicated cost is not final. For the formation of a detailed calculation and proposal, we suggest signing up for a consultation.`;
      } else {
        bodyAns.answer = 1;
        bodyAns.note = `
          Hello. This conversation has been assigned ticket ${ticket}. Thank you very much for your interest. We will be happy to help you, but we need more details. We suggest signing up for a consultation.`;        
      }
      // const sql_ans = `INSERT INTO messages (ticket, client_id, body, ts) VALUES ($1, $2, $3, $4) RETURNING *;`;
      // STATUS: 0 - not answered, 1 - answered, 2 - closed
    try{
      const newMessage = await DB.query(sql, [ticket, clientId, body, ts, 1]);
      const ansMessage = await DB.query(sql, [ticket, clientId, bodyAns, ts, 0]);
      // console.log(newMessage.rows[0]);
      res.send(newMessage.rows[0]);
    }catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    } 
  }

  async createConvMessage(req, res){
    let {clientId, adminId, body, ticket} = req.body;
    body.answer = 1;
    console.log('clientId, adminId, body, ticket:', clientId, adminId, body, ticket);
    if(!clientId && !adminId) return res.status(400).json({message: "Who is author? Login Please."})
    if(!ticket) return res.status(400).json({message: "Who is ticket?"})

    // set status answered
    // STATUS: 0 - not answered, 1 - answered, 2 - closed
    await DB.query('UPDATE messages SET status = 1 WHERE ticket = $1;', [ticket]);

    const ts  = new Date();
    const sql = `INSERT INTO messages (ticket, client_id, admin_id, body, ts, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;

    try{
      const newMessage = await DB.query(sql, [ticket, clientId ? clientId : null, adminId ? adminId : null, body, ts, 0]);
      // console.log(newMessage.rows[0]);
      res.send(newMessage.rows[0]);
    }catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    } 
  }

  async getMessages(req, res){
    // console.log('get all messages:')    
    try{
      const messages = await DB.query('SELECT * FROM messages WHERE client_id NOTNULL ORDER BY ts DESC');
      // console.log('messages:', messages.rows);
      return res.send(messages.rows);
    } catch(e){
      console.log(`Error: ${e}`);
      return res.status(500).json({message: "The connection with DB was lost."});
    }
  }

  async getMessagesByUserId(req, res){
    const id = req.params.id
    // console.log('get messages by user ID:', id)   
    try{
      const messages = await DB.query('SELECT * FROM messages WHERE client_id = $1 ORDER BY ts DESC', [id]);
      // console.log('messages:', messages.rows);
      return res.send(messages.rows);
    } catch(e){
      console.log(`Error: ${e}`);
      return res.status(500).json({message: "The connection with DB was lost."});
    }
  }

  async getMessagesByTicket(req, res){
    const ticket = req.params.id
    // console.log('get messages by user ID:', id)   
    try{
      const messages = await DB.query('SELECT * FROM messages WHERE ticket = $1 ORDER BY ts', [ticket]);
      return res.send(messages.rows);
    } catch(e){
      console.log(`Error: ${e}`);
      return res.status(500).json({message: "The connection with DB was lost."});
    }
  }

  async getMessage(req, res){
    // const id = req.params.id
    // // console.log('get user by ID:', id)
    // try{
    //   const sql = `SELECT id, firstname, lastname, email, usertype_id, avatar FROM users WHERE id = $1;`
    //   const user = await DB.query(sql,[id])
    //   // console.log(`user #${id}:`, user.rows[0])
    //   res.send(user.rows[0])
    // }catch(e){
    //   console.log(`Error: ${e}`)  
    //   return res.status(500).json({message: "The connection with DB was lost."})
    // }
  }
}

module.exports = new MessageController()