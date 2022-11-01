const {Router} = require('express')
const userController = require('../controllers/user.controller')
const router = Router()

router.post('/user', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/users', userController.getUsers)
router.get('/user/:id', userController.getUser)
router.put('/user/:id', userController.updateUser)
router.delete('/user/:id', userController.deleteUser)

router.get('/doctors', userController.getDoctors)
router.get('/roles', userController.getRoles)

module.exports = router 