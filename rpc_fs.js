/**
	runs on node, 
*/
var fs=require("fs");

var readFile=function(opts,cb) {
	fs.readFile(opts.filename,opts.enc||"utf8",cb);
}
readFile.async=true;

var writeFile=function(opts,cb) {
	console.log("writing",opts.data.length,"bytes",opts.opts)
	fs.writeFile(opts.filename,opts.data,opts.opts,cb);
}
writeFile.async=true;

var exists=function(opts,cb) {
	fs.exists(opts.filename,cb);
}
exists.async=true;

var unlink=function(opts,cb) {
	fs.unlink(opts.filename,cb);
}
unlink.async=true;
var mkdir=function(opts,cb) {
	fs.mkdir(opts.path,opts.mode,cb);
}
mkdir.async=true;
var readdir=function(opts,cb) {
	fs.readdir(opts.path,cb);
}
readdir.async=true;
var rpc=function(service_holder) {
	service_holder["fs"]={readFile:readFile,writeFile:writeFile,exists:exists,unlink:unlink,mkdir:mkdir,readdir:readdir};
	console.log("install FS rpc");
}
module.exports=rpc;