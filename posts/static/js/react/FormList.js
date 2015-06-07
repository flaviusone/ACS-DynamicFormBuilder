/**
* List Container for GenericForm objects
**/
var FormList = React.createClass({
  render: function() {
    var uniquekey = -1; // For Reconciliation
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey++;
      return (
          <GenericForm display_state="show" key={uniquekey} handleSubmit={this.props.handleSubmit} unmount_element={this.props.unmount_element} object={object} schema={this.props.schema}>
          </GenericForm>
        );
    }.bind(this));
    return (
      <div className="FormList">
      {formNodes}
      </div>
      );
  }
});
