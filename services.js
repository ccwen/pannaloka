/* edit this file to include new services */
var path=require("path");
var fs=require("fs");
var indexerentry="rpc_fs.js";
var abspath=path.resolve(process.cwd(),indexerentry);
if (!fs.existsSync(abspath)) {
	indexerentry="../"+indexerentry;
	abspath=path.resolve(process.cwd(),indexerentry);
}
var rpc_api=require(abspath);

var install_services=function( service_holder) {
	rpc_api(service_holder); 
}

module.exports=install_services;