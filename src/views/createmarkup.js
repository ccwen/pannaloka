var React=require("react");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;
var selectionstore=require("../stores/selection");
var markupaction=require("../actions/markup");
var markuptypedef=require("../markuptypedef");
var getAvailableType=markuptypedef.getAvailableType;
var types=markuptypedef.types;
var DefaultMarkupAttrEditor=require("../markuptypedef/defmarkupattr");

class UserPreference {
	constructor () {
		this.preferences=[];
	}
	setPrefer (type, others) {
		this.preferences=this.preferences.filter(function(pref){
			return (others.indexOf(pref)===-1);
		});
		this.preferences.push(type);
	} 

	getPrefer (types) { //return first matching perference
		for (var i=0;i<types.length;i++) {
			if (this.preferences.indexOf(types[i])>-1) {
				return i;
			}
		}
		return 0;
	}
}

module.exports = class CreateMarkup extends PureComponent {
	constructor (props) {
		super(props);
		var selections=selectionstore.selections;
		var types=getAvailableType(selections);
		this.user=new UserPreference();
		var selectedIndex=this.user.getPrefer(types);
		this.state={types:types,userselect:"",selectedIndex:0,selections:selections};
	}

	onData = (selections) => {
		var types=getAvailableType(selections);
		var selectedIndex=this.user.getPrefer(types);
		this.setState({types,selectedIndex,selections});
	}

	componentDidMount () {
		this.unsubscribe = selectionstore.listen(this.onData);
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	selecttype =(e) => {
		var target=e.target;
		while (target && typeof target.dataset.idx==="undefined") target=target.parentElement;
		if (!target) return;
		var idx=parseInt(target.dataset.idx);
		var userselect=this.state.types[idx];
		this.user.setPrefer(userselect,this.state.types);
		this.setState({selectedIndex:idx});
	}

	renderType (item,idx) {
		return <label key={idx} data-idx={idx}><input checked={idx==this.state.selectedIndex} 
				onChange={this.selecttype} 
				type="radio" name="markuptype"></input>{types[item].label}</label>
	}

	onCreateMarkup = (trait) => {
		var selections=this.state.selections;
		var typename=this.state.types[this.state.selectedIndex];
		var typedef=types[typename];
		markupaction.createMarkup({selections,trait,typename,typedef});
	}


	renderAttributeEditor () {
		if (this.state.types.length===0 || this.state.selectedIndex===-1) return;

		var activetype=this.state.types[this.state.selectedIndex];
		var attributeEditor=types[activetype].editor || DefaultMarkupAttrEditor;
		return React.createElement( attributeEditor,
			{selections:this.state.selections
				,onCreateMarkup:this.onCreateMarkup} );

	}
	render () {//need 130% to prevent flickering when INPUT add to markup editor
		if (!this.props.editing) {
			return <span>|</span>
		}

		return <span><span style={{fontSize:"130%"}}>|</span>
			{this.state.types.map(this.renderType.bind(this))}
			{this.renderAttributeEditor()}
		</span>
	}
}