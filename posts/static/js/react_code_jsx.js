var StringComponent = React.createClass({
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
        field = <textarea rows={nr_rows} id={this.props.obj_id}
        className="form-control" type="text" value={value} onChange={this.handleChange}/>;
      }
    } else {
      field = {value}
    }

    return (
      <div className="StringComponent">
        <strong>{startCaseKey}</strong> :
        {field}
      </div>
    );
  }
});

var DateTimeComponent = React.createClass({
  componentDidMount: function() {
    if(this.props.display_state=="edit"){
      var id = '#'+this.props.obj_id;
      // Initializez campul cu data ce vreau sa o modific.
      var init_data = {}
      if(this.props.val){
          init_data.defaultDate =  new Date(this.props.val)
        }
      $(function () { $(id).datetimepicker(init_data); });
    }
  },
  getValue: function(){
    var id = '#'+this.props.obj_id;
    var key = this.props.objkey;
    var value = $(id).data("DateTimePicker").date()
    // var value = this.state.value;
    var obj = {};
    obj[key] = value;
    return obj;
  },
  render: function() {
    var date = new Date(this.props.val);
    var final_key = _.startCase(this.props.objkey);
    var field;

    if(this.props.display_state == "edit"){
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
            explore: false};
  },
  getValue: function(){
    var key = this.props.objkey;
    var value = this.props.val;
    var obj = {};
    obj[key] = value;
    return obj;
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
      edit_button = <button type="button" onClick={this.handleEditPress} className="btn btn-default">Edit</button>
    }

    if(object && schema && this.state.explore){
      content = <GenericForm display_state="show" object={object}
                schema={schema} unmount_element={this.props.unmount_element}
                handleSubmit={this.props.handleSubmit}></GenericForm>
    }

    return (
      <div className="RelatedComponent">
        <strong>{startCaseKey}</strong> : {this.props.val} {edit_button}
        {content}
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
  render: function() {
    var data_available = (this.state.resource.objects && this.state.schema.fields);
    var formlist, addPanel;

    if (data_available) {
      addPanel =<GenericForm
                    optional="add"
                    display_state="edit"
                    handleSubmit={this.props.handleSubmit}
                    unmount_element={this.props.unmount_element}
                    object={this.getEmptyObject()}
                    schema={this.state.schema.fields}
                    handleSubmit={this.handleCommentSubmit}>
                </GenericForm>
      formlist =<FormList
                    handleSubmit={this.handleCommentEdit}
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

        <div className="row">
        <div className="col-md-3">
          {addPanel}
        </div>
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
    var uniquekey=0; // For Reconciliation
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey++;
      // uniquekey = _.uniqueId();
      return (
        <div className="col-md-3">
          <GenericForm display_state="show" key={uniquekey} handleSubmit={this.props.handleSubmit} unmount_element={this.props.unmount_element} object={object} schema={this.props.schema}>
          </GenericForm>
        </div>
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
      if(!this.props.schema[key]) return;
      // Extrag type si apelez functia corespunzatoare
      var fieldType = this.props.schema[key].type;
      refcounter++;
      uniquekey++;
      uniquekey = _.uniqueId();
      var uniqueId = _.uniqueId();
      switch(fieldType){
        case 'string':
          content.push(React.createElement(StringComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, display_state: this.state.display_state,update: this.handlechildUpdate, obj_id: uniqueId}));
          break;
        case 'datetime':
          content.push(React.createElement(DateTimeComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, display_state: this.state.display_state,update: this.handlechildUpdate, obj_id: uniqueId}));
          break;
        case 'related':
          content.push(React.createElement(RelatedComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, display_state: this.state.display_state,update: this.handlechildUpdate, handleSubmit: this.props.handleSubmit, unmount_element: this.props.unmount_element,  obj_id: uniqueId}));
          break;
        case 'integer':
          content.push(React.createElement(IntegerComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, schema: this.props.schema[key], display_state: this.state.display_state,update: this.handlechildUpdate, obj_id: uniqueId}));
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
      submitButton = <button type="button" onClick={this.handleSubmitClick}
                      className="col-md-4 btn btn-default">Submit</button>
      cancelButton = <button type="button" onClick={this.handleCancelClick}
                      className="col-md-4 btn btn-default">Cancel</button>
    }

    // Generate edit and delete buttons
    // Omit theese in case of add form
    var panelTitle;
    if(this.props.optional == "add"){
      panelTitle = "Add Form"
      cancelButton = ""
    } else {
      panelTitle = (<div className="row">
                    <button type="button" onClick={this.handleEditClick}
                    className="col-md-6 btn btn-default">Edit {this.state.display_state}</button>
                    <button type="button" onClick={this.handleDelClick}
                    className="col-md-6 btn btn-default">Delete</button>
                    </div>)
    }

    return (
      <div className="panel panel-default GenericForm">
        <div className="panel-heading text-center">
          {panelTitle}
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