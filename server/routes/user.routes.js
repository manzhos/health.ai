const {Router} = require('express')
const userController = require('../controllers/user.controller')
const router = Router()

router.post('/user', userController.createUser)
router.get('/users', userController.getUsers)
router.get('/user/:id', userController.getUser)
router.put('/user', userController.updateUser)
router.delete('/user/:id', userController.deleteUser)

module.exports = router 