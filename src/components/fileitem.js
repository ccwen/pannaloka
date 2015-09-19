var React=require("react");
var PureComponent=require('react-pure-render').PureComponent;

var selectedstyle={background:"highlight",cursor:"pointer",borderBottom:"1px solid blue"};
var style={cursor:"default"};

var FileItem = React.createClass({
	renderTitle:function() {
		if (this.props.selected) {
			return <a href="#" onClick={this.props.onClick}>{this.props.title}</a>
		} else {
			return this.props.title;
		}
	}
	,render:function () {
		return <div style={this.props.selected?selectedstyle:style}>
			{this.renderTitle()}
		</div>
	}
});

module.exports = FileItem;