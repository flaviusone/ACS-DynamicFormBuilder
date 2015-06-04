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


var StringComponent = React.createClass({displayName: "StringComponent",
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    return (
      React.createElement("div", {className: "StringComponent"}, 
        React.createElement("strong", null, final_key), " : ", this.props.val
      )
    );
  }
});

var EditStringComponent = React.createClass({displayName: "EditStringComponent",
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
      field = React.createElement("input", {id: this.props.obj_id, className: "form-control", type: "text", value: value, onChange: this.handleChange});
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
  render: function() {
    var final_key = _.startCase(this.props.objkey);
    return (
      React.createElement("div", {className: "RelatedComponent"}, 
        React.createElement("strong", null, final_key), " : ", this.props.val
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
              content.push(React.createElement(EditStringComponent, {val: val, schema: this.props.schema[key], objkey: key, key: uniquekey, obj_id: obj_id}));
              break;
            case 'datetime':
              content.push(React.createElement(DateTimeComponent, {val: val, schema: this.props.schema[key], objkey: key, key: uniquekey, obj_id: obj_id, method: this.props.method}));
              break;
            case 'related':
              content.push(React.createElement(RelatedComponent, {val: val, schema: this.props.schema[key], objkey: key, key: uniquekey}));
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
      React.createElement("div", {className: "EditPanel"}, 
        React.createElement("div", {className: "panel panel-default EditPanel"}, 
          React.createElement("div", {className: "panel-heading text-center"}, 
          this.props.method, " Form"
          ), 
          React.createElement("div", {className: "panel-body"}, 
              React.createElement("form", {className: "commentForm", onSubmit: this.handleSubmit}, 
                content.map(function (obj) { return obj;}), 
                React.createElement("br", null), 
                React.createElement("div", {className: "col-md-1"}), 
                React.createElement("button", {type: "button", onClick: this.handleSubmit, className: "col-md-4 btn btn-default"}, "Submit"), 
                React.createElement("div", {className: "col-md-2"}), 
                cancelbutton
              )
          )
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
    var formlist, editpanel;

    if (data_available) {
      formlist = React.createElement(FormList, {handleEdit: this.handleEditPress, unmount_element: this.unmount_element, resource: this.state.resource, schema: this.state.schema.fields});
    } else {
      formlist = null;
    };

    if(edit_data){
      editpanel = React.createElement(EditPanel, {method: "Edit", handleSubmit: this.handleCommentEdit, object: this.state.edit_data, schema: this.state.schema.fields, unmount_edit: this.unmount_edit})
    } else {
      editpanel = null;
    }
    return (
      React.createElement("div", {className: "formBox"}, 
        React.createElement("div", {className: "col-md-4"}), 
        React.createElement("h1", {className: "col-md-8"}, " Dynamic Form Builder Version 0.1 "), 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-md-2"}), 
          React.createElement("div", {className: "col-md-4"}, 
            React.createElement(EditPanel, {method: "Add", handleSubmit: this.handleCommentSubmit, object: this.getEmptyObject(), schema: this.state.schema.fields, unmount_edit: this.unmount_edit}), 
            React.createElement("br", null)
          ), 
          React.createElement("div", {className: "col-md-4"}, 
            editpanel
          )
        ), 
        React.createElement("div", {className: "col-md-12"}, 
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
    // var formNodes;
    var uniquekey = -1; // For Reconciliation
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey++;
      return (
        React.createElement(GenericForm, {key: uniquekey, object: object, schema: this.props.schema, unmount_element: this.props.unmount_element, handleEdit: this.props.handleEdit}
        )
        );
    }.bind(this));
    return (
      React.createElement("div", {className: "row FormList"}, 
      formNodes
      )
      );
  }
});

/**
* Generic form object
**/
var GenericForm = React.createClass({displayName: "GenericForm",
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
            content.push(React.createElement(DateTimeComponent, {val: val, objkey: key, key: uniquekey, method: null}));
            break;
          case 'related':
            content.push(React.createElement(RelatedComponent, {val: val, objkey: key, key: uniquekey}));
            break;
          case 'integer':
            content.push(React.createElement(IntegerComponent, {val: val, schema: this.props.schema[key], objkey: key, key: uniquekey}));
            break;
        }
        uniquekey++;
      }.bind(this));
    }

    return (
      React.createElement("div", {className: "col-md-3"}, 
        React.createElement("div", {className: "panel panel-default GenericForm"}, 
          React.createElement("div", {className: "panel-heading"}, 
            React.createElement("div", {className: "row"}, 
              React.createElement("button", {type: "button", onClick: this.handleEditClick, className: "col-md-6 btn btn-default"}, "Edit"), 
              React.createElement("button", {type: "button", onClick: this.handleDelClick, className: "col-md-6 btn btn-default"}, "Delete")
            )
          ), 
          React.createElement("div", {className: "panel-body"}, 
            content.map(function (obj) { return obj;})
          )
        )
      )
      );
  }
});