
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
      // console.log(requestObj);
    }
  // Ajax request
  this.props.handleSubmit(requestObj, this.props.method);

  if(this.props.method=="edit"){
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
    // debugger;
    if(this.props.schema){
      // Pentru fiecare prop din object
      _.forEach(this.props.object, function (val, key){
        // Extrag type si apelez functia corespunzatoare
        var fieldType = this.props.schema[key].type;
        // Un id unic ca sa il pot gasi cu getElementById
        var obj_id = uniquekey+this.props.method;
        switch(fieldType){
          case 'string':
            content.push(React.createElement(EditStringComponent, {val: val, objkey: key, key: uniquekey, obj_id: obj_id}));
            break;
          case 'datetime':
            content.push(React.createElement(DateTimeComponent, {val: val, objkey: key, key: uniquekey}));
            break;
          case 'related':
            content.push(React.createElement(RelatedComponent, {val: val, objkey: key, key: uniquekey}));
            break;
        }
        uniquekey++;
      }.bind(this));
    }

    return (
      <div className="EditPanel">
        <div className="panel panel-default EditPanel">
          <div className="panel-heading text-center">
          Edit Form
          </div>
          <div className="panel-body">
              <form className="commentForm" onSubmit={this.handleSubmit}>
                {content.map(function (obj) { return obj;})}
                <div className="col-md-1"></div>
                <button type="button" onClick={this.handleSubmit} className="col-md-4 btn btn-default">Edit</button>
                <div className="col-md-2"></div>
                <button type="button" onClick={this.handleCancelClick} className="col-md-4 btn btn-default">Cancel</button>
              </form>
          </div>
        </div>
      </div>
    );
  }
});
