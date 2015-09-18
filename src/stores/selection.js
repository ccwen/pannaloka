var Reflux=require("reflux");

var selectionStore=Reflux.createStore({
	listenables:[require("../actions/selection")]
	,selections:{}
	,init:function() {
	}
	,onSetSelection:function(filename,selections,cursorchar) {
		var sels={};
		Object.assign(sels,this.selections);
		sels[filename]=selections;
		this.cursorchar=cursorchar;
		this.selections=sels;

		this.trigger(this.selections,cursorchar);
	}
	,onClearAllSelection:function() {
		var sels={};
		Object.assign(sels,this.selections);
		for (var i in sels) {
			sels[i]=[];
		}
		this.selections=sels;

		this.trigger(this.selections,this.cursorchar);
	}
	,onClearSelectionOf:function(filename) {
		var sels={};
		Object.assign(sels,this.selections);
		sels[filename]=[];

		this.selections=sels;
		this.trigger(this.selections,this.cursorchar);
	}
})
module.exports=selectionStore;