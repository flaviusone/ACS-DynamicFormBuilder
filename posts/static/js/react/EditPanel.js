
var EditPanel = React.createClass({
  handleSubmit: function(e){
    var uniquekey = 0;
    var requestObj = {};
    if(this.props.schema){
      // Pentru fiecare prop din object
      _.forEach(this.props.object, function (val, key){
         var obj_id = uniquekey+this.props.method;
         // Citesc din campurile modificabile
         var inputVal = document.getElementById(obj_id);
         if(inputVal){
           // Adauga la obiect key:inputVal.value
           requestObj[key] = inputVal.value;
         }else{
           // Adauga la obiect key:value
           requestObj[key] = val;
         }
        uniquekey++;
      }.bind(this));
    }
  // Ajax request
  this.props.handleSubmit(requestObj, this.props.method);

  if(this.props.method=="Edit"){
    this.props.unmount_edit();
  }

  return;
  },
  handleCancelClick: function(){
    this.props.unmount_edit();
  },
  render: function() {
    var content = [];
    var uniquekey = 0; // For Reconciliation
    var object = this.props.object;
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
                         key: _.uniqueId(), display_state: this.props.display_state, obj_id: _.uniqueId()}));
            break;
          case 'datetime':
            content.push(React.createElement(DateTimeComponent,
                        {val: val, objkey: key, schema: this.props.schema[key],
                         key: _.uniqueId(), display_state: this.props.display_state, obj_id: _.uniqueId()}));
            break;
          case 'related':
            content.push(React.createElement(RelatedComponent,
                        {val: val, objkey: key, schema: this.props.schema[key],
                         key: _.uniqueId(), display_state: this.props.display_state, obj_id: _.uniqueId()}));
            break;
          case 'integer':
            content.push(React.createElement(IntegerComponent,
                        {val: val, objkey: key, schema: this.props.schema[key],
                         key: _.uniqueId(), schema: this.props.schema[key], display_state: this.props.display_state, obj_id: _.uniqueId()}));
            break;
        }
      }.bind(this));
    }

    // Display only on the edit form
    var cancelbutton;
    if(this.props.method == "Edit"){
      cancelbutton = <button type="button" onClick={this.handleCancelClick} className="col-md-4 btn btn-default">Cancel</button>
    } else {
      cancelbutton = "";
    }

    return (
        <div className="panel panel-default EditPanel">
          <div className="panel-heading text-center">
          {this.props.method} Form
          </div>
          <div className="panel-body">
            {content.map(function (obj) { return obj;})}
            <br></br>
            <div className="col-md-1"></div>
            <button type="button" onClick={this.handleSubmit} className="col-md-4 btn btn-default">Submit</button>
            <div className="col-md-2"></div>
            {cancelbutton}
          </div>
        </div>
    );
  }
});
