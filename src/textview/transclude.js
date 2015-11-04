var MAX_TRANSCLUSION_LENGTH = 30;

var React=require("react");
var ReactDOM=require("react-dom");
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var uuid=require("../uuid");
var transclusion = require("../components/transclusion");
var milestones=require("ksana-codemirror").milestones;
var highlight=require("./highlight");
var bookmarkfromrange=function(doc) { //simulate bookmark format in file
	var bookmark={}; 
	var ranges=selectionstore.getRanges();
	if (ranges.length!==1)return;
	var thisfile=docfilestore.fileOf(doc);
	if (!thisfile || thisfile==ranges[0][0])return ;//cannot tranclude in same file

  var text=selectionstore.getRangeText(0);
  if (text.length>MAX_TRANSCLUSION_LENGTH) text=text.substr(0,MAX_TRANSCLUSION_LENGTH)+"...";

  var packed=milestones.pack.call( docfilestore.docOf(ranges[0][0]),ranges[0][1]);
  bookmark.target=[ranges[0][0],packed,text];
  bookmark.key=uuid();
  bookmark.className="transclusion";
  //TODO save target file generation 
  return bookmark;
}

var bookmarkfrommarkup=function(mrk) {
	var bookmark={};
	var file=docfilestore.fileOf(mrk.markup.handle.doc);
	var text="~"+highlight.getMarkupText(mrk.markup.handle.doc,mrk.markup.handle);
	bookmark.target=[file, mrk.key, text];
	bookmark.key=uuid();
	bookmark.className="transclusion";
	return bookmark;
}

var removeBookmarkAtCursor = function(doc) {
	var cursor=doc.getCursor();
	var removed=0;
	var react=doc.getEditor().react;
	var bookmarks=doc.findMarksAt(cursor);
	bookmarks.forEach(function(bookmark){
		if (bookmark.type==="bookmark") {
			react.removeMarkup(bookmark.key);
			bookmark.clear();
			removed++;
		}
	});
	return removed;
}

var transclude_onclick=function(e) {
	var key=e.target.dataset.mid;
	var m=this.getMarkup(key);
	var highlight= m.target[1];
	this.doc.setCursor(m.handle.find());
	highlight.gotoRangeOrMarkupID(m.target[0],m.target[1],{below:this.props.wid,moveCursor:true});
}	


var transclude=function(bm,mrk) {
	var doc=this.doc;
	var removed=removeBookmarkAtCursor.call(this,doc);
	if (removed) return;
	if (mrk) {
		bm=bookmarkfrommarkup(mrk);
	} else if (!bm) {
		bm=bookmarkfromrange(doc);
	}
	if (!bm) return;

	var cursor=doc.getCursor();
  var marker = document.createElement('span');
  ReactDOM.render(  React.createElement(transclusion,
  	{title:bm.target[0],mid:bm.key,text:bm.target[2],onClick:transclude_onclick.bind(this)})
  ,marker);
  var textmarker=doc.markText(cursor,cursor,{
  	  //need codemirror after 5.7.1 https://github.com/codemirror/CodeMirror/commit/bc5a4939b2603f587c2358a8b13063862660bcdf
  	replacedWith:marker,target:bm.target,className:bm.className,clearWhenEmpty: false,key:bm.key,type:"bookmark"}
  );

  //textmarker.type="bookmark"; //load from file will cause transclusion class apply till end-of-line
  bm.handle=textmarker;
  return bm;
}


module.exports=transclude;