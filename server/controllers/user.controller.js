const DB = require('../db')

class UserController {
  async createUser(req, res){
    const {firstname, lastname, email, password, promo} = req.body
    const sql = 'INSERT INTO users (firstname, lastname, email, password, ts, usertype_id, promo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
    let ts = new Date(),
    usertype_id = 3; // User type:::  1 - Admin, 2 - Doctor, 3 - Client
    const newUser = await DB.query(sql,[firstname, lastname, email, password, ts, usertype_id, (promo ? true : false)])
    res.send(newUser.rows[0])
  }
  async getUsers(req, res){
    console.log('get all users:');
    const sql = `
      SELECT 
        u.id AS id,
        u.firstname AS firstname,
        u.lastname AS lastname,
        u.email AS email,
        ut.usertype AS usertype
      FROM users u 
      JOIN user_types ut ON ut.id = u.usertype_id
    `
    // console.log('SQL:', sql);
    const users = await DB.query(sql)
    // console.log(users.rows)
    res.send(users.rows)
  }
  async getUser(req, res){
    console.log('get user by ID:')
    const id = req.params.id
    const sql = 'SELECT * FROM users WHERE id = $1'
    const user = await DB.query(sql,[id])
    console.log(`user #${id}:`, user.rows[0])
    res.send(user.rows[0])
  }
  async updateUser(req, res){
    const id = req.params.id
    const sql =``

  }
  async deleteUser(req, res){
    console.log('delete user by ID')
  }
}

module.exports = new UserController()