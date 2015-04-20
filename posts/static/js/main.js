(function() {
  $.ajax({
    url: 'http://localhost:8000/posts/api/post/',
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json',
    success: function(data, textStatus, jqXHR) {
      // console.log(data);
    },
  })
})();


