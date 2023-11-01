const {Router} = require('express')
const procedureController = require('../controllers/procedure.controller')
const router = Router()

router.post('/procedure', procedureController.createProcedure)
router.get('/procedures', procedureController.getProcedures)
router.get('/onlineprocedures', procedureController.getOnlineProcedures)
router.get('/procedures_bytype/:id', procedureController.getProceduresByType)
router.get('/procedures_inf', procedureController.getProceduresInf)
router.get('/procedure/:id', procedureController.getProcedure)
router.patch('/procedure/:id', procedureController.updateProcedure)
router.delete('/procedure/:id', procedureController.deleteProcedure)

router.get('/proceduretypes', procedureController.getProcedureTypes)

router.get('/procedures/:user_id', procedureController.getUserProcedures)
router.get('/doc_procedures/:doctor_id', procedureController.getDoctorProcedures)
router.get('/tt_procedures', procedureController.getTimeTableProcedures)
router.get('/tt_procedures/:id', procedureController.getTimeTableProceduresById)
router.patch('/setprocedure_invoiced/:id', procedureController.updateTimeTableProceduresById)

module.exports = router 