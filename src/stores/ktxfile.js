var Reflux=require("reflux");
var socketfs=require("../socketfs");
var KTXFileStore=Reflux.createStore({
	listenables:[require("../actions/stackwidget")]
	,files:[]
	,loaddir:function(){
		socketfs.readdirmeta("ktx",function(err,data){
			if (!err) {
				this.files=data.filter(function(f){return f.filename!=="ktx/empty.ktx" && f.filename!=="ktx/dummy.ktx"});
				console.log("trigger",this.files);
				setTimeout(function(){
					this.trigger(this.files);	
				}.bind(this),10);
				
			}
		}.bind(this));
	}
	,init:function() {
		this.loaddir();
	}
	,onReload:function() {
		this.loaddir();
	}
})
module.exports=KTXFileStore;