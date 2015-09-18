import React, {Component} from 'react';
import PureComponent from 'react-pure-render/component';
import markupstore from '../stores/markup';
import {CreateMarkup} from './createmarkup';
import {MarkupSelector} from '../components/markupselector';

export class MarkupEditor extends PureComponent {
	constructor (props) {
		super(props);
		this.state={editing:null,markups:[]};
	}
	onClose () {
		stackwidgetaction.closeWidget(this.props.wid)
	}

	onData (action,markups) {
		if (action.editing) this.setState({editing:action.editing});
	}

	componentDidMount () {
		this.unsubscribe = markupstore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	render () {
		var editor=this.state.editing?<MarkupSelector markups={this.state.markups} editing={this.state.editing}/>
															   :<CreateMarkup/> ;

		return <span>{editor}</span>
	}
}