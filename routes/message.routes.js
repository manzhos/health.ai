const {Router} = require('express')
const messageController = require('../controllers/message.controller')
const router = Router()

router.post('/message',             messageController.createMessage)
router.get('/messages',             messageController.getMessages)
router.get('/messages/:id',         messageController.getMessagesByUserId)
router.get('/messagesbyticket/:id', messageController.getMessagesByTicket)
router.get('/message/:id',          messageController.getMessage)

module.exports = router 