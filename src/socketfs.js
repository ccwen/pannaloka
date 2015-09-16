var fs=(typeof process!=="undefined")?require("fs"):{}; // webpack.config.js node:{    fs:"empty" }
if (typeof fs.readFile=="undefined") {
	var rpcfs=require("./rpc/rpc_fs");	
	var rpcutil=require("./rpc/rpc_util");	
}

var dataroot="data/";
var readFile=function(fn,opts,cb) {
	if (fs.readFile) fs.readFile(dataroot+fn,opts,cb);
	else {
		if (typeof opts==="function") {
			cb=opts;
			opts=null;
		}
		rpcfs.readFile({filename:dataroot+fn,opts:opts},cb);
	}
}
var writeFile=function(fn,data,opts,cb) {
	if (fs.writeFile) fs.writeFile(dataroot+fn,data,opts,cb);
	else {
		if (typeof opts==="function") {
			cb=opts;
			opts=null;
		}
		rpcfs.writeFile({filename:dataroot+fn,opts:opts,data:data},cb);
	}
}
var exists=function(fn,cb){
	if (fs.exists) fs.exists(dataroot+fn,cb);
	else {
		rpcfs.exists({filename:dataroot+fn},cb);
	}
}

var unlink=function(fn,cb){
	if (fs.unlink) fs.unlink(dataroot+fn,cb);
	else {
		rpcfs.unlink({filename:dataroot+fn},cb);
	}
}
var mkdir=function(path,mode,cb) {
	if (fs.mkdir) fs.mkdir(dataroot+path,cb);
	else {
		if (typeof mode==="function") {
			cb=mode;
			mode=null;
		}
		rpcfs.mkdir({path:dataroot+path,mode:mode},cb);
	}
}
var readdir=function(path,cb) {
	if (fs.readdir) fs.readdir(dataroot+path,cb);
	else {
		rpcfs.readdir({path:dataroot+path},cb);
	}
}

var readdirmeta=function(path,cb) {//read all meta in given path
	if (fs.readdir) {
		require("./node/readdirmeta")(dataroot,path,cb);
	} else {
		rpcutil.readdirmeta({dataroot:dataroot,path:path},cb);
	}

}
module.exports={readFile:readFile,writeFile:writeFile,exists:exists,
	unlink:unlink,mkdir:mkdir,readdir:readdir,readdirmeta:readdirmeta};