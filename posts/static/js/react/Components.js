
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
  getInitialState: function() {
    return {resource: {objects: null},
            schema: {fields: null},
            edit_data: null};
  },
  loadCommentsFromServer: function(url) {
    // Load resource
    $.ajax({
      url: url,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        this.setState({resource: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
    // Load schema
    var str = url;
    str = str.substring(0, _.lastIndexOf(str, "/", str.length-2)+1)
    $.ajax({
      url: str + 'schema/',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        this.setState({schema: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleEditPress: function(){
    this.loadCommentsFromServer(this.props.val)
  },
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    var edit_button;
    var data_available = (this.state.resource.objects && this.state.schema.fields);
    if(this.props.method == "Edit"){
      edit_button = <button type="button" onClick={this.handleEditPress} className="btn btn-default">Edit</button>
    }
    var object = this.state.resource;
    var schema = this.state.schema.fields;
    var content = [];
    if(object && schema){
      var uniquekey = 0; // For Reconciliation
      // Pentru fiecare prop din object
      _.forEach(object, function (val, key){
          if(!schema[key]) return;
          // Extrag type si apelez functia corespunzatoare
          var fieldType = schema[key].type;
          // Un id unic ca sa il pot gasi cu getElementById
          var obj_id = uniquekey+this.props.method;
          switch(fieldType){
            case 'string':
              content.push(React.createElement(StringComponent, {val: val, schema: schema[key], objkey: key, key: uniquekey, obj_id: obj_id}));
              break;
            case 'datetime':
              content.push(React.createElement(DateTimeComponent, {val: val, schema: schema[key], objkey: key, key: uniquekey, obj_id: obj_id, method: null}));
              break;
            case 'related':
              content.push(React.createElement(RelatedComponent, {val: val, schema: schema[key], objkey: key, key: uniquekey, method: null}));
              break;
            case 'integer':
              content.push(React.createElement(IntegerComponent, {val: val, schema: schema[key], objkey: key, key: uniquekey}));
              break;
        }
        uniquekey++;
      }.bind(this));
      content = <GenericForm object={this.state.resource} schema={this.state.schema.fields} unmount_element={null} handleEdit={null}></GenericForm>
    }
    // {content.map(function (obj) { return obj;})}
    return (
      <div className="RelatedComponent">
        <strong>{final_key}</strong> : {this.props.val} {edit_button}
        {content}
      </div>
    );
  }
});