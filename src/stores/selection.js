var Reflux=require("reflux");
var docfile=require("./docfile");
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
	,hasRange:function() {
		return this.getRanges().length>0;
	}
	,getRanges:function () {
		var out=[]; // selections, filename
		for (var i in this.selections) {
			for (var j in this.selections[i]) {
				if (this.selections[i][j].length>1) {
					out.push( [ this.selections[i][j] , i ] );
				}
			}
		}
		return out;
	}
	,getRangeText:function(idx) {
		var ranges=this.getRanges();
		if (idx>ranges.length-1)return null;
		var r=ranges[idx][0];
		var doc=docfile.docOf(ranges[idx][1]);

		var from={line:r[0][1],ch:r[0][0]},to={line:r[1][1],ch:r[1][0]} ;
		return doc.getRange(from,to);
	}
})
module.exports=selectionStore;