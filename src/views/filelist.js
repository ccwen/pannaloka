import React, { Component } from 'react';
import Reflux from 'reflux';



export class FileList extends Component {
	constructor (props) {
		super(props);
		var files=[];
		for (var i=0;i<100;i++) files.push(i)
		this.state={files:files}
	}

	renderItem (item,idx) {
		return <div key={idx}>{item}</div>
	}

	render () {
		return <div>{this.state.files.map(this.renderItem.bind(this))}</div>
	}
}