const {Router} = require('express')
const loyaltyController = require('../controllers/loyalty.controller')
const router = Router()

router.post('/loyalty',           loyaltyController.createLoyalty)
// router.get('/loyaltyes',          loyaltyController.getLoyaltyes)
// router.get('/loyalty_client/:id', loyaltyController.getLoyaltyClient)
// router.get('/loyalty/:id',        loyaltyController.getLoyalty)
// router.post('/loyalty/:id',       loyaltyController.updateLoyalty)
router.get('/delloyalty/:id',      loyaltyController.deleteLoyalty)

module.exports = router 