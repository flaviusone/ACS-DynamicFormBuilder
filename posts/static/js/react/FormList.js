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
