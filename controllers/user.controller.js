const DB = require('../db')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const uuid = require('uuid')
// const avatar = uuid.v4() + ".jpg"
const {check, validationResult} = require('express-validator')
require('dotenv').config()

class UserController {  
  async createUser(req, res){
    [
      check('email', 'Minimal length of email 3 symbols').isEmail(),
      check('password', 'Minimal length of password 8 symbols').isLength({ min: 8 })
    ]  
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
		  return res.status(400).json({
			errors: errors.array(),
			message: 'Invalid data in registration fields'
		  })
		}
    if(req.files){
      // save the avatar
      const file = req.files.avatar
      // console.log('File:', file)
      const folderName = process.env.filePath + '\\avatars'
      try { if (!fs.existsSync(folderName)) fs.mkdirSync(folderName) } catch (e) { console.error(e) }
      const pathFile = folderName + '\\' + file.name
      // console.log('\nPath:', folderName)
      if (fs.existsSync(pathFile)) {
        return res.status(400).json({message: 'File already exist'})
      }
      // console.log('try to move')
      file.mv(pathFile)
      // console.log('file was saved')
    }

    // save to DB
    const {firstname, lastname, email, password, promo, usertype_id} = req.body
    const avatar = req.files ? req.files.avatar.name : null
    // console.log(firstname, lastname, email, password, promo, usertype_id);
    const newuser = await DB.query(`SELECT * FROM users WHERE email = $1`, [email])
    if (newuser.rows && newuser.rows.length) return res.status(400).json({ message: 'User already exist' })
    const hashedPassword = await bcrypt.hash(password, 12)
    const sql = 'INSERT INTO users (firstname, lastname, email, password, ts, usertype_id, promo, avatar, confirm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *'
    let ts = new Date()
    // User type:::  1 - Admin, 2 - Doctor, 3 - Client
    // console.log('try to save: ', firstname, lastname, email, hashedPassword, ts, (usertype_id ? usertype_id : 3), (promo ? true : false), avatar)
    const newUser = await DB.query(sql,[firstname, lastname, email, hashedPassword, ts, (usertype_id ? usertype_id : 3), (promo ? true : false), avatar])
    res.send(newUser.rows[0]);
  }

  async loginUser(req, res){
    const {email, password, remember} = req.body
    try {
      let q = await DB.query(`SELECT * FROM users WHERE email = $1`, [email])
      const user = q.rows[0]
      if (!user) return res.status(400).json({ message: 'User not found' })
      
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return res.status(400).json({ message: 'Incorrect password' })
      
      let exp = '7d'
      if(!remember) exp = '24h'
      const jwtSecret = process.env.jwtSecret
      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: exp }
      )
      // 1 : "admin" | 2 : "doctor" | 3 : "client"
      user.password = 'fuckYou';
      // console.log('user:', user);
      res.json({ token, user:user })
    } catch (e) {
      res.status(500).json({ message: 'Something wrong' })
    }
  }

  async loginPwaUser(req, res){
    [
      check('email', 'Minimal length of email 3 symbols').isEmail(),
      check('password', 'Minimal length of password 8 symbols').isLength({ min: 8 })
    ]  
    const errors = validationResult(req)
    // console.log('errors:', errors)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Invalid Apple ID'
      })
    }
    const {email, password} = req.body
    // console.log(email, password)
    try {
      let q = await DB.query(`SELECT * FROM users WHERE email = $1`, [email])
      let user = q.rows[0]
      if (!user) {
        // save to DB
        const hashedPassword = await bcrypt.hash(password, 12)
        const sql = 'INSERT INTO users (firstname, lastname, email, password, ts, usertype_id, promo, confirm) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *'
        let ts = new Date()
        let firstName = 'AppleUser';
        let lastName = email.split('@')[0];
        // User type:::  1 - Admin, 2 - Doctor, 3 - Client
        // console.log('try to save: ', hashedPassword, firstName, lastName, email, hashedPassword, ts, 3, true)
        user = await DB.query(sql,[firstName, lastName, email, hashedPassword, ts, 3, false])
      } else {
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' })
      }     
      // console.log('user:', user);
      
      // const exp = '200h'
      const exp = '5m'
      const jwtSecret = process.env.jwtSecret
      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: exp }
      )
      res.json({ token, user:user })
    } catch (e) {
      res.status(500).json({ message: 'Something wrong' })
    }
  }

  async getUsers(req, res){
    // console.log('get all users:')    
    try{
      const sql = `
        SELECT 
          u.id AS id,
          u.firstname AS firstname,
          u.lastname AS lastname,
          u.email AS email,
  --        u.ts,
          u.usertype_id AS usertype_id,
          ut.usertype AS usertype,
          u.avatar AS avatar
        FROM users u 
        JOIN user_types ut ON ut.id = u.usertype_id
        ORDER BY firstname, lastname;`
      const users = await DB.query(sql)
      return res.send(users.rows)
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async getUser(req, res){
    const id = req.params.id
    // console.log('get user by ID:', id)
    try{
      const sql = `SELECT id, firstname, lastname, email, usertype_id, avatar FROM users WHERE id = $1;`
      const user = await DB.query(sql,[id])
      // console.log(`user #${id}:`, user.rows[0])
      res.send(user.rows[0])
    }catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async updateUser(req, res){
    const id = req.params.id
    if(req.files){
      // delete current avatar
      const oldAvatar = await DB.query(`SELECT avatar FROM users WHERE id = $1`, [id])
      // console.log('avatar:', oldAvatar.rows)
      if(oldAvatar || oldAvatar.rows[0].avatar !== ''){
        const folderName = process.env.filePath + '\\avatars'
        const pathFile = folderName + '\\' + oldAvatar.rows[0].avatar
        // console.log('pathFile:', pathFile)
        if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile)
  
        // save the avatar
        const file = req.files.avatar
        // console.log('File:', file)
        try { if (!fs.existsSync(folderName)) fs.mkdirSync(folderName) } catch (e) { console.error(e) }
        const pathNewFile = folderName + '\\' + file.name
        if (fs.existsSync(pathNewFile)) {
          return res.status(400).json({message: 'File already exist'})
        }
        // console.log('try to move')
        file.mv(pathNewFile)
        // console.log('file was saved')
      }
    }

    // save to DB
    const {firstname, lastname, email, promo, usertype_id, password} = req.body
    const avatar = req.files ? req.files.avatar.name : oldAvatar.rows[0].avatar
    // console.log(id, firstname, lastname, email, promo, usertype_id, password, avatar);
    const sql =`
      UPDATE users SET
        firstname   = $2,
        lastname    = $3,
        email       = $4,
        promo       = $5,
        usertype_id = $6,
        avatar      = $7
      WHERE id = $1;`
    await DB.query(sql, [id, firstname, lastname, email, (promo ? true : false), usertype_id, avatar])
    // console.log(`user #${id} was updates`)
    if(password) {
      const hashedPassword = await bcrypt.hash(password, 12)
      await DB.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, id])
    }
    res.send(true) 
  }
  
  async deleteUser(req, res){
    // console.log('delete user by ID', req.param.id)
    const id = req.params.id
    // const sql = `DELETE FROM users WHERE id = $1 RETURNING firstname, lastname;`
    const sql =`
      UPDATE users SET archive = true WHERE id = $1;`    
    const userDeleted = await DB.query(sql, [id])
    // console.log(`user #${id}: ${userDeleted} with SQL: ${sql}`)
    res.send(userDeleted)    
  }

  async getDoctors(req, res){
    const sql = `
      SELECT 
        u.id AS id,
        u.firstname AS firstname,
        u.lastname AS lastname,
        u.email AS email,
--        u.ts,
        ut.usertype AS usertype,
        u.avatar AS avatar
      FROM users u 
      JOIN user_types ut ON ut.id = u.usertype_id
      WHERE ut.id = 2
      ORDER BY firstname, lastname;`
    const doctors = await DB.query(sql)
    // console.log('doctors.rows', doctors.rows)
    res.send(doctors.rows)    
  }

  async getClientsByDoctor(req, res){
    const id = req.params.id
    // console.log(`filter clients for doctor ${id}`)
    const sql = `
      SELECT DISTINCT 
        u.id AS id,
        u.firstname AS firstname,
        u.lastname AS lastname,
        u.email AS email,
        u.avatar AS avatar
      FROM users u 
      JOIN timetable tt ON u.id = tt.user_id
      WHERE u.usertype_id = 3 AND tt.doctor_id = $1
      ORDER BY firstname, lastname;`
    const clients = await DB.query(sql,[id])
    // console.log('clients.rows', clients.rows)
    res.send(clients.rows)    
  }

  async getClients(req, res){
    const sql = `
      SELECT 
        u.id AS id,
        u.firstname AS firstname,
        u.lastname AS lastname,
        u.email AS email,
--        u.ts,
        ut.usertype AS usertype,
        u.avatar AS avatar
      FROM users u 
      JOIN user_types ut ON ut.id = u.usertype_id
      WHERE ut.id = 3
      ORDER BY firstname, lastname;`
    const clients = await DB.query(sql)
    // console.log('clients.rows', clients.rows)
    res.send(clients.rows)    
  }

  async getRoles(req, res){
    // console.log('get all roles')
    const sql = `SELECT * FROM user_types;`
    const roles = await DB.query(sql)
    // console.log('roles:', roles.rows)
    res.send(roles.rows)
  }
}

module.exports = new UserController()