function fixDiv() {
    var $div = $("#navwrap");
    if ($(window).scrollTop() > $div.data("top")) {
        $div.css({'position': 'fixed', 'top': '0', 'width': '100%'});
    }
    else {
        $div.css({'position': 'static', 'top': 'auto', 'width': '100%'});
    }
}
$(window).scroll(fixDiv);