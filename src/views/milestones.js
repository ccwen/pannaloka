var markuptypedef=require("../markuptypedef");
var markupAction=require("../actions/markup");

var docOf=require("../stores/docfile").docOf;
var findMilestone = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid][0]==obj) return mid;
    array[mid][0] < obj ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (array[low][0]==obj) return low;else return -1;
};

var buildMilestone=function(doc,markups) {
	var name2milestone={},line2milestone=[];

	for (var i in markups) {
		var m=markups[i];
		if (m.className!=="milestone") continue;
		var cur=m.handle.find();
		var t=doc.getRange(cur.from,cur.to);
		name2milestone[t]=m.key;
		line2milestone.push([cur.from.line,t]);
	}
	line2milestone.sort(function(a,b){
		return a[0]-b[0];
	});
	return {name2milestone:name2milestone,line2milestone:line2milestone};
}
var abs2milestone=function(line) {
	var idx=findMilestone(this.line2milestone,line,true)-1;
	if (idx==-1||idx>=this.line2milestone.length) return line;
	var ms=this.line2milestone[idx];

	return (line-ms[0]-1);
}
var selectionStore=require("../stores/selection");
var createMilestone=function(){
	var ranges=selectionStore.getRanges();
	if (ranges.length!==1)return;
	var text=selectionStore.getRangeText(0);
	createMS.call(this,text,ranges[0][1]);
}
var invalidChar=function(name) {
	var valid=[" ","\n","<",">","{","}","。","，","！","/","?","\\"]
	for (var i=0;i<name.length;i++) {
		var code=name.charCodeAt(0);
		var ch=name.charAt(0);
		if (i===0 && code<40) return ch;
		if (code<30) return ch;
		if (valid.indexOf(ch)>-1) return ch;
		if (code>0xDFFF) return ch;
	}
	return null;
}

var createMS=function(name,range) {
	if (range[0][1]!==range[1][1]) {
		console.error("cannot cross line");
		return;
	}
	if (this.name2milestone[name]) {
		console.error("repeated name",name);
		return;
	}
	if (name.length>15) {
		console.error("name too long",name);
		return;
	}
	var ch=invalidChar(name);
	if (ch) {
		console.error("invalid char",ch);
		return;
	}

	var line=range[0][1];
	//check overlap
	var idx=findMilestone(this.line2milestone,line);
	if (idx>-1) {
		console.log("already have milestone at this line");
		return;
	}
	var params={typename:"milestone",selections:selectionStore.selections,typedef:markuptypedef.types.milestone};
	markupAction.createMarkup(params);
}
var lineNumberFormatter=function(line){
	var doc=this.doc;
	if (!doc) return "";
	if (!this.line2milestone)return "";
	var ms=abs2milestone.call(this,line);
	return ms;
}
module.exports={buildMilestone:buildMilestone,createMilestone:createMilestone
	,lineNumberFormatter:lineNumberFormatter,abs2milestone:abs2milestone};