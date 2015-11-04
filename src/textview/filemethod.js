var highlight=require("./highlight");
var docfileaction=require("../actions/docfile");
var ktxfileaction=require("../actions/ktxfile");
var selectionaction=require("../actions/selection");
var cmfileio=require("../cmfileio");
var stackwidgetaction=require("../actions/stackwidget");
var markupaction=require("../actions/markup");
var markupstore=require("../stores/markup");
var TEXT_DELETED,TEXT_INSERTED;
var	loaded = function() {
	this.cm=this.refs.cm.getCodeMirror();
	this.cm.react=this;
	this.generation=this.cm.changeGeneration(true);
	this.doc=this.cm.getDoc();	
	docfileaction.openFile(this.doc,this.props.trait.filename,this.props.trait);
	this.setsize();
	this.keymap();
	this.cm.focus();
	if (this.props.trait.top) {
		this.cm.scrollTo(0,this.props.trait.top);
	}
	if (this.props.trait.scrollTo) {
		setTimeout(function(){
			highlight.highlightDoc(this.doc,this.props.trait.scrollTo);
		}.bind(this),300);//wait for markup to load
	}
}

var inserttext=function(e) {
	if (e.isLocal) return;
  var from  = this.cm.posFromIndex(e.index);
  this.ignore_change = true ;
  this.cm.replaceRange(e.text, from, from);
	this.ignore_change = false ;
}

var deletetext=function(e) {
	if (e.isLocal) return;
  var from = this.cm.posFromIndex(e.index) ;
	var to   = this.cm.posFromIndex(e.index + e.text.length) ;

  this.ignore_change = true ;
  this.cm.replaceRange("", from, to);
	this.ignore_change = false ;
}

var beforeChange=function(cm,changeObj) {
	if (this.props.trait.host!=="google")return;
	if (this.ignore_change) return;

	var coString=this.state._text;

  var from  = this.cm.indexFromPos(changeObj.from);
  var to    = this.cm.indexFromPos(changeObj.to);
  var text  = changeObj.text.join('\n');

  if (to - from > 0)    coString.removeRange(from, to);
  if (text.length > 0)  coString.insertString(from, text);
}

var unmount = function() {
	if (this.state._text) {
		this.state._text.removeAllEventListeners();
		this.state._text.removeAllEventListeners();
	}
}

var load = function(fn,opts) {
	opts=opts||{};
	if (opts.host==="google") {
		var doc=opts.doc;
		var _markups=doc.getModel().getRoot().get('markups');
		var _text=doc.getModel().getRoot().get('text'); 
		var title=opts.title;
		var data={value:_text.text, meta:{title:title}, markups:JSON.parse(_markups.toString()) 
		, _markups:_markups, _text:_text };

		TEXT_INSERTED=gapi.drive.realtime.EventType.TEXT_INSERTED;
		TEXT_DELETED=gapi.drive.realtime.EventType.TEXT_DELETED;
		_text.addEventListener(TEXT_INSERTED,tinserttext.bind(this));
		_text.addEventListener(TEXT_DELETED,tdeletetext.bind(this));

		this.setState(data,this.loaded);
	} else {
		cmfileio.readFile(this.props.trait.filename,function(err,data){
			if (err) {
				this.setState({value:"File created on "+new Date()},this.loaded);
			} else {
				this.setState(data,this.loaded);
			}
		}.bind(this));

	}
}

var save = function(fn) {
	if (this.props.trait.host==="google") {
		this.setState({dirty:false});
		return;
	}

	var meta=JSON.parse(JSON.stringify(this.props.trait));
	delete meta.stat;

	meta.top=this.cm.getScrollInfo().top;
	cmfileio.writeFile(meta,this.cm,fn,function(err,newmeta){
    if (err) console.log(err);
    else  {
    	if (this.state.titlechanged) ktxfileaction.reload();
			this.generation=this.cm.changeGeneration(true);
			this.setState({dirty:false,titlechange:false,meta:newmeta,generation:this.generation});

			for (var i in meta){
				this.props.trait[i]=meta[i];	
			}
    }
  }.bind(this));
}

var close = function() {
		stackwidgetaction.closeWidget(this.props.wid);
		selectionaction.clearSelectionOf(this.props.trait.filename);
		docfileaction.closeFile(this.props.trait.filename);

		var editing=markupstore.getEditing();
		if (editing && editing.doc===this.doc) {
			markupstore.freeEditing();
			markupaction.markupsUnderCursor([]);
		}

}
module.exports={load:load,loaded:loaded,save:save,close:close,unmount:unmount,beforeChange:beforeChange};