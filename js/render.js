/* ==========================================================================
   RENDER — Home / Progress / Habits / Settings
   ========================================================================== */
"use strict";

var activeChip = 'All';
var catChartInstance = null, flowChartInstance = null;

/* ---------------- HOME ---------------- */
function renderHome(){
  var hr = new Date().getHours();
  var greetKey = hr<12 ? 'greetMorning' : (hr<18 ? 'greetAfternoon' : 'greetEvening');
  document.getElementById('homeGreeting').textContent = t(greetKey);
  var display = (currentUser && currentUser.name) || (currentUser && currentUser.email ? currentUser.email.split('@')[0] : t('guest'));
  document.getElementById('homeName').textContent = display;

  var key = todayKey();
  var c = dayCompletion(key);
  var C = 2*Math.PI*58;
  var fill = document.getElementById('ringFill');
  fill.setAttribute('stroke-dasharray', C.toFixed(1));
  fill.setAttribute('stroke-dashoffset', (C*(1-c.pct/100)).toFixed(1));
  animateNumber(document.getElementById('ringPct'), c.pct, '%');
  document.getElementById('ringSub').textContent = c.done + '/' + c.total;
  var msgKey = c.pct===0 ? 'ringMsgStart' : (c.pct>=100 ? 'ringMsgDone' : 'ringMsgMid');
  document.getElementById('heroMsg').textContent = t(msgKey);

  var st = overallStreaks();
  document.getElementById('streakChipNum').textContent = st.cur;

  var li = levelInfo();
  document.getElementById('levelChipNum').textContent = li.level;
  document.getElementById('levelTopLbl').textContent = t('lvl') + ' ' + li.level;
  document.getElementById('xpLabel').textContent = li.within + '/' + li.per + ' XP';
  document.getElementById('levelBarFill').style.width = li.pct + '%';

  renderAvatarInto('homeAvatarSlot', 30);
}

function renderChips(){
  var row = document.getElementById('chipRow');
  var cats = ['All'].concat(CATEGORY_KEYS.filter(function(c){ return HABITS.some(function(h){return h.cat===c;}); }));
  row.innerHTML = '';
  cats.forEach(function(cat){
    var chip = document.createElement('div');
    chip.className = 'chip' + (activeChip===cat?' active':'');
    chip.textContent = cat==='All' ? t('all') : catLabel(cat);
    chip.onclick = function(){ activeChip=cat; renderChips(); renderHabitList(); };
    row.appendChild(chip);
  });
}

function renderHabitList(){
  var key = todayKey();
  var dayObj = getDay(key);
  var list = document.getElementById('habitList');
  list.innerHTML = '';
  var visible = HABITS.filter(function(h){ return activeChip==='All' || h.cat===activeChip; });
  var doneCount = 0;
  HABITS.forEach(function(h){ if(dayObj[h.id]) doneCount++; });
  if(!HABITS.length){
    list.innerHTML = '<div class="empty-note">'+t('addHabit')+' →</div>';
  } else if(!visible.length){
    list.innerHTML = '<div class="empty-note">—</div>';
  }
  visible.forEach(function(h){
    var on = !!dayObj[h.id];
    var row = document.createElement('div');
    row.className = 'habit-row' + (on?' done':'');
    var st = habitStreak(h.id);
    row.innerHTML =
      '<div class="habit-icon">'+h.icon+'</div>'+
      '<div class="habit-mid"><div class="habit-name">'+escapeHtml(h.name)+'</div>'+
      '<div class="habit-meta"><span class="habit-cat">'+catLabel(h.cat)+'</span>'+
      (st.cur>0 ? '<span class="habit-streak">'+ICONS.flame('icon-sm')+' '+st.cur+'</span>' : '')+'</div></div>'+
      '<button class="check'+(on?' on':'')+'" aria-label="toggle"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    row.querySelector('.check').onclick = function(ev){ toggleHabit(h.id, ev); };
    row.addEventListener('contextmenu', function(ev){ ev.preventDefault(); openHabitModal('edit', h.id); });
    list.appendChild(row);
  });
  document.getElementById('habitsCap').textContent = doneCount + '/' + HABITS.length;
}

