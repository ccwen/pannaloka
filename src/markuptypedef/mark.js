var uuid=require('../uuid');
var validate=require('./validateselection');
var validatemilestone=require('./validatemilestone');
var util=require("./util");
var milestones=require("ksana-codemirror").milestones;
var MAX_LABEL=5;
var singleone=function(params, docOf, cb) {
	var selections=validate.singleone(params.selections);
	if (!selections) return ;
	var files=Object.keys(selections);
	var range=selections[files[0]][0];
	var key=uuid();

	var mrk={className:params.typename, trait:params.trait,from:range[0],to:range[1]};

	var doc=docOf(files[0]);

	cb(0, [{markup:mrk, doc:doc, key:key}]);

}
var milestone_novalidate=function(doc,range,trait) {
	var key=uuid();
	return {markup:{className:"milestone", trait:trait,
	from:range[0],to:range[1],automic:true,readOnly:true}
		,doc:doc,key:key};
}

var milestone=function(params, docOf, cb) {
	var selections=validatemilestone.milestone(params.selections);
	if (!selections) return ;
	var files=Object.keys(selections);
	var range=selections[files[0]][0];

	var doc=docOf(files[0]);
	var mrk=milestone_novalidate(doc,range,params.trait);
	cb(0, [mrk]);
}


var dualone=function(mark,docOf, cb) {
	var selections=validate.dualone(mark.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var range1=selections[files[0]][0];
	var key1=uuid();

	var range2=selections[files[1]][0];
	var key2=uuid();

	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	var text1=getTrimedRangeText(doc1,range1); 
	var text2=getTrimedRangeText(doc2,range2); 


	var mrk1={className:mark.typename , trait:mark.trait, from:range1[0], to:range1[1], target:[files[1],key2,text2] };
	var mrk2={className:mark.typename+"2", from:range2[0], to:range2[1], target:[files[0],key1,text1]};
	

	cb(0, [{markup:mrk1, doc:doc1, key:key1}
				,{markup:mrk2, doc:doc2, key:key2}] );
}

var oneway=function(mark,docOf, cb) {
	var selections=validate.dualone(mark.selections);
	if (!selections) return ;

	var files=[];
	for (var i in selections) files.push(i);//cannot use Object.keys, files should not be sorted

	var range1=selections[files[0]][0];
	var key1=uuid();

	var range2=selections[files[1]][0];

	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	var text2=getTrimedRangeText(doc2,range2); 

	var packed=milestones.pack.call(doc2,[range2[0],range2[1]]);
	var mrk1={className:mark.typename, trait:mark.trait, from:range1[0], to:range1[1], 
		target:[files[1],packed,text2] };

	cb(0, [{markup:mrk1, doc:doc1, key:key1}] );
}

var singletwo=function(mark,docOf,cb) {
	var selections=validate.singletwomore(mark.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var doc1=docOf(files[0]);
	var key=uuid();

	var ranges=selections[files[0]];

	var markups=[],master;
	for (var i=0;i<ranges.length;i++) {
		var cls=mark.typename, newkey=uuid();
		if (i) cls+="2";
		var obj={className:cls, from:ranges[i][0],to:ranges[i][1] };
		if (i==0) {
			master=obj.others=[];
			newkey=key;
		} else {
			obj.master=key;
			master.push(newkey);
		}
		markups.push({markup:obj,doc:doc1,key:newkey});
	}
	cb(0, markups);
}



var dualonemore=function(mark,docOf, cb) {
	var selections=validate.dualonemore(mark.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var range1=selections[files[0]][0];
	var key=uuid();

	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	var text1=getTrimedRangeText(doc1,range1);

	var mrk1={className:mark.typename, from:range1[0], to:range1[1], target:[] };

	var ranges=selections[files[1]];

	var markups=[{markup:mrk1,doc:doc1,key:key}],master=[files[0],key,text1];
	for (var i=0;i<ranges.length;i++) {

		var text2=getTrimedRangeText(doc2,ranges[i]);
		
		var cls=mark.typename+"2", newkey=uuid();

		var obj={className:cls, from:ranges[i][0],to:ranges[i][1] ,target:master};
		mrk1.target.push([files[1],newkey,text2]);
		markups.push({markup:obj,doc:doc2,key:newkey});
	}	

	cb(0, markups );
}

var getTrimedRangeText=function(doc,range) {
	var text=util.getRangeText(doc,range);
	if (text.length>MAX_LABEL) text=text.substr(0,MAX_LABEL)+"…";	
	return text;
}

var multi=function(mark,docOf, cb) {
	var selections=validate.multi(mark.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var doc1_ranges=selections[files[0]];
	var doc1_range1=selections[files[0]][0];
	var key=uuid();
	var doc1=docOf(files[0]);
	var doc1_text1=getTrimedRangeText(doc1,doc1_range1);

	var mastermrk={className:mark.typename, from:doc1_range1[0], to:doc1_range1[1], target:[] };
	var markups=[{markup:mastermrk,doc:doc1,key:key}],master=[files[0],key,doc1_text1];

	//same doc
	for (var i=1;i<doc1_ranges.length;i++) {
		var r=doc1_ranges[i];
		var text=getTrimedRangeText(doc1,doc1_ranges[i]);
		var mrk2={className:mark.typename+'2', from:r[0], to:r[1], target:[],target:master };
		var newkey=uuid();
		mastermrk.target.push([files[0],newkey,text]);
		markups.push({markup:mrk2,doc:doc1,key:newkey})
	}
	
	for (var i=1;i<files.length;i++) { //foreign doc
		var ranges=selections[files[i]];
		var fdoc=docOf(files[i]);
		for (var j=0;j<ranges.length;j++) {
			var ftext=getTrimedRangeText(fdoc,ranges[j]);
			var newkey=uuid();
			var cls=mark.typename+"2", newkey=uuid();
			var obj={className:cls, from:ranges[j][0],to:ranges[j][1] ,target:master};
			mastermrk.target.push([files[i],newkey,ftext]);
			markups.push({markup:obj,doc:fdoc,key:newkey});
		}	
	}

	cb(0, markups );
}


module.exports={singleone:singleone,dualone:dualone,singletwo:singletwo,dualonemore:dualonemore,
	milestone:milestone,milestone_novalidate:milestone_novalidate,oneway:oneway,multi:multi};