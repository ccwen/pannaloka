var vs=require("./validateselection");
var mark=require("./mark");
var docfilestore=require("../stores/docfile");
var markupstore=require("../stores/markup");

var isIntertextDeletable=function(markup) {
	var file=markup.source[0];
	return !!docfilestore.docOf(file);
}

var deletIntertext=function(markup) {
	markupstore.removeByMid(markup.source[1],markup.source[0]);
}


var types={
	"milestone":{validate:vs.milestone,label:"界石",editor:require("./simple"), mark:mark.milestone,hidden:true}

	,"important":{validate:vs.singleone,label:"重點",
							editor:require("./simple"), mark:mark.singleone}
	,"title":{validate:vs.singleone,label:"大標",editor:require("./simple"),mark:mark.singleone}
	,"title2":{validate:vs.singleone,label:"中標",editor:require("./simple"),mark:mark.singleone}
	,"title3":{validate:vs.singleone,label:"小標",editor:require("./simple"),mark:mark.singleone}	
	,"dictionary":{validate:vs.singleone,label:"字典"}
	,"partofspeech":{validate:vs.singleone,label:"詞性"}
	,"intertext":{validate:vs.multi,label:"互文", mark:mark.dualone, editor:require("./quote"),
						isDeletable: isIntertextDeletable,onDelete:deletIntertext}
	,"quote":{validate:vs.dualone,label:"出處", mark:mark.oneway, editor:require("./quote")}
  ,"signifer":{validate:vs.singletwo,label:"能指"}
  ,"causeeffect":{validate:vs.singletwo,label:"因果",mark:mark.singletwo,editor:require("./simple")}
  ,"synonym":{validate:vs.singletwomore,label:"同義",mark:mark.singletwo,editor:require("./simple")}
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