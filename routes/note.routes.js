const {Router} = require('express')
const noteController = require('../controllers/note.controller')
const router = Router()

router.post('/note', noteController.createNote)
router.get('/notes', noteController.getNotes)
router.get('/note/:id', noteController.getNote)
router.post('/note/:id', noteController.updateNote)
router.patch('/note/:id', noteController.deleteNote)

module.exports = router 