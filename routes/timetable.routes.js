const {Router} = require('express')
const timetableController = require('../controllers/timetable.controller')
const router = Router()

router.post('/timetable',       timetableController.createRecord)
router.get('/timetables',       timetableController.getRecords)
router.get('/timetable/:id',    timetableController.getRecord)
router.put('/timetable',        timetableController.updateRecord)
router.delete('/timetable/:id', timetableController.deleteRecord)

module.exports = router 