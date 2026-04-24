(function(){
  // Splash
  var splash = document.getElementById('splash');
  if (splash) {
    window.addEventListener('load', function() {
      setTimeout(function() { splash.classList.add('hidden'); }, 1700);
    });
  }
  // Hamburger
  var burger = document.querySelector('.hamburger');
  var drawer = document.querySelector('.mobile-drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function() {
      var open = burger.classList.toggle('open');
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        burger.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
  // Active link
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-drawer a').forEach(function(a) {
    var href = (a.getAttribute('href') || '').split('/').pop();
    if (href && href === path) a.classList.add('active');
  });
  // Reveal
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('in'); });
  }
})();
