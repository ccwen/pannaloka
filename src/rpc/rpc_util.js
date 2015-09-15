var host=require("./rpc");

var makeinf=function(name) {
	return (
		function(opts,callback) {
			host.exec(callback,0,"util",name,opts);
		});
}

var API={};
//TODO , create a cache object on client side to save network trafic on
//same getRaw
API.readdirmeta=makeinf("readdirmeta");

host.exec(function(err,data){
	//console.log('version',err,data)
	exports.version=data;
},0,"util","version",{});


module.exports=API;