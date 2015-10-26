//must have at least one definition and one contextual markup
var filterEmptyRange=require("./util").filterEmptyRange;
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var util=require("./util");
var contextual=["insight","causeeffect","historyculture","part","individual","synonym"
,"signifier","ritual","extritual","extsignifier","authorbg","extauthorbg"];
var validate=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;

	var selections=sels[keys[0]];
	var doc=docfilestore.docOf(keys[0]);

	var markups=util.markupsFromSelection(doc,selections);
	var definition_markup_count=0,contextual_markup_count=0;

	for (var i=0;i<markups.length;i++) {
		var m=markups[i].markup;
		if (m.className==="explaination") {
			if (!m.contextKey) definition_markup_count++;
		}
		if (contextual.indexOf(m.className)>-1) contextual_markup_count++;
	}
	return (definition_markup_count && contextual_markup_count);
}
module.exports={validate:validate};