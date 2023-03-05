const {Router} = require('express');
const mailController = require('../controllers/mail.controller');
const router = Router();
const cors = require('cors');

router.post('/mail', cors(), mailController._sendMail);

module.exports = router;