const {Router} = require('express');
const cronController = require('../controllers/cron.controller');
const router = Router();

router.get('/cron/', cronController.cron);

module.exports = router