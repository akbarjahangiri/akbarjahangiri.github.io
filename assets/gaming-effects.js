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

// Planets parallax for About page
(function(){
  function lerp(a,b,t){ return a + (b - a) * t; }
  var scene = null; var planets = []; var lastX = 0; var lastY = 0;
  function setup(){
    scene = document.querySelector('.cosmic-scene');
    if(!scene) return;
    planets = [].slice.call(scene.querySelectorAll('.planet'));
    document.addEventListener('mousemove', function(e){
      var nx = (e.clientX / window.innerWidth - 0.5);
      var ny = (e.clientY / window.innerHeight - 0.5);
      lastX = lerp(lastX, nx, 0.1);
      lastY = lerp(lastY, ny, 0.1);
      planets.forEach(function(p, i){
        var depth = parseFloat(p.getAttribute('data-depth') || (0.4 + i * 0.15));
        var tx = -lastX * 10 * depth;
        var ty = -lastY * 10 * depth;
        p.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      });
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setup);
  } else { setup(); }
})();

// Floating game characters background
(function(){
  var container = document.querySelector('.game-floaters');
  if(!container){
    container = document.createElement('div');
    container.className = 'game-floaters';
    document.body.appendChild(container);
  }
  // On index page, exclude Pac-Man from floaters
  var path = (location.pathname || '').toLowerCase();
  var onIndex = path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('index.html');
  var classes = onIndex ? ['ghost','controller','xbadge'] : ['pacman','ghost','controller','xbadge'];
  function spawn(){
    var el = document.createElement('div');
    var kind = classes[Math.floor(Math.random() * classes.length)];
    el.className = 'floater ' + kind;
    var left = Math.random() * 100; // vw
    var driftX = (Math.random() * 80 - 40) + 'px';
    var duration = 12 + Math.random() * 18; // 12-30s
    el.style.left = left + 'vw';
    el.style.setProperty('--drift-x', driftX);
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * 5) + 's';
    container.appendChild(el);
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, (duration + 5) * 1000);
  }
  for(var i=0;i<10;i++){ spawn(); }
  setInterval(spawn, 2500);
})();

