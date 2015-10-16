var util=require("./util");
var docfilestore=require("../stores/docfile");
var createmilestones=require("./createmilestones");
var selectionaction=require("../actions/selection");
var kcm=require("ksana-codemirror");
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

	//just for lookup , not trigger redraw as markup.handle already exists.
var	addMarkup = function (markup) {
	if (!markup  || !markup.key) return;
	this.state.markups[markup.key]=markup;
	if (markup.className==="milestone") this.rebuildMilestone(this.state.markups);
	this.setState({dirty:true});
}

var	getOther = function(markup,opts) {
	var out=[],markups=this.state.markups;
	opts=opts||{};
	if (markup.master) {
		out.push(markups[markup.master]);
	} else if (markup.others) {
		for (var i=0;i<markup.others.length;i++) {
			var key=markup.others[i];
			out.push(markups[key]);
		}
	}

	if (out.length && opts.format=="range") {
		return out.map(function(m){
			var file=docfilestore.fileOf(m.handle.doc);
			var text=util.getMarkupText(m.handle.doc,m.handle);
			return [file,m.key,text];
		});
	}
	return out;
}

var	removeMarkup =function(key) {
	var m=this.state.markups[key];

	if (m) {
		var clsname=m.className;
		
		m.handle.clear();
		delete this.state.markups[key];
		if (clsname==="milestone") this.rebuildMilestone(this.state.markups);
		this.setState({dirty:true});
	} else {
		console.error("unknown markup id",key)
	}
}

var onMarkup = function(M,action) {		
		var shallowCopyMarkups = function(M) { //use Object.assign in future
			var out={};
			for (var i in M) out[i]=M[i];
			return out;
		}
		if (action && action.newly && M.length) {
			var touched=false;
			var markups=null;
			for (var i in M) {
				var m=M[i];
				if (m.doc===this.doc) {
					if (!markups) markups=shallowCopyMarkups(this.state.markups);
					markups[m.key]=m.markup;
					touched=true;
				}
			}
			selectionaction.clearAllSelection();
			if (touched) this.setState({dirty:true});
			if (markups) this.setState({markups});
			if (M[0].markup.className==="milestone") this.rebuildMilestone(markups);
		}
	}

var rebuildMilestone = function (markups) {
	kcm.milestones.buildMilestone(this.doc,markups);
	//force repaint of gutter
	this.cm.setOption("lineNumbers",false);
	this.cm.setOption("lineNumbers",true);
}

module.exports={onMarkup:onMarkup,createMilestones:createMilestones,
	getOther:getOther,addMarkup:addMarkup,removeMarkup:removeMarkup,rebuildMilestone:rebuildMilestone}