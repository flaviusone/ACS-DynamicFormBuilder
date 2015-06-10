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
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey++;
      return (
        <div key={uniquekey} className="childul">
          <GenericForm display_state="show"
                       handleSubmit={this.props.handleEdit}
                       unmount_element={this.props.unmount_element}
                       object={object}
                       schema={this.props.schema}>
          </GenericForm>
        </div>
        );
    }.bind(this));
    return (
      <div className="parent">

        {formNodes}
        <div key={uniquekey++} className="childul">
          {addPanel}
        </div>

      </div>
      );
  }
});
