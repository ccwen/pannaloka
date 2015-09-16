/**
	runs on node, 
*/
var fs=require("fs");

var readdirmeta=function(opts,cb) {
	require("../src/node/readdirmeta")(opts.path,cb);
}
readdirmeta.async=true;
var rpc=function(service_holder) {
	service_holder["util"]={readdirmeta:readdirmeta};
	console.log("install UTIL rpc");
}
module.exports=rpc;