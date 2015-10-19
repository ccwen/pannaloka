var React=require("react");
var Component=React.Component;

var styles={
	savebutton :{fontSize:"75%"}
	,saved:{background:"green",color:"yellow"}
}
module.exports = class SaveButton extends Component {

	constructor (props)	 {
		super(props);
		this.state={saved:false,countdown:60};
	}

	componentWillReceiveProps (nextProps) {
		if (!nextProps.dirty && this.props.dirty) {
			this.setState({saved:true});
			setTimeout(function(){
				this.setState({saved:false});
			}.bind(this),1000);
		}
		if (nextProps.dirty ) {
			clearInterval(this.countdowntimer);
			this.setState({countdown:60});
			this.countdowntimer=setInterval(function(){
				if (this.state.countdown==0) {
					this.props.onSave();//autosave
					clearInterval(this.countdowntimer);
				}
				this.setState({countdown:this.state.countdown-1})
			}.bind(this),1000);
		}
	}

	componentWillUnmount () {
		clearInterval(this.countdowntimer);
	}

	render () {
		if (this.state.saved) {
			return <span style={styles.saved}>Saved!!</span>
		}
		if (this.props.dirty) {
			var countdown=this.state.countdown;
			if (countdown>10) countdown=Math.round(countdown/10)*10;
			return (<span>
					<button style={styles.savebutton} onClick={this.props.onSave}>Save in {countdown+"s"}</button>
				</span>);
		} else {
			return <span></span>
		}
	}	
}
