const {Router} = require('express')
const noteController = require('../controllers/note.controller')
const router = Router()

router.post('/note', noteController.createNote)
router.get('/notes', noteController.getNotes)
router.get('/note_client/:id', noteController.getNoteClient)
router.get('/note/:id', noteController.getNote)
router.post('/note/:id', noteController.updateNote)
router.patch('/note/:id', noteController.deleteNote)

router.post('/doc', noteController.createDoc)
router.get('/docs', noteController.getDocs)
router.get('/doc/:id', noteController.getDoc)
router.post('/doc/:id', noteController.updateDoc)
router.patch('/doc/:id', noteController.deleteDoc)
router.get('/doc_client/:id', noteController.getDocClient)

module.exports = router 