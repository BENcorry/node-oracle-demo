const oracledb = require('oracledb')
const uuid = require('uuid/v4')

oracledb.autoCommit = true

const dbName = 'ma_ele_rg'
const db = require('../../db')

const executeSql = db.doSql.executeSql

module.exports = {
	getUUID: function() {
		return '{' + uuid().toUpperCase() + '}'
	},

	init: function() {
		let sql = `select * from sys_element where rg_code = '3700' and set_year = '2017' order by ele_code`
		return executeSql(sql)
	},

	getElementColumn: function(tablename, type, chr_id) {
		let sourceSql = ''
		if (type == '1') {
			sourceSql = `start with a.chr_id = '${chr_id}' connect by prior a.chr_id = a.parent_id`
		}
		let sql = `select a.* from ${tablename} a where a.set_year = '2017' and a.rg_code = '3700' ${sourceSql}`
		return executeSql(sql)
	},

	getElementDetailTree: function() {
		let elesql = `select t.chr_id id , t.ele_code , t.ele_code || ' ' || t.ele_name as name ,
		nvl (t.sys_id,'000') as pid ,
		 is_view ,is_operate from sys_element t
		  where t.set_year = '2017' 
		  and t.rg_code = '3700' 
		  order by t.ele_code`

		 let sql = `select t.sys_id , t.sys_id || ' ' || t.sys_name as sys_name, '0' pid from sys_app t order by t.sys_id `
		 return {
		 	list1: executeSql(elesql),
		 	list2: executeSql(sql)
		 }
	},

	getElementGrid: function(id) {
		console.log(id);
		let sql = `select chr_id as id, chr_code, chr_name as name, parent_id as pid, level_num
          from ma_ele_rg where set_year=2017 and parent_id = '${id}'`
		return executeSql(sql)
	},

	getElementForm: function(tablename) {
		let sql = `select * from SYS_TABLEMANAGER_FILED t 
		where t.table_name = ${tablename}
		 and t.rg_code = '3700' 
		 and t.set_year = '2017'
		  order by element_code `
		return executeSql(sql)
	},

	dataElementTree: function() {
		let elesql = ` select t.ele_id id , t.sys_id pid , t.ele_code||' '||t.ele_name as name ,t.ele_name, t.ele_code code , t.ele_colname ,
        t.ele_type,t.ele_format ,t.parameter , t.paratype , t.default_value from SYS_ELEMENT_COLUMN t where t.rg_code = '3700' and t.set_year = '2017'  order by t.ele_code `

		let sql = `select t.sys_id , t.sys_id || ' ' || t.sys_name as sys_name, '0' pid from sys_app t order by t.sys_id  `
		return {
			list1: executeSql(elesql),
			list2: executeSql(sql)
		}
	},

    //初始化数据元树刨除默认数据元
	dataElementTree1: function() {
		let elesql = ` select t.ele_id id , t.sys_id pid ,t.ele_code||' '||t.ele_name as name ,t.ele_name, t.ele_code code , t.ele_colname ,
        t.ele_type,t.ele_format ,t.parameter , t.paratype , t.default_value
         from SYS_ELEMENT_COLUMN t where t.is_sysdefault <> '1' and t.rg_code = '3700' and t.set_year = '2017'  order by t.ele_code `

		let sql = `select t.sys_id , t.sys_id || ' ' || t.sys_name as sys_name, '0' pid from sys_app t order by t.sys_id `
		return {
			list1: executeSql(elesql),
			list2: executeSql(sql)
		}
	},

	queryFormData: function(id) {
		let sql = `select * from SYS_ELEMENT_COLUMN t where t.ele_id = '${id}' `
		return executeSql(sql)
	},

	getOneRg: function(id) {
		let sql = `select chr_id as id, chr_code, chr_name as name, parent_id as pid, level_num
          from ma_ele_rg where set_year=2017 and chr_id = '${id}'`
		return executeSql(sql)
	},

	getRg: function() {
		let sql = `select chr_id as id, chr_code, chr_name as name, parent_id as pid, level_num
          from ma_ele_rg where set_year=2017`
		return executeSql(sql)
	},

	delRg: function(id) {
		let sql = `delete from ${dbName} where chr_id='${id}'`
		return executeSql(sql)
	},

	addRg: function(obj) {
		let keyStr = ''
		let valueStr = ''
		for (let key in obj) {
			keyStr += ` ${key}, `
			let val = '' + obj[key]
			val = val.indexOf('to_char') === 0 ? val : `'${val}'`
			val = val == undefined ? '' : val
			valueStr += ` ${val}, `
		}
		keyStr = keyStr.slice(0, -2)
		valueStr = valueStr.slice(0, -2)
		let sql = `insert into ${dbName} (${keyStr}) values (${valueStr})`
		console.log(sql);
		// let sql = `select * from ${dbName} where chr_name='北京市' and set_year=2017`
		return executeSql(sql)
	},

	updateRg: function(obj) {
		let entryStr = `chr_name='${obj.chr_name}', chr_code='${obj.chr_code}', parent_id='${obj.parent_id}', enabled='${obj.enabled}', level_num='${obj.level_num}'`
		let sql = `update ${dbName} set ${entryStr} where chr_id='${obj.chr_id}'`
		return executeSql(sql)
	},
	insertEleData: function(obj) {
		let {
			ele_code,
			ele_name,
			ele_colname,
			ele_format,
			parameter,
			paratype,
			default_value,
			ele_type,
			sys_id
		} = obj
		let ele_id = this.getUUID()
		let sql = `insert into SYS_ELEMENT_COLUMN (ele_id,ELE_CODE,ELE_NAME,ELE_COLNAME,ELE_TYPE,ELE_FORMAT,RG_CODE,SET_YEAR,SYS_ID,PARAMETER,PARATYPE,CREATTIME,DEFAULT_VALUE) 
		 values ('${ele_id}',upper('${ele_code}'),'${ele_name}',upper('${ele_colname}'),'${ele_type}','${ele_format}','3700','2017','${sys_id}','${parameter}','${paratype}',to_char(sysdate , 'yyyymmddhh24miss'),'${default_value}')`
		return executeSql(sql)
	}
}