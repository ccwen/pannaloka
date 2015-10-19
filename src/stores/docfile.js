//doc and filename mapping
//wid, doc, filename

var Reflux=require("reflux");

var docFileStore=Reflux.createStore({
	docfile:[]
	,listenables:[require("../actions/docfile")]
	,onOpenFile:function(doc,filename) {
		this.docfile=this.docfile.filter(function(df){
			return  df[0]!==doc;
		});
		this.docfile=[[doc,filename]].concat(this.docfile);
		this.trigger(this.docfile);
	}
	,onCloseFile:function(doc) {
		this.docfile=this.docfile.filter(function(df){
			return  df[0]!==doc;
		});
		this.trigger(this.docfile);
	}
	,getDocs:function() {
		return this.docfile.map(function(df){
			return df[0];
		});
	}
	,fileOf:function(doc) {
		var remain=this.docfile.filter(function(df){
			return  df[0]===doc;
		});
		if (remain.length) return remain[0][1];
	}
	,docOf:function(file) {
		var remain=this.docfile.filter(function(df){
			return  df[1]===file;
		});
		if (remain.length) return remain[0][0];
	}
});
module.exports=docFileStore;