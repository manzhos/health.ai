const express           = require('express')
const cors              = require('cors')
// const path              = require('path')
const bodyParser        = require('body-parser')
const app               = express()
require('dotenv').config()

const PORT = process.env.PORT

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.json({ extended: true }))
// app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api', require('./routes/user.routes'))
app.use('/api', require('./routes/procedure.routes'))
app.use('/api', require('./routes/timetable.routes'))

app.get('/hi', (req, res)=>{res.send('hello, man')});

// start server
async function start() {
  app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
}
start()