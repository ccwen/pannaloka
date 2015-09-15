import React, { Component } from 'react';

import stackwidgetaction from '../actions/stackwidget';

var styles={
	menu : {display:"flex",background:"silver"}
	,closebutton :{borderRadius:"50%",background:"#FF7F7F",color:"white",marginLeft:"auto",cursor:"pointer"}
}
export class TextWidgetMenu extends Component {
	closeme () {
		stackwidgetaction.closeWidget(this.props.wid);
	}
  render () {
  	return <div style={styles.menu}>
  		{this.props.title}({this.props.wid})
  		<span style={styles.closebutton} onClick={this.closeme.bind(this)}>×</span>
  	</div>
  }
}