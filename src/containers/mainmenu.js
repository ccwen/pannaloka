import React, { Component } from 'react';
import { StackWidgetMainMenu } from '../views/stackwidgetmainmenu';
import { MarkupType } from '../views/markuptype';
export class MainMenu extends Component {
  render () {
  	return <div>
  		|<StackWidgetMainMenu/><MarkupType/>
  	</div>
  }
}