const DB = require('../db')
const fs = require('fs')
const uuid = require('uuid')
require('dotenv').config()

class FileController {
  async uploadFile(req, res){
    if(!req.files) return res.status(400).json({message: 'Reload please'});    
    const doc_id = req.params.id
    const {user_id, client_id} = req.body
    if(!user_id || !client_id || !doc_id) return res.status(400).json({message: 'Relogin please'});
    // console.log('UPLOAD FILES:', user_id, client_id, doc_id);

    const folderName = process.env.filePath + '\\docs' + '\\' + doc_id
    // console.log('folderName:', folderName)
    try { if (!fs.existsSync(folderName)) fs.mkdirSync(folderName) } catch (e) { console.error(e) }
    
    let file = []
    if(req.files.file.length && req.files.file.length > 0) file = req.files.file
    else file.push(req.files.file)
    console.log('uploaded files:', file);
    let fileName = [],
    pathFile = []

    const currentFiles = await DB.query('SELECT * FROM files WHERE doc_id = $1', [doc_id]);
    // console.log('currentFiles:', currentFiles.rows)
    if(currentFiles?.rows?.length) {
      let fileForDel = file.map((f, key) => (currentFiles.rows.find((cf) => file[key].name !== cf.filename)))
      if(fileForDel && fileForDel.length){
        console.log('fileDeleting:', fileForDel);
        fileForDel.map((fDel)=>{
          console.log('\n\nuser_id, fDel.user_id >>>\n', user_id, fDel.user_id)
          if(Number(user_id) === Number(fDel.user_id))
            fs.unlink(folderName + '\\' + fDel.filename, err => {
              if(err) throw err; // не удалось удалить файл
              const sql = `DELETE FROM files WHERE filename = $1 RETURNING filename;`
              const fileDeleted = DB.query(sql, [fDel.filename])
              // console.log('file deleted:', fileDeleted);
            });
        })
      }
    }

    // save/delete the file
    for(let key in file){
      // fileName[key] = uuid.v4() + '_' + file[key].name
      fileName[key] = file[key].name; //'timetable_' + doc_id + '---' + file[key].name
      if(currentFiles?.rows.find((cf) => cf.filename === fileName[key])) continue
      pathFile[key] = folderName + '\\' + fileName[key]
      // console.log('\nPath:', folderName, pathFile[key])
      // if (fs.existsSync(pathFile[key])) {
      //   return res.status(400).json({message: 'File already exist'})
      // }

      // console.log('try to move')
      file[key].mv(pathFile[key])
      // console.log('file was saved')

      // add file to DB
      const sql = 'INSERT INTO files (filename, type, size, path, user_id, client_id, doc_id, ts) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
      const ts = new Date()
      const type = file[key].name.split('.').pop()
      // console.log('for DB:\n', fileName, type, file.size, folderName, user_id, client_id, doc_id, ts)    
      await DB.query(sql, [fileName[key], type, file[key].size, folderName, user_id, client_id, doc_id, ts])
      // console.log('newFile:', newFile)
    }
    const newFiles = await DB.query('SELECT * FROM files WHERE client_id = $1', [client_id])
    // console.log('newFiles:', newFiles)
    return res.send(newFiles.rows)  
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
      const sql = `SELECT * FROM files WHERE doc_id = $1 ORDER BY ts;`
      const files = await DB.query(sql, [note_id])
      // console.log(files.rows)
      res.send(files.rows)
    } catch(e) {
      console.log(`Error: ${e}`)
      return res.status(500).json({message: "The connection with database was lost."})
    }
  }

  async getFilesByUser(req, res){
    const client_id = req.params.id
    try {
      const sql = `SELECT * FROM files WHERE client_id = $1 ORDER BY ts;`
      const files = await DB.query(sql, [client_id])
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