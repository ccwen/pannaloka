/**
	read all ktx files and return meta json
*/
var fs=require("fs");
var readdirmeta=function(dataroot,path,cb){
	var files=fs.readdirSync(dataroot+path);
	if (!files) {
		cb("cannot readdir");
		return ;
	}

	cb(0,files.map(function(file){
		try {
			var fullname=dataroot+path+'/'+file;
			var stat=fs.statSync(fullname);
			var f=fs.openSync(fullname,"r");
			var buffer = new Buffer(16*1024); //header should less than 16K

			fs.readSync(f,buffer,0,16*1024,0);
			var s=buffer.toString("utf8");
			var idx=s.indexOf("\n");

			var meta=JSON.parse(s.substr(0,idx));
			fs.closeSync(f);
			meta.filename=path+'/'+file;
			meta.stat=stat;
			return meta;
		} catch(e) {
			console.log(e);
		}
	}));
}
module.exports=readdirmeta;