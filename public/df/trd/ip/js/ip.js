$(function(){
	$.ajaxSetup({cache:false});
	//添加弹窗的拖动
	$(document).on("shown.bs.modal", ".modal", function(){
	    $(this).draggable({
	        handle: ".modal-header",   // 只能点击头部拖动
	        cursor: 'move',
	    	refreshPositions: false,
	    	scroll: false
	    });
	    $(this).css("overflow", "hidden"); // 防止出现滚动条，出现的话，你会把滚动条一起拖着走的
	});
	$('head', parent.document).append('<meta http-equiv="X-UA-Compatible" content="IE=9,chrome=1">');
});
var ip = {};
// tree节点点击后是否需要跳转
ip.treeJump = function(data) {
	for (var i = 0; i < data.length; i++) {
		data[i].url = null;
	}
	return data;
};
// 封装页面公共参数
ip.getCommonOptions = function(options) {
	var common_data = JSON.parse(sessionStorage.getItem("commonData"));
	if(!common_data){
		common_data = [];
	}
	var options_array = ["svFiscalPeriod","svSetYear","svTransDate","svUserId","svUserCode",
	                     "svUserName","svRgCode","svRgName","svRoleId","svRoleCode",
	                     "svRoleName","svAgencyId","svAgencyCode","svAgencyName","svDivision",
	                     "svBelongOrg","svUserType"];
	for(var i = 0; i < options_array.length; i++) {
		if(options[options_array[i]]) {
			options[options_array[i]] = options[options_array[i]];
		} else if(common_data[options_array[i]]){
			options[options_array[i]] = common_data[options_array[i]];
		} else {
			options[options_array[i]] = "";
		}
	}
	options["ajax"] = "noCache";
	options["tokenid"] = options["tokenid"] || ip.getTokenId();
	options["svMenuId"] = options["svMenuId"] || ip.getMenuId();
	options["svMenuName"] = options["svMenuName"] || ip.getMenuName();
	return options;
};

ip.checkAttr = function(attr) {
	attr == "undefind" ? attr = "" : attr = attr;
	return attr
};
// 获取当前菜单id
ip.getMenuId = function() {
	return ip.getUrlParameter("menuid");
};
// 获取当前菜单name
ip.getMenuName = function() {
	return ip.getUrlParameter("menuname");
};
ip.getPriEleCodeRelation = function(ele_code, eleRelations, areaId) {
	var m = "";
	for (var i = 0; i < eleRelations.length; i++) {
		if (eleRelations[i].sec_ele_code == ele_code.toUpperCase()) {
			var pri_ele_code = $("#" + eleRelations[i].pri_ele_code + "-" + areaId + "-h");
			if (pri_ele_code != undefined && pri_ele_code.val() != undefined && pri_ele_code.val() != "") {
				m += eleRelations[i].pri_ele_code + ":" + pri_ele_code.val().split("@")[2] + "@@";
			}
		}
	}
	return m;
};
ip.grelations = null;
ip.grelationvalue = null;
ip.coaRelation = function(ele_code, coa_id, eleRelations, flag, areaId, viewModel, ele_name, ele_value,condition,parentFlag,showFlag,callBack,callBack2) {
	var old_value = $("#" + ele_code + "-" + areaId).val();
	ip.grelationvalue = old_value;
	var relations = ip.getPriEleCodeRelation(ele_code, eleRelations, areaId);
	ip.grelations = eleRelations;
	if(condition == undefined) {
		condition = "";
	}
	var all_options = {
		"tokenid": ip.getTokenId(),
		"element": ele_code,
		"coa_id": coa_id,
		"ele_value": ele_value,
		"relations": relations,
		"ajax": "noCache",
		"condition": condition
	};
	$.ajax({
		url: "/df/dic/dictree.do",
		type: "GET",
		dataType: "json",
		async: false,
		data: ip.getCommonOptions(all_options),
		success: function(data) {
			ip.treeChoice(ele_code, data.eleDetail, flag, viewModel, areaId, ele_name,parentFlag,callBack,showFlag,callBack2);
		}
	});
};
ip.clearSecEleCode = function(ele_code, areaId) {
	if (ip.grelations == null) {
		return;
	}
	var cur_value = $("#" + ele_code + areaId).val();
	if (ip.grelationvalue != cur_value) {
		for (var i = 0; i < ip.grelations.length; i++) {
			if (ip.grelations[i].pri_ele_code == ele_code) {
				var sec_ele_code = $("#" + ip.grelations[i].sec_ele_code + "-" + areaId);
				if (sec_ele_code != undefined) {
					$("#" + ip.grelations[i].sec_ele_code + "-" + areaId + "-h").val("");
					$("#" + ip.grelations[i].sec_ele_code + "-" + areaId).val("");
				}
			}
		}
	}
	ip.grelations = null;
};
// 通过角色菜单判断资源标识显示与否
ip.isShow = function(data) {
		for (var i = 0; i < data.length; i++) {
			if (data[i].flag == "0") {
				$("#" + data[i].id).css("display", "none");
			} else {
				$("#" + data[i].id).css("display", "block");
			}
		}
	}
	// 带确定 取消的消息提示框(平台)
ip.warnJumpMsg = function(msg, sureId, cancelCla, warnFlag) {
	// 带确定 取消的消息提示框
	var configModal = $("#config-modal")[0];
	if (!configModal) {
		var innerHTML = "<div id='config-modal' class='bs-modal-sm'><div class='modal-dialog modal-sm' style='width: 300px;'>";
		innerHTML += "<div class='modal-content'><div class='modal-header'>";
		innerHTML += "<button type='button' class='close closeBtn " + cancelCla + "'><span>&times;</span></button>";
		innerHTML += "<h4 class='modal-title'>系统提示</h4></div><div class='modal-body'><p id='msg-notice'>" + msg + "</p></div>";
		innerHTML += "<div class='modal-footer'><button id=" + sureId + " type='button' class='btn btn-primary sure'>确定</button>";
		innerHTML += "<button  type='button' class='closeBtn btn btn-default " + cancelCla + "'>取消</button></div></div></div></div>";
		$("body").append(innerHTML);
	} else {
		$("#config-modal").show();
	    //$(this).css("overflow", "hidden");
		$("#msg-notice").text(msg);
		$(".sure").attr("id", sureId);
		$(".closeBtn").addClass(cancelCla);
	}
	$(document).on("click", function(){
		$("#config-modal").draggable({
	        handle: ".modal-header",   // 只能点击头部拖动
	        cursor: 'move',
	    	refreshPositions: false,
	    	scroll: false
	    });
		$(this).css("overflow", "hidden"); // 防止出现滚动条，出现的话，你会把滚动条一起拖着走的
	});
	if (warnFlag) {
		$(".closeBtn").remove();
		$(".sure").on("click", function() {
			$("#config-modal").remove();
		});
		$(".cCla").on("click", function() {
			$("#config-modal").remove();
		});
	}
};
// 带确定 取消的消息提示框（业务系统）
ip.warnJumpMsgSys = function(titleMsg, msg, sureId, cancelCla, warnFlag) {
	// 带确定 取消的消息提示框
	var configModal = $("#config-modal")[0];
	if (!configModal) {
		var innerHTML = "<div id='config-modal-sys' class='bs-modal-sm'><div class='modal-dialog modal-sm' style='width: 300px;'>";
		innerHTML += "<div class='modal-content'><div class='modal-header'>";
		innerHTML += "<button type='button' class='close closeBtn " + cancelCla + "'><span>&times;</span></button>";
		innerHTML += "<h4 id='title-msg-sys' class='modal-title'>" + titleMsg + "</h4></div><div class='modal-body'><textarea id='msg-notice-sys'>" + msg + "</textarea></div>";
		innerHTML += "<div class='modal-footer'><button id=" + sureId + " type='button' class='btn btn-primary sure-sys'>确定</button>";
		innerHTML += "<button  type='button' class='closeBtn-sys btn btn-default " + cancelCla + "'>取消</button></div></div></div></div>";
		$("body").append(innerHTML);
	} else {
		$("#config-modal-sys").show();
		$("#title-msg-sys").text(titleMsg);
		$("#msg-notice-sys").text(msg);
		$(".sure-sys").attr("id", sureId);
		$(".closeBtn-sys").addClass(cancelCla);
	}
	if (warnFlag) {
		$(".closeBtn-sys").remove();
		$("#msg-notice-sys").attr("disabled", true);
		$("#msg-notice-sys").css({
			"border": "none",
			"background-color": "white",
			"text-align": "center"
		});
		$("#msg-notice-sys").css("background-color", "white");
		$(".sure-sys").on("click", function() {
			$("#config-modal-sys").remove();
		});
		$(".cCla").on("click", function() {
			$("#config-modal-sys").remove();
		});
	} else {
		$("#msg-notice-sys").css({
			"border": "1px solid rgb(236, 236, 236)",
			"background-color": "rgb(235, 235, 228)"
				// "text-align":"center"
		})
	}
};

// 获取当前用户tokenid
ip.getTokenId = function() {
	var current_url = location.search;
	var params = (current_url || "").split('&');
	for(var i = 0; i < params.length; i++){
		if(params[i].toLowerCase().indexOf("tokenid=") > -1){
			return (params[i].split('=')[1]);
		}
	}
	return "";
}
	// 取url内参数
ip.getUrlParameter = function(key) {
		var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return unescape(r[2]);
		}
		return null;
	}
	// 信息提示弹窗组件 ipInfoJump
	// flag有三种值：
	// 1、success 成功
	// 2、error 错误
	// 3、info 提示信息
ip.ipInfoJump = function(msg, flag) {
	var flag_icon = "";
	if (flag == "success" || flag == "" || flag == undefined) {
		flag_icon = "ok-circle"; 
	}
	if (flag == "error") {
		flag_icon = "remove-circle";
	}
	if (flag == "info") {
		flag_icon = "info-sign";
	}
	if(flag != "info"){
		var bodyHtml = '<span><img src="/df/trd/ip/css/theme/images/' + flag_icon + '-Info.png" style="margin-right: 10px; margin-left:5px;"></span><span class="info-notice-message">'+msg+'</span>';
	}else{
		var bodyHtml = '<span><i class="glyphicon glyphicon-' + flag_icon + ' ip-pop-' + flag + '"></i><span class="info-notice-message">'+msg+'</span>';

	}
	var success_info = $("#info-notice")[0];
	var html = '<div id="info-notice" class="info-notice" style="display: block;">'+
					'<div class="info-notice-header">'+
						'<span class="info-notice-title">系統提示</span>'+
						'<button type="button" class="close ip-pop-close" data-dismiss="modal" aria-label="Close" onclick="ip.closeInfoJump()"><span aria-hidden="true">&times;</span></button>'+
					'</div>'+
					'<div class="info-notice-body">'+bodyHtml+
					'</div>'+
			'</div>';
	if (!success_info) {
		$("body").append(html);
	} else {
		$("#info-notice").remove();
		$("body").append(html);
	}
	/*if (flag == "success") {
		$(".info-notice").css({
			"background-color": "#e6f6ee",
			"border": "solid 1px #00A854"
		});
	}
	if (flag == "error") {
		$(".info-notice").css({
			"background-color": "#fdecea",
			"border": "solid 1px #F04134"
		});
	}
	if (flag == "info") {
		$(".info-notice").css({
			"background-color": "#fff7e6",
			"border": "solid 1px #FFBF00"
		});
	}*/
	var bodyWidth = document.body.clientWidth;
	var bodyHeight = document.body.clientHeight;
	var infoHeight = $("#info-notice").height();
	var infoWidth = $("#info-notice").width();
	$("#info-notice").css("left", bodyWidth / 2 - infoWidth / 2 + "px");
	$("#info-notice").css("top", bodyHeight / 2 - infoHeight / 2 + "px");
	$("#info-notice").css("display", "block");
	$("#info-notice").css("z-index", "9999");
	//$("#info-notice").fadeOut(5000);
	setTimeout("$('#info-notice').remove()",3000);
}
//处理千分位使用
ip.dealThousands = function(value) {
	if (value === 0) {
		return parseFloat(value).toFixed(2);
	}
	if (value != "") {
		var num = "";
		value += "";//转化成字符串
		value = parseFloat(value.replace(/,/g, '')).toFixed(2);
		if (value.indexOf(".") == -1) {
			num = value.replace(/\d{1,3}(?=(\d{3})+$)/g, function(s) {
				return s + ',';
			});
		} else {
			num = value.replace(/(\d)(?=(\d{3})+\.)/g, function(s) {
				return s + ',';
			});
		}
	} else {
		num = ""
	}
	return num;
}
//金额控件使用
ip.dealThousand = function(id, value, n) {
	$("#" + id).removeClass("text-left");
	$("#" + id).addClass("text-right");
	var num  = ip.dealThousandNum(value, n);
	$("#" + id).val(num);
	var big_show = $("#big-show-money");
	if(big_show){
		$("#big-show-money").remove();
	}
	return num;
}
ip.dealThousandNum = function(value,n){
	if (value != "") {
		var num = "";
		value += "";//转化成字符串
		value = parseFloat(value.toString().replace(/,/g, '')).toFixed(n);
		if (value.indexOf(".") == -1) {
			num = value.replace(/\d{1,3}(?=(\d{3})+$)/g, function(s) {
				return s + ',';
			});
		} else {
			num = value.replace(/(\d)(?=(\d{3})+\.)/g, function(s) {
				return s + ',';
			});
		}
	}
	return num;
}
ip.dealThousandFocus = function(id, value,maxId) {
//	$("#" + id).removeClass("text-right");
	$("#" + id).addClass("text-right");
	if (value != "") {
		$("#" + id).val(value.replace(/,/g, ''));
	} else {
		$("#" + id).val(value);
	}
	$("#" + id).select();
	$("#" + id).parent().append('<div class="col-sm-12 big-show" id="big-show-money"><a class="col-sm-12 text-right"></a></div>');
	if (value != "") {
		value = ip.dealThousandNum(value.replace(/,/g, ''),2);
		$("#big-show-money > a").html(value);
		$("#big-show-money > a").attr("title",value);
	}
	if(maxId){
		ip.compareMaxMoney(value,maxId);
	}
}
ip.dealTH = function(id, dataTable, field) {
	$("#" + id).on("blur", function() {
		var value = $("#" + id).val();
		var row = dataTable.getFocusRow();
		dataTable.setValue(field, value, row);
	});
}
//通过id获取数据信息
ip.getNodeInfo = function(id) {
	for (var i = 0; i < ip.more_head_all_data.length; i++) {
		if (ip.more_head_all_data[i].id === id) {
			return ip.more_head_all_data[i];
		}
	}
}
ip.changeData = function(data) {
		ip.more_grid_data = data;
		data = data.viewDetail;
		var zTreeNodes = [];
		// zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
		var setting = {
			check: {
				enable: true,
			},
			data: {
				simpleData: {
					enable: true,
					idKey: "ui_detail_id",
					pIdKey: "parent_id",
					rootPId: null
				}
			}
		};
		var ip_change_data_tree = $("#ip-change-data-tree")[0];
		if (!ip_change_data_tree) {
			 // style="display:none;"
			$("body").append('<div id="ip-change-data-tree" class="ztree" style="display:none;"></div>');
		}
		//获取ztree对象
		var zTreeNodes = $.fn.zTree.init($("#ip-change-data-tree"), setting, data);
		//展开所有节点
		zTreeNodes.expandAll(true);
		return ip.classifyNode(zTreeNodes);
	}
	//将数据分成 子节点与父节点
ip.classifyNode = function(tree) {
	ip.more_head_header = [];
	ip.more_head_parent_nodes = [];
	ip.more_head_all_data = tree.transformToArray(tree.getNodes());
	//将数据分为 底级表头（ip.more_head_header） 和 高级表头（ip.more_head_parent_nodes）的数据
	for (var i = 0; i < ip.more_head_all_data.length; i++) {
		if (ip.more_head_all_data[i].isParent) {
			ip.more_head_parent_nodes.push(ip.more_head_all_data[i]);
		} else {
			ip.more_head_header.push(ip.more_head_all_data[i]);
		}
	}
	return ip.matchChildFatherNode(ip.more_head_parent_nodes, ip.more_head_header);
}
ip.matchChildFatherNode = function(parent, child) {
	if (parent.length < 1) {
		var data = {
			"viewid": ip.more_grid_data.viewid,
			"mate": {
				"maxHeaderLevel": "1",
			},
			"header": ip.more_head_header,
			"moreHeader": []
		}
		return data;
	} else {
		var more_head_array = {};
		for (var i = 0; i < parent.length; i++) {
			for (var j = 0; j < child.length; j++) {
				for (var k = 0; k < child[j].getPath().length; k++) {
					if (child[j].getPath()[k].id == parent[i].id) {
						if (more_head_array[parent[i].id] == undefined) {
							more_head_array[parent[i].id] = [];
						}
						more_head_array[parent[i].id].push(child[j]);
					}
				}
			}
		}
		return ip.creatMoreHeadInfo(more_head_array);
	}
}
	//创建多表头数据
ip.creatMoreHeadInfo = function(more_head_array) {
		var max_head_level = [];
		var more_head_info = [];
		var node = "";
		for (node in more_head_array) {
			var first_node = more_head_array[node][0];
			var last_node = more_head_array[node][more_head_array[node].length - 1];
			var more_head = [];
			for (var i = 0; i < more_head_array[node].length; i++) {
				for (var j = 0; j < 5; j++) {
					if (more_head_array[node][i].getPath()[j] !== undefined) {
						if (more_head_array[node][i].getPath()[j].id === node) {
							more_head.push(more_head_array[node][i].getPath().length - j);
						}
					}
				}
			}

			//获取子节点中父节点层级最大的：即父级的level
			var max_more_header = Math.max.apply(null, more_head);
			var current_parent_node = ip.getNodeInfo(node);
			var more_head_node = {
				"field": current_parent_node.id,
				"name": current_parent_node.name,
				"id": current_parent_node.id,
				"parent_id": current_parent_node.pId,
				"headerLevel": max_more_header,
				"startField": first_node.id,
				"endField": last_node.id
			}
			more_head_info.push(more_head_node);
			max_head_level.push(max_more_header);
		}
		var max_level = Math.max.apply(null, max_head_level);
		var data = {
			"viewid": ip.more_grid_data.viewid,
			"mate": {
				"maxHeaderLevel": max_level,
			},
			"header": ip.more_head_header,
			"moreHeader": more_head_info
		}
		return data;
	}
	// 创建表格区域
	// viewId: 视图id
	// areaId: 创建表格的位置id(命名使用驼峰命名，例如：gridArea)
	// url:获取表格数据的url
	// options: 获取数据的参数
	// flag: 0 页面初始化不加载数据，1 页面初始化加载数据
	// operateFlag: 操作列显示与否 true or false
	// selectFlag: 多选框列显示与否 true or false
	// pageFlag: 分页显示与否 true or false
	// sumRowFlag: 合计行显示与否 true or false
