export function generateHTML(draft) {
  const phase1 = draft.phase1 || {}
  const phase2 = draft.phase2 || {}
  const config = draft.generatedConfig || {}
  const capsuleData = draft.capsuleData || {}

  const primary = config.theme?.primary || '#C8706E'
  const secondary = config.theme?.secondary || '#FBF4E8'
  const accent = config.theme?.accent || '#EFC5C4'
  const appName = config.chosenName || 'Your Letter Box'
  const welcomeMsg = config.welcomeMessage || ''

  const weeklyCapsules = Array.from(
    { length: Number(phase1.regularCount) || 10 },
    (_, i) => {
      const d = new Date(phase1.startDate || Date.now())
      const days =
        phase1.unlockSchedule === 'Every day'
          ? i
          : phase1.unlockSchedule === 'Every two weeks'
            ? (i + 1) * 14
            : (i + 1) * 7
      d.setDate(d.getDate() + days)
      return {
        id: `w${i}`,
        label: `Week ${i + 1}`,
        emoji: '📅',
        unlockDate: d.toISOString().slice(0, 10),
        type: 'weekly',
      }
    },
  )

  const situationCapsules = (
    phase2.situationLabels ||
    config.situationLabels ||
    []
  ).map((s, i) => ({
    id: s.id || `s${i}`,
    label: s.label,
    emoji: s.emoji || '💛',
    hint: s.hint || '',
    type: 'situation',
  }))

  const timeline = (phase2.timeline || []).map((t) => ({
    date: t.date,
    label: t.label,
    emoji: t.emoji || '💛',
  }))

  const petConfig =
    phase2.petName && phase2.petAnimal !== 'none'
      ? { name: phase2.petName, animal: phase2.petAnimal }
      : null

  const seedData = {}
  Object.entries(capsuleData).forEach(([id, data]) => {
    seedData[`ltr_cap_${id}`] = JSON.stringify(data)
  })
  seedData.ltr_cfg = JSON.stringify({
    fromName: phase1.fromName,
    toName: phase1.toName,
    entryDate: phase1.startDate,
    returnDate: phase1.endDate,
    adminPw: phase1.adminPw || 'admin1234',
    appName,
  })
  seedData.ltr_export_id = Date.now().toString()

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>${escapeHtml(appName)} 📮</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${secondary};
  --primary:${primary};
  --accent:${accent};
  --warm-100:#F5E8D0;--warm-200:#E8D5B5;--warm-300:#D4BC95;
  --text:#2D1F14;--text-mid:#6B5040;--text-muted:#9B8070;
  --surface:#FFFFFF;--shadow:rgba(45,31,20,0.07);
}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding-bottom:80px;-webkit-font-smoothing:antialiased;}
.container{max-width:480px;margin:0 auto;padding:0 16px;position:relative;z-index:1}
.header{background:var(--bg);padding:24px 0 14px;text-align:center;position:sticky;top:0;z-index:10;border-bottom:1px solid var(--warm-200);margin-bottom:4px;}
.header-stamp{font-size:11px;letter-spacing:.15em;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;}
.header-title{font-family:'Playfair Display',serif;font-size:22px;color:var(--primary);letter-spacing:.06em;cursor:default;user-select:none;line-height:1.3;}
.header-sub{font-size:12px;color:var(--text-muted);margin-top:5px;letter-spacing:.02em;}
.export-btn{background:none;border:1px solid var(--warm-300);border-radius:100px;padding:5px 14px;font-size:12px;color:var(--text-muted);cursor:pointer;font-family:inherit;margin-top:10px;}
.dday-bar{background:var(--primary);color:white;text-align:center;padding:11px 16px;font-size:14px;margin:16px 0 24px;border-radius:14px;font-family:'Playfair Display',serif;letter-spacing:.04em;line-height:1.4;}
.tab-bar{display:flex;border-bottom:1px solid var(--warm-200);margin-bottom:24px;background:var(--bg);position:sticky;top:72px;z-index:9;}
.tab-btn{flex:1;padding:12px 0;background:none;border:none;border-bottom:2px solid transparent;font-size:14px;font-family:'Inter',sans-serif;color:var(--text-muted);cursor:pointer;transition:all .15s;letter-spacing:.02em;}
.tab-btn.active{color:var(--primary);border-bottom-color:var(--primary);font-weight:500;}
.section{margin-bottom:32px}
.section-title{font-size:11px;font-weight:500;color:var(--text-muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--warm-200);}
.capsule-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:12px;}
.capsule-card{background:var(--surface);border-radius:18px;padding:18px 12px 14px;text-align:center;border:1px solid var(--warm-200);box-shadow:0 2px 10px var(--shadow);cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,border-color .15s;position:relative;overflow:hidden;}
.capsule-card::after{content:'';position:absolute;bottom:0;right:0;width:18px;height:18px;background:linear-gradient(225deg,var(--warm-100) 50%,transparent 50%);}
.capsule-card:active{transform:scale(0.96)}
.capsule-card.locked{background:#EDEAE2;border-color:#DDD8CE;box-shadow:none;cursor:default;}
.capsule-card.unlocked:hover{box-shadow:0 6px 20px rgba(0,0,0,0.12);border-color:var(--accent);transform:translateY(-1px);}
.capsule-card.opened{border-color:var(--accent);background:#FFFAFA;}
.new-badge{position:absolute;top:10px;left:10px;background:var(--primary);color:white;font-size:9px;font-weight:500;padding:2px 7px;border-radius:100px;letter-spacing:.04em;}
.opened-badge{position:absolute;top:10px;right:10px;font-size:9px;color:var(--text-muted);background:var(--warm-100);padding:2px 6px;border-radius:100px;}
.envelope-icon{font-size:34px;margin-bottom:8px;display:block;line-height:1.2}
.capsule-card.locked .envelope-icon{filter:grayscale(.7);opacity:.55}
.capsule-label{font-size:13px;font-weight:500;font-family:'Playfair Display',serif;color:var(--text);margin-bottom:3px;line-height:1.3;}
.capsule-card.locked .capsule-label{color:#A09080}
.capsule-hint{font-size:10px;color:var(--text-muted);line-height:1.4;margin-bottom:4px;}
.capsule-status{font-size:10px;color:var(--text-muted);}
.capsule-card.unlocked:not(.opened) .capsule-status{color:var(--primary);font-weight:500;}
.content-dots{display:flex;justify-content:center;gap:4px;margin-top:8px;}
.dot{width:5px;height:5px;border-radius:50%;background:var(--warm-200);}
.dot.has{background:var(--accent);}
.overlay{display:none;position:fixed;inset:0;background:rgba(30,15,8,.55);z-index:100;align-items:flex-end;justify-content:center;}
.overlay.show{display:flex;}
.overlay.center{align-items:center;}
.sheet{background:var(--surface);width:100%;max-width:480px;max-height:92vh;border-radius:24px 24px 0 0;overflow-y:auto;animation:slideUp .3s cubic-bezier(.32,.72,0,1);}
.sheet.small{border-radius:20px;max-height:60vh;margin:0 16px;width:calc(100% - 32px);animation:fadeIn .22s ease;}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
.handle{width:40px;height:4px;background:var(--warm-200);border-radius:2px;margin:12px auto 18px;}
.sheet-body{padding:0 20px 36px;}
.view-header{text-align:center;margin-bottom:28px;}
.view-emoji{font-size:52px;margin-bottom:10px;}
.view-title{font-family:'Playfair Display',serif;font-size:21px;color:var(--primary);margin-bottom:5px;}
.view-date{font-size:11px;color:var(--text-muted);letter-spacing:.04em;}
.block-label{font-size:11px;font-weight:500;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px;margin-top:20px;}
.letter-block{background:var(--bg);border:1px solid var(--warm-200);border-radius:14px;padding:22px 20px;font-family:'Playfair Display',serif;font-size:15px;line-height:2;color:var(--text);white-space:pre-wrap;}
.photo-block{border-radius:14px;overflow:hidden;border:1px solid var(--warm-200);}
.photo-block img{width:100%;height:auto;display:block;}
.audio-player{background:var(--warm-100);border-radius:14px;padding:16px;display:flex;align-items:center;gap:12px;}
.play-btn{width:46px;height:46px;border-radius:50%;background:var(--primary);color:white;border:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.audio-track{flex:1;height:4px;background:var(--warm-300);border-radius:100px;cursor:pointer;}
.audio-fill{height:100%;background:var(--primary);border-radius:100px;transition:width .1s;}
.audio-time{font-size:12px;color:var(--text-muted);flex-shrink:0;}
.reply-section{margin-top:28px;border-top:1px solid var(--warm-200);padding-top:20px;}
.reply-title{font-size:11px;font-weight:500;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;}
.reply-input{width:100%;background:var(--bg);border:1px solid var(--warm-200);border-radius:14px;padding:14px 16px;font-family:'Playfair Display',serif;font-size:14px;line-height:1.85;color:var(--text);resize:none;min-height:100px;}
.reply-save-btn{width:100%;padding:12px;background:var(--primary);color:white;border:none;border-radius:14px;font-size:14px;font-weight:500;font-family:inherit;cursor:pointer;margin-top:10px;}
.admin-bar{position:fixed;bottom:0;left:0;right:0;background:var(--text);color:white;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;z-index:50;font-size:13px;}
.admin-exit{background:none;border:1px solid rgba(255,255,255,.3);color:white;padding:7px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-family:inherit;}
.btn{flex:1;padding:12px 16px;border-radius:14px;border:none;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:opacity .15s,transform .1s;}
.btn:active{opacity:.82;transform:scale(.98)}
.btn-primary{background:var(--primary);color:white;}
.btn-secondary{background:var(--warm-100);color:var(--text-mid);border:1px solid var(--warm-200);}
.btn-row{display:flex;gap:8px;margin-top:16px;}
.stats-section{margin-bottom:28px;}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.stat-card{background:var(--surface);border:1px solid var(--warm-200);border-radius:18px;padding:16px 14px;text-align:center;box-shadow:0 2px 8px var(--shadow);}
.stat-emoji{font-size:26px;margin-bottom:6px;display:block;}
.stat-value{font-family:'Playfair Display',serif;font-size:26px;color:var(--primary);font-weight:700;line-height:1.1;margin-bottom:4px;}
.stat-label{font-size:11px;color:var(--text-muted);line-height:1.4;}
.stat-card.joke{grid-column:1 / -1;background:#FFF8F8;border-color:var(--accent);display:flex;align-items:center;gap:14px;text-align:left;padding:14px 18px;}
.timeline{padding:8px 0 32px;position:relative;}
.timeline::before{content:'';position:absolute;left:28px;top:0;bottom:0;width:1.5px;background:var(--warm-200);}
.tl-item{display:flex;gap:16px;align-items:flex-start;margin-bottom:28px;position:relative;}
.tl-dot{width:56px;height:56px;border-radius:50%;background:var(--surface);border:1.5px solid var(--warm-200);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;position:relative;z-index:1;box-shadow:0 2px 8px var(--shadow);}
.tl-item.future .tl-dot{border-color:var(--primary);background:var(--primary);}
.tl-body{padding-top:10px;flex:1;}
.tl-date{font-size:11px;color:var(--text-muted);letter-spacing:.06em;margin-bottom:4px;}
.tl-label{font-family:'Playfair Display',serif;font-size:15px;color:var(--text);line-height:1.4;}
.tl-item.future .tl-label{color:var(--primary);font-weight:700;}
.tl-badge{display:inline-block;background:var(--accent);color:var(--primary);font-size:10px;padding:2px 8px;border-radius:100px;margin-top:5px;font-weight:500;}
.empty-msg{text-align:center;padding:32px 16px;color:var(--text-muted);font-size:14px;font-family:'Playfair Display',serif;line-height:1.8;}
.pw-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;}
.pw-icon{font-size:60px;margin-bottom:16px;}
.pw-title{font-family:'Playfair Display',serif;font-size:26px;color:var(--primary);margin-bottom:8px;}
.pw-desc{font-size:13px;color:var(--text-muted);line-height:1.8;margin-bottom:32px;max-width:280px;}
.form-input{width:100%;padding:12px 16px;border:1px solid var(--warm-200);border-radius:14px;font-size:14px;background:white;color:var(--text);font-family:inherit;margin-bottom:10px;}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--warm-300);border-radius:4px}
</style>
</head>
<body>
<div id="app"></div>
<div class="overlay" id="viewOverlay"><div class="sheet" id="viewSheet"><div class="handle"></div><div class="sheet-body" id="viewBody"></div></div></div>
<div class="overlay center" id="pwOverlay"><div class="sheet small"><div class="handle"></div><div class="sheet-body"><div style="text-align:center;margin-bottom:20px"><div style="font-size:28px;margin-bottom:8px">🔐</div><div style="font-family:'Playfair Display',serif;font-size:19px">Admin mode</div><div style="font-size:12px;color:var(--text-muted);margin-top:5px">Enter your password</div></div><input type="password" id="pwInput" class="form-input" placeholder="Password"><div id="pwErr" style="color:var(--primary);font-size:12px;text-align:center;display:none;margin-bottom:8px">Wrong password 🙅</div><div class="btn-row"><button class="btn btn-secondary" onclick="closePw()">Cancel</button><button class="btn btn-primary" onclick="checkPw()">Confirm</button></div></div></div></div>
<script>
const WEEKLY_CAPS = ${JSON.stringify(weeklyCapsules)};
const SITUATION_CAPS = ${JSON.stringify(situationCapsules)};
const TIMELINE_DATA = ${JSON.stringify(timeline)};
const PET_CONFIG = ${JSON.stringify(petConfig)};
const SEED_DATA = ${JSON.stringify(seedData)};
const APP_NAME = ${JSON.stringify(appName)};
const WELCOME_MSG = ${JSON.stringify(welcomeMsg)};
const FROM_NAME = ${JSON.stringify(phase1.fromName || '')};
const TO_NAME = ${JSON.stringify(phase1.toName || '')};
const RETURN_DATE = ${JSON.stringify(phase1.endDate || '')};

${getClientScript()}
</script>
</body>
</html>`
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getClientScript() {
  return `
let cfg = null;
let isAdmin = false;
let tapCount = 0;
let tapTimer = null;
let curId = null;
let audioEl = null;
let tab = 'letters';

const S = {
  cap: (id) => { try { return JSON.parse(localStorage.getItem('ltr_cap_'+id)) || {}; } catch { return {}; } },
  saveCap: (id,d) => { try { localStorage.setItem('ltr_cap_'+id,JSON.stringify(d)); return true; } catch { return false; } },
};

function loadSeedData() {
  if (!SEED_DATA || typeof SEED_DATA !== 'object') return;
  const exportId = SEED_DATA['ltr_export_id'];
  const storedId = localStorage.getItem('ltr_export_id');

  if (exportId !== storedId) {
    const preserve = {};
    Object.keys(localStorage).filter(k => k.startsWith('ltr_cap_')).forEach(k => {
      const d = JSON.parse(localStorage.getItem(k) || '{}');
      if (d.reply || d.opened) preserve[k] = { reply: d.reply, replyDate: d.replyDate, opened: d.opened };
    });

    Object.entries(SEED_DATA).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    Object.entries(preserve).forEach(([key, data]) => {
      const current = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...current, ...data }));
    });

    localStorage.setItem('ltr_export_id', exportId);
  }
}

