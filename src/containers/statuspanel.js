var React=require("react");
var Component=React.Component;
var StatusView=require("../views/statusview");

module.exports = class StatusPanel extends Component {
  render () {
  	return <div><StatusView/></div>
  }
}