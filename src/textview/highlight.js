var docfilestore=require("../stores/docfile");
var stackwidgetaction=require("../actions/stackwidget");
var overlayaction=require("../actions/overlay");
var milestones=require("ksana-codemirror").milestones;
var ktxfilestore=require("../stores/ktxfile");
var markupstore=require("../stores/markup");
var googledrive=require("./googledrive");
var gotoRangeOrMarkupID=function(file,range_mid,opts) {
	opts=opts||{};
	if (opts.below && !opts.autoOpen) opts.autoOpen=true;
	
	var targetdoc=docfilestore.docOf(file);
	
	if (targetdoc) {
		if (!targetdoc.getEditor().react.markupReady()) {
		//wait for this.state.markups ready, because markups is load later
		//see ksana-codemirror/src/codemirror-react.js componentDidMount			
			setTimeout(function(){
				highlightDoc.call(this,targetdoc,range_mid,opts);
			}.bind(this),500);//wait for markups to load
		} else {
			highlightDoc.call(this,targetdoc,range_mid,opts);
		}
	} else {
		if (!opts.autoOpen) return;
		var target=ktxfilestore.findFile(file);
		if (target) {
			target.scrollTo=range_mid;
			stackwidgetaction.openWidget(target,"TextWidget",{below:opts.below});	
		} else if (file.indexOf("/")===-1){
			googledrive.openFile.call(this,file,{below:opts.below,scrollTo:range_mid});
		}
	}
}
var getLinkedBy=function(m){
	var others=m.target;
	if (!others)return;
	if (typeof others[0]==="string"){
		var file=others[0];
		var doc=docfilestore.docOf(file);
		var mid=others[1];
		var markup=doc.getEditor().react.getMarkup(mid);
		return markup;
	}
}

var getMarkupsInRange=function(doc,from,to) {
	if (!to) {
		var marks=doc.findMarksAt(from);
	} else {
		var marks=doc.findMarks(from,to);
	}
		
	var markups=[],getMarkup=doc.getEditor().react.getMarkup;
	marks.forEach(function(m){
		if (m.type!=="bookmark" && m.className.substring(0,13)!=="editingMarker" && !m.clearOnEnter) {
			var markup=getMarkup(m.key);
			markups.push({markup:markup,key:m.key,doc:doc});
		}
	});
	return markups;
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
	//console.log("drawlink",rect1,rect2)
	overlayaction.connect(rect1,rect2);
}
var highlights_handles=[];
var clearHighlights=function(){
	highlights_handles.map(function(h){h.clear()});
	highlights_handles=[];
}
var makeHighlights=function(doc,highlights,opts){
	if (!opts.noClear) clearHighlights();
	for (var i=0;i<highlights.length;i++) {
		var from=highlights[i][0],to=highlights[i][1];
		if (from[0]===to[0] && from[1]===to[1]) continue;
		highlights_handles.push(doc.markText(from,to,{className:"highlight",clearOnEnter:true}));
		////var by=getLinkedBy(markup);
		//if (by) drawLink(markup,by);
	}

	clearInterval(this.timerMarker);
	if (!opts.keep) {
		this.timerMarker=setInterval(function(){
			
			if (!markupstore.getHovering()) clearHighlights();
		}.bind(this),1500);
	}
}
var	highlightDoc=function (doc,range_markupid,opts) {
	if (!range_markupid) return;
	opts=opts||{};
	var hl=range_markupid,highlights=[];
	//one or more key
	if (typeof range_markupid==="string" || typeof range_markupid[0]==="string") {
		var ranges=range_markupid;
		if (typeof range_markupid==="string") {
			ranges=[range_markupid];
		}
		highlights=[];
		for (var i=0;i<ranges.length;i++) {
			var markup=doc.getEditor().react.getMarkup(ranges[i]);
			if (!markup) {
				console.error("markup not found",ranges[i]);
			} else {
				var pos=markup.handle.find();
				var from=pos.from, to=pos.to;
				if (opts.moveCursor && i===0) doc.setCursor(from);
				highlights.push([from,to]);
			}
		}
	} else { //array format
		if (hl[0][0] instanceof Array) {
			//for quote , single range
			var newhl=milestones.unpack.call(doc,hl[0]);
			var from={line:newhl[0][1],ch:newhl[0][0]},to={line:newhl[1][1],ch:newhl[1][0]};
		} else {
			var newhl=milestones.unpack.call(doc,hl);	
			var from={line:newhl[0][1],ch:newhl[0][0]},to={line:newhl[1][1],ch:newhl[1][0]};
		}
		
		highlights=[[from,to]];
		if (opts.moveCursor) {
			doc.getEditor().focus();	
			doc.setCursor(from);
		} 
	}
	var marker = document.createElement('span');

	if (highlights.length && !opts.noScroll) {
		doc.getEditor().scrollIntoView(highlights[0][0],50);
	}

	makeHighlights.call(this,doc,highlights,opts);
}

var getMarkupText=function(doc,m) {
	var pos=m.find();
	if (!pos) return;
	return doc.getRange(pos.from,pos.to);
}	

var posInRange=function(pos,range) { //check if a pos in range, cm format
	if (pos.line>range.from.line && pos.line<range.to.line) return true;//in range , not on boundary
	if (pos.line<range.from.line||pos.line>range.to.line)return false; //out of range
	if (pos.line===range.from.line) {
		return pos.ch>=range.from.ch;
	}

	if (pos.line===range.to.line) {
		return pos.ch<range.from.ch;
	}
	return false;
}
var highlightRelatedMarkup=function(m) { //highlight markup and all related 
	var filename=docfilestore.fileOf(m.handle.doc);
	if (!filename) return;

	var hilights={};//group by filename
	hilights[filename]=[];
	hilights[filename].push(m.handle.key);

	if (m.master) hilights[filename].push(m.master);

	if (m.handle.others && m.handle.others[0]) {
		hilights[filename]=hilights[filename].concat(m.handle.others);
	}
	var targets=m.handle.target;
	if (targets) {
		if (!(targets[0] instanceof Array)) targets=[targets];
		targets.forEach(function(t){
			if (!hilights[t[0]]) hilights[t[0]]=[];
			hilights[t[0]].push(t[1]);
		});		
	}
	clearHighlights();
	for (var file in hilights) {
		var doc=docfilestore.docOf(file);
		if (doc) highlightDoc.call(this,doc,hilights[file],{noScroll:true,noClear:true});
	}
}
var	autoGoMarkup = function(m) {
	var others=m.source||m.by||m.target;
	if (!others)return;
	if (others[0] instanceof Array) {
		others=others[0];
	}
	if (typeof others[0]==="string"){
		var wid=m.handle.doc.getEditor().react.getWid();
		gotoRangeOrMarkupID.call(this,others[0],others[1],{below:wid});
	}
}

module.exports={gotoRangeOrMarkupID:gotoRangeOrMarkupID,highlightDoc:highlightDoc
,getMarkupText:getMarkupText,posInRange:posInRange,getMarkupsInRange:getMarkupsInRange
,highlightRelatedMarkup:highlightRelatedMarkup,autoGoMarkup:autoGoMarkup};