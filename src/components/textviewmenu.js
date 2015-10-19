var React=require("react");
var Component=React.Component;
var DocumentTitle=require("./documenttitle");
var SaveButton=require("./savebutton");
var PureComponent=require('react-pure-render').PureComponent;
var styles={
	menu : {background:"silver"}
}
module.exports = class TextViewMenu extends PureComponent {

  render () {
  	return <span style={styles.menu}>
  		
  		<DocumentTitle title={this.props.trait.title} onSetTitle={this.props.onSetTitle}
  		onSetFlexHeight={this.props.onSetFlexHeight} flex={this.props.trait.flex}/>
  		 {this.props.readOnly?"(fixed text)":""}

  			<SaveButton {...this.props} />
  	</span>
  }
}