define(['jquery', 'knockout', 'text!./budgetItemSummary._html','bootstrap','uui','tree', 'ip','css!./budgetItemSummary.css'], 
		function($,ko,budgetItemSummary) {
	var tokenid = ip.getTokenId();
	var tree_diff; //树的标识：判断是哪类树
	var select_bis_name; //预算项目树的name
	
	var bis_input_id; //主页面input框的id值
	
	var belong_parent_id1;   //指定父级
	var belong_parent_id2;
	var belong_parent_name1;
	var belong_parent_name2;
	var belong_ser_id1;      //业务处室
	var belong_ser_id2;
	var belong_ser_name1;
	var belong_ser_name2;
	var belong_project_id1;  //项目分类
	var belong_project_id2;
	var belong_project_name1;
	var belong_project_name2;
	var belong_unit_id1;     //预算单位   
	var belong_unit_id2;
	var belong_unit_name1;
	var belong_unit_name2;
	var is_ser_flag;
	var is_pro_flag;
	var is_unit_flag;
	var is_auto_code;
	var is_pro_flag1=true; //项目分类是否启用标识
	var is_ser_flag1=true; //业务处室是否启用标识
	var is_unit_flag1=true;//预算单位是否启用标识
	var options = ip.getCommonOptions({});
	
	var addCode = "";// 新添加的项目编码的code值
	var viewModel = {
		select_bis_id : ko.observable(''), //预算项目树id
		data : ko.observable({}),
		treeSetting:{  //1.预算项目树setting
			view:{
				selectedMulti:true
			},
			callback:{
				onClick:function(e,id,node){
					viewModel.select_bis_id(node.id);
					select_bis_name = node.name;
				},
				onDblClick: function(e, id, node) {
					viewModel.select_bis_id(node.id);
					select_bis_name = node.name;
					viewModel.sureSelectTree();
				}
			}
		},
		treePaSetting:{  //2.预算项目指定父级树setting
			view:{
				selectedMulti:true
			},
			callback:{
				onClick:function(e,id,node){
					belong_parent_id1=node.id;
					belong_parent_name1=node.name;
				}
			}
		},
		treeSerSetting:{ //3.业务处室树setting
			view:{
				selectedMulti:true
			},
			callback:{
				onClick:function(e,id,node){
					belong_ser_id1=node.id;
					belong_ser_name1=node.name;
				}
			}
		},
		treeProSetting:{ //4.项目分类树setting
			view:{
				selectedMulti:true
			},
			callback:{
				onClick:function(e,id,node){
					belong_project_id1=node.id;
					belong_project_name1=node.name;
				}
			}
		},
		treeUnitSetting:{ //5.预算单位树setting
			view:{
				selectedMulti:true
			},
			callback:{
				onClick:function(e,id,node){
					belong_unit_id1=node.id;
					belong_unit_name1=node.name;
				}
			}
		},
		bistreeDataTable: new u.DataTable({ // 1.预算项目树dataTable
			meta: {
				'chr_id': {
					'value':""
				},
				'parent_id': {
					'value':""
				},
				'codename':{
					'value':""
				}
			}
		}),
		treeSerDataTable: new u.DataTable({ //2.业务处室dataTable
			meta: {
				'chr_id': {
					'value':""
				},
				'parent_id': {
					'value':""
				},
				'chr_name':{
					'value':""
				}
			}
		}),
		treeProDataTable: new u.DataTable({ //3.项目分类树dataTable
			meta: {
				'chr_id': {
					'value':""
				},
				'parent_id': {
					'value':""
				},
				'chr_name':{
					'value':""
				}
			}
		}), 
		treeUnitDataTable: new u.DataTable({ //4.预算单位树dataTable
			meta: {
				'chr_id': {
					'value':""
				},
				'parent_id': {
					'value':""
				},
				'chr_name':{
					'value':""
				}
			}
		}), 
		
	};
	
	//新增按钮弾框
	viewModel.addBis = function() {
		viewModel.initUse();
		$('#addBudgetItem').modal('show');
	};
	
	/**	
	 * 初始化预算项目树
	 * input_id: 主页面input框的id值
	 * mb_id: 业务处室id,
	 * agencyexp_id: 经济分类id , 
	 * agency_id: 预算单位id
	 * mb_name: 业务处室名字
	 * agencyexp_name: 经济分类名字
	 * agency_name: 预算单位名字
	 */
	var agencyName
	var bis_mb_id;
	var bis_agencyexp_id;
	var bis_agency_id;
	viewModel.initBisTree = function(input_id, mb_id, agencyexp_id, agency_id, mb_name, agencyexp_name, agency_name,VMo) {
		viewModel.VM = {};
		if(VMo){
			viewModel.VM = VMo;
		}
		agencyName = agency_name;
		bis_input_id = input_id;
		bis_mb_id = mb_id || '';
		bis_agencyexp_id = agencyexp_id || '';
		bis_agency_id = agency_id || '';
		$('#belong-firm').val(mb_name || '');
		$('#belong-project').val(agencyexp_name || '');
		$('#belong-unit').val(agency_name || '');
		
		var data = {
			"mb_id" : mb_id || "",	
			"agencyexp_id" : agencyexp_id || "",	
			"agency_id" : agency_id || "",	
		};
		options['data'] = JSON.stringify(data);
		$.ajax({
			url: "/df/bistree/getBisTree.do?tokenid=" + tokenid,
			type: 'GET',
			dataType: 'json',
			data: options,
			success: function (map) {
				var data = map.data;
				$('#myModalBISTree').modal('show');
				viewModel.bistreeDataTable.clear();
				viewModel.bistreeDataTable.setSimpleData(data);
				var data_tree = $("#bisTree")[0]['u-meta'].tree;
				var search_nodes = data_tree.getNodesByParamFuzzy("chr_code",addCode,null);
				data_tree.selectNode(search_nodes[0]);
			}
		});
	};
	
	viewModel.closeBISTree = function() {
		$('#myModalBISTree').modal('hide');
	};
	
	//加载新增模态框
	viewModel.initUse = function(){
		$("#belong-unit").val(agencyName); //赋值预 算单位
		$.ajax({
			url: "/df/bis/getAddConfig.do?tokenid=" + tokenid,
			type: 'GET',
			dataType: 'json',
			data: {"tokenId":tokenid,"ajax":"1"},
			success: function (data) {
				if(data.flag=="1"){
					if(data.configData[0].chr_value=="1"){
						is_auto_code=true;
						$("#pro-code").parent().parent().hide();
					}else if(data.configData[0].chr_value=="0"){
						is_auto_code=false;
						$("#pro-code").parent().parent().show();
					}
					if(data.configData[3].chr_value=="1"){
						$("#belong-firm").parent().parent().show();
						$.ajax({
							url: "/df/dic/dictree.do?tokenid=" + tokenid,
							type: 'GET',
							dataType: 'json',
							data: {"tokenId":tokenid,"ajax":"1","element":"MB"},
							success: function (data) {
								if(data.flag=="1"){
									is_ser_flag=true;
									viewModel.treeSerDataTable.setSimpleData(data.eleDetail);
								}
							} 
						});
					}else if(data.configData[3].chr_value=="0"){
						is_ser_flag=false;
						$("#belong-firm").parent().parent().hide();
					}
					if(data.configData[2].chr_value=="1"){
						$("#belong-unit").parent().parent().show();
						$.ajax({
							url: "/df/dic/dictree.do?tokenid=" + tokenid,
							type: 'GET',
							dataType: 'json',
							data: {"tokenId":tokenid,"ajax":"1","element":"AGENCY"},
							success: function (data) {
								if(data.flag=="1"){
									is_unit_flag=true;
									viewModel.treeUnitDataTable.setSimpleData(data.eleDetail);
								}
							} 
						});
					}else if(data.configData[2].chr_value=="0"){
						is_unit_flag=false;
						$("#belong-unit").parent().parent().hide();
					}
					if(data.configData[1].chr_value=="1"){
						$("#belong-project").parent().parent().show();
						$.ajax({
							url: "/df/dic/dictree.do?tokenid=" + tokenid,
							type: 'GET',
							dataType: 'json',
							data: {"tokenId":tokenid,"ajax":"1","element":"AGENCYEXP"},
							success: function (data) {
								if(data.flag=="1"){
									is_pro_flag=true;
									viewModel.treeProDataTable.setSimpleData(data.eleDetail);
								}
							} 
						});
					}else if(data.configData[1].chr_value=="0"){
						is_pro_flag=false;
						$("#belong-project").parent().parent().hide();
					}
				}
			} 
		});
	};
	
	//预算项目树确定
	viewModel.sureSelectTree = function () {
		if (!ip.isEmptyObject(viewModel.VM)) {
			var focus_row = viewModel.VM.getFocusRow();
			viewModel.VM.setValue("BIS", select_bis_name, focus_row);
		} else {
			//div#bis_input_id 对应主页面的预算项目的input框
			var treeObj = $.fn.zTree.getZTreeObj("bisTree");
			var nodes = treeObj.getSelectedNodes();
			select_bis_name = nodes[0].name;
			$('#' + bis_input_id).val(select_bis_name);
		}
		$('#myModalBISTree').modal('hide');
	};
	
	//新增节点的弹出树确定
	viewModel.sureNode = function () {
		if(tree_diff=="pa"){
			belong_parent_id2=belong_parent_id1;
			belong_parent_name2=belong_parent_name1;
			$("#belong-parent").val(belong_parent_name2);
			$("#belong-parent").attr("name",belong_parent_id2);
			$('#addChoiceModel').modal('hide');
		}
		if(tree_diff=="ser"){
			belong_ser_id2=belong_ser_id1;
			belong_ser_name2=belong_ser_name1;
			$("#belong-firm").val(belong_ser_name2);
			$("#belong-firm").attr("name",belong_ser_id2);
			$('#addChoiceModel').modal('hide');
		}
		if(tree_diff=="pro"){
			belong_project_id2=belong_project_id1;
			belong_project_name2=belong_project_name1;
			$("#belong-project").val(belong_project_name2);
			$("#belong-project").attr("name",belong_project_id2);
			$('#addChoiceModel').modal('hide');
		}
		if(tree_diff=="unit"){
			belong_unit_id2=belong_unit_id1;
			belong_unit_name2=belong_unit_name1;
			$("#belong-unit").val(belong_unit_name2);
			$("#belong-unit").attr("name",belong_unit_id2);
			$('#addChoiceModel').modal('hide');
		}
	};
	
	var j = 1;
	//快速查询
	viewModel.viewQuery = function (){
		var treeId = $(".view-Tree").find(".ztree:visible").attr("id");
		var user_write = $("#addviewInput").val();
		var data_tree = $("#"+treeId+"")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		data_tree.expandNode(search_nodes[0],true,false,true);
		data_tree.selectNode(search_nodes[0]);	
		j = 1;
	};
	//下一个
	viewModel.viewNext = function (){
		var treeId = $(".view-Tree").find(".ztree:visible").attr("id");
		var user_write = $("#addviewInput").val();
		var data_tree = $("#"+treeId+"")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		if(j < search_nodes.length){
			data_tree.selectNode(search_nodes[j++]);
		}else{
			j = 1;
		}
	};
	
	//快速查询预算项目树
	viewModel.viewQuery2 = function (){
		var treeId = "bisTree";
		var user_write = $("#addviewInputbis").val();
		var data_tree = $("#"+treeId+"")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		if (search_nodes == null || search_nodes.length == 0) {
			ip.ipInfoJump("无搜索结果", "error");
			return;
		}
		data_tree.expandNode(search_nodes[0],true,false,true);
		data_tree.selectNode(search_nodes[0]);	
		j = 1;
	};
	//下一个
	viewNext2 = function (){
		var treeId = "bisTree";
		var user_write = $("#addviewInputbis").val();
		var data_tree = $("#"+treeId+"")[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
		if(j < search_nodes.length){
			data_tree.selectNode(search_nodes[j++]);
		}else{
			j = 1;
		}
	};
	
	//新增保存预算项目
	viewModel.sureItem = function (){
		var pro_code = $.trim($("#pro-code").val());
		if(!is_auto_code){
			if(pro_code == null ||pro_code ==""){
				ip.ipInfoJump("请输入项目编码！","info");
				return;
			}
		}
		var pro_name = $.trim($("#pro-name").val());
		if(pro_name == null || pro_name == ""){
			ip.ipInfoJump("请输入项目名称！","info");
			return;
		}
		if(is_pro_flag&&is_pro_flag1){
			var belong_project = $.trim($("#belong-project").val());
			if(belong_project == null || belong_project == ""){
				ip.ipInfoJump("请选择项目分类！","info");
				return;
			}
		}
		if(is_ser_flag&&is_ser_flag1){
			var belong_firm = $.trim($("#belong-firm").val());
			if(belong_firm == null || belong_firm == ""){
				ip.ipInfoJump("请选择业务处室！","info");
				return;
			}
		}
		if(is_unit_flag&&is_unit_flag1){
			var belong_unit = $.trim($("#belong-unit").val());
			if(belong_unit == null || belong_unit == ""){
				ip.ipInfoJump("请选择预算单位！","info");
				return;
			}
		}
		$.ajax({
			url: "/df/bis/saveBisInput.do?tokenid="+tokenid,
			type: 'POST',
			dataType: 'json',
			data: {
				"tokenId":tokenid,
				"ajax":"1",
				"chr_code":pro_code,
				"chr_name":pro_name,
				"parent_id":belong_parent_id2,
				"public_sign":$("#is-public").val(),
				"enabled":$("#is-use").val(),
				"mb_id": belong_ser_id2 || bis_agencyexp_id,
				"agency_id": belong_unit_id2 || bis_agency_id,
				"agencyexp_id": belong_project_id2 || bis_agencyexp_id
			},
			success: function (data) {
				if(data.flag=="1"){
					$("#addBudgetItem").modal("hide");
					addCode = data.code;
					viewModel.initBisTree(bis_input_id, bis_mb_id, bis_agencyexp_id, bis_agency_id, '', '', $("#belong-unit").val());
					belong_parent_id2 = "";
					belong_ser_id2 = "";
					belong_unit_id2 = "";
					belong_project_id2 = "";
					viewModel.clearAllText();
					ip.ipInfoJump("保存成功！","success");
				}
			}
		});
	};
	
	//清空新增预算项目的输入框
	viewModel.clearAllText = function() {
		$("#pro-code").val('');
		$("#pro-name").val('');
		$("#belong-project").val('');
		$("#belong-firm").val('');
		$("#belong-unit").val('');
	};
	
	//清空输入框的值
	clearTextForBis = function(id){
		$("#"+ id).val("");
	};
	
	//验证预算项目编码是否存在
    viewModel.changeProCode = function(){
    	var pro_code = $.trim($("#pro-code").val());
		var pro_id = $("#pro-code").attr("name");
	    $.ajax({
			url: "/df/bis/checkBis.do?tokenid=" + tokenid,
			type: 'POST',
			dataType: 'json',
			data: {
				"tokenId":tokenid,
				"ajax":"1",
				"bis_id":pro_id,
				"bis_code":pro_code
			},
			success: function (data) {
				if(data.flag=="1"){
					if(data.isok=="0"){
						ip.ipInfoJump("该项目编码已存在，请重新编写！","info");
						$("#pro-code").val("");
					}
				}
				if(data.flag=="0"){
					ip.ipInfoJump("系统繁忙，请稍后！","info");
				}
			} 
		});
    };
    
    //是否共用项目下拉框change事件
    viewModel.changeSelect = function(){
    	if($("#is-public").val()=="1"){
			$("#belong-firm").parent().parent().hide();
			$("#belong-unit").parent().parent().hide();
			$("#belong-project").parent().parent().hide();
			is_pro_flag1=false;
			is_ser_flag1=false;
			is_unit_flag1=false;
		}
		if($("#is-public").val()=="0"){
			if(is_pro_flag){
				$("#belong-project").parent().parent().show();
				is_pro_flag1=true;
			}
			if(is_ser_flag){
				$("#belong-firm").parent().parent().show();
				is_ser_flag1=true;
			}
			if(is_unit_flag){
				$("#belong-unit").parent().parent().show();
				is_unit_flag1=true;
			}
		}
    };
    
 	//弹出父级树
    viewModel.showTreePar = function() {
    	$('#addtreeTitle').text('指定父级内容选择');
	    tree_diff = 'pa';
    	$("#manageTreePa").show();
    	$("#manageTreeSer").hide();
    	$("#manageTreePro").hide();
    	$("#manageTreeUnit").hide();
    };
    
    //弹出项目分类树
    viewModel.showTreePro = function() {
    	$('#addtreeTitle').text('项目分类内容选择');
	    tree_diff = 'pro';
    	$("#manageTreeSer").hide();
    	$("#manageTreePa").hide();
    	$("#manageTreePro").show();
    	$("#manageTreeUnit").hide();
    };
    
    //弹出业务处室树
    viewModel.showTreeSer = function() {
    	$('#addtreeTitle').text('业务处室内容选择');
	    tree_diff = 'ser';
    	$("#manageTreeSer").show();
    	$("#manageTreePa").hide();
    	$("#manageTreePro").hide();
    	$("#manageTreeUnit").hide();
    };
    
    //弹出预算单位树
    showTreeUnit = function() {
    	$('#addtreeTitle').text('预算单位内容选择');
	    tree_diff = 'unit';
    	$("#manageTreeSer").hide();
    	$("#manageTreePa").hide();
    	$("#manageTreePro").hide();
    	$("#manageTreeUnit").show();
    };
    
	 var init = function(contanier) { 
		 ko.cleanNode($("#budgsTree")[0]);
			app = u.createApp({
				el : '#budgsTree', //引用页面需要放置的一个容纳的div 
				model : viewModel
			});
     };

	return {
        'model': viewModel,
        'template' : budgetItemSummary,
        'init' : init
    };
	
});
