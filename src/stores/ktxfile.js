var Reflux=require("reflux");
var socketfs=require("../socketfs");
var KTXFileStore=Reflux.createStore({
	listenables:[require("../actions/ktxfile")]
	,files:[]
	,loaddir:function(){
		socketfs.readdirmeta("ktx",function(err,data){
			if (!err) {
				this.files=data.filter(function(f){
						var ext=f.filename.substr(f.filename.length-4);
						if (ext!==".txt" && ext!==".ktx") return false;
						return f.filename!=="ktx/empty.ktx" && f.filename!=="ktx/dummy.ktx"
				});
				this.trigger(this.files);	
			}
		}.bind(this));
	}
	,init:function() {
		this.loaddir();
	}
	,onReload:function() {
		this.loaddir();
	}
	,newfilename:function() {
		return "ktx/"+Math.random().toString().substr(2,8)+".ktx";
	}
})
module.exports=KTXFileStore;