/**
* List Container for GenericForm objects
**/
var FormList = React.createClass({
  render: function() {
    var uniquekey; // For Reconciliation
    var formNodes = this.props.resource.objects.map(function (object) {
      uniquekey = _.uniqueId();
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
