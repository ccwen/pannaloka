import React, { Component } from 'react';
import Reflux from 'reflux';

import ktxfilestore from '../stores/ktxfile';
import {FileItem} from '../components/fileitem';

export class FileList extends Component {
	constructor (props) {
		super(props);
		this.state={files:[],selectedIndex:0};
	}

	onData (files) {
		this.setState({files});
	}

	componentDidMount () {
		this.unsubscribe = ktxfilestore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	renderItem (item,idx) {
		return <div key={idx} data-idx={idx}>
			<FileItem  selected={this.state.selectedIndex==idx} {...item}/></div>
	}

	selectItem (e) {
		var target=e.target;
		while (target && !target.dataset.idx) {
			target=target.parentElement;
		}
		var selectedIndex=parseInt(target.dataset.idx);
		if (!isNaN(selectedIndex)) this.setState({selectedIndex});
	}

	render () {
		return <div onClick={this.selectItem.bind(this)}>{this.state.files.map(this.renderItem.bind(this))}</div>
	}
}