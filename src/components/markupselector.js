var React=require("react");
var PureComponent=require('react-pure-render').PureComponent;

module.exports = class MarkupSelector extends PureComponent {

	render () {
		return <span>{this.props.markups.length}</span>
	}
}