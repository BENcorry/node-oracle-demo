const router = require('koa-router')()

router.prefix('/df/elementConfig')

const rgService = require('../service').rg

let map = require('../db').doSql.map

/**
 * 获取所有的rg
 */
router.get('/getElementSourceTree.do', async ctx => {
  let rs = await rgService.getRg()
  let list = []

  rs.rows.forEach(arr => {
    let tempObj = {}
    rs.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list.push(tempObj)
  })
  ctx.body = {
    tablename: 'MA_ELE_RG',
    treeData: list,
  }
})

router.get('/init.do', async ctx => {
  let rs = await rgService.init()
  let list = []

  rs.rows.forEach(arr => {
    let tempObj = {}
    rs.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list.push(tempObj)
  })

  ctx.body = {
    errorCode: map.errorCode,
    eledetail: list,
  }
})

router.get('/getElementDetailTree.do', async ctx => {
  let rs1 = await rgService.getElementDetailTree().list1
  let list1 = []

  rs1.rows.forEach(arr => {
    let tempObj = {}
    rs1.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list1.push(tempObj)
  })

  let rs2 = await rgService.getElementDetailTree().list2
  let list2 = []

  rs1.rows.forEach(arr => {
    let tempObj = {}
    rs2.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list2.push(tempObj)
  })

  ctx.body = {
    errorCode: map.errorCode,
    dataDetail: list1,
    selectDetail: list2
  }
})

router.get('/getElementColumn.do', async ctx => {
  let rs = await rgService.getRg()
  let list = []

  rs.rows.forEach(arr => {
    let tempObj = {}
    rs.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list.push(tempObj)
  })
  ctx.body = {
    errorCode: map.errorCode,
    dataDetail: list
  }
})

router.get('/dataElementTree.do', async ctx => {
  let rs1 = await rgService.dataElementTree().list1
  let list1 = []

  rs1.rows.forEach(arr => {
    let tempObj = {}
    rs1.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list1.push(tempObj)
  })

  let rs2 = await rgService.dataElementTree().list2
  let list2 = []

  rs1.rows.forEach(arr => {
    let tempObj = {}
    rs2.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list2.push(tempObj)
  })

  ctx.body = {
    errorCode: map.errorCode,
    dataDetail: list1,
    selectDetail: list2
  }
})

//初始化数据元树刨除默认数据元
router.get('/dataElementTree1.do', async ctx => {
  let rs1 = await rgService.dataElementTree1().list1
  let list1 = []

  rs1.rows.forEach(arr => {
    let tempObj = {}
    rs1.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list1.push(tempObj)
  })

  let rs2 = await rgService.dataElementTree1().list2
  let list2 = []

  rs1.rows.forEach(arr => {
    let tempObj = {}
    rs2.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list2.push(tempObj)
  })

  ctx.body = {
    errorCode: map.errorCode,
    dataDetail: list1,
    selectDetail: list2
  }
})

router.get('/getElementSourceGrid.do', async ctx => {
  let tablename = ctx.req._parsedUrl.query.split("tablename=")[1].split("&")[0]
  let type = ctx.req._parsedUrl.query.split("type=")[1].split("&")[0]
  let chr_id = ctx.req._parsedUrl.query.split("chr_id=")[1] ? ctx.req._parsedUrl.query.split("chr_id=")[1].split("&")[0] : '?'
  let rs = await rgService.getElementColumn(tablename, type, chr_id)
  let list = []

  rs.rows.forEach(arr => {
    let tempObj = {}
    rs.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list.push(tempObj)
  })
  ctx.body = ctx.body = {
    errorCode: map.errorCode,
    dataDetail: list,
  }
})

router.get('/getElementForm.do', async ctx => {
  let tablename = ctx.req._parsedUrl.query.split("tablename=")[1].split("&")[0]
  let rs = await rgService.getElementColumn(tablename)
  let list = []

  rs.rows.forEach(arr => {
    let tempObj = {}
    rs.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
    list.push(tempObj)
  })
  ctx.body = ctx.body = {
    errorCode: map.errorCode,
    dataDetail: list
  }
})

//queryFormData
//
 router.get('/queryFormData.do', async ctx => {
   let ele_id = ctx.req._parsedUrl.query.split("ele_id=")[1].split("&")[0]
   let rs = await rgService.queryFormData(ele_id)
   let list = []

   rs.rows.forEach(arr => {
     let tempObj = {}
     rs.metaData.forEach((obj, i) => tempObj[obj.name.toLowerCase()] = arr[i])
     list.push(tempObj)
   })
   ctx.body = ctx.body = {
     map: map,
     dataDetail: list
   }
 })


/**
 * 新增rg
 */
router.post('/rgAdd.do', async ctx => {
  let {chr_name, chr_code, parent_id, level_num: pLevelNum} = ctx.request.body
  console.log(ctx.request.body)
  let enabled = 1,
    chr_id = rgService.getUUID()
  create_date = `to_char(sysdate,'yyyy-mm-dd hh24:mi:ss')`
  let obj = {
    set_year: 2017,
    chr_id: chr_id ,
    chr_code,
    disp_code: chr_code,
    chr_name,
    level_num: pLevelNum + 1,
    is_leaf: 1,
    enabled: enabled,
    create_date,
    create_user: 'test',
    latest_op_date: create_date,
    is_deleted: 0,
    latest_op_user: 'test',
    last_ver: create_date,
    chr_code1: chr_code,
    rg_code: '3700',
    parent_id,
    chr_id1: chr_id,
    ltitemid: '',
    is_valid: '',
    is_top: '',
  }
  await rgService.addRg(obj)
  ctx.body = map
})

/**
 * 修改rg
 */
router.post('/rgUpdate.do', async ctx => {
  await rgService.updateRg(ctx.request.body)
  ctx.body = map
})

/**
 *  删除rg
 */
router.get('/rgDelete.do', async (ctx, next) => {
  let chr_id = ctx.req._parsedUrl.query
  await rgService.delRg(chr_id)
  ctx.body = map
})

//新增要素
router.post('/insertElementColumn.do', async ctx => {
  let {chr_name, chr_code, parent_id, level_num: pLevelNum} = ctx.request.body
  
  ctx.body = {
    getEle : ctx.request.body
  }
})

router.post('/insertEleData.do', async ctx => {
  await rgService.insertEleData(ctx.request.body)
  ctx.body = {
    getEle : ctx.request.body,
    sys_id: sys_id
  }
})


                              
module.exports = router


