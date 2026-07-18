/* ==========================================================================
   AUTH — login screen handlers, session lifecycle
   ========================================================================== */
"use strict";

function renderLoginThemeDots(){
  var wrap = document.getElementById('loginThemeDots');
  wrap.innerHTML = '';
  THEME_LIST.forEach(function(th){
    var dot = document.createElement('i');
    dot.style.background = 'linear-gradient(135deg,'+th.c1+','+th.c2+')';
    if(cfg.theme===th.key) dot.classList.add('active');
    dot.onclick = function(){ cfg.theme=th.key; applyTheme(); renderLoginThemeDots(); };
    wrap.appendChild(dot);
  });
}
function setLoginStatus(msg, isError){
  var el = document.getElementById('loginStatus');
  el.textContent = msg || '';
  el.style.color = isError ? '#EF4444' : 'var(--text-mid)';
}

function wireLogin(){
  document.getElementById('btnGoogleLogin').onclick = async function(){
    setLoginStatus('');
    var btn = this; btn.disabled = true;
    try{
      var res = await sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.href } });
      if(res.error){ setLoginStatus(res.error.message, true); btn.disabled=false; }
      /* on success the browser navigates away to Google, so no further code runs here */
    }catch(e){ setLoginStatus(String(e.message||e), true); btn.disabled=false; }
  };

  document.getElementById('btnEmailLogin').onclick = async function(){
    var email = document.getElementById('loginEmailInput').value.trim();
    if(!email || email.indexOf('@')===-1){ document.getElementById('loginEmailInput').focus(); return; }
    var btn = this; btn.disabled = true;
    setLoginStatus('…');
    try{
      var res = await sb.auth.signInWithOtp({ email:email, options:{ emailRedirectTo: window.location.href } });
      if(res.error) setLoginStatus(res.error.message, true);
      else setLoginStatus('✉️ ' + email);
    }catch(e){ setLoginStatus(String(e.message||e), true); }
    btn.disabled = false;
  };

  document.getElementById('btnGuestLogin').onclick = async function(){
    setLoginStatus('');
    var btn = this; btn.disabled = true;
    try{
      var res = await sb.auth.signInAnonymously();
      if(res.error){ setLoginStatus(res.error.message, true); btn.disabled=false; return; }
      await onAuthReady(res.data.session);
    }catch(e){ setLoginStatus(String(e.message||e), true); btn.disabled=false; }
  };
}

async function doLogout(){
  try{ await sb.auth.signOut(); }catch(e){}
  currentUser = null;
  HABITS = []; log = {};
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

async function showApp(){
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = '';
  goToPage('pageHome');
  renderAll();
}

async function onAuthReady(session){
  if(!session || !session.user) return;
  currentUser = {
    id: session.user.id,
    email: session.user.email || '',
    name: (session.user.user_metadata && (session.user.user_metadata.full_name || session.user.user_metadata.name)) || '',
    avatarUrl: null
  };
  var ok = await safeAction(async function(){ await loadUserData(currentUser.id); });
  if(!ok) return;
  applyTheme(); applyLang();
  renderThemeGrid(); renderModeButtons(); renderLangList();
  showApp();
}
