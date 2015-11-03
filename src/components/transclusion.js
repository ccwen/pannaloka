var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var Transclusion = React.createClass({
	render :function() {
		return <span data-mid={this.props.mid} title={this.props.title}
			className="transclusion" onClick={this.props.onClick}>{this.props.text}</span>
	}
});
module.exports=Transclusion;