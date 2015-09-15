var host=require("./rpc");

var makeinf=function(name) {
	return (
		function(opts,callback) {
			host.exec(callback,0,"fs",name,opts);
		});
}

var API={};
//TODO , create a cache object on client side to save network trafic on
//same getRaw
API.readFile=makeinf("readFile");
API.writeFile=makeinf("writeFile");
API.exists=makeinf("exists");
API.unlink=makeinf("unlink");
API.mkdir=makeinf("mkdir");
API.readdir=makeinf("readdir");


//API.closeAll=makeinf("closeAll");
//exports.version='0.0.13'; //this is a quick hack

host.exec(function(err,data){
	//console.log('version',err,data)
	exports.version=data;
},0,"fs","version",{});


module.exports=API;