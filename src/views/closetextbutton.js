var React=require("react");

module.exports = class CloseTextButton extends React.Component {
	render () {
		return <span title="Ctrl+Q" className="closebutton" onClick={this.props.onClose}>×</span>
	}
}