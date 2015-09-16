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
module.exports={filterEmptyRange:filterEmptyRange};