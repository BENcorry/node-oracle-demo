const oracledb = require('oracledb')
oracledb.autoCommit = true
const fs = require('fs')

const config = require('./dbConfig')

let map = {}

function executeSql(sql) {
  return new Promise(async function (resolve, reject) {
    let conn;

    try {
      conn = await oracledb.getConnection(config);


      //将执行的sql语句写入到test。sql文件中，方便调试，代码写完后可注释
      fs.writeFile('test.sql', sql , function(err) {
        if(err) {console.log(err)}
        console.log('写入sql成功！')
      })

      let result = await conn.execute(sql);
      resolve(result);
      map.data = result
      map.errorCode = '0'
    } catch (err) { // catches errors in getConnection and the query
      reject(err);
      map.err = err
      map.errorCode = '1'
    } finally {
      if (conn) {   // the conn assignment worked, must release
        try {
          await conn.release();
        } catch (e) {
          console.error(e);
        }
      }
    }
  });
}

module.exports = {
  map: map,
  executeSql: executeSql
}