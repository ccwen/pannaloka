var React=require("react");
var Component=React.Component;
var DocumentTitle=require("./documenttitle");
var SaveButton=require("./savebutton");
var PureComponent=require('react-pure-render').PureComponent;

var styles={
	menu : {display:"flex",background:"silver"}
	,closebutton :{borderRadius:"50%",background:"#FF7F7F",color:"white",marginLeft:"auto",cursor:"pointer"}
}
module.exports = class TextViewMenu extends PureComponent {
  render () {
  	return <div style={styles.menu}>
  		<SaveButton {...this.props} />
  		<DocumentTitle title={this.props.title} onSetTitle={this.props.onSetTitle} />({this.props.wid})
  		<span style={styles.closebutton} onClick={this.props.onClose}>x</span>
  	</div>
  }
}