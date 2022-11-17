const {Router} = require('express')
const fileController = require('../controllers/file.controller')
const router = Router()

router.post('/file', fileController.uploadFile)
router.get('/files', fileController.getFiles)
// router.get('/file/:id', fileController.getFile)
router.delete('/file/:id', fileController.deleteFile)

module.exports = router 