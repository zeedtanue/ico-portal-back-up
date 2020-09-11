// Mobile menu
$(".bc-bar").click(function() {
    console.log('active menu');
    $('body').toggleClass("menu-expanded");
    $('.bc-nav-menu').toggleClass("bc-mob-menu");
    $(this).toggleClass("menu-expanded");
});

// Injecting pre-defined heading classes to all heading tags
$(function(){
    var body = $('body');
    var bcClass = $('body').find('h' + i).hasClass('bc-h' + i);

    if(!bcClass) {
        for (var i = 1; i < 10; i++) {
            body.find('h' + i).addClass('bc-h' + i)
        };
    }
});

//to-top-page
$(function() {
    $("#top").on('click', function() {
        $("HTML, BODY").animate({
            scrollTop: 0
        }, 1000);
    });
});