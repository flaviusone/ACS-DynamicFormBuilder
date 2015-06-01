
var EditPanel = React.createClass({
  // mixins: [React.addons.LinkedStateMixin],
  // getInitialState: function() {
  //   return {title: '',
  //           content: ''};
  // },
  handleSubmit: function(e){
    e.preventDefault();
    // var title = this.state.title;
    // var content = this.state.content;
    // if (!content || !title) {
    //   return;
    // }
    // this.props.handleCommentEdit({author: "/posts/api/v1/author/1/",content: content, title: title});
    // this.setState({title: '',content: ''})
    // return;
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
        switch(fieldType){
          case 'string':
            content.push(React.createElement(EditStringComponent, {val: val, objkey: key, key: uniquekey}));
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
                <input type="submit" className="btn btn-default col-md-4" value="Edit" />
                <div className="col-md-2"></div>
                <button type="button" onClick={this.handleCancelClick} className="col-md-4 btn btn-default">Cancel</button>
              </form>
          </div>
        </div>
      </div>
    );
  }
});
