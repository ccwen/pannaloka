var React=require("react");
var Component=React.Component;

var stackwidgetstore=require("../stores/stackwidget");
var StackWidget=require("../containers/stackwidget");

var MINWIDGETHEIGHT = 150;

module.exports = class StackWidgetList extends Component {
	 constructor(props) {
    super(props);
    this.state = { widgets:[], widgetheight:100};
  }

	componentDidMount () {
		this.unsubscribe = stackwidgetstore.listen(this.onData);
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	setWidgetHeight (props,widgets) {
		var widgetheight=(props.height / widgets.length)-4;
		if (widgetheight<MINWIDGETHEIGHT) widgetheight=MINWIDGETHEIGHT;
		if (this.state.widgetheight!==widgetheight) this.setState({widgetheight});
	}

	componentWillReceiveProps (nextProps) {
		this.setWidgetHeight(nextProps,this.state.widgets);
	}

	onData = (widgets) => {
		this.setWidgetHeight(this.props,widgets);
		this.setState({widgets});
	}

	renderItem (item,idx) {
		return <StackWidget height={this.state.widgetheight} key={item.wid} 
		wid={item.wid} widgetClass={item.widgetClass} {...item.trait} />
	}

  render () {
  	return <div>
  		{this.state.widgets.map(this.renderItem.bind(this))}
  	</div>
  }
}