var vs=require("./validateselection");
var mark=require("./mark");
var docfilestore=require("../stores/docfile");
var markupstore=require("../stores/markup");




var types={
	"milestone":{validate:vs.milestone,label:"界石",editor:require("./simple"), mark:mark.milestone,hidden:true}

	,"important":{validate:vs.singleone,label:"重點",
							editor:require("./simple"), mark:mark.singleone}
	,"title":{validate:vs.singleone,label:"大標",editor:require("./simple"),mark:mark.singleone}
	,"title2":{validate:vs.singleone,label:"中標",editor:require("./simple"),mark:mark.singleone}
	,"title3":{validate:vs.singleone,label:"小標",editor:require("./simple"),mark:mark.singleone}	
	,"dictionary":{validate:vs.singleone,label:"字典"}
	,"partofspeech":{validate:vs.singleone,label:"詞性"}
	,"intertext":{validate:vs.multi,label:"互文", mark:mark.dualone}
	,"quote":{validate:vs.dualone,label:"出處", mark:mark.oneway, editor:require("./quote")}
  ,"signifer":{validate:vs.singletwo,label:"能指"}
  ,"causeeffect":{validate:vs.singletwo,label:"因果"}
  ,"synonym":{validate:vs.singletwomore,label:"同義"}
}

var getAvailableType=function(selections) {
	var out=[];
	for (var i in types) {
		if (types[i].validate(selections) && !types[i].hidden){
			out.push(i);
		}
	}
	return out;
}
module.exports={getAvailableType:getAvailableType, types:types, milestone_novalidate:mark.milestone_novalidate};