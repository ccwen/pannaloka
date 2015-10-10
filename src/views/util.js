var docfilestore=require("../stores/docfile");
var stackwidgetaction=require("../actions/stackwidget");
var overlayaction=require("../actions/overlay");

var gotoRangeOrMarkupID=function(file,range_mid,wid) {
	var targetdoc=docfilestore.docOf(file);
	if (targetdoc) {
		scrollAndHighlight(targetdoc,range_mid);
	} else {
		var target={filename:file, scrollTo:range_mid };
		stackwidgetaction.openWidget(target,"TextWidget",{below:wid});	
	}
}
var getLinkedBy=function(m){
	var others=m.source||m.by;
	if (!others)return;
	if (typeof others[0]==="string"){
		var file=others[0];
		var doc=docfilestore.docOf(file);
		var mid=others[1];
		var markup=doc.getEditor().react.getMarkup(mid);
		return markup;
	}
}

var getMarkupRect=function(m){
	var cm=m.handle.doc.getEditor();
	var pos=m.handle.find();
	var x1y1=cm.charCoords(pos.from);
	var x2y2=cm.charCoords(pos.to);
	return {left:x1y1.left,top:x1y1.top,right:x2y2.right,bottom:x2y2.bottom};
}

var drawLink=function(m1,m2) {	
	var rect1=getMarkupRect(m1);
	var rect2=getMarkupRect(m2);
	console.log("drawlink",rect1,rect2)
	overlayaction.connect(rect1,rect2);
}
var	scrollAndHighlight=function (doc,range_markupid,opts) {
		if (!range_markupid) return;
		setTimeout(function(){
			opts=opts||{};
			var hl=range_markupid;
			if (typeof range_markupid==="string") {
				var markup=doc.getEditor().react.getMarkup(range_markupid);
				if (!markup) {
					console.error("markup not found",range_markupid);
					return;
				}
				var by=getLinkedBy(markup);

				var pos=markup.handle.find();
				var from=pos.from, to=pos.to;
				var scrollto={line:from.line,ch:from.ch};
			} else {//array format
				var from={line:hl[0][1],ch:hl[0][0]},to={line:hl[1][1],ch:hl[1][0]};
				var scrollto={line:hl[0][1],ch:hl[0][0]};
			}
			var marker = document.createElement('span');
			if (scrollto.line>0) scrollto.line--;//show one line on top;
			setTimeout(function(){
				var highlight=doc.markText(from,to,{className:"highlight",clearOnEnter:true});
				doc.getEditor().scrollIntoView(from,50);
				if (by) drawLink(markup,by);

				if (!opts.keep) {
					setTimeout(function(){
						highlight.clear();
					},1500);				
				}
			},100);			
		}.bind(this),100);
		//wait for this.state.markups ready, because markups is load later
		//see ksana-codemirror/src/codemirror-react.js componentDidMount
	}

var getMarkupText=function(doc,m) {
	var pos=m.find();
	return doc.getRange(pos.from,pos.to);
}	
module.exports={gotoRangeOrMarkupID:gotoRangeOrMarkupID,scrollAndHighlight:scrollAndHighlight
,getMarkupText:getMarkupText};