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
		var sels=this.copySel(this.selections);
		for (var i in sels) {
			sels[i]=[];
		}
		this.selections=sels;

		this.trigger(this.selections,this.cursorchar);
	}
	,onClearSelectionOf:function(filename) {
		var sels=this.copySel(this.selections);
		sels[filename]=[];

		this.selections=sels;
		this.trigger(this.selections,this.cursorchar);
	}
	,hasRange:function () {
		for (var i in this.selections) {
			for (var j in this.selections[i]) {
				if (this.selections[i][j].length>1) return true;
			}
		}
		return false;
	}
})
module.exports=selectionStore;