const {Pool} = require('pg')

const pool = new Pool({
  user:     process.env.RDS_USERNAME,
  host:     process.env.RDS_HOSTNAME,
  database: process.env.RDS_DBNAME,
  password: process.env.RDS_PASSWORD,
  port:     process.env.RDS_PORT,
})

module.exports = pool