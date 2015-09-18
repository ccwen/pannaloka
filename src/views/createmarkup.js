import React, {Component} from 'react';
import PureComponent from 'react-pure-render/component';
import selectionstore from '../stores/selection';
import markupaction from '../actions/markup';
import {getAvailableType, types} from '../markuptypedef';
import DefaultMarkupAttrEditor from '../markuptypedef/defmarkupattr';
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

export class CreateMarkup extends PureComponent {
	constructor (props) {
		super(props);
		this.state={types:[],userselect:"",selectedIndex:0,selections:{}};
		this.user=new UserPreference();
	}

	onData (selections) {
		var types=getAvailableType(selections);
		var selectedIndex=this.user.getPrefer(types);
		this.setState({types,selectedIndex,selections});
	}

	componentDidMount () {
		this.unsubscribe = selectionstore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	selecttype (e) {
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
				onChange={this.selecttype.bind(this)} 
				type="radio" name="markuptype"></input>{types[item].label}</label>
	}

	onCreateMarkup (payload) {
		var selections=this.state.selections;
		var typename=this.state.types[this.state.selectedIndex];
		var typedef=types[typename];
		markupaction.createMarkup({selections,payload,typename,typedef});
	}

	renderAttributeEditor () {
		if (this.state.types.length===0 || this.state.selectedIndex===-1) return;

		var activetype=this.state.types[this.state.selectedIndex];
		var attributeEditor=types[activetype].editor || DefaultMarkupAttrEditor;
		return React.createElement( attributeEditor,
			{selections:this.state.selections,onCreateMarkup:this.onCreateMarkup.bind(this)} );

	}
	render () {
		return <span>
			{this.state.types.map(this.renderType.bind(this))}
			{this.renderAttributeEditor()}
		</span>
	}
}