var React=require("react");
var Component=React.Component;

var stackwidgetaction=require("../actions/stackwidget");
var selectionaction=require("../actions/selection");

var StackWidgetMainMenu = React.createClass({
	newWidget :function () {
		stackwidgetaction.newWidget({text:"widget"});
	}

  ,render : function() {
  	return <span>
  		<button onClick={this.newWidget}>New widget</button>
  	</span>
  }
});
module.exports=StackWidgetMainMenu;
