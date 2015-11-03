var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var selectionstore=require("../stores/selection");
var SelectionStatus=require("../components/selectionstatus");

var StatusView = React.createClass({
	getInitialState:function() {
		return {selections:{},cursorch:""};
	}

	,onData :function(selections,cursorch) {
		this.setState({selections,cursorch});
	}

	,componentDidMount :function() {
		this.unsubscribe = selectionstore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,render :function() {
		return <div>
			<SelectionStatus selections={this.state.selections} cursorch={this.state.cursorch}/>
		</div>
	}
});
module.exports=StatusView;