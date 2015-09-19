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
		this.unsubscribe = stackwidgetstore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	onData (widgets) {
		var widgetheight=(this.props.height / widgets.length)-2 ;
		if (widgetheight<MINWIDGETHEIGHT) widgetheight=MINWIDGETHEIGHT;
		this.setState({widgets,widgetheight});
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