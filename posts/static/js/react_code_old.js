/*==================================
=            Main React file       =
==================================*/

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

/**
* List Container for GenericForm objects
**/
var FormList = React.createClass({
  render: function() {
    // var formNodes;
    var uniquekey = -1; // For Reconciliation
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey++;
      return (
        <GenericForm key={uniquekey} object={object} schema={this.props.schema} unmount_element={this.props.unmount_element} handleEdit={this.props.handleEdit}>
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

/**
* Generic form object
**/
var GenericForm = React.createClass({
    deleteRequest: function() {
   $.ajax({
     url: this.props.object.resource_uri,
     type: 'DELETE',
     dataType: 'json',
     data:{},
     success: function (data, textStatus, xhr) {
        console.log(data);
     },
     error: function (xhr, textStatus, errorThrown) {
       console.error(xhr, textStatus, errorThrown.toString());
     }
   });
  },
  handleDelClick: function() {
    this.deleteRequest();
    this.props.unmount_element(this.props.object);
  },
  handleEditClick: function() {
    this.props.handleEdit(this.props.object);
  },
  render: function() {
    var content = [];
    var uniquekey = 0; // For Reconciliation
    // debugger;
    if(this.props.schema){
      // Pentru fiecare prop din object
      _.forEach(this.props.object, function (val, key){
        // Extrag type si apelez functia corespunzatoare
        var fieldType = this.props.schema[key].type;
        switch(fieldType){
          case 'string':
            content.push(React.createElement(StringComponent, {val: val, objkey: key, key: uniquekey}));
            break;
          case 'datetime':
            content.push(React.createElement(DateTimeComponent, {val: val, objkey: key, key: uniquekey}));
            break;
          case 'related':
            content.push(React.createElement(RelatedComponent, {val: val, objkey: key, key: uniquekey}));
            break;
        }
        uniquekey++;
      }.bind(this));
    }

    return (
      <div className="col-md-4">
        <div className="panel panel-default GenericForm">
          <div className="panel-heading">
            <div className="row">
              <button type="button" onClick={this.handleEditClick} className="col-md-6 btn btn-default">Edit</button>
              <button type="button" onClick={this.handleDelClick} className="col-md-6 btn btn-default">Delete</button>
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


var EditPanel = React.createClass({
  // mixins: [React.addons.LinkedStateMixin],
  // getInitialState: function() {
  //   return {title: '',
  //           content: ''};
  // },
  handleSubmit: function(e){
    e.preventDefault();
    // var title = this.state.title;
    // var content = this.state.content;
    // if (!content || !title) {
    //   return;
    // }
    // this.props.handleCommentEdit({author: "/posts/api/v1/author/1/",content: content, title: title});
    // this.setState({title: '',content: ''})
    // return;
  },
  handleCancelClick: function(){
    this.props.unmount_edit();
  },
  render: function() {
    var content = [];
    var uniquekey = 0; // For Reconciliation
    // debugger;
    if(this.props.schema){
      // Pentru fiecare prop din object
      _.forEach(this.props.object, function (val, key){
        // Extrag type si apelez functia corespunzatoare
        var fieldType = this.props.schema[key].type;
        switch(fieldType){
          case 'string':
            content.push(React.createElement(EditStringComponent, {val: val, objkey: key, key: uniquekey}));
            break;
          case 'datetime':
            content.push(React.createElement(DateTimeComponent, {val: val, objkey: key, key: uniquekey}));
            break;
          case 'related':
            content.push(React.createElement(RelatedComponent, {val: val, objkey: key, key: uniquekey}));
            break;
        }
        uniquekey++;
      }.bind(this));
    }

    return (
      <div className="EditPanel">
        <div className="panel panel-default EditPanel">
          <div className="panel-heading text-center">
          Edit Form
          </div>
          <div className="panel-body">
              <form className="commentForm" onSubmit={this.handleSubmit}>
                {content.map(function (obj) { return obj;})}
                <div className="col-md-1"></div>
                <input type="submit" className="btn btn-default col-md-4" value="Edit" />
                <div className="col-md-2"></div>
                <button type="button" onClick={this.handleCancelClick} className="col-md-4 btn btn-default">Cancel</button>
              </form>
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
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {title: '',
            content: ''};
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.state.title;
    var content = this.state.content;
    if (!content || !title) {
      return;
    }
    this.props.onFormSubmit({author: "/posts/api/v1/author/1/",content: content, title: title});
    this.setState({title: '',content: ''})
    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" pluginsaceholder="Title" ref="title" valueLink={this.linkState('title')}/>
        <input type="text" placeholder="Content" ref="content" valueLink={this.linkState('content')}/>
        <input type="submit" value="Add" />
      </form>
      );
  }
});


React.render(
  <FormBox url='http://localhost:8000/posts/api/v1/post/'/>,
  document.getElementById('content')
  );
