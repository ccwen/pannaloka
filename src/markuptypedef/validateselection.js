var filterEmptyRange=require("./util").filterEmptyRange;

var singleone=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length!==1) return null;

	return sels;
}


var singletwo=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length!==2) return null;

	return sels;
}
var singletwomore=function(selections) { //one view, more than 2 ranges
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length<2) return null;

	return sels;
}
var dualone=function(selections) { //two views, each has only one range
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==2) return null;

	for (var i in sels){
		if (sels[i].length!==1)return null;
	}
	
	return sels;
}

var dualonemore=function(selections) { //two views, first view has one range, second has one or more range
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==2) return null;
	
	if (sels[keys[0]].length!==1) return null; //

	return sels;
}

var multi=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length<2) return null;
	
	return sels;
}
module.exports={singleone:singleone,singletwo:singletwo,dualonemore:dualonemore,
	singletwomore:singletwomore,dualone:dualone,multi:multi};