var kcm=require("ksana-codemirror");
var getSelections=kcm.getSelections, getCharAtCursor=kcm.getCharAtCursor;
var selectionaction=require("../actions/selection");
var markupaction=require("../actions/markup");
var util=require("./util");
var	autoGoMarkup = function(markups) {
		if (markups.length!==1) {
			overlayaction.clear();
			return;
		}
		var m=markups[0];
		if (!m.markup) {
			//console.error("invalid markup");
			return;
		}
		var others=m.markup.source||m.markup.by||m.markup.target;
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
			var selections=getSelections(this.doc);
			selectionaction.setSelection(this.props.filename,selections,cursorch);

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
	if (!cm.react.markups.length) return;
	var markup=cm.react.markups[0].markup;
	var cursor=cm.getCursor();
	var range=markup.handle.find();
	if(util.posInRange(cursor,range)){
		autoGoMarkup.call(this,cm.react.markups);
	}
}
module.exports={cursorActivity:cursorActivity, autoGoMarkup:autoGoMarkup, mouseDown:mouseDown};