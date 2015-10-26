var React=require("react");
var E=React.createElement;
var PureComponent=require('react-pure-render').PureComponent;
var styles={hyperlink:{cursor:"pointer",color:"blue",fontSize:"75%"},label:{fontSize:"75%"}};

module.exports = class RangeHyperlink extends PureComponent {

	getIdx = (e) => {
		var domnode=e.target;
		while (domnode && (!domnode.dataset || !domnode.dataset.idx)) {
			domnode=domnode.parentElement;
		} 
		if (domnode) {
			var idx=parseInt(domnode.dataset.idx);
			return idx;			
		}
	}

	onClick =(e) => {
		var idx=this.getIdx(e);
		var item=this.props.ranges[idx];
		this.props.onHyperlinkClick && this.props.onHyperlinkClick(item[0],item[1]);
	}

	onMouseEnter = (e) => {
		var idx=this.getIdx(e);
		var item=this.props.ranges[idx];
		if (idx!==this.hovering) {
			this.hovering=idx;
			this.forceUpdate();
		}
		this.hovering=idx;
		
		this.props.onHyperlinkEnter && this.props.onHyperlinkEnter(item[0],item[1]);
	}

	renderSideButton = (idx) => {
		return this.props.renderSideButton&& this.props.renderSideButton(idx,this.hovering);
	}

	/* range format : file, mid_range , text */
	renderRange = (item,idx) => {
		if (item[1]) {
			return <span key={idx} > | 

			  <span className="rangehyperlink" style={styles.hyperlink} data-idx={idx} 
				title={item[3]||item[0]} onMouseEnter={this.onMouseEnter}
				onClick={this.onClick}><span>{item[2].substring(0,10)}</span>
				{this.renderSideButton(idx)}</span>

				</span>
		} else {
			return <span key={idx}> | <span style={styles.label} title={item[3]||item[0]}>{item[2].substring(0,10)}</span></span>
		}
	}

	render () {
		return <span>{this.props.ranges.map(this.renderRange)}</span>
	}
}