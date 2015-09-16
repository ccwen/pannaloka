import React, {Component} from 'react';
import PureComponent from 'react-pure-render/component';
import selectionstore from '../stores/selection';
import {getAvailableType, types} from "../markuptypedef";

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

export class MarkupType extends PureComponent {
	constructor (props) {
		super(props);
		this.state={types:[],userselect:"",selectedIndex:0};
		this.user=new UserPreference();
	}

	onData (selections) {
		var types=getAvailableType(selections);
		if (types.join("\n")==this.state.types.join("\n"))return;

		var selectedIndex=this.user.getPrefer(types);
		this.setState({types,selectedIndex});
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
				type="radio" name="markuptype"></input>{item}</label>
	}
	render () {
		return <span>
			{this.state.types.map(this.renderType.bind(this))}
		</span>
	}
}