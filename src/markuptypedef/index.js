var simple=require("./simple");
var intertext=require("./intertext");
var intertext2=require("./intertext2"); //two view, one range per view
var two=require("./two");
var twomore=require("./twomore");
var types={
	"重點":{typedef:simple}
	,"詞性":{typedef:simple}
	,"互文":{typedef:intertext}
	,"出處":{typedef:intertext2}
  ,"能指":{typedef:two}
  ,"因果":{typedef:two}
  ,"同義":{typedef:twomore}
}

var getAvailableType=function(selections) {
	var out=[];
	for (var i in types) {
		if (types[i].typedef.getValidSelection(selections)){
			out.push(i);
		}
	}
	return out;
}
module.exports={getAvailableType:getAvailableType, types:types};