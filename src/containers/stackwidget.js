var React=require("react");
var ReactDOM=require("react-dom");
var Component=React.Component;
var PureComponent=require("react-pure-render/component");
var WidgetClasses=require("../views/widgetclasses");

var style={borderBottom:"1px solid silver"};

module.exports = class StackWidget extends PureComponent {

	constructor (props) {
		super(props);
	}

	updateHeight () {
		ReactDOM.findDOMNode(this).style.height=this.height;
	}
	componentDidMount () {
		this.updateHeight();
	}
	componentDidUpdate () {
		this.updateHeight();
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