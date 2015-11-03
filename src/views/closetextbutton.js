var React=require("react");

var CloseTextButton = React.createClass({
	render : function() {
		return <span title="Ctrl+Q" className="closebutton" onClick={this.props.onClose}>×</span>
	}
});
module.exports = CloseTextButton;
