var vs=require("./validateselection");
var mark=require("./mark");
var docfilestore=require("../stores/docfile");
var markupstore=require("../stores/markup");
var alwaysDeletable=function(){
	return true
};

var isQuoteDeletable=function(markup) {
	var file=markup.source[0];
	return !!docfilestore.docOf(file);
}

var deleteQuote=function(markup) {
	markupstore.removeByMid(markup.source[1],markup.source[0]);
}

var types={
	"important":{validate:vs.singleone,label:"重點",
							editor:require("./simple"), mark:mark.singleone, isDeletable:alwaysDeletable}
	,"title":{validate:vs.singleone,label:"標題"}
	,"dictionary":{validate:vs.singleone,label:"字典"}
	,"partofspeech":{validate:vs.singleone,label:"詞性"}
	,"intertext":{validate:vs.multi,label:"互文", mark:mark.dualone}
	,"quote":{validate:vs.dualone,label:"出處", mark:mark.dualone, 
					editor:require("./quote"),isDeletable: isQuoteDeletable,onDelete:deleteQuote}
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