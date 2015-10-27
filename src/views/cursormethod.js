var kcm=require("ksana-codemirror");
var getSelections=kcm.getSelections, getCharAtCursor=kcm.getCharAtCursor;
var selectionaction=require("../actions/selection");
var markupstore=require("../stores/markup");
var selectionstore=require("../stores/selection");
var markupaction=require("../actions/markup");
var util=require("./util");
var	autoGoMarkup = function(m) {
	var others=m.source||m.by||m.target;
	if (!others)return;
	if (typeof others[0]==="string"){
		util.gotoRangeOrMarkupID(others[0],others[1],{below:this.props.wid});
	}
}

var sortByDistance=function(cursor,markups,doc) {
	return markups.sort(function(m1,m2){
		var p1=m1.markup.handle.find();
		var p2=m2.markup.handle.find();

		if (p1.line!==p2.line) {
			return (cursor.line-p1.from.line) - (cursor.line-p2.from.line);
		} else {
			return (cursor.ch-p1.from.ch) - (cursor.ch-p2.from.ch);
		}

	});
}
var cursorActivity=function(){
	clearTimeout(this.timer1);
	this.hasMarkupUnderCursor=false;
	this.timer1=setTimeout(function(){
		var cursorch=getCharAtCursor(this.doc);
		var prevsel=selectionstore.getSelection(this.props.trait.filename);
		var selections=getSelections(this.doc,prevsel); //push new selection to bottom
		selectionaction.setSelection(this.props.trait.filename,selections,cursorch);
		if (selections.length>2 || (selections.length>0&&selections[0].length>1)){
			this.markups=null;
			markupaction.markupsUnderCursor([]);
			this.hasMarkupUnderCursor=false;
			//has range
		} else {
			var markups=util.getMarkupsInRange(this.doc,this.doc.getCursor());
			markups=sortByDistance(this.doc.getCursor(),markups);
			this.markups=markups;
			markupaction.markupsUnderCursor(markups);
			this.hasMarkupUnderCursor=markups.length>0;
		}
	}.bind(this),150);//cursor throttle
}

var mouseDown=function(cm,e){
	if (!cm.react.markups||!cm.react.markups.length) return;
	var markup=markupstore.getEditing();
	if (!markup || !markup.markup) return;

	if (markup.doc!==cm.doc) return false;
	setTimeout(function(){
		var markup=markupstore.getEditing();
		if (!markup || !markup.markup) return;
		if (markup.doc!==cm.doc) return false;
		var cursor=cm.getCursor();
		var range=markup.markup.handle.find();
		if(util.posInRange(cursor,range)){
			autoGoMarkup.call(this,markup.markup);
		}
	}.bind(this),100);
}
module.exports={cursorActivity:cursorActivity, autoGoMarkup:autoGoMarkup, mouseDown:mouseDown};