ip.createGrid = function(viewId, areaId, url, options, flag, operateFlag, selectFlag, pageFlag, sumRowFlag) {
	var tokenid = ip.getTokenId();
	var view = {};
	$.ajax({
		url: "/df/view/getViewDetail.do?tokenid=" + tokenid,
		type: "GET",
		dataType: "json",
		async: false,
		data: {
			viewid: viewId
		},
		success: function(data) {
			view = ip.initGrid(data, areaId, url, options, flag, operateFlag, selectFlag, pageFlag, sumRowFlag);
			view.gridHeaderInfo = data;
		}
	});
	return view;
}
ip.grid_sum = {};
//带回调处理
ip.initGridWithCallBack = function(callBackFunc,data, areaId, url, options, flag, operateFlag, selectFlag, pageFlag, sumRowFlag,storageFlag){
	$("#ip-grid-footer-area-sum-budgetGridArea").html(""); //清空切换状态时候左下角表格金额选中显示的数据
		var viewModel = {
			gridData: new u.DataTable({
				meta: ''
			}),
			totals: [],
			curGridHead: [],
			sumArry: ko.observableArray()
		};
		viewModel.grid_header_disp_mode = {};
		viewModel.areaid = areaId;
		var viewId = data.viewid.substring(1, 37);
		viewModel.createGrid = function(data) {
			data = ip.changeData(data);
//			var viewId = data.viewid.substring(1, 37);
			var meta = '{';
			for (var j = 0; j < data.header.length; j++) {
				meta += '"' + data.header[j].id + '"';
				meta += ":{}";
				if (j < data.header.length - 1) {
					meta += ",";
				}
			}
			meta += "}";
			viewModel.gridData.meta = JSON.parse(meta);
			if (selectFlag == undefined) {
				selectFlag = true;
			}
			if (sumRowFlag == undefined) {
				sumRowFlag = true;
			}
			if (storageFlag == undefined) {
				storageFlag = true;
			}
			if (sumRowFlag) {
				innerHTML = "<div u-meta='" + '{"id":"' + viewId + '","data":"gridData","type":"grid","editType":"string","onRowSelected":"' + areaId + '_onRowSelectedFun","onRowUnSelected":"' + areaId + '_onRowUnSelectedFun","autoExpand":false,"needLocalStorage":' + storageFlag + ',"afterCreate": "' + areaId + '_afterCreate","multiSelect": ' + selectFlag + ',"onDblClickFun":"' + areaId + '_onDbClick","showNumCol": true,"showSumRow": true,"sumRowFirst":true,"sumRowFixed": true,"headerHeight":32,"rowHeight":32,"sumRowHeight":32,"cancelFocus":false,"onBeforeRowSelected":"' + areaId + '_onRowSelected","maxHeaderLevel":' + data.mate.maxHeaderLevel + ',"sortable":true}' + "'>";
			} else {
				innerHTML = "<div u-meta='" + '{"id":"' + viewId + '","data":"gridData","type":"grid","editType":"string","onRowSelected":"' + areaId + '_onRowSelectedFun","onRowUnSelected":"' + areaId + '_onRowUnSelectedFun","autoExpand":false,"needLocalStorage":' + storageFlag + ',"afterCreate": "' + areaId + '_afterCreate","multiSelect": ' + selectFlag + ',"onDblClickFun":"' + areaId + '_onDbClick","showNumCol": true,"headerHeight":32,"rowHeight":32,"cancelFocus":false,"onBeforeRowSelected":"' + areaId + '_onRowSelected","maxHeaderLevel":' + data.mate.maxHeaderLevel + ',"sortable":true}' + "'>";
			}
			if (operateFlag == undefined) {
				operateFlag = true;
			}
			// "onSortFun":"sortFun", 	去除全局排序 仅当前页排序
			// innerHTML = "<div u-meta='" + '{"id":"' + viewId + '","data":"gridData","type":"grid","editType":"string","onRowSelected":"onRowSelectedFun","onRowUnSelected":"onRowSelectedFun","autoExpand":false,"needLocalStorage":true,"multiSelect": ' + selectFlag + ',"showNumCol": true,"showSumRow": true,"sumRowFirst":true,"sumRowFixed": true,"headerHeight":32,"rowHeight":32,"sumRowHeight":32,"cancelFocus":false,"onBeforeRowSelected":"' + areaId + '_onRowSelected","sortable":true}' + "'>";
			if (operateFlag) {
				innerHTML += "<div options='" + '{"field":"operate","visible":true,"dataType":"String","editType":"string","title":"操作","fixed":true,"width": 150,"renderType":"' + areaId + '"}' + "'></div>";
			}
			for (var h = 0; h < data.moreHeader.length; h++) {
				innerHTML += "<div options='" + '{"field":"' + data.moreHeader[h].field + '","title":"' + data.moreHeader[h].name + '","headerLevel":"' + data.moreHeader[h].headerLevel + '","startField":"' + data.moreHeader[h].startField + '","endField":"' + data.moreHeader[h].endField + '"}' + "'></div>";
			}
			var item = [];
			for (var i = 0; i < data.header.length; i++) {
				if (data.header[i].width == "") {
					data.header[i].width = 200;
				}
				viewModel.curGridHead.push(data.header[i].id);
				// canVisible = ((data.header[i].visible == false) ? true : false);
				if (viewModel.grid_header_disp_mode == undefined) {
					viewModel.grid_header_disp_mode = {};
				}
				if (data.header[i].sumflag == "true") {
					viewModel.totals.push(data.header[i].id);
					viewModel[data.header[i].id] = "";
					viewModel.grid_header_disp_mode[data.header[i]["id"]] = data.header[i].disp_mode;
					if (data.header[i].disp_mode == "decimal") {
						var num_data = {
							"field": data.header[i].id,
							"name": data.header[i].name
						};

						item.push(num_data);
						viewModel.sumArry(item);
						innerHTML += "<div options='" + '{"field":"' + data.header[i].id + '","editType":"string","visible":' + data.header[i].visible + ',"canVisible":' + data.header[i].visible + ',"dataType":"Float","title":"' + data.header[i].name + '","headerLevel":"' + data.header[i].headerLevel + '","width": ' + data.header[i].width + ',"sumCol":true,"sumRenderType":"summ","renderType":"dealThousandsGrid"}' + "'></div>";
					} else {
						innerHTML += "<div options='" + '{"field":"' + data.header[i].id + '","editType":"string","visible":' + data.header[i].visible + ',"canVisible":' + data.header[i].visible + ',"dataType":"Float","title":"' + data.header[i].name + '","headerLevel":"' + data.header[i].headerLevel + '","width": ' + data.header[i].width + ',"sumCol":true,"sumRenderType":"summ","renderType":"' + areaId + '_render"}' + "'></div>";
					}
				} else {
					if (data.header[i].disp_mode == "decimal") {
						innerHTML += "<div options='" + '{"field":"' + data.header[i].id + '","editType":"string","visible":' + data.header[i].visible + ',"canVisible":' + data.header[i].visible + ',"dataType":"Float","title":"' + data.header[i].name + '","headerLevel":"' + data.header[i].headerLevel + '","width": ' + data.header[i].width + ',"renderType":"dealThousandsGrid"}' + "'></div>";
					} else {
						innerHTML += "<div options='" + '{"field":"' + data.header[i].id + '","editType":"string","visible":' + data.header[i].visible + ',"canVisible":' + data.header[i].visible + ',"dataType":"String","title":"' + data.header[i].name + '","headerLevel":"' + data.header[i].headerLevel + '","renderType":"' + areaId + '_render","width": ' + data.header[i].width + '}' + "'></div>";
					}
				}
			}
			innerHTML += "</div>";
			if (pageFlag == undefined) {
				pageFlag = true;
			}
			innerHTML += "<div id='ip-grid-footer-area-" + areaId + "' class='text-right' style='height: 36px;'><div id='ip-grid-footer-area-sum-" + areaId + "' class='fl' style='margin: 10px 0 5px 5px;'></div>";
			if (pageFlag) {
				innerHTML += "<div id='pagination' style='float: right;' class='u-pagination' u-meta='" + '{"type":"pagination","data":"gridData","pageList":[50,100,500,1000],"sizeChange":"sizeChangeFun","pageChange":"pageChangeFun"}' + "'></div>";
			}
			innerHTML += "</div>";
			$('#' + areaId).html(innerHTML);
		};
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
			ip.loading(true, areaId);
			var pageInfo = size + "," + pageIndex + "," + totalElements;
			options["pageInfo"] = pageInfo;
			options["sortType"] = JSON.stringify(viewModel.string);
			$.ajax({
				url: url,
				type: "GET",
				data: ip.getCommonOptions(options),
				success: function(data) {
					ip.loading(false, areaId);
					if (!data.flag) {
						ip.warnJumpMsg(data.result, 0, 0, true);
					} else {
						var totnum = data.totalElements;
						var pagenum = Math.ceil(totnum / size);
						viewModel.gridData.setSimpleData(data.dataDetail, {
							unSelect: true
						});
						if(pagenum === 0) {
							pagenum = 1;
						}
						viewModel.gridData.totalPages(pagenum);
						viewModel.gridData.totalRow(totnum);
						if( typeof callBackFunc == "function") {
							callBackFunc(data);
						}
					}
				}
			});
		};
		dealThousandsGrid = function(obj) {
			var num = "";
			var value = obj.value;
			if(value == null || value == ""){
				return;
			}else{
				value = parseFloat(value).toFixed(2);
				if (value.indexOf(".") == -1) {
					num = value.replace(/\d{1,3}(?=(\d{3})+$)/g, function(s) {
						return s + ',';
					});
				} else {
					num = value.replace(/(\d)(?=(\d{3})+\.)/g, function(s) {
						return s + ',';
					});
				}
				obj.element.innerHTML = '<p class="text-right">' + num + '</p>';
			}
		}
		onRowSelectedFun = function(obj) {
			var selected_nodes = viewModel.gridData.getSelectedRows();
			selected_nodes = [];
			var show_sum_num = selected_nodes.length;
			var sumArry = viewModel.sumArry();
			var show_sum = [];
			for (var sa = 0; sa < sumArry.length; sa++) {
				var sum_all = 0;
				var sum_name = sumArry[sa].name;
				var sum_field = sumArry[sa].field;
				for (var sn = 0; sn < selected_nodes.length; sn++) {
					sum_all += parseFloat(selected_nodes[sn].data[sumArry[sa].field].value);
				}
				var sum_obj = {
					"sumNum": ip.dealThousands(sum_all.toString()),
					"name": sum_name,
					"field": sum_field,
					"num": show_sum_num
				}
				show_sum.push(sum_obj);
			}

			if (show_sum.length > 0 && show_sum[0].num > 0) {
				$("#ip-grid-footer-area-sum-" + areaId).html("");
				var show_sum_arr = [];
				var show_sum_string = '<p>选中：<span>' + show_sum[0].num + '</span>&nbsp;条&nbsp;&nbsp;';
				if (show_sum.length > 1) {
					show_sum_arr.push(show_sum[0]);
					show_sum_arr.push(show_sum[1]);
				} else {
					show_sum_arr.push(show_sum[0]);
				}
				for (var i = 0; i < show_sum_arr.length; i++) {
					show_sum_string += show_sum_arr[i].name + '：<span class="' + show_sum_arr[i].field + '">' + show_sum_arr[i].sumNum + '</span>&nbsp;&nbsp;';
				}
				show_sum_string += '</p></div>';
				$("#ip-grid-footer-area-sum-" + areaId).html(show_sum_string);
			} else {
				$("#ip-grid-footer-area-sum-" + areaId).html("");
			}
		}
		summ = function(obj) {
			if (ip.grid_sum[viewId] == undefined) {
				ip.grid_sum[viewId] = {};
			}
			//获取每一列的合计
			ip.grid_sum[viewId][obj.gridCompColumn.options.field] = obj.value;
			obj.element.parentNode.style.height = 'auto';
			//总计逻辑：勿删
			// obj.element.parentNode.innerHTML = '<div class = "text-left" style="height:15px; line-height:15px;">总计：' + viewModel[obj.gridCompColumn.options.field] + '</div><div class = "text-left" style="height:15px; line-height:15px; text-align:right;">小计：' + obj.value + '</div>';
			//非金额列渲染不千分位
			if( viewModel.grid_header_disp_mode[obj.gridCompColumn.options.field] == 'decimal') {
				obj.value = ip.dealThousands(obj.value);
			}
			obj.element.parentNode.innerHTML = '<div id="summ" class="text-right" style="height:15px; line-height:15px;">' + obj.value + '</div>';
			$("#summ").parent().css("padding-right","5px");
		}
		viewModel.createGrid(data);
		ko.cleanNode($('#' + areaId)[0]);
		var app = u.createApp({
			el: '#' + areaId,
			model: viewModel
		});
		if (flag == "0") {
			viewModel.gridData.pageIndex("0");
			viewModel.gridData.pageSize("50");
			viewModel.gridData.totalPages("1");
			viewModel.gridData.totalRow("0");
		} else {
			options["sortType"] = JSON.stringify(viewModel.string);
			options["pageInfo"] = 50 + "," + 0 + ",";
			options["totals"] = viewModel.totals.join(",");
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				async: true,
				data: ip.getCommonOptions(options),
				beforeSend: ip.loading(true),
				success: function(data) {
						ip.loading(false);
						if (!data.flag) {
							ip.warnJumpMsg(data.result, 0, 0, true);
							viewModel.gridData.clear();
						} else {
							//总计逻辑：勿删
							// for (var j = 0; j < viewModel.totals.length; j++) {
							// 	viewModel[viewModel.totals[j]] = data.totals[viewModel.totals[j]];
							// }
							viewModel.gridData.pageIndex("0");
							viewModel.gridData.pageSize("50");
							viewModel.totnum = data.totalElements;
							var totnum = data.totalElements;
							var pagenum = Math.ceil(totnum / 50);
							viewModel.gridData.setSimpleData(data.dataDetail, {
								unSelect: true
							});
							if(pagenum === 0) {
								pagenum = 1;
							}
							viewModel.gridData.totalPages(pagenum);
							viewModel.gridData.totalRow(totnum);
							if( typeof callBackFunc == "function") {
								callBackFunc(data);
							}
						}
					}
			});
		}
		return viewModel;
}

