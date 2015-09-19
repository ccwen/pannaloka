var React=require("react");
var Component=React.Component;
var StackWidgetList=require('../views/stackwidgetlist')


module.exports = class RightPanel extends Component {
  render () {
  	if (this.props.height<100) return <div>invalid height</div>

  	return <div>
  		<StackWidgetList height={this.props.height}/>
  	</div>
  }
}