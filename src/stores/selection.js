var Reflux=require("reflux");

var selectionStore=Reflux.createStore({
	listenables:[require("../actions/selection")]
	,selections:{}
	,init:function() {
	}
	,copySel:function(selections) {
		var sels={};
		for (var i in this.selections) sels[i]=this.selections[i];
		return sels;		
	}
	,onSetSelection:function(filename,selections,cursorchar) {
		var sels=this.copySel(selections);
		sels[filename]=selections;
		this.cursorchar=cursorchar;
		this.selections=sels;

		this.trigger(this.selections,cursorchar);
	}
	,onClearAllSelection:function() {
		var sels=this.copySel(selections);
		for (var i in sels) {
			sels[i]=[];
		}
		this.selections=sels;

		this.trigger(this.selections,this.cursorchar);
	}
	,onClearSelectionOf:function(filename) {
		var sels=this.copySel(selections);
		sels[filename]=[];

		this.selections=sels;
		this.trigger(this.selections,this.cursorchar);
	}
})
module.exports=selectionStore;