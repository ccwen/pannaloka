var fs=require("fs");
var linecount=0,sizecount=0;
var linesOf=[];
require("glob")("src/**/*.js",function(err,files){
	files.map(function(file){
		var content=fs.readFileSync(file,"utf8");
		sizecount+=content.length;
		lineof=content.split("\n").length;
		linecount+=lineof;
		linesOf.push([lineof,file]);
	});
	linesOf.sort(function(a,b){return a[0]-b[0]});
	console.log(linesOf);
	console.log("files:",files.length,",size:",sizecount,",lines of code",linecount,",average",Math.round(sizecount/linecount));
})
