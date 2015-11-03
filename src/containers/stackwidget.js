var React=require("react");
var ReactDOM=require("react-dom");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var WidgetClasses=require("../views/widgetclasses");

var style={borderBottom:"1px solid silver"};

var StackWidget = React.createClass({
	updateHeight : function() {
		ReactDOM.findDOMNode(this).style.height=this.props.height;
	}
	,componentDidMount :function() {
		this.updateHeight();
	}
	,componentDidUpdate :function() {
		this.updateHeight();
	}
	,renderWidget:function() {
		var widgetclass=this.props.widgetClass||"SimpleView";
		var widget=WidgetClasses[widgetclass];
		if (!widget){
			throw "cannot load widget "+widgetclass;
		}
		return React.createElement(widget,this.props);
	}

	,render :function() {
		return <div style={style}>
			{this.renderWidget()}
		</div>
	}
});
module.exports = StackWidget;