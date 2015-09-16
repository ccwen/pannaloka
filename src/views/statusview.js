import React, {Component} from 'react';
import PureComponent from 'react-pure-render/component';
import selectionstore from '../stores/selection';
import {SelectionStatus} from '../components/selectionstatus';

export class StatusView extends PureComponent {
	constructor (props) {
		super(props);
		this.state={selections:{},cursorch:""};
	}

	onData (selections,selectionsByView,cursorch) {
		this.setState({selections,cursorch});
	}

	componentDidMount () {
		this.unsubscribe = selectionstore.listen(this.onData.bind(this));
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	render () {
		return <div>
			<SelectionStatus selections={this.state.selections} cursorch={this.state.cursorch}/>
		</div>
	}
}