// Starships combat: free-for-all with variants, separation, specials, and CTA popup
(function(){
  var layer = document.querySelector('.starship-layer');
  if(!layer){
    layer = document.createElement('div');
    layer.className = 'starship-layer';
    document.body.appendChild(layer);
  }
  function createShip(color){
    var s = document.createElement('div');
    s.className = 'starship ' + color;
    layer.appendChild(s);
    var size = 0.9 + Math.random()*0.3; // 0.9 - 1.2
    s.style.transform = 'scale(' + size + ')';
    return { el: s, color: color, x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight, vx: 0, vy: 0, angle: 0, hp: 100, lastFire: 0, size: size, speedMul: 0.8 + Math.random()*0.5 };
  }
  function placeShip(ship, x, y){ ship.x = x; ship.y = y; ship.vx = 0; ship.vy = 0; ship.hp = 100; }

  var colors = ['blue','red','green','yellow','orange','purple'];
  var ships = [];
  // Ensure one blue on left and one red on right
  var leftBlue = createShip('blue'); placeShip(leftBlue, 60, window.innerHeight*0.5);
  var rightRed = createShip('red'); placeShip(rightRed, window.innerWidth-60, window.innerHeight*0.5);
  ships.push(leftBlue, rightRed);
  // Fill up to 10 total random ships with random colors and positions
  while(ships.length < 10){
    var c = colors[Math.floor(Math.random()*colors.length)];
    var s = createShip(c);
    placeShip(s, Math.random()*window.innerWidth*0.9 + 20, Math.random()*window.innerHeight*0.9 + 20);
    ships.push(s);
  }

  var lasers = [];
  var specialToggle = 0; // alternates which color gets specials (blue side then red side)
  setInterval(function(){ specialToggle = 1 - specialToggle; }, 1000);

  function fire(shooter, target, isSpecial){
    var now = performance.now();
    var baseCooldown = 600 / shooter.speedMul; // faster ships shoot a bit more often
    var cooldown = isSpecial ? baseCooldown + 200 : baseCooldown;
    if(now - shooter.lastFire < cooldown) return;
    shooter.lastFire = now;
    var angle = Math.atan2(target.y - shooter.y, target.x - shooter.x);
    var baseSpeed = isSpecial ? 11 : 8.5;
    var speed = baseSpeed * (0.9 + shooter.speedMul*0.2);
    var el = document.createElement('div');
    var enemy = shooter.color === 'red';
    // Color lasers by ship color
    var colorClass = shooter.color; // blue, red, green, yellow, orange, purple
    el.className = 'laser' + (enemy ? ' enemy' : '') + (isSpecial ? ' special' : '') + ' ' + colorClass;
    layer.appendChild(el);
    var spawnOffset = 16;
    var lx = shooter.x + Math.cos(angle) * spawnOffset;
    var ly = shooter.y + Math.sin(angle) * spawnOffset;
    lasers.push({ el: el, x: lx, y: ly, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, fromEnemy: enemy, alive: true, dmg: isSpecial ? 40 : 20, shooter: shooter, age: 0 });
  }

  function explode(x,y){
    var e = document.createElement('div');
    e.className = 'explosion';
    e.style.left = (x|0) + 'px'; e.style.top = (y|0) + 'px';
    layer.appendChild(e);
    setTimeout(function(){ if(e.parentNode) e.parentNode.removeChild(e); }, 600);
  }

  function thunderStrike(target){
    var len = Math.min(240, Math.max(120, window.innerHeight*0.3));
    var bolt = document.createElement('div');
    bolt.className = 'lightning';
    bolt.style.left = (target.x|0) + 'px';
    bolt.style.top = '0px';
    bolt.style.setProperty('--len', len + 'px');
    layer.appendChild(bolt);
    setTimeout(function(){ if(bolt.parentNode) bolt.parentNode.removeChild(bolt); }, 320);
    if(target.y < len + 30){ target.hp -= 35; explode(target.x, target.y); }
  }
  setInterval(function(){
    // If special to blue, thunder red-ish ships; else thunder blue-ish ships
    var candidates = ships.filter(function(s){ return specialToggle===0 ? s.color !== 'blue' : s.color !== 'red'; });
    if(candidates.length){ thunderStrike(candidates[Math.floor(Math.random()*candidates.length)]); }
  }, 3000);

  function clamp(v, min, max){ return v < min ? min : (v > max ? max : v); }

  function steerAll(){
    for(var i=0;i<ships.length;i++){
      var s = ships[i];
      if(!s.el) continue;
      // Separation from all others
      var sepX = 0, sepY = 0; var count = 0; var minSep = 34;
      for(var k=0;k<ships.length;k++) if(k!==i){
        var o = ships[k];
        var dx = s.x - o.x; var dy = s.y - o.y; var d2 = dx*dx + dy*dy;
        if(d2 < minSep*minSep && d2 > 0){ var d = Math.sqrt(d2); sepX += dx/d; sepY += dy/d; count++; }
      }
      if(count>0){ sepX/=count; sepY/=count; }
      // Move towards average enemy center but keep orbiting distance by color rivalries
      var enemyCenterX = 0, enemyCenterY = 0, ec=0;
      for(var m=0;m<ships.length;m++) if(m!==i){ enemyCenterX += ships[m].x; enemyCenterY += ships[m].y; ec++; }
      if(ec>0){ enemyCenterX/=ec; enemyCenterY/=ec; }
      var ddx = enemyCenterX - s.x; var ddy = enemyCenterY - s.y; var dist = Math.hypot(ddx, ddy) + 0.0001;
      var desired = 220;
      var dirX = ddx / dist; var dirY = ddy / dist;
      var radial = (dist - desired) * 0.02;
      var perpX = -dirY; var perpY = dirX;
      var orbit = (s.color==='red'||s.color==='orange'||s.color==='yellow') ? 1.5 : -1.5;
      var ax = sepX*0.7 + dirX * radial + perpX * orbit;
      var ay = sepY*0.7 + dirY * radial + perpY * orbit;
      var maxV = 2.6 * s.speedMul;
      s.vx = clamp(s.vx + ax, -maxV, maxV);
      s.vy = clamp(s.vy + ay, -maxV, maxV);
      s.x += s.vx; s.y += s.vy;
      s.angle = Math.atan2(s.vy, s.vx);

      // Choose nearest target (any ship not self)
      var tgt = null; var best = 1e9;
      for(var n=0;n<ships.length;n++) if(n!==i){
        var ex = ships[n].x - s.x; var ey = ships[n].y - s.y; var d2e = ex*ex + ey*ey;
        if(d2e < best){ best = d2e; tgt = ships[n]; }
      }
      if(tgt){
        var isSpecial = (specialToggle === 0 && s.color==='blue') || (specialToggle === 1 && s.color==='red');
        fire(s, tgt, isSpecial);
      }
    }
  }

  function updateLasers(){
    for(var i=lasers.length-1;i>=0;i--){
      var L = lasers[i];
      if(!L.alive) { lasers.splice(i,1); continue; }
      L.x += L.vx; L.y += L.vy;
      L.age++;
      L.el.style.transform = 'translate(' + (L.x|0) + 'px,' + (L.y|0) + 'px) rotate(' + Math.atan2(L.vy,L.vx) + 'rad)';
      if(L.x < -50 || L.x > window.innerWidth + 50 || L.y < -50 || L.y > window.innerHeight + 50){
        if(L.el.parentNode) L.el.parentNode.removeChild(L.el);
        lasers.splice(i,1); continue;
      }
      // Hit detection against all ships except shooter for first few frames
      for(var s=ships.length-1;s>=0;s--){
        var ship = ships[s];
        if(L.age < 3 && ship === L.shooter) continue;
        var dx = ship.x - L.x; var dy = ship.y - L.y;
        if((dx*dx + dy*dy) < 18*18){
          ship.hp -= L.dmg;
          explode(L.x, L.y);
          if(L.el.parentNode) L.el.parentNode.removeChild(L.el);
          lasers.splice(i,1);
          if(ship.hp <= 0){
            if(ship.el && ship.el.parentNode) ship.el.parentNode.removeChild(ship.el);
            var deadColor = ship.color;
            ships.splice(s,1);
            setTimeout(function(){
              var ns = createShip(deadColor);
              placeShip(ns, Math.random()*window.innerWidth*0.9 + 20, Math.random()*window.innerHeight*0.9 + 20);
              ships.push(ns);
            }, 2000);
          }
          break;
        }
      }
    }
  }

  function wrap(ship){
    if(ship.x < -30) ship.x = window.innerWidth + 30;
    if(ship.x > window.innerWidth + 30) ship.x = -30;
    if(ship.y < -30) ship.y = window.innerHeight + 30;
    if(ship.y > window.innerHeight + 30) ship.y = -30;
    if(ship && ship.el) ship.el.style.transform = 'translate(' + (ship.x|0) + 'px,' + (ship.y|0) + 'px) rotate(' + ship.angle + 'rad)';
  }

  function tick(){
    steerAll();
    updateLasers();
    for(var i=0;i<ships.length;i++) wrap(ships[i]);
    requestAnimationFrame(tick);
  }
  tick();

  // After 60s on index, show CTA popup
  var path = (location.pathname || '').toLowerCase();
  var onIndex = path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('index.html');
  if(onIndex){
    setTimeout(function(){
      var popup = document.querySelector('.cta-popup');
      if(!popup){
        popup = document.createElement('div');
        popup.className = 'cta-popup';
        popup.innerHTML = '<div class="close-btn">✕</div>Enjoying the starship war? Check out <a href="./about.html">About me</a>!';
        document.body.appendChild(popup);
      }
      popup.classList.add('active');
      popup.querySelector('.close-btn').addEventListener('click', function(){ popup.classList.remove('active'); });
    }, 60000);
  }
})();
