import React, { Component } from 'react';

var styles={
	menu : {display:"flex",background:"silver"}
	,closebutton :{borderRadius:"50%",background:"#FF7F7F",color:"white",marginLeft:"auto",cursor:"pointer"}
}
export class TextViewMenu extends Component {
  render () {
  	return <div style={styles.menu}>
  		{this.props.title}({this.props.wid})
  		<span style={styles.closebutton} onClick={this.props.onClose}>×</span>
  	</div>
  }
}