function toggleHabit(hid, ev){
  var key = todayKey();
  var next = !getDay(key)[hid];
  if(next && ev) burst(ev.clientX, ev.clientY);
  safeAction(async function(){
    await setDayHabit(key, hid, next);
  }).then(function(ok){
    if(!ok){ /* revert optimistic UI by re-rendering from true local state */ }
    renderHome(); renderHabitList(); renderProgressPage(); renderHabitsPage();
  });
}

function escapeHtml(s){
  var d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

/* ---------------- PROGRESS ---------------- */
function renderStats(){
  var st = overallStreaks();
  document.getElementById('statCur').textContent = st.cur;
  document.getElementById('statLong').textContent = st.longest;
  document.getElementById('statWeek').textContent = weekAverage() + '%';
  document.getElementById('statBest').textContent = bestDay();
}

function renderHeatmap(){
  var grid = document.getElementById('heatmap');
  grid.innerHTML = '';
  var ref = new Date();
  var year = ref.getFullYear(), month = ref.getMonth();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var firstWeekday = new Date(year, month, 1).getDay();
  for(var i=0;i<firstWeekday;i++){ var blank=document.createElement('div'); blank.style.visibility='hidden'; grid.appendChild(blank); }
  for(var day=1; day<=daysInMonth; day++){
    var d = new Date(year, month, day);
    var c = dayCompletion(dkey(d));
    var cell = document.createElement('div');
    cell.className = 'hcell' + (dkey(d)===todayKey() ? ' today':'');
    if(c.done>0){ cell.style.background='var(--a1)'; cell.style.opacity=Math.max(.25, c.pct/100); }
    grid.appendChild(cell);
  }
  document.getElementById('momentumCap').textContent = ref.toLocaleDateString(localeFor(),{month:'long', year:'numeric'});
}

function renderFlowChart(){
  var labels = [], data = [];
  var cursor = new Date(); cursor.setDate(cursor.getDate()-29);
  for(var i=0;i<30;i++){ data.push(dayCompletion(dkey(cursor)).pct); labels.push(cursor.getDate()); cursor.setDate(cursor.getDate()+1); }
  document.getElementById('flowVal').textContent = weekAverage() + '%';
  if(typeof Chart === 'undefined') return;
  try{
    var theme = THEME_LIST.find(function(th){ return th.key===cfg.theme; }) || THEME_LIST[0];
    var ctx = document.getElementById('flowChart').getContext('2d');
    var grad = ctx.createLinearGradient(0,0,0,150);
    grad.addColorStop(0, theme.c2 + 'CC');
    grad.addColorStop(.6, theme.c1 + '55');
    grad.addColorStop(1, theme.c1 + '00');
    if(flowChartInstance) flowChartInstance.destroy();
    flowChartInstance = new Chart(ctx, {
      type:'line',
      data:{ labels:labels, datasets:[{ data:data, borderColor:'#fff', borderWidth:2.5, backgroundColor:grad,
        fill:true, tension:.4, pointRadius:0, pointHoverRadius:4, pointBackgroundColor:theme.c2 }]},
      options:{ animation:{duration:500},
        plugins:{legend:{display:false}, tooltip:{callbacks:{label:function(c){return c.parsed.y+'%';}}}},
        scales:{ x:{display:false}, y:{display:false, min:0, max:100} } }
    });
  }catch(e){}
}

function renderRingsGrid(){
  var grid = document.getElementById('ringsGrid');
  grid.innerHTML = '';
  var C = 2*Math.PI*22;
  HABITS.forEach(function(h){
    var pct = habitAllTimeCompletion(h.id);
    var wrap = document.createElement('div');
    wrap.className = 'mini-ring';
    wrap.innerHTML =
      '<svg viewBox="0 0 54 54"><circle class="mtrack" cx="27" cy="27" r="22"/>'+
      '<circle class="mfill" cx="27" cy="27" r="22" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-pct/100)).toFixed(1)+'"/></svg>'+
      '<div class="micon">'+h.icon+'</div><div class="mpct">'+pct+'%</div>';
    grid.appendChild(wrap);
  });
}

function renderCategoryChart(){
  var data = CATEGORY_KEYS.map(function(cat){
    var hs = HABITS.filter(function(h){ return h.cat===cat; });
    if(!hs.length) return 0;
    var sum=0; hs.forEach(function(h){ sum+=habitAllTimeCompletion(h.id); });
    return Math.round(sum/hs.length);
  });
  var legend = document.getElementById('catLegend');
  legend.innerHTML = '';
  CATEGORY_KEYS.forEach(function(cat,i){
    if(!HABITS.some(function(h){return h.cat===cat;})) return;
    var row = document.createElement('div'); row.className='row';
    row.innerHTML = '<i style="background:'+CAT_COLORS[cat]+'"></i><span class="name">'+catLabel(cat)+'</span><span class="pct">'+data[i]+'%</span>';
    legend.appendChild(row);
  });
  if(typeof Chart === 'undefined') return;
  try{
    var ctx = document.getElementById('catChart').getContext('2d');
    var anyData = data.some(function(v){return v>0;});
    var chartData = anyData ? data : CATEGORY_KEYS.map(function(){return 1;});
    var borderCol = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#fff';
    if(catChartInstance) catChartInstance.destroy();
    catChartInstance = new Chart(ctx, {
      type:'doughnut',
      data:{ labels:CATEGORY_KEYS.map(catLabel), datasets:[{ data:chartData, backgroundColor:CATEGORY_KEYS.map(function(c){return CAT_COLORS[c];}),
        borderColor:borderCol, borderWidth:3, hoverOffset:4 }]},
      options:{ cutout:'68%', plugins:{legend:{display:false}, tooltip:{enabled:anyData}}, animation:{duration:450} }
    });
  }catch(e){}
}

function renderRewards(){
  var badges = computeBadges();
  var grid = document.getElementById('badgeGrid');
  grid.innerHTML = '';
  badges.forEach(function(b){
    var el = document.createElement('div');
    el.className = 'badge' + (b.unlocked?' unlocked':'');
    el.innerHTML = '<div class="bicon">'+(b.unlocked?b.icon:'🔒')+'</div><div class="bname">'+t('b_'+b.key)+'</div>';
    grid.appendChild(el);
  });
}

function renderProgressPage(){
  renderStats(); renderHeatmap(); renderFlowChart(); renderRingsGrid(); renderCategoryChart(); renderRewards();
}

/* ---------------- HABITS PAGE ---------------- */
function renderLeaderboard(){
  var arr = HABITS.map(function(h){ return { h:h, pct:habitAllTimeCompletion(h.id) }; });
  arr.sort(function(a,b){ return b.pct-a.pct; });
  var top = arr.slice(0,5);
  var medals = ['🥇','🥈','🥉'];
  var el = document.getElementById('leaderboard');
  el.innerHTML = '';
  if(!top.length){ el.innerHTML = '<div class="empty-note">—</div>'; return; }
  top.forEach(function(item,i){
    var row = document.createElement('div'); row.className='lb-row';
    row.innerHTML = '<div class="lb-rank">'+(medals[i]||(i+1))+'</div><div class="lb-icon">'+item.h.icon+'</div>'+
      '<div class="lb-name">'+escapeHtml(item.h.name)+'</div><div class="lb-bar-wrap"><div class="lb-bar" style="width:'+item.pct+'%"></div></div>'+
      '<div class="lb-pct">'+item.pct+'%</div>';
    el.appendChild(row);
  });
}
function renderMgrList(){
  var list = document.getElementById('mgrList');
  list.innerHTML = '';
  HABITS.forEach(function(h){
    var row = document.createElement('div'); row.className='mgr-row';
    row.innerHTML = '<div class="mgr-icon">'+h.icon+'</div><div class="mgr-name">'+escapeHtml(h.name)+'</div>'+
      '<button class="mgr-btn" data-edit="'+h.id+'">'+ICONS.pencil('icon-sm')+'</button>'+
      '<button class="mgr-btn del" data-del="'+h.id+'">'+ICONS.trash('icon-sm')+'</button>';
    list.appendChild(row);
  });
  list.querySelectorAll('[data-edit]').forEach(function(b){ b.onclick=function(){ openHabitModal('edit', b.dataset.edit); }; });
  list.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=function(){ requestDeleteHabit(b.dataset.del); }; });
}
function renderHabitsPage(){ renderLeaderboard(); renderMgrList(); }

