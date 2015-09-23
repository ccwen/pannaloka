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

	try {
		var out=files.map(function(file){
			var fullname=dataroot+path+'/'+file;
			var stat=fs.statSync(fullname);
			var f=fs.openSync(fullname,"r");
			var buffer = new Buffer(16*1024); //header should less than 16K

			fs.readSync(f,buffer,0,16*1024,0);
			var s=buffer.toString("utf8");
			var idx=s.indexOf("\n");
			try {
				var firstline=s.substr(0,idx).trim();
				if (firstline[0]==="[") {
					firstline=firstline.substr(1); //for ktx
					var last=firstline[firstline.length-1];
					if (last!=="}") firstline=firstline.substr(0,firstline.length-1);
				}
				var meta=JSON.parse(firstline);
			} catch (e) {
				meta={title:file.substr(0,file.lastIndexOf("."))};
			}
			fs.closeSync(f);
			meta.filename=path+'/'+file;
			meta.stat=stat;
			return meta;
		});
	} catch(e) {
			console.log(e);
	}
	setTimeout(function(){
		cb(0,out);
	},10);//wait for nw 
}
module.exports=readdirmeta;