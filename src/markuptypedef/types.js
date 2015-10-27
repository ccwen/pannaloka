var vs=require("./validateselection");
var vsmilestone=require("./validatemilestone");
var docfilestore=require("../stores/docfile");
var markupstore=require("../stores/markup");
var vscontext=require("./validatecontext");
var mark=require("./mark");
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
	"context":{validate:vscontext.validate,label:"情境",editor:require("./context"),mark:vscontext.mark}
	,"definition":{validate:vs.singletwomore,label:"釋義",mark:mark.singletwo,editor:require("./definition")}
	,"important":{validate:vs.singleone,label:"重點",
							editor:require("./simple"), mark:mark.singleone}
	,"insight":{validate:vs.singleone,label:"創見",mark:mark.singleone,editor:require("./simple")}
	,"intertext":{validate:vs.multi,label:"互文", mark:mark.dualone, editor:require("./quote"),
						isDeletable: isIntertextDeletable,onDelete:deletIntertext}
	,"quote":{validate:vs.dualone,label:"出處", mark:mark.oneway, editor:require("./quote")}
  ,"causeeffect":{validate:vs.singletwo,label:"因果",mark:mark.singletwo,editor:require("./simple")}
  ,"historyculture":{validate:vs.singletwomore,label:"歷史文化",mark:mark.singletwo,editor:require("./simple")}
  ,"explaination":{validate:vs.singletwomore,label:"說明",mark:mark.singletwo,editor:require("./simple")}
  ,"part":{validate:vs.singletwomore,label:"部份",mark:mark.singletwo,editor:require("./simple")}
  ,"individual":{validate:vs.singletwomore,label:"總別",mark:mark.singletwo,editor:require("./simple")}
  ,"synonym":{validate:vs.singletwomore,label:"同義",mark:mark.singletwo,editor:require("./simple")}
  ,"signifier":{validate:vs.singletwo,label:"能所",mark:mark.singletwo,editor:require("./simple")}
  ,"extsignifier":{validate:vs.dualone,label:"能所",mark:mark.dualone,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}

  ,"ritual":{validate:vs.singletwo,label:"儀軌",mark:mark.singletwo,editor:require("./simple")}
  ,"extritual":{validate:vs.dualone,label:"儀軌",mark:mark.dualone,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}

  ,"authorbg":{validate:vs.singletwo,label:"作者背景",mark:mark.singletwo,editor:require("./simple")}
  ,"extauthorbg":{validate:vs.dualone,label:"作者背景",mark:mark.dualone,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}

	,"milestone":{validate:vsmilestone.validate,label:"界石",editor:require("./simple"), mark:mark.milestone}
	,"extdefinition":{validate:vs.dualonemore,label:"外部釋義",mark:mark.dualonemore,editor:require("./simple"),
		isDeletable: isIntertextDeletable,onDelete:deletIntertext}
	,"causeeffect2":{label:"果：",hidden:true}
	,"intertext2":{label:"互文：",hidden:true}
	,"part2":{label:"部份：",hidden:true}
	,"signifier2":{label:"所指：",hidden:true}
	,"explaination2":{label:"說明：",hidden:true}
	,"synonym2":{label:"同義詞",hidden:true}
  ,"definition2"	:{label:"定義：",hidden:true}
  ,"extdefinition2"	:{label:"定義：",hidden:true}
  ,"extsignifier2"	:{label:"所指：",hidden:true}
  ,"historyculture2"	:{label:"歷史文化：",hidden:true}
  ,"individual2":{label:"別相：",hidden:true}
  ,"ritual2":{label:"儀軌：",hidden:true}
  ,"extritual2":{label:"儀軌：",hidden:true}
  ,"authorbg2":{label:"作者背景：",hidden:true}
  ,"extauthorbg2":{label:"作者背景：",hidden:true}
}

var getTypeLabel=function(type) {
	var t=types[type];
	if (t) return t.label;
}

module.exports={types:types,getTypeLabel:getTypeLabel};