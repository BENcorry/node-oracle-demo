require(['jquery', 'knockout', 'bootstrap', 'uui','tree','grid','director','dateZH','ip'], function ($, ko) {
	window.ko = ko;
	var tokenid = ip.getTokenId();
	var sysId = null;
	var pagetype = "1";
	var menuViewModel = {
			data : ko.observable({}),
			treeSetting:{
				view:{
				},
				callback:{
					onClick:function(e,id,node){
						var parentid = node.pid;
						if(parentid == "0" ){
							pagetype = "1";
							$("#gridpanel").show();
							$("#formpanel").hide();
							var sys_id = node.id;
							sysId = sys_id;
							$.ajax({
								url: "/df/elementConfig/eleGridQuery.do?tokenid="+tokenid,
								type: 'GET',
								dataType: 'json',
								data: {"sys_id":sys_id,"ajax":"noCache"},
								success: function (data) {
									sysId = sys_id;
									menuViewModel.gridDataTable.removeAllRows();
									menuViewModel.gridDataTable.setSimpleData(data.dataDetail);
									menuViewModel.gridDataTable.setRowUnSelect(0);
								}
							});
						}else{
							pagetype = "2";
							sysId = node.pid;
							var ele_id = node.id;
							$("#gridpanel").hide();
							$("#formpanel").show();
							$.ajax({
								url: "/df/elementConfig/queryFormData.do?tokenid="+tokenid,
								type: 'GET',
								dataType: 'json',
								data: {"ele_id":ele_id,"ajax":"noCache"},
								success: function (data) {
									var dataDetail = data.dataDetail;
									if(dataDetail.length > 0){
										$("#ele_id1").val(dataDetail[0].ele_id);
										$("#ele_code1").val(dataDetail[0].ele_code);
										$("#ele_name1").val(dataDetail[0].ele_name);
										$("#ele_colname1").val(dataDetail[0].ele_colname);
										$("#ele_type1").val(dataDetail[0].ele_type);
										$("#ele_format1").val(dataDetail[0].ele_format);
										$("#paratype1").val(dataDetail[0].paratype);
										$("#parameter1").val(dataDetail[0].parameter);
										$("#default_value1").val(dataDetail[0].default_value);
										$("#sys_id1").val(dataDetail[0].sys_id);
										$("#is_sysdefault").val(dataDetail[0].is_sysdefault);
										var orgtype = dataDetail[0].paratype;
										if(orgtype == "1" ||orgtype == "4" ){
											$("#para1").hide();
										} else if(orgtype == "2"){
											$("#para1").show();
										} else if(orgtype == "3"){
											$("#para1").show();
										} else if(orgtype == "5"){
											$("#para1").show();
										}
									}
								}
							});
						}
					}
				}
			},
			treeSetting2:{
				view:{
					selectedMulti:false
				},
				callback:{
					onClick:function(e,id,node){
						ui_guid = node.id;
					}
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
			}, {
				"value": "4",
				"name": "录入"
			}, {
				"value": "5",
				"name": "辅助录入"
			}],  
			comItems2: [],  
			treeViewTable: new u.DataTable({
				meta: {
					'ui_id': {
						'value':""
					},
					'parentid': {
						'value':""
					},
					'uiname':{
						'value':""
					}
				}
			}),
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
					'default_value':{},
					'sys_id':{}
				}
			})
	};
	menuViewModel.getInitData = function () {
		$("#para").hide();
		$("#gridpanel").show();
		$("#formpanel").hide();
		menuViewModel.gridDataTable.removeAllRows();
		$.ajax({
			url: "/df/elementConfig/dataElementTree.do?tokenid=" + tokenid,
			type: 'GET',
			async: false,
			dataType: 'json',
			data: {"ajax":"noCache"},
			success: function (data) {
				var treedata = data.dataDetail;
				menuViewModel.treeDataTable.setSimpleData(treedata);
				var data_tree = $("#menuConfigTree1")[0]['u-meta'].tree;
				var nodes  = data_tree.getNodes();
				data_tree.expandNode(nodes[0], true, false, true);
				var dataselect = data.selectDetail;
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
	}
	var val = "";
	quickQuery = function (){  
		var user_write = $("#quickquery").val();
		if(val == user_write){
			return;
		}
		val = user_write;
		var data_tree = $("#menuConfigTree1")[0]['u-meta'].tree;
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
		$("#menuConfigTree1 .curSelectedNode").click();
		$("#quickquery").focus();
		i = 1;


	}

	var i = 0;
	menuTreeNext = function (){
		var user_write = $("#quickquery").val();
		var data_tree = $("#menuConfigTree1")[0]['u-meta'].tree;
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
		$("#menuConfigTree1 .curSelectedNode").click();
		$("#quickquery").focus();
	}

	menuViewModel.addbtn= function (){
		$("#para").hide();
		$("#ele_code").val("");
		$("#ele_name").val("");
		$("#ele_colname").val("");
		$("#ele_type").val("1");
		$("#ele_format").val("");
		$("#paratype").val("1");
		$("#parameter").val("");
		$("#default_value").val("");
		$("#sys_id").val(sysId);
		$("#addRoleModal").modal({backdrop: 'static', keyboard: false});
	}

	menuViewModel.editbtn= function (){
		var selRows = menuViewModel.gridDataTable.getSelectedRows();
		if(selRows.length == 0){
			ip.ipInfoJump("请选择修改的数据","info");
			return;
		}
		if(selRows.length > 1){
			ip.ipInfoJump("请不用选择一条以上的数据","info");
			return;
		}
		var seldata = selRows[0].data;
		var def = seldata.is_sysdefault.value;
		if(def === "1"){
			ip.ipInfoJump("默认列不可修改","info");
			return;
		}
		
		$("#ele_id").val(seldata.ele_id.value);
		$("#old_code").val(seldata.ele_code.value);
		$("#ele_code2").val(seldata.ele_code.value);
		$("#ele_name2").val(seldata.ele_name.value);
		$("#ele_colname2").val(seldata.ele_colname.value);
		$("#ele_type2").val(seldata.ele_type.value);
		$("#ele_format2").val(seldata.ele_format.value);
		var paratype = seldata.paratype.value;
		$("#paratype2").val(paratype);
		if(paratype == "1"){
			$("#para2").hide();
		} else if(paratype == "2"){
			$("#para2").show();
			$("#parameter2").attr('placeholder','格式  1@测试1#2@测试2#3@测试3')
		} else if(paratype == "3"){
			$("#para2").show();
			$("#parameter2").attr('placeholder','格式  0@启用#1@停用')
		}
		$("#parameter2").val(seldata.parameter.value);
		$("#sys_id2").val(seldata.sys_id.value);
		$("#default_value2").val(seldata.default_value.value);
		$("#addRoleModal1").modal({backdrop: 'static', keyboard: false});
	}

	menuViewModel.editbtn2 = function (){
		var def = $("#default_value1").val();
		if(def === "1"){
			ip.ipInfoJump("默认列不可修改","info");
			return;
		}
		$("#ele_id").val( $("#ele_id1").val());
		$("#old_code").val($("#ele_code1").val());
		$("#ele_code2").val($("#ele_code1").val());
		$("#ele_name2").val($("#ele_name1").val());
		$("#ele_colname2").val($("#ele_colname1").val());
		$("#ele_type2").val($("#ele_type1").val());
		$("#ele_format2").val($("#ele_format1").val());
		$("#paratype2").val($("#paratype1").val());
		$("#parameter2").val($("#parameter1").val());
		$("#default_value2").val($("#default_value1").val());
		var paratype = $("#paratype1").val();
		if(paratype == "1"){
			$("#para2").hide();
		} else if(paratype == "2"){
			$("#para2").show();
			$("#parameter2").attr('placeholder','格式  1@测试1#2@测试2#3@测试3')
		} else if(paratype == "3"){
			$("#para2").show();
			$("#parameter2").attr('placeholder','格式  0@启用#1@停用')
		}
		$("#sys_id2").val($("#sys_id1").val());
		$("#addRoleModal1").modal({backdrop: 'static', keyboard: false});
	}

	orgTypeChange = function(obj){
		var orgtype = obj.value;
		if(orgtype == "1"){
			$("#para").hide();
		} else if(orgtype == "2"){
			$("#para").show();
			$("#parameter").attr('placeholder','格式  1@测试1#2@测试2#3@测试3')
		} else if(orgtype == "3"){
			$("#para").show();
			$("#parameter").attr('placeholder','格式  0@启用#1@停用')
		} else if(orgtype == "5"){
			$("#para").show();
			$("#parameter").attr('placeholder','要素编码');
		}

	}

	orgTypeChange1 = function(obj){
		var orgtype = obj.value;
		if(orgtype == "1"){
			$("#para1").hide();
		} else if(orgtype == "2"){
			$("#para1").show();
			$("#parameter1").attr('placeholder','格式  1@测试1#2@测试2#3@测试3')
		} else if(orgtype == "3"){
			$("#para1").show();
			$("#parameter1").attr('placeholder','格式  0@启用#1@停用')
		}

	}

	orgTypeChange2 = function(obj){
		var orgtype = obj.value;
		if(orgtype == "1"){
			$("#para2").hide();
		} else if(orgtype == "2"){
			$("#para2").show();
			$("#parameter2").attr('placeholder','格式  1@测试1#2@测试2')
		} else if(orgtype == "3"){
			$("#para2").show();
			$("#parameter2").attr('placeholder','格式  1@启用#0@停用')
		}  else if(orgtype == "5"){
			$("#para2").show();
			$("#parameter2").attr('placeholder','要素编码')
		}

	}
	refreshgrid = function(){
		$.ajax({
			url: "/df/elementConfig/eleGridQuery.do?tokenid="+tokenid,
			type: 'GET',
			dataType: 'json',
			data: {"sys_id":sysId,"ajax":"noCache"},
			success: function (data) {
				menuViewModel.gridDataTable.removeAllRows();
				menuViewModel.gridDataTable.setSimpleData(data.dataDetail);
				menuViewModel.gridDataTable.setRowUnSelect(0);
			}
		});
	}

	refreshTree = function(){
		$.ajax({
			url: "/df/elementConfig/dataElementTree.do?tokenid=" + tokenid,
			type: 'GET',
			async: false,
			dataType: 'json',
			data: {"ajax":"noCache"},
			success: function (data) {
				var treedata = data.dataDetail;
				menuViewModel.treeDataTable.setSimpleData(treedata);
				var data_tree = $("#menuConfigTree1")[0]['u-meta'].tree;
				var nodes  = data_tree.getNodes();
				data_tree.expandNode(nodes[0], true, false, true);
			} 
		});
		var data_tree = $("#menuConfigTree1")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("id",sysId,null);
		if(0 < search_nodes.length){
			data_tree.selectNode(search_nodes[0]);
		}
	}

	menuViewModel.delbtn = function (){
		var selRows = menuViewModel.gridDataTable.getSelectedRows();
		if(selRows.length == 0){
			ip.ipInfoJump("请选择删除的数据","info");
			return;
		}
		ip.warnJumpMsg("真的要删除吗?","sid","cCla");
		$("#sid").on("click",function(){
			$("#config-modal").remove();
			var selGuid = "";
			var undelGuid="";
			for(var sel = 0 ; sel < selRows.length ;sel++){
				if(selRows[sel].data.is_sysdefault.value != "1"){
					selGuid =  selRows[sel].data.ele_id.value + "," +selGuid;
				} else {
					undelGuid = selRows[sel].data.ele_code.value + "," +undelGuid;
				}
			}
			if(undelGuid != "")
			ip.ipInfoJump("默认列："+undelGuid+"不可删除","info");
			if(selGuid == ""){
				return;
			}
			$.ajax({
				url: "/df/elementConfig/delEleData.do?tokenid=" + tokenid,
				type: 'POST',
				dataType: 'json',
				data: {"selid":selGuid,"ajax":"noCache"},
				success: function (data) {
					if(data.flag == 1){
						var num = data.num;
						ip.ipInfoJump("成功删除"+num+"条数据","success");
						refreshgrid();
						refreshTree();
					}else{
						ip.ipInfoJump("删除失败","error");
					}
				} 
			});
		});
		$(".cCla").on("click",function(){
			//处理取消逻辑方法
			$("#config-modal").remove();
		});
	}
	menuViewModel.ensure = function (){
		var ele_code = $("#ele_code").val();
		if(ele_code == null || ele_code.trim() ==""){
			ip.ipInfoJump("编码不可为空","error");
			return;
		}
		var ele_name = $("#ele_name").val();
		if(ele_name == null || ele_name.trim() ==""){
			ip.ipInfoJump("名称不可为空","error");
			return;
		}
		var ele_colname = $("#ele_colname").val();
		if(ele_colname == null || ele_colname.trim() ==""){
			ip.ipInfoJump("字段名不可为空","error");
			return;
		}
		var ele_type = $("#ele_type").val();
		if(ele_type == null || ele_type.trim() ==""){
			ip.ipInfoJump("字段类型不可为空","error");
			return;
		}
		var ele_format = $("#ele_format").val();
		if(ele_format == null || ele_format.trim() ==""){
			ip.ipInfoJump("字段大小不可为空","error");
			return;
		}
		var parameter = $("#parameter").val();
		var paratype = $("#paratype").val();
		if(paratype == null || paratype.trim() ==""){
			ip.ipInfoJump("录入类型不可为空","error");
			return;
		}else if(paratype != "1" && paratype != "6"){
			if(parameter == null || parameter.trim() ==""){
				ip.ipInfoJump("参数不可为空","error");
				return;
			}
		}
		var default_value = $("#default_value").val();
		var sys_id = $("#sys_id").val();
		var options = {};
		options["default_value"]=default_value;
		options["ele_code"]=ele_code;
		options["ele_name"]=ele_name;
		options["ele_colname"]=ele_colname;
		options["ele_type"]=ele_type;
		options["ele_format"]=ele_format;
		options["parameter"]=parameter;
		options["paratype"]=paratype;
		options["sys_id"]=sys_id;
		options["ajax"]="noCache";
		$.ajax({
			url: "/df/elementConfig/insertEleData.do?tokenid=" + tokenid,
			type: 'POST',
			dataType: 'json',
			data: options,
			success: function (data) {
				menuViewModel.getInitData();
				var data_tree = $("#menuConfigTree1")[0]['u-meta'].tree;
				var search_nodes = data_tree.getNodesByParamFuzzy("id",data.eleid,null);
				if(0 < search_nodes.length){
					data_tree.selectNode(search_nodes[0]);
					pagetype = "2";
					sysId = search_nodes.pid;
					$("#addRoleModal").modal('hide');
					$("#gridpanel").hide();
					$("#formpanel").show();
					$("#menuConfigTree1 .curSelectedNode").click();
				}
			} 
		});
	}

	menuViewModel.ensure2 = function (){
		var ele_id = $("#ele_id").val();
		var old_code = $("#old_code").val();
		var ele_code = $("#ele_code2").val();
		if(ele_code == null || ele_code.trim() ==""){
			ip.ipInfoJump("编码不可为空","error");
			return;
		}
		var ele_name = $("#ele_name2").val();
		if(ele_name == null || ele_name.trim() ==""){
			ip.ipInfoJump("名称不可为空","error");
			return;
		}
		var ele_colname = $("#ele_colname2").val();
		if(ele_colname == null || ele_colname.trim() ==""){
			ip.ipInfoJump("字段名不可为空","error");
			return;
		}
		var ele_type = $("#ele_type2").val();
		if(ele_type == null || ele_type.trim() ==""){
			ip.ipInfoJump("字段类型不可为空","error");
			return;
		}
		var ele_format = $("#ele_format2").val();
		if(ele_format == null || ele_format.trim() ==""){
			ip.ipInfoJump("字段大小不可为空","error");
			return;
		}
		var parameter = $("#parameter2").val();
		var paratype = $("#paratype2").val();
		if(paratype == null || paratype.trim() ==""){
			ip.ipInfoJump("录入类型不可为空","error");
			return;
		}else if(paratype != "1"){
			if(parameter == null || parameter.trim() ==""){
				ip.ipInfoJump("参数不可为空","error");
				return;
			}
		}
		var default_value = $("#default_value2").val();
		var sys_id = $("#sys_id2").val();
		var options = {};
		options["default_value"]=default_value;
		options["ele_id"]=ele_id;
		options["ele_code"]=ele_code;
		options["ele_name"]=ele_name;
		options["ele_colname"]=ele_colname;
		options["ele_type"]=ele_type;
		options["ele_format"]=ele_format;
		options["parameter"]=parameter;
		options["paratype"]=paratype;
		options["sys_id"]=sys_id;
		options["old_code"]=old_code;
		options["ajax"]="noCache";
		$.ajax({
			url: "/df/elementConfig/updateEleData.do?tokenid=" + tokenid,
			type: 'POST',
			dataType: 'json',
			data: options,
			success: function (data) {
				if(data.flag == "1"){
					menuViewModel.getInitData();
					ip.ipInfoJump("修改成功","success");
					var data_tree = $("#menuConfigTree1")[0]['u-meta'].tree;
					var search_nodes = data_tree.getNodesByParamFuzzy("id",data.eleid,null);
					if(0 < search_nodes.length){
						data_tree.selectNode(search_nodes[0]);
						pagetype = "2";
						sysId = search_nodes.pid;
						$("#addRoleModal1").modal('hide');
						$("#gridpanel").hide();
						$("#formpanel").show();
						$("#menuConfigTree1 .curSelectedNode").click();
					}
				}else{
					ip.ipInfoJump(data.message,"error");
				}
			} 
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
