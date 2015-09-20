var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

class Transclusion extends PureComponent {
	render (){
		return <span className="transclusion">{this.props.text}</span>
	}
}
module.exports=Transclusion;