/* ---------------- SETTINGS / ACCOUNT ---------------- */
function initialsOf(nameOrEmail){
  if(!nameOrEmail) return '🙂';
  var s = nameOrEmail.trim();
  if(s.indexOf('@')>-1) return s.charAt(0).toUpperCase();
  var parts = s.split(' ').filter(Boolean);
  return (parts[0]?parts[0].charAt(0):'').toUpperCase() + (parts[1]?parts[1].charAt(0).toUpperCase():'');
}
function avatarInnerHtml(){
  if(currentUser && currentUser.avatarUrl) return '<img src="'+currentUser.avatarUrl+'" alt="">';
  return initialsOf((currentUser && currentUser.name) || (currentUser && currentUser.email));
}
function renderAvatarInto(elId, sizePx){
  var el = document.getElementById(elId);
  if(!el) return;
  el.style.width = sizePx+'px'; el.style.height = sizePx+'px';
  el.innerHTML = avatarInnerHtml();
}

function renderSettings(){
  document.getElementById('settingsName').textContent = (currentUser && currentUser.name) || t('guest');
  document.getElementById('settingsEmail').textContent = (currentUser && currentUser.email) || t('guestMode');
  renderAvatarInto('settingsAvatar', 64);
  renderAvatarInto('accountAvatarPreview', 84);
  document.getElementById('accountNameInput').value = (currentUser && currentUser.name) || '';
  document.getElementById('accountEmailStatic').textContent = (currentUser && currentUser.email) || t('guestMode');
}

