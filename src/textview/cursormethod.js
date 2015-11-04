var kcm=require("ksana-codemirror");
var getSelections=kcm.getSelections, getCharAtCursor=kcm.getCharAtCursor;
var selectionaction=require("../actions/selection");
var docfileaction=require("../actions/docfile");
var markupstore=require("../stores/markup");
var selectionstore=require("../stores/selection");
var markupaction=require("../actions/markup");
var highlight=require("./highlight");

var sortByDistance=function(cursor,markups,doc) {
	return markups.filter(function(m){
		return m.markup;
	}).sort(function(m1,m2){
		var p1=m1.markup.handle.find();
		var p2=m2.markup.handle.find();

		if (p1.line!==p2.line) {
			return (cursor.line-p1.from.line) - (cursor.line-p2.from.line);
		} else {
			return (cursor.ch-p1.from.ch) - (cursor.ch-p2.from.ch);
		}
	});
}
var showcursorcoords=function() {
	var pos=this.doc.getCursor();
	console.log(this.cm.cursorCoords(pos),pos.line,pos.ch);
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
			var markups=highlight.getMarkupsInRange(this.doc,this.doc.getCursor());
			markups=sortByDistance(this.doc.getCursor(),markups);
			this.markups=markups;
			markupaction.markupsUnderCursor(markups);
			this.hasMarkupUnderCursor=markups.length>0;
			docfileaction.setActiveEditor(this.cm);
			//showcursorcoords.call(this);
		}
	}.bind(this),150);//cursor throttle
}


var mouseMove=function(cm,e) {//event captured by React, not Codemirror
	//console.log(e.clientX,e.clientY,e.pageX,e.pageY)
	var pos=cm.coordsChar({left:e.clientX,top:e.clientY});
	var markups=highlight.getMarkupsInRange(this.doc,pos);
	markups=sortByDistance(this.doc.getCursor(),markups);
	if (!markups.length){
		markupaction.hovering(null);
		return;
	}

	var m=markups[0].markup;//only highlight first one
	markupaction.hovering(m);
	highlight.highlightRelatedMarkup(m);
}

var mouseDown=function(cm,e){
	var m=markupstore.getHovering();
	if (m) highlight.autoGoMarkup.call(this,m);
}

module.exports={cursorActivity:cursorActivity, mouseDown:mouseDown
,mouseMove:mouseMove};