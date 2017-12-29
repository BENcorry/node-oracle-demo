const oracledb = require('oracledb')
oracledb.autoCommit = true


const config = {
  user: 'df_mazca',
  password: '1',
  connectString: "192.168.3.241:1521/orcl"
}

module.exports = config
