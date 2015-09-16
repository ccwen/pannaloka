var Reflux=require("reflux");

var SelectionStore=Reflux.createStore({
	listenables:[require("../actions/selection")]
	,selections:{}
	,init:function() {
	}
	,onSetSelection:function(docid,selections,cursorchar) {
		var sels={};
		Object.assign(sels,this.selections);
		sels[docid]=selections;
		this.cursorchar=cursorchar;
		this.selections=sels;
		this.trigger(this.selections,cursorchar);
	}
	,onClearAllSelection:function() {
		this.selections={};
		this.trigger(this.selections,this.cursorchar);
	}
	,onClearSelectionOf:function(docid) {
		var sels={};
		Object.assign(sels,this.selections);
		delete sels[docid];
		this.selections=sels;
		this.trigger(this.selections,this.cursorchar);
	}
})
module.exports=SelectionStore;