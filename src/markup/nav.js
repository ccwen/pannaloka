/*sort markup by position, group by type */
var docfilestore=require("../stores/docfile");
var byFile={};
var allmarkups=null;

var sortByPos=function(arr){
	arr.sort(function(a,b){
		return a[1]===b[1]? (a[2]-b[2]) : a[1]-b[1];
	});
}
// this function must be call when ever add/remove of markups
// if type is not given, all types will be rebuilt
var rebuild=function(file,type) { 
	if (!allmarkups)return;

	var byType=byFile[file];
	if (!byType) byType=byFile[file]={};

	if (type) {
		byFile[file][type]=byType[type]=[];
	} else {
		byFile[file]=byType={};
	}

	for (var key in allmarkups) {

		var M=allmarkups[key];
		if (type && M.className!==type) continue;

		if (!byType[M.className]) byType[M.className]=[];
		var pos=M.handle.find();
		if (!pos || !pos.from) continue;//bookmark

		var posarr=[key, pos.from.line, pos.from.ch];

		byType[M.className].push(posarr);
	}	
	if (type) {
		sortByPos(byType[type]);
	} else {
		for (var t in byType) sortByPos(byType[t]);
	}
}

var setMarkups=function(markups,filename,norebuild) {
	allmarkups=markups;
	if (!norebuild) rebuild(filename);
}

var next=function(markup) { // O(N)
	if (!markup||!markup.handle) return;
	var file=docfilestore.fileOf(markup.handle.doc);
	var byType=byFile[file];
	if (!byType)return;

	var type=markup.className;
	var arr=byType[type];
	if (!arr||!arr.length)return;
	for (var i=0;i<arr.length;i++) {
		if (arr[i][0]==markup.key) {
			if (i===arr.length-1) return arr[0][0];
			else return arr[i+1][0];
		}
	}
}
var prev=function(markup) { //O(N)
	if (!markup||!markup.handle) return;
	var file=docfilestore.fileOf(markup.handle.doc);
	var byType=byFile[file];
	if (!byType)return;

	var type=markup.className;
	var arr=byType[type];
	if (!arr||!arr.length)return;
	for (var i=0;i<arr.length;i++) {
		if (arr[i][0]==markup.key) {
			if (i===0) return arr[arr.length-1][0];
			else return arr[i-1][0];
		}
	}
}

module.exports={next:next,prev:prev,rebuild:rebuild,setMarkups:setMarkups};