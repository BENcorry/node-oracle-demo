require.config({
	baseUrl: "/df/",
	waitSeconds: 0,
	paths: {
		text: "trd/requirejs/text",
		css: "trd/requirejs/css",
		jquery: "trd/jquery/jquery-1.12.3.min",
		jqUi: "trd/jquery-ui/jquery-ui.min",
		ztreeEdit: "trd/jquery/jquery.ztree.exedit",
		ztreeCore: "trd/jquery/jquery.ztree.core",
		ztreeCheck: "trd/jquery/jquery.ztree.excheck",
		bootstrap: 'trd/bootstrap/js/bootstrap',
		knockout: "trd/knockout/knockout-3.2.0.debug",
		uui: "trd/uui/js/u",
		director:"trd/director/director",
		polyFill: "trd/uui/js/u-polyfill",
		tree: "trd/uui/js/u-tree",
		grid: "trd/uui/js/u-grid",
		md5: "trd/md5/js/md5",
		select2: "trd/select2/select2",
		ip:"trd/ip/js/ip",
		dateZH: "trd/datetimepicker/js/bootstrap-datetimepicker",
		// dateZH: "trd/datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN",
		echarts:"trd/echarts/echarts.simple.min",		
		jspdf: "trd/jspdf/jspdf.debug",
		jszip: "trd/jszip/jszip",
		xlsx: "trd/xlsx/xlsx",
	    bolb: "trd/blob/Blob",
		fileSaver: "trd/fileSaver/FileSaver.min",
		dataTableExcel: "trd/dataTableExcel/dataTableExcel",
		HStable:"trd/handsontable/handsontable.full",
		'jquery.file.upload' : "trd/jquery-fileupload/jquery.fileupload",
		'jquery.ui.widget':"trd/jquery-fileupload/jquery.ui.widget",
		'jquery.iframe.transport':"trd/jquery-fileupload/jquery.iframe-transport",
		'tmpl':"trd/jquery-fileupload/tmpl.min",
		calendar: "trd/calendar/simple-calendar",
		alasql:"trd/alasql/alasql",
		layer:"trd/layer/layer",
		lodash:"trd/lodash/lodash",
		store:"trd/store/store.min",
		jqValidate:"trd/jquery-validate/jquery.validate",
		//paycard
		download: "sd/pay/commonModal/download/download",
		downloadBat : "sd/pay/commonModal/downloadBat/downloadBat",
		split : "sd/pay/commonModal/split/split",
		newInput : "sd/pay/commonModal/newInput/newInput",
		paybatchimport:"sd/pay/commonModal/paybatchimport/paybatchimport"
		
	},
	shim: {
		'ip':{
			deps: ["jqUi"]
		},
		'uui':{
			deps: ["jquery","bootstrap","polyFill", "css!trd/uui/css/font-awesome.min.css"]
		},
		'bootstrap': {
			deps: ["jquery"]
		},
		'ztreeEdit':{
			deps: ["jquery"]	
		},
		'ztreeCore':{
			deps: ["jquery"]	
		},
		'ztreeCheck':{
			deps: ["jquery"]	
		},
		'tree': {
			deps: ["uui"]
		},
		'grid': {
			deps: ["uui"]
		},
		'select2': {
			deps: ["css!trd/select2/select2.css"]
		},
		'dateZH': {
			deps: ["bootstrap"]
		},
		// 'dateZH': {
		// 	deps: ["bootstrap","date","css!trd/datetimepicker/css/bootstrap-datetimepicker.min.css"]
		// },
		'jqUi': {
			deps: ["css!trd/jquery-ui/jquery-ui.css"]
		},
		'jquery.file.upload':{
			deps: ["jquery",
			       "jquery.ui.widget",
			       "jquery.iframe.transport",
			       "tmpl",
			       "css!trd/jquery-fileupload/jquery.fileupload.css"
			       ]
		},
		'ip': {
			deps: ["jquery",
			       "jqUi"
			       ]
		},
		'dataTableExcel': {
			deps: ["jszip" ]
		},
		calendar :{
			deps: ["css!trd/calendar/simple-calendar.css",'jquery']
		},
		'layer':{
			deps: ["jquery"]	
		},
		'jqValidate':{
			deps: ["jquery"]	
		},
	}
});