ip.initGrid = function(data, areaId, url, options, flag, operateFlag, selectFlag, pageFlag, sumRowFlag,storageFlag) {
	$("#ip-grid-footer-area-sum-budgetGridArea").html(""); //清空切换状态时候左下角表格金额选中显示的数据
		var viewModel = {
			gridData: new u.DataTable({
				meta: ''
			}),
			totals: [],
			curGridHead: [],
			sumArry: ko.observableArray()
		};
		viewModel.areaid = areaId;
		var viewId = data.viewid.substring(1, 37);
		viewModel.createGrid = function(data) {
			data = ip.changeData(data);
			var meta = '{';
			for (var j = 0; j < data.header.length; j++) {
				meta += '"' + data.header[j].id + '"';
				meta += ":{}";
				if (j < data.header.length - 1) {
					meta += ",";
				}
			}
			meta += "}";
			viewModel.gridData.meta = JSON.parse(meta);
			if (selectFlag == undefined) {
				selectFlag = true;
			}
			if (sumRowFlag == undefined) {
				sumRowFlag = true;
			}
			if (storageFlag == undefined) {
				storageFlag = true;
			}
			if (sumRowFlag) {
				innerHTML = "<div u-meta='" + '{"id":"' + viewId + '","data":"gridData","type":"grid","editType":"string","onRowSelected":"' + areaId + '_onRowSelectedFun","onRowUnSelected":"' + areaId + '_onRowUnSelectedFun","autoExpand":false,"needLocalStorage":' + storageFlag + ',"afterCreate": "' + areaId + '_afterCreate","multiSelect": ' + selectFlag + ',"onDblClickFun":"' + areaId + '_onDbClick","showNumCol": true,"showSumRow": true,"sumRowFirst":true,"sumRowFixed": true,"headerHeight":32,"rowHeight":32,"sumRowHeight":32,"cancelFocus":false,"onBeforeRowSelected":"' + areaId + '_onRowSelected","maxHeaderLevel":' + data.mate.maxHeaderLevel + ',"sortable":true}' + "'>";
			} else {
				innerHTML = "<div u-meta='" + '{"id":"' + viewId + '","data":"gridData","type":"grid","editType":"string","onRowSelected":"' + areaId + '_onRowSelectedFun","onRowUnSelected":"' + areaId + '_onRowUnSelectedFun","autoExpand":false,"needLocalStorage":' + storageFlag + ',"afterCreate": "' + areaId + '_afterCreate","multiSelect": ' + selectFlag + ',"onDblClickFun":"' + areaId + '_onDbClick","showNumCol": true,"headerHeight":32,"rowHeight":32,"cancelFocus":false,"onBeforeRowSelected":"' + areaId + '_onRowSelected","maxHeaderLevel":' + data.mate.maxHeaderLevel + ',"sortable":true}' + "'>";
			}
			if (operateFlag == undefined) {
				operateFlag = true;
			}
			// "onSortFun":"sortFun", 	去除全局排序 仅当前页排序
			// innerHTML = "<div u-meta='" + '{"id":"' + viewId + '","data":"gridData","type":"grid","editType":"string","onRowSelected":"onRowSelectedFun","onRowUnSelected":"onRowSelectedFun","autoExpand":false,"needLocalStorage":true,"multiSelect": ' + selectFlag + ',"showNumCol": true,"showSumRow": true,"sumRowFirst":true,"sumRowFixed": true,"headerHeight":32,"rowHeight":32,"sumRowHeight":32,"cancelFocus":false,"onBeforeRowSelected":"' + areaId + '_onRowSelected","sortable":true}' + "'>";
			if (operateFlag) {
				innerHTML += "<div options='" + '{"field":"operate","visible":true,"dataType":"String","editType":"string","title":"操作","fixed":true,"width": 150,"renderType":"' + areaId + '"}' + "'></div>";
			}
			for (var h = 0; h < data.moreHeader.length; h++) {
				innerHTML += "<div options='" + '{"field":"' + data.moreHeader[h].field + '","title":"' + data.moreHeader[h].name + '","headerLevel":"' + data.moreHeader[h].headerLevel + '","startField":"' + data.moreHeader[h].startField + '","endField":"' + data.moreHeader[h].endField + '"}' + "'></div>";
			}
			var item = [];
			for (var i = 0; i < data.header.length; i++) {
				if (data.header[i].width == "") {
					data.header[i].width = 200;
				}
				viewModel.curGridHead.push(data.header[i].id);
				// canVisible = ((data.header[i].visible == false) ? true : false);
				if (viewModel.grid_header_disp_mode == undefined) {
					viewModel.grid_header_disp_mode = {};
				}
				if (data.header[i].sumflag == "true") {
					viewModel.totals.push(data.header[i].id);
					viewModel[data.header[i].id] = "";
					viewModel.grid_header_disp_mode[data.header[i]["id"]] = data.header[i].disp_mode;
					if (data.header[i].disp_mode == "decimal") {
						var num_data = {
							"field": data.header[i].id,
							"name": data.header[i].name
						};

						item.push(num_data);
						viewModel.sumArry(item);
						innerHTML += "<div options='" + '{"field":"' + data.header[i].id + '","editType":"string","visible":' + data.header[i].visible + ',"canVisible":' + data.header[i].visible + ',"dataType":"Float","title":"' + data.header[i].name + '","headerLevel":"' + data.header[i].headerLevel + '","width": ' + data.header[i].width + ',"sumCol":true,"sumRenderType":"summ","renderType":"dealThousandsGrid"}' + "'></div>";
					} else {
						innerHTML += "<div options='" + '{"field":"' + data.header[i].id + '","editType":"string","visible":' + data.header[i].visible + ',"canVisible":' + data.header[i].visible + ',"dataType":"Float","title":"' + data.header[i].name + '","headerLevel":"' + data.header[i].headerLevel + '","width": ' + data.header[i].width + ',"sumCol":true,"sumRenderType":"summ","renderType":"' + areaId + '_render"}' + "'></div>";
					}
				} else {
					if (data.header[i].disp_mode == "decimal") {
						innerHTML += "<div options='" + '{"field":"' + data.header[i].id + '","editType":"string","visible":' + data.header[i].visible + ',"canVisible":' + data.header[i].visible + ',"dataType":"Float","title":"' + data.header[i].name + '","headerLevel":"' + data.header[i].headerLevel + '","width": ' + data.header[i].width + ',"renderType":"dealThousandsGrid"}' + "'></div>";
					} else {
						innerHTML += "<div options='" + '{"field":"' + data.header[i].id + '","editType":"string","visible":' + data.header[i].visible + ',"canVisible":' + data.header[i].visible + ',"dataType":"String","title":"' + data.header[i].name + '","headerLevel":"' + data.header[i].headerLevel + '","renderType":"' + areaId + '_render","width": ' + data.header[i].width + '}' + "'></div>";
					}
				}
			}
			innerHTML += "</div>";
			if (pageFlag == undefined) {
				pageFlag = true;
			}
			innerHTML += "<div id='ip-grid-footer-area-" + areaId + "' class='text-right' style='height: 36px;'><div id='ip-grid-footer-area-sum-" + areaId + "' class='fl' style='margin: 10px 0 5px 5px;'></div>";
			if (pageFlag) {
				innerHTML += "<div id='pagination' style='float: right;' class='u-pagination' u-meta='" + '{"type":"pagination","data":"gridData","pageList":[50,100,500,1000],"sizeChange":"sizeChangeFun","pageChange":"pageChangeFun"}' + "'></div>";
			}
			innerHTML += "</div>";
			$('#' + areaId).append(innerHTML);
		};
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
			ip.loading(true, areaId);
			var pageInfo = size + "," + pageIndex + "," + totalElements;
			options["pageInfo"] = pageInfo;
			options["sortType"] = JSON.stringify(viewModel.string);
			$.ajax({
				url: url,
				type: "GET",
				data: ip.getCommonOptions(options),
				success: function(data) {
					ip.loading(false, areaId);
					if (!data.flag) {
						ip.warnJumpMsg(data.result, 0, 0, true);
					} else {
						var totnum = data.totalElements;
						var pagenum = Math.ceil(totnum / size);
						viewModel.gridData.setSimpleData(data.dataDetail, {
							unSelect: true
						});
						if(pagenum === 0) {
							pagenum = 1;
						}
						viewModel.gridData.totalPages(pagenum);
						viewModel.gridData.totalRow(totnum);
					}
				}
			});
		};
		dealThousandsGrid = function(obj) {
			var num = "";
			var value = obj.value;
			if(value == null || value == ""){
				return;
			}else{
				value = parseFloat(value).toFixed(2);
				if (value.indexOf(".") == -1) {
					num = value.replace(/\d{1,3}(?=(\d{3})+$)/g, function(s) {
						return s + ',';
					});
				} else {
					num = value.replace(/(\d)(?=(\d{3})+\.)/g, function(s) {
						return s + ',';
					});
				}
				obj.element.innerHTML = '<p class="text-right">' + num + '</p>';
			}
		}
		onRowSelectedFun = function(obj) {
			var selected_nodes = viewModel.gridData.getSelectedRows();
			selected_nodes = [];
			var show_sum_num = selected_nodes.length;
			var sumArry = viewModel.sumArry();
			var show_sum = [];
			for (var sa = 0; sa < sumArry.length; sa++) {
				var sum_all = 0;
				var sum_name = sumArry[sa].name;
				var sum_field = sumArry[sa].field;
				for (var sn = 0; sn < selected_nodes.length; sn++) {
					sum_all += parseFloat(selected_nodes[sn].data[sumArry[sa].field].value);
				}
				var sum_obj = {
					"sumNum": ip.dealThousands(sum_all.toString()),
					"name": sum_name,
					"field": sum_field,
					"num": show_sum_num
				}
				show_sum.push(sum_obj);
			}

			if (show_sum.length > 0 && show_sum[0].num > 0) {
				$("#ip-grid-footer-area-sum-" + areaId).html("");
				var show_sum_arr = [];
				var show_sum_string = '<p>选中：<span>' + show_sum[0].num + '</span>&nbsp;条&nbsp;&nbsp;';
				if (show_sum.length > 1) {
					show_sum_arr.push(show_sum[0]);
					show_sum_arr.push(show_sum[1]);
				} else {
					show_sum_arr.push(show_sum[0]);
				}
				for (var i = 0; i < show_sum_arr.length; i++) {
					show_sum_string += show_sum_arr[i].name + '：<span class="' + show_sum_arr[i].field + '">' + show_sum_arr[i].sumNum + '</span>&nbsp;&nbsp;';
				}
				show_sum_string += '</p></div>';
				$("#ip-grid-footer-area-sum-" + areaId).html(show_sum_string);
			} else {
				$("#ip-grid-footer-area-sum-" + areaId).html("");
			}
		}
		summ = function(obj) {
			if (ip.grid_sum[viewId] == undefined) {
				ip.grid_sum[viewId] = {};
			}
			//获取每一列的合计
			ip.grid_sum[viewId][obj.gridCompColumn.options.field] = obj.value;
			obj.element.parentNode.style.height = 'auto';
			//总计逻辑：勿删
			// obj.element.parentNode.innerHTML = '<div class = "text-left" style="height:15px; line-height:15px;">总计：' + viewModel[obj.gridCompColumn.options.field] + '</div><div class = "text-left" style="height:15px; line-height:15px; text-align:right;">小计：' + obj.value + '</div>';
			//非金额列渲染不千分位
			if( viewModel.grid_header_disp_mode[obj.gridCompColumn.options.field] == 'decimal') {
				obj.value = ip.dealThousands(obj.value);
			}
			obj.element.parentNode.innerHTML = '<div id="summ" class="text-right" style="height:15px; line-height:15px;">' + obj.value + '</div>';
			$("#summ").parent().css("padding-right","5px");
		}

		//全局排序
		// 	sortFun = function(field, sort) {
		// 		viewModel.string = {};
		// 		if (sort != undefined) {
		// 			viewModel.string = {
		// 				"name": field,
		// 				"type": sort
		// 			};
		// 		}
		// 		ip.loading(true,areaId);
		// 		options["sortType"] = JSON.stringify(viewModel.string);
		// 		options["pageInfo"] = viewModel.pageSizeNum + "," + 0 + ",";
		// 		options["totals"] = viewModel.totals.join(",");
		// 		$.ajax({
		// 			url: url,
		// 			type: "GET",
		// 			dataType: "json",
		// 			async: false,
		// 			data: ip.getCommonOptions(options),
		// 			beforeSend: ip.loading(true),
		// 			success: function(data) {
		// 				 ip.loading(false);
		// 				//总计逻辑：勿删
		// 				// for (var j = 0; j < viewModel.totals.length; j++) {
		// 				// 	viewModel[viewModel.totals[j]] = data.totals[viewModel.totals[j]];
		// 				// }
		// 				viewModel.gridData.pageIndex("0");
		// 				viewModel.gridData.pageSize(viewModel.pageSizeNum);
		// 				var totnum = data.totalElements;
		// 				var pagenum = Math.ceil(totnum / viewModel.pageSizeNum);
		// 				viewModel.gridData.setSimpleData(data.dataDetail,{unSelect:true});
		// 				$(".u-gird-centent-sum-div").html("");
		// 				$(".u-grid-noScroll-left").text("小计");
		// 				$(".u-grid-noScroll-left").css({
		// 					"padding-left":"5px",
		// 					"height":"32px",
		// 					"line-height":"32px"
		// 				});
		// //				if(totnum==0){
		// //					$(".u-grid-content-left-sum-first").css("border-top-width","0px");
		// //					$(".u-grid-noRowsShowDiv").text("");
		// //				}else{
		// //					$(".u-grid-content-left-sum-first").css("border-top-width","1px");
		// //				}
		// 				// viewModel.gridData.setRowUnSelect(0);
		// 				viewModel.gridData.totalPages(pagenum);
		// 				viewModel.gridData.totalRow(totnum);
		// 			}
		// 			//complete: ip.loading(false)
		// 		});
		// 	}
		viewModel.createGrid(data);
		ko.cleanNode($('#' + areaId)[0]);
		var app = u.createApp({
			el: '#' + areaId,
			model: viewModel
		});
		if (flag == "0") {
			viewModel.gridData.pageIndex("0");
			viewModel.gridData.pageSize("50");
			viewModel.gridData.totalPages("1");
			viewModel.gridData.totalRow("0");
		} else {
			options["sortType"] = JSON.stringify(viewModel.string);
			options["pageInfo"] = 50 + "," + 0 + ",";
			options["totals"] = viewModel.totals.join(",");
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				async: true,
				data: ip.getCommonOptions(options),
				beforeSend: ip.loading(true),
				success: function(data) {
						ip.loading(false);
						if (!data.flag) {
							ip.warnJumpMsg(data.result, 0, 0, true);
							viewModel.gridData.clear();
						} else {
							//总计逻辑：勿删
							// for (var j = 0; j < viewModel.totals.length; j++) {
							// 	viewModel[viewModel.totals[j]] = data.totals[viewModel.totals[j]];
							// }
							viewModel.gridData.pageIndex("0");
							viewModel.gridData.pageSize("50");
							viewModel.totnum = data.totalElements;
							var totnum = data.totalElements;
							var pagenum = Math.ceil(totnum / 50);
							viewModel.gridData.setSimpleData(data.dataDetail, {
								unSelect: true
							});
							if(pagenum === 0) {
								pagenum = 1;
							}
							viewModel.gridData.totalPages(pagenum);
							viewModel.gridData.totalRow(totnum);
						}
					}
			});
		}
		return viewModel;
	}
ip.getGridHeadShow = function(gridData){
	var grid_head_show = [];
	for (var i = 0; i < gridData.viewDetail.length; i++) {
		if($('#' + gridData.viewid.substring(1, 37) + '_header_table').find('th').eq(i).css('display') != 'none') {
			grid_head_show.push(gridData.viewDetail[i]);
		}
	}
	return grid_head_show;
}
ip.processInfo = function (msg,flag,fun) {
	var msg_info = "系统处理中，请稍候........";
	var processModal = $("#ip-process-info")[0];
	if (!processModal) {
		var html = '<div class="modal fade in" id="ip-process-info" style="z-index: 6666; padding-left: 10px;" data-backdrop="static" aria-hidden="false">'+
						'<div class="modal-dialog planModal-dialog">'+
							'<div class="modal-content" style="width: 400px;margin: 0 auto;margin-top: 250px;">'+
								'<div class="modal-body modal-body-input pr" style="height:auto;text-align:center;">'+
									'<div id="process-info" style="font-size: 16px; margin-top:15px">' + msg_info + '</div>'+
									'<div class="u-widget-body height-100" style="padding:40px 25px 20px 25px">'+
						                '<div class="u-loading-line u-loading-line-success">'+
					                        '<div></div>'+
					                        '<div></div>'+
					                        '<div></div>'+
					                        '<div></div>'+
					                        '<div></div>'+
					                    '</div>'+
					                '</div>'+
								'</div>'+
							'</div>'+
						'</div>'+
					'</div>';
		$("body").append(html);
	} else {
		$("#ip-process-info-text").text(msg_info);
	}
	if (flag) {
		$("#ip-process-info").modal({
			backdrop: 'static',
			keyboard: false
		});
		$("#ip-process-info").css('display','block');
		$("#ip-process-info").off('shown.bs.modal').on('shown.bs.modal',function(e){
			if (typeof fun == 'function') {
				fun();
			}
		})
	} else {
		$("#ip-process-info").modal('hide');
		$("#ip-process-info").css('display','none');
	}
}
ip.loading = function(flag) {
		var configModal = $("#info-loading")[0];
		if (!configModal) {
			var innerHTML = '<div id="info-loading" class="info-loading"><img src="/df/trd/ip/image/loading.gif"></div>';
			$("body").append(innerHTML);
		}
		if (flag) {
			$("#info-loading").css("display", "block");
			$("#info-loading").css("z-index", "5555"); //解决有弹窗后被遮挡问题
		} else {
			$("#info-loading").css("display", "none");
		}
	}
//带回调处理
// viewModel: createGrid返回的值
// url：获取grid数据的url地址
// options：获取grid数据的参数
ip.setGridWithCallBack = function(callBackFunc,viewModel, url, options){
	// ip.loading(true,viewModel.areaId);
	$("#ip-grid-footer-area-sum-budgetGridArea").html(""); //清空切换状态时候左下角表格金额选中显示的数据
	options["pageInfo"] = 50 + "," + 0 + ",";
	options["sortType"] = "";
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		async: true,
		data: ip.getCommonOptions(options),
		beforeSend: ip.loading(true),
		success: function(data) {
				ip.loading(false);
				//是否有违规
				if (data.listError != undefined && data.listError != null && data.listError != "") {
					var detail_table_name = data.detail_table_name;
					var wf_id = data.wf_id;
					var current_node_id = data.current_node_id;
					var inspectViewModel = ip.initInspectView(detail_table_name, wf_id, current_node_id, data.listError, options);
					return inspectViewModel;
				}
				if (!data.flag) {
					ip.warnJumpMsg(data.result, 0, 0, true);
				} else {
					if (data.result != "") {
						ip.ipInfoJump(data.result, "success");
					}
					//总计逻辑：勿删
					// for (var j = 0; j < viewModel.totals.length; j++) {
					// 	viewModel[viewModel.totals[j]] = data.totals[viewModel.totals[j]];
					// }
					viewModel.gridData.pageIndex("0");
					viewModel.gridData.pageSize("50");
					var totnum = data.totalElements;
					var pagenum = Math.ceil(totnum / 50);
					viewModel.gridData.setSimpleData(data.dataDetail, {
						unSelect: true
					});
					if(pagenum === 0) {
						pagenum = 1;
					}
					viewModel.gridData.totalPages(pagenum);
					viewModel.gridData.totalRow(totnum);
				}
				if( typeof callBackFunc == "function") {
					callBackFunc(data);
				}
			}
			//complete: ip.loading(false)
	});
}
ip.setGrid = function(viewModel, url, options) {
		// ip.loading(true,viewModel.areaId);
		$("#ip-grid-footer-area-sum-budgetGridArea").html(""); //清空切换状态时候左下角表格金额选中显示的数据
		options["pageInfo"] = 50 + "," + 0 + ",";
		options["sortType"] = "";
		$.ajax({
			url: url,
			type: "GET",
			dataType: "json",
			async: false,
			data: ip.getCommonOptions(options),
			beforeSend: ip.loading(true),
			success: function(data) {
					ip.loading(false);
					//是否有违规
					if (data.listError != undefined && data.listError != null && data.listError != "") {
						var detail_table_name = data.detail_table_name;
						var wf_id = data.wf_id;
						var current_node_id = data.current_node_id;
						var inspectViewModel = ip.initInspectView(detail_table_name, wf_id, current_node_id, data.listError, options);
						return inspectViewModel;
					}
					if (!data.flag) {
						ip.warnJumpMsg(data.result, 0, 0, true);
					} else {
						if (data.result != "") {
							ip.ipInfoJump(data.result, "success");
						}
						//总计逻辑：勿删
						// for (var j = 0; j < viewModel.totals.length; j++) {
						// 	viewModel[viewModel.totals[j]] = data.totals[viewModel.totals[j]];
						// }
						viewModel.gridData.pageIndex("0");
						viewModel.gridData.pageSize("50");
						var totnum = data.totalElements;
						var pagenum = Math.ceil(totnum / 50);
						viewModel.gridData.setSimpleData(data.dataDetail, {
							unSelect: true
						});
						if(pagenum === 0) {
							pagenum = 1;
						}
						viewModel.gridData.totalPages(pagenum);
						viewModel.gridData.totalRow(totnum);
					}
				}
				//complete: ip.loading(false)
		});
	}
	// 设置动态生成的搜索、编辑区域的值
	// function setAreaData(area_data,set_data) {
	// for (var i = 0; i < area_data.length; i++) {
	// switch (area_data[i].type) {
	// case "input":
	// $("#" + area_data[i].id).val(set_data[area_data[i].id]);
	// break;
	// case "number":
	// $("#" + area_data[i].id).val(set_data[area_data[i].id]);
	// break;
	// case "radio":
	// $("input:radio[value='" + set_data[area_data[i].id] +
	// "']").attr('checked','true');
	// break;
	// case "select":
	// $("#" + area_data[i].id).val(set_data[area_data[i].id]);
	// break;
	// case "checkbox":
	// if(set_data[area_data[i].id].length > 0){
	// for(var m = 0; m < set_data[area_data[i].id].length; m++){
	// $("input[value='" + set_data[area_data[i].id][m] + "']").prop("checked",
	// 'true');
	// }
	// }
	// break;
	// case "date":
	// $("#" + area_data[i].id).val(set_data[area_data[i].id]);
	// break;
	// case "tree":
	// $("#" + area_data[i].id).val(set_data[area_data[i].id].name);
	// $("#" + area_data[i].id).attr("name",set_data[area_data[i].id].id);
	// break;
	// }
	// }
	// }
	// 获取动态生成的搜索、编辑、新增区域的值
