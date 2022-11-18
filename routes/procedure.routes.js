const {Router} = require('express')
const procedureController = require('../controllers/procedure.controller')
const router = Router()

router.post('/procedure', procedureController.createProcedure)
router.get('/procedures', procedureController.getProcedures)
router.get('/procedures_inf', procedureController.getProceduresInf)
router.get('/procedure/:id', procedureController.getProcedure)
router.patch('/procedure/:id', procedureController.updateProcedure)
router.delete('/procedure/:id', procedureController.deleteProcedure)

router.get('/proceduretypes', procedureController.getProcedureTypes)

router.get('/procedures/:user_id', procedureController.getUserProcedures)
router.get('/doc_procedures/:doctor_id', procedureController.getDoctorProcedures)

module.exports = router 