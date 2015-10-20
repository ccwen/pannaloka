var docfileaction=require("../actions/docfile");
var setFlexHeight=function(flex) {
	this.props.trait.flex=flex; //bad practice
	this.props.resize();
}

var setTitle=function(title){
	this.props.trait.title=title; //bad practice
	this.setState({dirty:true,titlechanged:true});
}	

module.exports={setFlexHeight:setFlexHeight,setTitle:setTitle};