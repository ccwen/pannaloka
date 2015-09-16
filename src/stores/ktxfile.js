var Reflux=require("reflux");
var socketfs=require("../socketfs");
var KTXFileStore=Reflux.createStore({
	listenables:[require("../actions/stackwidget")]
	,files:[]
	,init:function() {
		socketfs.readdirmeta("ktx",function(err,data){
			if (!err) {
				this.files=data.filter(function(f){return f.filename!=="ktx/empty.ktx" && f.filename!=="ktx/dummy.ktx"});
				this.trigger(this.files);
			}
		}.bind(this));
	}
})
module.exports=KTXFileStore;