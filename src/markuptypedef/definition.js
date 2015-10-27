var React=require("react");
var E=React.createElement;
var styles={input:{border:"0px",fontSize:"100%",outline:0,borderBottom:"1px solid "}};
var ActionButton=require("./actionbutton");
var getMember=require("./validatecontext").getMember;
var ContextMember=require("./contextmember");
var docfilestore=require("../stores/docfile");
var DefinitionAttributeEditor=React.createClass({
	getInitialState:function() {
		var attr1=(this.props.markup&&this.props.markup.trait)?this.props.markup.trait.attr1:"";
		return {attr1:attr1,dirty:false,filename:this.getFilename()};
	}
	,onCreateMarkup:function() {
		this.props.onCreateMarkup({attr1:this.state.attr1});
	}
	,onUpdateMarkup:function() {
		this.props.onUpdateMarkup({attr1:this.state.attr1});
		this.setState({dirty:false});
	}
	,getFilename:function(markup) {
		markup=markup||this.props.markup;
		if (!markup || !markup.handle) return;
		return docfilestore.fileOf(markup.handle.doc);
	}
	,componentWillReceiveProps:function(nextprops) {
		var attr1=(nextprops.markup&&nextprops.markup.trait)?nextprops.markup.trait.attr1:"";
		this.setState({attr1:attr1,filename:this.getFilename(nextprops.markup)});
	}
	,oAttr1Change(e) {
		this.setState({attr1:e.target.value,dirty:true});
	}
	,renderMember:function(){
		if (!this.props.markup)return;
		var member=getMember(this.props.markup);
		if (member.length) {
			return <span>
			情境：
			<ContextMember member={member} filename={this.state.filename} />	
			。定義：
			</span>
		} else {
			return <span>選取含一個及以上標記的文字，以指定情境。定義：</span>
		}
	}
	,render:function() {
		return E("span",null
			,<ActionButton 
				 deletable={this.props.deletable}
			   editing={this.props.editing} 
			   setHotkey={this.props.setHotkey} 
			   dirty={this.state.dirty}
				 onCreateMarkup={this.onCreateMarkup} 
				 onDeleteMarkup={this.props.onDeleteMarkup}
				 onUpdateMarkup={this.onUpdateMarkup}/>
				,this.renderMember()
			);
	}
})
module.exports=DefinitionAttributeEditor;