var React=require("react");
var styles={normal:{},hovered:{color:"blue",textDecoration:"underline",cursor:"pointer"}};

var RecentFiles=React.createClass({
	onClick:function(e){
		this.props.onOpenFile&&this.props.onOpenFile(e.target.dataset.fileid);
	}
	,getInitialState:function(){
		return {hovering:-1};
	}
	,onMouseEnter:function(e) {
		this.setState({hovering:parseInt(e.target.dataset.idx)});
	}
	,onMouseLeave:function(e) {
		this.setState({hovering:-1});
	}
	,renderItem:function(item,idx){
		return <div style={idx==this.state.hovering?styles.hovered:styles.normal} 
		data-idx={idx} key={idx} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}
		title={item[0]}data-fileid={item[0]} onClick={this.onClick}>{item[1]}</div>
	}
	,clear:function(){
		this.props.onClearRecent&&this.props.onClearRecent();
	}
	,renderClear:function(){
		if (this.props.files.length>20) return <button onClick={this.clear}>Clear rarely used items</button>
	}
	,render:function(){
		if (this.props.opening) {
			return <div>Opening file {this.props.opening}</div>
		} else {
			return <div><div>{this.props.files.map(this.renderItem)}</div>
			<div>{this.renderClear()}</div>
			</div>	
		}
	}
});
module.exports=RecentFiles;