var React=require("react");
var Component=React.Component;
var StatusView=require("../views/statusview");

var StatusPanel = React.createClass({
  render :function() {
  	return <div><StatusView/></div>
  }
});
module.exports = StatusPanel;