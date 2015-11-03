var React=require("react");
var PureRender=require('react-addons-pure-render-mixin');
var styles={
	title:{fontSize:"100%"}
}
var FlexHeight=React.createClass({
	onClick :function()  {
		var newvalue=this.props.flex+0.5;
		if (newvalue>2) newvalue=0.5;
		this.props.setValue(newvalue);
	}

	,getHeight :function()  {
		return this.props.flex*100+"%";
	}
	,render:function() {
		return <span onClick={this.onClick}> Height:{this.getHeight()}</span>
	}
});
module.exports=FlexHeight;