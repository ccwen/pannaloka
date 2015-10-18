var vs=require("./validateselection");
var vsmilestone=require("./validatemilestone");
var mark=require("./mark");
var docfilestore=require("../stores/docfile");
var markupstore=require("../stores/markup");

var isIntertextDeletable=function(markup) {
	var file=markup.target[0];
	if (Array.isArray(file)) {
		for (var i in markup.target) {
			var m=markup.target[i];
			if (!docfilestore.docOf(m[0]))return false;
		}
		return true;
	} else {
		return !!docfilestore.docOf(file);	
	}
}

var deletIntertext=function(markup) {

	var file=markup.target[0];
	if (Array.isArray(markup.target[0])) {
		for (var i in markup.target) {
			var m=markup.target[i];
			markupstore.removeByMid(m[1],m[0]);
		}
	} else {
		markupstore.removeByMid(markup.target[1],markup.target[0]);
	}
}


var types={

	"important":{validate:vs.singleone,label:"重點",
							editor:require("./simple"), mark:mark.singleone}
	,"title":{validate:vs.singleone,label:"大標",editor:require("./simple"),mark:mark.singleone}
	,"title2":{validate:vs.singleone,label:"中標",editor:require("./simple"),mark:mark.singleone}
	,"title3":{validate:vs.singleone,label:"小標",editor:require("./simple"),mark:mark.singleone}	
	,"dictionary":{validate:vs.singleone,label:"字典"}
	,"partofspeech":{validate:vs.singleone,label:"詞性"}
	,"intertext":{validate:vs.multi,label:"互文", mark:mark.dualone, editor:require("./quote"),
						isDeletable: isIntertextDeletable,onDelete:deletIntertext}
	,"quote":{validate:vs.dualone,label:"出處", mark:mark.oneway, editor:require("./quote")}
  ,"causeeffect":{validate:vs.singletwo,label:"因果",mark:mark.singletwo,editor:require("./simple")}
  ,"part":{validate:vs.singletwomore,label:"部份",mark:mark.singletwo,editor:require("./simple")}
  ,"individual":{validate:vs.singletwomore,label:"總別",mark:mark.singletwo,editor:require("./simple")}
  ,"synonym":{validate:vs.singletwomore,label:"同義",mark:mark.singletwo,editor:require("./simple")}
  ,"signifier":{validate:vs.singletwo,label:"能所",mark:mark.singletwo,editor:require("./simple")}
  ,"extsignifier":{validate:vs.dualone,label:"能所",mark:mark.dualone,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}
	,"milestone":{validate:vsmilestone.milestone,label:"界石",editor:require("./simple"), mark:mark.milestone}
	,"explaination":{validate:vs.singletwomore,label:"說明",mark:mark.singletwo,editor:require("./simple")}
	,"definition":{validate:vs.singletwomore,label:"內釋",mark:mark.singletwo,editor:require("./simple")}
	,"extdefinition":{validate:vs.dualonemore,label:"外釋",mark:mark.dualonemore,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}
	,"causeeffect2":{label:"因：",hidden:true}
	,"intertext2":{label:"互文：",hidden:true}
	,"part2":{label:"部份：",hidden:true}
	,"signifier2":{label:"能指：",hidden:true}
	,"synonym2":{label:"本詞",hidden:true}
  ,"definition2"	:{label:"所定義的名相：",hidden:true}
  ,"extdefinition2"	:{label:"所定義的名相：",hidden:true}
  ,"explaination2"	:{label:"所說明的名相：",hidden:true}
  ,"extsignifier2"	:{label:"能指：",hidden:true}
  ,"individual2":{label:"總相：",hidden:true}
}

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