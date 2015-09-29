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
var lineNumberFormatter=function(line){
	var doc=this.doc;
	if (!doc) return "";
	if (!this.line2milestone)return "";
	var ms=abs2milestone.call(this,line);
	return ms;
}
module.exports={buildMilestone:buildMilestone
	,lineNumberFormatter:lineNumberFormatter,abs2milestone:abs2milestone};