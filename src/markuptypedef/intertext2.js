var filterEmptyRange=require("./util").filterEmptyRange;

var getValidSelection=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==2) return null;

	for (var i in sels){
		if (sels[i].length!==1)return null;
	}
	
	return sels;
}
module.exports={getValidSelection:getValidSelection};