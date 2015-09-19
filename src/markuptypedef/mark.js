var uuid=require('../uuid');
var singleone=function(trait, docOf, cb) {
	var files=Object.keys(trait.selections);
	var range=trait.selections[files[0]][0];
	var key=uuid();

	var mrk={className:trait.typename, key:key, from:range[0],to:range[1]};

	var doc=docOf(files[0]);

	cb(0, [{markup:mrk, doc:doc}]);

}

var dualone=function(trait,docOf, cb) {
	var files=Object.keys(trait.selections);
	var range1=trait.selections[files[0]][0];
	var key1=uuid();

	var range2=trait.selections[files[1]][0];
	var key2=uuid();

	var mrk1={className:"quote"  , key:key1 , from:range1[0], to:range1[1], source:[files[1][0],key2] };
	var mrk2={className:"quoteby", key:key2 , from:range2[0], to:range2[1], by:[files[0][0],key1]};
	
	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	cb(0, [{markup:mrk1, doc:doc1}
				,{markup:mrk2, doc:doc2}] );
}
module.exports={singleone:singleone,dualone:dualone};