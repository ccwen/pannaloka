var React=require("react");
var Component=React.Component;

var stackwidgetaction=require("../actions/stackwidget");
var selectionaction=require("../actions/selection");

module.exports = class StackWidgetMainMenu extends Component {
	newWidget () {
		stackwidgetaction.newWidget({text:"widget"});
	}

  render () {
  	return <span>
  		<button onClick={this.newWidget.bind(this)}>New widget</button>
  	</span>
  }
}
