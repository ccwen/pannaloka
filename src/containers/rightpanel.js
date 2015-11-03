var React=require("react");
var Component=React.Component;
var StackWidgetList=require('../views/stackwidgetlist')

var RightPanel = React.createClass({
  render :function() {
  	if (this.props.height<100) return <div>invalid height</div>

  	return <div>
  		<StackWidgetList height={this.props.height}/>
  	</div>
  }
});
module.exports = RightPanel ;