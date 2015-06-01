/**
* Add new GenericForm
**/
var AddForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {title: '',
            content: ''};
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.state.title;
    var content = this.state.content;
    if (!content || !title) {
      return;
    }
    this.props.onFormSubmit({author: "/posts/api/v1/author/1/",content: content, title: title});
    this.setState({title: '',content: ''})
    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" pluginsaceholder="Title" ref="title" valueLink={this.linkState('title')}/>
        <input type="text" placeholder="Content" ref="content" valueLink={this.linkState('content')}/>
        <input type="submit" value="Add" />
      </form>
      );
  }
});
