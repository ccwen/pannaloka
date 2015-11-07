var Reflux=require("reflux");
var stackwidgetaction=require("../actions/stackwidget");
var realtimestore=Reflux.createStore({
	listenables:[require("./realtimeaction")]
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
	,onOpenFile:function(docid,title,opts,cb,onFileInitialized){
		this.realtimeUtils.load(docid, function(doc){
    	var obj={filename:docid,host:"google",doc:doc,title:title};
    	stackwidgetaction.openWidget(obj,"TextWidget",opts);
    	if (cb) cb();
    },onFileInitialized);
	}
});
module.exports=realtimestore;