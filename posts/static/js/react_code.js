/*==================================
=            Main React file       =
==================================*/

/**
* Main container
**/
var FormBox = React.createClass({
  getInitialState: function() {
    return {resource: {objects: []},
            schema: {fields: {}}};
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
        this.setState({resource: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentWillMount: function() {
    this.loadCommentsFromServer();
  },
  render: function() {
    return (
      <div className="formBox">
        <h1> Dynamic Form Builder Version 0.1 </h1>
        <AddForm onFormSubmit={this.handleCommentSubmit}/>
        <br></br>
        <FormList resource={this.state.resource} schema={this.state.schema.fields}/>
      </div>
      );
  }
});

/**
* List Container for GenericForm objects
**/
var FormList = React.createClass({
  render: function() {
    // var formNodes;
    var formNodes = this.props.resource.objects.map(function (object) {
      return (
        <GenericForm object={object} schema={this.props.schema}>
        </GenericForm>
        );
    }.bind(this));
    return (
      <div className="row FormList">
      {formNodes}
      </div>
      );
  }
});


/**
* Generic form object
**/
var GenericForm = React.createClass({

  unmount: function() {
    var node = this.getDOMNode();
    React.unmountComponentAtNode(node);
    $(node).remove();
  },
  deleteRequest: function() {
   $.ajax({
     url: this.props.url,
     type: 'DELETE',
     dataType: 'json',
     data:{},
     success: function (data, textStatus, xhr) {

     },
     error: function (xhr, textStatus, errorThrown) {
       console.log('Error in Delete operation');
     }
   });
  },
  componentWillMount: function(){
    this.props.object = null;
    this.props.schema = null;
  },
  handleClick: function() {
    this.deleteRequest();
    this.unmount();
  },
  renderStringComponent:function(key, val){
    var final_key = _.startCase(key);
    return (
      <div>
        <strong>{final_key}</strong> : {val}
      </div>
      )
  },
  renderDateTimeComponent:function(key, val){
    var date = new Date(val);
    var final_key = _.startCase(key);
    return (
      <div>
        <strong>{final_key}</strong> : {date.toUTCString()}
      </div>
      )
  },
  renderRelatedComponent:function(key, val){
    var final_key = _.startCase(key);
    return (
      <div>
        <strong>{final_key}</strong> : {val}
      </div>
      )
  },
  render: function() {
    var content = [];
    if(this.props.schema){
      // Pentru fiecare prop din object
      _.forEach(this.props.object, function (val, key){
        // Extrag type si apelez functia corespunzatoare
        var fieldType = this.props.schema[key].type;
        switch(fieldType){
          case 'string':
            content.push(this.renderStringComponent(key, val));
            break;
          case 'datetime':
            content.push(this.renderDateTimeComponent(key, val));
            break;
          case 'related':
            content.push(this.renderRelatedComponent(key, val));
            break;
        }
      }.bind(this));
    }

    return (
      <div className="col-md-4">
        <div className="panel panel-default GenericForm">
          <div className="panel-heading">
            <div className="row">
              <button type="button" className="col-md-6 btn btn-default">Edit</button>
              <button type="button" onClick={this.handleClick} className="col-md-6 btn btn-default">Delete</button>
            </div>
          </div>
          <div className="panel-body">
            {content.map(function (obj) { return obj;})}
          </div>
        </div>
      </div>
      );
  }
});

/**
* Add new GenericForm
**/
var AddForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var title = React.findDOMNode(this.refs.title).value.trim();
    var content = React.findDOMNode(this.refs.content).value.trim();
    if (!content || !title) {
      return;
    }
    this.props.onFormSubmit({author: "/posts/api/v1/author/1/",content: content, title: title});
    React.findDOMNode(this.refs.title).value = '';
    React.findDOMNode(this.refs.content).value = '';
    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Title" ref="title" />
        <input type="text" placeholder="Content" ref="content" />
        <input type="submit" value="Add" />
      </form>
      );
  }
});


React.render(
  <FormBox url='http://localhost:8000/posts/api/v1/post/'/>,
  document.getElementById('content')
  );

