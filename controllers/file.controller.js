const DB  = require('../db')
const fs  = require('fs')
const ftp = require('basic-ftp') 
require('dotenv').config()

console.log('FTP:', ftp)

class FileController {
  
  async uploadFile(req, res){
    console.log('Upload File started')

    async function ftpUpload(file, filePath) {
      const client = new ftp.Client()
      client.ftp.verbose = true
      try {
          await client.access({
              host: "212.1.211.72",
              port: 21,
              user: "u958818119",
              password: "zqs3ROG4",
              secure: true
          })
          console.log(await client.list())
          let res = await client.uploadFrom(file, filePath)
          console.log('result of upload:', res)
          // await client.downloadTo("README_COPY.md", "README_FTP.md")
      }
      catch(err) {
          console.log(err)
      }
      client.close()
    }

    try{
      // save file
      // const {user_id} = req.body
      // console.log('User:', user_id)
      const file = req.files.file
      const folderName = process.env.filePath + '\\test_tmp'
      // try {
      //   if (!fs.existsSync(folderName)) {
      //     fs.mkdirSync(folderName)
      //     console.log(`the ${folderName} was made`)
      //   }
      // } catch (e) {
      //   console.error(e);
      // }

      const pathFile = folderName + '\\' + file.name
      console.log('File:', file)
      console.log('\nPath:', folderName)
      console.log('\pathFile:', pathFile)
      // if (fs.existsSync(pathFile)) {
      //   return res.status(400).json({message: 'File already exist'})
      // }
      console.log('try to move')
      // file.mv(pathFile)
      ftpUpload(file, pathFile)
      console.log('file was saved')

      // // add file to DB
      // const sql = 'INSERT INTO files (filename, type, size, path, user_id, ts) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
      // const ts = new Date()
      // const type = file.name.split('.').pop()
      // console.log('for DB:\n', file.name, type, file.size, path, user_id, ts)    
      // const newFile = await DB.query(sql, [file.name, type, file.size, path, user_id, ts])
      // // console.log('newFile:', newFile)
      // res.send(newFile.rows[0])  
    } catch (e) {
      console.log(e)
      return res.status(500).json({message: 'Upload error'})
    }    
    res.send(true)
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

  async deleteFile(req, res){
    console.log('delete File by ID')
  }
}

module.exports = new FileController()