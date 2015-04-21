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
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      contentType: 'application/json',
      type: 'POST',
      data: object,
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
      <FormList data={this.state.data}/>
      <AddForm onFormSubmit={this.handleCommentSubmit}/>
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
        <GenericForm title={object.title} created_at={object.created_at} author={object.author}>
        {object.content}
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
  render: function() {
    return (
      <div className="col-md-4">
        <div className="panel panel-default GenericForm">
            <div className="panel-heading">
                <h3 className="panel-title">{this.props.title}</h3>
            </div>
            <div className="panel-body">
                {this.props.children}
            </div>
            <h5>Author: {this.props.author}</h5>
            <h5>{this.props.created_at}</h5>
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
    this.props.onFormSubmit({title: title, content: content});
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
  <FormBox url='http://localhost:8000/posts/api/post/'/>,
  document.getElementById('content')
  );

