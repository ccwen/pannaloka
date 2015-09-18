var uuid=require('../uuid');
var singleone=function(trait, docOf, cb) {
	var files=Object.keys(trait.selections);

	var range=trait.selections[files[0]][0];
	var from={ch:range[0][0],line:range[0][1]};
	var to={ch:range[1][0],line:range[0][1]};
	var key=uuid();

	var mrk={className:trait.typename, key:key};

	var doc=docOf(files[0]);
	doc.markText( from, to, mrk);

	cb(0, [{from:from, to:to, trait:mrk, doc:doc}]);

}

var dualone=function(trait,docOf, cb) {
	var files=Object.keys(trait.selections);
	var range1=trait.selections[files[0]][0];
	var from1={ch:range1[0][0],line:range1[0][1]};
	var to1={ch:range1[1][0],line:range1[0][1]};
	var key1=uuid();

	var range2=trait.selections[files[1]][0];
	var from2={ch:range2[0][0],line:range2[0][1]};
	var to2={ch:range2[1][0],line:range2[0][1]};
	var key2=uuid();

	var mrk1={className:"quote"  , key:key1 , from:key2};
	var mrk2={className:"quoteby", key:key2 , by:key1};
	
	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	doc1.markText( from1, to1, mrk1);
	doc2.markText( from2, to2, mrk2);

	cb(0, [{from:from1 , to:to1, trait:mrk1, doc:doc1}
				,{from:from2 , to:to2, trait:mrk2, doc:doc2}] );
}
module.exports={singleone:singleone,dualone:dualone};