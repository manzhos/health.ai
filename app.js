const express    = require('express')
const session = require('express-session');
const cors       = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const app        = express()
const nodemailer = require('nodemailer')
require('dotenv').config()


if(process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
}

const PORT = process.env.PORT || 3300

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

app.use(express.json({ extended: true }))
// app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api', require('./routes/user.routes'))
app.use('/api', require('./routes/file.routes'))
app.use('/api', require('./routes/procedure.routes'))
app.use('/api', require('./routes/timetable.routes'))
app.use('/api', require('./routes/note.routes'))
app.use(express.static('files'))

// app.get('/', (req, res)=>{res.send('hello, man')});

app.post('/send_mail', cors(), async (req, res) => {
  const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })
  let {text, mailTo, subject} = req.body

  await transport.sendMail({
    from:     process.env.MAIL_FROM,
    to:       mailTo || 'manzhos@gmail.com',
    subject:  subject || 'testmail',
    html:     `<div className="email" style="border: 1px solid black; padding: 20px; font-family: sans-serif;  line-height: 2; font-size: 20px;">
                <h2>Hello!</h2>
                <p>${text || 'Welcome'}</p>
                <p>Kind regards, Your Health.AI</p>
              </div>`
  })
})

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
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID      = process.env.GOOGLE_CLIENT_ID;       //'our-google-client-id';
const GOOGLE_CLIENT_SECRET  = process.env.GOOGLE_CLIENT_SECRET;   //'our-google-client-secret';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3300/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

const DB = require('./db')
// app.use('/auth', require('./routes/auth.routes'))
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  async function(req, res) {
    // Successful authentication, redirect success.
    console.log('req:', req.user);
    const googleUser = {
      'id':         req.user.id,
      'firstName':  req.user.name.givenName,
      'lastName':   req.user.name.familyName,
      'emails':     req.user.name.emails,
      'photos':     req.user.name.photos,
    }
    console.log('googleUser:', googleUser);
    // const users = await DB.query('SELECT * FROM users ');
    // console.log('users:', users);

    // res.redirect('http://localhost:3000/consult');
  });
  