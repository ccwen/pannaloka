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
	this.generation=this.cm.changeGeneration(true);
	this.doc=this.cm.getDoc();	
	docfileaction.openFile(this.doc,this.props.trait.filename,this.props.trait);
	this.setsize();
	this.keymap();
	if (this.props.trait.top) {
		this.cm.scrollTo(0,this.props.trait.top);
	}
	if (this.props.trait.scrollTo) {
		util.scrollAndHighlight(this.doc,this.props.trait.scrollTo);
	}
}
var load = function(fn) {
	cmfileio.readFile(this.props.trait.filename,function(err,data){
			this.setState(data,this.loaded);
	}.bind(this));
}

var save = function(fn) {
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
module.exports={load:load,loaded:loaded,save:save,close:close};