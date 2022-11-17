const {Pool} = require('pg')

const connect = `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DBNAME}`;

const pool = new Pool({
  // user:     process.env.RDS_USERNAME,
  // host:     process.env.RDS_HOSTNAME,
  // database: process.env.RDS_DBNAME,
  // password: process.env.RDS_PASSWORD,
  // port:     process.env.RDS_PORT,
  connectionString: connect,
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = pool
