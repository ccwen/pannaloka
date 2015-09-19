var React=require("react");
var Component=React.Component;
var StackWidgetMainMenu=require("../views/stackwidgetmainmenu");
var MarkupEditor=require("../views/markupeditor");

module.exports =class MainMenu extends Component {
  render () {
  	return <div>
  		|<StackWidgetMainMenu/><MarkupEditor/>
  	</div>
  }
}