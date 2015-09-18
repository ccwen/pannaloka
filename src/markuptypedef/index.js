var vs=require("./validateselection");
var wm=require("./writemarkup");

var types={
	"important":{validate:vs.singleone,label:"重點",
							editor:require("./simple"), write:wm.singleone}
	,"title":{validate:vs.singleone,label:"標題"}
	,"dictionary":{validate:vs.singleone,label:"字典"}
	,"partofspeech":{validate:vs.singleone,label:"詞性"}
	,"intertext":{validate:vs.multi,label:"互文"}
	,"quote":{validate:vs.dualone,label:"出處"}
  ,"signifer":{validate:vs.singletwo,label:"能指"}
  ,"causeeffect":{validate:vs.singletwo,label:"因果"}
  ,"synonym":{validate:vs.singletwomore,label:"同義"}
}

var getAvailableType=function(selections) {
	var out=[];
	for (var i in types) {
		if (types[i].validate(selections)){
			out.push(i);
		}
	}
	return out;
}
module.exports={getAvailableType:getAvailableType, types:types};