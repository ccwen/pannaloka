var highlight=require("./highlight");
var docfilestore=require("../stores/docfile");
var createmilestones=require("./createmilestones");
var selectionaction=require("../actions/selection");
var kcm=require("ksana-codemirror");
var textMarker2json=kcm.textMarker2json;
var markupNav=require("../markup/nav");
var	createMilestones = function (ranges)  { //uses by ksana-codemirror/automarkup.js
	createmilestones.call(this.cm,ranges,function(newmarkups){
		if (!newmarkups.length) return;
		var markups={};
		for (var i in this.state.markups ) markups[i]=this.state.markups[i];

		for (var i=0;i<newmarkups.length;i++) {
			markups[newmarkups[i].key]=newmarkups[i].markup;
		}
		
		this.setState({dirty:true,markups},function(){
			this.rebuildMilestone(this.state.markups);
		}.bind(this));
	}.bind(this));
}

var addremotemarkup=function(key,markup){//not in textview yet
	this.state._markups.set(key,markup);
}

var removeremotemarkup=function(markup) {
	this.state._markups.delete(markup.key);
}
/*
//just for lookup , not trigger redraw as markup.handle already exists.
var	addMarkup = function (markup) {
	if (!markup  || !markup.key) return;
	this.state.markups[markup.key]=markup;

	if (this.isGoogleDriveFile()) addremotemarkup(markup);
	if (markup.className==="milestone") this.rebuildMilestone(this.state.markups);
	var file=docfilestore.fileOf(markup.handle.doc);
	markupNav.rebuild(file,markup.className);
	this.setState({dirty:true});
}
*/

var	getOther = function(markup,opts) {
	var out=[],markups=this.state.markups;
	opts=opts||{};
	if (markup.master) {
		var master=markups[markup.master];
		if (master) out.push(master);
	} else if (markup.others) {
		for (var i=0;i<markup.others.length;i++) {
			var key=markup.others[i];
			out.push(markups[key]);
		}
	}

	if (out.length && opts.format=="range") {
		return out.map(function(m){
			var file=docfilestore.fileOf(m.handle.doc);
			var text=highlight.getMarkupText(m.handle.doc,m.handle);
			return [file,m.key,text];
		});
	}
	return out;
}

var	removeMarkup =function(key) {
	var m=this.state.markups[key];

	if (m) {
		var clsname=m.className;
		if (this.isGoogleDriveFile()) removeremotemarkup.call(this,m);

		m.handle.clear();
		delete this.state.markups[key];
		if (clsname==="milestone") this.rebuildMilestone(this.state.markups);
		var file=docfilestore.fileOf(m.handle.doc);
		markupNav.rebuild(file,clsname);
		this.setState({dirty:true});
	} else {
		console.error("unknown markup id",key)
	}
}

var markupReady = function (markups) {//this is React component
	this.rebuildMilestone.call(this,markups);//in defaulttextview
	var fn=docfilestore.fileOf(this.doc);
	markupNav.setMarkups(markups,fn);
}

var onMarkup = function(M,action) {		
	var shallowCopyMarkups = function(M) { //use Object.assign in future
		var out={};
		for (var i in M) out[i]=M[i];
		return out;
	}
	if (!action || !action.newly || !M.length) return;
	var touched=null;
	var markups=null;
	for (var i in M) {
		var m=M[i];
		if (m.doc===this.doc) {
			if (!markups) markups=shallowCopyMarkups(this.state.markups);
			markups[m.key]=m.markup;
			if (this.isGoogleDriveFile()) addremotemarkup.call(this,m.key,m.markup);
			if (!touched) touched={};
			touched[m.markup.className]=true;
		}
	}

	selectionaction.clearAllSelection();
	if (markups) this.setState({dirty:true,markups},function(){
		//console.log(Object.keys(markups).length,Object.keys(this.state.markups).length);
		if (touched) {
			var file=docfilestore.fileOf(this.doc);
			markupNav.setMarkups(this.state.markups,file,true);//do not perform full rebuild
			for (var type in touched) {
				markupNav.rebuild(file,type);
			}
		}
		if (M[0].markup.className==="milestone") this.rebuildMilestone(markups);
	}.bind(this));

}

var rebuildMilestone = function (markups) {
	kcm.milestones.buildMilestone(this.doc,markups);
	//force repaint of gutter
	this.cm.setOption("lineNumbers",false);
	this.cm.setOption("lineNumbers",true);
}

module.exports={onMarkup:onMarkup,createMilestones:createMilestones,markupReady:markupReady,
	getOther:getOther,removeMarkup:removeMarkup,rebuildMilestone:rebuildMilestone}