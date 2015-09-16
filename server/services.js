/* edit this file to include new services */
var path=require("path");
var fs=require("fs");

var resolvepath=function(entry){
	var abspath=path.resolve(process.cwd(),entry);
	if (!fs.existsSync(abspath)) {
		entry="../"+entry;
		abspath=path.resolve(process.cwd(),entry);
	}
	return abspath;
}

var install_services=function( service_holder) {
	require(resolvepath("server/rpc_fs.js"))(service_holder); 
	require(resolvepath("server/rpc_util.js"))(service_holder); 
}

module.exports=install_services;