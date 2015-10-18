var React=require("react");
var markupstore=require("../stores/markup");
module.exports = class markupNav extends React.Component {
	next = () => {
		var next=markupstore.getNext();
		this.props.goMarkupByKey(next);
	}
	prev = () => {
		var prev=markupstore.getPrev();
		this.props.goMarkupByKey(prev);
	}
	render () {
		var editing=markupstore.getEditing();
		if (!editing) return <span></span>
		return <span>
			<button onClick={this.prev}>Prev</button>
			<button onClick={this.next}>Next</button>

		</span>
	}
}