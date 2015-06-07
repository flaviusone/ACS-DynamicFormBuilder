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