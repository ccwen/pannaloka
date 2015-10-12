var React=require("react");
var E=React.createElement;
var PureComponent=require('react-pure-render').PureComponent;
var styles={hyperlink:{color:"blue",cursor:"pointer",fontSize:"75%"}};
module.exports = class RangeHyperlink extends PureComponent {
	onClick =(e) => {
		var idx=parseInt(e.target.dataset.idx);
		var item=this.props.ranges[idx];
		this.props.onHyperlinkClick && this.props.onHyperlinkClick(item[0],item[1]);
	}
	/*componentDidUpdate(){
		
		if (this.props.ranges.length===1&&this.props.onHyperlinkClick) {
			var item=this.props.ranges[0];
			setTimeout(function(){
				this.props.onHyperlinkClick(item[0],item[1]);			
			}.bind(this),50);
		}

	}*/
	renderRange = (item,idx) => {
		return <span style={styles.hyperlink} data-idx={idx} key={idx}
		title={item[0]} onClick={this.onClick}>{" "+item[2]}</span>
	}
	render () {
		return <span>{this.props.ranges.map(this.renderRange)}</span>
	}
}