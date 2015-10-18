var React=require("react");
var styles={
	closebutton :
	{borderRadius:"3px",background:"#AF1010",color:"white",cursor:"pointer"}
}

module.exports = class CloseTextButton extends React.Component {
	render () {
		return <span style={styles.closebutton} onClick={this.props.onClose}>×</span>
	}
}