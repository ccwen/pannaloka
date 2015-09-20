var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

class Transclusion extends PureComponent {
	render () {
		return <span data-mid={this.props.mid} className="transclusion" onClick={this.props.onClick}>{this.props.text}</span>
	}
}
module.exports=Transclusion;