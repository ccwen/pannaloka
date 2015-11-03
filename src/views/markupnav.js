var React=require("react");
var markupstore=require("../stores/markup");
var markupNav = React.createClass({
	next :function() {
		var next=markupstore.getNext();
		this.props.goMarkupByKey(next);
	}
	,prev :function() {
		var prev=markupstore.getPrev();
		this.props.goMarkupByKey(prev);
	}
	,render :function() {
		var editing=markupstore.getEditing();
		if (!editing) return <span></span>
		return <span>
			<button onClick={this.prev}>Prev</button>
			<button onClick={this.next}>Next</button>

		</span>
	}
});
module.exports=markupNav;