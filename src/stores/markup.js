/**
	Markup under cursor and editing
*/

var Reflux=require("reflux");

var docfilestore=require("./docfile");

var markupStore=Reflux.createStore({
	listenables:[require("../actions/markup")]
	,markupsUnderCursor:[]
	,ctrl_m_handler:null
	,editing:null
	,onMarkupsUnderCursor:function(markupsUnderCursor) {
		this.editing=null;
		if (this.markupsUnderCursor==markupsUnderCursor) return;
		this.markupsUnderCursor=markupsUnderCursor||[];
		this.trigger(this.markupsUnderCursor,{cursor:true});
	}
	,getEditing:function() {
		return this.editing;
	}
	,onEditing:function(markup,handler) {
		this.editing=markup;
		this.ctrl_m_handler=handler;
		this.trigger(markup,{editing:true});
	}
	,onSetHotkey:function(handler) {
		this.ctrl_m_handler=handler;
		//console.log("handler",handler,this);
	}
	,remove:function(markup) {
		//console.log("remove markup",markup);
		var doc=markup.handle.doc;
		doc.getEditor().react.removeMarkup(markup.key);

		this.trigger([],{cursor:true});
	}
	,removeByMid:function(mid,file){
		//console.log("remove mid in file",mid,file);
		var doc=docfilestore.docOf(file);
		doc.getEditor().react.removeMarkup(mid);
		this.trigger([],{cursor:true});
	}
	,onToggleMarkup:function(){
		if (this.ctrl_m_handler) {
				this.ctrl_m_handler();
				this.ctrl_m_handler=null;//fire once
		}
	}
	,onCreateMarkup:function(obj,cb) {
		if (!obj.typedef || !obj.typedef.mark) {
			console.log(obj);
			throw "cannot create markup"
		}
		this.editing=null;

		obj.typedef.mark(obj, docfilestore.docOf ,function(err,newmarkup){
			this.markupsUnderCursor=newmarkup;
			this.trigger( this.markupsUnderCursor,{newly:true});
			if (cb) cb();
		}.bind(this));
	}
})
module.exports=markupStore;