import React, { Component } from 'react';
import { StackWidgetMainMenu } from '../views/stackwidgetmainmenu';
import { MarkupEditor } from '../views/markupeditor';
export class MainMenu extends Component {
  render () {
  	return <div>
  		|<StackWidgetMainMenu/><MarkupEditor/>
  	</div>
  }
}