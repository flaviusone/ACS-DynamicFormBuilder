
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
  componentWillReceiveProps: function(nextProps) {
    this.setState({value: nextProps.val});
  },
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    var value = this.state.value;
    var readonly = this.props.schema.readonly;
    var field;
    if(readonly){
      field = {value}
    } else {
      field = <input id={this.props.obj_id} className="form-control" type="text" value={value} onChange={this.handleChange}/>;
    }
    return (
      <div className="StringComponent">
        <strong>{final_key}</strong> :
        {field}
      </div>
    );
  }
});

var DateTimeComponent = React.createClass({
  componentDidMount: function() {
    if(this.props.method!=null){
      var id = '#'+this.props.obj_id;
      // Initializez campul cu data ce vreau sa o modific.
      var init_data = {}
      if(this.props.val){
          init_data.defaultDate =  new Date(this.props.val)
        }
      $(function () { $(id).datetimepicker(init_data); });
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if(this.props.method!=null){
      var id = '#'+this.props.obj_id;
      // Initializez campul cu data ce vreau sa o modific.
      var init_data = {}
      if(nextProps.val){
          init_data.defaultDate =  new Date(nextProps.val)
        }
      $(function () { $(id).data("DateTimePicker").date(new Date(nextProps.val)); });
    }
  },
  render: function() {
    var date = new Date(this.props.val);
    var final_key = _.startCase(this.props.objkey);
    var field;
    if(this.props.method){
      field = <input type='text' className="form-control" id={this.props.obj_id} />
    } else {
      field = date.toUTCString();
    }
    return (
      <div className="DateTimeComponent">
        <strong>{final_key}</strong>: {field}
      </div>
    );
  }
});

var IntegerComponent = React.createClass({
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    return (
      <div className="IntegerComponent">
        <strong>{final_key}</strong> : {this.props.val}
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