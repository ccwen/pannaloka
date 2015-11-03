var React=require("react");
var Component=React.Component;
var PureRender=require('react-addons-pure-render-mixin');

var selectionstore=require("../stores/selection");
var markupstore=require("../stores/markup");
var markupaction=require("../actions/markup");
var markuptypedef=require("../markuptypedef");
var getAvailableType=markuptypedef.getAvailableType;
var types=markuptypedef.types;
var DefaultMarkupAttrEditor=require("../markuptypedef/defmarkupattr");

var UserPreference =function() {
	this.preferences=[];
	this.setPrefer=function(type, others) {
		this.preferences=this.preferences.filter(function(pref){
			return (others.indexOf(pref)===-1);
		});
		this.preferences.push(type);
	} 

	this.getPrefer=function(types) { //return first matching perference
		for (var i=0;i<types.length;i++) {
			if (this.preferences.indexOf(types[i])>-1) {
				return i;
			}
		}
		return 0;
	}
}

var CreateMarkup = React.createClass({
	getInitialState:function() {
		var selections=selectionstore.selections;
		this.user=new UserPreference();
		var T=getAvailableType(selections);
		var selectedIndex=this.user.getPrefer(T);		
		return {types:T,userselect:"",selectedIndex:0,selections:selectionstore.selections};
	}

	,onData :function(selections) {
		var types=getAvailableType(selections);
		var selectedIndex=this.user.getPrefer(types);
		if (types.length) markupstore.cancelEdit();
		this.setState({types,selectedIndex,selections});
	}

	,componentDidMount :function() {
		this.unsubscribe = selectionstore.listen(this.onData);
	}

	,componentWillUnmount :function() {
		this.unsubscribe();
	}

	,selecttype :function(e) {
		var target=e.target;
		while (target && typeof target.dataset.idx==="undefined") target=target.parentElement;
		if (!target) return;
		var idx=parseInt(target.dataset.idx);
		var userselect=this.state.types[idx];
		this.user.setPrefer(userselect,this.state.types);
		this.setState({selectedIndex:idx});
	}

	,renderType :function(item,idx) {
		return <label className="markuptype" key={idx} data-idx={idx}><input checked={idx==this.state.selectedIndex} 
				onChange={this.selecttype} 
				type="radio" name="markuptype"></input>{types[item].label}</label>
	}

	,onCreateMarkup :function (trait) {
		var selections=this.state.selections;
		var typename=this.state.types[this.state.selectedIndex];
		var typedef=types[typename];
		markupaction.createMarkup({selections,trait,typename,typedef});
	}

	,setHotkey :function (handler) {
		markupaction.setHotkey(handler);
	}

	,renderAttributeEditor :function() {
		if (this.state.types.length===0 || this.state.selectedIndex===-1) return;

		var activetype=this.state.types[this.state.selectedIndex];
		var attributeEditor=types[activetype].editor || DefaultMarkupAttrEditor;
		return React.createElement( attributeEditor,
			{selections:this.state.selections
				,setHotkey:this.setHotkey
				,onCreateMarkup:this.onCreateMarkup} );

	}
	,msg :function() {
		var s="選取文字，按Ctrl選多段";
		if (markupstore.getEditing()) s="";//Ctrl+L 嵌用此標記→";
		return s;
	}

	,render :function() {//need 130% to prevent flickering when INPUT add to markup editor
		if (!this.props.editing) {
			markupaction.setHotkey(null);
			return <span></span>
		}

		if (!this.state.types.length) {
			markupaction.setHotkey(null);
		}

		return <span>
			{this.state.types.length?
			this.state.types.map(this.renderType):this.msg()}
			|
			{this.renderAttributeEditor()}
		</span>
	}
});
module.exports=CreateMarkup;