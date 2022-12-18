const DB = require('../db')
const fs = require('fs')
const uuid = require('uuid')

class MessageController {  
  async createMessage(req, res){
    let {clientId, body, note, age, ticket} = req.body;
    console.log('clientId, body, note, age:', clientId, ticket, body, note, age);
    if(!ticket) ticket = uuid.v4();
    const ts  = new Date();
    body.age  = age;
    body.note = note;
    const sql = `INSERT INTO messages (ticket, client_id, body, ts) VALUES ($1, $2, $3, $4) RETURNING *;`;
    try{
      const newMessage = await DB.query(sql, [ticket, clientId, body, ts]);
      // console.log(newMessage.rows[0]);
      res.send(newMessage.rows[0]);
    }catch{
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    } 
  }

  async getMessages(req, res){
    // console.log('get all messages:')    
    try{
      const messages = await DB.query('SELECT * FROM messages WHERE client_id NOTNULL ORDER BY ts');
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
      const messages = await DB.query('SELECT * FROM messages WHERE client_id = $1 ORDER BY ts, ticket', [id]);
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