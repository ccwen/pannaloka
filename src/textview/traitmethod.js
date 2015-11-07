var docfileaction=require("../actions/docfile");
var googledrive=require("./googledrive");
var setFlexHeight=function(flex) {
	this.props.trait.flex=flex; //bad practice
	this.props.resize();
}


var setTitle=function(title){
	if (this.props.trait.host==="google") {
		googledrive.setTitle(this.props.trait.filename,title,function(err,title){
			this.props.trait.title=title; //bad practice
			this.setState({dirty:true,titlechanged:true});
		}.bind(this));

	}else {
		this.props.trait.title=title; //bad practice
		this.setState({dirty:true,titlechanged:true});
	}
}	

module.exports={setFlexHeight:setFlexHeight,setTitle:setTitle};