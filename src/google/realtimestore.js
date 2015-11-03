var Reflux=require("reflux");

var realtimestore=Reflux.createStore({
	listenables:[require("./realtimeaction")]
	,onLoggedIn:function(response) {
		this.response=response;
		console.log(response);
		//this.trigger(this.response);
	}
});
module.exports=realtimestore;