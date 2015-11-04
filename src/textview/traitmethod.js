var docfileaction=require("../actions/docfile");
var setFlexHeight=function(flex) {
	this.props.trait.flex=flex; //bad practice
	this.props.resize();
}

var setGoogleDriveTitle=function(fileid,title,cb){
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
var setTitle=function(title){
	if (this.props.trait.host==="google") {
		setGoogleDriveTitle(this.props.trait.filename,title,function(err,title){
			this.props.trait.title=title; //bad practice
			this.setState({dirty:true,titlechanged:true});
		}.bind(this));

	}else {
		this.props.trait.title=title; //bad practice
		this.setState({dirty:true,titlechanged:true});
	}
}	

module.exports={setFlexHeight:setFlexHeight,setTitle:setTitle};