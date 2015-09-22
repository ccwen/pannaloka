var React=require("react");
var Component=React.Component;
var StackWidgetMainMenu=require("../views/stackwidgetmainmenu");
var MarkupPanel=require("../views/markuppanel");

module.exports =class MainMenu extends Component {
  render () {
  	return <div><MarkupPanel/></div>
  }
}