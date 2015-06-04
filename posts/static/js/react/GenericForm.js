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