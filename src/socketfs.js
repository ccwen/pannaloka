var fs=(typeof process!=="undefined")?require("fs"):{}; // webpack.config.js node:{    fs:"empty" }
if (typeof fs.readFile=="undefined") {
	var rpcfs=require("./rpc/rpc_fs");	
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
	if (fs.readdir) fs.readdir(fn,cb);
	else {
		rpcfs.readdir({path:path},cb);
	}
}
module.exports={readFile:readFile,writeFile:writeFile,exists:exists,unlink:unlink,mkdir:mkdir,readdir:readdir};