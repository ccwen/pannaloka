var Reflux=require("reflux");
var StackWidgetStore=Reflux.createStore({
	listenables:[require("../actions/stackwidget")]
	,widgets:[]
	,wseq:0
	,at:function(wid) {
		for (var i=0;i<this.widgets.length;i++) {
			if (this.widgets[i].wid==wid) return i;
		}
		return 0;
	}
	,onNewWidget:function(trait,widgetClass,opts) {
		opts=opts||{};
		var w={wid:'w'+this.wseq++,widgetClass:widgetClass||"SimpleWidget",trait:trait};
		var out=[];
		for (var i=0;i<this.widgets.length;i++) out.push(this.widgets[i]);
		if (opts.below) {
			var at=this.at(opts.below);
			out.splice(at+1,0,w);  //open below
		} else {
			out.unshift(w); //open at top
		}
		this.widgets=out;
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
	,onOpenWidget:function(trait,widgetClass,opts) {
		opts=opts||{};
		var found=this.find(trait);

		if (!found.length) {//prevent repeat open
			this.onNewWidget(trait,widgetClass,opts);
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