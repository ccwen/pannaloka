var React=require("react");
var Component=React.Component;
var PureComponent=require("react-pure-render/component");
var WidgetClasses=require("../views/widgetclasses");

var style={borderBottom:"1px solid silver"};

module.exports = class StackWidget extends PureComponent {

	constructor (props) {
		super(props);
		for (var i in props.style) style[i]=props.style[i];
		style.height=props.height;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.height!==this.props.height) style.height=nextProps.height;
	}

	renderWidget() {
		var widgetclass=this.props.widgetClass||"SimpleWidget";
		var widget=WidgetClasses[widgetclass];
		if (!widget){
			throw "cannot load widget "+widgetclass;
		}
		return React.createElement(widget,this.props);
	}

	render () {
		return <div style={style}>
			{this.renderWidget()}
		</div>
	}
}