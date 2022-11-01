const DB = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
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

    const {firstname, lastname, email, password, promo, usertype_id} = req.body;
    console.log(firstname, lastname, email, password, promo, usertype_id);
    const newuser = await DB.query(`SELECT * FROM users WHERE email = $1`, [email]);
    console.log('newuser', newuser.rows);
    if (newuser.rows && newuser.rows.length) return res.status(400).json({ message: 'User already exist' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const sql = 'INSERT INTO users (firstname, lastname, email, password, ts, usertype_id, promo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
    let ts = new Date();
    // User type:::  1 - Admin, 2 - Doctor, 3 - Client
    const newUser = await DB.query(sql,[firstname, lastname, email, hashedPassword, ts, (usertype_id ? usertype_id : 3), (promo ? true : false)]);
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
      
      let exp = '1h'
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

  async getUsers(req, res){
    // console.log('get all users:');
    const sql = `
      SELECT 
        u.id AS id,
        u.firstname AS firstname,
        u.lastname AS lastname,
        u.email AS email,
--        u.ts,
        ut.usertype AS usertype
      FROM users u 
      JOIN user_types ut ON ut.id = u.usertype_id
      ORDER BY firstname, lastname;`
    const users = await DB.query(sql)
    // console.log(users.rows)
    res.send(users.rows)
  }

  async getUser(req, res){
    // console.log('get user by ID:')
    const id = req.params.id
    const sql = `SELECT id, firstname, lastname, email, usertype_id FROM users WHERE id = $1;`
    const user = await DB.query(sql,[id])
    // console.log(`user #${id}:`, user.rows[0])
    res.send(user.rows[0])
  }

  async updateUser(req, res){
    const id = req.params.id
    const {firstname, lastname, email, promo, usertype_id, password} = req.body
    // console.log(id, firstname, lastname, email, promo, usertype_id, password);
    const sql =`
      UPDATE users SET
        firstname   = $2,
        lastname    = $3,
        email       = $4,
        promo       = $5,
        usertype_id = $6
      WHERE id = $1;`
    await DB.query(sql, [id, firstname, lastname, email, promo, usertype_id])
    if(password) {
      const hashedPassword = await bcrypt.hash(password, 12)
      await DB.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, id])
    }
    // console.log(`user #${id} was updates`)
    res.send(true) 
  }
  
  async deleteUser(req, res){
    // console.log('delete user by ID', req.param.id)
    const id = req.params.id
    const sql = `DELETE FROM users WHERE id = $1 RETURNING firstname, lastname;`
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
        ut.usertype AS usertype
      FROM users u 
      JOIN user_types ut ON ut.id = u.usertype_id
      WHERE ut.id = 2
      ORDER BY firstname, lastname;`
    const doctors = await DB.query(sql)
    res.send(doctors.rows)    
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