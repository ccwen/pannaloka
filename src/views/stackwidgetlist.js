var React=require("react");
var Component=React.Component;

var stackwidgetstore=require("../stores/stackwidget");
var StackWidget=require("../containers/stackwidget");

var MINWIDGETHEIGHT = 150;

var StackWidgetList = React.createClass({
	getInitialState:function(){
    
    return  { widgets:[], widgetheights:[]};
  }

	,componentDidMount :function() {
		this.unsubscribe = stackwidgetstore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,totalFlex :function(widgets) {
		return widgets.reduce(function(prev,w){ 
			return (w.trait.flex||1)+prev } 
		,0);
	}
	,setWidgetHeight :function(props,widgets) {
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

	,componentWillReceiveProps :function(nextProps) {
		this.setWidgetHeight(nextProps,this.state.widgets);
	}

	,onData :function(widgets) {
		this.setWidgetHeight(this.props,widgets);
		this.setState({widgets});
	}

	,renderItem :function(item,idx) {
		return <StackWidget height={this.state.widgetheights[idx]} key={item.wid}
		resize={this.setWidgetHeight} wid={item.wid} widgetClass={item.widgetClass} trait={item.trait} />
	}

  ,render :function() {
  	return <div>
  		{this.state.widgets.map(this.renderItem)}
  	</div>
  }
});
module.exports=StackWidgetList;