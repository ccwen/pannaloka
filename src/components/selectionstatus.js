var React=require("react");

var styles={
	unicode:{fontFamily:"courier"}
}
var SelectionStatus = React.createClass({

	renderSelection :function(sels) {
		return sels.map(function(sel,idx){
			return <span key={idx}>{"["+sel[0]+(sel[1]?":"+sel[1]:"")+"]"}</span>
		});
	}

	,renderCh :function(ch) {
		if (!ch) return ;
		return <span style={styles.unicode} key="ch" title={ch}>U+{ch.charCodeAt(0).toString(16).toUpperCase()}</span>
	}
	,render :function() {
		
		var out=[],c=0;
		for (var i in this.props.selections) {
			if (!this.props.selections[i].length) continue;
			out.push(<span key={c++}>({i})</span>)
			out.push(<span key={c++}>{this.renderSelection(this.props.selections[i])}</span>);
		}

		if (out.length) out.unshift(<span key="name">, sels:</span>);
	
		return <span>|{this.renderCh(this.props.cursorch)}{out}</span>
	}	
});
module.exports = SelectionStatus;