var React=require("react");
var Component=React.Component;
var docfilestore=require("../stores/docfile");
var IME=require("ksana-inputmethod")();

var InputMethod=React.createClass({
	getInitialState:function() {
		return {selected:this.props.ime-1,preview:""};
	}
	,input:function(val,e) {
		var cm=docfilestore.getActiveEditor();
		var output=IME[this.state.selected].ime.convert(val);
		if (output) {
			var pos=cm.getCursor();
			cm.replaceRange(output,pos,pos);
			cm.setCursor({line:pos.line,ch:pos.ch+output.length});
			this.setState({preview:""});
		}
		e.target.value="";
	}
	,componentWillUnmount:function() {
		clearTimeout(this.timer);
	}
	,onChange:function(e) {
		clearTimeout(this.timer);
		var val=e.target.value;
		this.timer=setTimeout(function(){
			var preview=IME[this.state.selected].ime.convert(val);
			this.setState({preview:preview});
		}.bind(this),100);
	}
	,onKeyPress:function(e) {
		if (e.key=="Enter") return this.input(e.target.value,e);
	}
	,componentWillReceiveProps : function(nextprops) {
		this.setState({selected:nextprops.ime-1});
	}
	,renderIME:function(item,idx){
		return <option value={item.name} key={idx}>{item.name}</option>
	}
	,selectIME:function(e){
		this.setState({selected:e.target.selectedIndex});
		this.props.onSetIME&&this.props.onSetIME(e.target.selectedIndex+1);
	}
	,render:function(){
		if (this.state.selected<0) return <span></span>
		return <span>
			<select value={IME[this.state.selected].name} 
			onChange={this.selectIME}>{IME.map(this.renderIME)}</select>
			<input onKeyPress={this.onKeyPress} onChange={this.onChange}></input>
			<span>{this.state.preview}</span>
		</span>
	}
});

module.exports=InputMethod;