var util=require("./util");
var docfileaction=require("../actions/docfile");
var ktxfileaction=require("../actions/ktxfile");
var selectionaction=require("../actions/selection");
var cmfileio=require("../cmfileio");
var stackwidgetaction=require("../actions/stackwidget");
var markupaction=require("../actions/markup");
var markupstore=require("../stores/markup");
var	loaded = function() {
	this.cm=this.refs.cm.getCodeMirror();
	this.cm.react=this;
	this.cm.setOption("theme", "ambiance");
	this.generation=this.cm.changeGeneration(true);
	this.doc=this.cm.getDoc();	
	docfileaction.openFile(this.doc,this.props.filename);
	this.setsize();
	this.keymap();
	if (this.state.meta.top) {
		this.cm.scrollTo(0,this.state.meta.top);
	}
	if (this.props.scrollTo) {
		util.scrollAndHighlight(this.doc,this.props.scrollTo);
	}
}
var load = function(fn) {
	cmfileio.readFile(this.props.filename,function(err,data){
			this.setState(data,this.loaded);
	}.bind(this));
}

var save = function(fn) {
  	var meta=this.state.meta;
  	meta.top=this.cm.getScrollInfo().top;
  	cmfileio.writeFile(meta,this.cm,fn,function(err,newmeta){
      if (err) console.log(err);
      else  {
      	if (this.state.titlechanged) ktxfileaction.reload();
				this.generation=this.cm.changeGeneration(true);
				this.setState({dirty:false,titlechange:false,meta:newmeta,generation:this.generation});
      }
    }.bind(this));
}

var close = function() {
		stackwidgetaction.closeWidget(this.props.wid);
		selectionaction.clearSelectionOf(this.props.filename);
		docfileaction.closeFile(this.doc);

		var editing=markupstore.getEditing();
		if (editing && editing.doc===this.doc) {
			markupstore.freeEditing();
			markupaction.markupsUnderCursor([]);
		}

}
module.exports={load:load,loaded:loaded,save:save,close:close};