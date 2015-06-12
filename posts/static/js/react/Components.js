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
        var menuItem = <MenuItem key={eventKey} eventKey={obj.resource_uri} onSelect={this.onSelectAlert}>{obj.username}</MenuItem>
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
        <strong>{startCaseKey}</strong> : {dropdown} {edit_button}
        {content}
      </div>
    );
  }
});

