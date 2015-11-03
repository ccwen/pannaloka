var React=require("react");
var Component=React.Component;
var stackwidgetaction=require("../actions/stackwidget");
var StackWidgetMenu=require("../components/stackwidgetmenu");

var SimpleView = React.createClass({
	onClose:function(){
		stackwidgetaction.closeWidget(this.props.wid);
	}
	,render :function() {
		return <div>
			<StackWidgetMenu onClose={this.onClose}/>	
			hello {this.props.trait.text} {this.props.wid}
		</div>
	}
});
module.exports=SimpleView;