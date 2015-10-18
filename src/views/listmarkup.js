var React=require("react");
var selectionstore=require("../stores/selection");
var findmarkup=require("../markup/find");
var RangeHyperlink=require("../components/rangehyperlink");
var util=require("./util");
var types=require("../markuptypedef").types;
module.exports = class ListMarkup extends React.Component {
	constructor (props) {
		super(props);
		this.state={links:[]};
	}
	componentDidMount () {
		this.unsubscribe = selectionstore.listen(this.onSelection);
	}
	componentWillUnmount(){
		this.unsubscribe();
	}

	onHyperlinkClick = (file,key_range) => {
		util.gotoRangeOrMarkupID(file,key_range,null,{moveCursor:true});
	}

	findMarkup = () => {
			var ranges=selectionstore.getRanges({textLength:20});
			if (!ranges || ranges.length!==1)return ;
			var rangetext=ranges[0][2];
			var markups=findmarkup.byMasterText(rangetext,this.props.markups);
			if (!markups|| !markups.length) return;
			var links=markups.map(function(key){
				var clsname=this.props.markups[key].className;
				var typelabel="~"+types[clsname].label;
				return [this.props.filename, key, typelabel ];
			}.bind(this));
			if (this.props.filename==ranges[0][0]) {
				links.unshift([this.props.filename, ranges[0][1], rangetext,"back to selection" ]);//for link back to selection
			}
			this.setState({links});
	}	

	onSelection = (fileselections) => {
		clearTimeout(this.timer);
		var delta=Math.round(Math.random()*200);
		this.timer=setTimeout(this.findMarkup,800+delta);//different view get fired seperately
	}
	render () {
		return <span><RangeHyperlink onHyperlinkClick={this.onHyperlinkClick} ranges={this.state.links}/></span>
	}
}