ip.getAreaData = function(data) {
	var area_data = {};
	var condition = "";
	var sym = "";
	for (var i = 0; i < data.length; i++) {
		switch (data[i].type) {
			case "text":
				var value = $("#" + data[i].id).val();
				if (value != "") {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = value;
					sym = ip.numToString(data[i].opetype);
					if ("like" == sym || "not like" == sym) {
						condition = condition + " and " + id + " " + sym + " '%" + value + "%'";
					} else {
						condition = condition + " and " + id + " " + sym + " '" + value + "'";
					}
				}
				break;
			case "int":
				var value = $("#" + data[i].id).val();
				if (value != "") {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = value;
					sym = ip.numToString(data[i].opetype);
					condition = condition + " and " + id + " " + sym + " " + value;
				}
				break;
			case "radio":
				var value = $("input[name='" + data[i].id + "']:checked").val();
				if (value != "") {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = value;
					sym = ip.numToString(data[i].opetype);
					if ("like" == sym || "not like" == sym) {
						condition = condition + " and " + id + " " + sym + " '" + value + "%'";
					} else {
						condition = condition + " and " + id + " " + sym + " '" + value + "'";
					}
				}
				break;
			case "combobox":
				var value = $("#" + data[i].id).val();
				if (value != "") {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = value;
					sym = ip.numToString(data[i].opetype);
					if ("like" == sym || "not like" == sym) {
						condition = condition + " and " + id + " " + sym + " '" + value + "%'";
					} else {
						condition = condition + " and " + id + " " + sym + " '" + value + "'";
					}
				}
				break;
			case "checkbox":
				var check_value = [];
				var check_values = $("input[name='" + data[i].id + "']:checked");
				if (check_values.length > 0) {
					for (var ii = 0; ii < check_values.length; ii++) {
						check_value.push(check_values[ii].value);
					}
				}
				if (check_value.length > 0) {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = check_value.join(",");
					sym = ip.numToString(data[i].opetype);
					var idst = "(";
					for (var qq = 0; qq < check_value.length; qq++) {
						idst = idst + "'" + check_value[qq] + "',";
					}
					idst = idst.substring(0, idst.length - 1) + ")";
					condition = condition + " and " + id + " in " + idst;
				}
				break;
			case "datetime":
				var value = $("#" + data[i].id).val();
				if (value != "") {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = value;
					sym = ip.numToString(data[i].opetype);
					if ("like" == sym || "not like" == sym) {
						condition = condition + " and " + id + " " + sym + " '%" + value + "%'";
					} else {
						condition = condition + " and " + id + " " + sym + " '" + value + "'";
					}
				}
				break;
			case "decimal":
				var value = $("#" + data[i].id).val();
				if (value != "") {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = value;
					sym = ip.numToString(data[i].opetype);
					condition = condition + " and " + id + " " + sym + " " + value;

				}
				break;
			case "treeassist":
				var value = $("#" + data[i].id + "-h").val();
				if (value != "") {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = value;
					sym = ip.numToString(data[i].opetype);
					// id=id.substring(0,id.length-2)+"code";
					if ("like" == sym || "not like" == sym) {
						if(id.indexOf("_id")>=0){
							condition = condition + " and " + id + " " + sym + " '" + value.split("@")[0] + "%'";
						}else{
							condition = condition + " and " + id + " " + sym + " '" + value.split("@")[2] + "%'";
						}
					} else {
						if(id.indexOf("_id")>=0){
							condition = condition + " and " + id + " " + sym + " '" + value.split("@")[0] + "'";
						}else{
							condition = condition + " and " + id + " " + sym + " '" + value.split("@")[2] + "'";
						}
					}

				}
				break;
			case "multreeassist":
				var value = $("#" + data[i].id + "-h").val();
				if (value != "") {
					id = data[i].id.substring(0, data[i].id.indexOf("-"));
					area_data[id] = value;
					// id=id.substring(0,id.length-2)+"code";
					sym = ip.numToString(data[i].opetype);
					var valueArr = value.split(",");
					var ids = "(";
					for (var q = 0; q < valueArr.length; q++) {
						ids = ids + "'" + valueArr[q].split("@")[2] + "',";
					}
					ids = ids.substring(0, ids.length - 1) + ")";
					condition = condition + " and " + id + " in " + ids;
				}
				break;
			case "doubledecimal":
				var money_values = [];
				for (var j = 1; j < 3; j++) {
					var money_value = $("#" + data[i].id + j).val();
					if (money_value != "") {
						money_values.push(money_value);
					}
				}
				if (money_values.length > 0) {
					var money_object = money_values.join(",");
					if (money_object != "") {
						id = data[i].id.substring(0, data[i].id.indexOf("-"));
						area_data[id] = money_object;
						sym = ip.numToString(data[i].opetype);
						if ("between" == sym) {
							condition = condition + " and " + id + " > " + money_object.split(",")[0];
							if(money_object.split(",")[1] != null && money_object.split(",")[1] != undefined){
								condition =  condition + " and " + id + " < " + money_object.split(",")[1];
							}
						};
						if ("betweenequal" == sym) {
							condition = condition + " and " + id + " >= " + money_object.split(",")[0];
							if(money_object.split(",")[1] != null && money_object.split(",")[1] != undefined){
								condition =  condition + " and " + id + " <= " + money_object.split(",")[1];
							}
						}
					}
				}
				break;
			case "doubletime":
				var date_values = [];
				for (var k = 1; k < 3; k++) {
					var date_value = $("#" + data[i].id + k).val();
					if (date_value != "") {
						date_values.push(date_value);
					}
				}
				if (date_values.length > 0) {
					var date_object = date_values.join(",");
					if (date_object != "") {
						id = data[i].id.substring(0, data[i].id.indexOf("-"));
						area_data[id] = date_object;
						sym = ip.numToString(data[i].opetype);
						if ("between" == sym) {
							condition = condition + " and " + id + " between '" + date_object.split(",")[0] +"'";
							if(date_object.split(",")[1] != null && date_object.split(",")[1] != undefined){
								condition = condition + " and '" + date_object.split(",")[1] + "'";
							}else{
								condition = condition + " and '9999-12-12'";
							}
							
						};
						if ("betweenequal" == sym) {
							condition = condition + " and " + id + " >= '" + date_object.split(",")[0] + "'";
							if(date_object.split(",")[1] != null && date_object.split(",")[1] != undefined){
								condition = condition  +" and " + id + " <= '" + date_object.split(",")[1] + "'";
							}
						}
					}
				}
				break;
		}
	}

	return condition;
}

ip.numToString = function(num) {
		var sym = "";
		switch (num) {
			case "0":
				sym = " = ";
				break;
			case "1":
				sym = " != ";
				break;
			case "2":
				sym = " > ";
				break;
			case "3":
				sym = " >= ";
				break;
			case "4":
				sym = " < ";
				break;
			case "5":
				sym = " <= ";
				break;
			case "6":
				sym = "like";
				break;
			case "7":
				sym = "not like";
				break;
			case "8":
				sym = "between";
				break;
			case "9":
				sym = "betweenequal";
				break;
			case "10":
				sym = " is null ";
				break;
			case "11":
				sym = " is not null ";
				break;
			case "12":
				sym = " in ";
				break;
			case "13":
				sym = " not in ";
				break;
		}
		return sym;
	}
	// 搜索、编辑区域动态生成 ip.createArea（）
	// areaType or edit search
	// creatData： 创建区域的json数据
	// viewId：视图ID
	// areaId：创建区域的ID
