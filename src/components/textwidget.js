import React, { Component } from 'react';
import {TextWidgetMenu} from '../views/textwidgetmenu';
import {DefaultTextView} from '../views/defaulttextview';

export class TextWidget extends Component {
	render () {
		return <div>
			 <DefaultTextView wid={this.props.wid} height={this.props.height} {...this.props.trait}/>
		</div>
	}
}
