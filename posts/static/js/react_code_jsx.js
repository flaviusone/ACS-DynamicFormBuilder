var StringComponent = React.createClass({
  getInitialState: function() {
    return {value: this.props.val};
  },
  componentWillReceiveProps: function(nextProps){
    this.setState({value: nextProps.val});
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
        field = <textarea rows={nr_rows}
                          className="form-control" type="text"
                          value={value} onChange={this.handleChange}/>;
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
  componentDidMount: function(){
    this.componentDidUpdate();
  },
  componentDidUpdate: function(){
    if(this.props.display_state=="edit"){
      var init_data = {sideBySide: true,
                      format: 'DD/MM/YYYY HH:mm',
                      }
      if(this.props.val){
          // Datetimepicker is stupid....hack needed
          var dateNormal = new Date(this.props.val);
          var dateUTC = new Date(dateNormal.getUTCFullYear(), dateNormal.getUTCMonth(), dateNormal.getUTCDate(),  dateNormal.getUTCHours(), dateNormal.getUTCMinutes(), dateNormal.getUTCSeconds());
          init_data.defaultDate =  dateUTC
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
      field = <input type='text' className="form-control" ref="dateinput"/>
    } else {
      field = date.toUTCString();
    }
    return (
      <div className="DateTimeComponent editor-datetime">
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
            dropdownData: {objects: null},
            schema: {fields: null},
            explore: false,
            dropdownTitle: this.props.val};
  },
  getValue: function(){
    var key = this.props.objkey;
    var value = this.state.dropdownTitle;
    var obj = {};
    obj[key] = value;
    return obj;
  },
  componentDidMount: function(){
    // For the Add form
    if(this.props.display_state=="edit"){
      this.loadDataIntoDropdown();
    }
  },
  componentWillReceiveProps: function(nextProps){
    /**
    * Check if we transition from edit to show
    * Set explore to false
    **/
    if(this.props.display_state=="edit" &&  nextProps.display_state=="show"){
      this.setState({explore: false, dropdownTitle: this.props.val});
    }
    if(this.props.display_state=="show" &&  nextProps.display_state=="edit"){
      if(!this.state.dropdownData.objects){
        this.loadDataIntoDropdown();
      }
      this.setState({dropdownTitle: this.props.val});
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
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },
  loadDataIntoDropdown: function(){
    $.ajax({
      url: this.props.mainResource,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        this.setState({dropdownData: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },
  handleEditPress: function(){
    if(this.state.explore == false){
      this.setState({explore: true})
      this.loadCommentsFromServer(this.state.dropdownTitle)
    } else {
      this.setState({explore: false})
    }
  },
  onSelectAlert: function(eventKey, href, target) {
    this.setState({dropdownTitle: eventKey, explore: false})
  },
  render: function() {
    var startCaseKey = _.startCase(this.props.objkey);
    var object = this.state.resource;
    var schema = this.state.schema.fields;
    var content = [];
    var edit_button, dropdown;

    var menuItems = [];
    if(this.state.dropdownData.objects){
      var eventKey = 1;
      _.forEach(this.state.dropdownData.objects, function(obj){
        var MenuItem = ReactBootstrap.MenuItem;
        //TODO aici nu am sa las asa pentru ca nu e generic
        var menuItem = <MenuItem key={eventKey} eventKey={obj.resource_uri} onSelect={this.onSelectAlert}>{obj.resource_uri}</MenuItem>
        menuItems.push(menuItem);
        eventKey++;
      }.bind(this));
    }

    dropdown = this.props.val;

    if(this.props.display_state == "edit"){
      // Setup Dropdown
      var DropdownButton = ReactBootstrap.DropdownButton;
      dropdown = <DropdownButton title={this.state.dropdownTitle}> {menuItems} </DropdownButton>
      // Edit button for exploring
      edit_button = <button type="button" onClick={this.handleEditPress} className="btn btn-default">Edit</button>
    }

    if(object && schema && this.state.explore){
      content = <GenericForm display_state="show" object={object}
                schema={schema} unmount_element={this.props.unmount_element}
                handleSubmit={this.props.handleSubmit}></GenericForm>
    }

    return (
      <div className="RelatedComponent">

          <strong>{startCaseKey}</strong> :
          {dropdown} {edit_button}
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
/**
* List Container for GenericForm objects
**/
var FormList = React.createClass({
  render: function() {
    var uniquekey=0; // For Reconciliation
    addPanel =<GenericForm
              optional="add"
              display_state="edit"
              unmount_element={this.props.unmount_element}
              object={this.props.getEmptyObject()}
              schema={this.props.schema}
              handleSubmit={this.props.handleSubmit}>
          </GenericForm>
    var formNodes = [];
    _.forEach(this.props.resource.objects, function(object){
      uniquekey++;
      formNodes.push(<div key={uniquekey} className="childul">
                        <GenericForm display_state="show"
                                     handleSubmit={this.props.handleEdit}
                                     unmount_element={this.props.unmount_element}
                                     object={object}
                                     schema={this.props.schema}>
                        </GenericForm>
                      </div>);
    }.bind(this));
    formNodes.reverse();
    return (
      <div className="parent">
        <div key={uniquekey++} className="childul">
          {addPanel}
        </div>
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
          var mainResource = this.props.schema[key].resource;
          content.push(React.createElement(RelatedComponent,
                      {ref: refcounter, val: val, objkey: key, schema: this.props.schema[key],
                       key: uniquekey, display_state: this.state.display_state,update: this.handlechildUpdate,
                       handleSubmit: this.props.handleSubmit, unmount_element: this.props.unmount_element,
                       mainResource: mainResource}));
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