var MAX_TRANSCLUSION_LENGTH = 30;

var React=require("react");
var ReactDOM=require("react-dom");
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var uuid=require("../uuid");
var transclusion = require("../components/transclusion");
var milestones=require("ksana-codemirror").milestones;
var util=require("./util");
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

	util.gotoRangeOrMarkupID(m.target[0],m.target[1],this.props.wid);
}

var transclude=function(bm) {
	var doc=this.doc;
	var removed=removeBookmarkAtCursor.call(this,doc);
	if (removed) return;
	if (!bm) {
		bm=bookmarkfromrange(doc);
		if (!bm) {
			return;
		};
		this.setState({dirty:true});
	}

	var cursor=doc.getCursor();
  var marker = document.createElement('span');
  ReactDOM.render(  React.createElement(transclusion,
  	{mid:bm.key,text:bm.target[2],onClick:transclude_onclick.bind(this)})
  ,marker);
  var textmarker=doc.markText(cursor,cursor,{
  	replacedWith:marker,target:bm.target,className:bm.className,clearWhenEmpty: false,key:bm.key
  	}
  	,"bookmark" //require patch in codemirror.js to allow passing textmarker type
  	/*
  	  markText: function(from, to, options, type) {
      return markText(this, clipPos(this, from), clipPos(this, to), options, type||"range");
    */
  );

  //textmarker.type="bookmark"; //load from file will cause transclusion class apply till end-of-line
  bm.handle=textmarker;
  return bm;
}

module.exports=transclude;