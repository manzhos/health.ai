const express    = require('express')
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