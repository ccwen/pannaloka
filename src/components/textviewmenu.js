import React, { Component } from 'react';
import {SaveButton} from './savebutton';
import PureComponent from 'react-pure-render/component';
import { DocumentTitle } from './documentitle';
var styles={
	menu : {display:"flex",background:"silver"}
	,closebutton :{borderRadius:"50%",background:"#FF7F7F",color:"white",marginLeft:"auto",cursor:"pointer"}
}
export class TextViewMenu extends PureComponent {
  render () {
  	return <div style={styles.menu}>
  		<SaveButton {...this.props} />
  		<DocumentTitle title={this.props.title} onSetTitle={this.props.onSetTitle} />({this.props.wid})
  		<span style={styles.closebutton} onClick={this.props.onClose}>×</span>
  	</div>
  }
}