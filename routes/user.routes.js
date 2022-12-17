const {Router} = require('express')
const userController = require('../controllers/user.controller')
const router = Router()

router.post('/user', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/loginpwa', userController.loginPwaUser)
router.get('/users', userController.getUsers)
router.get('/user/:id', userController.getUser)
router.post('/user/:id', userController.updateUser)
router.patch('/user/:id', userController.deleteUser)

router.get('/clients', userController.getClients)
router.get('/doctors', userController.getDoctors)
router.get('/roles', userController.getRoles)

router.get('/clients_by_doctor/:id', userController.getClientsByDoctor)

module.exports = router 