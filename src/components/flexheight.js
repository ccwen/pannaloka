var React=require("react");
var PureComponent=require('react-pure-render').PureComponent;

var styles={
	title:{fontSize:"100%"}
}
module.exports = class FlexHeight extends PureComponent {

	onClick = () => {
		var newvalue=this.props.flex+0.5;
		if (newvalue>2) newvalue=0.5;
		this.props.setValue(newvalue);
	}

	getHeight = () => {
		return this.props.flex*100+"%";
	}
	render () {
		return <span onClick={this.onClick}> Height:{this.getHeight()}</span>
	}
}