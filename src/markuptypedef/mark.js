var uuid=require('../uuid');
var singleone=function(trait, docOf, cb) {
	var files=Object.keys(trait.selections);
	
	var range=trait.selections[files[0]][0];
	var from={ch:range[0][0],line:range[0][1]};
	var to={ch:range[1][0],line:range[0][1]};
	var key=uuid();
	var mrk={className:trait.typename, key:key };

	var doc=docOf(files[0]);
	doc.markText( from,to , mrk);
	cb(0, [{from:from , to:to, trait:mrk, doc:doc}] );
}
module.exports={singleone:singleone};