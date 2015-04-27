/*==================================
=            Main React file       =
==================================*/

/**
* Main container
**/
var FormBox = React.createClass({
  getInitialState: function() {
    return {data: {objects: []}};
  },
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(object) {
    // console.log(object);
    $.ajax({
      url: this.props.url,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(object),
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  render: function() {
    return (
      <div className="formBox">
        <h1> Dynamic Form Builder Version 0.1 </h1>
        <AddForm onFormSubmit={this.handleCommentSubmit}/>
        <br></br>
        <FormList data={this.state.data}/>
      </div>
      );
  }
});

/**
* List Container for GenericForm objects
**/
var FormList = React.createClass({
  render: function() {
    // var formNodes;
    var formNodes = this.props.data.objects.map(function (object) {
      return (
        <GenericForm>

        </GenericForm>
        );
    });
    return (
      <div className="row FormList">
      {formNodes}
      </div>
      );
  }
});


/**
* Generic form object
**/
var GenericForm = React.createClass({

  unmount: function() {
    var node = this.getDOMNode();
    React.unmountComponentAtNode(node);
    $(node).remove();
  },
  deleteRequest: function() {
   $.ajax({
     url: this.props.url,
     type: 'DELETE',
     dataType: 'json',
     data:{},
     success: function (data, textStatus, xhr) {

     },
     error: function (xhr, textStatus, errorThrown) {
       console.log('Error in Delete operation');
     }
   });
 },
 handleClick: function() {
  this.deleteRequest();
  this.unmount();
},
render: function() {
  var date = new Date(this.props.created_at);
  return (
    <div className="col-md-4">
      <div className="panel panel-default GenericForm">
        <div className="panel-heading">
          <div className="row">
            <button type="button" className="col-md-6 btn btn-default">Edit</button>
            <button type="button" onClick={this.handleClick} className="col-md-6 btn btn-default">Delete</button>
          </div>
        </div>
        <div className="panel-body">
        Placeholder
        </div>
      </div>
    </div>
    );
}
});



/*-----  Unimplemented  ------*/
/**
* Add new GenericForm - TODO
**/
var AddForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var title = React.findDOMNode(this.refs.title).value.trim();
    var content = React.findDOMNode(this.refs.content).value.trim();
    if (!content || !title) {
      return;
    }
    this.props.onFormSubmit({author: "/posts/api/v1/author/1/",content: content, title: title});
    React.findDOMNode(this.refs.title).value = '';
    React.findDOMNode(this.refs.content).value = '';
    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Title" ref="title" />
        <input type="text" placeholder="Content" ref="content" />
        <input type="submit" value="Add" />
      </form>
      );
  }
});


React.render(
  <FormBox url='http://localhost:8000/posts/api/v1/post/'/>,
  document.getElementById('content')
  );

