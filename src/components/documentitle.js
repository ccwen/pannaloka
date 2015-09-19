import React, { Component } from 'react';
import PureComponent from 'react-pure-render/component';
var styles={
	title:{fontSize:"100%"}
}
export class DocumentTitle extends PureComponent {
	constructor (props) {
		super(props);
		this.state={editing:false,title:props.title};
	}
	onChange (e) {
		this.setState({title:e.target.value});
	}

	onKeyPress (e) {
		if (e.key==="Enter") {
			this.setState({editing:false});
			this.props.onSetTitle&&this.props.onSetTitle(this.state.title);
		}
	}

	componentDidUpdate () {
		var input=React.findDOMNode(this.refs.titleinput);
		if (!input) return;
		var len=this.state.title.length;
		input.focus(); 
		input.setSelectionRange(len,len)
	}

	edit () {
		this.setState({editing:true});
	}

  render () {
  	if (this.state.editing) {
  		return <span><input ref="titleinput" style={styles.title} autofocus onKeyPress={this.onKeyPress.bind(this)} 
  									onChange={this.onChange.bind(this)} value={this.state.title}/></span>
  	} else {
  		return <span onClick={this.edit.bind(this)}>{this.props.title}</span>
  	}
  	
  }
}