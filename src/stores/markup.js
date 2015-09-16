/**
	Markup under cursor and editing
*/

var Reflux=require("reflux");

var MarkupStore=Reflux.createStore({
	listenables:[require("../actions/stackwidget")]
	,markups:[]
	,editing:null
	,onEdit:function(markup) {
		this.editing=markup;
		this.trigger(this.editing,this.markups);
	}
	,onSetMarkups:function(markups,editing) {
		this.editing=editing||this.editing;
		this.markups=markups;
		this.trigger(this.editing,this.markups);
	}
})
module.exports=MarkupStore;