function renderModeButtons(){
  document.getElementById('modeLight').classList.toggle('active', cfg.mode==='light');
  document.getElementById('modeDark').classList.toggle('active', cfg.mode==='dark');
}
function renderThemeGrid(){
  var grid = document.getElementById('themeGrid');
  grid.innerHTML = '';
  THEME_LIST.forEach(function(th){
    var card = document.createElement('div');
    card.className = 'theme-card' + (cfg.theme===th.key?' active':'');
    card.innerHTML = '<div class="theme-swatch" style="background:linear-gradient(135deg,'+th.c1+','+th.c2+')"></div><div class="tname">'+t('th_'+th.key)+'</div>';
    card.onclick = function(){ cfg.theme=th.key; saveProfile(); applyTheme(); renderThemeGrid(); renderAll(); };
    grid.appendChild(card);
  });
}
function renderLangList(){
  var list = document.getElementById('langList');
  list.innerHTML = '';
  LANG_LIST.forEach(function(l){
    var item = document.createElement('div');
    item.className = 'lang-item' + (cfg.lang===l.key?' active':'');
    item.innerHTML = '<span class="flag">'+l.flag+'</span><span class="lname">'+l.name+'</span><span class="dot2"></span>';
    item.onclick = function(){ cfg.lang=l.key; saveProfile(); renderLangList(); renderThemeGrid(); renderAll(); };
    list.appendChild(item);
  });
}

function applyTheme(){
  document.documentElement.setAttribute('data-mode', cfg.mode);
  document.documentElement.setAttribute('data-theme', cfg.theme);
}

/* ---------------- RENDER ALL ---------------- */
function renderAll(){
  applyLang();
  renderHome(); renderChips(); renderHabitList();
  renderProgressPage();
  renderHabitsPage();
  renderSettings();
}
