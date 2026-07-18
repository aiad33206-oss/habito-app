/* ==========================================================================
   DATA LAYER — Supabase client, CRUD, streaks/xp/badges, backup
   ========================================================================== */
"use strict";

var sb = null;
function initSupabase(){
  // Standalone deployed app -> use supabase-js's OWN default session storage
  // (browser localStorage). Do NOT wire this to any Claude-artifact-only API.
  sb = window.supabase.createClient(HABITO_CONFIG.SUPABASE_URL, HABITO_CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
}

function pad(n){ return n<10 ? '0'+n : ''+n; }
function dkey(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function todayKey(){ return dkey(new Date()); }

var HABITS = [];
var log = {};
var cfg = { mode:'dark', theme:'forest', lang:'en' };
var currentUser = null; // { id, email, name, avatarUrl }

/* ---------------- profile / habits / logs ---------------- */
async function loadUserData(userId){
  var profRes = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  if(profRes.error) throw profRes.error;
  if(profRes.data){
    cfg.theme = profRes.data.theme || cfg.theme;
    cfg.mode  = profRes.data.mode  || cfg.mode;
    cfg.lang  = profRes.data.lang  || cfg.lang;
    currentUser.name = profRes.data.display_name || currentUser.name;
    currentUser.avatarUrl = profRes.data.avatar_url || null;
    currentUser.gender = profRes.data.gender || null;
    currentUser.isPremium = !!profRes.data.is_premium;
  }

  var habRes = await sb.from('habits').select('*').eq('user_id', userId).order('sort_order', {ascending:true});
  if(habRes.error) throw habRes.error;
  HABITS = (habRes.data||[]).map(function(r){ return { id:r.id, name:r.name, icon:r.icon, cat:r.category }; });

  var cutoff = new Date(); cutoff.setDate(cutoff.getDate()-400);
  var logRes = await sb.from('habit_logs').select('habit_id,log_date,completed').eq('user_id', userId).gte('log_date', dkey(cutoff));
  if(logRes.error) throw logRes.error;
  log = {};
  (logRes.data||[]).forEach(function(r){
    if(!r.completed) return;
    if(!log[r.log_date]) log[r.log_date] = {};
    log[r.log_date][r.habit_id] = true;
  });
}

var profileSaveTimer = null;
function saveProfile(){
  if(!currentUser) return;
  clearTimeout(profileSaveTimer);
  profileSaveTimer = setTimeout(async function(){
    var res = await sb.from('profiles').update({ theme:cfg.theme, mode:cfg.mode, lang:cfg.lang }).eq('id', currentUser.id);
    if(res.error) toast(t('toastError'), 'err');
  }, 200);
}

async function updateProfileFields(fields){
  var res = await sb.from('profiles').update(fields).eq('id', currentUser.id);
  if(res.error) throw res.error;
  if(fields.display_name !== undefined) currentUser.name = fields.display_name;
  if(fields.avatar_url !== undefined) currentUser.avatarUrl = fields.avatar_url;
  if(fields.gender !== undefined) currentUser.gender = fields.gender;
  if(fields.is_premium !== undefined) currentUser.isPremium = fields.is_premium;
}

async function uploadAvatar(file){
  var blob = await downscaleImageToJpeg(file, 480);
  var path = currentUser.id + '/avatar.jpg';
  var up = await sb.storage.from(HABITO_CONFIG.AVATAR_BUCKET).upload(path, blob, {
    upsert:true, cacheControl:'3600', contentType:'image/jpeg'
  });
  if(up.error) throw up.error;
  var pub = sb.storage.from(HABITO_CONFIG.AVATAR_BUCKET).getPublicUrl(path);
  var url = pub.data.publicUrl + '?t=' + Date.now();
  await updateProfileFields({ avatar_url: url });
  return url;
}

/* Re-encode any picked image (incl. HEIC/large camera photos) into a
   square JPEG. This fixes two real problems: (1) some formats a phone's
   camera produces (e.g. HEIC) can't be displayed by <img> in most
   browsers even though the upload itself "succeeds" — so the photo
   silently never appears; (2) multi-MB camera photos are slow to upload
   and needlessly large for a small avatar. */
function downscaleImageToJpeg(file, size){
  return new Promise(function(resolve, reject){
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function(){
      URL.revokeObjectURL(url);
      var side = Math.min(img.width, img.height);
      var sx = (img.width-side)/2, sy = (img.height-side)/2;
      var canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      canvas.toBlob(function(blob){
        if(blob) resolve(blob); else reject(new Error('encode-failed'));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = function(){ URL.revokeObjectURL(url); reject(new Error('unsupported-image-format')); };
    img.src = url;
  });
}

function getDay(key){ return log[key] || {}; }
function dayCompletion(key){
  var d = getDay(key), done=0;
  HABITS.forEach(function(h){ if(d[h.id]) done++; });
  return {done:done, total:HABITS.length, pct: HABITS.length ? Math.round(done/HABITS.length*100) : 0};
}
async function setDayHabit(key, hid, val){
  var prev = !!(log[key] && log[key][hid]);
  if(!log[key]) log[key] = {};
  if(val) log[key][hid] = true; else delete log[key][hid];
  var res = await sb.from('habit_logs').upsert(
    { user_id: currentUser.id, habit_id: hid, log_date: key, completed: val },
    { onConflict: 'user_id,habit_id,log_date' }
  );
  if(res.error){
    if(prev) log[key][hid] = true; else delete log[key][hid]; // revert optimistic change
    throw res.error;
  }
}

async function cloudAddHabit(name, icon, cat){
  var row = { user_id: currentUser.id, name:name, icon:icon, category:cat, sort_order: HABITS.length };
  var res = await sb.from('habits').insert(row).select().single();
  if(res.error) throw res.error;
  HABITS.push({ id:res.data.id, name:name, icon:icon, cat:cat });
}
async function cloudUpdateHabit(hid, name, icon, cat){
  var res = await sb.from('habits').update({ name:name, icon:icon, category:cat }).eq('id', hid);
  if(res.error) throw res.error;
  var h = HABITS.find(function(x){ return x.id===hid; });
  if(h){ h.name=name; h.icon=icon; h.cat=cat; }
}
async function cloudDeleteHabit(hid){
  var res = await sb.from('habits').delete().eq('id', hid);
  if(res.error) throw res.error;
  HABITS = HABITS.filter(function(h){ return h.id!==hid; });
  Object.keys(log).forEach(function(k){ delete log[k][hid]; });
}

/* ---------------- streaks / xp / badges (pure, local) ---------------- */
function overallStreaks(){
  var cur=0, longest=0, running=0, counting=true, cursor=new Date();
  for(var i=0;i<3650;i++){
    var key = dkey(cursor);
    var c = dayCompletion(key);
    var qualifies = c.done>0 && c.pct>=50;
    if(qualifies){ running++; if(counting) cur=running; if(running>longest) longest=running; }
    else { if(i===0){} else { running=0; counting=false; } }
    cursor.setDate(cursor.getDate()-1);
    if(!log[key] && i>60 && running===0) break;
  }
  return {cur:cur, longest:longest};
}
function habitStreak(hid){
  var running=0, cur=0, longest=0, counting=true, cursor=new Date();
  for(var i=0;i<730;i++){
    var key = dkey(cursor);
    var done = !!getDay(key)[hid];
    if(done){ running++; if(counting) cur=running; if(running>longest) longest=running; }
    else { if(i===0){} else { running=0; counting=false; } }
    cursor.setDate(cursor.getDate()-1);
    if(!log[key] && i>60 && running===0) break;
  }
  return {cur:cur, longest:longest};
}
function habitAllTimeCompletion(hid){
  var keys = Object.keys(log);
  if(!keys.length) return 0;
  var total=0, done=0;
  keys.forEach(function(k){ total++; if(log[k][hid]) done++; });
  return total ? Math.round(done/total*100) : 0;
}
function weekAverage(){
  var sum=0, n=0, cursor=new Date();
  for(var i=0;i<7;i++){ var key=dkey(cursor); if(log[key]){ sum+=dayCompletion(key).pct; n++; } cursor.setDate(cursor.getDate()-1); }
  return n ? Math.round(sum/n) : 0;
}
function bestDay(){
  var keys = Object.keys(log);
  if(!keys.length) return '—';
  var best=null, bestPct=-1;
  keys.forEach(function(k){ var c=dayCompletion(k); if(c.pct>bestPct){ bestPct=c.pct; best=k; } });
  if(!best || bestPct<=0) return '—';
  var p = best.split('-'); var d = new Date(+p[0], +p[1]-1, +p[2]);
  return d.toLocaleDateString(localeFor(),{month:'short', day:'numeric'}) + ' · ' + bestPct + '%';
}
function totalXP(){
  var xp=0;
  Object.keys(log).forEach(function(k){ Object.keys(log[k]).forEach(function(hid){ if(log[k][hid]) xp++; }); });
  return xp;
}
function levelInfo(){
  var xp=totalXP(), per=25, level=Math.floor(xp/per)+1, within=xp%per;
  return { xp:xp, level:level, within:within, per:per, pct:Math.round(within/per*100) };
}
var BADGE_DEFS = [
  {key:'first',     icon:'🌱', test:function(xp){ return xp>=1; }},
  {key:'streak3',   icon:'✨', test:function(xp,st){ return st.longest>=3; }},
  {key:'streak7',   icon:'🔥', test:function(xp,st){ return st.longest>=7; }},
  {key:'streak14',  icon:'⚡', test:function(xp,st){ return st.longest>=14; }},
  {key:'streak30',  icon:'🏅', test:function(xp,st){ return st.longest>=30; }},
  {key:'streak60',  icon:'💎', test:function(xp,st){ return st.longest>=60; }},
  {key:'streak100', icon:'👑', test:function(xp,st){ return st.longest>=100; }},
  {key:'century',   icon:'💯', test:function(xp){ return xp>=100; }},
  {key:'perfect',   icon:'🏆', test:function(xp,st,pd){ return pd; }}
];
function computeBadges(){
  var xp=totalXP(), st=overallStreaks();
  var perfectDay = Object.keys(log).some(function(k){ return dayCompletion(k).pct===100; });
  return BADGE_DEFS.map(function(b){ return {key:b.key, icon:b.icon, unlocked:b.test(xp,st,perfectDay)}; });
}

/* ---------------- backup / restore ---------------- */
function buildBackupObject(){
  return { app:'habito', version:1, exportedAt:new Date().toISOString(), habits:HABITS, log:log, cfg:cfg };
}
async function restoreFromBackup(obj){
  if(!obj || obj.app!=='habito' || !Array.isArray(obj.habits)) throw new Error('invalid file');
  var idMap = {}; // old habit id -> newly created habit id
  for(var i=0;i<obj.habits.length;i++){
    var h = obj.habits[i];
    var row = { user_id: currentUser.id, name:h.name, icon:h.icon, category:h.cat||'growth', sort_order: HABITS.length + i };
    var res = await sb.from('habits').insert(row).select().single();
    if(res.error) continue;
    var newHabit = { id:res.data.id, name:h.name, icon:h.icon, cat:h.cat||'growth' };
    HABITS.push(newHabit);
    if(h.id) idMap[h.id] = newHabit.id;
  }
  var days = Object.keys(obj.log || {});
  for(var d=0; d<days.length; d++){
    var dateKey = days[d];
    var dayObj = obj.log[dateKey] || {};
    var oldIds = Object.keys(dayObj);
    for(var k=0;k<oldIds.length;k++){
      var oldId = oldIds[k];
      var newId = idMap[oldId];
      if(!dayObj[oldId] || !newId) continue;
      await setDayHabit(dateKey, newId, true);
    }
  }
}
