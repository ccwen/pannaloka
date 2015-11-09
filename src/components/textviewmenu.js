var React=require("react");
var Component=React.Component;
var DocumentTitle=require("./documenttitle");
var SaveButton=require("./savebutton");
var PureRender=require('react-addons-pure-render-mixin');

var styles={
	menu : {background:"silver"}
}
TextViewMenu = React.createClass({
  render :function() {
  	return <span style={styles.menu}>
  		
  		<DocumentTitle title={this.props.trait.title} onSetTitle={this.props.onSetTitle}
  		filename={this.props.trait.filename}
      onSetFlexHeight={this.props.onSetFlexHeight} flex={this.props.trait.flex}/>

  		 {this.props.readOnly?"(fixed text)":""}

  			<SaveButton {...this.props} />
  	</span>
  }
});
module.exports = TextViewMenu;