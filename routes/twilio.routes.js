const { Router } = require('express')
const twilioController = require('../controllers/twilio.controller')
const router = Router()

router.get('/twiliosend',   twilioController.send)
router.get('/twiliocheck',  twilioController.check)

module.exports = router;