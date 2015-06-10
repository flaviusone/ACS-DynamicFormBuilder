var StringComponent = React.createClass({displayName: "StringComponent",
  getInitialState: function() {
    return {value: this.props.val};
  },
  getValue: function(){
    var key = this.props.objkey;
    var value = this.state.value;
    var obj = {};
    obj[key] = value;
    return obj;
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  render: function() {
    var startCaseKey = _.startCase(this.props.objkey);
    var value = this.state.value;
    var readonly = this.props.schema.readonly;
    var field;

    if(this.props.display_state == "edit"){
      if(readonly){
        field = {value}
      } else {
        if(!value) value=""; //Carpeala
        var nr_rows = Math.ceil(value.length/60);
        field = React.createElement("textarea", {rows: nr_rows, 
                          className: "form-control", type: "text", 
                          value: value, onChange: this.handleChange});
      }
    } else {
      field = {value}
    }

    return (
      React.createElement("div", {className: "StringComponent"}, 
        React.createElement("strong", null, startCaseKey), " :", 
        field
      )
    );
  }
});

var DateTimeComponent = React.createClass({displayName: "DateTimeComponent",
  componentDidMount: function(){
    this.componentDidUpdate();
  },
  componentDidUpdate: function(){
    if(this.props.display_state=="edit"){
      var init_data = {}
      if(this.props.val){
          init_data.defaultDate =  new Date(this.props.val)
      }
      var node = React.findDOMNode(this.refs.dateinput);
      $(node).datetimepicker(init_data)
    }
  },
  getValue: function(){
    var key = this.props.objkey;
    var node = React.findDOMNode(this.refs.dateinput);
    var value = $(node).data("DateTimePicker").date()
    var obj = {};
    obj[key] = value;
    return obj;
  },
  render: function() {
    var date = new Date(this.props.val);
    var final_key = _.startCase(this.props.objkey);
    var field;

    if(this.props.display_state == "edit"){
      field = React.createElement("input", {type: "text", className: "form-control", ref: "dateinput"})
    } else {
      field = date.toUTCString();
    }
    return (
      React.createElement("div", {className: "DateTimeComponent editor-datetime"}, 
        React.createElement("strong", null, final_key), ": ", field
      )
    );
  }
});

var IntegerComponent = React.createClass({displayName: "IntegerComponent",
  getValue: function(){
    // Implemented but not editable yet
    var key = this.props.objkey;
    var value = this.props.val;
    var obj = {};
    obj[key] = value;
    return obj;
  },
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
            explore: false};
  },
  getValue: function(){
    var key = this.props.objkey;
    var value = this.props.val;
    var obj = {};
    obj[key] = value;
    return obj;
  },
  componentWillReceiveProps: function(nextProps){
    /**
    * Check if we transition from edit to show
    * Set explore to false
    **/
    if(this.props.display_state=="edit" &&  nextProps.display_state=="show"){
      this.setState({explore: false});
    }
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
    if(this.state.explore == false){
      this.setState({explore: true})
    } else {
      this.setState({explore: false})
    }
  },
  render: function() {
    var startCaseKey = _.startCase(this.props.objkey);
    var object = this.state.resource;
    var schema = this.state.schema.fields;
    var content = [];
    var edit_button;

    if(this.props.display_state == "edit"){
      edit_button = React.createElement("button", {type: "button", onClick: this.handleEditPress, className: "btn btn-default"}, "Edit")
    }

    if(object && schema && this.state.explore){
      content = React.createElement(GenericForm, {display_state: "show", object: object, 
                schema: schema, unmount_element: this.props.unmount_element, 
                handleSubmit: this.props.handleSubmit})
    }

    return (
      React.createElement("div", {className: "RelatedComponent"}, 
        React.createElement("strong", null, startCaseKey), " : ", this.props.val, " ", edit_button, 
        content
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
      url: object.resource_uri,
      type: 'PATCH',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(object),
      success: function(data) {
        var new_data = _.cloneDeep(this.state.resource);
        // Update the element with response from server
        var newObj = _.findWhere(new_data, {'resource_uri' : data.resource_uri});
        newObj = data;
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
      formlist =React.createElement(FormList, {
                    handleSubmit: this.handleCommentSubmit, 
                    handleEdit: this.handleCommentEdit, 
                    getEmptyObject: this.getEmptyObject, 
                    unmount_element: this.unmount_element, 
                    resource: this.state.resource, 
                    schema: this.state.schema.fields}
                );
    }

    return (
      React.createElement("div", {className: "formBox"}, 
        React.createElement("nav", {className: "navbar navbar-default navbar-fixed-top"}, 
          React.createElement("div", {className: "container"}, 
            React.createElement("h3", null, " Dynamic Form Builder Version 0.3 ")
          )
        ), 
        formlist
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
    var uniquekey=0; // For Reconciliation
    addPanel =React.createElement(GenericForm, {
              optional: "add", 
              display_state: "edit", 
              unmount_element: this.props.unmount_element, 
              object: this.props.getEmptyObject(), 
              schema: this.props.schema, 
              handleSubmit: this.props.handleSubmit}
          )
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey++;
      return (
        React.createElement("div", {key: uniquekey, className: "childul"}, 
          React.createElement(GenericForm, {display_state: "show", 
                       handleSubmit: this.props.handleEdit, 
                       unmount_element: this.props.unmount_element, 
                       object: object, 
                       schema: this.props.schema}
          )
        )
        );
    }.bind(this));
    return (
      React.createElement("div", {className: "parent"}, 

        formNodes, 
        React.createElement("div", {key: uniquekey++, className: "childul"}, 
          addPanel
        )

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
    /**
    * Sends a delete ajax request and unmounts the element
    **/
    this.deleteRequest();
    this.props.unmount_element(this.props.object);
  },
  handleCancelClick: function(){
    /**
    * Cancels the edit form transforming it back into a show form
    **/
    this.setState({display_state: "show"})
  },
  handleSubmitClick: function(){
    /**
    * Calls getValue function from each child (using this.refs)
    * Merges the answers into a request payload object
    * Calls handleSubmit from parent
    **/
    var requestObj = {};
    _.forEach(this.refs, function (component){
      var componentData = component.getValue();
      if(componentData){
        _.merge(requestObj, componentData)
      }
    }.bind(this))

    this.props.handleSubmit(requestObj);
    this.setState({display_state: "show"})

    if(this.props.optional == "add"){
      this.setState({display_state: "edit"})
    }
  },
  handleEditClick: function() {
    /**
    * Handles edit button press
    * Changes states from show to edit and viceversa
    **/
    if(this.state.display_state=="show"){
      this.setState({display_state: "edit"});
    } else {
      this.setState({display_state: "show"});
    }
  },
  generateGenericComponents: function(){
    /**
    * Generates generic react components based on a object and schema
    **/
    var content = [];
    var uniquekey = -1;
    var elementIds = [];
    var refcounter=0;
    // Pentru fiecare prop din object
    _.forEach(this.props.object, function (val, key){
      if(!this.props.schema[key]) return; //TODO maybe ?
      // Extrag type si apelez functia corespunzatoare
      var fieldType = this.props.schema[key].type;
      refcounter++;
      uniquekey++;
      switch(fieldType){
        case 'string':
          content.push(React.createElement(StringComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, display_state: this.state.display_state,update: this.handlechildUpdate}));
          break;
        case 'datetime':
          content.push(React.createElement(DateTimeComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, display_state: this.state.display_state,update: this.handlechildUpdate}));
          break;
        case 'related':
          content.push(React.createElement(RelatedComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, display_state: this.state.display_state,update: this.handlechildUpdate, handleSubmit: this.props.handleSubmit, unmount_element: this.props.unmount_element}));
          break;
        case 'integer':
          content.push(React.createElement(IntegerComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, schema: this.props.schema[key], display_state: this.state.display_state,update: this.handlechildUpdate}));
          break;
      }
    }.bind(this));
    return content;
  },
  render: function() {

    // Generate generic compoennts
    var content = this.generateGenericComponents();

    // Generate submit and cancel buttons
    var submitButton, cancelButton;
    if(this.state.display_state == "edit"){
      submitButton = React.createElement("button", {type: "button", onClick: this.handleSubmitClick, 
                      className: "col-md-4 btn btn-default"}, "Submit")
      cancelButton = React.createElement("button", {type: "button", onClick: this.handleCancelClick, 
                      className: "col-md-4 btn btn-default"}, "Cancel")
    }

    // Generate edit and delete buttons
    // Omit theese in case of add form
    var panelTitle;
    if(this.props.optional == "add"){
      panelTitle = "Add Form"
      cancelButton = ""
    } else {
      panelTitle = (React.createElement("div", {className: "row"}, 
                    React.createElement("button", {type: "button", onClick: this.handleEditClick, 
                    className: "col-md-6 btn btn-default"}, "Edit ", this.state.display_state), 
                    React.createElement("button", {type: "button", onClick: this.handleDelClick, 
                    className: "col-md-6 btn btn-default"}, "Delete")
                    ))
    }

    return (
      React.createElement("div", {className: "panel panel-default GenericForm"}, 
        React.createElement("div", {className: "panel-heading text-center"}, 
          panelTitle
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