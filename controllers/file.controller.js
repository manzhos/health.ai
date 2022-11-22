const DB = require('../db')
const fs = require('fs')
const uuid = require('uuid')
require('dotenv').config()

class FileController {
  async uploadFile(req, res){
    if(!req.files) return

    // save the file
    const file = req.files.file
    const fileName = uuid.v4() + '_' + file.name
    // console.log('File:', file)
    // console.log('fileName:', fileName)
    const folderName = process.env.filePath + '\\docs'
    try { if (!fs.existsSync(folderName)) fs.mkdirSync(folderName) } catch (e) { console.error(e) }
    const pathFile = folderName + '\\' + fileName
    // console.log('\nPath:', folderName)
    if (fs.existsSync(pathFile)) {
      return res.status(400).json({message: 'File already exist'})
    }
    // console.log('try to move')
    file.mv(pathFile)
    // console.log('file was saved')
  
    // add file to DB
    const {doctor_id, note_id} = req.body
    const sql = 'INSERT INTO files (filename, type, size, path, user_id, ts, doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
    const ts = new Date()
    const type = file.name.split('.').pop()
    // console.log('for DB:\n', fileName, type, file.size, folderName, doctor_id, ts, note_id)    
    const newFile = await DB.query(sql, [fileName, type, file.size, folderName, doctor_id, ts, note_id])
    // console.log('newFile:', newFile)
    res.send(newFile.rows[0])  
  }

  async getFiles(req, res){
    console.log('get all files')
    try {
      const sql = `SELECT * FROM files ORDER BY filename`
      const files = await DB.query(sql)
      console.log(files.rows)
      res.send(files.rows)
    } catch(e) {
      console.log(`Error: ${e}`)
      return res.status(500).json({message: "The connection with database was lost."})
    }
  }

  async getFilesByNote(req, res){
    const note_id = req.params.id
    try {
      const sql = `SELECT * FROM files WHERE doc_id = $1 ORDER BY filename;`
      const files = await DB.query(sql, [note_id])
      // console.log(files.rows)
      res.send(files.rows)
    } catch(e) {
      console.log(`Error: ${e}`)
      return res.status(500).json({message: "The connection with database was lost."})
    }
  }

  async deleteFile(req, res){
    console.log('delete File by ID')
  }
}

module.exports = new FileController()