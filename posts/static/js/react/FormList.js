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
