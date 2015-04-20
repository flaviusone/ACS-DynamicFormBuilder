/*==================================
=            Main React file       =
==================================*/

/**
* Main container
**/
var FormBox = React.createClass({
  getInitialState: function() {
    return {data: []};
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
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  render: function() {
    return (
      <div className="formBox">
      <h1> Dynamic Form Builder Version 0.1 </h1>
      <FormList data={this.state.date}/>
      <AddForm />
      </div>
      );
  }
});

/**
* Container for GenericForm objects
**/
var FormList = React.createClass({
  render: function() {
    return (
      <div className="FormList">
      I am the form list
      <GenericForm />
      <GenericForm />
      <GenericForm />
      <GenericForm />
      <GenericForm />
      </div>
      );
  }
});

/**
* Add new GenericForm - TODO
**/
var AddForm = React.createClass({
  render: function() {
    return (
      <div className="AddForm">
      I am AddForm!
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
      <div className="GenericForm">
      I am GenericForm
      </div>
      );
  }
});


React.render(
  <FormBox url='http://localhost:8000/posts/api/post/'/>,
  document.getElementById('content')
  );