ip.createArea = function(areaType, viewId, areaId) {
	var tokenid = ip.getTokenId();
	var aims = [];
	$.ajax({
		url: "/df/view/getViewDetail.do?tokenid=" + tokenid,
		type: "GET",
		dataType: "json",
		async: false,
		data: {
			viewid: viewId
		},
		success: function(data) {
			viewId = viewId.substring(1, 37);
			aims = ip.initArea(data.viewDetail, areaType, viewId, areaId);
		}
	});
	return aims;
}
ip.initArea = function(creatData, areaType, viewId, areaId) {
	var n = areaType == "edit" ? 6 : 4;
	var html = '';
	var aims = [];
	for (var i = 0; i < creatData.length; i++) {
		// if(areaType == "search"){
		creatData[i].editable = "true";
		// }
		switch (creatData[i].disp_mode) {
			case "text":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="' + creatData[i].id + '" class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="col-md-9 ip-input-group modal-input-group">';
					if (creatData[i].editable == "true") {
						html += '<input type="text" class="form-control" id="' + creatData[i].id + '-' + viewId + '">' +
								'<span class="input-control-feedback" style="right: 5px;" onclick="ip.clearText(\'' + creatData[i].id + '-' + viewId + '\')">X</span>';
					} else {
						html += '<input type="text" class="form-control" id="' + creatData[i].id + '-' + viewId + '" disabled>';
					}
					html += '</div></div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "text",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "int":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="" class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="col-md-9 col-sm-9 ip-input-group modal-input-group">';
					if (creatData[i].editable == "true") {
						html += '<input type="number" class="form-control" id="' + creatData[i].id + '-' + viewId + '">' +
								'<span class="input-control-feedback" style="right: 5px;" onclick="ip.clearText(\'' + creatData[i].id + '-' + viewId + '\')">X</span>';
					} else {
						html += '<input type="number" class="form-control" id="' + creatData[i].id + '-' + viewId + '" disabled>';
					}
					html += '</div></div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "int",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "radio":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="" class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="col-md-9 col-sm-9 ip-input-group">';
					var m = creatData[i].ref_model.split("+");
					for (var t = 0; t < m.length; t++) {
						var k = m[t].split("#");
						if (creatData[i].editable == "true") {
							if (k.length > 1) {
								html += '<input type="radio" name="' + creatData[i].id + '-' + viewId + '" value="' + k[0] + '">' + k[1] + '</label>';
							} else {
								html += '<input type="radio" name="' + creatData[i].id + '-' + viewId + '" value="">' + k[0] + '</label>';
							}
						} else {
							if (k.length > 1) {
								html += '<input type="radio" name="' + creatData[i].id + '-' + viewId + '" value="' + k[0] + '" disabled>' + k[1] + '</label>';
							} else {
								html += '<input type="radio" name="' + creatData[i].id + '-' + viewId + '" value="" disabled>' + k[0] + '</label>';
							}
						}
					}
					html += '</div></div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "radio",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "combobox":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="" class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="col-md-9 col-sm-9 ip-input-group">';
					if (creatData[i].editable == "true") {
						html += '<select class="form-control" id="' + creatData[i].id + '-' + viewId + '">';
					} else {
						html += '<select class="form-control" id="' + creatData[i].id + '-' + viewId + '" disabled>';
					}
					var m = creatData[i].ref_model.split("+");
					for (var t = 0; t < m.length; t++) {
						var k = m[t].split("#");
						if (k.length > 1) {
							html += '<option value="' + k[0] + '">' + k[1] + '</option>';
						} else {
							html += '<option value="">' + k[0] + '</option>';
						}
					}
					html += '</select></div></div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "combobox",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "checkbox":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="" class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="col-md-9 col-sm-9 ip-input-group">';

					var m = creatData[i].ref_model.split("+");
					for (var nn = 0; nn < m.length; nn++) {
						var kk = m[nn].split("#");
						if (creatData[i].editable == "true") {
							if (kk.length > 1) {
								html += '<input type="checkbox" name="' + creatData[i].id + '-' + viewId + '" value="' + kk[0] + '">' + kk[1] + '</label>';
							} else {
								html += '<input type="checkbox" name="' + creatData[i].id + '-' + viewId + '" value="">' + kk[0] + '</label>';
							}
						} else {
							if (kk.length > 1) {
								html += '<input type="checkbox" name="' + creatData[i].id + '-' + viewId + '" value="' + kk[0] + '" disabled>' + kk[1] + '</label>';
							} else {
								html += '<input type="checkbox" name="' + creatData[i].id + '-' + viewId + '" value="" disabled>' + kk[0] + '</label>';
							}
						}
					}
					html += '</div></div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "checkbox",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "decimal":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="" class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="col-md-9 col-sm-9 ip-input-group modal-input-group">';
					if (creatData[i].editable == "true") {
						html += '<input type="number" min="0" class="form-control" id="' + creatData[i].id + '-' + viewId + '" onblur="ip.moneyQuset(this.id)">' + 
								'<span class="input-control-feedback" onclick="ip.clearText(\'' + creatData[i].id + '-' + viewId + '1' +'\')">X</span>';
					} else {
						html += '<input type="number" class="form-control" id="' + creatData[i].id + '-' + viewId + '" onblur="ip.moneyQuset(this.id)" disabled>';
					}
					html += '</div></div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "decimal",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "doubledecimal":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="" class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="col-md-4 col-sm-4 ip-input-group modal-input-group">';
					if (creatData[i].editable == "true") {
						html += '<input type="number" min="0" class="form-control" id="' + creatData[i].id + '-' + viewId + '1" onblur="ip.moneyQuset(this.id)">' +
								'<span class="input-control-feedback" onclick="ip.clearText(\'' + creatData[i].id + '-' + viewId + '1' +'\')">X</span>';
					} else {
						html += '<input type="number" class="form-control" id="' + creatData[i].id + '-' + viewId + '1" onblur="ip.moneyQuset(this.id)" disabled>';
					}
					html += '</div>' +
						'<div class="col-md-1 col-sm-1 ip-to-font">至</div>' +
						'<div class="col-md-4 col-sm-4 ip-input-group modal-input-group">';
					if (creatData[i].editable == "true") {
						html += '<input type="number" min="0" class="form-control" id="' + creatData[i].id + '-' + viewId + '2" onblur="ip.moneyQuset(this.id)">' +
								'<span class="input-control-feedback" onclick="ip.clearText(\'' + creatData[i].id + '-' + viewId + '1' +'\')">X</span>';
					} else {
						html += '<input type="number" class="form-control" id="' + creatData[i].id + '-' + viewId + '2" onblur="ip.moneyQuset(this.id)" disabled>';
					}
					html += '</div></div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "doubledecimal",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "datetime":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="dtp_input2" class="col-md-3 col-sm-3 control-label text-right">' + creatData[i].name + '</label>' +
						'<div class="input-group date form_date col-md-9 col-sm-9 ip-input-group" data-date="" data-date-format="yyyy-mm-dd" data-link-field="' + creatData[i].id + '" data-link-format="yyyy-mm-dd">';
					if (creatData[i].editable == "true") {
						html += '<input class="form-control" size="16" id="' + creatData[i].id + '-' + viewId + '" type="text" value="">' +
							'<span class="input-group-addon"><span class="glyphicon glyphicon-remove"></span></span>' +
							'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>';
					} else {
						html += '<input class="form-control" size="16" id="' + creatData[i].id + '-' + viewId + '" type="text" value="" disabled>' +
							'<span class="input-group-addon"><button class="glyphicon glyphicon-remove" disabled></button></span>' +
							'<span class="input-group-addon"><button class="glyphicon glyphicon-calendar" disabled></button></span>';
					}
					html += '</div>' +
						// '<input type="hidden" id="' + creatData[i].id +
						// '-' + viewId + '" value="" /><br/>' +
						'</div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "datetime",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "doubletime":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label for="dtp_input2" class="col-md-3 col-sm-3 control-label text-right">' + creatData[i].name + '</label>' +
						'<div class="input-group date form_date col-md-4 col-sm-4 ip-input-group fleft start-time" data-date="" data-date-format="yyyy-mm-dd" data-link-field="' + creatData[i].id + '1" data-link-format="yyyy-mm-dd">';
					if (creatData[i].editable == "true") {
						html += '<input class="form-control" size="16" id="' + creatData[i].id + '-' + viewId + '1" type="text" value="">' +
							'<span class="input-group-addon"><span class="glyphicon glyphicon-remove start-time-btn"></span></span>' +
							'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar start-time-btn"></span></span>';
					} else {
						html += '<input class="form-control" size="16" id="' + creatData[i].id + '-' + viewId + '1" type="text" value="" disabled>' +
							'<span class="input-group-addon"><button class="glyphicon glyphicon-remove" disabled></button></span>' +
							'<span class="input-group-addon"><button class="glyphicon glyphicon-calendar" disabled></button></span>';
					}
					// '<input class="form-control" size="16" id="' + creatData[i].id + '-' + viewId + '1" type="text" value="" readonly>' +
					// '<span class="input-group-addon"><span
					// class="glyphicon
					// glyphicon-remove"></span></span>' +
					// '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>' +
					html += '</div>' +
						'<div class="col-md-1 col-sm-1 ip-to-font">至</div>' +
						'<div class="input-group date form_date col-md-4 col-sm-4 ip-input-group fleft end-time" data-date="" data-date-format="yyyy-mm-dd" data-link-field="' + creatData[i].id + '2" data-link-format="yyyy-mm-dd">';
					if (creatData[i].editable == "true") {
						html += '<input class="form-control" size="16" id="' + creatData[i].id + '-' + viewId + '2" type="text" value="">' +
							'<span class="input-group-addon"><span class="glyphicon glyphicon-remove end-time-btn"></span></span>' +
							'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar end-time-btn"></span></span>';
					} else {
						html += '<input class="form-control" size="16" id="' + creatData[i].id + '-' + viewId + '2" type="text" value="" disabled>' +
							'<span class="input-group-addon"><button class="glyphicon glyphicon-remove" disabled></button></span>' +
							'<span class="input-group-addon"><button class="glyphicon glyphicon-calendar" disabled></button></span>';
					}
					// '<input class="form-control" size="16" id="' + creatData[i].id + '-' + viewId + '2" type="text" value="" readonly>' +
					// '<span class="input-group-addon"><span
					// class="glyphicon
					// glyphicon-remove"></span></span>' +
					// '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>' +
					html += '</div>' +
						// '<input type="hidden" id="' + creatData[i].id +
						// '-' + viewId + '" value="" /><br/>' +
						'</div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "doubletime",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "treeassist":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="input-group col-md-9 col-sm-9 modal-input-group">';
					if (creatData[i].editable == "true") {
						html += '<input type="text" class="form-control col-md-6 col-sm-6" id="' + creatData[i].id + '-' + viewId + '"  onkeydown="return ip.codeInto(this.id,this.name,0,{},0,this.title,true,event)">' +
							'<input type="hidden" id="' + creatData[i].id + '-' + viewId + '-h" name="' + creatData[i].source + '">' +
							'<span class="input-control-feedback" onclick="ip.clearText(\'' + creatData[i].id + '-' + viewId + '\')">X</span>' +
							'<span class="input-group-btn">' +
							'<button class="btn btn-default glyphicon glyphicon-list" style="color: #b3a9a9;font-size: 12px;height:28px;margin-top:-2px;" type="button" id="' + creatData[i].id + '-' + viewId + '-btn" name="' + creatData[i].source + '" data-toggle="modal"';
							if(false){
								html += ' onclick="ip.showAssitTree(this.id,this.name,0,{},0,this.title,0,0,true,'+"'name'"+')"></button>';
							} else {
								html += ' onclick="ip.showAssitTree(this.id,this.name,0,{},0,this.title)"></button>';
							}
					} else {
						html += '<input type="text" class="form-control col-md-6 col-sm-6" id="' + creatData[i].id + '-' + viewId + '"  onkeydown="return ip.codeInto(this.id,this.name)" disabled>' +
							'<input type="hidden" id="' + creatData[i].id + '-' + viewId + '-h" name="' + creatData[i].source + '" disabled>' +
							'<span class="input-group-btn">' +
							'<button class="btn btn-default glyphicon glyphicon-list" style="color: #b3a9a9;font-size: 12px;height:28px;margin-top:-2px;" type="button" id="' + creatData[i].id + '-' + viewId + '-btn" name="' + creatData[i].source + '" data-toggle="modal" disabled></button>';
					}
					html += '</span>' +
						'</div>' +
						'</div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "treeassist",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
			case "multreeassist":
				if (creatData[i].visible) {
					html += '<div class="col-md-' + n + ' col-sm-' + n + '">' +
						'<label class="col-md-3 col-sm-3 text-right">' + creatData[i].name + '</label>' +
						'<div class="input-group col-md-9 col-sm-9 modal-input-group">';
					if (creatData[i].editable == "true") {
						html += '<input type="text" class="form-control col-md-6 col-sm-6" id="' + creatData[i].id + '-' + viewId + '" disabled>' +
							'<input type="hidden" id="' + creatData[i].id + '-' + viewId + '-h" name="' + creatData[i].source + '">' +
							'<span class="input-control-feedback" onclick="ip.clearText(\'' + creatData[i].id + '-' + viewId + '\')">X</span>' +
							'<span class="input-group-btn">' +
							'<button class="btn btn-default glyphicon glyphicon-option-horizontal" style="color: #b3a9a9;font-size: 12px;height:28px;margin-top:-2px;"  type="button" id="' + creatData[i].id + '-' + viewId + '-btn" name="' + creatData[i].source + '" data-toggle="modal"';
							if(false){
								html += ' onclick="ip.showAssitTree(this.id,this.name,1,{},0,this.title,0,0,true,'+"'name'"+')"></button>';
							} else {
								html += ' onclick="ip.showAssitTree(this.id,this.name,1,{},0,this.title)"></button>';
							}	
					} else {
						html += '<input type="text" class="form-control col-md-6 col-sm-6" id="' + creatData[i].id + '-' + viewId + '" disabled>' +
							'<input type="hidden" id="' + creatData[i].id + '-' + viewId + '-h" name="' + creatData[i].source + '">' +
							'<span class="input-group-btn">' +
							'<button class="btn btn-default glyphicon glyphicon-option-horizontal" style="padding-top: 8px;color: #b3a9a9;font-size: 12px;height:28px;margin-top:-2px;"  type="button" id="' + creatData[i].id + '-' + viewId + '-btn" name="' + creatData[i].source + '" data-toggle="modal" disabled></button>';
					}
					html += '</span>' +
						'</div>' +
						'</div>';
					var current_aim = {
						"id": creatData[i].id + '-' + viewId,
						"type": "multreeassist",
						"opetype": creatData[i].query_relation_sign
					};
					aims.push(current_aim);
				}
				break;
		}
	}
	$("#" + areaId).html(html);
	$("#" + areaId).find("label").css({
		"font-size": "12px",
		"font-weight": "normal"
	});
	$("#" + areaId).find("div").css({
		"padding": "0"
	});
	$.fn.datetimepicker.dates['zh-CN'] = {
		days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
		daysShort: ["日", "一", "二", "三", "四", "五", "六", "日"],
		daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
		months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
		monthsShort: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
		today: "今天",
		meridiem: ["上午", "下午"]
	};
	//日历控件
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
	//时间段开始日期
	$('.start-time').datetimepicker({
		language: 'zh-CN',
		weekStart: 1,
		todayBtn: 1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
	}).on("click",function(){
		if($(".end-time input").val() != ""){
			$('.start-time').datetimepicker("setEndDate",$(".end-time input").val());
		}else{
			$('.start-time').datetimepicker("setEndDate","3000-01-01");
			$('.start-time').datetimepicker("setStartDate","1949-01-01");
		}

	});
	//时间段结束日期
	$('.end-time').datetimepicker({
		language: 'zh-CN',
		weekStart: 1,
		todayBtn: 1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
	}).on("click",function(){
		if($(".start-time input").val() != ""){
			$('.end-time').datetimepicker("setStartDate",$(".start-time input").val());
		}else{
			$('.end-time').datetimepicker("setEndDate","3000-01-01");
			$('.end-time').datetimepicker("setStartDate","1949-01-01");
		}

	});
	$(function () {
		$(".end-time-btn").unbind("click");
		$(".start-time-btn").unbind("click");
		$(".end-time-btn").on('click',function(){
			$('.end-time').trigger("click");
		});
		$(".start-time-btn").on('click',function(){
			$('.start-time').trigger("click");
		});
	});
	return aims;
}
ip.clearText = function(id) {
	$("#" + id).val("");
	$("#" + id + "-h").val("");
}
ip.getTreeNodeByCode = function (condition,element,ele_value) {
	var backData = "";
	var current_url = location.search;
	var tokenid = current_url.substring(current_url.indexOf("tokenid") + 8, current_url.indexOf("tokenid") + 48);
	var all_options = {
		"condition": condition,
		"element": element,
		"tokenid": tokenid,
		"ele_value": ele_value,
		"ajax": "noCache"
	};
	$.ajax({
		url: "/df/dic/dictree.do",
		type: "GET",
		async: false,
		data: ip.getCommonOptions(all_options),
		success: function(data) {
			backData = data;
			
		}
	});
	return backData;
}
ip.codeInto = function(id, element, flag, viewModel, areaId, ele_name,parentFlag,e,condition,showFlag,callBack,coa_id,relations) {
	var ele_values = $("#" + id).val();
	if (ele_values == "") {
		ip.clearText(id);
	}
	if (e.keyCode == "13") {
		var tokenid = ip.getUrlParameter("tokenid");
		
		if(coa_id != undefined && relations != undefined && coa_id != "" && relations != ""){
			var ele_value = $("#" + id+"-"+areaId).val();
			if (element == undefined || element == "" ) {
				element = id;
			}
		}else{
			var ele_value = $("#" + id).val();
			element = id.substr(0, id.indexOf("_"))
			if (element == undefined || element == "" ) {
				element = id.substr(0, id.indexOf("-"));
			}
		}
		var blank = ele_value.indexOf(" ");
		if (blank != -1) {
			ele_value = ele_value.substr(0, blank);
		}
		
		if (condition == undefined) {
			condition = "";
		}
		var all_options = {
				"condition": condition,
				"element": element,
				"tokenid": tokenid,
				"ele_value": ele_value,
				"ajax": "noCache"
			};
		if(coa_id != undefined && relations != undefined){ //wuchr 添加coa 关联关系过滤数据
			var relations = ip.getPriEleCodeRelation(element, relations, areaId);
			all_options["coa_id"] = coa_id;
			all_options["relations"] =  relations;
		}
		$.ajax({
			url: "/df/dic/dictree.do",
			type: "GET",
			async: false,
			data: ip.getCommonOptions(all_options),
			success: function(data) {
				if (data.eleDetail.length > 1) {
					if(!ip.isEmptyObject(viewModel)){
						id = id.substr(0, id.indexOf("-"));
						if ( id == undefined || id == "" ) {
							id = id.substr(0, id.indexOf("_"));
						}
					}
					ip.treeChoice(id, data.eleDetail, flag, viewModel, areaId, ele_name,parentFlag,callBack,showFlag);
				} else {
					if (data.eleDetail.length == 0) {
						ip.clearText(id);
						ip.ipInfoJump("无此数据，请重新填写。");
					} else {
						if(showFlag == undefined || showFlag == "") {
							showFlag = "codename";
						}
						var tree_string_old = data.eleDetail[0][showFlag];
						var tree_string = data.eleDetail[0].chr_id + "@" + encodeURI(data.eleDetail[0].chr_name, "utf-8") + "@" + data.eleDetail[0].chr_code;
						if(coa_id != undefined && relations != undefined && coa_id != "" && relations != ""){
							$("#" + id +"-" + areaId).val(tree_string_old);
							$("#" + id + "-"+areaId+"-h").val(tree_string);
						}else{
							$("#" + id).val(tree_string_old);
							$("#" + id + "-h").val(tree_string);
						}
					} 
				}
				if(typeof callBack == "function"){
					callBack(tree_string);
				}
			}
		});
	}
}
ip.dealCodeInto = function(selected_node_input_arr) {
	var input_treeId = $("button[name='btnFind']").attr("id").substring(4);
	var data_tree = $("#" + input_treeId)[0]['u-meta'].tree;
	if (selected_node_input_arr.length > 1) {
		for (var mm = 0; mm < selected_node_input_arr.length; mm++) {
			var search_nodes = data_tree.getNodesByParamFuzzy("name", selected_node_input_arr[mm], null);
			data_tree.checkNode(search_nodes[0], true, true);
			data_tree.selectNode(search_nodes[0]);
			data_tree.expandNode(search_nodes[0], true, true, true);
		}
	} else {
		var space_selected_input = selected_node_input_arr[0].indexOf(" ");
		if (space_selected_input != -1) {
			var search_nodes = data_tree.getNodesByParamFuzzy("name", selected_node_input_arr[0], null);
			if (search_nodes.length > 0) {
				data_tree.checkNode(search_nodes[0], true, true);
				data_tree.selectNode(search_nodes[0]);
				data_tree.expandNode(search_nodes[0], true, true, true);
			}
		}
	}
}
ip.moneyQuset = function(id) {
	$("#" + id).val(parseFloat($("#" + id).val()).toFixed(2));
}
ip.tree_viewModel = {};
ip.areaId = "";
ip.treeChoice = function(id, data, flag, viewModel, areaId, ele_name, parentFlag,callBack,showFlag,callBack2) {
	if(parentFlag == "" || parentFlag == "undefined"){
		ip.choice_parent_flag = false;
	}else{
		ip.choice_parent_flag = true;
	}
	if (showFlag) {
		ip.treeShowFlag = showFlag;
	} else {
		ip.treeShowFlag = "codename";
	}
	ip.treeCallBack = callBack;
	ip.treeCallBack2 = callBack2;
	ip.tree_viewModel = viewModel;
	ip.areaId = areaId;
	var success_info = $("#myModalTree")[0];
	var html = '';
	if (ele_name == 0) {
		ele_name = $("#" + id).parent().parent().find("label").text();
	}
	if (!success_info) {
		html += '<div class="modal fade" id="myModalTree" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' +
			'<div class="modal-dialog" role="document">' +
			'<div class="modal-content">' +
			'<div class="modal-header">' +
			'<button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="ip.closeAssitTree()"><span aria-hidden="true">&times;</span></button>' +
			'<h4 class="modal-title" id="myModalLabel">' + ele_name + '</h4>' +
			'</div>' +
			'<div class="modal-body">' +
			'<label for="" class="col-md-2 col-sm-2 text-left" style="padding: 0;margin-right: 5px; font-weight:normal">快速定位</label>' +
			'<input type="hidden" id="choiced-node">' +
			'<input type="hidden" id="aim">' +
			'<div class="col-md-4 col-sm-4 ip-input-group">' +
			'<input type="text" class="form-control" id="user-write" name="inp-radio-data-tree" onkeyup="ip.quickQuery(this.name)" onkeydown="if(event.keyCode == 13){ip.keyTreeNext(this.name)}">' +
			'</div>' +
			'<button id="btn-radio-data-tree" class="btn btn-primary top-button" type="button" name="btnFind" onClick="ip.search(this.id);" >查找</button>' +
			'<button id="nex-radio-data-tree" class="btn btn-default top-button-next" style="margin-left:10px;" type="button" name="btnNext" onClick="ip.next(this.id);">下一个</button>' +
			'<div class="tree-area">' +
			'</div>' +
			'</div>' +
			'<div class="modal-footer">' +
			'<div class="radio pull-left" id="isRelationPc"><label><input type="checkbox" name="optionsCheck" value="" checked onclick="ip.TreeIsIncliudChild();">包含下级</label></div>' +
			'<div id="modal-tree-footer-btn" class="fr">' +
			'<button id="sur-radio-data-tree" type="button" class="btn btn-primary" name="btnSure"  onclick="ip.sureSelectTree(this.id);">确定</button>' +
			'<button type="button" class="btn btn-default" data-dismiss="modal" onclick="ip.closeAssitTree()">取消</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>';
		$("body").append(html);
	}
	$("#myModalLabel").text(ele_name);
	// var add_node_flag = false;
	// if(add_node == undefined){
	// 	add_node_flag = false;
	// } else {
	// 	add_node_flag = add_node;
	// }
	// if(add_node){
	// 	$("#modal-tree-footer-btn").prepend('<button id="add-tree-node" type="button" class="btn btn-primary" onclick="ip.addTreeNode(this.id);">添加</button>');
	// }
	ip.treeChoiceChild(id, data, flag, viewModel, areaId, ele_name);
}
ip.treeChoiceChild = function(id, data, flag, viewModel, areaId, ele_name) {
	var tree_html = "";
	$(".tree-area").html("");
	if (flag == 0) {
		// 单选树
		$("#isRelationPc").hide();
		$("button[name='btnFind']").attr("id", "btn-radio-data-tree");
		$("button[name='btnNext']").attr("id", "nex-radio-data-tree");
		$("button[name='btnSure']").attr("id", "sur-radio-data-tree");
		tree_html = "<div class='text-right radio-data-tree'>" +
				"<span class='all-tree-content' id='ip-tree-all' title='all-radio-data-tree'>" +
				"<span class='glyphicon glyphicon-chevron-down' id='all-tree-tip'>" +
				"</span><img src='/df/trd/ip/changeTree/images/base.gif' style='float: none;'>全部</span>" +
				"<a style='cursor: pointer;font-size:12px;color:#1871c1;' id='ip-open-all' name='radio-data-tree'>全部展开</a>&nbsp;|&nbsp;" +
				"<a style='cursor: pointer;font-size:12px;color:#1871c1;' id='ip-close-all' name='radio-data-tree'>全部闭合</a></div>" +
				"<div class='ztree radio-tree assist-insert-tree' u-meta='" + '{"id":"radio-data-tree","type":"tree","data":"treeDataTable","idField":"chr_id","pidField":"parent_id","nameField":"' + ip.treeShowFlag + '","setting":"treeSetting"}' + "'>" +
				"</div>" ;
		$(".tree-area").append(tree_html);
	} else {
		// 多选树
		$("#isRelationPc").show();
		$("#isRelationPc").prop("checked", true);
		tree_html = "<div class='text-right child-data-tree'>" +
				"<span class='all-tree-content' id='ip-tree-all-muli' title='all-radio-data-tree'>" +
				"<span class='glyphicon glyphicon-chevron-down' id='all-tree-tip'></span>"+
				"<span class='span-check-all' id='span-check-all' name='child-data-tree'></span>全部</span>" +
				"<a style='cursor: pointer;font-size:12px;color:#1871c1;' id='ip-open-all' name='child-data-tree'>全部展开</a>&nbsp;|&nbsp;" +
				"<a style='cursor: pointer;font-size:12px;color:#1871c1;' id='ip-close-all' name='child-data-tree'>全部闭合</a>" +
				"</div>" +
				"<div class='ztree child-data-tree assist-insert-tree' u-meta='" + '{"id":"child-data-tree","type":"tree","data":"treeDataTable","idField":"chr_id","pidField":"parent_id","nameField":"' + ip.treeShowFlag + '","setting":"treeSettingCheck"}' + "'>";
				"</div>";
		tree_html_nochild = "<div class='text-right noChi-data-tree'>" +
				"<span class='all-tree-content' id='ip-tree-all-muli' title='all-radio-data-tree'>" +
				"<span class='glyphicon glyphicon-chevron-down' id='all-tree-tip'></span>"+
				"<span class='span-check-all' id='span-check-all-noChi' name='noChi-data-tree'></span>全部</span>" +
				"<a style='cursor: pointer;font-size:12px;color:#1871c1;' id='ip-open-all' name='noChi-data-tree'>全部展开</a>&nbsp;|&nbsp;" +
				"<a style='cursor: pointer;font-size:12px;color:#1871c1;' id='ip-close-all' name='noChi-data-tree'>全部闭合</a>" +
				"</div>" +
				"<div class='ztree noChi-data-tree assist-insert-tree' u-meta='" + '{"id":"noChi-data-tree","type":"tree","data":"treeDataTable","idField":"chr_id","pidField":"parent_id","nameField":"' + ip.treeShowFlag + '","setting":"treeSettingCheckNoChid"}' + "'>" +
				"</div>";
		$(".tree-area").append(tree_html);
		$(".tree-area").append(tree_html_nochild);                          
		if ($("input[name='optionsCheck']")[0].checked) {
			$("#span-check-all-noChi").hide();
			$("#span-check-all").show();
			$(".noChi-data-tree").hide();
			$(".child-data-tree").show();
			$("button[name='btnFind']").attr("id", "btn-child-data-tree");
			$("button[name='btnNext']").attr("id", "nex-child-data-tree");
			$("button[name='btnSure']").attr("id", "sur-child-data-tree");
		} else {
			$("#span-check-all").hide();
			$("#span-check-all-noChi").show();
			$(".noChi-data-tree").show();
			$(".child-data-tree").hide();
			$("button[name='btnFind']").attr("id", "btn-noChi-data-tree");
			$("button[name='btnNext']").attr("id", "nex-noChi-data-tree");
			$("button[name='btnSure']").attr("id", "sur-noChi-data-tree");
		}
	}
	localStorage.setItem("tree_flag", flag);
	ip.initTree(id, data, flag);
}

