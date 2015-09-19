var React=require("react");
var Component=React.Component;

module.exports = class StackWidgetMenu extends Component {
  render () {
  	return <div>
  		<button onClick={this.props.onClose}>Close</button>
  		</div>
  }
}