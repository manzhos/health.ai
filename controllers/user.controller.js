const DB = require('../db');
const mailController = require('./mail.controller');
const genPass = require('generate-password');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const uuid = require('uuid');
// const avatar = uuid.v4() + ".jpg";
const {check, validationResult} = require('express-validator');
// require('dotenv').config();

class UserController {  
  async createUser(req, res){
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
      const folderName = process.env.filePath + '/avatars'
      try { if (!fs.existsSync(folderName)) fs.mkdirSync(folderName) } catch (e) { console.error(e) }
      const pathFile = folderName + '/' + file.name
      // console.log('\nPath:', folderName)
      if (fs.existsSync(pathFile)) {
        return res.status(400).json({message: 'File already exist'})
      }
      // console.log('try to move')
      file.mv(pathFile)
      // console.log('file was saved')
    }

    // save to DB
    const {firstname, lastname, email, password, promo, usertype_id, phone} = req.body
    const avatar = req.files ? req.files.avatar.name : null
    // console.log(firstname, lastname, email, password, promo, usertype_id, phone);
    const newuser = await DB.query(`SELECT * FROM users WHERE email = $1`, [email])
    if (newuser.rows && newuser.rows.length) return res.status(400).json({ message: 'User already exist' })
    const hashedPassword = await bcrypt.hash(password, 12)
    const sql = 'INSERT INTO users (firstname, lastname, email, password, ts, usertype_id, promo, avatar, confirm, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9) RETURNING *'
    let ts = new Date()
    // User type:::  1 - Admin, 2 - Doctor, 3 - Client, 4 - Partner
    // console.log('try to save: ', firstname, lastname, email, hashedPassword, ts, (usertype_id ? usertype_id : 3), (promo ? true : false), avatar, phone)
    const newUser = await DB.query(sql, [firstname, lastname, email, hashedPassword, ts, (usertype_id ? usertype_id : 3), (promo ? true : false), avatar, phone])
    console.log('New User:', newUser.rows[0])
    res.send(newUser.rows[0])
  }

  async leadToClient(req, res){
    const leadId = req.params.id;
    if(!leadId) return;
    const l = await DB.query(`SELECT * FROM leads WHERE id = $1`, [leadId]),
          lead = l.rows[0];
    // console.log('LEAD:', lead);
    const ts = new Date();
    const newPass = genPass.generate({
      length: 10,
      numbers: true
    });
    // console.log('newPass:', newPass);
    const hashedPassword = await bcrypt.hash(newPass, 12);
    const newClient = await DB.query(`
      INSERT INTO users 
        (firstname, lastname, email, password, ts, usertype_id, promo, confirm) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, false) RETURNING *
    `, ['', lead.lastname, lead.email, hashedPassword, ts, 3, true]);

    const sendMailResp = mailController._sendMail({
      'body':{
        'text'		:	`<h2>Congratulation. Welcome to club.</h2><p>You password for service is: <strong>' + newPass + '</strong></p>
                    <p>Also use youe email: ${lead.email}</p>`,
        'mailTo'	:	lead.email,
        'subject' :	'Congratulation. Welcome to club.'
    }})
    // console.log('User controller send', sendMailResp);
    await DB.query(`UPDATE leads SET archive=true WHERE id = $1`, [leadId]);
    res.send(newClient.rows[0]);
  }

  async loginUser(req, res){
    const {email, password, remember} = req.body
    try {
      let q = await DB.query(`SELECT * FROM users WHERE email = $1`, [email])
      const user = q.rows[0]
      if (!user) return res.status(400).json({ message: 'User not found' })
      
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return res.status(400).json({ message: 'Incorrect password' })
      // console.log('user:', user);
      
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
    const {email, password, password_conf, ref_id, partner_id, usertype_id} = req.body;
    console.log('email, password, ref_id, partner_id, usertype_id:', email, password, password_conf, ref_id, partner_id, usertype_id);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('errors:', errors)
      return res.status(400).json({
        errors: errors.array(),
        message: 'Check fields data'
      })
    }

    try {
      const q = await DB.query(`SELECT * FROM users WHERE email = $1`, [email]);
      let user = q.rows[0];
      if (!user) {
        if(!password_conf || password_conf === '') return res.status(200).json({ status: 'newuser' });
        if(password !== password_conf) return res.status(400).json({ message: 'Passwords not match' });
        // save to DB
        const hashedPassword = await bcrypt.hash(password, 12)
        const sql = 'INSERT INTO users (firstname, lastname, email, password, ts, usertype_id, promo, confirm, ref_id, partner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9) RETURNING *'

        const ts = new Date(),
              firstName = 'New User',
              lastName = email.split('@')[0];
        // User type:::  1 - Admin, 2 - Doctor, 3 - Client, 4 - Staff, 5 - Partner
        console.log('try to save: ', firstName, lastName, email, hashedPassword, ts, usertype_id, true, ref_id, partner_id);
        let newUser = await DB.query(sql, [firstName, lastName, email, hashedPassword, ts, usertype_id || 3, true, ref_id || null, partner_id || null]);
        user = newUser.rows[0];
        console.log('New User:', user);
      } else {
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(200).json({ status: 'wrong_pass' })
      }     
      // console.log('user:', user);
      
      const exp = '200h'
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

  async restorePass(req, res){
    // console.log('Restore Pass');
    const {email} = req.body;
    const q = await DB.query(`SELECT * FROM users WHERE email = $1`, [email]);
    let user = q.rows[0];
    // console.log('user:', user);
    if (!user) {
      return  res.status(200).json({ status: 'unreg' })
    }

    const newPass = genPass.generate({
      length: 10,
      numbers: true
    });
    // console.log('newPass:', newPass);
    const hashedPassword = await bcrypt.hash(newPass, 12)
    await DB.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, user.id])
    
    const sendMailResp = mailController._sendMail({
      'body':{
        'text'		:	'You new password for service is: <strong>' + newPass + '</strong>',
        'mailTo'	:	user.email,
        'subject' :	'Password restore. Health.sy-way.com.'
    }})
    // console.log('User controller send', sendMailResp);
    res.send(sendMailResp);
  }

  async _getUsers(req, res){
    // console.log('get users by type:')  
    const role = req.query.role;
    try{
      let filter = '';
      switch (role) {
        case 'staff':
          filter = 'AND usertype_id NOT IN (3)'
          break;
        case 'client':
          filter = 'AND usertype_id IN (3)'
          break;
        case 'lead':
          const leads = await DB.query('SELECT * FROM leads WHERE NOT archive ORDER BY firstname, lastname');
          return res.send(leads.rows)
      }
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
        WHERE NOT u.archive 
        ${filter}
        ORDER BY firstname, lastname;`
      const users = await DB.query(sql)
      return res.send(users.rows)
    } catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  // async getUsers(req, res){
  //   // console.log('get all users:')    
  //   try{
  //     const sql = `
  //       SELECT 
  //         u.id AS id,
  //         u.firstname AS firstname,
  //         u.lastname AS lastname,
  //         u.email AS email,
  // --        u.ts,
  //         u.usertype_id AS usertype_id,
  //         ut.usertype AS usertype,
  //         u.avatar AS avatar
  //       FROM users u 
  //       JOIN user_types ut ON ut.id = u.usertype_id
  //       WHERE NOT u.archive
  //       ORDER BY firstname, lastname;`
  //     const users = await DB.query(sql)
  //     return res.send(users.rows)
  //   } catch(e){
  //     console.log(`Error: ${e}`)  
  //     return res.status(500).json({message: "The connection with DB was lost."})
  //   }
  // }

  async getUser(req, res){
    const id = req.params.id
    // console.log('get user by ID:', id)
    try{
      const sql = `
        WITH 
        loyal AS (
            SELECT 
                client_id, 
                SUM(points) AS total_points 
            FROM loyalty 
            WHERE client_id = $1 
            GROUP BY client_id
        ),
        refs AS (
            SELECT
                ref_id,
                COUNT(id) AS total_refs
            FROM users
            WHERE ref_id = $1
            GROUP BY ref_id
        )
        SELECT 
            u.id AS id, 
            u.firstname AS firstname, 
            u.lastname AS lastname, 
            u.email AS email, 
            u.usertype_id AS usertype_id, 
            u.avatar AS avatar,
            u.bank_acc AS bank_acc,
            l.total_points AS total_points,
            refs.total_refs AS total_refs
        FROM users u
        LEFT JOIN loyal l ON l.client_id = u.id
        LEFT JOIN refs ON refs.ref_id = u.id
        WHERE id = $1;`
      // console.log(`sql:\n #${sql}:`)
      const user = await DB.query(sql, [id])
      // console.log(`user #${id}:`, user.rows[0])
      res.send(user.rows[0])
    }catch(e){
      console.log(`Error: ${e}`)  
      return res.status(500).json({message: "The connection with DB was lost."})
    }
  }

  async updateUser(req, res){
    const id = req.params.id
    // console.log(`try to update user ${id}`);
    const oldAvatar = await DB.query(`SELECT avatar FROM users WHERE id = $1`, [id])
    if(req.files){
      // delete current avatar
      // console.log('avatar:', oldAvatar.rows)
      if(oldAvatar || oldAvatar.rows[0].avatar !== ''){
        const folderName = process.env.filePath + '/avatars'
        const pathFile = folderName + '/' + oldAvatar.rows[0].avatar
        // console.log('pathFile:', pathFile)
        if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile)
  
        // save the avatar
        const file = req.files.avatar
        // console.log('File:', file)
        try { if (!fs.existsSync(folderName)) fs.mkdirSync(folderName) } catch (e) { console.error(e) }
        const pathNewFile = folderName + '/' + file.name
        if (fs.existsSync(pathNewFile)) {
          return res.status(400).json({message: 'File already exist'})
        }
        // console.log('try to move')
        file.mv(pathNewFile)
        // console.log('file was saved')
      }
    }

    // save to DB
    const {firstname, lastname, email, promo, usertype_id, password, bank_acc} = req.body
    const avatar = req.files ? req.files.avatar.name : oldAvatar.rows[0].avatar
    // console.log(id, firstname, lastname, email, promo, usertype_id, password, avatar, bank_acc);
    const sql =`
      UPDATE users SET
        firstname   = $2,
        lastname    = $3,
        email       = $4,
        promo       = $5,
        usertype_id = $6,
        avatar      = $7,
        bank_acc    = $8
      WHERE id = $1;`
    await DB.query(sql, [id, firstname, lastname, email, (promo ? true : false), usertype_id, avatar, (bank_acc ? bank_acc : null)])
    // console.log(`user #${id} was updates`)
    if(password) {
      const hashedPassword = await bcrypt.hash(password, 12)
      await DB.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, id])
    }
    res.send(true) 
  }
  
  async deleteUser(req, res){
    const id = req.params.id
    // console.log('delete user by ID:', id)
    // const sql = `DELETE FROM users WHERE id = $1 RETURNING firstname, lastname;`
    const sql =`UPDATE users SET archive = true WHERE id = $1;`    
    const userDeleted = await DB.query(sql, [id])
    // console.log(`user #${id} with SQL: ${sql}. `, userDeleted)
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
      AND NOT u.archive
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

  async getLoyaltyClient(req, res){
    const id = req.params.id
    // console.log(`get loyalty for client ${id}`)

    let sql = `
      SELECT
        SUM(final_cost) AS procedure_points
      FROM timetable
      WHERE user_id = $1
    `
    const procedure_points = await DB.query(sql,[id])

    sql = `
      WITH costs AS (
        SELECT DISTINCT ON (user_id)
            user_id,
            final_cost
        FROM timetable
        WHERE user_id = ANY(SELECT id FROM users WHERE ref_id = $1)
      )
      SELECT 
          SUM(final_cost) AS ref_points
      FROM costs
    `
    const ref_points = await DB.query(sql,[id])

    // console.log(`Points for ${id}:`, {
    //   'procedure_points': procedure_points.rows[0].procedure_points,
    //   'ref_points'      : ref_points.rows[0].ref_points
    // })

    res.send({
      'procedure_points': procedure_points.rows[0].procedure_points,
      'ref_points'      : ref_points.rows[0].ref_points
    })    
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

  async getPartners(req, res){
    const sql = `
WITH
  clients AS (
    SELECT
      u.id as id,
    u.partner_id as partner_id,
      u.firstname as firstname,
      u.lastname as lastname,
      u.email as email,
      u.phone as phone,
      u.ts as ts
    FROM users u
    JOIN notes n ON u.id = n.client_id
    WHERE n.paid
    AND NOT n.paid_to_partner
    GROUP BY u.id
  ),
  first_cos_invoices AS (
    SELECT DISTINCT ON (client_id)
      id AS invoice_id,
      client_id,
      procedure_id,
      to_number((bill -> 'qty')::text, '9999.99') as qty_first_invoice,
      to_number((bill -> 'cost')::text, '9999.99') as cost_first_invoice,
      to_number((bill -> 'qty')::text, '9999.99') * to_number((bill -> 'cost')::text, '9999.99') * 0.09 as total_sum_first_cos_invoice
    FROM notes
    WHERE client_id IN(SELECT id FROM clients)
    AND procedure_id IN (SELECT id FROM procedures WHERE proceduretype_id = 4)
    AND paid
  ),
  first_med_invoices AS (
    SELECT DISTINCT ON (client_id)
      id AS invoice_id,
      client_id,
      procedure_id,
      to_number((bill -> 'qty')::text, '9999.99') as qty_first_invoice,
      to_number((bill -> 'cost')::text, '9999.99') as cost_first_invoice,
      to_number((bill -> 'qty')::text, '9999.99') * to_number((bill -> 'cost')::text, '9999.99') * 0.045 as total_sum_first_med_invoice
    FROM notes
    WHERE client_id IN(SELECT id FROM clients)
    AND procedure_id IN (SELECT id FROM procedures WHERE proceduretype_id != 4)
    AND paid
  ),
  cos_invoices AS (
    SELECT
      id AS invoice_id,
      client_id,
      procedure_id,
      to_number((bill -> 'qty')::text, '9999.99') as qty_first_invoice,
      to_number((bill -> 'cost')::text, '9999.99') as cost_first_invoice,
      to_number((bill -> 'qty')::text, '9999.99') * to_number((bill -> 'cost')::text, '9999.99') * 0.01 as total_sum_cos_invoice
    FROM notes
    WHERE client_id IN(SELECT id FROM clients)
    AND procedure_id IN (SELECT id FROM procedures WHERE proceduretype_id = 4)
    AND paid
  ),
  med_invoices AS (
    SELECT
      id AS invoice_id,
      client_id,
      procedure_id,
      to_number((bill -> 'qty')::text, '9999.99') as qty_first_invoice,
      to_number((bill -> 'cost')::text, '9999.99') as cost_first_invoice,
      to_number((bill -> 'qty')::text, '9999.99') * to_number((bill -> 'cost')::text, '9999.99') * 0.005 as total_sum_med_invoice
    FROM notes
    WHERE client_id IN(SELECT id FROM clients)
    AND procedure_id IN (SELECT id FROM procedures WHERE proceduretype_id != 4)
    AND paid
  ),
  total_cos AS (
    SELECT
      ci.client_id,
      SUM(CASE WHEN ci.total_sum_cos_invoice IS NOT NULL
          THEN ci.total_sum_cos_invoice 
          ELSE 0
        END
        +
        CASE WHEN fci.total_sum_first_cos_invoice IS NOT NULL
          THEN fci.total_sum_first_cos_invoice 
          ELSE 0
        END
      ) AS total_cos
    FROM cos_invoices ci
    FULL JOIN first_cos_invoices fci ON ci.invoice_id = fci.invoice_id
    JOIN clients c ON ci.client_id = c.id
    GROUP BY ci.client_id
  ),
  total_med AS (
    SELECT
      mi.client_id,
      SUM(CASE WHEN mi.total_sum_med_invoice IS NOT NULL
          THEN mi.total_sum_med_invoice 
          ELSE 0
        END
        +
        CASE WHEN fmi.total_sum_first_med_invoice IS NOT NULL
          THEN fmi.total_sum_first_med_invoice 
          ELSE 0
        END
      ) AS total_med
    FROM med_invoices mi
    FULL JOIN first_med_invoices fmi ON mi.invoice_id = fmi.invoice_id
    JOIN clients c ON mi.client_id = c.id
    GROUP BY mi.client_id
  ),
  client_payments AS (
  SELECT 
    c.id as id,
    c.partner_id as partner_id,
    c.firstname as firstname,
    c.lastname as lastname,
    c.email as email,
    c.phone as phone,
    c.ts as ts,
    tm.total_med AS total_med_cost,
    tc.total_cos AS total_cos_cost
  FROM clients c
  JOIN total_cos tc ON c.id=tc.client_id
  JOIN total_med tm ON c.id=tm.client_id
  )
SELECT 
  u.id,
  u.firstname as firstname,
  u.lastname as lastname,
  u.email as email,
  u.phone as phone,
  u.ts as ts,
  SUM(cp.total_med_cost) AS total_med_cost,
  SUM(cp.total_cos_cost) AS total_cos_cost,
  SUM(cp.total_med_cost + cp.total_cos_cost) AS total
FROM users u
JOIN client_payments cp ON u.id = cp.partner_id
WHERE u.usertype_id = 5
GROUP BY u.id
ORDER BY u.firstname, u.lastname;`
    const partners = await DB.query(sql)
    console.log('partners.rows', partners.rows)
    res.send(partners.rows)    
  }

  async getPartnerClients(req, res){
    const partner_id = req.params.id;
    console.log('Get clients for partner:', partner_id);
    const sql = `
WITH
  clients AS (
    SELECT
      u.id as id,
      u.firstname as firstname,
      u.lastname as lastname,
      u.email as email,
      u.ts as ts
    FROM users u
    JOIN notes n ON u.id = n.client_id
    WHERE partner_id = $1
    AND n.paid
    AND NOT n.paid_to_partner
    GROUP BY u.id
  ),
  first_cos_invoices AS (
    SELECT DISTINCT ON (client_id)
      id AS invoice_id,
      client_id,
      procedure_id,
      to_number((bill -> 'qty')::text, '9999.99') as qty_first_invoice,
      to_number((bill -> 'cost')::text, '9999.99') as cost_first_invoice,
      to_number((bill -> 'qty')::text, '9999.99') * to_number((bill -> 'cost')::text, '9999.99') * 0.09 as total_sum_first_cos_invoice
    FROM notes
    WHERE client_id IN(SELECT id FROM clients)
    AND procedure_id IN (SELECT id FROM procedures WHERE proceduretype_id = 4)
    AND paid
  ),
  first_med_invoices AS (
    SELECT DISTINCT ON (client_id)
      id AS invoice_id,
      client_id,
      procedure_id,
      to_number((bill -> 'qty')::text, '9999.99') as qty_first_invoice,
      to_number((bill -> 'cost')::text, '9999.99') as cost_first_invoice,
      to_number((bill -> 'qty')::text, '9999.99') * to_number((bill -> 'cost')::text, '9999.99') * 0.045 as total_sum_first_med_invoice
    FROM notes
    WHERE client_id IN(SELECT id FROM clients)
    AND procedure_id IN (SELECT id FROM procedures WHERE proceduretype_id != 4)
    AND paid
  ),
  cos_invoices AS (
    SELECT
      id AS invoice_id,
      client_id,
      procedure_id,
      to_number((bill -> 'qty')::text, '9999.99') as qty_first_invoice,
      to_number((bill -> 'cost')::text, '9999.99') as cost_first_invoice,
      to_number((bill -> 'qty')::text, '9999.99') * to_number((bill -> 'cost')::text, '9999.99') * 0.01 as total_sum_cos_invoice
    FROM notes
    WHERE client_id IN(SELECT id FROM clients)
    AND procedure_id IN (SELECT id FROM procedures WHERE proceduretype_id = 4)
    AND paid
  ),
  med_invoices AS (
    SELECT
      id AS invoice_id,
      client_id,
      procedure_id,
      to_number((bill -> 'qty')::text, '9999.99') as qty_first_invoice,
      to_number((bill -> 'cost')::text, '9999.99') as cost_first_invoice,
      to_number((bill -> 'qty')::text, '9999.99') * to_number((bill -> 'cost')::text, '9999.99') * 0.005 as total_sum_med_invoice
    FROM notes
    WHERE client_id IN(SELECT id FROM clients)
    AND procedure_id IN (SELECT id FROM procedures WHERE proceduretype_id != 4)
    AND paid
  ),
  total_cos AS (
    SELECT
      ci.client_id,
      SUM(CASE WHEN ci.total_sum_cos_invoice IS NOT NULL
          THEN ci.total_sum_cos_invoice 
          ELSE 0
        END
        +
        CASE WHEN fci.total_sum_first_cos_invoice IS NOT NULL
          THEN fci.total_sum_first_cos_invoice 
          ELSE 0
        END
      ) AS total_cos
    FROM cos_invoices ci
    FULL JOIN first_cos_invoices fci ON ci.invoice_id = fci.invoice_id
    JOIN clients c ON ci.client_id = c.id
    GROUP BY ci.client_id
  ),
  total_med AS (
    SELECT
      mi.client_id,
      SUM(CASE WHEN mi.total_sum_med_invoice IS NOT NULL
          THEN mi.total_sum_med_invoice 
          ELSE 0
        END
        +
        CASE WHEN fmi.total_sum_first_med_invoice IS NOT NULL
          THEN fmi.total_sum_first_med_invoice 
          ELSE 0
        END
      ) AS total_med
    FROM med_invoices mi
    FULL JOIN first_med_invoices fmi ON mi.invoice_id = fmi.invoice_id
    JOIN clients c ON mi.client_id = c.id
    GROUP BY mi.client_id
  )
SELECT 
  c.id as id,
  c.firstname as firstname,
  c.lastname as lastname,
  c.email as email,
  c.ts as ts,
  tm.total_med AS total_med_cost,
  tc.total_cos AS total_cos_cost
FROM clients c
JOIN total_cos tc ON c.id=tc.client_id
JOIN total_med tm ON c.id=tm.client_id
-- 	GROUP BY c.id, c.firstname, c.lastname, c.email, c.ts
ORDER BY c.firstname, c.lastname;`
    const clients = await DB.query(sql, [partner_id])
    console.log('clients.rows', clients.rows)
    res.send(clients.rows)    
  }

  async partnerPaidOut(req, res){
    const partner_id = req.params.id;
    console.log('Paid out for partner:', partner_id);
    const sql = `UPDATE notes SET paid_to_partner = true WHERE client_id IN (SELECT id FROM users WHERE partner_id = $1)`
    const client = await DB.query(sql, [partner_id])
    console.log('client', client.rows[0])
    res.send(client.rows)    
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