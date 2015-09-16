var Reflux=require("reflux");

var SelectionStore=Reflux.createStore({
	listenables:[require("../actions/selection")]
	,selectionsByView:{}
	,fileOfView:{}
	,init:function() {
	}
	,selectionFromView : function() {
		var out={};
		for (var wid in this.selectionsByView) {
			var file=this.fileOfView[wid];
			if (out[file]) out[file]=out[file].concat(this.selectionsByView[wid]);
			else out[file]=this.selectionsByView[wid];
		}
		//todo sort range.
		return out;
	}	
	,onSetSelection:function(wid,filename,selections,cursorchar) {
		var sels={};
		Object.assign(sels,this.selectionsByView);
		sels[wid]=selections;
		this.cursorchar=cursorchar;
		this.selectionsByView=sels;
		this.fileOfView[wid]=filename;

		this.trigger(this.selectionFromView(),this.selectionsByView,cursorchar);
	}
	,onClearAllSelection:function() {
		this.selections={};
		this.trigger(this.selectionFromView(),this.selectionsByView,this.cursorchar);
	}
	,onClearSelectionOf:function(wid,filename) {
		var sels={};
		Object.assign(sels,this.selections);
		delete sels[wid];
		this.fileOfView[wid]=filename;

		this.selectionsByView=sels;
		this.trigger(this.selectionFromView(),this.selectionsByView,this.cursorchar);
	}
})
module.exports=SelectionStore;