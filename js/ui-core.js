/* ==========================================================================
   UI CORE — toast, modal open/close, page nav, small effects
   ========================================================================== */
"use strict";

/* ---------------- toast ---------------- */
function toast(msg, kind){
  var host = document.getElementById('toastHost');
  if(!host) return;
  var el = document.createElement('div');
  el.className = 'toast' + (kind==='err' ? ' err' : (kind==='ok' ? ' ok' : ''));
  el.textContent = msg;
  host.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('show'); });
  setTimeout(function(){
    el.classList.remove('show');
    setTimeout(function(){ el.remove(); }, 300);
  }, 2600);
}

/* wrap an async action: shows a generic error toast on failure instead of
   ever failing silently (this was the root cause of "nothing happens"). */
async function safeAction(fn, okMsg){
  try{
    await fn();
    if(okMsg) toast(okMsg, 'ok');
    return true;
  }catch(e){
    console.error(e);
    toast(t('toastError'), 'err');
    return false;
  }
}

/* ---------------- modal generic ---------------- */
function openModal(id){ document.getElementById(id).classList.add('show'); }
function closeModal(id){ document.getElementById(id).classList.remove('show'); }
document.addEventListener('click', function(e){
  if(e.target.matches('[data-close]')){ closeModal(e.target.getAttribute('data-close')); }
  if(e.target.classList.contains('modal-backdrop')){ e.target.classList.remove('show'); }
});

/* ---------------- page nav ---------------- */
var currentPage = 'pageHome';
function goToPage(pageId){
  currentPage = pageId;
  document.querySelectorAll('.page').forEach(function(p){ p.classList.toggle('active', p.id===pageId); });
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.page===pageId); });
  window.scrollTo(0,0);
}

/* ---------------- number count-up ---------------- */
function animateNumber(el, target, suffix){
  var start = parseInt(el.textContent)||0, t0=performance.now(), dur=650;
  function step(tt){ var p=Math.min(1,(tt-t0)/dur); var val=Math.round(start+(target-start)*(1-Math.pow(1-p,3))); el.textContent=val+suffix; if(p<1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}

/* ---------------- confetti burst on habit check ---------------- */
function burst(x,y){
  var theme = THEME_LIST.find(function(th){ return th.key===cfg.theme; }) || THEME_LIST[0];
  var colors = [theme.c1, theme.c2, '#FDE68A'];
  for(var i=0;i<10;i++){
    var p = document.createElement('div');
    p.className = 'burst'; p.style.left=x+'px'; p.style.top=y+'px'; p.style.background=colors[i%3];
    document.body.appendChild(p);
    var ang = Math.random()*Math.PI*2, dist=28+Math.random()*38;
    var dx=Math.cos(ang)*dist, dy=Math.sin(ang)*dist;
    p.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale(0)',opacity:0}],
      {duration:520+Math.random()*230, easing:'cubic-bezier(.22,1,.36,1)'}).onfinish=function(){ p.remove(); };
  }
}

/* ---------------- reusable scenery SVG (mountains) ---------------- */
function mountainSVG(){
  return '<svg class="mtn" viewBox="0 0 400 140" preserveAspectRatio="none">'+
    '<polygon points="0,140 0,90 60,45 130,90 170,60 230,95 280,55 340,90 400,70 400,140" fill="rgba(255,255,255,.10)"/>'+
    '<polygon points="0,140 0,110 90,70 160,105 220,75 300,110 400,95 400,140" fill="rgba(255,255,255,.18)"/>'+
  '</svg>';
}
