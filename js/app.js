/* ==========================================================================
   APP — wiring + boot
   ========================================================================== */
"use strict";

function wireNav(){
  document.querySelectorAll('.tab-btn').forEach(function(b){
    b.addEventListener('click', function(){ goToPage(b.dataset.page); });
  });
  document.querySelectorAll('[data-page-jump]').forEach(function(b){
    b.addEventListener('click', function(){ goToPage(b.getAttribute('data-page-jump')); });
  });
}

function wireSettingsControls(){
  document.getElementById('modeLight').onclick = function(){ cfg.mode='light'; saveProfile(); applyTheme(); renderModeButtons(); renderAll(); };
  document.getElementById('modeDark').onclick  = function(){ cfg.mode='dark';  saveProfile(); applyTheme(); renderModeButtons(); renderAll(); };
  document.getElementById('btnLogout').onclick = function(){ doLogout(); };
}

function registerServiceWorker(){
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./sw.js').catch(function(){ /* fine if unsupported in preview */ });
    });
  }
}

async function boot(){
  // inject icon set into nav + static buttons that need SVGs
  document.querySelectorAll('[data-icon]').forEach(function(el){
    var name = el.getAttribute('data-icon');
    if(ICONS[name]) el.innerHTML = ICONS[name]();
  });
  var loginMtn = document.getElementById('loginMtn'); if(loginMtn) loginMtn.outerHTML = mountainSVG();
  var homeMtn = document.getElementById('homeMtn'); if(homeMtn) homeMtn.outerHTML = mountainSVG();

  if(typeof window.supabase === 'undefined'){
    setLoginStatus('Could not reach the backend (network/CDN blocked). Please retry.', true);
    return;
  }
  initSupabase();
  wireNav();
  wireLogin();
  wireHabitModal();
  wireAccountModal();
  wirePreferenceModals();
  wireTermsModal();
  wireBackupModal();
  wireSettingsControls();
  registerServiceWorker();

  renderLoginThemeDots();
  applyTheme();
  applyLang();

  sb.auth.onAuthStateChange(function(event, session){
    if(event === 'SIGNED_IN' && session){ onAuthReady(session); }
  });

  try{
    var res = await sb.auth.getSession();
    if(res.data && res.data.session){ await onAuthReady(res.data.session); return; }
  }catch(e){}

  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appShell').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', boot);
