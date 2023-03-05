const {Router} = require('express');
const loyaltyController = require('../controllers/loyalty.controller');
const router = Router();
const {check, validationResult} = require('express-validator')

const validateFields = [
  check('email', 'Check the Email').isEmail()
]

router.get('/fake', loyaltyController.seedFakeLead);

router.post('/loyalty', loyaltyController.createLoyalty);

router.post(
  '/form',  
  validateFields, 
  loyaltyController.addLead
);

router.get('/leadsum', loyaltyController.sumLead);

// router.get('/loyaltyes',          loyaltyController.getLoyaltyes)
// router.get('/loyalty_client/:id', loyaltyController.getLoyaltyClient)
// router.get('/loyalty/:id',        loyaltyController.getLoyalty)
// router.post('/loyalty/:id',       loyaltyController.updateLoyalty)
router.get('/delloyalty/:id',      loyaltyController.deleteLoyalty);

module.exports = router