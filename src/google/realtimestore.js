var Reflux=require("reflux");
var stackwidgetaction=require("../actions/stackwidget");
var docOf=require("../stores/docfile").docOf;

var realtimestore=Reflux.createStore({
	listenables:[require("./realtimeaction")]
	,init:function() {
		this.recentFiles=JSON.parse(localStorage.getItem("recentfiles")||"[]");
	}
	,onLoggedIn:function(response) {
		this.response=response;
		//console.log(response);
	}
	,onSetRealtimeUtils:function(realtimeUtils) {
		this.realtimeUtils=realtimeUtils;
	}
	,getRealtimeUtils:function(){
		return this.realtimeUtils;
	}
	,onCreateFile:function(title,cb){
		this.realtimeUtils.createRealtimeFile(title,cb);
	}
	,addRecentFile:function(fileid,title){
		this.recentFiles=this.recentFiles.filter(function(recent){return recent[0]!==fileid});
		this.recentFiles.unshift([fileid,title]);
		this.trigger(this.recentFiles);
		localStorage.setItem("recentfiles",JSON.stringify(this.recentFiles));
	}
	,onClearRecent:function(){
		if (this.recentFiles.length>20) this.recentFiles.length=20;
		localStorage.setItem("recentfiles",JSON.stringify(this.recentFiles));
		this.trigger(this.recentFiles);
	}
	,getRecentFiles:function(){
		return this.recentFiles;
	}
	,onOpenFile:function(docid,title,opts,cb,onFileInitialized){
		if (docOf(docid))return;
		opts=opts||{};
		this.realtimeUtils.load(docid, function(doc){
    	var obj={filename:docid,host:"google",doc:doc,title:title,openToc:opts.openToc};
    	stackwidgetaction.openWidget(obj,"TextWidget",opts);
    	this.addRecentFile(docid,title);
    	if (cb) cb();
    }.bind(this),onFileInitialized);
	}
});
module.exports=realtimestore;