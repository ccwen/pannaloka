var textMarker2json=require("ksana-codemirror").textMarker2json;
var json2textMarker=require("ksana-codemirror").json2textMarker;
var realtimeaction=require("../google/realtimeaction");

var TEXT_DELETED,TEXT_INSERTED,VALUES_ADDED,VALUES_REMOVED,VALUE_CHANGED;
var load=function(doc,title,cb){
		this._changes=[];
		var _markups=doc.getModel().getRoot().get('markups');
		var markups=loadMarkupFromGoogleDrive.call(this,_markups);
		var _toc=doc.getModel().getRoot().get('toc'); 
		if (!_toc) {
			_toc=doc.getModel().createList()
			doc.getModel().getRoot().set('toc',_toc);
		}
		var toc=loadTOCFromGoogleDrive.call(this,_toc,title);
		var _text=doc.getModel().getRoot().get('text'); 
		var data={value:_text.text, meta:{title:title}, markups:markups
		, _markups:_markups, _text:_text ,_doc:doc , _toc:_toc, toc:toc};

		TEXT_INSERTED=gapi.drive.realtime.EventType.TEXT_INSERTED;
		TEXT_DELETED=gapi.drive.realtime.EventType.TEXT_DELETED;
		VALUES_ADDED=gapi.drive.realtime.EventType.VALUES_ADDED;
		VALUES_REMOVED=gapi.drive.realtime.EventType.VALUES_REMOVED;
		VALUE_CHANGED=gapi.drive.realtime.EventType.VALUE_CHANGED;

		_text.addEventListener(TEXT_INSERTED,inserttext.bind(this));
		_text.addEventListener(TEXT_DELETED,deletetext.bind(this));

		_markups.addEventListener(VALUE_CHANGED,markupchanged.bind(this));
		this.setState(data,function(){
			this.loaded();
			if (cb) cb.call(this);
		}.bind(this));
}
var loadTOCFromGoogleDrive=function(model,title) {
	var toc=model.asArray();
	if (toc.length===0) {
		toc.push({d:1,t:"first item"});
	}
	toc.unshift({d:0,t:title});
	return toc;
}
var loadMarkupFromGoogleDrive=function(markups) {
	var out={};
	var keys=markups.keys(),values=markups.values();
	for (var i=0;i<keys.length;i++) {
		var k=keys[i]
		var v=values[i];
		out[k]={};
		for (var key in v){
			out[k][key]=v[key];
		}
	}
	return out;
}
var setTitle=function(fileid,title,cb){
	gapi.client.load('drive', 'v2', function() {  
		var renameRequest = gapi.client.drive.files.patch({
            fileId: fileid,
            resource: { title: title }
    });
		renameRequest.execute(function(resp) {
			cb(0,resp.title);
    });
	});
}
var inserttext=function(e) {
	if (e.isLocal) return;
  var from  = this.cm.posFromIndex(e.index);
  this.ignore_change = true ;
  this.cm.replaceRange(e.text, from, from);
	this.ignore_change = false ;
}

var deletetext=function(e) {
	if (e.isLocal) return;
  var from = this.cm.posFromIndex(e.index) ;
	var to   = this.cm.posFromIndex(e.index + e.text.length) ;

  this.ignore_change = true ;
  this.cm.replaceRange("", from, to);
	this.ignore_change = false ;
}

var markupadded=function(e){
	if (e.isLocal) return;
	var m={};
	for (var i in e.newValue) {
		m[i]=e.newValue[i];
	}
	json2textMarker.call(this,this.cm,e.property,m);
	this.state.markups[e.property]=m;
}
var markupmodified=function(e){
	var newtrait={};
	if (!e.newValue.trait) return;

	for (var key in e.newValue.trait){
		newtrait[key]=newValue.trait[key];
	}
	var M=this.state.markups[e.property];
	if (newValue.from) M.from=JSON.parse(JSON.stringify(e.newValue.from));
	if (newValue.to) M.to=JSON.parse(JSON.stringify(e.newValue.to));

	M.trait=newtrait;
}
var markupdelete=function(e){
	if (e.isLocal) return;

	var m=this.getMarkup(e.property);
	delete this.state.markups[e.property];//in this.state.markups
	if (m && m.handle) m.handle.clear();
}
var markupchanged=function(e){
	if (e.isLocal) return;

	if (e.oldValue===null && e.newValue) markupadded.call(this,e);
	else if (e.newValue===null && e.oldValue) markupdelete.call(this,e);
	else markupmodified.call(this,e);
}

var beforeChange=function(cm,changeObj) {
	if (!this.isGoogleDriveFile())return;
	if (this.ignore_change) return;

	var coString=this.state._text;

  var from  = this.cm.indexFromPos(changeObj.from);
  var to    = this.cm.indexFromPos(changeObj.to);
  var text  = changeObj.text.join('\n');

  clearTimeout(this._gdrivetimer);
  this._changes.push([from,to,text]);

  this._gdrivetimer=setTimeout(function(){
  	update.call(this);
  }.bind(this),1000);

}
var findTouchedMarkup=function(){
	var markups=this.state.markups;
	var out=[];
	for (var key in markups) {
		var m=markups[key];
		var pos=m.handle.find();
		if (pos.from.line!==m.from[1] || pos.from.ch!==m.from[0] ||
			  pos.to.line!==m.to[1] || pos.to.ch!==m.to[0] ) {
			var newm=textMarker2json(m.handle);
			out.push([key,newm]);
		}
	}
	return out;
}

var unmount = function() {
	if (this.state._text) this.state._text.removeAllEventListeners();
	if (this.state._markups) this.state._markups.removeAllEventListeners();
}
/*
	check if full rebuild needed ( add or remove lines)
*/
var update=function(){
	var coString=this.state._text, coMarkups=this.state._markups;
	var model=this.state._doc.getModel();
	model.beginCompoundOperation();
	for (var i=0;i<this._changes.length;i++){
		var c=this._changes[i];
		var from=c[0], to=c[1],text=c[2];
		if (to - from > 0)    coString.removeRange(from, to);
  	if (text.length > 0)  coString.insertString(from, text);
	}
	this._changes=[];
	var touchedMarkups=findTouchedMarkup.call(this);
	for (var i=0;i<touchedMarkups.length;i++) {
		var m=touchedMarkups[i];
		coMarkups.set(m[0],m[1]);
	}

	model.endCompoundOperation();

	//replace markup in textview
	setTimeout(function(){
		for (var i=0;i<touchedMarkups.length;i++) {
			var m=touchedMarkups[i];
			var oldm=this.state.markups[m[0]];
			m[1].handle=oldm.handle;
			this.state.markups[m[0]]=m[1];
		}
	}.bind(this),500);//must smaller than 	
}
var setToc=function(toc,model) {
	console.log(toc,model)
	model.clear();
	toc.shift();
	model.pushAll(toc);
}
var openFile=function(fileid,opts,cb) {
	gapi.client.load('drive', 'v2', function() {  
		var request = gapi.client.drive.files.get({
  	  'fileId': fileid
  	});
  	request.execute(function(resp){
  		if (resp.error) {
  			alert(resp.error.message);
  		} else {
  			realtimeaction.openFile(fileid,resp.title,opts,cb);	
  		}
	  })
  });
}
module.exports={load:load,update:update,markupchanged:markupchanged,inserttext:inserttext,deletetext:deletetext
,beforeChange:beforeChange,unmount:unmount,openFile:openFile,setTitle:setTitle,setToc:setToc};