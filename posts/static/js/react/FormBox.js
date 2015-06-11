/**
* Main container
**/
var FormBox = React.createClass({
  getInitialState: function() {
    return {resource: {objects: null},
            schema: {fields: null}};
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
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  getEmptyObject: function() {
    // Gets an empty object corresponding to the schema
    // Used on the Add form
    var object = {};
    var data_available = this.state.schema.fields;
    if(data_available){
      _.forEach(this.state.schema.fields, function (val, key){
        object[key] = null;
      });
    object.author = logged_user;
    object.resource_uri = this.props.url;
    }
    return object;
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
  handleCommentSubmit: function(object) {
    $.ajax({
      url: this.props.url,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(object),
      success: function(data) {
        var new_data =  _.cloneDeep(this.state.resource);
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
      url: object.resource_uri,
      type: 'PATCH',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(object),
      success: function(data) {
        // Update the element with response from server
        var new_data = _.cloneDeep(this.state.resource);
        var index = _.findIndex(new_data.objects, 'resource_uri', data.resource_uri);
        new_data.objects[index] = data;
        this.setState({resource: new_data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var data_available = (this.state.resource.objects && this.state.schema.fields);
    var formlist;

    if (data_available) {
      formlist =<FormList
                    handleSubmit={this.handleCommentSubmit}
                    handleEdit={this.handleCommentEdit}
                    getEmptyObject={this.getEmptyObject}
                    unmount_element={this.unmount_element}
                    resource={this.state.resource}
                    schema={this.state.schema.fields}>
                </FormList>;
    }

    return (
      <div className="formBox">
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <h3> Dynamic Form Builder Version 0.3 </h3>
          </div>
        </nav>
        {formlist}
      </div>
      );
  }
});

React.render(
  <FormBox url='/posts/api/v1/post/'/>,
  document.getElementById('content')
  );
var logged_user = "/posts/api/v1/author/1/";