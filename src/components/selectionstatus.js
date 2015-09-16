import React, { Component } from 'react';
import PureComponent from 'react-pure-render/component';
export class SelectionStatus extends PureComponent {

	renderSelection (sels) {
		return sels.map(function(sel,idx){
			return <span key={idx}>{"["+sel[1]+":"+sel[0]+"]"}</span>
		});
	}

	renderCh (ch) {
		if (!ch) return ;
		return <span key="ch" title={ch}>U+{ch.charCodeAt(0).toString(16).toUpperCase()}</span>
	}
	render () {
		
		var out=[],c=0;
		for (var i in this.props.selections) {
			if (!this.props.selections[i].length) continue;
			out.push(<span key={c++}>({i})</span>)
			out.push(<span key={c++}>{this.renderSelection(this.props.selections[i])}</span>);
		}

		if (out.length) out.unshift(<span key="name">,selections:</span>);
	
		return <span>|{this.renderCh(this.props.cursorch)}{out}</span>
	}	
}
