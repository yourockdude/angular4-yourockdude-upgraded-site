 $(document).ready(function(){
   $('.header').delay(100).fadeIn(2000);
   $('.footer-wrapper').delay(200).fadeIn(3000);
   $('.home__title').delay(1500).fadeIn(3000);
   $('.down__btn').delay(1800).fadeIn(3000);
   $('.cbp-so-scroller').delay(2500).fadeIn(3000);
   $('.connection').delay(2000).fadeIn(10000);
   $('.about').delay(500).fadeIn(3000);
   $('.logo').hover(
     function(){
       $('.logo__wrapper').stop().animate({"margin-right": "-160px"}, 200);
     },function () {
       $('.logo__wrapper').stop().animate({"margin-right": "0"}, 200);
     }
   );
   $(window).scroll(
     function(){
       $('.cbp-so-scroller').css({'display': 'block'});
     }
   );
   $('.down__btn').click(
     function () {
       $('.cbp-so-scroller').css({'display': 'block'});
     }
   );
   $('.go_to').click( function(){ // ловим клик по ссылке с классом go_to
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
       $('.popup_form').css({'display': 'none'});
      // $('body').css({'overflow': 'visible'});
     } 
   );
   
   $('.item-message').click(
     function () {
       $('.popup_form-item-message').css({'display': 'none'});
     } 
   );
   $('.item-message').mouseleave(
     function () {
       $('.popup_form-item-message').css({'display': 'block'});
     } 
   );
   
 });
 
 
 (function( $ ) {
  $.fn.selectbox = function() {
    
    var selectDefaultHeight = $('#selectBox').height();
    var rotateDefault = "rotate(0deg)";
        $('#selectBox > p.valueTag').click(function() {
          var currentHeight = $('#selectBox').height();
          if (currentHeight < 100 || currentHeight == selectDefaultHeight) {
            $('#selectBox').height("250px"); 
          }
          if (currentHeight >= 250) {
            $('#selectBox').height(selectDefaultHeight);
            $('img.arrow').css({transform: rotateDefault});
          }
      });
      $('li.option').click(function() {
        $('#selectBox').height(selectDefaultHeight);
       $('img.arrow').css({transform: rotateDefault});
        $('p.valueTag').text($(this).text());
      });
  };
})( jQuery );


/* ===== Logic for creating Select Boxes ===== */
$('.sel').each(function() {
  $(this).children('select').css('display', 'none');
  
  var $current = $(this);
  
  $(this).find('option').each(function(i) {
    if (i == 0) {
      $current.prepend($('<div>', {
        class: $current.attr('class').replace(/sel/g, 'sel__box')
      }));
      
      var placeholder = $(this).text();
      $current.prepend($('<span>', {
        class: $current.attr('class').replace(/sel/g, 'sel__placeholder'),
        text: placeholder,
        'data-placeholder': placeholder
      }));
      
      return;
    }
    
    $current.children('div').append($('<span>', {
      class: $current.attr('class').replace(/sel/g, 'sel__box__options'),
      text: $(this).text()
    }));
  });
});

// Toggling the `.active` state on the `.sel`.
$('.sel').click(function() {
  $(this).toggleClass('active');
});

// Toggling the `.selected` state on the options.
$('.sel__box__options').click(function() {
  var txt = $(this).text();
  var index = $(this).index();
  
  $(this).siblings('.sel__box__options').removeClass('selected');
  $(this).addClass('selected');
  
  var $currentSel = $(this).closest('.sel');
  $currentSel.children('.sel__placeholder').text(txt);
  $currentSel.children('select').prop('selectedIndex', index + 1);
});


$(document).ready(function(){	
  $('.phone').keypress(function(e){if(!(e.which==8 || e.which==44 || e.which==46 || (e.which>47 && e.which<58))) {
    $(this).removeClass('popup_form-item-mandatory').addClass('popup_form-item-mandatory-error');
    event.preventDefault();
    return false;}
  });
  $('.phone').keypress(function(e){if((e.which==8 || e.which==44 || e.which==46 || (e.which>47 && e.which<58))) {
    $(this).removeClass('popup_form-item-mandatory-error').addClass('popup_form-item-mandatory');
    return true;}
  });
});

