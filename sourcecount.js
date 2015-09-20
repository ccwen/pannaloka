var fs=require("fs");
var linecount=0,sizecount=0;
require("glob")("src/**/*.js",function(err,files){
	files.map(function(file){
		var content=fs.readFileSync(file,"utf8");
		sizecount+=content.length;
		linecount+=content.split("\n").length;
	});
	console.log("files:",files.length,",size:",sizecount,",lines of code",linecount);
})
