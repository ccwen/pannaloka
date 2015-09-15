var fs=(typeof process!=="undefined")?require("fs"):{}; // webpack.config.js node:{    fs:"empty" }
if (typeof fs.readFile=="undefined") {
	var rpcfs=require("./rpc/rpc_fs");	
	var rpcutil=require("./rpc/rpc_util");	
}

var readFile=function(fn,opts,cb) {
	if (fs.readFile) fs.readFile(fn,opts,cb);
	else {
		if (typeof opts==="function") {
			cb=opts;
			opts=null;
		}
		rpcfs.readFile({filename:fn,opts:opts},cb);
	}
}
var writeFile=function(fn,data,opts,cb) {
	if (fs.writeFile) fs.writeFile(fn,data,opts,cb);
	else {
		if (typeof opts==="function") {
			cb=opts;
			opts=null;
		}
		rpcfs.writeFile({filename:fn,opts:opts,data:data},cb);
	}
}
var exists=function(fn,cb){
	if (fs.exists) fs.exists(fn,cb);
	else {
		rpcfs.exists({filename:fn},cb);
	}
}

var unlink=function(fn,cb){
	if (fs.unlink) fs.unlink(fn,cb);
	else {
		rpcfs.unlink({filename:fn},cb);
	}
}
var mkdir=function(path,mode,cb) {
	if (fs.mkdir) fs.unlink(path,cb);
	else {
		if (typeof mode==="function") {
			cb=mode;
			mode=null;
		}
		rpcfs.mkdir({path:path,mode:mode},cb);
	}
}
var readdir=function(path,cb) {
	if (fs.readdir) fs.readdir(path,cb);
	else {
		rpcfs.readdir({path:path},cb);
	}
}

var readdirmeta=function(path,cb) {//read all meta in given path
	if (fs.readdir) {
		require("./node/readdirmeta")(path,cb);
	} else {
		rpcutil.readdirmeta({path:path},cb);
	}

}
module.exports={readFile:readFile,writeFile:writeFile,exists:exists,
	unlink:unlink,mkdir:mkdir,readdir:readdir,readdirmeta:readdirmeta};