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
	,onSetMarkups:function(markupsUnderCursor) {
		this.editing=editing||this.editing;
		this.markupsUnderCursor=markupsUnderCursor;
		this.trigger(this.markupsUnderCursor);
	}
	
	,onCreateMarkup:function(obj) {
		if (!obj.typedef || !obj.typedef.write) {
			console.log(obj);
			throw "cannot write markup, missing write handler"
		}

		obj.typedef.write(obj, docfilestore.docOf ,function(err,newmarkup){
			this.markupsUnderCursor=newmarkup;
			this.trigger( this.markupsUnderCursor,{newly:true});
		}.bind(this));
	}
})
module.exports=markupStore;