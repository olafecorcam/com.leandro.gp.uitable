sap.designstudio.sdk.Component
		.subclass("com.leandro.gp.uitable.uitable", function() {

			var data = null;
			var dados = null;
			var that = this;

			var numCols = 0;
			var numRows = 0;
			var numColTuples = 0;
			var numRowTuples = 0;
			var numColsOfData = 0;
			var numRowsOfData = 0;

			var arrColspan = [];
			var arrRowspan = [];
			var arrText = [];
			var arrType = [];
			this.dataResultSet = function(value) {
				if (value === undefined) {
					return data;
				} else {
					data = value;
					return this;
				}
			};
			this.init = function() {
			};

			this.afterUpdate = function() {
				if (data) {
					computeTableLayout();

					arrColspan = newArray(numCols, numRows);
					arrRowspan = newArray(numCols, numRows);
					arrText = newArray(numCols, numRows);
					dados = new Array(numRows);
					arrType = newArray(numCols, numRows);

					applyTopLeftCorner();
					applyColumnHeaders();
					applyRowHeaders();
					applyData();
					hierqueriza();
				}
			};
			var objMedidas = new Array(numRowsOfData);
			function hierqueriza() {
				//here is where the magic happens
				for ( var i = arrText.length - 1; i >= 0; i--) {

				// first a create a single object to hold all the measures
				// So o check if the bottom array of data belongs to the measure part of the result
				if ((arrText.length - 1) - i < numColsOfData) {
					var medidas = arrText[i];

					for ( var m = 1; m < medidas.length; m++) {
						if (!objMedidas[m])
							objMedidas[m] = new Object();
						objMedidas[m][medidas[0]] = medidas[m];
					}
					//since the measure group will always
					//have the lenght of the entire resultset, theres no need to run through the
					//rest of the code
					continue;
				}

				var firstLine = arrText[i];
				var ultimo = 0;
				var arrTemp = new Array(numRowsOfData);
				for ( var z = 1; z < firstLine.length; z++) {

					if (firstLine[z]) {
						// here i check if its the first guy after the measures
						// since i need to do a little more magic
						if ((i + numColsOfData + 1) == arrText.length) {
							objMedidas[z].texto = firstLine[z];
							dados[z] = objMedidas[z];
							continue;
						} else { //here is the code that inserts the next guy
							var temp = new Object();
							temp.texto = firstLine[z];
							arrTemp[z] = temp;
						}
						ultimo = z;
					}
					if (firstLine.length >= z + 1
							&& (firstLine[z + 1] || z == firstLine.length - 1)) {
						var proximo = findNext(firstLine, z);
						var atual = ultimo;
						//se o item tem apenas um filho, aqui ele pega apenas ele e n�o faz o while
						if(ultimo == proximo)
							arrTemp[atual][ultimo] = objMedidas[ultimo];
						else{
							while (ultimo < proximo) {
								arrTemp[atual][ultimo] = objMedidas[ultimo];
								ultimo++;
							}
						}
						
					}
		}
		if (arrTemp[1])
			objMedidas = arrTemp;
	}
}
;
function hierqueriza2() {
	for ( var i = 0; i < arrText.length - numColsOfData; i++) {

		var firstLine = arrText[i];
		var ultimo = 0;
		for ( var z = 0; z < firstLine.length; z++) {

			if (firstLine[z]) {
				var temp = new Object();
				temp.valor = firstLine[z];
				dados[z] = temp;
				ultimo = z;

			}
			if (z == 0)
				continue;
			if (firstLine.length >= z + 1 && firstLine[z + 1]) {
				var proximo = findNext(firstLine, z);
				var atual = ultimo;
				while (ultimo < proximo) {
					if (!dados[atual])
						dados[atual] = new Object();

					dados[atual][ultimo] = arrText[i + 1][ultimo];
					ultimo++;
				}
			}
		}
	}
}
;
function findNext(arrayText, start) {
	var temp = start;
	for ( var i = start; i < arrayText.length; i++) {
		if (arrayText[i])
			return i;
		else
			temp++;
	}
	return temp;

}
function teste(agoraVai, nivel) {

}
function computeTableLayout() {
	var colAxis = data.axis_columns;
	numColsOfData = colAxis.length;

	var rowAxis = data.axis_rows;
	numRowsOfData = rowAxis.length;

	numColTuples = 0;
	var sampleColAxisTuple = colAxis[0];
	for ( var i = 0; i < sampleColAxisTuple.length; i++) {
		if (sampleColAxisTuple[i] > -1) {
			numColTuples++;
		}
	}
	numRowTuples = sampleColAxisTuple.length - numColTuples;

	numCols = numRowTuples + numColsOfData;
	numRows = numColTuples + numRowsOfData;
}

function newArray(x, y) {
	var array = new Array(x);
	for ( var i = 0; i < x; i++) {
		array[i] = new Array(y);
	}
	return array;
}

function applyTopLeftCorner() {
	markSpannedCellRectangle(0, 0, numRowTuples, numColTuples);

	arrColspan[0][0] = numRowTuples;
	arrRowspan[0][0] = numColTuples;
	arrText[0][0] = "";
	arrType[0][0] = "topleft";
}

function markSpannedCellRectangle(arrCol, arrRow, colspan, rowspan) {
	for ( var i = arrRow; i < arrRow + rowspan; i++) {
		for ( var j = arrCol; j < arrCol + colspan; j++) {
			arrColspan[j][i] = -1;
			arrRowspan[j][i] = -1;
		}
	}
}

function isCellHiddenBySpan(arrCol, arrRow) {
	var colspan = arrColspan[arrCol][arrRow];
	if (colspan == -1) {
		return true;
	}
	var rowspan = arrRowspan[arrCol][arrRow];
	if (rowspan == -1) {
		return true;
	}
	return false;
}

function getHeaderText(member) {
	var text = "";
	var level = member.level;
	if (level) {
		for ( var i = 0; i < level; i++) {
			text += "&nbsp;&nbsp;";
		}
		var styleClass = "";
		var nodeState = member.nodeState;
		if (nodeState) {
			styleClass = (nodeState === "EXPANDED") ? CSS_CLASS_COLLAPSE_NODE
					: CSS_CLASS_EXPAND_NODE;
		}
		text += "<span style=\"display: inline-block; vertical-align: middle\" class=\""
				+ CSS_CLASS_HIERARCHY + " " + styleClass + "\"></span>";
		text += "&nbsp;" + member.text;
	} else {
		text = member.text;
	}
	return text;
}

function applyColumnHeaders() {
	var OFFSET_COLS = numRowTuples;
	for ( var row = 0; row < numColTuples; row++) {
		for ( var col = 0; col < numColsOfData; col++) {
			if (isCellHiddenBySpan(OFFSET_COLS + col, row) == false) {
				var colspan = computeColHeaderColspan(col, row);
				var rowspan = computeColHeaderRowspan(col, row);
				markSpannedCellRectangle(OFFSET_COLS + col, row, colspan,
						rowspan);

				var colMember = data.dimensions[row].members[data.axis_columns[col][row]];
				var text = getHeaderText(colMember);
				var type = colMember.type;
				arrColspan[OFFSET_COLS + col][row] = colspan;
				arrRowspan[OFFSET_COLS + col][row] = rowspan;
				arrText[OFFSET_COLS + col][row] = text;
				arrType[OFFSET_COLS + col][row] = (type == "RESULT") ? "header-bold"
						: "header";

				col += colspan - 1;
			}
		}
	}
}

function computeColHeaderColspan(col, row) {
	var colspan = 1;
	var index = data.axis_columns[col][row];
	for ( var i = col + 1; i < data.axis_columns.length; i++) {
		var nextIndex = data.axis_columns[i][row];
		if (index == nextIndex) {
			// end colspan if "parent" tuples of next column
			// are not the same
			for ( var j = 0; j < row; j++) {
				var parentIndex = data.axis_columns[col][j];
				var parentIndexToCompare = data.axis_columns[i][j];
				if (parentIndex != parentIndexToCompare) {
					return colspan;
				}
			}
			colspan++;
		} else {
			break;
		}
	}
	return colspan;
}

function computeColHeaderRowspan(col, row) {
	var rowspan = 1;
	var colMember = data.dimensions[row].members[data.axis_columns[col][row]];
	if (colMember.type == "RESULT") {
		for ( var i = row + 1; i < numColTuples; i++) {
			var colMemberToCompare = data.dimensions[i].members[data.axis_columns[col][i]];
			if (colMemberToCompare.type == "RESULT") {
				rowspan++;
			} else {
				break;
			}
		}
	}
	return rowspan;
}

function applyRowHeaders() {
	var DIM_OFFSET = numColTuples;
	var OFFSET_ROWS = numColTuples;
	for ( var col = 0; col < numRowTuples; col++) {
		for ( var row = 0; row < numRowsOfData; row++) {
			if (isCellHiddenBySpan(col, OFFSET_ROWS + row) == false) {
				var colspan = computeRowHeaderColspan(col, row);
				var rowspan = computeRowHeaderRowspan(col, row);
				markSpannedCellRectangle(col, OFFSET_ROWS + row, colspan,
						rowspan);

				var rowMember = data.dimensions[DIM_OFFSET + col].members[data.axis_rows[row][DIM_OFFSET
						+ col]];
				var text = getHeaderText(rowMember);
				var type = rowMember.type;

				arrColspan[col][OFFSET_ROWS + row] = colspan;
				arrRowspan[col][OFFSET_ROWS + row] = rowspan;
				arrText[col][OFFSET_ROWS + row] = text;
				arrType[col][OFFSET_ROWS + row] = (type == "RESULT") ? "header-bold"
						: "header";

				row += rowspan - 1;
			}
		}
	}
}

function computeRowHeaderRowspan(col, row) {
	var DIM_OFFSET = numColTuples;
	var rowspan = 1;
	var index = data.axis_rows[row][DIM_OFFSET + col];
	for ( var i = row + 1; i < data.axis_rows.length; i++) {
		var nextIndex = data.axis_rows[i][DIM_OFFSET + col];
		if (index == nextIndex) {
			// end rowspan if "parent" tuples of next row
			// are not the same
			for ( var j = 0; j < col; j++) {
				var parentIndex = data.axis_rows[row][DIM_OFFSET + j];
				var nextParentIndex = data.axis_rows[i][DIM_OFFSET + j];
				if (parentIndex != nextParentIndex) {
					return rowspan;
				}
			}
			rowspan++;
		} else {
			break;
		}
	}
	return rowspan;
}

function computeRowHeaderColspan(col, row) {
	var DIM_OFFSET = numColTuples;
	var colspan = 1;
	var rowMember = data.dimensions[DIM_OFFSET + col].members[data.axis_rows[row][DIM_OFFSET
			+ col]];
	if (rowMember.type == "RESULT") {
		for ( var i = col + 1; i < numRowTuples; i++) {
			var rowMemberToCompare = data.dimensions[DIM_OFFSET + i].members[data.axis_rows[row][DIM_OFFSET
					+ i]];
			if (rowMemberToCompare.type == "RESULT") {
				colspan++;
			} else {
				break;
			}
		}
	}
	return colspan;
}

function formatValue(value, tuple) {
	/*
	 * if (value === null) { return ""; }
	 * 
	 * for ( var i = 0; i < data.dimensions.length; i++) { var strFormat =
	 * data.dimensions[i].members[tuple[i]].formatString; if (strFormat) {
	 * sap.common.globalization.NumericFormatManager .setPVL(data.locale);
	 * return sap.common.globalization.NumericFormatManager .format(value,
	 * strFormat); } }
	 */
	return value;
}

function applyData() {
	var OFFSET_COLS = numRowTuples;
	var OFFSET_ROWS = numColTuples;
	var dataIndex = 0;
	for ( var row = 0; row < numRowsOfData; row++) {
		for ( var col = 0; col < numColsOfData; col++) {
			arrColspan[OFFSET_COLS + col][OFFSET_ROWS + row] = 1;
			arrRowspan[OFFSET_COLS + col][OFFSET_ROWS + row] = 1;
			arrText[OFFSET_COLS + col][OFFSET_ROWS + row] = formatValue(
					data.data[dataIndex], data.tuples[dataIndex]);
			arrType[OFFSET_COLS + col][OFFSET_ROWS + row] = computeTypeOfData(
					col, row);
			dataIndex++;
		}
	}
}

function computeTypeOfData(col, row) {
	if (isResultData(col, row)) {
		return (row % 2 == 0) ? "data-bold-even" : "data-bold-odd";
	}
	return (row % 2 == 0) ? "data-even" : "data-odd";
}

function isResultData(col, row) {
	var colTuple = data.axis_columns[col];
	for ( var i = 0; i < numColTuples; i++) {
		var colMember = data.dimensions[i].members[colTuple[i]];
		if (colMember.type == "RESULT") {
			return true;
		}
	}
	var DIM_OFFSET = numColTuples;
	var rowTuple = data.axis_rows[row];
	for ( var i = 0; i < numRowTuples; i++) {
		var rowMember = data.dimensions[DIM_OFFSET + i].members[rowTuple[DIM_OFFSET
				+ i]];
		if (rowMember.type == "RESULT") {
			return true;
		}
	}
	return false;
}

}		);