ip.initTree = function(id, data, flag) {
	var viewModel = {
		treeSetting: {
			view: {
				showLine: false
			},
			callback: {
				onDblClick: function(e, id, node) {
					ip.setSelectedNode(id);
				}
			}
		},
		treeSettingCheck: {
			view: {
				showLine: false
			},
			callback: {
				onDblClick: function(e, id, node) {
					var treeObj = $.fn.zTree.getZTreeObj(id);
					treeObj.checkNode(node, true, true);
					ip.setSelectedNode(id);
				},
				onCheck: function(event, id, node){
					var treeObj = $.fn.zTree.getZTreeObj(id);
					ip.checkTreeNode(id);
				}
			},
			check: {
				enable: true,
				chkboxType: {
					"Y": "s",
					"N": "s"
				}
			}
		},
		treeSettingCheckNoChid: {
			view: {
				showLine: false
			},
			callback: {
				onDblClick: function(e, id, node) {
					ip.setSelectedNode(id);
				},
				onCheck: function(event, id, node){
					ip.checkTreeNode(id);
				}
			},
			check: {
				enable: true,
				chkboxType: {
					"Y": "",
					"N": ""
				}
			}
		},
		treeDataTable: new u.DataTable({
			meta: ''
		})
	};
	viewModel.treeData = data;
	var mate_arr = ['chr_id','parent_id',ip.treeShowFlag];
	var meta = '{';
	for (var mt = 0; mt < mate_arr.length; mt++) {
		meta += '"' + mate_arr[mt] + '"';
		meta += ":{}";
		if (mt < mate_arr.length - 1) {
			meta += ",";
		}
	}
	meta += "}";
	viewModel.treeDataTable.meta = JSON.parse(meta);
	ko.cleanNode($('.tree-area')[0]);
	var app = u.createApp({
		el: '.tree-area',
		model: viewModel
	});
	//var firstItem = {};
	viewModel.treeDataTable.setSimpleData(data);
	if (data.length < 101) {
		var tree_id = $("button[name='btnFind']").attr("id").substring(4);
		$("#" + tree_id)[0]['u-meta'].tree.expandAll(true);
	}
	if (!ip.isEmptyObject(ip.tree_viewModel)) {
		var focus_row = ip.tree_viewModel.getFocusRow();
		var selected_node_input_arr = [];
		var value = focus_row.data[id].value + '';
		var focus_rows_data = value.split(",");
		for (var fr = 0; fr < focus_rows_data.length; fr++) {
			var fr_value = focus_rows_data[fr].split("@")[2] + " " + decodeURI(focus_rows_data[fr].split("@")[1]);
			selected_node_input_arr.push(fr_value);
		}
		ip.dealCodeInto(selected_node_input_arr, true);
	} else {
		if (ip.areaId == 0) {
			var current_input_value = $("#" + id).val();
		} else {
			var current_input_value = $("#" + id + "-" + ip.areaId).val();
		}
		if (undefined != current_input_value && current_input_value != "") {
			var selected_node_input_arr = current_input_value.split(",");
			ip.dealCodeInto(selected_node_input_arr, false);
		}
	}
	$("#aim").val(id);
	$("#ip-open-all").on('click', function() {
		var treeId = $(this).attr("name");
		$("#" + treeId)[0]['u-meta'].tree.expandAll(true);
	});
	$("#ip-close-all").on('click', function() {
		var treeId = $(this).attr("name");
		$("#" + treeId)[0]['u-meta'].tree.expandAll(false);
	});
	/*
	 * 单选树全部展开的事件
	 */
	ip.isClickAll = false;
	$("#ip-tree-all").on('click', function() {
		//alert("adadad");
		//$(this).parent().siblings("div").toggleClass("hidden");
		var id = $(this).attr("title").substring(4);
		var data_tree = $("#" + id)[0]['u-meta'].tree;
		var aim = $("#aim").val();
		var flag = localStorage.getItem("tree_flag");
		if(flag == 0){
			data_tree.cancelSelectedNode();
			$("#" + aim + "-" + ip.areaId).val("");
			$("#" + aim + "-" + ip.areaId + "-h").val("");
		}
		ip.isClickAll = true;
		
	});
	
	/*
	 * 多选树的全部处理
	 */
	if(localStorage.getItem("tree_flag") == 1){
		var noChiTree = $("#noChi-data-tree")[0]['u-meta'].tree;
		var childTree = $("#noChi-data-tree")[0]['u-meta'].tree;
		if(noChiTree.getCheckedNodes(true)){
			if(noChiTree.getCheckedNodes(true).length == data.length){
				$("#span-check-all-noChi").addClass("span-check-all-checked");
			}else{
				$("#span-check-all-noChi").removeClass("span-check-all-checked");
			}
		}
		if(childTree.getCheckedNodes(true)){
			if(childTree.getCheckedNodes(true).length == data.length){
				$("#span-check-all").addClass("span-check-all-checked");
			}else{
				$("#span-check-all").removeClass("span-check-all-checked");
			}
		}
	}
	$("#span-check-all, #span-check-all-noChi").on('click',function(){
		var treeId = $(this).attr("name");
		$("#" + treeId)[0]['u-meta'].tree.expandAll(true);
		var treeObj = $("#" + treeId)[0]['u-meta'].tree;
		$(this).toggleClass("span-check-all-checked");
		if($(this).hasClass("span-check-all-checked")){
			treeObj.expandAll(true);
			treeObj.checkAllNodes(true);
		}else{
			treeObj.expandAll(false);
			treeObj.checkAllNodes(false);
		}
	});

	$("#myModalTree").modal({
		backdrop: 'static',
		keyboard: false
	});
	if (typeof ip.treeCallBack2 == "function") {
		ip.treeCallBack2(viewModel);
	}
}
ip.setSelectedNode = function(id) {
	var data_tree = $("#" + id)[0]['u-meta'].tree;
	var aim = $("#aim").val();
	var flag = localStorage.getItem("tree_flag");
	if (flag == "0") {
		var select_node = data_tree.getSelectedNodes();
		if(ip.isClickAll == true){
			var select_node = data_tree.getSelectedNodes();
			ip.isClickAll = false;
		}
		if ( select_node[0].isParent && !ip.choice_parent_flag) {
			return;
		}
	} else {
		var select_node = data_tree.getCheckedNodes(true);
	}
	if(select_node.length == 0){
		$("#" + aim + "-" + ip.areaId).val("");
		$("#" + aim + "-" + ip.areaId + "-h").val("");
		$("#user-write").val("");
		$("#myModalTree").modal('hide');
		return;
	}
		var tree_string = "";
		var tree_string_old = "";
		for (var i = 0; i < select_node.length; i++) {
			if ( select_node[i].isParent && !ip.choice_parent_flag) {
				continue;
			} else {
				if (i == select_node.length - 1) {
					tree_string_old += select_node[i][ip.treeShowFlag];
					tree_string += select_node[i].id + "@" + encodeURI(select_node[i].chr_name, "utf-8") + "@" + select_node[i].chr_code;
				} else {
					tree_string_old += select_node[i][ip.treeShowFlag] + ",";
					tree_string += select_node[i].id + "@" + encodeURI(select_node[i].chr_name, "utf-8") + "@" + select_node[i].chr_code + ",";
				}
			}
		}
		if (ip.areaId == 0) {
			if ($("#" + aim).val() != tree_string_old) {
				$("#" + aim + "-h").val(tree_string).change();
				$("#" + aim).val(tree_string_old).change();
			} else {
				$("#" + aim + "-h").val(tree_string);
				$("#" + aim).val(tree_string_old);
			}
		} else {
			if ($("#" + aim + "-" + ip.areaId).val() != tree_string_old) {
				$("#" + aim + "-" + ip.areaId).val(tree_string_old).change();
				$("#" + aim + "-" + ip.areaId + "-h").val(tree_string).change();
			} else {
				$("#" + aim + "-" + ip.areaId).val(tree_string_old);
				$("#" + aim + "-" + ip.areaId + "-h").val(tree_string);
			}
		}
		if (!ip.isEmptyObject(ip.tree_viewModel)) {
			var focus_row = ip.tree_viewModel.getFocusRow();
			ip.tree_viewModel.setValue(aim, tree_string, focus_row);
		}
		$("#user-write").val("");
		$("input[name='optionsCheck']").attr("checked", true);
		$("#myModalTree").modal('hide');
		if (typeof ip.treeCallBack == "function") {
			ip.treeCallBack(tree_string,select_node);
		}
}
//确定按钮事件
ip.sureSelectTree = function(id) {
	id = id.substring(4);
	$("#user-write").val("");
	ip.setSelectedNode(id);
	
}
ip.checkTreeNode = function(id){
	var data_tree = $("#" + id)[0]['u-meta'].tree;
	var nodes = data_tree.transformToArray(data_tree.getNodes());
	if(data_tree.getCheckedNodes(true)){
		if(data_tree.getCheckedNodes(true).length == nodes.length){
			if(id == "child-data-tree"){
				$("#span-check-all").addClass("span-check-all-checked");
			}else if(id == "noChi-data-tree"){
				$("#span-check-all-noChi").addClass("span-check-all-checked");
			}
		}else{
			if(id == "child-data-tree"){
				$("#span-check-all").removeClass("span-check-all-checked");
			}else if(id == "noChi-data-tree"){
				$("#span-check-all-noChi").removeClass("span-check-all-checked");
			}
		}
	}

}
/*
 * 辅助录入树取消和关闭按钮 清空快速搜索
 */
ip.closeAssitTree = function() {
	$("#user-write").val("");
};
//判断对象是否为空 
ip.isEmptyObject = function(obj) {
	for (var name in obj) {
		return false; // 返回false，不为空对象
	}
	return true; // 返回true，为空对象
}
//判断字符串是否为空 为空返回true 不为空返回false
ip.strIsNull = function (str) {
	if (str == null || str == undefined || (str + " ").trim().length <= 0) {
		return true;
	} else {
		return false;
	}
};

//判断字符串是否为不为空 为空返回false 不为空返回true
 ip.strIsNotNull=function(str) {
	if (str != null && str != undefined && (str + " ").trim().length > 0) {
		return true;
	} else {
		return false;
	}
};

