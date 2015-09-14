var Reflux=require("reflux");
var StackWidgetStore=Reflux.createStore({
	listenables:[require("../actions/stackwidget")]
	,widgets:[]
	,onNewWidget:function(w) {
		this.widgets=[w].concat(this.widgets);
		this.trigger(this.widgets);
	}
	,onCloseWidget:function(wid) {
		this.widgets=this.widgets.filter(function(w){
			return w.wid!=wid;
		});
		this.trigger(this.widgets);
	}

})
module.exports=StackWidgetStore;