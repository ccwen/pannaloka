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


	renderItem = (item,idx) => {
		var rendered=(this.props.renderItem)?this.props.renderItem(item,idx,this.hovering):null;
		if (!rendered) {
			var text=item[2];
			if (text.length>8) text=item[2].substring(0,7)+"…";			
			rendered=<span key={idx}> | <span className="rangehyperlink" style={styles.hyperlink} data-idx={idx} 
				title={item[3]||item[0]} onMouseEnter={this.onMouseEnter}
				onClick={this.onClick}><span>{text}</span></span>
				</span>
		}
		return rendered;
	}

	/* range format : file, mid_range , text */
	renderRange = (item,idx) => {
		if (item[1]) {
			return this.renderItem(item,idx);
		} else {
			return <span key={idx}> | <span style={styles.label} title={item[3]||item[0]}>{item[2].substring(0,10)}</span></span>
		}
	}

	render () {
		return <span>{this.props.ranges.map(this.renderRange)}</span>
	}
}