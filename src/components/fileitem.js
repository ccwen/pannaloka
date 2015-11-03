var React=require("react");

var selectedstyle={cursor:"pointer"};
var style={cursor:"default"};

var FileItem = React.createClass({
	renderTitle:function() {
		if (this.props.selected) {
			return <a href="#" onClick={this.props.onClick} title={this.props.filename}>{this.props.title||this.props.t}</a>
		} else {
			return <span title={this.props.filename}>{this.props.title||this.props.t}</span>;
		}
	}
	,render:function () {
		return <div style={this.props.selected?selectedstyle:style}>
			{this.renderTitle()}
		</div>
	}
});

module.exports = FileItem;