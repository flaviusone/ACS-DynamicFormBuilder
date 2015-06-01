
var StringComponent = React.createClass({
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    return (
      <div className="StringComponent">
        <strong>{final_key}</strong> : {this.props.val}
      </div>
    );
  }
});

var EditStringComponent = React.createClass({
  getInitialState: function() {
    return {value: this.props.val};
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    var value = this.state.value;
    return (
      <div className="StringComponent">
        <strong>{final_key}</strong> :
        <input type="text" value={value} onChange={this.handleChange}/>
      </div>
    );
  }
});

var DateTimeComponent = React.createClass({
  render: function() {
    var date = new Date(this.props.val);
    var final_key = _.startCase(this.props.objkey);
    return (
      <div className="DateTimeComponent">
        <strong>{final_key}</strong> : {date.toUTCString()}
      </div>
    );
  }
});

var RelatedComponent = React.createClass({
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    return (
      <div className="RelatedComponent">
        <strong>{final_key}</strong> : {this.props.val}
      </div>
    );
  }
});