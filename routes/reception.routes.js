const {Router} = require('express')
const receptionController = require('../controllers/reception.controller')
const router = Router()

router.post('/reception', receptionController.createReception);
router.get('/reception/:id', receptionController.getReception);
router.get('/reception_bydoctor/:id', receptionController.getReceptionByDoctor);
router.post('/savereception', receptionController.saveReception);
router.patch('/reception/:id', receptionController.updateReception);
router.post('/receptionupd', receptionController.updReception);
router.delete('/reception/:id', receptionController.deleteReception);


module.exports = router 