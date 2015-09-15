var Reflux=require("reflux");
var StackWidgetStore=Reflux.createStore({
	listenables:[require("../actions/stackwidget")]
	,widgets:[]
	,wseq:0
	,onNewWidget:function(trait,widgetClass) {
		var w={wid:'w'+this.wseq++,widgetClass:widgetClass||"SimpleWidget",trait:trait};
		this.widgets=[w].concat(this.widgets);
		this.trigger(this.widgets);
	}
	,onCloseWidget:function(wid) {
		this.widgets=this.widgets.filter(function(w){
			return w.wid!=wid;
		});
		this.trigger(this.widgets);
	}
	,find:function(trait){
		return this.widgets.filter(function(w){
			return w.trait===trait;
		});
	}
	,onOpenWidget:function(trait,widgetClass) {
		var found=this.find(trait);

		if (!found.length) {//prevent repeat open
			this.onNewWidget(trait,widgetClass);
		} else {//move it to the top
			var rest=this.widgets.filter(function(w){
				return w.trait!==trait;
			});

			this.widgets= found.concat(rest);
			this.trigger(this.widgets);
		}
	}

})
module.exports=StackWidgetStore;