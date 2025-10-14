// Starfield background
(function(){
  var canvas = document.getElementById('gaming-starfield-canvas');
  if(!canvas){
    canvas = document.createElement('canvas');
    canvas.id = 'gaming-starfield-canvas';
    document.body.appendChild(canvas);
  }
  var ctx = canvas.getContext('2d');
  var stars = [];
  var DPR = Math.max(1, window.devicePixelRatio || 1);

  function resize(){
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
  }
  function init(){
    resize();
    stars = [];
    var count = Math.floor((window.innerWidth * window.innerHeight) / 5000);
    for(var i=0;i<count;i++){
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.6 + 0.4
      });
    }
  }
  function tick(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#ffffff';
    for(var i=0;i<stars.length;i++){
      var s = stars[i];
      var px = s.x;
      var py = s.y;
      ctx.globalAlpha = 0.5 * s.z + 0.2;
      ctx.beginPath();
      ctx.arc(px, py, s.r * DPR, 0, Math.PI*2);
      ctx.fill();
      s.x += 0.06 * s.z * DPR;
      if(s.x > canvas.width + 10){ s.x = -10; s.y = Math.random() * canvas.height; }
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', function(){ init(); });
  init();
  tick();
})();

// Scanline overlay element
(function(){
  if(document.getElementById('gaming-scanlines-overlay')) return;
  var div = document.createElement('div');
  div.id = 'gaming-scanlines-overlay';
  document.body.appendChild(div);
})();

// Lightbox minimal implementation
(function(){
  var overlay; var imgEl; var currentGroup = []; var index = 0;
  function ensureOverlay(){
    if(overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'gaming-lightbox-overlay';

    var closeBtn = document.createElement('div');
    closeBtn.className = 'gaming-lightbox-close';
    closeBtn.textContent = '✕';

    var prevBtn = document.createElement('div');
    prevBtn.className = 'gaming-lightbox-control gaming-lightbox-prev';
    prevBtn.textContent = '‹';

    var nextBtn = document.createElement('div');
    nextBtn.className = 'gaming-lightbox-control gaming-lightbox-next';
    nextBtn.textContent = '›';

    imgEl = document.createElement('img');
    imgEl.className = 'gaming-lightbox-image';

    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    overlay.appendChild(imgEl);
    document.body.appendChild(overlay);

    function close(){ overlay.classList.remove('active'); }
    function show(){ overlay.classList.add('active'); }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
    prevBtn.addEventListener('click', function(){ navigate(-1); });
    nextBtn.addEventListener('click', function(){ navigate(1); });
    document.addEventListener('keydown', function(e){
      if(!overlay.classList.contains('active')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowLeft') navigate(-1);
      if(e.key === 'ArrowRight') navigate(1);
    });

    function navigate(dir){
      if(!currentGroup.length) return;
      index = (index + dir + currentGroup.length) % currentGroup.length;
      imgEl.src = currentGroup[index].getAttribute('data-lightbox-src') || currentGroup[index].src;
    }

    overlay.navigate = navigate;
    overlay.show = show;
    overlay.close = close;
  }

  function bind(){
    var items = document.querySelectorAll('[data-lightbox-group]');
    if(!items.length) return;

    var groupMap = {};
    for(var i=0;i<items.length;i++){
      var el = items[i];
      var g = el.getAttribute('data-lightbox-group') || 'default';
      if(!groupMap[g]) groupMap[g] = [];
      groupMap[g].push(el);

      el.style.cursor = 'zoom-in';
      el.addEventListener('click', (function(gid, position){
        return function(e){
          e.preventDefault();
          ensureOverlay();
          currentGroup = groupMap[gid];
          index = position;
          imgEl.src = this.getAttribute('data-lightbox-src') || this.src;
          overlay.show();
        };
      })(g, groupMap[g].length - 1));
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind);
  }else{ bind(); }
})();

// Subtle parallax on hero background
(function(){
  var hero = document.querySelector('.hero-full-container.background-image-container');
  if(!hero) return;
  document.addEventListener('mousemove', function(e){
    var x = (e.clientX / window.innerWidth - 0.5) * 6;
    var y = (e.clientY / window.innerHeight - 0.5) * 6;
    hero.style.backgroundPosition = (50 - x) + '% ' + (50 - y) + '%';
  });
})();