ip.search = function(id) {
		var user_write = $("#user-write").val();
		var treeId = id.substring(4);
		var data_tree = $("#" + treeId)[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name", user_write, null);
		if (search_nodes == null || search_nodes.length == 0) {
			ip.ipInfoJump("无搜索结果", "error");
		} else {
			data_tree.expandNode(search_nodes[0], true, false, true);
			data_tree.selectNode(search_nodes[0]);
		}
}
ip.node_count = 1;
ip.next = function(id) {
		var user_write = $("#user-write").val();
		var treeId = id.substring(4);
		var data_tree = $("#" + treeId)[0]['u-meta'].tree;
		var search_nodes = data_tree.getNodesByParamFuzzy("name", user_write, null);
		if (ip.node_count < search_nodes.length) {
			data_tree.selectNode(search_nodes[ip.node_count++]);
		} else {
			ip.node_count = 1;
			ip.ipInfoJump("最后一个", "info");
			// alert("最后一个");
		}
}

var quickval="";
ip.quickQuery = function (id){  
	var user_write = $("#user-write").val();
	var treeId = id.substring(4);
	if(quickval == user_write){
		return;
	}
	quickval = user_write
	var data_tree = $("#" + treeId)[0]['u-meta'].tree;
	var search_nodes = data_tree.getNodesByParamFuzzy("name",user_write,null);
	data_tree.expandNode(search_nodes[0],true,false,true);
	data_tree.selectNode(search_nodes[0]);
	$("#user-write").focus();
	ip.index=1;
}
ip.index = 0;
ip.keyTreeNext = function (id){
	var user_write = $("#user-write").val();
	var treeId = id.substring(4);
	var data_tree = $("#" + treeId)[0]['u-meta'].tree;
	var search_nodes = data_tree.getNodesByParamFuzzy("name", user_write, null);
	if(ip.index < search_nodes.length){
		data_tree.selectNode(search_nodes[ip.index++]);
	}else{
		ip.index = 0;
		ip.ipInfoJump("最后一个");
	}
	$("#user-write").focus();
}
	//复选框是否包含下级的事件
ip.TreeIsIncliudChild = function() {
		if ($("input[name='optionsCheck']")[0].checked) {
			$("#span-check-all").show();
			$("#span-check-all-noChi").hide();
			$(".noChi-data-tree").hide();
			$(".child-data-tree").show();
			$("button[name='btnFind']").attr("id", "btn-child-data-tree");
			$("button[name='btnNext']").attr("id", "nex-child-data-tree");
			$("button[name='btnSure']").attr("id", "sur-child-data-tree");
		} else {
			$("#span-check-all").hide();
			$("#span-check-all-noChi").show();
			$(".noChi-data-tree").show();
			$(".child-data-tree").hide();
			$("button[name='btnFind']").attr("id", "btn-noChi-data-tree");
			$("button[name='btnNext']").attr("id", "nex-noChi-data-tree");
			$("button[name='btnSure']").attr("id", "sur-noChi-data-tree");
		}
	}
	/*
	 * 辅助录入树的弹窗 param id 目标输入框的id element 资源标识 flag单选和多选的标识（0代表单选，1代表有多选框的）
	 */
ip.showAssitTree = function(id, element, flag, viewModel, areaId, ele_name, callBack,condition,parentFlag,showFlag,callBack2) {
	var tokenid = ip.getTokenId();
	var id_p = id.indexOf("-btn");
	if (id_p != -1) {
		id = id.substr(0, id_p);
	}
	var ele_value = "";
	if(condition == undefined) {
		condition = "";
	}
	var all_options = {
		"element": element,
		"tokenid": tokenid,
		"ele_value": ele_value,
		"ajax": "noCache",
		"condition": condition
	};
	$.ajax({
		url: "/df/dic/dictree.do",
		type: "GET",
		async: false,
		data: ip.getCommonOptions(all_options),
		success: function(data) {
			ip.treeChoice(id, data.eleDetail, flag, viewModel, areaId, ele_name, parentFlag,callBack,showFlag,callBack2);
		}
	});
}
ip.judgeDown = function(obj,e) {
	if ( ! ((event.keyCode >= 48 && event.keyCode <= 57 ) || (event.keyCode >= 96 && event.keyCode <= 105 ) || (event.keyCode == 8 ))){
		event.returnValue = false ;
	}
}
ip.judge = function(obj, n,id) {
	if(window.event.keyCode==37){ // 按 Esc 
		return true;
	} 
	var big_show = $("#big-show-money");
	var put_value = $("#" + obj.id).val()
	var isNum = ip.isNotANumber(put_value);
	if( put_value != ""){
		var len = put_value.length;
	} else {
		$("#big-show-money > a").html("");
		$("#big-show-money > a").attr("title","");
		return;
	}
	
	var current_position = ip.getCursortPosition(obj);
	if (len - current_position <= 1) {
		// ip.setCaretPosition(obj,len);
		ip.clearNoNum(obj);
		var dotIdx = obj.value.indexOf('.');
		if (dotIdx >= 0) {
			dotLeft = obj.value.substring(0, dotIdx);
			dotRight = obj.value.substring(dotIdx + 1);
			if (dotRight.length > n) {
				dotRight = dotRight.substring(0, n);
			}
			obj.value = dotLeft + '.' + dotRight;
		}
	}
	if(big_show && isNum){
		var current_value = ip.dealThousandNum(put_value, 2);
		$("#big-show-money > a").html(current_value);
		$("#big-show-money > a").attr("title",current_value);
	}
	if(id){
		ip.compareMaxMoney(put_value,id);
	}
}

ip.compareMaxMoney = function(value,maxId){
	if(Number(value.replace(/,/gi,'')) > Number($("#"+maxId).text().replace(/,/gi,''))){
		ip.ipInfoJump("超过可用金额！", "info");
	}
}

ip.setCaretPosition = function(element, pos) {
	if (element.setSelectionRange) {
		element.focus();
		element.setSelectionRange(pos, pos);
	} else if (element.createTextRange) {
		var range = element.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}
ip.getCursortPosition = function(element) {
	var CaretPos = 0;
	if (document.selection) { //支持IE
		element.focus();
		var Sel = document.selection.createRange();
		Sel.moveStart('character', -element.value.length);
		CaretPos = Sel.text.length;
	} else if (element.selectionStart || element.selectionStart == '0') //支持firefox
		CaretPos = element.selectionStart;
	return (CaretPos);
}

ip.clearNoNum = function(obj) {
	obj.value = obj.value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符   
	obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的   
	obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
	obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数   
	if (obj.value.indexOf(".") < 0 && obj.value != "") { //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
		obj.value = parseFloat(obj.value);
	}
}
// ele: 要素标示
// id: 输入框id
// data：input的值
ip.getTreeValue = function(ele, id, data) {
	var eleStr = $("#" + id).val().split("@");
	data[ele.toLowerCase() + "_id"] = eleStr[0];
	data[ele.toLowerCase() + "_code"] = eleStr[2];
	data[ele.toLowerCase() + "_name"] = decodeURI(eleStr[1]);
	return data;
};

//初始化监控预警窗口
ip.initInspectView = function(detail_table_name, wf_id, current_node_id, listError, options) {
	var areaId = options.inspectModalId;
	var viewModel = {
		gridData: new u.DataTable({
			meta: {
				"vou_money": "",
				"inspect_flag": "",
				"inspect_rules": "",
			}
		})
	};
	//页面绑定
	ko.cleanNode($('#' + areaId)[0]);
	var app = u.createApp({
		el: '#' + areaId,
		model: viewModel
	});
	var html= "<div class='modal-dialog' role='document' style='margin: 0 auto;width: 800px;height: 436px;background: #fff;margin-top: 35px;border-radius: 6px 6px 0px 0px;'>"+
			  "<div class='modal-header'>"+
			  "<button type='button' class='close monitorModalInput-close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"+
			  "<h4 class='modal-title'>预警信息</h4>"+
			  "</div>"+
			  "<div style='height:355px;padding: 10px;overflow: auto;'>"+
			  "<table  border='1' style='table-layout:fixed;' id='inspectGrid'>"+
			  "<tr>"+  
			  "<th>序号</th>"+
			  "<th><input type='checkbox' id='inspect_check'></th>"+
			  "<th width='180px'>交易凭证号</th>"+
			  "<th width='240px'>预警信息</th>"+
			  "<th width='80px'>金额(元)</th>"+
			  "<th width='90px'>预警标志</th></tr>";
	if (listError != null && listError.length > 0) {
		for(var i=0;i<listError.length;i++){
			if(listError[i].inspectFlag=="3"){
				var transferinfo="禁止";
				html+="<tr><td>"+(i+1)+"</td><td><input type='checkbox' name='inspect' value='"+listError[i].id+";"+listError[i].inspectFlag+"'></td>"+
				"<td style='text-align:left;'>"+""/*listError[i].vou_no*/+"</td><td style='text-align:left;'>";
				for(var j=0;j<listError[i].inspectRlues.length;j++){
					html+="["+j+"]"+listError[i].inspectRlues[j]+"</br>";
				}
				html+="</td><td style='text-align:right;'>"+listError[i].vou_money+"</td>"+
					"<td style='text-align:center;color:red'>"+transferinfo+"</td></tr>";
			}else if(listError[i].inspectFlag=="2"){
				var transferinfo="预警";
				html+="<tr><td>"+(i+1)+"</td><td><input type='checkbox' name='inspect' value='"+listError[i].id+";"+listError[i].inspectFlag+"'></td>"+
				"<td style='text-align:left;'>"+""/*listError[i].vou_no*/+"</td><td style='text-align:left;'>";
				for(var j=0;j<listError[i].inspectRlues.length;j++){
					html+="["+j+"]"+listError[i].inspectRlues[j]+"</br>";
				}
				html+="</td><td style='text-align:right;'>"+listError[i].vou_money+"</td>"+
				"<td  style='text-align:center;'>"+transferinfo+"</td></tr>";
			}else if(listError[i].inspectFlag=="1"){
				var transferinfo="提醒";
				html+="<tr><td>"+(i+1)+"</td><td><input type='checkbox' name='inspect' value='"+listError[i].id+";"+listError[i].inspectFlag+"'></td>"+
				"<td style='text-align:left;'>"+""/*listError[i].vou_no*/+"</td><td style='text-align:left;'>";
				for(var j=0;j<listError[i].inspectRlues.length;j++){
					html+="["+j+"]"+listError[i].inspectRlues[j]+"</br>";
				}
				html+="</td><td style='text-align:right;'>"+listError[i].vou_money+"</td>"+
				"<td  style='text-align:center;'>"+transferinfo+"</td></tr>";
			}
		}
	}
	html+="</table></div>"+
		  "<div class='modal-footer' style='position: absolute;bottom: 1px;width: 100%;'>"+
		  "<input type='hidden' id='detail_table_name' value=''>"+
		  "<input type='hidden' id='wf_id' value=''>"+
		  "<input type='hidden' id='current_node_id' value=''>"+
		  "<font color='red' style='float:left;'>注：仅预警标志为“预警”的数据可以强制通过</font>"+
		  "<button type='button' class='btn btn-primary btn-illegal' onclick='doForcePass()'>强制通过</button>"+
		  "<button type='button' class='btn btn-default btn-illegal' data-dismiss='modal'>取消</button>"+
		  "</div></div>";
	$('#' + areaId).empty();
	$('#' + areaId).append(html);
	$('#' + areaId).modal({
		backdrop : 'static',
		keyboard : false
	});
	$("#detail_table_name").val(detail_table_name);
	$("#wf_id").val(wf_id);
	$("#current_node_id").val(current_node_id);
	$("#inspect_check").click(function(){
		  if($("#inspect_check").is(":checked")){
			  $('input:checkbox[name=inspect]').prop("checked",'true');
		  }else{
			  $('input:checkbox[name=inspect]').removeAttr("checked");
		  }
	});
	return viewModel;
	
	//暂时保存
//	var inspectModalId = options.inspectModalId;
//	var areaId = "inspectGridArea";
//	//插入按钮和div
//	var modalHtml = '<div class="modal-dialog monitorModalIllegal-dialog">' + 
//	'<div class="modal-content monitorModalIllegal-content">' + 
//	'<div class="modal-header">' + 
//	'<button type="button" class="close monitorModalInput-close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
//	'<h4 class="modal-title">预警信息</h4>' + 
//	'</div>' + 
//	'<div class="modal-body monitorModalIllegal-body flex flex-v">' + 
//	'<div class="monitor-body-btn">' + 
//	'<input type="hidden" id="detail_table_name" value="' + detail_table_name + '">' + 
//	'<input type="hidden" id="wf_id" value="' + wf_id + '">' + 
//	'<input type="hidden" id="current_node_id" value="' + current_node_id + '">' + 
//	'<font color="red">注：仅监控标志为“预警”的数据可以强制通过</font>'+ '</div>' + 
//	'<div class="monitor-body-grid flex-1 flex flex-v">' + '<div id="inspectGridArea" style="height:100%;"></div>' +
//	'</div>' + 
//	'</div>' + 
//	'<div class="modal-footer">'+
//		'<button type="button" class="btn btn-primary btn-illegal" onclick="doForcePass()">强制通过</button>' + 
//		'<button type="button" class="btn btn-default btn-illegal" data-dismiss="modal">取消</button>' +
//	'</div>'+
//	'</div>';
//	
//	$('#' + inspectModalId).empty();
//	$('#' + inspectModalId).append(modalHtml);
//	//创建表格
//	var viewModel = {
//		gridData: new u.DataTable({
//			meta: {
//				"vou_money": "",
//				"inspect_flag": "",
//				"inspect_rules": "",
//			}
//		})
//	};
//	viewModel.areaid = "inspectGridArea";
//	//预警级别区
//	inspectGridArea_render = function(obj) {
//		if (obj.gridCompColumn.options.field == "inspect_flag") {
//			//3#禁止>2#预警>1#提醒
//			if (obj.value == "3") {
//				obj.element.innerHTML = '<div style="text-align: center"><span>禁止</span></div>';
//			} else if (obj.value == "2") {
//				obj.element.innerHTML = '<div style="text-align: center"><span>预警</span></div>';
//			} else if (obj.value == "1") {
//				obj.element.innerHTML = '<div style="text-align: center"><span>提醒</span></div>';
//			}
//		}else if (obj.gridCompColumn.options.field == "vou_money") {
//			obj.element.innerHTML = '<div style="text-align: right">' + obj.value + '</div>';
//		}else {
//			obj.element.innerHTML = obj.value;
//		}
//	};
//
//	var gridHtml = "<div u-meta='" + '{"id":"inspectViewId","data":"gridData","type":"grid","editType":"string","autoExpand":false,"needLocalStorage":true,"multiSelect": true,"showNumCol": true,"showSumRow": false,"onSortFun":"sortFun","sumRowFirst":true,"headerHeight":32,"rowHeight":32,"sumRowHeight":32,"cancelFocus":false}' + "'>" + "<div options='" + '{"field":"inspect_rules","editType":"string","canDrag":true,"visible":true,"canVisible":false,"dataType":"String","title":"预警信息","headerLevel":"1","renderType":"inspectGridArea_render","width": 400}' + "'></div>" + "<div options='" + '{"field":"vou_money","editType":"string","visible":true,"canVisible":false,"dataType":"String","title":"金额","headerLevel":"1","renderType":"inspectGridArea_render","width": 100}' + "'></div>" + "<div options='" + '{"field":"inspect_flag","editType":"string","visible":true,"canVisible":false,"dataType":"String","title":"预警标志","headerLevel":"1","renderType":"inspectGridArea_render","width": 80}' + "'></div>" + "<div options='" + '{"field":"id","editType":"string","visible":false,"canVisible":false,"dataType":"String","title":"单据id","headerLevel":"1","renderType":"inspectGridArea_render","width": 340}' + "'></div>" + "</div>";
//
//	$('#inspectGridArea').append(gridHtml);
//	//页面绑定
//	ko.cleanNode($('#' + areaId)[0]);
//	var app = u.createApp({
//		el: '#' + areaId,
//		model: viewModel
//	});
//	var illegalData = new Array();
//	if (listError != null && listError.length > 0) {
//		for (var i = 0; i < listError.length; i++) {
//			var illegalObject = {};
//			illegalObject.vou_no = listError[i].vou_no;
//			illegalObject.vou_money = ip.dealThousands(listError[i].vou_money);
//			illegalObject.inspect_flag = listError[i].inspectFlag;
//			illegalObject.id = listError[i].id;
//
//
//			var ruleDesc = '';
//			if (listError[i].inspectRlues.length > 0) {
//				for (var j = 0; j < listError[i].inspectRlues.length; j++) {
//					ruleDesc += '[' + (j + 1) + '] ' + listError[i].inspectRlues[j];
//				}
//			}
//			illegalObject.inspect_rules = ruleDesc;
//
//			var userDesc = '';
//			if (listError[i].inspectUsers.length > 0) {
//				for (var j = 0; j < listError[i].inspectUsers.length; j++) {
//					userDesc += '[' + (j + 1) + '] ' + listError[i].inspectUsers[j];
//				}
//			}
//			illegalObject.inspect_users = userDesc;
//			illegalData.push(illegalObject);
//		}
//	}
//
//	//装入数据
//	viewModel.gridData.setSimpleData(illegalData, {
//		unSelect: true
//	});
//	$('#' + inspectModalId).modal({
//		backdrop : 'static',
//		keyboard : false
//	});
//	return viewModel;
};

//支付保存时校验是否违规
ip.checkInspect = function(url, options){
	options["pageInfo"] = 50 + "," + 0 + ",";
	options["sortType"] = "";
	var inspect=true;
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		async: false,
		data: options,
		beforeSend: ip.loading(true),
		success: function(data) {
			ip.loading(false);
			var listError = data.listError;
			var listWarn = data.listWarn;
			//是否有违规
			if(data.exception){
				inspect=false;
				ip.warnJumpMsg("保存调用监控发生异常:" + data.result, 0, 0, true);
			}else if ((listError != undefined && listError != null && listError != "") ||(listWarn != undefined && listWarn != null && listWarn != "")) {
				var areaId = options.inspectModalId;
				var viewModel = {
					gridData: new u.DataTable({
						meta: {
							"vou_money": "",
							"inspect_flag": "",
							"inspect_rules": "",
						}
					})
				};
				//页面绑定
				ko.cleanNode($('#' + areaId)[0]);
				var app = u.createApp({
					el: '#' + areaId,
					model: viewModel
				});
				var html= "<div class='modal-dialog' role='document' style='margin: 0 auto;width: 800px;height: 436px;background: #fff;margin-top: 35px;border-radius: 6px 6px 0px 0px;'>"+
						  "<div class='modal-header'>"+
						  "<button type='button' class='close monitorModalInput-close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"+
						  "<h4 class='modal-title'>预警信息</h4>"+
						  "</div>"+
						  "<div style='height:355px;padding: 10px;overflow: auto;'>"+
						  "<table  border='1' style='table-layout:fixed;' id='inspectGrid'>"+
						  "<tr>"+  
						  "<th>序号</th>"+
						  "<th><input type='checkbox' id='inspect_check'></th>"+
						  "<th width='180px'>交易凭证号</th>"+
						  "<th width='240px'>预警信息</th>"+
						  "<th width='80px'>金额(元)</th>"+
						  "<th width='90px'>预警标志</th></tr>";
				if (listError != null && listError.length > 0) {
					for(var i=0;i<listError.length;i++){
						if(listError[i].inspectFlag=="3"){
							var transferinfo="禁止";
							html+="<tr><td>"+(i+1)+"</td><td><input type='checkbox' name='inspect' value='"+listError[i].id+";"+listError[i].inspectFlag+"'></td>"+
							"<td style='text-align:left;'>"+""/*listError[i].vou_no*/+"</td><td style='text-align:left;'>";
							for(var j=0;j<listError[i].inspectRlues.length;j++){
								html+="["+j+"]"+listError[i].inspectRlues[j]+"</br>";
							}
							html+="</td><td style='text-align:right;'>"+listError[i].vou_money+"</td>"+
								"<td style='text-align:center;color:red;'>"+transferinfo+"</td></tr>";
						}
					}
					html+="</table></div>"+
					  "<div class='modal-footer' style='position: absolute;bottom: 1px;width: 100%;'>"+
					  '<button id="btn-footer-sure" class="btn btn-primary" data-dismiss="modal">确定</button>'+ 
					  "</div></div>";
					inspect= false;
				}else if (listWarn != null && listWarn.length > 0) {
					for(var i=0;i<listWarn.length;i++){
						if(listWarn[i].inspectFlag=="8"){
							var transferinfo="提醒";
							html+="<tr><td>"+(i+1)+"</td><td><input type='checkbox' name='inspect' value='"+listWarn[i].id+";"+listWarn[i].inspectFlag+"'></td>"+
							"<td style='text-align:left;'>"+""/*listWarn[i].vou_no*/+"</td><td style='text-align:left;'>";
							for(var j=0;j<listWarn[i].inspectRlues.length;j++){
								html+="["+j+"]"+listWarn[i].inspectRlues[j]+"</br>";
							}
							html+="</td><td style='text-align:right;'>"+listWarn[i].vou_money+"</td>"+
							"<td  style='text-align:center;'>"+transferinfo+"</td></tr>";
						}
					}
					html+="</table></div>"+
					  "<div class='modal-footer' style='position: absolute;bottom: 1px;width: 100%;'>"+
					  '<div id="inspectSaveDiv" class="monitor-body-btn"><button type="button" class="btn btn-primary btn-illegal" onclick="doForceSave()">继续保存</button>' + '<button type="button" class="btn btn-default btn-illegal" data-dismiss="modal">取消</button>' + '</div>' + 
					  "</div></div>";
					inspect= false;
				}
				$('#' + areaId).empty();
				$('#' + areaId).append(html);
				$('#' + areaId).modal({
					backdrop : 'static',
					keyboard : false
				});
				$("#inspect_check").click(function(){
					  if($("#inspect_check").is(":checked")){
						  $('input:checkbox[name=inspect]').prop("checked",'true');
					  }else{
						  $('input:checkbox[name=inspect]').removeAttr("checked");
					  }
				});
				
				//暂时保留
	//			var inspectModalId = options.inspectModalId;
	//			var areaId = "inspectGridArea";
	//			//插入按钮和div
	//			var modalHtml = '<div class="modal-dialog monitorModalIllegal-dialog">' + 
	//			'<div class="modal-content monitorModalIllegal-content">' + 
	//			'<div class="modal-header">' + 
	//				'<button type="button" class="close monitorModalInput-close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
	//				'<h4 class="modal-title">预警信息</h4>' + 
	//			'</div>' + 
	//			'<div class="modal-body monitorModalIllegal-body flex flex-v">' + 
	//			
	//				'<div class="monitor-body-grid flex-1 flex flex-v">' + 
	//					'<div id="inspectGridArea" style="height:100%;"></div>' +
	//				'</div>' +
	//			'</div>' + 
	//			'<div class="modal-footer">'+
	//				'<div id="inspectSaveDiv" class="monitor-body-btn"><button type="button" class="btn btn-primary btn-illegal" onclick="doForceSave()">继续保存</button>' + '<button type="button" class="btn btn-default btn-illegal" data-dismiss="modal">取消</button>' + '</div>' + 
	//				'<button id="btn-footer-sure" class="btn btn-primary"  data-dismiss="modal">确定</button>'+ 
	//			'</div>'+
	//			'</div>';
	//
	//			$('#' + inspectModalId).empty();
	//			$('#' + inspectModalId).append(modalHtml);
	//			//创建表格
	//			var viewModel = {
	//				gridData: new u.DataTable({
	//					meta: {
	//						"vou_money": "",
	//						"inspect_flag": "",
	//						"inspect_rules": "",
	//					}
	//				})
	//			};
	//			viewModel.areaid = "inspectGridArea";
	//			//预警级别区
	//			inspectGridArea_render = function(obj) {
	//				if (obj.gridCompColumn.options.field == "inspect_flag") {
	//					//3#禁止,8#提醒
	//					if (obj.value == "3") {
	//						obj.element.innerHTML = '<div style="text-align: center"><span>禁止</span></div>';
	//					} else if (obj.value == "8") {
	//						obj.element.innerHTML = '<div style="text-align: center"><span>提醒</span></div>';
	//					}
	//				}else if (obj.gridCompColumn.options.field == "vou_money") {
	//					obj.element.innerHTML = '<div style="text-align: right">' + obj.value + '</div>';
	//				}else {
	//					obj.element.innerHTML = obj.value;
	//				}
	//			};
	//
	//			var gridHtml = "<div style='height: calc(100% - 0px)' u-meta='" + '{"id":"inspectViewId","data":"gridData","type":"grid","editType":"string","autoExpand":false,"needLocalStorage":true,"multiSelect": true,"showNumCol": true,"showSumRow": false,"onSortFun":"sortFun","sumRowFirst":true,"headerHeight":32,"rowHeight":32,"sumRowHeight":32,"cancelFocus":false}' + "'>" + "<div options='" + '{"field":"operate","visible":false,"dataType":"String","editType":"string","title":"操作","fixed":true,"width": 120,"renderType":"inspectGridArea"}' + "'></div>" + "<div options='" + '{"field":"inspect_rules","editType":"string","visible":true,"canDrag":true,"canVisible":false,"dataType":"String","title":"预警信息","headerLevel":"1","renderType":"inspectGridArea_render","width": 400}' + "'></div>" + "<div options='" + '{"field":"vou_money","editType":"string","visible":true,"canVisible":false,"dataType":"String","title":"金额","headerLevel":"1","renderType":"inspectGridArea_render","width": 100}' + "'></div>" + "<div options='" + '{"field":"inspect_flag","editType":"string","visible":true,"canVisible":false,"dataType":"String","title":"预警标志","headerLevel":"1","renderType":"inspectGridArea_render","width": 80}' + "'></div>" + "<div options='" + '{"field":"id","editType":"string","visible":false,"canVisible":false,"dataType":"String","title":"单据id","headerLevel":"1","renderType":"inspectGridArea_render","width": 340}' + "'></div>" + "</div>";
	//
	//			$('#inspectGridArea').append(gridHtml);
	//			//页面绑定
	//			ko.cleanNode($('#' + areaId)[0]);
	//			var app = u.createApp({
	//				el: '#' + areaId,
	//				model: viewModel
	//			});
	//			var illegalData = new Array();
	//			if (listError != null && listError.length > 0) {
	//				for (var i = 0; i < listError.length; i++) {
	//					var illegalObject = {};
	//					illegalObject.vou_no = listError[i].vou_no;
	//					illegalObject.vou_money = ip.dealThousands(listError[i].vou_money);
	//					illegalObject.inspect_flag = listError[i].inspectFlag;
	//					illegalObject.id = listError[i].id;
	//
	//
	//					var ruleDesc = '';
	//					if (listError[i].inspectRlues.length > 0) {
	//						for (var j = 0; j < listError[i].inspectRlues.length; j++) {
	//							ruleDesc += '[' + (j + 1) + '] ' + listError[i].inspectRlues[j];
	//						}
	//					}
	//					illegalObject.inspect_rules = ruleDesc;
	//
	//					var userDesc = '';
	//					if (listError[i].inspectUsers.length > 0) {
	//						for (var j = 0; j < listError[i].inspectUsers.length; j++) {
	//							userDesc += '[' + (j + 1) + '] ' + listError[i].inspectUsers[j];
	//						}
	//					}
	//					illegalObject.inspect_users = userDesc;
	//					illegalData.push(illegalObject);
	//				}
	//				//装入数据
	//				viewModel.gridData.setSimpleData(illegalData, {
	//					unSelect: true
	//				});
	//				$('#' + inspectModalId).modal({
	//					backdrop: 'static',
	//					keyboard: false
	//				});
	//				$('#inspectSaveDiv').hide();
	//				$("#btn-footer-sure").show();
	//				inspect= false;
	//			} else if (listWarn != null && listWarn.length > 0) {
	//				for (var i = 0; i < listWarn.length; i++) {
	//					var illegalObject = {};
	//					illegalObject.vou_no = listWarn[i].vou_no;
	//					illegalObject.vou_money = listWarn[i].vou_money;
	//					illegalObject.inspect_flag = listWarn[i].inspectFlag;
	//					illegalObject.id = listWarn[i].id;
	//
	//
	//					var ruleDesc = '';
	//					if (listWarn[i].inspectRlues.length > 0) {
	//						for (var j = 0; j < listWarn[i].inspectRlues.length; j++) {
	//							ruleDesc += '[' + (j + 1) + '] ' + listWarn[i].inspectRlues[j];
	//						}
	//					}
	//					illegalObject.inspect_rules = ruleDesc;
	//
	//					var userDesc = '';
	//					if (listWarn[i].inspectUsers.length > 0) {
	//						for (var j = 0; j < listWarn[i].inspectUsers.length; j++) {
	//							userDesc += '[' + (j + 1) + '] ' + listWarn[i].inspectUsers[j];
	//						}
	//					}
	//					illegalObject.inspect_users = userDesc;
	//					illegalData.push(illegalObject);
	//				}
	//				//装入数据
	//				viewModel.gridData.setSimpleData(illegalData, {
	//					unSelect: true
	//				});
	//				$('#' + inspectModalId).modal({
	//					backdrop: 'static',
	//					keyboard: false
	//				});
	//				$('#inspectSaveDiv').show();
	//				$("#btn-footer-sure").hide();
	//				inspect= false;
	//			}
			} else {
				inspect=true;
			}
		}
	});
	return inspect;
};


