const express    = require('express')
const cors       = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const app               = express()
require('dotenv').config()

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

app.get('/', (req, res)=>{res.send('hello, man')});

if(process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
}

// start server
async function start() {
  app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
}
start()