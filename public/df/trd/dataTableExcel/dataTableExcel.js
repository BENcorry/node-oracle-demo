define(['jquery', 'jszip', 'xlsx','uui', 'ip',  'bolb', 'fileSaver'],
    function ($, ko) {
        var capital = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var digit = [1, 26, 676, 17576];
        var capital_zero = "-0ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        //导出dataTable数据到Excel文件中
        function export2Excel(dataTable, options, fileName) {
            if (!(dataTable instanceof u.DataTable)) {
                ip.ipInfoJump("dataTable参数不正确!", "error");
                return;
            }
            options = options || {};
            options.type = options.type === "select" ? options.type : "all";
            options.fieldMap = (options.fieldMap instanceof Array ? options.fieldMap : []);
            fileName = fileName || "导出文件" + getCurrentDate() + ".xlsx";
            if (fileName.slice(-5).toLowerCase() != '.xlsx') {
                fileName = fileName + ".xlsx";
            }

            var sheet = dtData2Sheet(dataTable, options);
            if (options && typeof options.onBeforeSave == "function") {
                sheet = options.onBeforeSave(sheet) || sheet;
            }
            saveExcelFile(sheet, fileName);
        }

        //以下载文件的方式保存导出的Excel文件
        function saveExcelFile(sheet, fileName) {
            var wb = {
                SheetNames: ['Sheet1'],
                Sheets: {
                    'Sheet1': sheet
                }
            };
            var wopts = {bookType: 'xlsx', bookSST: false, type: 'binary'};
            var wbout = XLSX.write(wb, wopts);

            saveAs(new Blob([s2ab(wbout)], {type: ""}), fileName);
        }

      // 将数据导出为excel, 可以有多级表头
      function export2Excel2(opt) {
        opt = opt || {}
        var fileName = opt.fileName + '.xlsx'
        var sheet = {
          '!merges': [
            // {
            //   s: {r: 0, c: 0},
            //   e: {r: 0, c: 2}
            // },
          ],
          // 'A1': {v: 2124},
          '!ref': 'A1:C1',
        }
        var heads = opt.nestedHeaders
        var data = opt.data

        var maxHeadRow = 0
        // 将表头装入 sheet
        heads.forEach(function(row) {
          row.forEach(function(cell) {
            var colName = index2ColName(cell.col+1)
            sheet[colName+(cell.row+1)] = {v: cell.label} // 数据
            if(cell.rowspan && cell.rowspan > maxHeadRow) {
              maxHeadRow = cell.rowspan
            }
            if(cell.rowspan > 1 || cell.colspan > 1) { // 跨单元格信息
              sheet['!merges'].push({
                s: {r: cell.row, c: cell.col},
                e: {r: cell.row+cell.rowspan-1, c: cell.col+cell.colspan-1}
              })
            }
          })
        })
        data.forEach(function(row, i) {
          row.forEach(function(text, j) {
            var colName = index2ColName(j+1)
            sheet[colName+(i+1+maxHeadRow)] = {v: text}
          })
        })
        sheet['!ref'] = 'A1:'+index2ColName(heads[heads.length-1].length)+(maxHeadRow+data.length)
        saveExcelFile(sheet, fileName)
      }

        //将dataTable中数据转为Sheet数据格式
        function dtData2Sheet(dataTable, options) {
            var rows = (options.type === "select" ? dataTable.getSelectedRows() : dataTable.getAllRows());
            var sheet = {};
            var fields = options.fieldMap;
            var colWidth = [];
            
            for (var h = 0; h < fields.length; h++) {
                if (fields[h] && fields[h].fieldName) {
                	   sheet[index2ColName(h + 1) + "1"] = {"v": (fields[h].title ? fields[h].title : fields[h].fieldName)};
                }
                colWidth.push({
    				wpx: fields[h].field_width || 100
    			});
            }
            for (var r = 0; r < rows.length; r++) {
                for (var c = 0; c < fields.length; c++) {
                    if (fields[c] && fields[c].fieldName) {
                        var v = rows[r].getValue(fields[c].fieldName);
                        if (v) {
                        	if(fields[c].type == "decimal"){
                        		sheet[index2ColName(c + 1) + (r + 2)] = {"v": v,"t": "n", "z": "#,##0.00"};
                        	}else{
                        		sheet[index2ColName(c + 1) + (r + 2)] = {"v": v};
                        	}
                        }
                    }
                }
            }
            sheet["!ref"] = "A1:" + index2ColName(Math.max(fields.length, 1)) + (r + 1);
            sheet["!cols"] = colWidth;
            return sheet;
        }
        
      //导出dataTable数据到Excel文件中--gird
        function exportGridExcel(dataTable, options, fileName) {
            if (!(dataTable instanceof u.DataTable)) {
                ip.ipInfoJump("dataTable参数不正确!", "error");
                return;
            }
            options = options || {};
            options.type = options.type === "select" ? options.type : "all";
            options.fieldMap = (options.fieldMap instanceof Array ? options.fieldMap : []);
            fileName = fileName || "导出文件" + getCurrentDate() + ".xlsx";
            if (fileName.slice(-5).toLowerCase() != '.xlsx') {
                fileName = fileName + ".xlsx";
            }

            var sheet = dtDataGridSheet(dataTable, options, fileName);
            if (options && typeof options.onBeforeSave == "function") {
                sheet = options.onBeforeSave(sheet,options) || sheet;
            }
            saveExcelFile(sheet, fileName);
        }
        //将dataTable中数据转为Sheet数据格式--gird
        function dtDataGridSheet(dataTable, options, fileName) {
        	var sheet = {
    			'!merges': [{
    				s: {
						r: 0,
						c: 0
					},
					e: {
						r: 0,
						c: options.maxHeadCol - 1
					}
    			}],
    			'A1': {
    				v: fileName.replace(".xlsx",""),
    			},
    			'!ref': 'A1:C1',
    		};
    		var maxHeadRow = 0;
    		var maxHeadCol = 0;
    		var headNames = [];
    		var colWidth = [];
    		var rows = (options.type === "select" ? dataTable.getSelectedRows() : dataTable.getAllRows());
    		
    			// 将表头装入 sheet
    		options.fieldMap.forEach(function(cell) {
    			var colName = index2ColName(cell.col + 1);
    			sheet[colName + (cell.row + 1)] = {
    				v: cell.field_name,
    			}; // 数据
    			if (cell.rowspan && cell.rowspan > maxHeadRow) {
    				maxHeadRow = cell.rowspan;
    			}
    			if (cell.headerLevel && cell.headerLevel == 1) {
    				maxHeadCol++;
    				headNames.push({
    					fieldId: cell.field_id,
    					title: cell.field_name
    				});
    			}
    			if (cell.rowspan > 1 || cell.colspan > 1) { // 跨单元格信息
    				sheet['!merges'].push({
    					s: {
    						r: cell.row,
    						c: cell.col
    					},
    					e: {
    						r: cell.row + cell.rowspan - 1,
    						c: cell.col + cell.colspan - 1
    					}
    				});
    			}
    			colWidth.push({
    				wpx: cell.field_width
    			});
    		});
    		//表格数据
    		for (var r = 0; r < rows.length; r++) {
    			for (var c = 0; c < headNames.length; c++) {
    				if (headNames[c] && headNames[c].fieldId) {
    					var v = rows[r].getValue(headNames[c].fieldId);
    					if(v && v.indexOf("@")>-1){
    						var values = v.split("@");
    						v = values[2] + " " + decodeURI(values[1]);
    					}
    					if (v) {
    						sheet[index2ColName(c + 1) + (r + maxHeadRow + 2)] = {
    							"v": v,
    						};
    					}
    				}
    			}
    		}
    		sheet['!ref'] = 'A1:' + index2ColName(maxHeadCol) + (maxHeadRow + rows.length + 1);
    		sheet["!cols"] = colWidth;
    		sheet["!rows"] = [{
				height: 30
			}];
    		sheet.maxHeadRow = maxHeadRow;
    		sheet.maxHeadCol = maxHeadCol;
    		sheet.rowLenght = rows.length;
            return sheet;
        }

        //String转换为ArrayBuffer
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i < s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        }

        //导入Excel文件数据到dataTable对象中
        function importFromExcel(dataTable, options, excelFile) {
            if (!(dataTable instanceof u.DataTable)) {
                ip.ipInfoJump("dataTable参数不正确!", "error");
                return;
            }
            options = options || {};
            options.dataRowIndex = options.dataRowIndex || 1;
            options.isAppend = options.isAppend === false ? false : true;
            options.fieldMap = (options.fieldMap instanceof Array ? options.fieldMap : []);

            if (excelFile instanceof File) {
                var reader = new FileReader();
                reader.onload = fileReaderOnload.bind(reader, dataTable, options);
                reader.readAsBinaryString(excelFile);
            } else {
                selectFile(dataTable, options);
            }
        }

        // 得到excel文件的原始数据, 返回一个二维数组
        function importRawFromExcel(opt) {
          var excelFile = opt.excelFile || null
          if(excelFile instanceof File) {
            var reader = new FileReader()
            reader.onload = fileReaderOnload2.bind(reader, opt)
            reader.readAsBinaryString(excelFile)
          }
          else {
            selectFile2(opt) // 打开文件选择框
          }
        }
        function fileReaderOnload2(opt, event) {
          var data = event ? event.target.result : this.content;
          var workbook = XLSX.read(data, {type: 'binary'});
          // var wbView = workbook.Workbook.WBView[0];
          var sheetNames = workbook.SheetNames;
          var dataSheetIndex = opt.dataSheetIndex || 0
          var activeSheet = workbook.Sheets[sheetNames[dataSheetIndex]];
          var result = []
          if (activeSheet["!ref"]) {
            // console.log(activeSheet['!ref'])
            // console.log(activeSheet)
            var index = ref2Index(activeSheet["!ref"]);
            for(var row = index.start.row ; row <= index.end.row - index.start.row + 1; row++) {
              result.push([])
              for(var col = index.start.col; col <= index.end.col - index.start.col + 1; col++) {
                var cell = activeSheet[index2ColName(col)+row] || null
                result[result.length-1].push(cell ? cell.v : '')
              }
            }
            opt.callback(result) // 执行回调
          } else {
            ip.ipInfoJump("当前活动页签中没有数据！", "info");
          }
        }

        function selectFile2(opt) {
          if ($("#dataTableExcelFileInput__").size() == 0) {
            $("body").after("<input type = 'file' id = 'dataTableExcelFileInput__' style = 'display:none' " +
              "accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel' />");
          } else {
            var fileInput = $("#dataTableExcelFileInput__");
            fileInput.after(fileInput.clone().val(""));
            fileInput.remove();
          }
          $("#dataTableExcelFileInput__").on("change", handleFile2.bind($("#dataTableExcelFileInput__")[0], opt));
          $("#dataTableExcelFileInput__").trigger("click");
        }

      //选择文件改变时触发
      function handleFile2(opt, event) {
        var files = event.target.files;
        if (files[0] instanceof File) {
          opt.excelFile = files[0]
          importRawFromExcel(opt);
        }
      }

        //读取文件内容完成触发事件
        function fileReaderOnload(dt, options, event) {
            var data = event ? event.target.result : this.content;
            var workbook = XLSX.read(data, {type: 'binary'});
            //var wbView = workbook.Workbook.WBView[0];
            var sheetNames = workbook.SheetNames;
            var dataSheetIndex = options.dataSheetIndex || 0
            //var activeSheet = workbook.Sheets[sheetNames[wbView.activeTab]];
            var activeSheet = workbook.Sheets[sheetNames[dataSheetIndex]];
            if (activeSheet["!ref"]) {
                var index = ref2Index(activeSheet["!ref"]);
                if (!(options.isAppend)) {
                    dt.clear();
                }
                for (var row = Math.max(index.start.row, options.dataRowIndex); row <= index.end.row; row++) {
                    var rowObj = dt.createEmptyRow();
                    for (var col = index.start.col; col <= index.end.col; col++) {
                        var cell = activeSheet[index2ColName(col) + row];
                        if (cell && cell.v && options.fieldMap[col - 1]) {
                            rowObj.setValue(options.fieldMap[col - 1], cell.v);
                        }
                    }
                }
                if (options && typeof options.callback == "function") {
                    options.callback();
                }
            } else {
                ip.ipInfoJump("当前活动页签中没有数据！", "info");
            }
        };

        //选择文件
        function selectFile(dataTable, options) {
            if ($("#dataTableExcelFileInput__").size() == 0) {
                $("body").after("<input type = 'file' id = 'dataTableExcelFileInput__' style = 'display:none' " +
                    "accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel' />");
            } else {
                var fileInput = $("#dataTableExcelFileInput__");
                fileInput.after(fileInput.clone().val(""));
                fileInput.remove();
            }
            $("#dataTableExcelFileInput__").on("change", handleFile.bind($("#dataTableExcelFileInput__")[0], dataTable, options));
            $("#dataTableExcelFileInput__").trigger("click");
        }

        //选择文件改变时触发
        function handleFile(dataTable, options, event) {
            var files = event.target.files;
            if (files[0] instanceof File) {
                importFromExcel(dataTable, options, files[0]);
            }
        }

        //ref地址转为index地址，如：A1:B2 转为：
        // 				{ ref:[A1,B2],
        //				  start:{ row:1, col:1},
        //                end: { row:2, col:2}
        //              }
        function ref2Index(ref) {
            var index = {};
            if (ref) {
                index.ref = ref.split(":");
                index.start = cellName2Index(index.ref[0]);
                index.end = cellName2Index(index.ref[1]);
            }
            return index;
        }

        //单元格名称转为index地址,如：B2 转为：{ row:1, col:1, colNameLength: 1}
        function cellName2Index(cellName) {
            var index = {};
            var i = 0;
            while (capital.indexOf(cellName[i]) > -1) {
                i++;
            }
            index.row = parseInt(cellName.substring(i, cellName.length));
            index.colNameLength = i;
            index.col = 0;
            for (; i > 0; i--) {
                index.col += (capital.indexOf(cellName[i - 1]) + 1) * digit[index.colNameLength - i];
            }
            return index;
        }

        //index转为列名，如：28 转为 AB
        function index2ColName(index) {
            var colName = "";
            var j = 0;
            for (var i = digit.length - 1; i >= 0; i--) {
                j = Math.floor(index / digit[i]);
                if (j > 0) {
                    colName += capital[j - 1];
                    index = index % digit[i];
                } else {
                    if (colName.length > 0) {
                        colName += "0"
                    }
                }
            }
            colName = colName.split("");
            for (var x = colName.length - 1; x >= 0; x--) {
                if (colName[x] == "0") {
                    if (colName.join("").substring(0, x).replace(/0/g, "") != "") { //向高位借位处理0
                        colName[x] = "Z";
                        colName[x - 1] = capital_zero[capital_zero.indexOf(colName[x - 1]) - 1];
                    } else {
                        break;
                    }
                } else if (colName[x] == "-") {  //向高位借位，还低位的借位
                    colName[x] = "Y";
                    colName[x - 1] = capital_zero[capital_zero.indexOf(colName[x - 1]) - 1];
                }
            }
            return colName.join("").replace(/0/g, "");
        }

        function getCurrentDate() {
            var d = new Date();
            return "" + d.getFullYear() +
                (d.getMonth() < 9 ? "0" : "") + (d.getMonth() + 1) +
                (d.getDate() < 10 ? "0" : "") + d.getDate() +
                (d.getHours() < 10 ? "0" : "") + d.getHours() +
                (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() +
                (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
        }

        //初始化执行代码,处理IE不支持readAsBinaryString方法。
        if (typeof FileReader !== "undefined" && !FileReader.prototype.readAsBinaryString) {
            FileReader.prototype.readAsBinaryString = function (fileData) {
                var binary = "";
                var pt = this;
                var reader = new FileReader();
                reader.onload = function (e) {
                    var bytes = new Uint8Array(reader.result);
                    var length = bytes.byteLength;
                    for (var i = 0; i < length; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    //pt.result - readonly so assign binary
                    pt.content = binary;
                    $(pt).trigger('onload');
                };
                reader.readAsArrayBuffer(fileData);
            }
        }

        //检测浏览是否是IE9及以下版本
        function isIE9() {
            if (typeof navigator !== "undefined" &&
                /MSIE [1-9]\./.test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }
        }

        //通过ActiveX控件方式导入数据，用于IE9及以下版本，需要安装了Excel才能使用。
        function import_ActiveX(dataTable, options, fileName) {
            if (!(dataTable instanceof u.DataTable)) {
                ip.ipInfoJump("dataTable参数不正确!", "error");
                return;
            }
            options = options || {};
            options.dataRowIndex = options.dataRowIndex || 1;
            options.isAppend = options.isAppend === false ? false : true;
            options.fieldMap = (options.fieldMap instanceof Array ? options.fieldMap : []);

            if (fileName) {
                fileReaderOnload_ActiveX(dataTable, options, fileName);
            } else {
                selectFile_ActiveX(dataTable, options);
            }

        }

        //通过ActiveX控件方式读取Excel文件数据，写入到dataTable中
        function fileReaderOnload_ActiveX(dt, options, fileName) {
            if (!!window.ActiveXObject || "ActiveXObject" in window) {
                var oXL;
                try {
                    oXL = new ActiveXObject("Excel.Application"); //创建AX对象excel
                    //oXL.Visible = true;
                } catch (e) {
                    ip.ipInfoJump("无法启动Excel!\n\n请确认电脑已经安装了Excel并且IE安全级别已调整。\n\n具体操作：\n\n" + "工具 → Internet选项 → 安全 → 自定义级别 → 对没有标记为安全的ActiveX进行初始化和脚本运行 → 启用", "error");
                    return false;
                }
                try {
                    var oWB = oXL.Workbooks.Open(fileName);
                    var oSheet = oWB.ActiveSheet;

                    if (!(options.isAppend)) {
                        dt.clear();
                    }

                    for (var row = Math.max(1, options.dataRowIndex); row <= oSheet.UsedRange.Rows.Count; row++) {
                        var rowObj = dt.createEmptyRow();
                        for (var col = 1; col <= oSheet.UsedRange.Columns.Count; col++) {
                            var cell = oSheet.Cells(row, col);
                            if (cell && cell.value && options.fieldMap[col - 1]) {
                                rowObj.setValue(options.fieldMap[col - 1], cell.value);
                            }
                        }
                    }
                    oWB.Close(false);
                    if (options && typeof options.callback == "function") {
                        options.callback();
                    }
                } finally {
                    oXL.Quit();
                }
            }
        }

        //选择文件
        function selectFile_ActiveX(dataTable, options) {
            if ($("#dataTableExcelFileInput__").size() == 0) {
                $("body").after("<input type = 'file' id = 'dataTableExcelFileInput__' style = 'display:none' " +
                    "accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel' />");
            } else {
                var fileInput = $("#dataTableExcelFileInput__");
                fileInput.after(fileInput.clone().val(""));
                fileInput.remove();
            }
            $("#dataTableExcelFileInput__").on("change", handleFile_ActiveX.bind($("#dataTableExcelFileInput__")[0], dataTable, options));
            $("#dataTableExcelFileInput__").trigger("click");
        }

        //选择文件改变时触发
        function handleFile_ActiveX(dataTable, options, event) {
            var fileName = event.target.value;
            if (fileName) {
                import_ActiveX(dataTable, options, fileName);
            }
        }

        //通过ActiveX控件方式导出数据，用于IE9及以下版本，需要安装了Excel才能使用。
        function export_ActiveX(dataTable, options, fileName) {
            if (!(dataTable instanceof u.DataTable)) {
                ip.ipInfoJump("dataTable参数不正确!", "error");
                return;
            }
            options = options || {};
            options.type = options.type === "select" ? options.type : "all";
            options.fieldMap = (options.fieldMap instanceof Array ? options.fieldMap : []);
            fileName = fileName || "导出文件" + getCurrentDate() + ".xlsx";
            if (fileName.slice(-5).toLowerCase() != '.xlsx') {
                fileName = fileName + ".xlsx";
            }
            var sheet = dtData2Sheet_ActiveX(dataTable, options, fileName);
        }

       //通过ActiveX控件方式将数据写入Excel文件中
        function dtData2Sheet_ActiveX(dataTable, options, fileName) {
            if (!!window.ActiveXObject || "ActiveXObject" in window) {
                var oXL;
                try {
                    oXL = new ActiveXObject("Excel.Application"); //创建AX对象excel
                    //oXL.Visible = true;
                } catch (e) {
                    ip.ipInfoJump("无法启动Excel!\n\n请确认电脑已经安装了Excel并且IE安全级别已调整。\n\n具体操作：\n\n" + "工具 → Internet选项 → 安全 → 自定义级别 → 对没有标记为安全的ActiveX进行初始化和脚本运行 → 启用", "error");
                    return false;
                }
                try {
                    var oWB = oXL.Workbooks.Add();
                    var oSheet = oWB.ActiveSheet;

                    var rows = (options.type === "select" ? dataTable.getSelectedRows() : dataTable.getAllRows());
                    var fields = options.fieldMap;
                    for (var h = 0; h < fields.length; h++) {
                        if (fields[h] && fields[h].fieldName) {
                            oSheet.Cells(1, h + 1).value = fields[h].title ? fields[h].title : fields[h].fieldName;
                        }
                    }
                    for (var r = 0; r < rows.length; r++) {
                        for (var c = 0; c < fields.length; c++) {
                            if (fields[c] && fields[c].fieldName) {
                                var v = rows[r].getValue(fields[c].fieldName);
                                if (v) {
                                    oSheet.Cells(r + 2, c + 1).value = v;
                                }
                            }
                        }
                    }

                    oXL.FileDialog(2).InitialFileName = fileName;
                    if (oXL.FileDialog(2).Show() != 0 && oXL.FileDialog(2).SelectedItems.Count > 0) {
                        oWB.SaveAs(oXL.FileDialog(2).SelectedItems.Item(1));
                    }
                    oWB.Close(false);
                } finally {
                    oXL.Quit();
                }
            }


        }

        return {
            'importFromExcel': isIE9() ? import_ActiveX : importFromExcel,
            'export2Excel': isIE9() ? export_ActiveX : export2Excel,
            'importRawFromExcel': importRawFromExcel,
            'exportNestedTable2Excel': export2Excel2,
            'exportGridExcel':exportGridExcel
        };
    });