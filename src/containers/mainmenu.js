var React=require("react");
var Component=React.Component;
var StackWidgetMainMenu=require("../views/stackwidgetmainmenu");
var MarkupPanel=require("../views/markuppanel");
var styles={
	banner:{borderRadius:"0.25em",
	background:"-webkit-radial-gradient(center, ellipse cover, #f1da36 0%,gray 70%)"}
}
module.exports =class MainMenu extends Component {
  render () {
  	return <div><span style={styles.banner} title="2015.10.17">智慧光</span><MarkupPanel/></div>
  }
}