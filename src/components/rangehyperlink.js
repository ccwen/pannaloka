var React=require("react");
var E=React.createElement;
var PureComponent=require('react-pure-render').PureComponent;
var styles={hyperlink:{color:"blue",cursor:"pointer"}};
module.exports = class RangeHyperlink extends PureComponent {
	onClick (e) {
		var idx=parseInt(e.target.dataset.idx);
		var item=this.props.ranges[idx];
		this.props.onHyperlinkClick && this.props.onHyperlinkClick(item[0],item[1]);
	}
	renderRange (item,idx) {
		return <span style={styles.hyperlink} data-idx={idx} key={idx}
		title={item[0]} onClick={this.onClick.bind(this)}>{item[2]}</span>
	}
	render () {
		return <span>{this.props.ranges.map(this.renderRange.bind(this))}</span>
	}
}