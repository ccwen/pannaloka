/**
	read all ktx files and return meta json
*/
var fs=require("fs");
var readdirmeta=function(path,cb){
	var files=fs.readdirSync(path);
	if (!files) {
		cb("cannot readdir");
		return ;
	}

	cb(0,files.map(function(file){
		try {
			file=path+'/'+file;
			var stat=fs.statSync(file);
			var f=fs.openSync(file,"r");
			var buffer = new Buffer(16*1024); //header should less than 16K

			fs.readSync(f,buffer,0,16*1024,0);
			var s=buffer.toString("utf8");
			var idx=s.indexOf("\n");

			var meta=JSON.parse(s.substr(0,idx));
			fs.closeSync(f);

			meta.name=file;
			meta.stat=stat;
			return meta;
		} catch(e) {
			console.log(e);
		}
	}));
}
module.exports=readdirmeta;