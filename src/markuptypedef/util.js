var filterEmptyRange=function(selections) {
	var out={};
	for (var i in selections){
		if (selections[i].length==0) continue;

		var sels=[];
		for (var j in selections[i]) {
			var sel=selections[i][j];
			if (sel.length>1) sels.push(sel);
		}
		if (sels.length) out[i]=sels;
	}
	return out;
}

var getRangeText=function(doc,r) {
	var from={line:r[0][1],ch:r[0][0]},to={line:r[1][1],ch:r[1][0]};
	return doc.getRange(from,to);
}
module.exports={filterEmptyRange:filterEmptyRange,getRangeText};