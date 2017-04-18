$(document).ready(function () {
  $('.header').delay(100).fadeIn(2000);
  $('.footer-wrapper').delay(200).fadeIn(3000);
  $('.home__title').delay(1500).fadeIn(3000);
  $('.down__btn').delay(1800).fadeIn(3000);
  $('.cbp-so-scroller').delay(2500).fadeIn(3000);
  $('.connection').delay(2000).fadeIn(10000);
  $('.about').delay(500).fadeIn(3000);
  $('.logo').hover(
    function () {
      $('.logo__wrapper').stop().animate({ "margin-right": "-160px" }, 200);
    }, function () {
      $('.logo__wrapper').stop().animate({ "margin-right": "0" }, 200);
    }
  );
  $(window).scroll(
    function () {
      $('.cbp-so-scroller').css({ 'display': 'block' });
    }
  );
  $('.down__btn').click(
    function () {
      $('.cbp-so-scroller').css({ 'display': 'block' });
    }
  );
  $('.go_to').click(function () { // ловим клик по ссылке с классом go_to
    var scroll_el = $(this).attr('href'); // возьмем содержимое атрибута href, должен быть селектором, т.е. например начинаться с # или .
    if ($(scroll_el).length != 0) { // проверим существование элемента чтобы избежать ошибки
      $('html, body').animate({ scrollTop: $(scroll_el).offset().top }, 500); // анимируем скроолинг к элементу scroll_el
    }
    return false; // выключаем стандартное действие
  });

  // всплывающая форма
  //  $('.hire_us-visible').click(
  //    function () {
  //      $('.popup_form').css({'display': 'block', 'transform': 'translateX(0%)', 'animation-duration': '2s'});
  //     // $('body').css({'overflow': 'hidden'});
  //    } 
  //  );
  $('.popup_form-close').click(
    function () {
      $('.popup_form').css({ 'display': 'none' });
      // $('body').css({'overflow': 'visible'});
    }
  );

  $('.item-message').click(
    function () {
      $('.popup_form-item-message').css({ 'display': 'none' });
    }
  );
  $('.item-message').mouseleave(
    function () {
      $('.popup_form-item-message').css({ 'display': 'block' });
    }
  );

});

$(document).ready(function () {
  $('.phone').keypress(function (e) {
    if (!(e.which == 8 || e.which == 44 || e.which == 46 || (e.which > 47 && e.which < 58))) {
      $(this).removeClass('popup_form-item-mandatory').addClass('popup_form-item-mandatory-error');
      event.preventDefault();
      return false;
    }
  });
  $('.phone').keypress(function (e) {
    if ((e.which == 8 || e.which == 44 || e.which == 46 || (e.which > 47 && e.which < 58))) {
      $(this).removeClass('popup_form-item-mandatory-error').addClass('popup_form-item-mandatory');
      return true;
    }
  });
});

