const DB = require('../db')
const fs = require('fs')
const uuid = require('uuid')
require('dotenv').config()

class FileController {
  async uploadFile(req, res){
    if(!req.files) return

    const {doctor_id, note_id} = req.body
    const folderName = process.env.filePath + '\\docs'
    try { if (!fs.existsSync(folderName)) fs.mkdirSync(folderName) } catch (e) { console.error(e) }
    
    let file = []
    if(req.files.file.length && req.files.file.length > 0) file = req.files.file
    else file.push(req.files.file)

    let fileName = [],
    pathFile = []

    // save the file
    for(let key in file){
      fileName[key] = uuid.v4() + '_' + file[key].name
      // console.log('File:', file[key])
      // console.log('fileName:', fileName[key])
      pathFile[key] = folderName + '\\' + fileName[key]
      // console.log('\nPath:', folderName, pathFile[key])
      if (fs.existsSync(pathFile)) {
        return res.status(400).json({message: 'File already exist'})
      }
      // console.log('try to move')
      // let f = file[key]
      file[key].mv(pathFile[key])
      // console.log('file was saved')

      // add file to DB
      const sql = 'INSERT INTO files (filename, type, size, path, user_id, ts, doc_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
      const ts = new Date()
      const type = file[key].name.split('.').pop()
      // console.log('for DB:\n', fileName, type, file.size, folderName, doctor_id, ts, note_id)    
      await DB.query(sql, [fileName[key], type, file[key].size, folderName, doctor_id, ts, note_id])
      // console.log('newFile:', newFile)
    }
  
    const newFiles = await DB.query('SELECT * FROM files WHERE doc_id = $1', [note_id])
    // console.log('newFiles:', newFiles)
    res.send(newFiles.rows)  
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
    const id = req.params.id
    // console.log(`delete File by ID #${id}`)

    // delete from DB
    const sql = `DELETE FROM files WHERE id = $1 RETURNING filename;`
    const fileDeleted = await DB.query(sql, [id])
    // console.log('fileDeleted', fileDeleted)
    const fileName = fileDeleted.rows[0].filename
    // console.log(`file #${id}: ${fileName} with SQL: ${sql}`)
    
    //delete from FS
    const folderName = process.env.filePath + '\\docs'
    const pathFile = folderName + '\\' + fileName
    // console.log('pathFile:', pathFile)
    fs.unlink(pathFile, (err) => {
      if (err) {
        console.error(err)
        return
      }
      // console.log(`file #${id} removed`)
    })

    res.send(fileDeleted)    
  }
}

module.exports = new FileController()