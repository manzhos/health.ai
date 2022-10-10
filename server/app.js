const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ extended: true }));

require('dotenv').config();
const PORT = process.env.PORT;

app.get('/hi', (req, res)=>{
  console.log('setMessage');
  res.send('hello, man');
});

// start server
app.listen(PORT, () => {
  console.log(`The server has been started on port:${PORT}`);
});
