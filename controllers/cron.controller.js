const DB = require('../db');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

class cronController {  
  async cron(req, res){
    console.log('CRON');
    // # ┌────────────── second (optional)
    // # │ ┌──────────── minute
    // # │ │ ┌────────── hour
    // # │ │ │ ┌──────── day of month
    // # │ │ │ │ ┌────── month
    // # │ │ │ │ │ ┌──── day of week
    // # │ │ │ │ │ │
    // # │ │ │ │ │ │
    // # * * * * * *
    const mode     = req.query.mode,
          sec      = req.query.sec      || '*',
          min      = req.query.min      || '*',
          hour     = req.query.hour     || '*',
          dayMonth = req.query.dayMonth || '*',
          month    = req.query.month    || '*',
          dayWeek  = req.query.dayWeek  || '*';

    console.log('query:', sec, min, hour, dayMonth, month, dayWeek);
    const task = cron.schedule(`${sec} ${min} ${hour} ${dayMonth} ${month} ${dayWeek}`, () => {
      console.log('running a task every second:', Date.now());
    }, {
      scheduled: true,
      // timezone: "America/Sao_Paulo"
    });
    if(mode === 'stop'){
      console.log('the task \"everySecTask\" is stopped');
      task.stop();
    }
    res.status(200).json({'message':'OK'});
  }
}

module.exports = new cronController()