/* ==========================================================================
   MODALS — habit add/edit, emoji picker, account, terms, backup
   ========================================================================== */
"use strict";

var editingHabitId = null, pendingEmoji = null, pendingCat = null, emojiActiveCat = 'Activity';

/* ---------------- habit add/edit ---------------- */
function renderCatSelect(){
  var wrap = document.getElementById('catSelect');
  wrap.innerHTML = '';
  CATEGORY_KEYS.forEach(function(cat){
    var opt = document.createElement('div');
    opt.className = 'cat-opt' + (pendingCat===cat?' active':'');
    opt.textContent = catLabel(cat);
    if(pendingCat===cat) opt.style.background = CAT_COLORS[cat];
    opt.onclick = function(){ pendingCat=cat; renderCatSelect(); };
    wrap.appendChild(opt);
  });
}
function openHabitModal(mode, hid){
  editingHabitId = (mode==='edit') ? hid : null;
  var h = editingHabitId ? HABITS.find(function(x){return x.id===editingHabitId;}) : null;
  pendingEmoji = h ? h.icon : '⭐';
  pendingCat = h ? h.cat : CATEGORY_KEYS[0];
  document.getElementById('habitModalTitle').textContent = h ? t('editHabit') : t('addHabit');
  document.getElementById('habitNameInput').value = h ? h.name : '';
  document.getElementById('emojiPickBtn').textContent = pendingEmoji;
  document.getElementById('habitDeleteBtn').style.display = h ? '' : 'none';
  renderCatSelect();
  openModal('habitModal');
}

function wireHabitModal(){
  document.getElementById('btnAddHabit').onclick  = function(){ openHabitModal('add'); };
  document.getElementById('btnAddHabit2').onclick = function(){ openHabitModal('add'); };
  document.getElementById('emojiPickBtn').onclick = function(){ renderEmojiGrid(); openModal('emojiModal'); };

  document.getElementById('habitSaveBtn').onclick = async function(){
    var name = document.getElementById('habitNameInput').value.trim();
    if(!name || !currentUser) return;
    var btn = this; btn.disabled = true;
    var ok = await safeAction(async function(){
      if(editingHabitId) await cloudUpdateHabit(editingHabitId, name, pendingEmoji, pendingCat);
      else await cloudAddHabit(name, pendingEmoji, pendingCat);
    }, editingHabitId ? t('toastHabitUpdated') : t('toastHabitAdded'));
    btn.disabled = false;
    if(ok){ closeModal('habitModal'); renderAll(); }
  };

  document.getElementById('habitDeleteBtn').onclick = function(){ if(editingHabitId) requestDeleteHabit(editingHabitId); };
}

async function requestDeleteHabit(hid){
  if(!confirm(t('confirmDelete'))) return;
  var ok = await safeAction(async function(){ await cloudDeleteHabit(hid); }, t('toastHabitDeleted'));
  if(ok){ closeModal('habitModal'); renderAll(); }
}

/* ---------------- emoji picker ---------------- */
function renderEmojiCatTabs(){
  var wrap = document.getElementById('emojiCatTabs');
  wrap.innerHTML = '';
  Object.keys(EMOJI_LIBRARY).forEach(function(cat){
    var btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = (emojiActiveCat===cat)?'active':'';
    btn.onclick = function(){ emojiActiveCat=cat; renderEmojiCatTabs(); renderEmojiGrid(); };
    wrap.appendChild(btn);
  });
}
function renderEmojiGrid(){
  renderEmojiCatTabs();
  var grid = document.getElementById('emojiGrid');
  grid.innerHTML = '';
  (EMOJI_LIBRARY[emojiActiveCat]||[]).forEach(function(em){
    var d = document.createElement('div'); d.className='emoji-opt'; d.textContent=em;
    d.onclick = function(){ pendingEmoji=em; document.getElementById('emojiPickBtn').textContent=em; closeModal('emojiModal'); };
    grid.appendChild(d);
  });
}

/* ---------------- account modal ---------------- */
function wireAccountModal(){
  document.getElementById('btnOpenAccount').onclick = function(){ renderSettings(); openModal('accountModal'); };

  document.getElementById('accountAvatarPreview').onclick = function(){
    document.getElementById('avatarFileInput').click();
  };
  document.getElementById('avatarFileInput').onchange = async function(e){
    var file = e.target.files && e.target.files[0];
    if(!file || !currentUser) return;
    if(file.size > 4*1024*1024){ toast(t('toastError'), 'err'); return; }
    var preview = document.getElementById('accountAvatarPreview');
    preview.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">'+ICONS.upload('icon-lg')+'</div>';
    var ok = await safeAction(async function(){ await uploadAvatar(file); }, t('profileUpdated'));
    renderAvatarInto('accountAvatarPreview', 84);
    renderAvatarInto('settingsAvatar', 64);
    renderAvatarInto('homeAvatarSlot', 30);
    if(!ok) renderAvatarInto('accountAvatarPreview', 84);
    e.target.value = '';
  };

  document.getElementById('accountSaveBtn').onclick = async function(){
    var name = document.getElementById('accountNameInput').value.trim();
    var btn = this; btn.disabled = true;
    var ok = await safeAction(async function(){ await updateProfileFields({ display_name: name }); }, t('profileUpdated'));
    btn.disabled = false;
    if(ok){ renderSettings(); renderHome(); closeModal('accountModal'); }
  };

  document.getElementById('accountDeleteBtn').onclick = function(){
    if(!confirm(t('deleteAccountConfirm'))) return;
    toast(t('toastError'), 'err');
    /* Real account deletion requires an admin-privileged server call (service
       role key), which must never be exposed in client-side code. This button
       is wired and ready — see README for the one Edge Function needed. */
  };
}

/* ---------------- terms modal ---------------- */
function wireTermsModal(){
  function openTerms(){
    var host = document.getElementById('termsContent');
    if(host && typeof currentTermsHtml === 'function') host.innerHTML = currentTermsHtml();
    openModal('termsModal');
  }
  document.getElementById('btnOpenTerms').onclick = openTerms;
  document.querySelectorAll('[data-open-terms]').forEach(function(a){
    a.onclick = function(ev){ ev.preventDefault(); openTerms(); };
  });
}

/* ---------------- backup / restore modal ---------------- */
function wireBackupModal(){
  document.getElementById('btnOpenBackup').onclick = function(){ openModal('backupModal'); };

  document.getElementById('btnExport').onclick = function(){
    var obj = buildBackupObject();
    var blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'habito-backup-' + todayKey() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast(t('exported'), 'ok');
  };

  document.getElementById('restoreFileInput').onchange = function(e){
    var file = e.target.files && e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = async function(){
      var btn = document.getElementById('btnImportTrigger'); btn.disabled = true;
      var ok = await safeAction(async function(){
        var obj = JSON.parse(reader.result);
        await restoreFromBackup(obj);
      }, t('imported'));
      btn.disabled = false;
      if(ok) renderAll();
    };
    reader.onerror = function(){ toast(t('importError'), 'err'); };
    reader.readAsText(file);
    e.target.value = '';
  };
  document.getElementById('btnImportTrigger').onclick = function(){ document.getElementById('restoreFileInput').click(); };
}