function ddayText() {
  if (!RETURN_DATE) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const ret = new Date(RETURN_DATE);
  const diff = Math.ceil((ret - today) / 86400000);
  if (diff > 0) return 'Back in ' + diff + ' days 💌';
  if (diff === 0) return "They're back today! 🎉";
  return 'Back ' + Math.abs(diff) + ' days ago 💛';
}

function unlockDate(cap) {
  return cap.unlockDate ? new Date(cap.unlockDate) : null;
}

function isOpen(cap) {
  const d = unlockDate(cap);
  return !d || new Date() >= d;
}

function fmtDate(d) { return (d.getMonth()+1) + '/' + d.getDate(); }
function fmtTime(s) { return Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0'); }

function init() {
  loadSeedData();
  trackVisit();
  renderHome();
}

function trackVisit() {
  const today = new Date().toDateString();
  let d; try { d = JSON.parse(localStorage.getItem('ltr_visits')) || {count:0,lastDate:''}; } catch { d = {count:0,lastDate:''}; }
  if (d.lastDate !== today) { d.count += 1; d.lastDate = today; localStorage.setItem('ltr_visits', JSON.stringify(d)); }
}

function getVisitCount() { try { return JSON.parse(localStorage.getItem('ltr_visits'))?.count || 0; } catch { return 0; } }
function getReplyCount() {
  let c = 0;
  WEEKLY_CAPS.forEach(cap => { const d = S.cap(cap.id); if (d.reply?.trim()) c++; });
  SITUATION_CAPS.forEach(cap => { const d = S.cap(cap.id); if (d.reply?.trim()) c++; });
  return c;
}
function getFedCount() { try { return JSON.parse(localStorage.getItem('ltr_corgi'))?.feedCount || 0; } catch { return 0; } }

function renderHome() {
  const dd = ddayText();
  document.getElementById('app').innerHTML = \`
    <div class="container">
      <div class="header">
        <div class="header-stamp">From. \${FROM_NAME} ✈️ To. \${TO_NAME}</div>
        <div class="header-title" id="hTitle">\${APP_NAME} 📮</div>
        <div class="header-sub">\${WELCOME_MSG || TO_NAME + ', this is for you 💛'}</div>
        <button class="export-btn" onclick="exportFile()">📤 Export</button>
      </div>
      \${dd ? '<div class="dday-bar">' + dd + '</div>' : '<div style="height:16px"></div>'}
      <div class="tab-bar">
        <button class="tab-btn \${tab==='letters'?'active':''}" onclick="switchTab('letters')">💌 Letters</button>
        <button class="tab-btn \${tab==='timeline'?'active':''}" onclick="switchTab('timeline')">💛 Our Story</button>
      </div>
      \${tab === 'letters' ? renderLettersTab() : renderTimelineTab()}
    </div>
    \${isAdmin ? '<div class="admin-bar"><div>✏️ Edit mode — tap a card to fill it</div><button class="admin-exit" onclick="exitAdmin()">Done ✓</button></div>' : ''}
  \`;
  document.getElementById('hTitle').addEventListener('click', handleTap);
}

function renderLettersTab() {
  return \`
    <div class="section">
      <div class="section-title">📅 Weekly letters</div>
      <div class="capsule-grid">\${WEEKLY_CAPS.map(renderCard).join('')}</div>
    </div>
    <div class="section">
      <div class="section-title">💛 Open when...</div>
      <div class="capsule-grid">\${SITUATION_CAPS.map(renderCard).join('')}</div>
    </div>
  \`;
}

function renderCard(cap) {
  const data = S.cap(cap.id);
  const open = isOpen(cap);
  const ud = unlockDate(cap);
  const hasAny = data.letter || data.photo || data.voice;
  const state = !open ? 'locked' : data.opened ? 'opened' : 'unlocked';
  const onclick = isAdmin ? \`openEdit('\${cap.id}','\${cap.label}','\${cap.emoji}')\`
    : open ? \`openView('\${cap.id}','\${cap.label}','\${cap.emoji}')\` : '';
  return \`<div class="capsule-card \${state}\${isAdmin?' admin-mode':''}" \${onclick?'onclick="'+onclick+'"':''}>
    \${data.opened&&!isAdmin?'<div class="opened-badge">read</div>':''}
    \${open&&!data.opened&&!isAdmin&&hasAny?'<div class="new-badge">NEW</div>':''}
    <span class="envelope-icon">\${!open?'🔒':data.opened?'💌':'✉️'}</span>
    <div class="capsule-label">\${cap.label}</div>
    \${cap.hint?'<div class="capsule-hint">'+cap.hint+'</div>':''}
    <div class="capsule-status">\${!open&&ud?fmtDate(ud)+' unlocks':data.opened?'Already opened':'Open me!'}</div>
    \${hasAny?'<div class="content-dots"><div class="dot'+(data.letter?' has':'')+'"></div><div class="dot'+(data.photo?' has':'')+'"></div><div class="dot'+(data.voice?' has':'')+'"></div></div>':''}
  </div>\`;
}

function renderTimelineTab() {
  const visits = getVisitCount();
  const replies = getReplyCount();
  const fed = getFedCount();
  const thinks = (1000 + visits*847 + replies*213 + fed*157).toLocaleString() + '+';
  return \`
    <div class="stats-section">
      <div class="section-title">📊 Our records</div>
      <div class="stats-grid">
        <div class="stat-card"><span class="stat-emoji">📱</span><div class="stat-value">\${visits}</div><div class="stat-label">Times visited</div></div>
        <div class="stat-card"><span class="stat-emoji">✍️</span><div class="stat-value">\${replies}</div><div class="stat-label">Replies written</div></div>
        <div class="stat-card"><span class="stat-emoji">🐾</span><div class="stat-value">\${fed}/10</div><div class="stat-label">Pet fed</div></div>
        <div class="stat-card joke"><span class="stat-emoji" style="margin-bottom:0;flex-shrink:0">💭</span><div><div class="stat-value">\${thinks}</div><div class="stat-label">Times thought of you</div></div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Our story</div>
      <div class="timeline">
        \${TIMELINE_DATA.map(t => {
          const past = new Date(t.date) < new Date();
          return \`<div class="tl-item \${past?'past':'future'}">
            <div class="tl-dot">\${t.emoji||'💛'}</div>
            <div class="tl-body">
              <div class="tl-date">\${t.date}</div>
              <div class="tl-label">\${t.label}</div>
              \${!past?'<div class="tl-badge">waiting 💛</div>':''}
            </div>
          </div>\`;
        }).join('')}
      </div>
    </div>
  \`;
}

function switchTab(t) { tab = t; renderHome(); }

function openView(id, label, emoji) {
  const cap = S.cap(id);
  cap.opened = true; S.saveCap(id, cap);
  const hasAny = cap.letter || cap.photo || cap.voice;
  const today = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  let html = \`<div class="view-header"><div class="view-emoji">\${emoji}</div><div class="view-title">\${label}</div><div class="view-date">Opened \${today}</div></div>\`;
  if (!hasAny) {
    html += '<div class="empty-msg">This letter hasn\\'t been written yet 😢</div>';
  } else {
    if (cap.letter) html += '<div class="block-label">✉️ Letter</div><div class="letter-block">' + esc(cap.letter) + '</div>';
    if (cap.photo) html += '<div class="block-label" style="margin-top:20px">📷 Photo</div><div class="photo-block"><img src="' + cap.photo + '" alt=""></div>';
    if (cap.voice) html += '<div class="block-label" style="margin-top:20px">🎙️ Voice</div><div class="audio-player"><button class="play-btn" id="vPlayBtn" onclick="togglePlay()">▶</button><div class="audio-track" onclick="seekAudio(event)"><div class="audio-fill" id="vFill" style="width:0%"></div></div><div class="audio-time" id="vTime">0:00</div></div><audio id="vAudio" src="' + cap.voice + '" preload="metadata"></audio>';
  }
  html += \`<div class="reply-section"><div class="reply-title">✍️ My reply</div>\${cap.reply?'<div style="background:var(--bg);border:1px solid var(--warm-200);border-radius:14px;padding:16px;font-family:Playfair Display,serif;font-size:14px;line-height:1.9;white-space:pre-wrap;margin-bottom:8px;">'+esc(cap.reply)+'</div><div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;text-align:right">'+cap.replyDate+'</div>':''}<textarea class="reply-input" id="replyInput" placeholder="Write your reply here 💛">\${esc(cap.reply||'')}</textarea><button class="reply-save-btn" onclick="saveReply('\${id}')">Save reply 💾</button></div>\`;
  document.getElementById('viewBody').innerHTML = html;
  document.getElementById('viewOverlay').classList.add('show');
  if (cap.voice) {
    audioEl = document.getElementById('vAudio');
    audioEl.addEventListener('timeupdate', updateProgress);
    audioEl.addEventListener('ended', () => { document.getElementById('vPlayBtn').textContent='▶'; document.getElementById('vFill').style.width='0%'; audioEl.currentTime=0; });
  }
}

function togglePlay() { if(!audioEl)return; if(audioEl.paused){audioEl.play();document.getElementById('vPlayBtn').textContent='⏸';}else{audioEl.pause();document.getElementById('vPlayBtn').textContent='▶';} }
function seekAudio(e) { if(!audioEl||!audioEl.duration)return; const r=e.currentTarget.getBoundingClientRect(); audioEl.currentTime=((e.clientX-r.left)/r.width)*audioEl.duration; }
function updateProgress() { if(!audioEl)return; const p=audioEl.duration?(audioEl.currentTime/audioEl.duration*100):0; const f=document.getElementById('vFill'); const t=document.getElementById('vTime'); if(f)f.style.width=p+'%'; if(t)t.textContent=fmtTime(audioEl.currentTime); }

function saveReply(id) {
  const input = document.getElementById('replyInput'); if(!input)return;
  const cap = S.cap(id);
  cap.reply = input.value.trim();
  cap.replyDate = new Date().toLocaleString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  S.saveCap(id, cap);
}

document.getElementById('viewOverlay').addEventListener('click', function(e) {
  if(e.target===this){if(audioEl){audioEl.pause();audioEl=null;}this.classList.remove('show');renderHome();}
});

function handleTap() { if(isAdmin)return; tapCount++; clearTimeout(tapTimer); if(tapCount>=5){tapCount=0;showPw();}else{tapTimer=setTimeout(()=>tapCount=0,1500);} }
function showPw() { document.getElementById('pwOverlay').classList.add('show'); setTimeout(()=>document.getElementById('pwInput').focus(),150); }
function closePw() { document.getElementById('pwOverlay').classList.remove('show'); document.getElementById('pwInput').value=''; document.getElementById('pwErr').style.display='none'; }
function checkPw() { const pw=document.getElementById('pwInput').value; const stored=JSON.parse(localStorage.getItem('ltr_cfg')||'{}').adminPw||'admin1234'; if(pw===stored){closePw();isAdmin=true;renderHome();}else{document.getElementById('pwErr').style.display='block';} }
document.getElementById('pwInput').addEventListener('keydown',e=>{if(e.key==='Enter')checkPw();});
document.getElementById('pwOverlay').addEventListener('click',function(e){if(e.target===this)closePw();});
function exitAdmin(){isAdmin=false;renderHome();}

function exportFile() {
  const data={};
  Object.keys(localStorage).filter(k=>k.startsWith('ltr_')).forEach(k=>{data[k]=localStorage.getItem(k);});
  const html=document.documentElement.outerHTML;
  const newSeed='const SEED_DATA = '+JSON.stringify(data)+';';
  const updated=html.replace(/const SEED_DATA = .*?;/, newSeed);
  const blob=new Blob([updated],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=(APP_NAME||'letterbox').toLowerCase().replace(/\\s+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.html';
  a.click();
  URL.revokeObjectURL(url);
}

function esc(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function openEdit(id,label,emoji){}

init();
  `
}
