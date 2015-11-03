var React=require("react");
var Component=React.Component;

var StackWidgetMenu = React.createClass({
  render :function () {
  	return <div>
  		<button onClick={this.props.onClose}>Close</button>
  		</div>
  }
});
module.exports=StackWidgetMenu;