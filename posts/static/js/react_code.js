/**
* Add new GenericForm
**/
var AddForm = React.createClass({displayName: "AddForm",
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
      React.createElement("form", {className: "commentForm", onSubmit: this.handleSubmit}, 
        React.createElement("input", {type: "text", pluginsaceholder: "Title", ref: "title", valueLink: this.linkState('title')}), 
        React.createElement("input", {type: "text", placeholder: "Content", ref: "content", valueLink: this.linkState('content')}), 
        React.createElement("input", {type: "submit", value: "Add"})
      )
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

var StringComponent = React.createClass({displayName: "StringComponent",
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
        field = React.createElement("textarea", {rows: nr_rows, id: this.props.obj_id, className: "form-control", type: "text", value: value, onChange: this.handleChange});
      }
    } else {
      field = {value}
    }

    return (
      React.createElement("div", {className: "StringComponent"}, 
        React.createElement("strong", null, final_key), " :", 
        field
      )
    );
  }
});

var DateTimeComponent = React.createClass({displayName: "DateTimeComponent",
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
      field = React.createElement("input", {type: "text", className: "form-control", id: this.props.obj_id})
    } else {
      field = date.toUTCString();
    }
    return (
      React.createElement("div", {className: "DateTimeComponent"}, 
        React.createElement("strong", null, final_key), ": ", field
      )
    );
  }
});

var IntegerComponent = React.createClass({displayName: "IntegerComponent",
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    return (
      React.createElement("div", {className: "IntegerComponent"}, 
        React.createElement("strong", null, final_key), " : ", this.props.val
      )
    );
  }
});

var RelatedComponent = React.createClass({displayName: "RelatedComponent",
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
      edit_button = React.createElement("button", {type: "button", onClick: this.handleEditPress, className: "btn btn-default"}, "Edit")
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
      content = React.createElement(GenericForm, {object: this.state.resource, schema: this.state.schema.fields, unmount_element: null, handleEdit: null})
    }
    // {content.map(function (obj) { return obj;})}
    return (
      React.createElement("div", {className: "RelatedComponent"}, 
        React.createElement("strong", null, final_key), " : ", this.props.val, " ", edit_button, 
        content
      )
    );
  }
});

var EditPanel = React.createClass({displayName: "EditPanel",
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
      cancelbutton = React.createElement("button", {type: "button", onClick: this.handleCancelClick, className: "col-md-4 btn btn-default"}, "Cancel")
    } else {
      cancelbutton = "";
    }

    return (
        React.createElement("div", {className: "panel panel-default EditPanel"}, 
          React.createElement("div", {className: "panel-heading text-center"}, 
          this.props.method, " Form"
          ), 
          React.createElement("div", {className: "panel-body"}, 
            content.map(function (obj) { return obj;}), 
            React.createElement("br", null), 
            React.createElement("div", {className: "col-md-1"}), 
            React.createElement("button", {type: "button", onClick: this.handleSubmit, className: "col-md-4 btn btn-default"}, "Submit"), 
            React.createElement("div", {className: "col-md-2"}), 
            cancelbutton
          )
        )
    );
  }
});

/**
* Main container
**/
var FormBox = React.createClass({displayName: "FormBox",
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
      formlist = React.createElement(FormList, {handleSubmit: this.handleCommentSubmit, unmount_element: this.unmount_element, resource: this.state.resource, schema: this.state.schema.fields});
      addpanel = React.createElement(EditPanel, {method: "Add", handleSubmit: this.handleCommentSubmit, object: this.getEmptyObject(), schema: this.state.schema.fields})
    }

    return (
      React.createElement("div", {className: "formBox"}, 
        React.createElement("nav", {className: "navbar navbar-default navbar-fixed-top"}, 
          React.createElement("div", {className: "container"}, 
            React.createElement("h3", null, " Dynamic Form Builder Version 0.3 ")
          )
        ), 

        React.createElement("div", {className: "row"}, 
          addpanel, 
          formlist
        )
      )
      );
  }
});

React.render(
  React.createElement(FormBox, {url: "/posts/api/v1/post/"}),
  document.getElementById('content')
  );
var logged_user = "/posts/api/v1/author/1/";
/**
* List Container for GenericForm objects
**/
var FormList = React.createClass({displayName: "FormList",
  render: function() {
    var uniquekey = -1; // For Reconciliation
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey++;
      return (
          React.createElement(GenericForm, {display_state: "show", key: uniquekey, handleSubmit: this.props.handleSubmit, unmount_element: this.props.unmount_element, object: object, schema: this.props.schema}
          )
        );
    }.bind(this));
    return (
      React.createElement("div", {className: "FormList"}, 
      formNodes
      )
      );
  }
});

/**
* Generic form object
**/
var GenericForm = React.createClass({displayName: "GenericForm",
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
      submitButton = React.createElement("button", {type: "button", onClick: this.handleSubmitClick, 
                      className: "col-md-4 btn btn-default"}, "Submit")
      cancelButton = React.createElement("button", {type: "button", onClick: this.handleCancelClick, 
                      className: "col-md-4 btn btn-default"}, "Cancel")
    }

    return (
      React.createElement("div", {className: "panel panel-default GenericForm"}, 
        React.createElement("div", {className: "panel-heading"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("button", {type: "button", onClick: this.handleEditClick, 
            className: "col-md-6 btn btn-default"}, "Edit ", this.state.display_state), 
            React.createElement("button", {type: "button", onClick: this.handleDelClick, 
            className: "col-md-6 btn btn-default"}, "Delete")
          )
        ), 
        React.createElement("div", {className: "panel-body"}, 
          content.map(function (obj) { return obj;}), 
          React.createElement("div", {className: "col-md-1"}), 
          submitButton, 
          React.createElement("div", {className: "col-md-2"}), 
          cancelButton
        )
      )
      );
  }
});