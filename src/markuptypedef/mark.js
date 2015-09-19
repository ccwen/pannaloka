var uuid=require('../uuid');
var validate=require('./validateselection');
var singleone=function(trait, docOf, cb) {
	var selections=validate.singleone(trait.selections);
	if (!selections) return ;
	var files=Object.keys(selections);
	var range=selections[files[0]][0];
	var key=uuid();

	var mrk={className:trait.typename, from:range[0],to:range[1]};

	var doc=docOf(files[0]);

	cb(0, [{markup:mrk, doc:doc, key:key}]);

}

var dualone=function(trait,docOf, cb) {
	var selections=validate.dualone(trait.selections);
	if (!selections) return ;

	var files=Object.keys(selections);
	var range1=selections[files[0]][0];
	var key1=uuid();

	var range2=selections[files[1]][0];
	var key2=uuid();

	var mrk1={className:"quote"  , from:range1[0], to:range1[1], source:[files[1],key2] };
	var mrk2={className:"quoteby", from:range2[0], to:range2[1], by:[files[0],key1]};
	
	var doc1=docOf(files[0]);
	var doc2=docOf(files[1]);

	cb(0, [{markup:mrk1, doc:doc1, key:key1}
				,{markup:mrk2, doc:doc2, key:key2}] );
}
module.exports={singleone:singleone,dualone:dualone};