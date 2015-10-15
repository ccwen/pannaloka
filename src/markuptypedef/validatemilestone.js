var filterEmptyRange=require("./util").filterEmptyRange;
var selectionstore=require("../stores/selection");
var docfilestore=require("../stores/docfile");
var milestones=require("ksana-codemirror").milestones;
var milestone=function(selections) {
	var sels=filterEmptyRange(selections);
	var keys=Object.keys(sels);
	if (keys.length!==1) return null;
	if (sels[keys[0]].length!==1) return null;
	var range=sels[keys[0]][0];
	var doc=docfilestore.docOf(keys[0]);
	var text=selectionstore.getRangeText(0);
	if (validTextRange.call(doc,text,range)!=null) return null;
	return sels;
}
var invalidChar=function(name) {
	var valid=[" ","\n","．","<",">","{","}","。","，","！","/","?","\\"]
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

var validTextRange=function(text,range) {
	if (range[0][1]!==range[1][1]) return "cannot cross line";
	if (this.name2milestone[text]) return "repeated";
	if (text.length>15) return "name too long";

	var ch=invalidChar(text);
	if (ch) return "invalid char"+ch;

	var line=range[0][1];
	//check overlap
	var idx=milestones.findMilestone(this.line2milestone,line);
	if (idx>-1) return "already have milestone at this line";
	return null;
}

module.exports={milestone:milestone,validTextRange:validTextRange};