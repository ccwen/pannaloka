var React=require("react");
var Component=React.Component;

var stackwidgetstore=require("../stores/stackwidget");
var StackWidget=require("../containers/stackwidget");

var MINWIDGETHEIGHT = 150;

module.exports = class StackWidgetList extends Component {
	 constructor(props) {
    super(props);
    this.state = { widgets:[], widgetheights:[]};
  }

	componentDidMount () {
		this.unsubscribe = stackwidgetstore.listen(this.onData);
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	totalFlex (widgets) {
		return widgets.reduce(function(prev,w){ 
			return (w.trait.flex||1)+prev } 
		,0);
	}
	setWidgetHeight = (props,widgets) => {
		if (!props) props=this.props;
		if (!widgets) widgets=this.state.widgets;
		var totalheight=props.height;
		var total=this.totalFlex(widgets);

		var widgetheights=widgets.map(function(w){
			var widgetheight=totalheight*((w.trait.flex||1)/total) - 4;
			if (widgetheight<MINWIDGETHEIGHT) widgetheight=MINWIDGETHEIGHT;
			return widgetheight;
		}.bind(this));

		this.setState({widgetheights});
	}

	componentWillReceiveProps (nextProps) {
		this.setWidgetHeight(nextProps,this.state.widgets);
	}

	onData = (widgets) => {
		this.setWidgetHeight(this.props,widgets);
		this.setState({widgets});
	}

	renderItem (item,idx) {
		return <StackWidget height={this.state.widgetheights[idx]} key={item.wid}
		resize={this.setWidgetHeight} wid={item.wid} widgetClass={item.widgetClass} trait={item.trait} />
	}

  render () {
  	return <div>
  		{this.state.widgets.map(this.renderItem.bind(this))}
  	</div>
  }
}