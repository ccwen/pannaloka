//must have at least one definition and one contextual markup
var filterEmptyRange=require("./util").filterEmptyRange;
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var util=require("./util");
var contextual=["insight","causeeffect","historyculture","part","individual","synonym"
,"signifier","ritual","extritual","extsignifier","authorbg","extauthorbg"];

var isDefinition=function(m) {
	return m.className==="definition" || m.className==="extdefinition";
}
var getMemberMarkup=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;

	var selections=sels[keys[0]];
	var doc=docfilestore.docOf(keys[0]);

	var markups=util.markupsFromSelection(doc,selections);
	var definition_markup_count=0,contextual_markup_count=0;
	var member=[],definition=null;
	for (var i=0;i<markups.length;i++) {
		var m=markups[i].markup;
		if (isDefinition(m)) {
			if ((!m.handle.member || !m.handle.member.length) && !definition) definition=m;
		}
		if (contextual.indexOf(m.className)>-1) {
			member.push(m);
		}
	}	
	if (definition) member.unshift(definition); //only one definition and on top
	return member;
}
var getMember=function(markup) {
	if (!markup.handle.member) return [];
	var filename=docfilestore.fileOf(markup.handle.doc);
	var getMarkup=markup.handle.doc.getEditor().react.getMarkup;
	var member=markup.handle.member.map(function(key){
		return getMarkup(key);
	});
	return member;
}
var validate=function(selections) {
	var member=getMemberMarkup(selections);
	if (!member) return false;
	return (member.length>1 && isDefinition(member[0]));
}

var mark=function(m,docOf, cb) {
	console.log('marking context',m);
}
module.exports={validate:validate,getMemberMarkup:getMemberMarkup,getMember:getMember,mark:mark
,isDefinition:isDefinition};