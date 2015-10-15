var types=require("../markuptypedef").types;
var milestone_novalidate=require("../markuptypedef").milestone_novalidate;
var validTextRange=require("../markuptypedef/validatemilestone").validTextRange;
var markupAction=require("../actions/markup");
var CodeMirror=require("codemirror");
var milestones=require("ksana-codemirror").milestones;
var docOf=require("../stores/docfile").docOf;

var selectionStore=require("../stores/selection");
/*
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

var canCreateMS=function(name,range) {
	if (range[0][1]!==range[1][1]) return "cannot cross line";
	if (this.doc.name2milestone[name]) return "repeated";
	if (name.length>15) return "name too long";

	var ch=invalidChar(name);
	if (ch) return "invalid char"+ch;

	var line=range[0][1];
	//check overlap
	var idx=milestones.findMilestone(this.doc.line2milestone,line);
	if (idx>-1) return "already have milestone at this line";
	return null;
}
*/

var createMS=function(name,range) {
	var err=validTextRange.call(this.doc,name,range);
	if (!err){
		var o={typename:"milestone",selections:selectionStore.selections,typedef:types.milestone};
		markupAction.createMarkup(o);	
	}
	return err;
}

var markMilestone=function(cm) { //convert cursor to 
	var doc=cm.getDoc();
	var name=doc.getSelection();
	var sel=doc.listSelections()[0];
	var range=[ [sel.anchor.ch,sel.anchor.line],[sel.head.ch,sel.head.line]];
	var err=createMS.call(cm.react,name,range);
	if (!err) {
		//temporary set the name to check uniqueness, valid until next rebuildMilestone
		doc.name2milestone[name]=true;
	}
	return err;
}
CodeMirror.commands.markMilestone=markMilestone; //uses by ksana-codemirror/automarkup

//create from batch replace
var createMilestones=function(ranges,cb) { //this is CodeMirror instance
	var doc=this.getDoc();
	this.operation(function(){
		var out=[];
		for (var i=0;i<ranges.length;i++){
			out.push(milestone_novalidate(doc,ranges[i]));
		}
		cb(out);
	});
}


module.exports=createMilestones;