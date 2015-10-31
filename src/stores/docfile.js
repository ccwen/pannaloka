//doc and filename mapping
//wid, doc, filename

var Reflux=require("reflux");

var docFileStore=Reflux.createStore({
	docfile:[]
	,cm:null
	,listenables:[require("../actions/docfile")]
	,onOpenFile:function(doc,filename,trait) {
		this.docfile=this.docfile.filter(function(df){
			return  df[0]!==doc;
		});
		this.docfile=[[doc,filename,trait]].concat(this.docfile);
		this.trigger(this.docfile,{action:"open"});
	}
	,onCloseFile:function(file) {
		var doc=this.docOf(file);
		if (this.cm && this.cm.getDoc()===doc) {
			this.cm==null;
		}
		
		this.docfile=this.docfile.filter(function(df){
			return  df[1]!==file;
		});
		this.trigger(this.docfile,{action:"close"});
	}
	,onUpdateTrait:function(file,trait) {
		var remain=this.docfile.filter(function(df){
			return  df[1]===file;
		});
		if (remain.length) {
			remain[0][2]=JSON.parse(JSON.stringify(trait));
		}

		this.trigger(this.docfile,{action:"update"});
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
	,traitOf:function(file) {
		var remain=this.docfile.filter(function(df){
			return  df[1]===file;
		});
		if (remain.length) return remain[0][2];
	}
	,getActiveEditor() {
		return this.cm;
	}
	,onSetActiveEditor:function(cm) {
		this.cm=cm;
	}
});
module.exports=docFileStore;