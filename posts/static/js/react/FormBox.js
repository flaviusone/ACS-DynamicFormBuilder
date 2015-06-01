/**
* Main container
**/
var FormBox = React.createClass({
  getInitialState: function() {
    return {resource: {objects: null},
            schema: {fields: null},
            edit_data: null};
  },
  loadCommentsFromServer: function() {
    // Load resource
    $.ajax({
      url: this.props.url,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        this.setState({resource: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    // Load schema
    $.ajax({
      url: this.props.url + 'schema',
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
  shouldComponentUpdate: function(nextProps, nextState) {
    // Don't rerender untill objects and schema are available
    return (nextState.resource.objects && nextState.schema.fields )
  },
  unmount_element: function(object){
    var resource = this.state.resource;
    var removed = _.remove(resource.objects, function(obj) {
      return obj.id == object.id;
    });
    this.setState(resource);
  },
  unmount_edit: function(){
    this.setState({edit_data: null})
  },
  handleEditPress: function(object){
    this.setState({edit_data: object})
  },
  handleCommentSubmit: function(object) {
    $.ajax({
      url: this.props.url,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(object),
      success: function(data) {
        var new_data = this.state.resource;
        new_data.objects.push(data);
        this.setState({resource: new_data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentEdit: function(object) {
    $.ajax({
      url: this.props.url,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(object),
      success: function(data) {
        var new_data = this.state.resource;
        new_data.objects.push(data);
        this.setState({resource: new_data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  render: function() {
    var data_available = (this.state.resource.objects && this.state.schema.fields);
    var edit_data = this.state.edit_data;
    var formlist, editpanel;

    if (data_available) {
      formlist = <FormList handleEdit={this.handleEditPress} unmount_element={this.unmount_element} resource={this.state.resource} schema={this.state.schema.fields}/>;
    } else {
      formlist = null;
    };

    if(edit_data){
      editpanel = <EditPanel handleEditClick={this.handleEditClick} object={this.state.edit_data} schema={this.state.schema.fields} unmount_edit={this.unmount_edit}/>
    } else {
      editpanel = null;
    }

    return (
      <div className="formBox">
        <h1> Dynamic Form Builder Version 0.1 </h1>
        <AddForm onFormSubmit={this.handleCommentSubmit}/>
        <br></br>
        <div className="col-md-7">
        {formlist}
        </div>
        <div className="col-md-5">
        {editpanel}
        </div>
      </div>
      );
  }
});

React.render(
  <FormBox url='http://localhost:8000/posts/api/v1/post/'/>,
  document.getElementById('content')
  );
