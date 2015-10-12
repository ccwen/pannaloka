var Reflux=require("reflux");
var docfile=require("./docfile");
var milestones=require("ksana-codemirror").milestones;

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
	,getRanges:function (opts) {
		opts=opts||{};
		var out=[]; // filename, selections
		for (var i in this.selections) {
			for (var j in this.selections[i]) {
				if (this.selections[i][j].length>1) {
					var r=[i, this.selections[i][j] ];
					if (opts.textLength) {
						var text=this.getRangeText(r);
						if (text.length>opts.textLength) {
							text=text.substr(0,opts.textLength)+"…";
						}
						r.push(text);
					}
					out.push(r);
				}
			}
		}
		if (opts.pack) {

			out=out.map(function(range){
				var doc=docfile.docOf(range[0]);
				return [range[0],milestones.pack.call(doc,range[1]),range[2]];
			});
		}
		return out;
	}
	,getRangeText:function(idx_range) {
		if (typeof idx_range==="number") {
			var ranges=this.getRanges();
			if (idx_range>ranges.length-1)return null;
			var r=ranges[idx_range][1];			
			var doc=docfile.docOf(ranges[idx_range][0]);
		} else {
			var r=idx_range[1]; //send in 
			var doc=docfile.docOf(idx_range[0]);
		}

		var from={line:r[0][1],ch:r[0][0]},to={line:r[1][1],ch:r[1][0]} ;
		return doc.getRange(from,to);
	}
})
module.exports=selectionStore;