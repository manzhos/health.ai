const express    = require('express')
const session    = require('express-session');
const cors       = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const app        = express()
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const cron       = require('node-cron');
require('dotenv').config()


if(process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
}

const PORT = process.env.PORT || 3300
const API_URL  = process.env.API_URL
const AUTH_URL = process.env.AUTH_URL
const URL      = process.env.URL    

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(fileUpload({}))

app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.get('/getdata',  async (req, res) => {
  try{
    const sql = `SELECT * FROM reception_hours WHERE doctor_id = $1;`
    // console.log(`sql:\n #${sql}:`)
    const reception = await DB.query(sql, [30])
    // console.log(`reception #${id}:`, reception.rows[0])
    res.send(reception.rows)
  }catch(e){
    console.log(`Error: ${e}`)  
    return res.status(500).json({message: "The connection with DB was lost."})
  }
})
app.get('/cleardata',  async (req, res) => {
  try{
    const sql = `DELETE FROM reception_hours WHERE doctor_id = $1;`
    // console.log(`sql:\n #${sql}:`)
    const reception = await DB.query(sql, [30])
    // console.log(`reception #${id}:`, reception.rows[0])
    res.send({message: "All data deleted"})
  }catch(e){
    console.log(`Error: ${e}`)  
    return res.status(500).json({message: "The connection with DB was lost."})
  }
})

app.use(express.json({ extended: true }))
app.use('/api', require('./routes/user.routes'))
app.use('/api', require('./routes/file.routes'))
app.use('/api', require('./routes/procedure.routes'))
app.use('/api', require('./routes/timetable.routes'))
app.use('/api', require('./routes/note.routes'))
app.use('/api', require('./routes/message.routes'))
app.use('/api', require('./routes/loyalty.routes'))
app.use('/api', require('./routes/reception.routes'))
app.use(express.static('files'))

app.use('/api', require('./routes/cron.routes'))
app.use('/api', require('./routes/mail.routes'))

// start cron
// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *
const sec      = '*', // req.query.sec     
      min      = '*', // req.query.min     
      hour     = '*', // req.query.hour    
      dayMonth = '*', // req.query.dayMonth
      month    = '*', // req.query.month   
      dayWeek  = '*'; // req.query.dayWeek 

console.log('CRON:', sec, min, hour, dayMonth, month, dayWeek);
// cron for mail
const mailController = require('./controllers/mail.controller');
const checkMail = cron.schedule(`${min} ${hour} ${dayMonth} ${month} ${dayWeek}`, () => {
  // console.log('running a task every min:', Date.now());
  mailController.sendQueueMail();
}, {
  scheduled: true,
});


/* TWILLIO */
app.use('/api', require('./routes/twilio.routes'))



// start server
async function start() {
  app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
}
start()

/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

// app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});



/*  Google AUTH  */
 
const GoogleStrategy        = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID      = process.env.GOOGLE_CLIENT_ID;       //'our-google-client-id';
const GOOGLE_CLIENT_SECRET  = process.env.GOOGLE_CLIENT_SECRET;   //'our-google-client-secret';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${URL}/auth/google/callback`
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

const DB = require('./db')
const url = require('url')

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  async function(req, res) {
    // Successful authentication, redirect success.
    // console.log('req:', req.user);
    const googleUser = {
      'id':         req.user.id,
      'firstName':  req.user.name.givenName,
      'lastName':   req.user.name.familyName,
      'email':      req.user.emails[0].value,
      'avatar':     req.user.photos[0].value,
    }
    // console.log('googleUser:', googleUser);
    let user = await DB.query('SELECT * FROM users WHERE email = $1', [googleUser.email]);
    // console.log('user:', user);
    if(!user || user.rows.length === 0){
      const hashedPassword = await bcrypt.hash(googleUser.id, 12)
      const sql = 'INSERT INTO users (firstname, lastname, email, password, ts, usertype_id, promo, avatar, confirm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *'
      let ts = new Date()
      // User type:::  1 - Admin, 2 - Doctor, 3 - Client
      // console.log('try to save: ', googleUser.firstName, googleUser.lastName, googleUser.email, hashedPassword, ts, 3, true, googleUser.avatar)
      user = await DB.query(sql,[googleUser.firstName, googleUser.lastName, googleUser.email, hashedPassword, ts, 3, true, googleUser.avatar])
      user = user.rows[0]
    } else {
      user = user.rows[0]
      const isMatch = await bcrypt.compare(googleUser.id, user.password)
      if (!isMatch) return res.status(400).json({ message: 'Incorrect password' })
    }
    
    const exp = '200h'
    const jwtSecret = process.env.jwtSecret
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: exp }
    )

    // console.log('token:', token)

    // res.redirect(url.format({
    //   hostname: URL,
    //   pathname:'/consult',
    //   query:{
    //     token: token,
    //     user : user
    //   },
    // }));
    res.redirect(`${URL}/successauthentication?token=${token}&user_id=${user.id}`);
  });
  
