var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;

var selectionstore=require("../stores/selection");
var SelectionStatus=require("../components/selectionstatus");

module.exports = class StatusView extends PureComponent {
	constructor (props) {
		super(props);
		this.state={selections:{},cursorch:""};
	}

	onData (selections,cursorch) {
		this.setState({selections,cursorch});
	}

	componentDidMount () {
		this.unsubscribe = selectionstore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	render () {
		return <div>
			<SelectionStatus selections={this.state.selections} cursorch={this.state.cursorch}/>
		</div>
	}
}