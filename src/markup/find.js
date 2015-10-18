var byMasterText=function(text,markups) {
	var out=[];
	for (var key in markups) {
		var m=markups[key].handle;
		if (!m)continue;
		var pos=m.find();
		if (!pos.to) continue;
		if (pos.from.line!==pos.to.line) continue;//cross line
		var len=pos.to.ch-pos.from.ch;
		if (len!==text.length) continue;
		var rangetext=m.doc.getRange(pos.from,pos.to);
		if (rangetext===text){
			out.push(m.key);
		}
	}
	return out;
}
module.exports={byMasterText:byMasterText};