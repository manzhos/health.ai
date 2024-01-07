const {Router} = require('express')
const fileController = require('../controllers/file.controller')
const router = Router()

router.post('/file/:id', fileController.uploadFile)
router.get('/files', fileController.getFiles)
router.get('/files/:id', fileController.getFilesByNote)
router.get('/userfiles/:id', fileController.getFilesByUser)
router.delete('/file/:id', fileController.deleteFile)

module.exports = router 