var React=require("react");
var ReactDOM=require("react-dom");
var Component=React.Component;
var PureComponent=require('react-pure-render').PureComponent;
var FlexHeight=require("./flexheight");


var styles={
	container:{cursor:"pointer"}
	,input:{fontSize:"75%",border:"0px solid",outline:0}
	,cancelbutton:{fontSize:"75%"}
}
module.exports = class DocumentTitle extends PureComponent {
	constructor (props) {
		super(props);
		this.state={editing:false,title:props.title,flex:props.flex||1};
	}
	onChange = (e) => {
		this.setState({title:e.target.value});
	}

	onKeyUp = (e) => {
		if (e.key==="Enter") {
			this.cancelEdit();
			if (this.props.title!==this.state.title) {
				this.props.onSetTitle&&this.props.onSetTitle(this.state.title);
			}
		}
		else if (e.key==="Escape") {
			this.cancelEdit();
		}
	}

	componentDidUpdate () {
		var input=ReactDOM.findDOMNode(this.refs.titleinput);
		if (!input) return;
		if (document.activeElement!==input) {
			var len=this.state.title.length;
			input.focus(); 
			input.setSelectionRange(len,len)
		}
	}

	edit = () => {
		this.setState({editing:true});
	}

	setFlexHeight = (flex) => {
		this.setState({flex});
		this.props.onSetFlexHeight&&this.props.onSetFlexHeight(flex);
	}

	cancelEdit = () => {
		this.setState({editing:false});
	}

  render () {
  	if (this.state.editing) {
  		return <span style={styles.container}><input ref="titleinput" style={styles.input} 
  					autofocus onKeyUp={this.onKeyUp} 
  									onBlur={this.onBlur} 
  									onChange={this.onChange}  value={this.state.title}/>
  									<button style={styles.cancelbutton} title="ESC" onClick={this.cancelEdit}>cancel</button>
  								<FlexHeight flex={this.state.flex} setValue={this.setFlexHeight}/>
  						</span>
  	} else {
  		return <span style={styles.container} onClick={this.edit}>{this.props.title}</span>
  	}
  	
  }
}