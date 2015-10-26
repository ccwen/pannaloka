var mark=require("./mark");
var types=require("./types").types;

var getAvailableType=function(selections) {
	var out=[];
	for (var i in types) {
		if (types[i].validate && types[i].validate(selections) && !types[i].hidden){
			out.push(i);
		}
	}
	return out;
}


module.exports={getAvailableType:getAvailableType, types:types,  
	milestone_novalidate:mark.milestone_novalidate};