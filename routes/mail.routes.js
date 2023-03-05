const {Router} = require('express');
const mailController = require('../controllers/mail.controller');
const router = Router();
const cors = require('cors');

router.post('/mail', cors(), mailController._sendMail);

router.post('/newmail', mailController.createMail)
router.post('/mail/:id', mailController.updateMail)
router.get('/delmail/:id', mailController.deleteMail)
router.get('/mail', mailController.getMail)
router.get('/fakemail', mailController.fakeMail)

module.exports = router;