//处理输入框百分数
ip.dealPercent = function(value) {
	var percent = "";
	if (value == 0) {
		return value;
	}
	if (value != "") {
		percent = "";
		percent = parseFloat(value).toFixed(2);
		if (percent > 100 || percent < 0) {
			ip.ipInfoJump("请输入1到100的数字!", "error");
			percent = "";
		}
		return percent;
	}
};
//设置gird高度
ip.setGridHeight = function(btn) {
	var searchH, gridH;
	var searchDiv = $(btn).parents(".search");
	searchH = searchDiv.height();
	var gridDiv = searchDiv.next();
	gridH = gridDiv.height();
	if (searchH - 45 > 0) {
		searchBoxH = searchH - 45;
		gridDiv.height(gridH - searchBoxH);
	} else {
		gridDiv.height(gridH + searchBoxH);
	}
};
ip.isNotANumber = function(inputData) {
　　if (parseFloat(inputData).toString() == "NaN"){
　　　　  return false;
　　} else {
　　　　  return true;
　　}
}
/*区域ID
 *  高亮显示的词语
 *  颜色
*/
ip.highLightKeyWord = function(key, color,gridArea) {  
    var keyWord = key || "";  
    var keyColor = color || "red";  
    if(gridArea != "" && gridArea != undefined){
    	var nodes =$("#"+gridArea+" td[role='rowcell']").find('.u-grid-content-td-div');//可使用document.getElementById替换  
    }else{
    	var nodes =$("td[role='rowcell']").find('.u-grid-content-td-div');//可使用document.getElementById替换  
    }
   // var nodes =$("td[role='rowcell']").find('.u-grid-content-td-div');//可使用document.getElementById替换  
    if(nodes.length != 0){
    	for(var i=0; i < nodes.length; i++){
    		var html = nodes.eq(i).text(); //可使用innerHTML替换  
			if(html != "" && keyWord != ""){
				if(ip.isNotANumber(keyWord)){
					if(keyWord == 0){
						var pattern = new RegExp(keyWord, "gi");
	               	 	html = html.replace(pattern, "<font color='"+keyColor+"' style='background: yellow'>" + keyWord + "</font>");  
	               	 	nodes.eq(i).html(html);//可使用innerHTML替换 
	    			} else {
	    				var little_num = "";
	        			if(keyWord.indexOf(".") !== -1){
	        				var old_keyWord = keyWord;
	        				keyWord = old_keyWord.substring(0,old_keyWord.indexOf("."));
	        				little_num = old_keyWord.substring(old_keyWord.indexOf("."));
	        			} else {
	        				little_num = "";
	        			}
	                    var pattern = new RegExp(keyWord, "gi");
	                    //如果字段超过4个则本身直接千分位匹配
	                    if(keyWord.length >= 4) {
	                        var direct_pattern = ip.dealThousandNum(keyWord,0) + little_num;
	                        var direct_pattern_a = new RegExp(direct_pattern, "gi");
	                    }
	                    //匹配一个0
	                    var one_zero = ip.dealThousandNum(keyWord + '0',0);
	                    var one_zero_a = one_zero.substring(0, one_zero.length-1) + little_num;
	                    var pattern_one_zero = new RegExp(one_zero_a, "gi");
	                    //匹配两个0
	                    var two_zero = ip.dealThousandNum(keyWord + '00',0);
	                    var two_zero_a = two_zero.substring(0, two_zero.length-2) + little_num;
	                    var pattern_two_zero = new RegExp(two_zero_a, "gi");
	                    
		            	html = html.replace(pattern, "<font color='"+keyColor+"' style='background: yellow'>" + keyWord + "</font>");  
		                nodes.eq(i).html(html);//可使用innerHTML替换 
		                html = html.replace(pattern_one_zero, "<font color='"+keyColor+"' style='background: yellow'>" + keyWord + "</font>");  
		                nodes.eq(i).html(html);//可使用innerHTML替换  
		                html = html.replace(pattern_two_zero, "<font color='"+keyColor+"' style='background: yellow'>" + keyWord + "</font>");  
		                nodes.eq(i).html(html);//可使用innerHTML替换  
		                html = html.replace(direct_pattern_a, "<font color='"+keyColor+"' style='background: yellow'>" + keyWord + "</font>");  
		                nodes.eq(i).html(html);//可使用innerHTML替换 
	    			}
				} else {
					var pattern = new RegExp(keyWord, "gi");
               	 	html = html.replace(pattern, "<font color='"+keyColor+"' style='background: yellow'>" + keyWord + "</font>");  
               	 	nodes.eq(i).html(html);//可使用innerHTML替换 
				}
            }  
    	}
    }
} 
//模糊查询
//data: 数据源（JSON格式）
//key: 需要搜索的字段
//fun: 回调的处理函数

ip.fuzzyQuery = function(data,id,viewModel,gridArea) {
	var dataTable = viewModel.gridData;
	var curGridHead = viewModel.curGridHead;
	var	datas = data.dataDetail;
	var search_text = $("#" + id).val();
    var result = [];
	if (search_text == "") {
		result = datas;
	} else {
	    for (var i = 0; i < datas.length; i++) {
	    	
	    	for (var j = 0; j < curGridHead.length; j++) {
	    		var value = datas[i][curGridHead[j]] + '';
	    		if(value){
	        		if (value.indexOf(search_text) !== -1) {
	                    result.push(datas[i]);
	                    break;
	                }
	        	}
	    	}
	    }
	}
/*	dataTable.pageIndex("0");
	dataTable.pageSize("50");
	var totnum = result.length;
	if (search_text == "") {
		totnum = data.totalElements;
	}
	var pagenum = Math.ceil(totnum / 50);
	result = result.slice(0,49);
	dataTable.setSimpleData(result, {
		unSelect: true
	});
	if(pagenum === 0) {
		pagenum = 1;
	}
	dataTable.totalPages(pagenum);
	dataTable.totalRow(totnum);*/
	dataTable.setSimpleData(result, {
		unSelect: true
	});
	ip.highLightKeyWord(search_text, "red",gridArea);
}
//公共render 渲染code + name
ip.getRenderName = function(obj){
	var html_content;
	if ("agency_name" == obj.gridCompColumn.options.field) {
		if(obj.row.value.agency_code!=null||obj.row.value.agency_code!=undefined){
			html_content = obj.row.value.agency_code+" "+obj.value;
		}else{
			html_content = obj.value;
		}
	}else if ("expeco_name" == obj.gridCompColumn.options.field) {
		if(obj.row.value.expeco_code!=null||obj.row.value.expeco_code!=undefined){
			html_content = obj.row.value.expeco_code+" "+obj.value;
		}else{
			html_content = obj.value;
		}
	}else if ("expfunc_name" == obj.gridCompColumn.options.field) {
		if(obj.row.value.expfunc_code!=null||obj.row.value.expfunc_code!=undefined){
			html_content = obj.row.value.expfunc_code+" "+obj.value;
		}else{
			html_content = obj.value;
		}
	}else if ("gov_expeco_name" == obj.gridCompColumn.options.field) {
		if(obj.row.value.gov_expeco_code!=null||obj.row.value.gov_expeco_code!=undefined){
			html_content = obj.row.value.gov_expeco_code+" "+obj.value;
		}else{
			html_content = obj.value;
		}
	}else {
		html_content = obj.value;
	}
	return html_content;
}

ip.check4Insect = function(data,options){
//是否有违规
if (data.listError != undefined && data.listError != null && data.listError != "") {
	var detail_table_name = data.detail_table_name;
	var wf_id = data.wf_id;
	var current_node_id = data.current_node_id;
	var inspectViewModel = ip.initInspectView(detail_table_name, wf_id, current_node_id, data.listError, options);
	return "本次操作有"+data.normalData.length+"条通过，"+data.listError.length+"条数据违反监控规则！";
}
}
/*
 * 辅助录入树的全部事件 展开和伸缩
 * 
 */
/*ip.isExpanded = true;
ip.trigerExpandTree function(){
	
}
*/
/**
 * 文件上传
 */
ip.uploadFile = function(callback) {
	// var input = '<input type="file" id="_select-file" hidden>'
	var input = document.createElement('input')
	input.type = 'file'
	input.id = '_select-file'
	input.style.display = 'none'
	input.multiple = 'true'
	// input.accept =
	input.onchange = function(e) {
		$('#_select-file').remove()
		var files = [].slice.call(e.target.files, 0)
		if(typeof callback === 'function') {
			callback(files, e)
		}
	}
	document.body.appendChild(input)
	input.click()
}

/*
 * 清空查询视图输入的条件
 * param 查询视图区域的id
 * param 列表视图的刷新回调函数
 */
ip.clearSearchView = function(id, callback){
	$("#"+ id +" input[type='text']").val("");
	$("#"+ id +" input[type='number']").val("");
	$("#"+ id +" input[type='radio']").removeAttr("checked");		
	$("#"+ id +" input[type='checkbox']").removeAttr("checked");
	if($("#"+ id +" select")){
		for( var i = 0; i < $("#"+ id +" select").length ;i++){
			$("#"+ id +" select").get(i).selectedIndex = 0 ;
		}
	}
	$("#"+ id +" [id$='-h']").val("");
	if(typeof callback == "function"){
		callback();
	}
}

/*
 * 等不到 3s手动关掉 信息提示
 */
ip.closeInfoJump = function(){
	$('#info-notice').remove();
}
//处理百分数
ip.matchNumPers = function(obj) {
	var value = obj.value;
	var id = obj.id ;
	if (value == 100) {
		$("#" + id).addClass("text-right");
		this.value = "100.00";
	} else if (value < 100){
		ip.dealThousand(id,value,2);
	} else {
		var current_value = value.toString().substring(2, 4)
		ip.dealThousand(id,value.toString().substring(0, 2),2);
		this.value = parseFloat(obj.value) + current_value/100;
	}
}
//老界面与新界面保持一致
ip.changeStyle = function(areaId,searchAreaId,refreshFun,positionFlag) {
	$(".grid-container").css("height","100%");
	$(".search").css("height","auto");
	if($(".fast-search > div.checkbox.fl").length == 1){
		$(".fast-search > div.checkbox.fl").css("display","none");
		$(".fast-search > div.checkbox.fl").next().css("display","none");
	}
	$(".fast-query").html("");
	$(".btn-default").find("span").prop("class","glyphicon glyphicon-menu-down");
	$("#"+areaId).find("span.input-group-btn > button").on("click",function(){
		if(positionFlag == 1){
			$("#"+areaId).find(".high-search-row").css({"position":"absolute","background":"white","top":"83px","z-index":"1002","border":"1px solid #ccc"});
		} else {
			$("#"+areaId).find(".high-search-row").css({"position":"absolute","background":"white","top":"125px","z-index":"1002","border":"1px solid #ccc"});
		}
		$("#"+areaId).find(".senior-query").click();
	});
	$("#"+areaId).find(".fast-search-row").css({"position":"absolute","margin-right": "0"});
	$("#"+areaId).find(".fast-search-row > div:first").css({"float":"right"});
	$("#"+areaId).find(".fast-search-row > div:first > div:first > input").attr("placeholder","请输入关键字搜索");
	$("#"+areaId).find(".fast-search-row > div:first > div:first").attr("class","input-group col-sm-6");
	$("#"+areaId).find(".fast-search-row > div:first > label").attr("class","col-sm-6 text-right fast-query");
	$(".high-search-row").css({"width":"860px","right":"0","padding":"20px"});
	var operate_html = '<div class="btn-area text-right">' + 
				            '<button type="button" class="btn btn-primary" id="SearchBtn">搜索</button>' + 
				            '<button type="button" class="btn btn-default" id="ClearBtn">清空</button>' + 
				            '<button type="button" class="btn btn-default" id="CancelBtn">取消</button>' + 
				       '</div>';
	$("#" + searchAreaId).parent().append(operate_html);
	$(".high-search-row > .btn-area > .btn").css("margin-right","5px");
	$("#"+areaId).find("#SearchBtn").on("click",function(){
		refreshFun();
	});
	$("#"+areaId).find("#ClearBtn").on("click",function(){
		ip.clearSearchView(searchAreaId,refreshFun);
	});
	$("#"+areaId).find("#CancelBtn").on("click",function(){
		ip.clearSearchView(searchAreaId,refreshFun);
		$("#"+areaId).find(".senior-query").click();
	});
}
ip.dealSpecialCharacterById = function(id,e) {
	var str = $("#" + id).val();
	if(str.length > 200){
		ip.ipInfoJump("您录入内容已经超出最大200字符范围","info");
		var end_str = ip.dealSpecialCharacter(str);
		$("#" + id).val(end_str.substring(0,200));
		return
	}
	var end_str = ip.dealSpecialCharacter(str);
	$("#" + id).val(end_str);
}
//去除特殊字符
ip.dealSpecialCharacter = function (str){  
    if(str.length == 0) return "";
	var s = str;
    var keyWords=RegExp(/[(\ )(“”)(\~)(\!)(\！)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\（)(\）)(\-)(\_)(\+)(\=)(\[)(\])(\{)(\})(\|)(\\)(\;)(\:)(\：)(\')(\")(\,)(\.)(\/)(\<)(\>)(\?)(\)(￥)(……)]+/);      
    if(keyWords.test(str)) {
        ip.ipInfoJump("您输入的有特殊字符","info");
        s = str.replace(/\`/g,"");
        s = s.replace(/\ /g,"");
        s = s.replace(/“”/g,"");
        s = s.replace(/~/g,"");
        s = s.replace(/!/g,"");
        s = s.replace(/！/g,"");
        s = s.replace(/\@/g,"");
        s = s.replace(/#/g,"");
        s = s.replace(/\$/g,"");
        s = s.replace(/%/g,"");
        s = s.replace(/\^/g,"");
        s = s.replace(/&/g,"");
        s = s.replace(/\*/g,"");
        s = s.replace(/\(/g,"");
        s = s.replace(/\)/g,"");
        s = s.replace(/\（/g,"");
        s = s.replace(/\）/g,"");
        s = s.replace(/\-/g,"");
        s = s.replace(/\_/g,"");
        s = s.replace(/\+/g,"");
        s = s.replace(/=/g,"");
        s = s.replace(/\[/g,"");
        s = s.replace(/\]/g,"");
        s = s.replace(/=/g,"");
        s = s.replace(/{/g,"");
        s = s.replace(/}/g,"");
        s = s.replace(/|/g,"");
        s = s.replace(/\\/g,"");
        s = s.replace(/;/g,"");
        s = s.replace(/:/g,"");
        s = s.replace(/：/g,"");
        s = s.replace(/'/g,"");
        s = s.replace(/"/g,"");
        s = s.replace(/,/g,"");
        s = s.replace(/\./g,"");
        s = s.replace(/\//g,"");
        s = s.replace(/</g,"");
        s = s.replace(/>/g,"");
        s = s.replace(/\?/g,"");
        s = s.replace(/￥/g,"");
        s = s.replace(/……/g,"");
    }
    return s;
};
//处理html转义字符
ip.dealHtmlToCharacter = function (str){  
    var s = "";
    if(str.length == 0) return "";
    s = str.replace(/&amp;/g,"&");
    s = s.replace(/&#38;/g,"&");
    s = s.replace(/&lt;/g,"<");
    s = s.replace(/&#60;/g,"<");
    s = s.replace(/&gt;/g,">");
    s = s.replace(/&#62;/g,">");
    s = s.replace(/&nbsp;/g," ");
    s = s.replace(/&#160;/g," ");
    s = s.replace(/&#39;/g,"\'");
    s = s.replace(/&quot;/g,"\"");
	s = s.replace(/&#34;/g,"\"");
	s = s.replace(/&iexcl;/g,"?");
    return s;  
};
ip.dealCharacterToHtml = function (str){  
    var s = "";
    if(str.length == 0) return "";
    s = str.replace(/&/g,"&amp;");
    s = s.replace(/</g,"&lt;");
    s = s.replace(/>/g,"&gt;");
    s = s.replace(/ /g,"&nbsp;");
    s = s.replace(/\'/g,"&#39;");
    s = s.replace(/\"/g,"&quot;");
    s = s.replace(/\?/g,"&iexcl;");
    return s;  
}
//卡号 录入放大
ip.showBigValue = function(id,type,num) {
	$('body').on('focus',"#" + id,function(){
		var value = $("#" + id).val();
		$("#" + id).parent().append('<div class="col-sm-12 big-show" id="big-show"><a class="col-sm-12"></a></div>');
		if(value != "") {
			if(type == 'bankCard'){
				$("#big-show > a").html(ip.dealNumSplit(value,4));
				$("#big-show > a").attr("title",ip.dealNumSplit(value,4));
			} else {
				$("#big-show > a").html(ip.dealNumSplit(value,num));
				$("#big-show > a").attr("title",ip.dealNumSplit(value,num));
			}
		} else {
			$("#big-show > a").html("");
			$("#big-show > a").attr("title","");
		}
	}).on('keyup',"#" + id,function(event){
		if(event.keyCode == 37){
			return true;
		}
		var value = $("#" + id).val();
		if(type == 'bankCard'){
			$("#" + id).val(value.replace(/\D/g,''));
			current_value = ip.dealNumSplit(value,4);
		} else {
			current_value = ip.dealNumSplit(value,num);
		}
		$("#big-show > a").html(current_value);
		$("#big-show > a").attr("title",current_value);
	}).on('blur',"#" + id,function(){
		$("#big-show").remove();
	})
}
ip.dealNumSplit = function(value,n){
	var result = [];
	var data = value.replace(/,/g,"").split("");
	for(var i=0,len=data.length;i<len;i+=n){
	   result.push(data.slice(i,i+n));
	}
	result = result.join(" ").replace(/,/g,"");
	return result;
}
/*
 * 闪动效果
 * id->目标id  fc->闪动的字体的颜色  bg->闪动背景颜色  num -> 闪动次数
 * */
ip.flashFlag = 0;
ip.flashing = function(id,fc,bg,num){
    if(ip.flashFlag == num){
    	ip.flashFlag = 0;
        return;
    }
     var text = $("#" + id);
     if (text.css("color") == "rgb(245, 106, 0)"){
         text.css("color",fc);
         text.css("background",bg);
         ip.flashFlag++ ;
     } else {
         text.css("color","rgb(245, 106, 0)");
         text.css("background","white");
         ip.flashFlag++;
     }
     setTimeout("ip.flashing('" + id + "','" + fc + "','" + bg + "'," + num + ")",500);
 }