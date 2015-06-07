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


// var StringComponent = React.createClass({
//   render: function() {
//     var final_key = _.startCase(this.props.objkey);
//     return (
//       <div className="StringComponent">
//         <strong>{final_key}</strong> : {this.props.val}
//       </div>
//     );
//   }
// });

var StringComponent = React.createClass({
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

    if(this.props.display_state == "edit"){
      if(readonly){
        field = {value}
      } else {

        var nr_rows = Math.ceil(value.length/60);
        console.log(value.length+" "+nr_rows);
        field = <textarea rows={nr_rows} id={this.props.obj_id} className="form-control" type="text" value={value} onChange={this.handleChange}/>;
      }
    } else {
      field = {value}
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

var EditPanel = React.createClass({
  handleSubmit: function(e){
    var uniquekey = 0;
    var requestObj = {};
    if(this.props.schema){
      // Pentru fiecare prop din object
      _.forEach(this.props.object, function (val, key){
         var obj_id = uniquekey+this.props.method;
         // Citesc din campurile modificabile
         var inputVal = document.getElementById(obj_id);
         if(inputVal){
           // Adauga la obiect key:inputVal.value
           requestObj[key] = inputVal.value;
         }else{
           // Adauga la obiect key:value
           requestObj[key] = val;
         }
        uniquekey++;
      }.bind(this));
    }
  // Ajax request
  this.props.handleSubmit(requestObj, this.props.method);

  if(this.props.method=="Edit"){
    this.props.unmount_edit();
  }

  return;
  },
  handleCancelClick: function(){
    this.props.unmount_edit();
  },
  render: function() {
    var content = [];
    var uniquekey = 0; // For Reconciliation
    var object = this.props.object;
    if(this.props.schema){
      // Pentru fiecare prop din object
      _.forEach(object, function (val, key){
          if(!this.props.schema[key]) return;
          // Extrag type si apelez functia corespunzatoare
          var fieldType = this.props.schema[key].type;
          // Un id unic ca sa il pot gasi cu getElementById
          var obj_id = uniquekey+this.props.method;
          switch(fieldType){
            case 'string':
              content.push(React.createElement(StringComponent, {val: val, schema: this.props.schema[key], objkey: key, key: uniquekey, obj_id: obj_id}));
              break;
            case 'datetime':
              content.push(React.createElement(DateTimeComponent, {val: val, schema: this.props.schema[key], objkey: key, key: uniquekey, obj_id: obj_id, method: this.props.method}));
              break;
            case 'related':
              content.push(React.createElement(RelatedComponent, {val: val, schema: this.props.schema[key], objkey: key, key: uniquekey, method: this.props.method}));
              break;
            case 'integer':
              content.push(React.createElement(IntegerComponent, {val: val, schema: this.props.schema[key], objkey: key, key: uniquekey}));
              break;
        }
        uniquekey++;
      }.bind(this));
    }

    // Display only on the edit form
    var cancelbutton;
    if(this.props.method == "Edit"){
      cancelbutton = <button type="button" onClick={this.handleCancelClick} className="col-md-4 btn btn-default">Cancel</button>
    } else {
      cancelbutton = "";
    }

    return (
        <div className="panel panel-default EditPanel">
          <div className="panel-heading text-center">
          {this.props.method} Form
          </div>
          <div className="panel-body">
            {content.map(function (obj) { return obj;})}
            <br></br>
            <div className="col-md-1"></div>
            <button type="button" onClick={this.handleSubmit} className="col-md-4 btn btn-default">Submit</button>
            <div className="col-md-2"></div>
            {cancelbutton}
          </div>
        </div>
    );
  }
});

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
  handleCommentEdit: function(object, method) {
    $.ajax({
      url: object.resource_uri,
      type: 'PATCH',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(object),
      success: function(data) {
        var new_data = this.state.resource;
        // Caut indexul vechului element care a fost updatat ca sa il suprascriu
        var index = _.findIndex(this.state.resource.objects, _.matchesProperty('resource_uri', data.resource_uri));
        new_data.objects[index] = data;
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
  render: function() {
    var data_available = (this.state.resource.objects && this.state.schema.fields);
    var edit_data = this.state.edit_data;
    var formlist, addpanel;

    if (data_available) {
      formlist = <FormList handleSubmit={this.handleCommentSubmit} unmount_element={this.unmount_element} resource={this.state.resource} schema={this.state.schema.fields}/>;
      addpanel = <EditPanel method="Add" handleSubmit={this.handleCommentSubmit} object={this.getEmptyObject()} schema={this.state.schema.fields}/>
    }

    return (
      <div className="formBox">
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <h3> Dynamic Form Builder Version 0.3 </h3>
          </div>
        </nav>

        <div className="row">
          {addpanel}
          {formlist}
        </div>
      </div>
      );
  }
});

React.render(
  <FormBox url='/posts/api/v1/post/'/>,
  document.getElementById('content')
  );
var logged_user = "/posts/api/v1/author/1/";
/**
* List Container for GenericForm objects
**/
var FormList = React.createClass({
  render: function() {
    var uniquekey = -1; // For Reconciliation
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey++;
      return (
          <GenericForm display_state="show" key={uniquekey} handleSubmit={this.props.handleSubmit} unmount_element={this.props.unmount_element} object={object} schema={this.props.schema}>
          </GenericForm>
        );
    }.bind(this));
    return (
      <div className="FormList">
      {formNodes}
      </div>
      );
  }
});

/**
* Generic form object
**/
var GenericForm = React.createClass({
  getInitialState: function() {
    return {display_state: this.props.display_state};
  },
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
  handleCancelClick: function(){
    this.setState({display_state: "show"})
  },
  handleSubmitClick: function(){
    // Do serious stuff
    // Din EditPanel
    this.setState({display_state: "show"})
  },
  handleEditClick: function() {
    if(this.state.display_state=="show"){
      this.setState({display_state: "edit"});
    } else {
      this.setState({display_state: "show"});
    }

  },
  render: function() {
    var content = [];
    var uniquekey = 0; // For Reconciliation
    // debugger;
    if(this.props.schema){
      // Pentru fiecare prop din object
      _.forEach(this.props.object, function (val, key){
        if(!this.props.schema[key]) return;
        // Extrag type si apelez functia corespunzatoare
        var fieldType = this.props.schema[key].type;
        switch(fieldType){
          case 'string':
            content.push(React.createElement(StringComponent,
                        {val: val, objkey: key, schema: this.props.schema[key],
                         key: uniquekey, display_state: this.state.display_state}));
            break;
          case 'datetime':
            content.push(React.createElement(DateTimeComponent,
                        {val: val, objkey: key, schema: this.props.schema[key],
                         key: uniquekey, display_state: this.state.display_state}));
            break;
          case 'related':
            content.push(React.createElement(RelatedComponent,
                        {val: val, objkey: key, schema: this.props.schema[key],
                         key: uniquekey, display_state: this.state.display_state}));
            break;
          case 'integer':
            content.push(React.createElement(IntegerComponent,
                        {val: val, objkey: key, schema: this.props.schema[key],
                         key: uniquekey, schema: this.props.schema[key], display_state: this.state.display_state}));
            break;
        }
        uniquekey++;
      }.bind(this));
    }

    var submitButton, cancelButton;
    if(this.state.display_state == "edit"){
      submitButton = <button type="button" onClick={this.handleSubmitClick}
                      className="col-md-4 btn btn-default">Submit</button>
      cancelButton = <button type="button" onClick={this.handleCancelClick}
                      className="col-md-4 btn btn-default">Cancel</button>
    }

    return (
      <div className="panel panel-default GenericForm">
        <div className="panel-heading">
          <div className="row">
            <button type="button" onClick={this.handleEditClick}
            className="col-md-6 btn btn-default">Edit {this.state.display_state}</button>
            <button type="button" onClick={this.handleDelClick}
            className="col-md-6 btn btn-default">Delete</button>
          </div>
        </div>
        <div className="panel-body">
          {content.map(function (obj) { return obj;})}
          <div className="col-md-1"></div>
          {submitButton}
          <div className="col-md-2"></div>
          {cancelButton}
        </div>
      </div>
      );
  }
});