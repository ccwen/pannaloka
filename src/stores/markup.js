/**
	Markup under cursor and editing
*/

var Reflux=require("reflux");

var docfilestore=require("./docfile");

var markupStore=Reflux.createStore({
	listenables:[require("../actions/markup")]
	,markupsUnderCursor:[]
	
	,editing:null
	,onEdit:function(markup) {
		this.editing=markup;
		this.trigger(this.markupsUnderCursor);
	}
	,onMarkupsUnderCursor:function(markupsUnderCursor) {
		if (!markupsUnderCursor.length&& !this.markupsUnderCursor.length) return ;//nothing happen
		this.markupsUnderCursor=markupsUnderCursor;
		this.trigger(this.markupsUnderCursor,{cursor:true});
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