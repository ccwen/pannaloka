var Reflux=require("reflux");
var OverlayStore=Reflux.createStore({
	paths:[]
	,listenables:require("../actions/overlay")
	,onConnect:function(from,to){
		var F={x:from.left-5,y:from.top,w:from.right-from.left,h:from.bottom-from.top}

		var T={x:to.left-5,y:to.top,w:to.right-to.left,h:to.bottom-to.top}

		this.paths=[
		//{cmd:"rect",stroke:"green",strokeOpacity:0.4,fillOpacity:0,strokeWidth:2,
	//		x:F.x,y:F.y,width:F.w,height:F.h,rx:10,ry:10}
	//	,{cmd:"rect",stroke:"brown",fillOpacity:0,strokeWidth:2,
	//		x:T.x,y:T.y,width:T.w,height:T.h,rx:10,ry:10}
		,{stroke:"black",strokeOpacity:0.25,strokeWidth:3,stroke:"green"  //line
			,d:"M"+(from.left+F.w/2)+" "+(from.top+F.h/2)+"L"+(to.left+T.w/2)+" "+(to.top+T.h/2)+"Z"},

		]
		clearTimeout(this.timer1);
		this.trigger(this.paths);
		this.timer1=setTimeout(function(){
			this.paths=[];
			this.trigger(this.paths);
		}.bind(this),3000);
	}
	,onClear:function() {
		this.paths=[];
		this.trigger(this.paths)
	}
});
module.exports=OverlayStore;
