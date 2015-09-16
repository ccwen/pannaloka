var simple=require("./simple");
var intertext=require("./intertext");
var intertext2=require("./intertext2"); //two view, one range per view
var two=require("./two");
var twomore=require("./twomore");
var types={
	"important":{typedef:simple,label:"重點"}
	,"title":{typedef:simple,label:"標題"}
	,"dictionary":{typedef:simple,label:"字典"}
	,"partofspeech":{typedef:simple,label:"詞性"}
	,"intertext":{typedef:intertext,label:"互文"}
	,"quote":{typedef:intertext2,label:"出處"}
  ,"signifer":{typedef:two,label:"能指"}
  ,"causeeffect":{typedef:two,label:"因果"}
  ,"synonym":{typedef:twomore,label:"同義"}
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