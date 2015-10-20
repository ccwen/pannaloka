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
		util.gotoRangeOrMarkupID(others[0],others[1],this.props.wid);
	}
}

var cursorActivity=function(){
	clearTimeout(this.timer1);
	this.hasMarkupUnderCursor=false;
	this.timer1=setTimeout(function(){
		var cursorch=getCharAtCursor(this.doc);
		var prevsel=selectionstore.getSelection(this.props.trait.filename);
		var selections=getSelections(this.doc,prevsel); //push new selection to bottom
		selectionaction.setSelection(this.props.trait.filename,selections,cursorch);

		var marks=this.doc.findMarksAt(this.doc.getCursor());
		var markups=[], doc=this.doc;
		marks.forEach(function(m){
			if (m.type!=="bookmark" && !m.clearOnEnter) {
				var markup=this.state.markups[m.key];
				markups.push({markup:markup,key:m.key,doc:doc});
			}
		}.bind(this));
		this.markups=markups;
		markupaction.markupsUnderCursor(markups);
		this.hasMarkupUnderCursor=markups.length>0;
	}.bind(this),150);//cursor throttle
}

var mouseDown=function(cm,e){
	if (!cm.react.markups||!cm.react.markups.length) return;
	var markup=markupstore.getEditing();
	if (!markup || !markup.markup) return;

	if (markup.doc!==cm.doc) return false;
	setTimeout(function(){
		var cursor=cm.getCursor();
		var range=markup.markup.handle.find();
		if(util.posInRange(cursor,range)){
			autoGoMarkup.call(this,markup.markup);
		}
	}.bind(this),100);
}
module.exports={cursorActivity:cursorActivity, autoGoMarkup:autoGoMarkup, mouseDown:mouseDown};