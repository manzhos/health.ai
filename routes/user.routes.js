const {Router} = require('express')
const userController = require('../controllers/user.controller')
const router = Router()
const {check, validationResult} = require('express-validator')

const validateFields = [
  check('email', 'Check the Email').isEmail(),
  check('password', 'Minimal length of password 8 symbols').isLength({ min: 8 })
]

router.post(
  '/user', 
  validateFields, 
  userController.createUser
)

router.post('/login', userController.loginUser)

router.post(
  '/loginpwa', 
  validateFields,  
  userController.loginPwaUser
  )
  
router.get('/leaduser/:id', userController.leadToClient)
router.post('/restorepass', userController.restorePass)

router.get('/user', userController._getUsers)
// router.get('/users', userController.getUsers)
router.get('/user/:id', userController.getUser)
router.post('/user/:id', userController.updateUser)
router.get('/deluser/:id', userController.deleteUser)

router.get('/partners', userController.getPartners)
router.get('/clients', userController.getClients)
router.get('/doctors', userController.getDoctors)
router.get('/roles', userController.getRoles)

router.get('/partnerclients/:id', userController.getPartnerClients)
router.get('/paidout/:id', userController.partnerPaidOut)

router.get('/clients_by_doctor/:id', userController.getClientsByDoctor)
router.get('/client/loyalty/:id', userController.getLoyaltyClient)

module.exports = router 