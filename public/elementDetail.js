require(['jquery', 'knockout', 'bootstrap', 'uui','tree','grid','director','dateZH','ip'], function ($, ko) {
	window.ko = ko;
	var tokenid = ip.getTokenId();
	var sysId = null;
	var pagetype = "1";
	var gridModel = null;
	var tablename = "";
	var ele_code1 = "";
	var nullOption = {};
	var dataOption = {};
	var formOption = {};
	var showOption = {};
	var databack = null;
	var databack2 = null;
	var totnum = null;
	var menuViewModel = {
			data : ko.observable({}),
			treeSetting:{
				view:{
				},
				callback:{
					onClick:function(e,id,node){
						tablename="";
						var parentid = node.pid;
						if(parentid == "0" ){
							pagetype = "0";
							$("#gridpanel").hide();
							$("#formpanel").show();
							var sys_id = node.id;
							sysId = sys_id
							$.ajax({
								url: "/df/elementConfig/sysGrid.do?tokenid=" + tokenid,
								type: 'GET',
								dataType: 'json',
								data: {"sys_id":sys_id,"tokenid":tokenid,"ajax":"noCache"},
								success: function (data) {
									menuViewModel.gridDataTable1.removeAllRows();
									menuViewModel.gridDataTable1.setSimpleData(data.eledetail,{unSelect:true});
									menuViewModel.gridDataTable1.setRowUnSelect(0);
									databack = data.eledetail;
								}
							});
						}else if(parentid == ""){
							tablename="";
							pagetype = "0";
							sysId = "";
							$("#gridpanel").hide();
							$("#formpanel").show();
							$.ajax({
								url: "/df/elementConfig/init.do?tokenid=" + tokenid,
								type: 'GET',
								dataType: 'json',
								data: {"tokenid":tokenid,"ajax":"noCache"},
								success: function (data) {
									menuViewModel.gridDataTable1.removeAllRows();
									menuViewModel.gridDataTable1.setSimpleData(data.eledetail,{unSelect:true});
									menuViewModel.gridDataTable1.setRowUnSelect(0);
									databack = data.eledetail;
								}
							});
						}else {
							pagetype = "1";
							$("#gridpanel").show();
							$("#formpanel").hide();
							var ele_code = node.ele_code;
							ele_code1 = ele_code;
							sysId = node.pid;
							$.ajax({
								url: "/df/elementConfig/getElementSourceTree.do?tokenid="+tokenid,
								type: 'GET',
								dataType: 'json',
								data: {"ele_code":ele_code,"ajax":"noCache"},
								success: function (data) {
									var treedata = data.treeData;
									menuViewModel.treeDataTable1.setSimpleData(treedata,{unSelect:true});
									var data_tree = $("#detailConfigTree1")[0]['u-meta'].tree;
									var nodes  = data_tree.getNodes();
									data_tree.expandNode(nodes[0], true, false, true);
									var search_nodes = data_tree.getNodesByParamFuzzy("name","全部",null);
									data_tree.selectNode(search_nodes[0]);
									tablename = data.tablename;
									var options = {};
									options["tablename"] = tablename;
									options["ajax"] = "noCache";
									$.ajax({
										url: "/df/elementConfig/getElementColumn.do?tokenid="+tokenid,
										type: 'GET',
										dataType: 'json',
										data: options,
										success: function (data) {
//											var gridModle =ip.initGrid(data, "elegrid", "/df/elementConfig/getElementSourceGrid.do?tokenid="+tokenid, options, 1,false,false,true);
											$("#elegrid").empty();
											var options1 = {};
											options1["tablename"] = tablename;
											options1["ajax"] = "noCache";
											options1["type"] = "0";
											gridModel  = menuViewModel.initGrid(data.dataDetail ,"creatgrid", "elegrid" ,"/df/elementConfig/getElementSourceGrid.do?tokenid="+tokenid ,options1 )
										}
									});
								}
							});

							if(node.is_view =="1" || node.is_operate=="0"){
								$("#addViewBtn1").attr('disabled',"true");
								$("#editViewBtn1").attr('disabled',"true");
								$("#delViewBtn1").attr('disabled',"true");
							}else{
								$("#addViewBtn1").removeAttr('disabled');
								$("#editViewBtn1").removeAttr('disabled');
								$("#delViewBtn1").removeAttr('disabled');
							}

						}
					}
				}
			},
			treeSetting1:{
				view:{
					selectedMulti:false
				},
				callback:{
					onClick:function(e,id,node){
						var parentid = node.pid;
						var options = {};
						options["tablename"] = tablename;
						options["ajax"] = "noCache";
						if(parentid == ""){
							options["type"] = "0";
						}else{
							options["type"] = "1";
							options["chr_id"] = node.id;
						}
						var viewModel = gridModel;
						options["sortType"] = JSON.stringify({});
						options["pageInfo"] = 25 + "," + 0 + ",";
						//options["totals"] = viewModel.totals.join(",");
						options["totals"] = '';
						areaid =  "elegrid";
						$.ajax({
							url: "/df/elementConfig/getElementSourceGrid.do?tokenid="+tokenid,
							type: "GET",
							dataType: "json",
							async: true,
							data: options,
							beforeSend: ip.loading(true),
							success: function(data) {
								ip.loading(false,areaid);
								viewModel.gridData.pageIndex("0");
								viewModel.gridData.pageSize("25");
								totnum = data.totalElements;
								var pagenum = Math.ceil(totnum / 25);
								//add by wb
								viewModel.gridData.meta = {};
								$.each(data.dataDetail[0], function(key, val) {
									viewModel.gridData.meta['' + key] = {}
								});
								///////////
								viewModel.gridData.setSimpleData(data.dataDetail,{unSelect:true});
								databack2 = data.dataDetail;
								viewModel.gridData.setRowUnSelect(0);
								viewModel.gridData.totalPages(pagenum);
								viewModel.gridData.totalRow(totnum);
							}
						});
					}
				}
			},
			addColSetting:{
				view:{
					showLine:false,
					selectedMulti:false
				},
				check: {
					enable: true,
					chkStyle: "checkbox",
					chkboxType: { "Y": "ps", "N": "ps" }
				}
			},
			addColSetting1:{
				view:{
					showLine:false,
					selectedMulti:false
				},
				check: {
					enable: true,
					chkStyle: "checkbox",
					chkboxType: { "Y": "ps", "N": "ps" }
				}
			},
			treeDataTable: new u.DataTable({
				meta: {
					'id': {
						'value':""
					},
					'name': {
						'value':""
					},
					'pid':{
						'value':""
					}
				}
			}),
			treeDataTable1: new u.DataTable({
				meta: {
					'id': {
						'value':""
					},
					'name': {
						'value':""
					},
					'pid':{
						'value':""
					}
				}
			}),
			treeDataTable2: new u.DataTable({
				meta: {
					'id': {
						'value':""
					},
					'name': {
						'value':""
					},
					'pid':{
						'value':""
					}
				}
			}),
			treeDataTable3: new u.DataTable({
				meta: {
					'id': {
						'value':""
					},
					'name': {
						'value':""
					},
					'pid':{
						'value':""
					}
				}
			}),
			comItems: [{
				"value": "1",
				"name": "字符串"
			}, {
				"value": "2",
				"name": "数字"
			}, {
				"value": "3",
				"name": "时间"
			}],    
			comItems1: [{
				"value": "1",
				"name": "录入"
			}, {
				"value": "2",
				"name": "下拉框"
			}, {
				"value": "3",
				"name": "单选"
			}],  
			comItems2: [], 
			gridDataTable1: new u.DataTable({
				meta: {
					'chr_id':{},
					'czgb_code':{},
					'ele_code':{},
					'ele_source':{},
					'ele_name':{},
					'enabled':{},
					'ref_mode':{},
					'code_rule':{},
					'is_view':{},
					'is_rightfilter':{},
					'level_name':{},
					'is_nolevel':{},
					'is_operate':{},
					'sys_id':{},
					'max_level':{}
				}
			}),
			gridDataTable2: new u.DataTable({
				meta: {
					'id':{},
					'code':{},
					'ele_name':{},
					'ele_colname':{},
					'enablenull':{},
					'ele_type':{},
					'ele_format':{},
					'parameter':{},
					'paratype':{}
				}
			}),
			gridDataTable3: new u.DataTable({
				meta: {
					'id':{},
					'code':{},
					'ele_name':{},
					'ele_colname':{},
					'enablenull':{},
					'ele_type':{},
					'ele_format':{},
					'parameter':{},
					'paratype':{}
				}
			}),
			enabledItems: [{
				"value": "0",
				"name": "不启用"
			}, {
				"value": "1",
				"name": "启用"
			}],
			refItems: [{
				"value": "0",
				"name": "树参照"
			}, {
				"value": "1",
				"name": "下拉框"
			}, {
				"value": "2",
				"name": "列表参照"
			}],
			isrightfilterItems: [{
				"value": "0",
				"name": "否"
			}, {
				"value": "1",
				"name": "是"
			}],
			isviewItems: [{
				"value": "0",
				"name": "否"
			}, {
				"value": "1",
				"name": "是"
			}],
			isnolevelItems: [{
				"value": "0",
				"name": "否"
			}, {
				"value": "1",
				"name": "是"
			}],
			isoperateItems: [{
				"value": "0",
				"name": "否"
			}, {
				"value": "1",
				"name": "是"
			}],
			gridDataTable: new u.DataTable({
				meta: {
					'ele_id':{},
					'ele_code':{},
					'ele_name':{},
					'ele_colname':{},
					'ele_type':{},
					'ele_format':{},
					'creattime':{},
					'parameter':{},
					'paratype':{},
					'sys_id':{}
				}
			})
	};
	menuViewModel.getInitData = function () {
		$("#para").hide();
		$("#gridpanel").hide();
		$("#formpanel").show();
		menuViewModel.gridDataTable.removeAllRows();
		$.ajax({
			url: "/df/elementConfig/getElementDetailTree.do?tokenid=" + tokenid,
			type: 'GET',
			async: false,
			dataType: 'json',
			data: {"ajax":"noCache"},
			success: function (data) {
				var treedata = data.dataDetail;
				menuViewModel.treeDataTable.setSimpleData(treedata,{unSelect:true});
				var data_tree = $("#detailConfigTree")[0]['u-meta'].tree;
				var nodes  = data_tree.getNodes();
				data_tree.expandNode(nodes[0], true, false, true);
				var dataselect = data.selectDetail;
				var search_nodes = data_tree.getNodesByParamFuzzy("name","全部",null);
				data_tree.selectNode(search_nodes[0]);
				var ophtml = "";
				var myArray=new Array()
				for(var k = 0 ; k < dataselect.length ; k++){
					if(dataselect[k].sys_id != "0")
						ophtml = ophtml + "<option value='"+dataselect[k].sys_id+"'>"+dataselect[k].sys_name + "</option>"
						var option = {};
					option["value"] = dataselect[k].sys_id;
					option["name"] = dataselect[k].sys_name;
					myArray.push(option);
				}
				$("#sys_id").append(ophtml);
				$("#sys_id1").append(ophtml);
				$("#sys_id2").append(ophtml);
				menuViewModel.comItems2 = myArray;
			},
			error: function() {
				var data = window.elementDetailTreeData
        var treedata = data.dataDetail;
        menuViewModel.treeDataTable.setSimpleData(treedata,{unSelect:true});
        var data_tree = $("#detailConfigTree")[0]['u-meta'].tree;
        var nodes  = data_tree.getNodes();
        data_tree.expandNode(nodes[0], true, false, true);
        var dataselect = data.selectDetail;
        var search_nodes = data_tree.getNodesByParamFuzzy("name","全部",null);
        data_tree.selectNode(search_nodes[0]);
        var ophtml = "";
        var myArray=new Array()
        for(var k = 0 ; k < dataselect.length ; k++){
          if(dataselect[k].sys_id != "0")
            ophtml = ophtml + "<option value='"+dataselect[k].sys_id+"'>"+dataselect[k].sys_name + "</option>"
          var option = {};
          option["value"] = dataselect[k].sys_id;
          option["name"] = dataselect[k].sys_name;
          myArray.push(option);
        }
        $("#sys_id").append(ophtml);
        $("#sys_id1").append(ophtml);
        $("#sys_id2").append(ophtml);
        menuViewModel.comItems2 = myArray;
			}
		});
		$.ajax({
			url: "/df/elementConfig/init.do?tokenid=" + tokenid,
			type: 'GET',
			dataType: 'json',
			async: false,
			data: {"tokenid":tokenid,"ajax":"noCache"},
			success: function (data) {
				menuViewModel.gridDataTable1.removeAllRows();
				menuViewModel.gridDataTable1.setSimpleData(data.eledetail,{unSelect:true});
				menuViewModel.gridDataTable1.setRowUnSelect(0);
				databack = data.eledetail;
			},
			error: function() {
				var data = window.initData
        menuViewModel.gridDataTable1.removeAllRows();
        menuViewModel.gridDataTable1.setSimpleData(data.eledetail,{unSelect:true});
        menuViewModel.gridDataTable1.setRowUnSelect(0);
        databack = data.eledetail;
			}
		});
	}
	
	
	fuzzquery = function(id){
		var datas = databack;
		var search_text = $("#" + id).val();
	    var result = [];
		if (search_text == "") {
			result = databack;
		} else {
		    for (var i = 0; i < datas.length; i++) {
		          var datadetail = datas[i];
		          for(key in datadetail){
		        	  var value = datadetail[key];
		        	  if(value){
			        		if ((value.toUpperCase()).indexOf(search_text.toUpperCase()) !== -1) {
			                    result.push(datadetail);
			                    break;
			                }
			        	}
		          }
		    }
		}
		menuViewModel.gridDataTable1.setSimpleData(result, {
			unSelect: true
		});
		ip.highLightKeyWord(search_text, "red");
	}
	fuzzquery1 = function(id){
		var datas = databack2;
		var search_text = $("#" + id).val();
	    var result = [];
		if (search_text == "") {
			result = databack2;
		} else {
		    for (var i = 0; i < datas.length; i++) {
		          var datadetail = datas[i];
		          for(key in datadetail){
		        	  var value = datadetail[key];
		        	  if(value){
			        		if ((value.toUpperCase()).indexOf(search_text.toUpperCase()) !== -1) {
			                    result.push(datadetail);
			                    break;
			                }
			        	}
		          }
		    }
		}
		gridModel.gridData.setSimpleData(result, {
			unSelect: true
		});
		gridModel.gridData.totalRow(totnum);
		ip.highLightKeyWord(search_text, "red");
	}
	var val = "";
	quickQuery = function (){  
		var user_write = $("#quickquery").val();
		if(val == user_write){
			return;
		}
		val = user_write;
		var data_tree = $("#detailConfigTree")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		data_tree.expandNode(search_nodes[0],true,false,true);
		data_tree.selectNode(search_nodes[0]);
		if(data_tree.getSelectedNodes().length>0){
			if(!data_tree.getSelectedNodes()[0].isParent){
				menuGuid = data_tree.getSelectedNodes()[0].id;
			}else{
				menuGuid = null;
			}
		}
		$("#quickquery").focus();
		i = 1;

	}

	var i = 0;
	menuTreeNext = function (){
		var user_write = $("#quickquery").val();
		var data_tree = $("#detailConfigTree")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		if(i < search_nodes.length){
			data_tree.selectNode(search_nodes[i++]);
		}else{
			i = 0;
			ip.ipInfoJump("最后一个","info");
		}
		if(data_tree.getSelectedNodes().length>0){
			if(!data_tree.getSelectedNodes()[0].isParent){
				menuGuid = data_tree.getSelectedNodes()[0].id;
			}else{
				menuGuid = null;
			}
		}
		$("#quickquery").focus();
	}


	var val1 = "";
	quickQuery1 = function (){  
		var user_write = $("#quickquery1").val();
		if(val1 == user_write){
			return;
		}
		val1 = user_write;
		var data_tree = $("#detailConfigTree1")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		data_tree.expandNode(search_nodes[0],true,false,true);
		data_tree.selectNode(search_nodes[0]);
		if(data_tree.getSelectedNodes().length>0){
			if(!data_tree.getSelectedNodes()[0].isParent){
				menuGuid = data_tree.getSelectedNodes()[0].id;
			}else{
				menuGuid = null;
			}
		}
		$("#quickquery1").focus();
		i1 = 1;

	}

	var i1 = 0;
	menuTreeNext1 = function (){
		var user_write = $("#quickquery1").val();
		var data_tree = $("#detailConfigTree1")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		if(i1 < search_nodes.length){
			data_tree.selectNode(search_nodes[i1++]);
		}else{
			i1 = 0;
			ip.ipInfoJump("最后一个","info");
		}
		if(data_tree.getSelectedNodes().length>0){
			if(!data_tree.getSelectedNodes()[0].isParent){
				menuGuid = data_tree.getSelectedNodes()[0].id;
			}else{
				menuGuid = null;
			}
		}
		$("#quickquery1").focus();
	}

	var val2 = "";
	quickQuery2 = function (){  
		var user_write = $("#quickquery2").val();
		if(val2 == user_write){
			return;
		}
		val2 = user_write;
		var data_tree = $("#addColTree")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		data_tree.expandNode(search_nodes[0],true,false,true);
		data_tree.selectNode(search_nodes[0]);
		if(data_tree.getSelectedNodes().length>0){
			if(!data_tree.getSelectedNodes()[0].isParent){
				menuGuid = data_tree.getSelectedNodes()[0].id;
			}else{
				menuGuid = null;
			}
		}
		$("#quickquery2").focus();
		i2 = 1;

	}

	var i2 = 0;
	menuTreeNext2 = function (){
		var user_write = $("#quickquery2").val();
		var data_tree = $("#addColTree")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		if(i2 < search_nodes.length){
			data_tree.selectNode(search_nodes[i2++]);
		}else{
			i2 = 0;
			ip.ipInfoJump("最后一个","info");
		}
		if(data_tree.getSelectedNodes().length>0){
			if(!data_tree.getSelectedNodes()[0].isParent){
				menuGuid = data_tree.getSelectedNodes()[0].id;
			}else{
				menuGuid = null;
			}
		}
		$("#quickquery2").focus();
	}

	var val3 = "";
	quickQuery3 = function (){  
		var user_write = $("#quickquery2").val();
		if(val3 == user_write){
			return;
		}
		val3 = user_write;
		var data_tree = $("#addColTree1")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		data_tree.expandNode(search_nodes[0],true,false,true);
		data_tree.selectNode(search_nodes[0]);
		if(data_tree.getSelectedNodes().length>0){
			if(!data_tree.getSelectedNodes()[0].isParent){
				menuGuid = data_tree.getSelectedNodes()[0].id;
			}else{
				menuGuid = null;
			}
		}
		$("#quickquery3").focus();
		i3 = 1;

	}

	var i3 = 0;
	menuTreeNext3 = function (){
		var user_write = $("#quickquery3").val();
		var data_tree = $("#addColTree1")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		if(i3 < search_nodes.length){
			data_tree.selectNode(search_nodes[i3++]);
		}else{
			i3 = 0;
			ip.ipInfoJump("最后一个","info");
		}
		if(data_tree.getSelectedNodes().length>0){
			if(!data_tree.getSelectedNodes()[0].isParent){
				menuGuid = data_tree.getSelectedNodes()[0].id;
			}else{
				menuGuid = null;
			}
		}
		$("#quickquery3").focus();
	}
	menuViewModel.addbtn= function (){
		$("#areaeidt").empty();
		$("#areaeidt1").empty();
		$.ajax({
			url: "/df/elementConfig/getElementForm.do?tokenid=" + tokenid,
			type: 'GET',
			dataType: 'json',
			data: {"tokenid":tokenid,"ajax":"noCache","tablename":tablename},
			success: function (data) {
				var creatData = data.dataDetail;
				menuViewModel.initForm(creatData,"areaeidt");
			}
		});

		$("#addRoleModal").modal({backdrop: 'static', keyboard: false});
	}

	menuViewModel.editbtn= function (){
		$("#areaeidt").empty();
		$("#areaeidt1").empty();
		var selRows = gridModel.gridData.getSelectedRows();
		if(selRows.length == 0){
			ip.ipInfoJump("请选择修改的数据","info");
			return;
		}
		if(selRows.length > 1){
			ip.ipInfoJump("请不要选择多条数据","info");
			return;
		}
		$("#hidechr_id").val(selRows[0].data.chr_id.value);
		$.ajax({
			url: "/df/elementConfig/getElementForm.do?tokenid=" + tokenid,
			type: 'GET',
			dataType: 'json',
			data: {"tokenid":tokenid,"ajax":"noCache","tablename":tablename},
			success: function (data) {
				var creatData = data.detail;
				menuViewModel.initForm(creatData,"areaeidt1");
				for (var i = 0; i < creatData.length; i++) {
					var para_type = creatData[i].para_type;	
					if(para_type == "3"){
						var data  = selRows[0].data;
						var value = data[(creatData[i].field_code).toLowerCase()].value;
						$("input[name='"+creatData[i].field_code+"Radios'][value='"+value+"']").prop("checked", true);;
					}else if(para_type == "4"){
						var data  = selRows[0].data;
						var value = data[(creatData[i].field_code).toLowerCase()].value;
						var data_tree = $("#detailConfigTree1")[0]['u-meta'].tree;
						var search_nodes = data_tree.getNodesByParam("id",value,null);
						if(search_nodes.length > 0){
							$("#query-"+creatData[i].field_code).val(search_nodes[0].name)
							$("#query-"+creatData[i].field_code+"-h").val(search_nodes[0].id+"@")
						}
					}else{
						var data  = selRows[0].data;
						var value = data[(creatData[i].field_code).toLowerCase()].value;
						$("#query-"+creatData[i].field_code).val(value);
					}
				}
			}
		});

		$("#editRoleModal").modal({backdrop: 'static', keyboard: false});
	}


	menuViewModel.delbtn = function (){
		var allrow = gridModel.gridData.getAllRows();
		var selRows =null;
		if(allrow.length == 1){
			selRows = allrow;
		}else{
			selRows = gridModel.gridData.getSelectedRows();
		}
		if(selRows.length == 0){
			ip.ipInfoJump("请选择删除的数据","info");
			return;
		}
		var data_tree = $("#detailConfigTree1")[0]['u-meta'].tree;
		ip.warnJumpMsg("真的要删除吗?","sid","cCla");
		$("#sid").on("click",function(){
			$("#config-modal").remove();
			var chr_id = "";
			var chr_code = "";
			var chr_name = "";
			for(var k = 0 ; k < selRows.length ;k++){
				var id = selRows[k].data.chr_id.value;
				var code = selRows[k].data.chr_code.value;
				var search_nodes = data_tree.getNodesByParamFuzzy("id",id,null);
				if(search_nodes.length > 0){
					if(!search_nodes[0].isParent){
						chr_id = chr_id + id+",";
						chr_code = chr_code + code+",";
					}else{
						chr_name = chr_name + search_nodes[0].chr_code+",";
					}
				}
			}
			if(chr_name != ""){
				ip.ipInfoJump("不可删除父节点："+chr_name,"info");
			}
			if(chr_id ==""){
				return;
			}
			$.ajax({
				url: "/df/elementConfig/delElementData1.do?tokenid=" + tokenid,
				type: 'POST',
				dataType: 'json',
				data: {"chr_id":chr_id,"chr_code":chr_code,"ajax":"noCache","tablename":tablename,"ele_code":ele_code1},
				success: function (data) {
					var flag = data.flag;
					if(flag == "1"){
						ip.ipInfoJump("成功删除："+data.num+"条数据","success");
						$("#detailConfigTree .curSelectedNode").click();
					}else{
						ip.ipInfoJump("删除失败："+data.Message,"error");
					}
				}
			})

		});
		$(".cCla").on("click",function(){
			//处理取消逻辑方法
			$("#config-modal").remove();
		});
	}



	menuViewModel.addviewSubmit = function(){
		$("#sys_id").val(sysId);
		$("#czgb_code").val("");
		$("#ele_code").val("");
		$("#ele_source").val("");
		$("#ele_name").val("");
		$("input[name='optionsRadios']").eq(0).prop("checked", true);
		$("input[name='optionsRadios1']").eq(0).prop("checked", true);
		$("input[name='optionsRadios2']").eq(0).prop("checked", true);
		$('#enabled').eq(0).prop("checked",true);
		menuViewModel.gridDataTable2.removeAllRows();
		menuViewModel.gridDataTable3.removeAllRows();
		nullOption = {};
		dataOption = {};
		$("#addElementModal").modal({backdrop: 'static', keyboard: false});
	}

	menuViewModel.delviewSubmit = function(){
		var selRows = menuViewModel.gridDataTable1.getSelectedRows();
		if(selRows.length == 0){
			ip.ipInfoJump("请选择删除的数据","info");
			return;
		}
		ip.warnJumpMsg("确定要删除吗?","sid","cCla");
		$("#sid").on("click",function(){
			$("#config-modal").remove();
			var chr_id = selRows[0].data.chr_id.value;
			ip.warnJumpMsg("是否删除所有数据和表?","sid1","cCla1");
			$("#sid1").on("click",function(){
				$("#config-modal").remove();
				$.ajax({
					url: "/df/elementConfig/delElementData3.do?tokenid=" + tokenid,
					type: 'POST',
					dataType: 'json',
					data: {"chr_id":chr_id,"ajax":"noCache"},
					success: function (data) {
						var flag = data.flag;
						if(flag == "1"){
							ip.ipInfoJump("成功删除","success");
							var title = $("#detailConfigTree .curSelectedNode")[0].title;
							menuViewModel.getInitData();
							var data_tree = $("#detailConfigTree")[0]['u-meta'].tree;
							var search_nodes = data_tree.getNodesByParam("name",title,null);
							if(0 < search_nodes.length){
								data_tree.selectNode(search_nodes[0]);
							}
							$("#detailConfigTree .curSelectedNode").click();
						}
					}
				})
			});
			$(".cCla1").on("click",function(){
				//处理取消逻辑方法
				$("#config-modal").remove();
				$.ajax({
					url: "/df/elementConfig/delElementData2.do?tokenid=" + tokenid,
					type: 'POST',
					dataType: 'json',
					data: {"chr_id":chr_id,"ajax":"noCache"},
					success: function (data) {
						var flag = data.flag;
						if(flag == "1"){
							ip.ipInfoJump("成功删除","success");
							$("#detailConfigTree .curSelectedNode").click();
						}
					}
				})
			});
		});
		$(".cCla").on("click",function(){
			//处理取消逻辑方法
			$("#config-modal").remove();
		});
	}

	menuViewModel.enableSubmit = function(){
		var selRows = menuViewModel.gridDataTable1.getSelectedRows();
		if(selRows.length == 0){
			ip.ipInfoJump("请选择修改的数据","info");
			return;
		}
		var chr_id = selRows[0].data.chr_id.value;
		var enabled = selRows[0].data.enabled.value;
		$.ajax({
			url: "/df/elementConfig/updateEnableDate.do?tokenid=" + tokenid,
			type: 'POST',
			dataType: 'json',
			data: {"chr_id":chr_id,"ajax":"noCache","enabled":enabled},
			success: function (data) {
				var flag = data.flag;
				if(flag == "1"){
					if(enabled == "1"){
						ip.ipInfoJump("已停用","success");
					}else if(enabled == "0"){
						ip.ipInfoJump("已启用","success");
					}
					$("#detailConfigTree .curSelectedNode").click();
				}else{
					ip.ipInfoJump("修改失败："+data.Message,"error");
				}
			}
		})
	}
	menuViewModel.refreshSubmit = function(){
		ip.processInfo("正在处理中，请稍候...",true);
		$.ajax({
			url: "/df/elementConfig/cacheRefresh.do?tokenid=" + tokenid,
			type: 'get',
			dataType: 'json',
			data: {"ajax":"noCache"},
			success: function (data) {
				ip.processInfo("处理完成！",false);
			}
		})
	}
	
	menuViewModel.editviewSubmit = function(){
		var selRows = menuViewModel.gridDataTable1.getSelectedRows();
		if(selRows.length == 0){
			ip.ipInfoJump("请选择修改的数据","info");
			return;
		}
		dataOption = {};
		nullOption = {};
		menuViewModel.gridDataTable2.removeAllRows();
		var chr_id = selRows[0].data.chr_id.value;
		var czgb_code = selRows[0].data.czgb_code.value;
		var ele_code = selRows[0].data.ele_code.value;
		var ele_source = selRows[0].data.ele_source.value;
		var ele_name = selRows[0].data.ele_name.value;
		var enabled = selRows[0].data.enabled.value;
		var is_rightfilter = selRows[0].data.is_rightfilter.value;
		var is_operate = selRows[0].data.is_operate.value;
		var is_view = selRows[0].data.is_view.value;
		var sys_id = selRows[0].data.sys_id.value;
		$("#changeflag").val(0);
		$("#czgb_code1").val(czgb_code);
		$("#ele_code1").val(ele_code);
		$("#ele_source1").val(ele_source);
		$("#ele_name1").val(ele_name);
		$("#sys_id1").val(sys_id);
		$("#chr_id").val(chr_id);
		$("input[name='options1Radios']").eq(is_rightfilter).prop("checked", true);
		if(is_operate == "0"){
			$("input[name='options1Radios1']").eq("1").prop("checked", true);
		}else{
			$("input[name='options1Radios1']").eq("0").prop("checked", true);
		}
		$("input[name='options1Radios2']").eq(is_view).prop("checked", true);
		if(enabled =="1"){
			$('#enabled1').eq(0).prop("checked",true);
		}else{
			$('#enabled1').eq(0).prop("checked",false);
		}
		$.ajax({
			url: "/df/elementConfig/queryElementColumn.do?tokenid=" + tokenid,
			type: 'GET',
			async: false,
			dataType: 'json',
			data: {"ajax":"noCache","chr_id":chr_id,"ele_source":ele_source},
			success: function (data) {
				var tableDate = data.source;
				var num = data.num;
				$("#num").val(num);
				menuViewModel.gridDataTable3.removeAllRows();
				menuViewModel.gridDataTable3.setSimpleData(tableDate,{unSelect:true});
				menuViewModel.gridDataTable3.setRowUnSelect(0);
				if(num == "0"){
					$("#editbtn").show();
				}else{
					$("#editbtn").hide();
				}
			}
		});
		$("#editElementModal").modal({backdrop: 'static', keyboard: false});
	}

	menuViewModel.ensure = function (){
		var count = showOption["count"];
		var obj = {};
		var pid = "";
		for(var i = 0 ; i<count ; i++){
			var divoption = showOption["show"+i];
			var code = divoption["code"];
			var required = divoption["required"];
			var para_type = divoption["para_type"];
			if(para_type == "4"){
				var value = $("#query-"+code+"-h").val();
				var value1  = value.split("@");
				var value2 = value1[0];
				obj[code] = value2;
				pid = value2;
			}else if(para_type == "5"){
				var value = $("#query-"+code+"-h").val();
				var value1  = value.split("@");
				var value2 = value1[0];
				obj[code] = value2;
			}else if(para_type == "1"){
				var value = $("#query-"+code).val();
				if(required == "0"){
					if(value =="" || value ==null){
						var name = divoption["name"];
						ip.ipInfoJump(name+"不可为空","error");
						return;
					}
				}
				obj[code] = value;
			}else if(para_type == "3"){
				var value = $("input[name='"+code+"Radios']:checked")[0].id;
				obj[code] = value;
			}else if(para_type == "2"){
				var value = $("#query-"+code).val();
				obj[code] = value;
			}
		}
		var upobj = JSON.stringify(obj);
		$.ajax({
			url: "/df/elementConfig/updateElementDate.do?tokenid=" + tokenid,
			type: 'POST',
			dataType: 'json',
			data: {"upobj":upobj,"ajax":"noCache","tablename":tablename,"pid":pid,"ele_code":ele_code1},
			success: function (data) {
				var flag = data.flag;
				if(flag == "1"){
					ip.ipInfoJump("新增成功","success");
					$("#addRoleModal").modal('hide');
					$("#detailConfigTree .curSelectedNode").click();
				}else{
					ip.ipInfoJump("新增失败："+data.Message,"error");
				}
			}
		})
	}
	menuViewModel.ensure2 = function (){
		var count = showOption["count"];
		var obj = {};
		var selRows = gridModel.gridData.getSelectedRows();
		var oldpid = selRows[0].data.parent_id.value;
		var pid = "";
		var chr_id = $("#hidechr_id").val();
		for(var i = 0 ; i<count ; i++){
			var divoption = showOption["show"+i];
			var code = divoption["code"];
			var required = divoption["required"];
			var para_type = divoption["para_type"];
			if(para_type == "4"){
				var value = $("#query-"+code+"-h").val();
				var value1  = value.split("@");
				var value2 = value1[0];
				if(chr_id == value2){
					ip.ipInfoJump("父级不可选择自己","error");
					return;
				}
				obj[code] = value2;
				pid = value2;
			}else if(para_type == "5"){
				var value = $("#query-"+code+"-h").val();
				var value1  = value.split("@");
				var value2 = value1[0];
				obj[code] = value2;
			}else if(para_type == "1"){
				var value = $("#query-"+code).val();
				if(required == "0"){
					if(value =="" || value ==null){
						var name = divoption["name"];
						ip.ipInfoJump(name+"不可为空","error");
						return;
					}
				}
				obj[code] = value;
			}else if(para_type == "3"){
				var value = $("input[name='"+code+"Radios']:checked")[0].id;
				obj[code] = value;
			}else if(para_type == "2"){
				var value = $("#query-"+code).val();
				obj[code] = value;
			}
		}
		var upobj = JSON.stringify(obj);

		$.ajax({
			url: "/df/elementConfig/updateElementData1.do?tokenid=" + tokenid,
			type: 'POST',
			dataType: 'json',
			data: {"upobj":upobj,"ajax":"noCache","tablename":tablename,"chr_id":chr_id,"pid":pid,"oldpid":oldpid,"ele_code":ele_code1},
			success: function (data) {
				var flag = data.flag;
				if(flag == "1"){
					ip.ipInfoJump("修改成功","success");
					$("#editRoleModal").modal('hide');
					$("#detailConfigTree .curSelectedNode").click();
				}else{
					ip.ipInfoJump("修改失败："+data.Message,"error");
				}
			}
		})
	}
	menuViewModel.ensure3 = function (){
		var options = {};
		var czgb_code = $("#czgb_code").val();
		options["czgb_code"]=czgb_code.toUpperCase();
		var ele_code = $("#ele_code").val();
		if(ele_code.trim() == "" ||  ele_code==null){
			ip.ipInfoJump("要素编码不可为空","error");
			return;
		}
		options["ele_code"]=ele_code.toUpperCase();
		var ele_source = $("#ele_source").val();
		if(ele_source.trim() == "" ||  ele_source==null){
			ip.ipInfoJump("要素表不可为空","error");
			return;
		}
		options["ele_source"]=ele_source.toUpperCase();
		var ele_name = $("#ele_name").val();
		if(ele_name.trim() == "" ||  ele_name==null){
			ip.ipInfoJump("要素中文名不可为空","error");
			return;
		}
		options["ele_name"]=ele_name;
		var sys_id = $("#sys_id").val();
		if(sys_id.trim() == "" ||  sys_id==null){
			ip.ipInfoJump("所属系统不可为空","error");
			return;
		}
		options["sys_id"]=sys_id;
		var enabled = "1";
		if(!$('#enabled').is(':checked')){
			enabled = "0";
		}
		options["enabled"]=enabled;
		var is_rightfilter = $("input[name='optionsRadios']:checked")[0].id;
		options["is_rightfilter"]=is_rightfilter;
		var is_operate = $("input[name='optionsRadios1']:checked")[0].id;
		options["is_operate"]=is_operate;
		var is_view = $("input[name='optionsRadios2']:checked")[0].id;
		options["is_view"]=is_view;
		var grid2 = $("#write-grid1").parent()[0]['u-meta'].grid;
		var allcolRows = grid2.getAllRows();
		var rowOptions = {};
		if(allcolRows != null){
			for(var i=0; i<allcolRows.length; i++){
				var rowOption = {};
				var id = allcolRows[i].id;
				var index = menuViewModel.gridDataTable2.getIndexByRowId(allcolRows[i]["$_#_@_id"]);
				var btn = $("#btn"+index).attr("val");
				var data = $("#data"+index).attr("val");
				var ele_type = allcolRows[i].ele_type;
				var ele_format = allcolRows[i].ele_format;
				var parameter = allcolRows[i].parameter;
				var paratype = allcolRows[i].paratype;
				var ele_name = allcolRows[i].ele_name;
				var ele_colname = allcolRows[i].ele_colname;
				var default_value = allcolRows[i].default_value;
				var ele_code = allcolRows[i].code;
				rowOption["ele_type"]=ele_type;
				rowOption["ele_format"]=ele_format;
				rowOption["parameter"]=parameter;
				rowOption["paratype"]=paratype;
				rowOption["ele_name"]=ele_name;
				rowOption["ele_colname"]=ele_colname;
				rowOption["default_value"]=default_value;
				rowOption["ele_code"]=ele_code;
				rowOption["ele_id"]=id;
				rowOption["btn"]=btn;
				rowOption["data"]=data;
				rowOptions[id] = rowOption;
			}
		}
		var source_column = JSON.stringify(rowOptions);
		options["source_column"]=source_column;
		options["ajax"]="noCache";
		$.ajax({
			url: "/df/elementConfig/insertElementColumn.do?tokenid=" + tokenid,
			type: 'POST',
			dataType: 'json',
			data: options,
			success: function (data) {
				var flag = data.flag;
				if(flag == "1"){
					ip.ipInfoJump("添加成功","success");
					$("#addElementModal").modal('hide');
					menuViewModel.getInitData();
					var data_tree = $("#detailConfigTree")[0]['u-meta'].tree;
					var search_nodes = data_tree.getNodesByParam("id",data.chr_id,null);
					if(0 < search_nodes.length){
						data_tree.selectNode(search_nodes[0]);
						$("#detailConfigTree .curSelectedNode").click();
					}
				}else{
					ip.ipInfoJump("添加失败："+data.Message,"error");
				}
			}
		})
	}

	menuViewModel.ensure4 = function (){
		var options = {};
		var chr_id = $("#chr_id").val();
		options["chr_id"]=chr_id;
		var czgb_code = $("#czgb_code1").val();
		options["czgb_code"]=czgb_code.toUpperCase();
		var ele_code = $("#ele_code1").val();
		if(ele_code.trim() == "" ||  ele_code==null){
			ip.ipInfoJump("要素编码不可为空","error");
			return;
		}
		options["ele_code"]=ele_code.toUpperCase();
		var ele_source = $("#ele_source1").val();
		if(ele_source.trim() == "" ||  ele_source==null){
			ip.ipInfoJump("要素表不可为空","error");
			return;
		}
		options["ele_source"]=ele_source.toUpperCase();
		var ele_name = $("#ele_name1").val();
		if(ele_name.trim() == "" ||  ele_name==null){
			ip.ipInfoJump("要素中文名不可为空","error");
			return;
		}
		options["ele_name"]=ele_name;
		var sys_id = $("#sys_id1").val();
		if(sys_id.trim() == "" ||  sys_id==null){
			ip.ipInfoJump("所属系统不可为空","error");
			return;
		}
		options["sys_id"]=sys_id;
		var enabled = "1";
		if(!$('#enabled1').is(':checked')){
			enabled = "0";
		}
		options["enabled"]=enabled;
		var is_rightfilter = $("input[name='options1Radios']:checked")[0].id;
		options["is_rightfilter"]=is_rightfilter;
		var is_operate = $("input[name='options1Radios1']:checked")[0].id;
		options["is_operate"]=is_operate;
		var is_view = $("input[name='options1Radios2']:checked")[0].id;
		options["is_view"]=is_view;
		var grid2 = $("#write-grid2").parent()[0]['u-meta'].grid;
		var allcolRows = grid2.getAllRows();
		var rowOptions = {};
		if(allcolRows != null){
			for(var i=0; i<allcolRows.length; i++){
				var id = allcolRows[i].guid;
				var index = menuViewModel.gridDataTable3.getIndexByRowId(allcolRows[i]["$_#_@_id"]);
				var data = $("#data"+index).attr("val");
				rowOptions[id] = data
			}
		}
		var griddata = JSON.stringify(rowOptions);
		options["griddata"]=griddata;
		var changeflag = $("#changeflag").val();
		if(changeflag != "1"){
			$.ajax({
				url: "/df/elementConfig/updateElementColumn.do?tokenid=" + tokenid,
				type: 'POST',
				dataType: 'json',
				data: options,
				success: function (data) {
					var flag = data.flag;
					if(flag == "1"){
						ip.ipInfoJump("修改成功","success");
						$("#editElementModal").modal('hide');
						menuViewModel.getInitData();
						var data_tree = $("#detailConfigTree")[0]['u-meta'].tree;
						var search_nodes = data_tree.getNodesByParam("id",data.chr_id,null);
						if(0 < search_nodes.length){
							data_tree.selectNode(search_nodes[0]);
							$("#detailConfigTree .curSelectedNode").click();
						}
					}else{
						ip.ipInfoJump("修改失败","error");
					}
				}
			})
		} else {
			var grid2 = $("#write-grid2").parent()[0]['u-meta'].grid;
			var allcolRows = grid2.getAllRows();
			var rowOptions = {};
			if(allcolRows != null){
				for(var i=0; i<allcolRows.length; i++){
					var rowOption = {};
					var id = allcolRows[i].id;
					var index = menuViewModel.gridDataTable3.getIndexByRowId(allcolRows[i]["$_#_@_id"]);
					var btn = $("#btn"+index).attr("val");
					var data = $("#data"+index).attr("val");
					var ele_type = allcolRows[i].ele_type;
					var ele_format = allcolRows[i].ele_format;
					var parameter = allcolRows[i].parameter;
					var paratype = allcolRows[i].paratype;
					var ele_name = allcolRows[i].ele_name;
					var ele_colname = allcolRows[i].ele_colname;
					var default_value = allcolRows[i].default_value;
					var ele_code = allcolRows[i].code;
					rowOption["ele_type"]=ele_type;
					rowOption["ele_format"]=ele_format;
					rowOption["parameter"]=parameter;
					rowOption["paratype"]=paratype;
					rowOption["ele_name"]=ele_name;
					rowOption["ele_colname"]=ele_colname;
					rowOption["default_value"]=default_value;
					rowOption["ele_code"]=ele_code.toUpperCase();
					rowOption["ele_id"]=id;
					rowOption["btn"]=btn;
					rowOption["data"]=data;
					rowOptions[id] = rowOption;
				}
			}
			var source_column = JSON.stringify(rowOptions);
			options["source_column"] = source_column;
			$.ajax({
				url: "/df/elementConfig/updateNodataElementColumn.do?tokenid=" + tokenid,
				type: 'POST',
				dataType: 'json',
				data: options,
				success: function (data) {
					var flag = data.flag;
					if(flag == "1"){
						ip.ipInfoJump("修改成功","success");
						$("#editElementModal").modal('hide');
						menuViewModel.getInitData();
						var data_tree = $("#detailConfigTree")[0]['u-meta'].tree;
						var search_nodes = data_tree.getNodesByParam("id",data.chr_id,null);
						if(0 < search_nodes.length){
							data_tree.selectNode(search_nodes[0]);
							$("#detailConfigTree .curSelectedNode").click();
						}
					}else{
						ip.ipInfoJump("修改失败","error");
					}
				}
			})
		}

	}
	menuViewModel.rowCheck = function (){
		$("#addCol").show();
		$.ajax({
			url: "/df/elementConfig/dataElementTree1.do?tokenid=" + tokenid,
			type: 'GET',
			async: false,
			dataType: 'json',
			data: {"ajax":"noCache"},
			success: function (data) {
				var treedata = data.dataDetail;
				menuViewModel.treeDataTable2.setSimpleData(treedata,{unSelect:true});
				var data_tree = $("#addColTree")[0]['u-meta'].tree;
				var nodes  = data_tree.getNodes();
				data_tree.expandNode(nodes[0], true, false, true);

				var grid2 = $("#write-grid1").parent()[0]['u-meta'].grid;
				var selectRows = grid2.getAllRows();
				if(selectRows != null){
					for(var i=0; i<selectRows.length; i++){
						var id = selectRows[i].id;
						var search_nodes = data_tree.getNodesByParam("id",id,null);
						data_tree.checkNode(search_nodes[0], true, true);
					}
				}
			}
		});
	}

	menuViewModel.rowCheck1 = function (){
		$("#addCol1").show();
		$.ajax({
			url: "/df/elementConfig/dataElementTree1.do?tokenid=" + tokenid,
			type: 'GET',
			async: false,
			dataType: 'json',
			data: {"ajax":"noCache"},
			success: function (data) {
				var treedata = data.dataDetail;
				menuViewModel.treeDataTable3.setSimpleData(treedata,{unSelect:true});
				var data_tree = $("#addColTree1")[0]['u-meta'].tree;
				var nodes  = data_tree.getNodes();
				data_tree.expandNode(nodes[0], true, false, true);

				var grid2 = $("#write-grid2").parent()[0]['u-meta'].grid;
				var selectRows = grid2.getAllRows();
				if(selectRows != null){
					for(var i=0; i<selectRows.length; i++){
						var id = selectRows[i].id;
						var search_nodes = data_tree.getNodesByParam("id",id,null);
						data_tree.checkNode(search_nodes[0], true, true);
					}
				}
			}
		});
	}

	menuViewModel.delgrid2= function (){
		var selRows = menuViewModel.gridDataTable2.getSelectedRows();
		if(selRows.length == 0){
			ip.ipInfoJump("请选择删除的行","info");
			return;
		}
		menuViewModel.gridDataTable2.removeRows(selRows);
	}
	menuViewModel.delgrid3= function (){
		var selRows = menuViewModel.gridDataTable3.getSelectedRows();
		if(selRows.length == 0){
			ip.ipInfoJump("请选择删除的行","info");
			return;
		}
		$("#changeflag").val("1");
		menuViewModel.gridDataTable3.removeRows(selRows);
	}

	menuViewModel.addColEnsure = function (){
		var treeObj = $.fn.zTree.getZTreeObj("addColTree");
		var nodes = treeObj.getCheckedNodes();
		for(var i= 0; i < nodes.length; i++){
			if(nodes[i].pid == "0"){
				treeObj.setChkDisabled(nodes[i], true);
			}
		}
		nodes = treeObj.getCheckedNodes(true);
		menuViewModel.gridDataTable2.removeAllRows();
		menuViewModel.gridDataTable2.setSimpleData(nodes);
		menuViewModel.gridDataTable2.setRowUnSelect(0);
		var nullOptionOld = nullOption;
		var dataOptionOld = dataOption;
		nullOption={};
		dataOption={};
		for(var name in nullOptionOld){
			var rows = menuViewModel.gridDataTable2.getRowsByField('id',name);
			if(rows.length == "0"){
				continue;
			}
			var index = menuViewModel.gridDataTable2.getIndexByRowId(rows[0].rowId);
			$("#btn"+index).attr("val","0");
			$("#btn"+index).text("非空");
			var id = $("#btn"+index).attr("ele_id");
			nullOption[id] = "1";
		}
		for(var name in dataOptionOld){
			var rows = menuViewModel.gridDataTable2.getRowsByField('id',name);
			if(rows.length == "0"){
				continue;
			}
			var index = menuViewModel.gridDataTable2.getIndexByRowId(rows[0].rowId);
			$("#data"+index).attr("val","0");
			$("#data"+index).text("不维护");
			var id = $("#data"+index).attr("ele_id");
			dataOption[id] = "1";
		}
		$("#addCol").hide();
	}

	menuViewModel.addColEnsure1 = function (){
		$("#changeflag").val("1");
		var treeObj = $.fn.zTree.getZTreeObj("addColTree1");
		var nodes = treeObj.getCheckedNodes();
		for(var i= 0; i < nodes.length; i++){
			if(nodes[i].pid == "0"){
				treeObj.setChkDisabled(nodes[i], true);
			}
		}
		nodes = treeObj.getCheckedNodes(true);
		var nullOptionOld = nullOption;
		var dataOptionOld = dataOption;
		nullOption={};
		dataOption={};
		menuViewModel.gridDataTable3.removeAllRows();
		menuViewModel.gridDataTable3.setSimpleData(nodes);
		menuViewModel.gridDataTable3.setRowUnSelect(0);
		for(var name in nullOptionOld){
			var rows = menuViewModel.gridDataTable3.getRowsByField('id',name);
			if(rows.length == "0"){
				continue;
			}
			var index = menuViewModel.gridDataTable3.getIndexByRowId(rows[0].rowId);
			$("#btn"+index).attr("val","0");
			$("#btn"+index).text("非空");
			var id = $("#btn"+index).attr("ele_id");
			nullOption[id] = "1";
		}
		for(var name in dataOptionOld){
			var rows = menuViewModel.gridDataTable3.getRowsByField('id',name);
			if(rows.length == "0"){
				continue;
			}
			var index = menuViewModel.gridDataTable3.getIndexByRowId(rows[0].rowId);
			$("#data"+index).attr("val","0");
			$("#data"+index).text("不维护");
			var id = $("#data"+index).attr("ele_id");
			dataOption[id] = "1";
		}
		$("#addCol1").hide();
	}

	menuViewModel.addColhide = function (){
		$("#addCol").hide();
	}

	menuViewModel.addColhide1 = function (){
		$("#addCol1").hide();
	}
	changeType = function (obj) {
		obj.element.innerHTML = '<a id="'+"btn"+ obj.rowIndex +'" onclick="change(this.id)" val="1" ele_id='+obj.row.value.id+' class="change-type">可空</a><span class="separator">';
	};
	changeType1 = function (obj) {
		var flag = obj.row.value.enable_null;
		var num = $("#num").val();
		if(num !="0"){
			if(flag != "0"){
				obj.element.innerHTML = '<a id="'+"btn"+ obj.rowIndex +'"  val="1" ele_id='+obj.row.value.id+' >可空</a><span class="separator">';
			}else{
				obj.element.innerHTML = '<a id="'+"btn"+ obj.rowIndex +'"  val="0" ele_id='+obj.row.value.id+' >非空</a><span class="separator">';
			}
		}else{
			if(flag != "0"){
				obj.element.innerHTML = '<a id="'+"btn"+ obj.rowIndex +'"  onclick="change(this.id)" val="1" ele_id='+obj.row.value.id+' class="change-type">可空</a><span class="separator">';
			}else{
				obj.element.innerHTML = '<a id="'+"btn"+ obj.rowIndex +'"  onclick="change(this.id)" val="0" ele_id='+obj.row.value.id+' class="change-type">非空</a><span class="separator">';
				nullOption[obj.row.value.chr_id] = "1";
			}
		}
	};
	change = function(value,evt){
		var e = evt || window.event;
		$("#changeflag").val("1");
		window.event ? e.cancelBubble = true : e.stopPropagation();
		var flag = $("#"+value).attr("val");
		var id = $("#"+value).attr("ele_id");
		if(flag == "1"){
			$("#"+value).attr("val","0");
			$("#"+value).text("非空");
			nullOption[id] = "1";
		}else{
			$("#"+value).attr("val","1");
			$("#"+value).text("可空");
			nullOption[id]="";
			delete nullOption[id];
		}
		e.stopPropagation();
	}
	dataType = function (obj) {
		obj.element.innerHTML = '<a id="'+"data"+ obj.rowIndex +'" onclick="change1type(this.id)" val="1" ele_id='+obj.row.value.id+' class="change-type">维护</a><span class="separator">';
	};
	dataType1 = function (obj) {
		var flag = obj.row.value.edit_show;
		if(flag != "0"){
			obj.element.innerHTML = '<a id="'+"data"+ obj.rowIndex +'" onclick="change1type1(this.id)" val="1" ele_id='+obj.row.value.id+' class="change-type">维护</a><span class="separator">';
			dataOption[obj.row.value.id] = "1";
		}else{
			obj.element.innerHTML = '<a id="'+"data"+ obj.rowIndex +'" onclick="change1type1(this.id)" val="0" ele_id='+obj.row.value.id+' class="change-type">不维护</a><span class="separator">';
			dataOption[obj.row.value.id] = "0";
		}
	};
	change1type = function(value,evt){
		var e = evt || window.event;
		window.event ? e.cancelBubble = true : e.stopPropagation();
		var flag = $("#"+value).attr("val");
		var id = $("#"+value).attr("ele_id");
		if(flag == "1"){
			$("#"+value).attr("val","0");
			$("#"+value).text("不维护");
			dataOption[id] = "0";
		}else{
			$("#"+value).attr("val","1");
			$("#"+value).text("维护");
			dataOption[id] = "";
			delete dataOption[id];
			

		}
	}
	change1type1 = function(value,evt){
		var e = evt || window.event;
		window.event ? e.cancelBubble = true : e.stopPropagation();
		var flag = $("#"+value).attr("val");
		var id = $("#"+value).attr("ele_id");
		if(flag == "1"){
			$("#"+value).attr("val","0");
			$("#"+value).text("不维护");
			dataOption[id] = "0";
		}else{
			$("#"+value).attr("val","1");
			$("#"+value).text("维护");
			dataOption[id] = "1";
		}
	}
	menuViewModel.initGrid = function(creatData,viewid,areaid,url,options) {

		var viewModel = {
				gridData: new u.DataTable({
					meta:''
				}),
				curGridHead: [],
				totals:[],
		};
		viewModel.createGrid = function(data) {
			var viewId = viewid;
			var meta = '{';
			for(var j=0;j<creatData.length;j++){
				meta += '"' + creatData[j].ele_code + '"';
				meta += ":{}";
				if(j < creatData.length - 1){
					meta += ",";
				}
			}
			meta += "}";
			viewModel.gridData.meta = JSON.parse(meta);
			var innerHTML = "<div u-meta='" + '{"id":"' + viewId + '","data":"gridData","type":"grid","editable":false,"autoExpand":false,"showTree":false,"showNumCol":true,"keyField":"theId","parentKeyField":"parentId","multiSelect":true,"height":450,"headerHeight":32,"rowHeight":32,"sumRowHeight":32}' + "'>";
			for(var i = 0; i < creatData.length; i++ ) {
				viewModel.curGridHead.push(creatData[i].ele_code);
				if(creatData[i].paratype == "1"||creatData[i].paratype == "4" ||creatData[i].paratype == "5"){
					if(creatData[i].is_show =="0"){
						innerHTML += "<div options='"+'{"field":"'+ creatData[i].ele_code +'","editType":"string","dataType":"String","title":"'+ creatData[i].ele_name +'","visible":"false"}'+"'></div>";	
					}else{
						innerHTML += "<div options='"+'{"field":"'+ creatData[i].ele_code +'","editType":"string","dataType":"String","title":"'+ creatData[i].ele_name +'"}'+"'></div>";
					}
				}else if(creatData[i].paratype == "2" ||creatData[i].paratype == "3"){
					if(creatData[i].is_show =="0"){
						innerHTML += "<div options='"+'{"field":"'+ creatData[i].ele_code +'","editType":"string","dataType":"String","title":"'+ creatData[i].ele_name +'","visible":"false","editOptions":{"id":"combobox'+i+'","type":"combo","datasource":"'+creatData[i].ele_code+'Items"},"editType":"combo","renderType":"comboRender"}'+"'></div>";
					}else{
						innerHTML += "<div options='"+'{"field":"'+ creatData[i].ele_code +'","editType":"string","dataType":"String","title":"'+ creatData[i].ele_name +'","editOptions":{"id":"combobox'+i+'","type":"combo","datasource":"'+creatData[i].ele_code+'Items"},"editType":"combo","renderType":"comboRender"}'+"'></div>";
					}
					if(creatData[i].parameter !=null && creatData[i].parameter != ""){
						var opDetail = creatData[i].parameter.split("#");
						var comItems =[];
						for(var z =0;z<opDetail.length; z++){
							var opvalue = opDetail[z].split("@");
							if(opvalue.length > 1){
								var itemoption ={};
								itemoption["value"] = opvalue[0];
								itemoption["name"] = opvalue[1];
								comItems.push(itemoption);
							}
						}
						viewModel[creatData[i].ele_code+'Items'] = comItems;
					}
				}
			}
			innerHTML += "</div>";
			innerHTML += "<div id='pagination' style='float: right;' class='u-pagination' u-meta='" + '{"type":"pagination","data":"gridData","pageList":[25,50,75,100],"sizeChange":"sizeChangeFun","pageChange":"pageChangeFun"}' + "'></div>";

			$('#'+areaid).append(innerHTML);
			viewModel.initdata();
		}
		viewModel.pageChangeFun = function(pageIndex) {
			viewModel.gridData.pageIndex(pageIndex);
			var total_row = viewModel.gridData.totalRow();
			var page_size = viewModel.gridData.pageSize();
			viewModel.getDataTableStaff(url, page_size, pageIndex, total_row);
		};
		viewModel.sizeChangeFun = function(size) {
			viewModel.gridData.pageSize(size);
			viewModel.gridData.pageIndex("0");
			viewModel.pageSizeNum = size;
			var total_row = viewModel.gridData.totalRow();
			viewModel.getDataTableStaff(url, size, "0", total_row);
		};
		viewModel.getDataTableStaff = function(url, size, pageIndex, totalElements) {
			ip.loading(true,areaid);
			var pageInfo = size + "," + pageIndex + "," + totalElements;
			options["pageInfo"]=pageInfo;
			options["sortType"]=JSON.stringify({});
			$.ajax({
				url: url,
				type: "GET",
				data: options,
				success: function(data) {
					ip.loading(false,areaid);
					totnum = data.totalElements;
					var pagenum = Math.ceil(totnum / size);
					viewModel.gridData.setSimpleData(data.dataDetail,{unSelect:true});
					databack2 = data.dataDetail;
					viewModel.gridData.totalPages(pagenum);
					viewModel.gridData.totalRow(totnum);
				}
			});
		};
		viewModel.initdata = function() {
			options["sortType"] = JSON.stringify(viewModel.string);
			options["pageInfo"] = 25 + "," + 0 + ",";
			options["totals"] = viewModel.totals.join(",");
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				async: true,
				data: options,
				beforeSend: ip.loading(true),
				success: function(data) {
					ip.loading(false,areaid);
					viewModel.gridData.pageIndex("0");
					viewModel.gridData.pageSize("25");
					totnum = data.totalElements;
					var pagenum = Math.ceil(totnum / 25);
					viewModel.gridData.setSimpleData(data.dataDetail,{unSelect:true});
					databack2 = data.dataDetail;
					viewModel.gridData.setRowUnSelect(0);
					viewModel.gridData.totalPages(pagenum);
					viewModel.gridData.totalRow(totnum);
				}
			});
		}

		viewModel.createGrid(creatData);

		ko.cleanNode($('#'+areaid)[0]);
		var app = u.createApp({
			el: '#'+areaid,
			model: viewModel
		});

		return viewModel;
	};

	menuViewModel.initForm = function(creatData,areaid){
		var html = '';
		var mustEdit = '<span class="star-color">*</span>';
		var oplength = creatData.length;
		var count = 0;
		for (var i = 0; i < oplength; i++) {
			var options  ={}
			var divhtml = '';
			var editType = creatData[i].edit_show;
			if( editType == "0"){
				divhtml = '<div class="form-group clearfix col-md-6" style="display:none">';
			}else{
				divhtml = '<div class="form-group clearfix col-md-6">';
			}
            var fieldhtml = '';
            var field_type = creatData[i].field_type;
            if(field_type == "2"){
            	fieldhtml = 'onKeyUp="value=value.replace(/[^\\d]/g,\'\')" placeholder="请输入数字"';
            }else if(field_type == "4"){
            	fieldhtml = 'onblur="   if( !(/^(([1-9]\\d*)|([0-9]+\\.[0-9]{1,2}))$/).test(this.value)){ if(!/^[0]$/.test(this.value)){alert(\'只能输入数字，小数点后只能保留两位\');this.value=\'\';}}"  placeholder="请输入数字"';
            }
			var musthtml = '';
			if(creatData[i].enable_null == "0"){
				musthtml = mustEdit;
			}
			var optionhtml = '';
			var parameter = creatData[i].parameter;
			var para_type = creatData[i].para_type;
			options["type"] = para_type;
			if(para_type == "2"){
				if(parameter != null && parameter!=""){
					var opDetail = parameter.split("#");
					for(var z =0;z<opDetail.length; z++){
						var opvalue = opDetail[z].split("@");
						if(opvalue.length > 1){
							optionhtml += '<option value="'+opvalue[0]+'">'+opvalue[1]+'</option>';
						}
					}
				}
			}else if(para_type == "3"){
				if(parameter != null && parameter!=""){
					var check = 0;
					var opDetail = parameter.split("#");
					for(var z =0;z<opDetail.length; z++){
						var opvalue = opDetail[z].split("@");
						if(opvalue.length > 1){
							if(check == 0){
								optionhtml += '<label><input type="radio" name="'+creatData[i].field_code+'Radios" id="'+opvalue[0]
								+'" value="'+opvalue[0]+'" checked>'+opvalue[1]+'</label>';
								check++;
							}else{
								optionhtml += '<label><input type="radio" name="'+creatData[i].field_code+'Radios" id="'+opvalue[0]
								+'" value="'+opvalue[0]+'">'+opvalue[1]+'</label>';
							}
						}
					}
				}
			}
			switch (para_type) {
			case "1": 
				divhtml +='<label class="col-md-4 control-label">'+musthtml+creatData[i].field_name+':</label>'+
				'<div class="input-group col-md-8">'+
				'<input type="text" class="form-control" id="query-'+creatData[i].field_code+'" '+fieldhtml+'></div></div>';
				break;
			case "2": 
				divhtml +='<label class="col-md-4 control-label">'+musthtml+creatData[i].field_name+':</label>'+
				'<div class="input-group col-md-8">'+
				'<select class="form-control" id="query-'+creatData[i].field_code+'">'+optionhtml+'</select></div></div>';
				break;
			case "3": 
				divhtml +='<label class="col-md-4 control-label">'+musthtml+creatData[i].field_name+':</label>'+
				'<div class="input-group col-md-8">'+
				optionhtml+'</div></div>';
				break;
			case "4": 
				divhtml +='<label class="col-md-4 control-label">'+musthtml+creatData[i].field_name+':</label>'+
				'<div class="input-group col-md-8 modal-input-group">'+
				'<input type="text" class="form-control" id="query-'+creatData[i].field_code+'">'+
				'<input id="query-'+creatData[i].field_code+'-h" type="hidden">'+
				'<span class="input-control-feedback" onclick="ip.clearText(\'query-'+creatData[i].field_code+'\')">X</span><span class="input-group-addon">'+
				'<span class="glyphicon glyphicon-list"  onclick="ip.showAssitTree(\'query-'+creatData[i].field_code+'\',\''+creatData[i].ele_code+'\',0,{},0,\'父级节点\')"></span></span>  '+
				'</div></div>';
				break;
			case "5": 
				divhtml +='<label class="col-md-4 control-label">'+musthtml+creatData[i].field_name+':</label>'+
				'<div class="input-group col-md-8 modal-input-group">'+
				'<input type="text" class="form-control" id="query-'+creatData[i].field_code+'">'+
				'<input id="query-'+creatData[i].field_code+'-h" type="hidden">'+
				'<span class="input-control-feedback" onclick="ip.clearText(\'query-'+creatData[i].field_code+'\')">X</span><span class="input-group-addon">'+
				'<span class="glyphicon glyphicon-list"  onclick="ip.showAssitTree(\'query-'+creatData[i].field_code+'\',\''+creatData[i].parameter+'\',0,{},0,\''+creatData[i].field_name+'\')"></span></span>  '+
				'</div></div>';
				break;
			case "6": 
				divhtml +='<label class="col-md-4 control-label">'+musthtml+creatData[i].field_name+':</label>'+
				'<div class="input-group date form_date col-md-8 modal-input-group" data-date="" '+
				'data-date-format="yyyy-mm-dd hh:ii:ss" data-link-field="query-'+creatData[i].field_code+'" data-link-format="yyyy-mm-dd hh:ii:ss">'+
				'<input class="form-control" size="16" id="query-'+creatData[i].field_code+'"	type="text" value=""> <span	class="input-group-addon">'+
				'<span class="glyphicon glyphicon-remove"></span></span><span class="input-group-addon">'+
				'<span class="glyphicon glyphicon-calendar"></span></span></div></div>';
				break;
			}
			options["html"] = divhtml;
			options["code"] = creatData[i].field_code;
			options["name"] = creatData[i].field_name;
			options["required"] = creatData[i].enable_null;
			options["para_type"] = creatData[i].para_type;
			formOption["form"+i] = options;
			if(editType !="0"){
				showOption["show"+count]=options;
				count++;
			}
		}
		showOption["count"]=count;
		var oplength1 = count;
		var divsize = Math.ceil(oplength1/2);
		for(var k = 0 ;k< divsize;k++){
			var divhtml = '<div class="row">';
			var fnum = 2*k;
			var divoption = showOption["show"+fnum];
			var html1 = divoption["html"];
			divhtml += html1;
			var num = 2*k+1;
			if(num<oplength1){
				var divoption1 = showOption["show"+num];
				var html2 = divoption1["html"];
				divhtml += html2;
			}
			divhtml += '</div>';
			html += divhtml;
		}
		if(divsize > 10){
			$(".form-block4").height(400);
		} else if(divsize < 5){
			$(".form-block4").height(200);
		}
		$("#"+areaid ).append(html);
		$.fn.datetimepicker.dates['zh-CN'] = {
				days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
				daysShort: ["日", "一", "二", "三", "四", "五", "六", "日"],
				daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
				months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
				monthsShort: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
				today: "今天",
				meridiem: ["上午", "下午"]
		};
		$('.form_date').datetimepicker({
			language: 'zh-CN',
			weekStart: 1,
			todayBtn: 1,
			autoclose: 1,
			todayHighlight: 1,
			startView: 2,
			minView: 2,
			forceParse: 0
		});
		
	}

	$(function () {
		ko.cleanNode($('body')[0]);
		app = u.createApp({
			el: 'body',
			model: menuViewModel
		});
		menuViewModel.getInitData();

	});
});
