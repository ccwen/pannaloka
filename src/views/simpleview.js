var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var stackwidgetaction=require("../actions/stackwidget");
var StackWidgetMenu=require("../components/stackwidgetmenu");
module.exports = class SimpleView extends PureComponent {
	onClose = () => {
		stackwidgetaction.closeWidget(this.props.wid)
	}
	render () {
		return <div>
			<StackWidgetMenu onClose={this.onClose}/>	
			hello {this.props.trait.text} {this.props.wid}
		</div>
	}
}