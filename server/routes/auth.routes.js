const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()
require('dotenv').config()

// /api/auth/register
// router.post(
//   '/register',
//   [
//     check('username', 'Minimal length of username 3 symbols').isLength({ min: 3 }),
//     check('password', 'Minimal length of password 8 symbols').isLength({ min: 8 })
//   ],
//   async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: errors.array(),
//         message: 'Invalid data in registration fields'
//       })
//     }
//     const {username, password} = req.body
//     const newuser = await User.findOne({ username })
//     if (newuser) return res.status(400).json({ message: 'User already exist' })

//     const hashedPassword = await bcrypt.hash(password, 12)
//     const user = new User({ username, password: hashedPassword })

//     await user.save()
//     res.status(201).json({ message: 'New user created' })

//   } catch (e) {
//     res.status(500).json({ message: 'Something wrong...' })
//   }
// })

// /api/auth/login
router.post(
  '/login', (req, res)=>{res.json({message: 'login'})}
  // async (req, res) => {
  // try {
  //   const {username, password} = req.body
  //   const user = await User.findOne({ username })
  //   if (!user) return res.status(400).json({ message: 'User not found' })

  //   const isMatch = await bcrypt.compare(password, user.password)
  //   if (!isMatch) return res.status(400).json({ message: 'Incorrect password' })

  //   const token = jwt.sign(
  //     { userId: user.id },
  //     config.get('jwtSecret'),
  //     { expiresIn: '1h' }
  //   )
  //   res.json({ token, userId: user.id })
  // } catch (e) {
  //   res.status(500).json({ message: 'Something wrong' })
  // }
// }
)

module.exports = router
