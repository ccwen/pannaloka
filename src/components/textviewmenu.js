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
  		<SaveButton {...this.props} />
  		<DocumentTitle title={this.props.title} onSetTitle={this.props.onSetTitle} />
  		{this.props.readOnly?"(fixed text)":""}
  	</span>
  }
}