var filterEmptyRange=require("./util").filterEmptyRange;

var getValidSelection=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length!==2) return null;

	return sels;
}
module.exports={getValidSelection:getValidSelection};