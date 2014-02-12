sap.designstudio.sdk.Component
		.subclass(
				"com.leandro.gp.uitable.uitable",
				function() {
					var that = this;
					var saveDataResultSet = null;

					this.dataResultSet = function(value) {
						if (value === undefined) {
							return saveDataResultSet;
						} else {
							saveDataResultSet = value;
							return this;
						}
					};
					
					


					this.init = function() {
						// _isRepaint = "OK";
					};

					this.afterUpdate = function() {
						this.tableToExcel = (function() {
							var uri = 'data:application/vnd.ms-excel;base64,', template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>', base64 = function(
									s) {
								return window
										.btoa(unescape(encodeURIComponent(s)));
							}, format = function(s, c) {
								return s.replace(/{(\w+)}/g, function(m, p) {
									return c[p];
								});
							};
							return function(table, name) {
								if (!table.nodeType)
									table = document.getElementById(table);
								var ctx = {
									worksheet : name || 'Worksheet',
									table : table.innerHTML
								};
								window.location.href = uri
										+ base64(format(template, ctx));
							};
						})();

						this.getDimension = function() {
							if (saveDataResultSet != undefined
									|| saveDataResultSet != null)
								return saveDataResultSet.dimensions[1].text;
							else
								return "ERROR";
						};

						this.getMeasure = function() {
							if (saveDataResultSet != undefined
									|| saveDataResultSet != null)
								return saveDataResultSet.dimensions[0].members[0].text;
							else
								return "ERROR";
						};

						this.getMembers = function() {
							if (saveDataResultSet != undefined
									|| saveDataResultSet != null)
								return saveDataResultSet.dimensions[1].members;
							else
								return "ERROR";
						};

						this.getDados = function() {
							if (saveDataResultSet != undefined
									|| saveDataResultSet != null)
								return saveDataResultSet.data;
							else
								return "ERROR";
						};
						this.getData = function() {
							if (saveDataResultSet == undefined
									|| saveDataResultSet == null || saveDataResultSet == "")
								return;
								
							var tuples = saveDataResultSet.tuples;
							var dimensions = saveDataResultSet.dimensions;
							var data = saveDataResultSet.data;
							var oData = {
								root : {
									name : "root",
									description : "root description",
									checked : false,
									0 : {}
								}
							};
							for ( var i = 0; i < tuples.length; i++) {
								var obj = new Object();
								var tuple = tuples[i];
								for ( var z = 0; z < tuple.length; z++) {
									obj["chave"] = dimensions[z].members[tuple[z]].key;
									obj["texto"] = dimensions[z].members[tuple[z]].text;
								}
								obj.valor = data[i];
								obj.checked = true;
								oData.root[i] = obj;
							}
							var testao= null;
							var contador = 0;
							var teste = function(obj){
								var ultimo = "";
								
								for ( var tst in obj) {
									try{
										var temp = parseInt(tst);
										if(isNaN(temp))
											return
									}catch(e){
									   return;
									}
									if(obj[tst].chave != ultimo){
										ultimo = obj[tst].chave; 
										obj[contador] = obj[tst];
										
										if(contador > 10)
											return
										contador++;	
										teste(obj[tst]);
										
									}
									
									
								}
							};
							teste(oData.root);
							var columns = new Array();
							
							for ( var c = 0; c < dimensions.length; c++) {
								if(c == 0){
									for ( var m = 0; m < dimensions[c].members.length; m++) {
										columns.push(new sap.ui.table.Column( {
											label : dimensions[c].members[m].text,
											template : dimensions[c].members[m].chave
										}));
									}
								}else{
									columns.push(new sap.ui.table.Column( {
										label : dimensions[c].text,
										template : dimensions[c].chave
									}));
								}
								
							}
							

							// Create an instance of the table control
							var oTable = new sap.ui.table.TreeTable(
									{
										columns : columns,
										visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
										selectionMode : sap.ui.table.SelectionMode.Single,
										allowColumnReordering : true,
										expandFirstLevel : true,
										toggleOpenState : function(oEvent) {
											var iRowIndex = oEvent
													.getParameter("rowIndex");
											var oRowContext = oEvent
													.getParameter("rowContext");
											var bExpanded = oEvent
													.getParameter("expanded");
											alert("rowIndex: " + iRowIndex
													+ " - rowContext: "
													+ oRowContext.getPath()
													+ " - expanded? "
													+ bExpanded);
										}
									});

							// Create a model and bind the table rows to this
							// model
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData);
							oTable.setModel(oModel);
							oTable.bindRows("/root");
							
							oTable.placeAt(this.$());

						};
						var teste = this.getData();

					};

				});