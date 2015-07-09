/**
* Main container
**/
var FormBox = React.createClass({
  getInitialState: function() {
    return {resource: {objects: null},
            schema: {fields: null},
            url: null};
  },
  componentDidMount: function(){
    // Hack ca sa nu mai trebuiasca sa apas pe buton la refresh
    //this.loadCommentsFromServer("/posts/api/v1/post/");
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
  getEmptyObject: function() {
    // Gets an empty object corresponding to the schema
    // Used on the Add form
    var object = {};
    var data_available = this.state.schema.fields;
    if(data_available){
      _.forEach(this.state.schema.fields, function (val, key){
        object[key] = null;
        //Daca e related. Atunci populeaza cu un placeholder
        if(val.resource){
          object.author = "Select resource";
        }
      });
    // object.author = logged_user;
    object.resource_uri = this.state.url;
    }
    return object;
  },
  loadCommentsFromServer: function(url) {
    if(!url) return;
    // Load resource
    $.ajax({
      url: url,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        this.setState({resource: data, url: url});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
    // Load schema
    $.ajax({
      url: url + 'schema',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        this.setState({schema: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(object) {
    $.ajax({
      url: this.state.url,
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
        console.error(this.state.url, status, err.toString());
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
        console.error(object.resource_uri, status, err.toString());
      }.bind(this)
    });
  },
  handleRender: function(e) {
    e.preventDefault();
    var url = "/posts" + this.refs.gameTitle.refs.input.getDOMNode().value
    this.loadCommentsFromServer(url);
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

    var Input = ReactBootstrap.Input;
    var resourceSelector = (
    <Input ref='gameTitle' type='select' placeholder='Select endpoint'>
      <option value='/api/v1/post/'>/api/v1/post/</option>
      <option value='/api/v1/author/'>/api/v1/author/</option>
      <option value='/api/v2/manufacturer/'>/api/v2/manufacturer/</option>
      <option value='/api/v2/car/'>/api/v2/car/</option>
    </Input>)
    var ButtonInput = ReactBootstrap.ButtonInput;
    var renderButton =  <ButtonInput type='submit' value='Render' />

    var Navbar = ReactBootstrap.Navbar;
    var NavItem = ReactBootstrap.NavItem;
    var Nav= ReactBootstrap.Nav;
    var navBar = (<Navbar brand='Dynamic Form Builder 0.4'>
    <Nav>
    {resourceSelector}
    </Nav>
    </Navbar>)

    return (
      <div className="formBox">
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">Dynamic Form Builder Version 0.4</a>
          </div>
          <div className="row">
            <div className="col-md-5">
            <form onSubmit={this.handleRender} className="navbar-form navbar-right" role="search">
                {resourceSelector}
                {renderButton}
            </form>
            </div>
          </div>
        </nav>
        {formlist}
      </div>
      );
  }
});


React.render(
  <FormBox />,
  document.getElementById('content')
  );
// var logged_user = "/posts/api/v1/author/1/";