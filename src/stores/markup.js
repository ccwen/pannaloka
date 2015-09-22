/**
	Markup under cursor and editing
*/

var Reflux=require("reflux");

var docfilestore=require("./docfile");

var markupStore=Reflux.createStore({
	listenables:[require("../actions/markup")]
	,markupsUnderCursor:[]
	,onMarkupsUnderCursor:function(markupsUnderCursor) {
		if (!markupsUnderCursor.length&& !this.markupsUnderCursor.length) return ;//nothing happen
		this.markupsUnderCursor=markupsUnderCursor;
		this.trigger(this.markupsUnderCursor,{cursor:true});
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
	,onCreateMarkup:function(obj) {
		if (!obj.typedef || !obj.typedef.mark) {
			console.log(obj);
			throw "cannot create markup"
		}

		obj.typedef.mark(obj, docfilestore.docOf ,function(err,newmarkup){
			this.markupsUnderCursor=newmarkup;
			this.trigger( this.markupsUnderCursor,{newly:true});
		}.bind(this));
	}
})
module.exports=markupStore;