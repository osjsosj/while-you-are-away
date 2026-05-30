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

  const primaryAlpha15 = hexToRgba(primary, 0.15)
  const primaryAlpha08 = hexToRgba(primary, 0.08)

  const weeklyCapsules = Array.from(
    { length: Number(phase1.regularCount) || 10 },
    (_, i) => {
      const d = new Date(phase1.startDate || Date.now())
      const days = phase1.unlockSchedule === 'Every day' ? i
        : phase1.unlockSchedule === 'Every two weeks' ? (i + 1) * 14
        : (i + 1) * 7
      d.setDate(d.getDate() + days)
      return { id: `w${i}`, label: `Week ${i + 1}`, emoji: '📅', unlockDate: d.toISOString().slice(0, 10), type: 'weekly' }
    },
  )

  const situationCapsules = (phase2.situationLabels || config.situationLabels || []).map((s, i) => ({
    id: s.id || `s${i}`, label: s.label, emoji: s.emoji || '💛', hint: s.hint || '', type: 'situation',
  }))

  const timeline = (phase2.timeline || []).map((t) => ({
    date: t.date, label: t.label, emoji: t.emoji || '💛',
  }))

  // Build pet config from phase2 data
  const petConfig = buildPetConfig(phase2)

  const seedData = {}
  Object.entries(capsuleData).forEach(([id, data]) => {
    seedData[`ltr_cap_${id}`] = JSON.stringify(data)
  })
  seedData.ltr_cfg = JSON.stringify({
    fromName: phase1.fromName, toName: phase1.toName,
    entryDate: phase1.startDate, returnDate: phase1.endDate,
    adminPw: phase1.adminPw || 'admin1234', appName,
  })
  seedData.ltr_export_id = Date.now().toString()

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>${escapeHtml(appName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${secondary};
  --primary:${primary};
  --accent:${accent};
  --p15:${primaryAlpha15};
  --p08:${primaryAlpha08};
  --warm-100:#F5E8D0;--warm-200:#E8D5B5;--warm-300:#D4BC95;
  --text:#1A1008;--text-mid:#6B5040;--text-muted:#9B8070;
  --surface:#FFFDF9;--shadow:rgba(45,31,20,0.07);
}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding-bottom:80px;-webkit-font-smoothing:antialiased;}
.wrap{max-width:480px;margin:0 auto;}

/* HEADER */
.hdr{background:var(--primary);padding:26px 20px 20px;text-align:center;position:sticky;top:0;z-index:10;}
.hdr-from{font-size:10px;letter-spacing:.14em;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:8px;}
.hdr-name{font-family:'Playfair Display',serif;font-style:italic;font-size:26px;color:white;letter-spacing:-.02em;cursor:default;user-select:none;line-height:1.2;margin-bottom:5px;}
.hdr-sub{font-size:12px;color:rgba(255,255,255,.6);font-weight:300;line-height:1.6;}
.hdr-export{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:100px;padding:6px 16px;font-size:11px;color:white;cursor:pointer;font-family:'DM Sans',sans-serif;margin-top:14px;transition:background .2s;}
.hdr-export:hover{background:rgba(255,255,255,.22);}

/* D-DAY */
.dday{margin:14px 16px 4px;background:var(--surface);border:1px solid var(--accent);border-radius:14px;padding:12px 16px;font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:var(--primary);text-align:center;letter-spacing:-.01em;}

/* TABS */
.tabs{display:flex;background:var(--bg);border-bottom:1px solid var(--warm-200);position:sticky;top:105px;z-index:9;padding:0 16px;}
.tab{flex:1;padding:13px 0;background:none;border:none;border-bottom:2px solid transparent;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-muted);cursor:pointer;transition:all .15s;}
.tab.on{color:var(--primary);border-bottom-color:var(--primary);font-weight:500;}

/* SECTIONS */
.sec{padding:20px 16px 0;}
.sec-label{font-size:10px;color:var(--text-muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--warm-200);}

/* CAPSULE GRID */
.cap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:10px;margin-bottom:24px;}
.cap{background:var(--surface);border-radius:20px;padding:18px 12px 14px;text-align:center;border:1px solid var(--warm-200);cursor:pointer;transition:all .18s;position:relative;overflow:hidden;}
.cap.locked{background:#EDEAE2;border-color:#DDD8CE;cursor:default;opacity:.6;}
.cap.unlocked:hover{box-shadow:0 6px 20px var(--p15);border-color:var(--accent);transform:translateY(-2px);}
.cap.opened{border-color:var(--accent);background:var(--p08);}
.cap:active:not(.locked){transform:scale(.96);}
.cap-new{position:absolute;top:10px;left:10px;background:var(--primary);color:white;font-size:9px;padding:2px 7px;border-radius:100px;}
.cap-read{position:absolute;top:10px;right:10px;background:var(--warm-100);color:var(--text-muted);font-size:9px;padding:2px 6px;border-radius:100px;}
.cap-icon{font-size:32px;margin-bottom:8px;display:block;line-height:1.2;}
.cap-lbl{font-family:'Playfair Display',serif;font-style:italic;font-size:13px;color:var(--text);margin-bottom:3px;line-height:1.3;}
.cap.locked .cap-lbl{color:#A09080;}
.cap-hint{font-size:10px;color:var(--text-muted);line-height:1.4;margin-bottom:3px;font-weight:300;}
.cap-st{font-size:10px;color:var(--text-muted);font-weight:300;}
.cap.unlocked:not(.opened) .cap-st{color:var(--primary);font-weight:500;}
.dots{display:flex;justify-content:center;gap:4px;margin-top:8px;}
.dot{width:5px;height:5px;border-radius:50%;background:var(--warm-200);}
.dot.on{background:var(--primary);}

/* STATS */
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
.stat{background:var(--surface);border:1px solid var(--warm-200);border-radius:20px;padding:16px 12px;text-align:center;}
.stat-ico{font-size:24px;margin-bottom:8px;display:block;}
.stat-val{font-family:'Playfair Display',serif;font-style:italic;font-size:28px;color:var(--primary);line-height:1;margin-bottom:5px;}
.stat-nm{font-size:10px;color:var(--text-muted);line-height:1.4;font-weight:300;}
.stat.wide{grid-column:1/-1;display:flex;align-items:center;gap:14px;text-align:left;padding:14px 18px;background:var(--p08);border-color:var(--accent);}

/* TIMELINE */
.tl-wrap{position:relative;padding-top:4px;}
.tl-wrap::before{content:'';position:absolute;left:19px;top:0;bottom:0;width:1.5px;background:var(--warm-200);}
.tl-item{display:flex;gap:14px;align-items:flex-start;margin-bottom:24px;position:relative;}
.tl-dot{width:40px;height:40px;border-radius:50%;background:var(--surface);border:1.5px solid var(--warm-200);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;position:relative;z-index:1;}
.tl-item.future .tl-dot{border-color:var(--primary);background:var(--primary);}
.tl-body{padding-top:6px;}
.tl-date{font-size:10px;color:var(--text-muted);letter-spacing:.04em;margin-bottom:3px;font-weight:300;}
.tl-lbl{font-family:'Playfair Display',serif;font-size:15px;color:var(--text);line-height:1.4;}
.tl-item.future .tl-lbl{color:var(--primary);}
.tl-badge{display:inline-block;background:var(--accent);color:var(--primary);font-size:10px;padding:2px 8px;border-radius:100px;margin-top:5px;}

/* PET */
.pet-section{background:var(--surface);border:1px solid var(--warm-200);border-radius:20px;margin:0 16px 24px;}
@keyframes petFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

/* OVERLAYS */
.ov{display:none;position:fixed;inset:0;background:rgba(26,16,8,.6);backdrop-filter:blur(4px);z-index:100;align-items:flex-end;justify-content:center;}
.ov.show{display:flex;}
.ov.center{align-items:center;}
.sheet{background:var(--surface);width:100%;max-width:480px;max-height:92vh;border-radius:28px 28px 0 0;overflow-y:auto;animation:slideUp .3s cubic-bezier(.32,.72,0,1);}
.sheet.sm{border-radius:20px;max-height:65vh;margin:0 16px;width:calc(100% - 32px);animation:fadeSheet .22s ease;}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fadeSheet{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
.handle{width:36px;height:4px;background:var(--warm-200);border-radius:2px;margin:12px auto 16px;}
.sbody{padding:0 20px 36px;}

/* LETTER VIEW */
.v-hdr{text-align:center;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--warm-100);}
.v-emoji{font-size:48px;margin-bottom:10px;display:block;}
.v-title{font-family:'Playfair Display',serif;font-style:italic;font-size:24px;color:var(--primary);letter-spacing:-.01em;margin-bottom:4px;}
.v-date{font-size:11px;color:var(--text-muted);font-weight:300;}
.blk-lbl{font-size:10px;color:var(--text-muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;margin-top:20px;}
.letter{background:var(--bg);border:1px solid var(--warm-200);border-radius:16px;padding:20px 18px;font-family:'Playfair Display',serif;font-size:15px;line-height:2.1;color:var(--text);white-space:pre-wrap;}
.photo{border-radius:16px;overflow:hidden;border:1px solid var(--warm-200);}
.photo img{width:100%;height:auto;display:block;}
.audio-p{background:var(--bg);border:1px solid var(--warm-200);border-radius:16px;padding:16px;display:flex;align-items:center;gap:12px;}
.play{width:44px;height:44px;border-radius:50%;background:var(--primary);color:white;border:none;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px var(--p15);}
.audio-track{flex:1;height:3px;background:var(--warm-200);border-radius:100px;cursor:pointer;}
.audio-fill{height:100%;background:var(--primary);border-radius:100px;transition:width .1s;}
.audio-time{font-size:12px;color:var(--text-muted);flex-shrink:0;font-weight:300;}

/* REPLY */
.reply-wrap{margin-top:24px;border-top:1px solid var(--warm-100);padding-top:18px;}
.reply-lbl{font-size:10px;color:var(--text-muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;}
.reply-prev{background:var(--bg);border:1px solid var(--warm-200);border-radius:14px;padding:16px;font-family:'Playfair Display',serif;font-size:14px;line-height:1.9;white-space:pre-wrap;margin-bottom:6px;}
.reply-date{font-size:11px;color:var(--text-muted);text-align:right;margin-bottom:10px;font-weight:300;}
.reply-ta{width:100%;background:var(--bg);border:1px solid var(--warm-200);border-radius:14px;padding:14px 16px;font-family:'Playfair Display',serif;font-size:14px;line-height:1.85;color:var(--text);resize:none;min-height:100px;outline:none;transition:border-color .2s;}
.reply-ta:focus{border-color:var(--accent);}
.reply-save{width:100%;padding:13px;background:var(--primary);color:white;border:none;border-radius:14px;font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;margin-top:10px;transition:opacity .2s;}
.reply-save:active{opacity:.8;}

/* MISC */
.empty{text-align:center;padding:40px 16px;color:var(--text-muted);font-family:'Playfair Display',serif;font-style:italic;font-size:15px;line-height:1.8;}
.btn{flex:1;padding:13px;border-radius:14px;border:none;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;}
.btn:active{opacity:.82;transform:scale(.98);}
.btn-p{background:var(--primary);color:white;}
.btn-s{background:var(--warm-100);color:var(--text-mid);border:1px solid var(--warm-200);}
.btn-row{display:flex;gap:8px;margin-top:16px;}
.form-in{width:100%;padding:12px 16px;border:1px solid var(--warm-200);border-radius:14px;font-size:14px;background:white;color:var(--text);font-family:'DM Sans',sans-serif;outline:none;margin-bottom:10px;transition:border-color .2s;}
.form-in:focus{border-color:var(--accent);}
.admin-bar{position:fixed;bottom:0;left:0;right:0;background:var(--text);color:white;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;z-index:50;}
.admin-exit{background:none;border:1px solid rgba(255,255,255,.3);color:white;padding:7px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--warm-300);border-radius:4px}
</style>
</head>
<body>
<div id="app"></div>

<!-- Letter view overlay -->
<div class="ov" id="viewOv"><div class="sheet" id="viewSheet"><div class="handle"></div><div class="sbody" id="viewBody"></div></div></div>

<!-- Admin password overlay -->
<div class="ov center" id="pwOv"><div class="sheet sm"><div class="handle"></div><div class="sbody">
  <div style="text-align:center;margin-bottom:20px">
    <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-style:italic;font-size:18px;color:white;">W</div>
    <div style="font-family:'Playfair Display',serif;font-style:italic;font-size:20px;">Admin mode</div>
    <div style="font-size:12px;color:var(--text-muted);margin-top:4px;font-weight:300;">Enter your password</div>
  </div>
  <input type="password" id="pwIn" class="form-in" placeholder="Password">
  <div id="pwErr" style="color:var(--primary);font-size:12px;text-align:center;display:none;margin-bottom:8px;">Wrong password</div>
  <div class="btn-row"><button class="btn btn-s" onclick="closePw()">Cancel</button><button class="btn btn-p" onclick="checkPw()">Confirm</button></div>
</div></div></div>

<script>
const WEEKLY_CAPS   = ${JSON.stringify(weeklyCapsules)};
const SITUATION_CAPS = ${JSON.stringify(situationCapsules)};
const TIMELINE_DATA = ${JSON.stringify(timeline)};
const PET_CONFIG    = ${JSON.stringify(petConfig)};
const SEED_DATA     = ${JSON.stringify(seedData)};
const APP_NAME      = ${JSON.stringify(appName)};
const WELCOME_MSG   = ${JSON.stringify(welcomeMsg)};
const FROM_NAME     = ${JSON.stringify(phase1.fromName || '')};
const TO_NAME       = ${JSON.stringify(phase1.toName || '')};
const RETURN_DATE   = ${JSON.stringify(phase1.endDate || '')};

${getClientScript()}
</script>
</body>
</html>`
}

function buildPetConfig(phase2) {
  const { petAnimal, petName, petDescription } = phase2 || {}
  if (!petAnimal || ['none','no'].includes((petAnimal||'').toLowerCase())) return null

  const desc = (petDescription || '').toLowerCase()
  const animal = (petAnimal || '').toLowerCase()

  const colorMap = {
    black:'#2C2C2C', white:'#F5F5F5', brown:'#8B5E3C', golden:'#E8A85A',
    yellow:'#E8C45A', orange:'#E8803C', gray:'#9B9B9B', grey:'#9B9B9B',
    cream:'#F5DEB3', red:'#C8706E', tan:'#D2B48C', chocolate:'#6B3D2E',
    ginger:'#C87832', calico:'#E8A85A', tabby:'#9B8070',
  }
  const extractColor = (d) => {
    for (const [k,v] of Object.entries(colorMap)) if (d.includes(k)) return v
    return null
  }

  if (['dog','corgi','retriever','labrador','poodle','beagle'].some(w => animal.includes(w))) {
    return {
      type: 'dog', name: petName || 'Buddy',
      color: extractColor(desc) || '#E8A85A',
      earType: ['floppy','droopy','hang'].some(w => desc.includes(w)) ? 'floppy' : 'up',
    }
  }
  if (['cat','kitten'].some(w => animal.includes(w))) {
    return {
      type: 'cat', name: petName || 'Luna',
      bodyColor: extractColor(desc) || '#888888',
      patternType: desc.includes('tabby')||desc.includes('striped') ? 'tabby'
        : desc.includes('bicolor')||desc.includes('tuxedo')||desc.includes('white') ? 'bicolor' : 'solid',
      eyeColor: desc.includes('blue') ? '#4B9FD4'
        : desc.includes('green') ? '#4CAF50'
        : desc.includes('yellow')||desc.includes('amber') ? '#F5A623' : '#4CAF50',
    }
  }
  return { type: 'dog', name: petName || 'Buddy', color: '#E8A85A', earType: 'up' }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${alpha})`
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function getClientScript() {
  return `
// ── CORE STATE ─────────────────────────────────────────────────
let isAdmin = false, tapCount = 0, tapTimer = null, audioEl = null, tab = 'letters';

const S = {
  cap:(id)=>{ try{return JSON.parse(localStorage.getItem('ltr_cap_'+id))||{};}catch{return{};} },
  saveCap:(id,d)=>{ try{localStorage.setItem('ltr_cap_'+id,JSON.stringify(d));}catch{} },
};

// ── SEED DATA ──────────────────────────────────────────────────
function loadSeed() {
  if(!SEED_DATA||typeof SEED_DATA!=='object') return;
  const xid=SEED_DATA['ltr_export_id'], sid=localStorage.getItem('ltr_export_id');
  if(xid===sid) return;
  const preserve={};
  Object.keys(localStorage).filter(k=>k.startsWith('ltr_cap_')).forEach(k=>{
    const d=JSON.parse(localStorage.getItem(k)||'{}');
    if(d.reply||d.opened) preserve[k]={reply:d.reply,replyDate:d.replyDate,opened:d.opened};
  });
  Object.entries(SEED_DATA).forEach(([k,v])=>localStorage.setItem(k,v));
  Object.entries(preserve).forEach(([k,data])=>{
    const cur=JSON.parse(localStorage.getItem(k)||'{}');
    localStorage.setItem(k,JSON.stringify({...cur,...data}));
  });
  localStorage.setItem('ltr_export_id',xid);
}

// ── HELPERS ────────────────────────────────────────────────────
function ddayText(){
  if(!RETURN_DATE) return null;
  const today=new Date(); today.setHours(0,0,0,0);
  const diff=Math.ceil((new Date(RETURN_DATE)-today)/86400000);
  if(diff>0) return diff+' days until they\\'re back 💌';
  if(diff===0) return "They\\'re back today! 🎉";
  return 'Back '+Math.abs(diff)+' days ago 💛';
}
function isOpen(cap){ return !cap.unlockDate||new Date()>=new Date(cap.unlockDate); }
function fmtDate(s){ const d=new Date(s); return (d.getMonth()+1)+'/'+d.getDate(); }
function fmtTime(s){ return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'); }
function esc(s){ if(!s)return''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── VISIT TRACKING ─────────────────────────────────────────────
function trackVisit(){
  const today=new Date().toDateString();
  let d; try{d=JSON.parse(localStorage.getItem('ltr_visits'))||{count:0,lastDate:''};}catch{d={count:0,lastDate:''};}
  if(d.lastDate!==today){d.count+=1;d.lastDate=today;localStorage.setItem('ltr_visits',JSON.stringify(d));}
}
function getVisitCount(){ try{return JSON.parse(localStorage.getItem('ltr_visits'))?.count||0;}catch{return 0;} }
function getReplyCount(){ let c=0;[...WEEKLY_CAPS,...SITUATION_CAPS].forEach(cap=>{if(S.cap(cap.id).reply?.trim())c++;});return c; }

// ── PET SYSTEM ─────────────────────────────────────────────────
function shadeHex(hex,amt){
  const n=parseInt(hex.replace('#',''),16);
  const r=Math.min(255,Math.max(0,(n>>16)+amt));
  const g=Math.min(255,Math.max(0,((n>>8)&0xff)+amt));
  const b=Math.min(255,Math.max(0,(n&0xff)+amt));
  return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}

function dogSVG(cfg,fc){
  const c=cfg.color||'#E8A85A',et=cfg.earType||'up';
  const dk=shadeHex(c,-30),lt=shadeHex(c,35);
  const h=fc>=5,lv=fc>=9,sc=0.8+fc*0.02;
  const tY=Math.max(42,50-fc),tR=-15-fc*2;
  const eyeL=lv?'<text x="38" y="32" font-size="9" text-anchor="middle" fill="#C8706E">♥</text>'
    :'<circle cx="38" cy="28" r="'+(h?2.8:2.5)+'" fill="#3D2B1F"/><circle cx="39.2" cy="27" r="1" fill="white"/>'+(h?'<path d="M35,32 Q38,35 41,32" stroke="#3D2B1F" stroke-width="1" fill="none" stroke-linecap="round"/>':'');
  const eyeR=lv?'<text x="62" y="32" font-size="9" text-anchor="middle" fill="#C8706E">♥</text>'
    :'<circle cx="62" cy="28" r="'+(h?2.8:2.5)+'" fill="#3D2B1F"/><circle cx="63.2" cy="27" r="1" fill="white"/>'+(h?'<path d="M59,32 Q62,35 65,32" stroke="#3D2B1F" stroke-width="1" fill="none" stroke-linecap="round"/>':'');
  const ears=et==='up'
    ?'<polygon points="30,22 22,3 42,18" fill="'+dk+'"/><polygon points="70,22 78,3 58,18" fill="'+dk+'"/><polygon points="31,20 25,7 40,17" fill="#EFC5C4" opacity="0.6"/><polygon points="69,20 75,7 60,17" fill="#EFC5C4" opacity="0.6"/>'
    :'<ellipse cx="26" cy="24" rx="8" ry="12" fill="'+dk+'" transform="rotate(-15,26,24)"/><ellipse cx="74" cy="24" rx="8" ry="12" fill="'+dk+'" transform="rotate(15,74,24)"/><ellipse cx="26" cy="24" rx="5" ry="9" fill="#EFC5C4" opacity="0.5" transform="rotate(-15,26,24)"/><ellipse cx="74" cy="24" rx="5" ry="9" fill="#EFC5C4" opacity="0.5" transform="rotate(15,74,24)"/>';
  const w=Math.round(100*sc),ht=Math.round(85*sc);
  return'<svg width="'+w+'" height="'+ht+'" viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">'
    +(lv?'<text x="50" y="6" font-size="8" text-anchor="middle">✨</text>':'')
    +'<ellipse cx="80" cy="'+tY+'" rx="7" ry="5" fill="'+dk+'" transform="rotate('+tR+',80,'+tY+')"/>'
    +'<ellipse cx="50" cy="58" rx="30" ry="20" fill="'+c+'"/>'
    +'<ellipse cx="50" cy="62" rx="18" ry="12" fill="'+lt+'"/>'
    +'<rect x="30" y="70" width="9" height="12" rx="4.5" fill="'+dk+'"/><rect x="42" y="70" width="9" height="12" rx="4.5" fill="'+dk+'"/><rect x="52" y="70" width="9" height="12" rx="4.5" fill="'+dk+'"/><rect x="64" y="70" width="9" height="12" rx="4.5" fill="'+dk+'"/>'
    +'<circle cx="50" cy="30" r="20" fill="'+c+'"/>'+ears
    +'<ellipse cx="50" cy="34" rx="13" ry="11" fill="'+lt+'"/>'
    +eyeL+eyeR
    +'<ellipse cx="50" cy="38" rx="3.5" ry="2.5" fill="#3D2B1F"/>'
    +'<path d="'+(lv?'M44,36 Q50,42 56,36':'M46,36 Q50,39 54,36')+'" stroke="#3D2B1F" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
    +'</svg>';
}

function catSVG(cfg,fc){
  const c=cfg.bodyColor||'#888888',pt=cfg.patternType||'solid',ec=cfg.eyeColor||'#4CAF50';
  const dk=shadeHex(c,-35),lt=shadeHex(c,40);
  const h=fc>=5,lv=fc>=9,sc=0.8+fc*0.02;
  const tailP=lv?'M75,70 Q95,50 90,30 Q88,20 82,25':'M75,70 Q90,60 88,45';
  const stripes=pt==='tabby'
    ?'<path d="M34,55 Q40,50 46,55" stroke="'+dk+'" stroke-width="1.5" fill="none" opacity="0.5"/><path d="M54,55 Q60,50 66,55" stroke="'+dk+'" stroke-width="1.5" fill="none" opacity="0.5"/><path d="M44,14 Q50,11 56,14" stroke="'+dk+'" stroke-width="1" fill="none" opacity="0.6"/><path d="M46,18 Q50,15 54,18" stroke="'+dk+'" stroke-width="1" fill="none" opacity="0.5"/>'
    :pt==='bicolor'?'<ellipse cx="38" cy="58" rx="10" ry="12" fill="white" opacity="0.7"/>':'';
  const eyes=lv
    ?'<text x="38" y="32" font-size="9" text-anchor="middle" fill="#C8706E">♥</text><text x="62" y="32" font-size="9" text-anchor="middle" fill="#C8706E">♥</text>'
    :'<ellipse cx="38" cy="28" rx="'+(h?3.5:3)+'" ry="'+(h?3:3.5)+'" fill="'+ec+'"/><circle cx="38" cy="28" r="1.8" fill="#111"/><circle cx="39" cy="27" r="0.8" fill="white"/><ellipse cx="62" cy="28" rx="'+(h?3.5:3)+'" ry="'+(h?3:3.5)+'" fill="'+ec+'"/><circle cx="62" cy="28" r="1.8" fill="#111"/><circle cx="63" cy="27" r="0.8" fill="white"/>';
  const w=Math.round(100*sc),ht=Math.round(90*sc);
  return'<svg width="'+w+'" height="'+ht+'" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">'
    +(lv?'<text x="50" y="6" font-size="8" text-anchor="middle">✨</text>':'')
    +'<path d="'+tailP+'" stroke="'+dk+'" stroke-width="5" fill="none" stroke-linecap="round"/>'
    +'<ellipse cx="50" cy="60" rx="26" ry="20" fill="'+c+'"/>'
    +'<ellipse cx="50" cy="64" rx="14" ry="11" fill="'+lt+'"/>'+stripes
    +'<rect x="31" y="72" width="8" height="13" rx="4" fill="'+dk+'"/><rect x="42" y="72" width="8" height="13" rx="4" fill="'+dk+'"/><rect x="52" y="72" width="8" height="13" rx="4" fill="'+dk+'"/><rect x="63" y="72" width="8" height="13" rx="4" fill="'+dk+'"/>'
    +'<circle cx="50" cy="30" r="19" fill="'+c+'"/>'
    +'<polygon points="32,18 26,2 44,15" fill="'+c+'"/><polygon points="68,18 74,2 56,15" fill="'+c+'"/>'
    +'<polygon points="33,17 28,5 42,14" fill="#EFC5C4" opacity="0.7"/><polygon points="67,17 72,5 58,14" fill="#EFC5C4" opacity="0.7"/>'
    +'<ellipse cx="50" cy="34" rx="12" ry="10" fill="'+lt+'"/>'+eyes
    +'<polygon points="50,36 48,38 52,38" fill="#E8938A"/>'
    +'<line x1="25" y1="37" x2="42" y2="38" stroke="'+dk+'" stroke-width="0.7" opacity="0.5"/>'
    +'<line x1="25" y1="40" x2="42" y2="40" stroke="'+dk+'" stroke-width="0.7" opacity="0.4"/>'
    +'<line x1="58" y1="38" x2="75" y2="37" stroke="'+dk+'" stroke-width="0.7" opacity="0.5"/>'
    +'<line x1="58" y1="40" x2="75" y2="40" stroke="'+dk+'" stroke-width="0.7" opacity="0.4"/>'
    +'<path d="'+(h?'M46,39 Q50,43 54,39':'M47,39 Q50,41 53,39')+'" stroke="'+dk+'" stroke-width="1" fill="none" stroke-linecap="round"/>'
    +'</svg>';
}

function petSVG(cfg,fc){ if(!cfg)return''; return cfg.type==='cat'?catSVG(cfg,fc):dogSVG(cfg,fc); }

function getPetData(){ try{return JSON.parse(localStorage.getItem('ltr_corgi'))||{feedCount:0,lastFed:null};}catch{return{feedCount:0,lastFed:null};} }
function savePetData(d){ try{localStorage.setItem('ltr_corgi',JSON.stringify(d));}catch{} }
function canFeedToday(lastFed){ if(!lastFed)return true; return Math.floor((new Date()-new Date(lastFed))/(1000*60*60*24))>=7; }
function petMood(fc){
  if(fc>=9) return{text:'Over the moon ✨',col:'var(--primary)'};
  if(fc>=7) return{text:'So happy!',col:'var(--primary)'};
  if(fc>=5) return{text:'Happy & growing',col:'var(--text-mid)'};
  if(fc>=3) return{text:'Doing well',col:'var(--text-mid)'};
  if(fc>=1) return{text:'Needs some love',col:'var(--text-muted)'};
  return{text:'Hungry...',col:'var(--text-muted)'};
}

function feedPet(){
  const d=getPetData();
  const feedMsg=document.getElementById('feedMsg');
  if(!canFeedToday(d.lastFed)){
    const last=new Date(d.lastFed), next=new Date(last.getTime()+7*24*60*60*1000);
    const days=Math.ceil((next-new Date())/(1000*60*60*24));
    if(feedMsg){feedMsg.textContent='Come back in '+days+' day'+(days>1?'s':'')+'!';feedMsg.style.opacity='1';setTimeout(()=>{if(feedMsg)feedMsg.style.opacity='0';},3000);}
    return;
  }
  if(d.feedCount>=10){
    if(feedMsg){feedMsg.textContent='Already fully grown and loved! 🌟';feedMsg.style.opacity='1';setTimeout(()=>{if(feedMsg)feedMsg.style.opacity='0';},3000);}
    return;
  }
  d.feedCount=Math.min(10,d.feedCount+1);
  d.lastFed=new Date().toISOString();
  savePetData(d);
  renderPet();
  if(feedMsg){feedMsg.textContent=d.feedCount>=10?'✨ Fully grown! So loved.':'🍖 Fed! Come back next week.';feedMsg.style.opacity='1';setTimeout(()=>{if(feedMsg)feedMsg.style.opacity='0';},3000);}
}

function renderPet(){
  const el=document.getElementById('petSection');
  if(!el||!PET_CONFIG) return;
  const d=getPetData(), m=petMood(d.feedCount);
  const canFeed=canFeedToday(d.lastFed)&&d.feedCount<10;
  const pct=Math.round((d.feedCount/10)*100);
  el.innerHTML='<div style="text-align:center;padding:28px 20px 22px;">'
    +'<div style="display:inline-block;animation:petFloat 3.5s ease-in-out infinite;" id="petSvg">'+petSVG(PET_CONFIG,d.feedCount)+'</div>'
    +'<div style="margin-top:14px;font-family:\\'Playfair Display\\',serif;font-style:italic;font-size:20px;color:var(--text);">'+PET_CONFIG.name+'</div>'
    +'<div style="font-size:12px;color:'+m.col+';margin-top:4px;font-weight:300;">'+m.text+'</div>'
    +'<div style="margin:14px auto 0;max-width:160px;">'
    +'<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:5px;font-weight:300;"><span>Growth</span><span>'+d.feedCount+'/10</span></div>'
    +'<div style="height:4px;background:var(--warm-200);border-radius:4px;"><div style="height:100%;width:'+pct+'%;background:var(--primary);border-radius:4px;transition:width .5s ease;"></div></div>'
    +'</div>'
    +'<button onclick="feedPet()" style="margin-top:18px;padding:11px 28px;background:'+(canFeed?'var(--primary)':'var(--warm-200)')+';color:'+(canFeed?'white':'var(--text-muted)')+';border:none;border-radius:100px;font-size:13px;font-family:\\'DM Sans\\',sans-serif;font-weight:500;cursor:'+(canFeed?'pointer':'default')+';transition:all .2s;">'
    +(d.feedCount>=10?'Fully grown 🌟':canFeed?'Feed '+PET_CONFIG.name+' 🍖':'Fed this week ✓')+'</button>'
    +'<div id="feedMsg" style="font-size:12px;color:var(--text-muted);margin-top:10px;font-weight:300;opacity:0;transition:opacity .3s;min-height:18px;"></div>'
    +'</div>';
}

// ── RENDER ─────────────────────────────────────────────────────
function renderHome(){
  const dd=ddayText();
  document.getElementById('app').innerHTML=
    '<div class="wrap">'
    +'<div class="hdr">'
    +'<div class="hdr-from">From '+FROM_NAME+' · To '+TO_NAME+'</div>'
    +'<div class="hdr-name" id="hTitle">'+APP_NAME+'</div>'
    +'<div class="hdr-sub">'+(WELCOME_MSG||TO_NAME+', this is for you')+'</div>'
    +'<button class="hdr-export" onclick="exportFile()">Export ↑</button>'
    +'</div>'
    +(dd?'<div class="dday">'+dd+'</div>':'<div style="height:8px"></div>')
    +'<div class="tabs">'
    +'<button class="tab'+(tab==='letters'?' on':'')+'" onclick="switchTab(\\'letters\\')">💌 Letters</button>'
    +'<button class="tab'+(tab==='timeline'?' on':'')+'" onclick="switchTab(\\'timeline\\')">✦ Our Story</button>'
    +'</div>'
    +(tab==='letters'?renderLetters():renderTimeline())
    +'</div>'
    +(isAdmin?'<div class="admin-bar"><span>✏️ Edit mode</span><button class="admin-exit" onclick="exitAdmin()">Done ✓</button></div>':'');
  document.getElementById('hTitle').addEventListener('click',handleTap);
  if(tab==='timeline'&&PET_CONFIG) renderPet();
}

function renderLetters(){
  return '<div class="sec"><div class="sec-label">Weekly letters</div><div class="cap-grid">'+WEEKLY_CAPS.map(renderCard).join('')+'</div></div>'
    +(SITUATION_CAPS.length?'<div class="sec"><div class="sec-label">Open when...</div><div class="cap-grid">'+SITUATION_CAPS.map(renderCard).join('')+'</div></div>':'');
}

function renderCard(cap){
  const d=S.cap(cap.id), open=isOpen(cap), hasAny=d.letter||d.photo||d.voice;
  const state=!open?'locked':d.opened?'opened':'unlocked';
  const oc=isAdmin?'openEdit(\\''+cap.id+'\\',\\''+cap.label+'\\',\\''+cap.emoji+'\\')':open?'openView(\\''+cap.id+'\\',\\''+cap.label+'\\',\\''+cap.emoji+'\\')':'';
  return'<div class="cap '+state+'" '+(oc?'onclick="'+oc+'"':'')+' '+(open?'role="button" tabindex="0"':'')+'>'
    +(d.opened&&!isAdmin?'<div class="cap-read">read</div>':'')
    +(open&&!d.opened&&!isAdmin&&hasAny?'<div class="cap-new">NEW</div>':'')
    +'<span class="cap-icon">'+(!open?'🔒':d.opened?'💌':'✉️')+'</span>'
    +'<div class="cap-lbl">'+cap.label+'</div>'
    +(cap.hint?'<div class="cap-hint">'+cap.hint+'</div>':'')
    +'<div class="cap-st">'+(!open&&cap.unlockDate?fmtDate(cap.unlockDate)+' unlocks':d.opened?'Already opened':'Open me!')+'</div>'
    +(hasAny?'<div class="dots"><div class="dot'+(d.letter?' on':'')+'"></div><div class="dot'+(d.photo?' on':'')+'"></div><div class="dot'+(d.voice?' on':'')+'"></div></div>':'')
    +'</div>';
}

function renderTimeline(){
  const v=getVisitCount(),r=getReplyCount();
  let d; try{d=JSON.parse(localStorage.getItem('ltr_corgi'))||{feedCount:0};}catch{d={feedCount:0};}
  const f=d.feedCount, thinks=(1000+v*847+r*213+f*157).toLocaleString()+'+';
  return'<div class="sec"><div class="sec-label">Our records</div>'
    +'<div class="stat-grid">'
    +'<div class="stat"><span class="stat-ico">📱</span><div class="stat-val">'+v+'</div><div class="stat-nm">Times visited</div></div>'
    +'<div class="stat"><span class="stat-ico">✍️</span><div class="stat-val">'+r+'</div><div class="stat-nm">Replies written</div></div>'
    +'<div class="stat"><span class="stat-ico">🐾</span><div class="stat-val">'+f+'/10</div><div class="stat-nm">Pet fed</div></div>'
    +'<div class="stat wide"><span class="stat-ico" style="margin:0;flex-shrink:0">💭</span><div><div class="stat-val">'+thinks+'</div><div class="stat-nm">Times thought of you</div></div></div>'
    +'</div></div>'
    +(PET_CONFIG?'<div class="sec"><div class="sec-label">'+PET_CONFIG.name+'</div><div class="pet-section" id="petSection"></div></div>':'')
    +(TIMELINE_DATA.length?'<div class="sec"><div class="sec-label">Our story</div><div class="tl-wrap">'+TIMELINE_DATA.map(t=>{
      const past=new Date(t.date)<new Date();
      return'<div class="tl-item '+(past?'past':'future')+'">'
        +'<div class="tl-dot">'+(t.emoji||'💛')+'</div>'
        +'<div class="tl-body"><div class="tl-date">'+t.date+'</div><div class="tl-lbl">'+t.label+'</div>'
        +(!past?'<div class="tl-badge">waiting 💛</div>':'')
        +'</div></div>';
    }).join('')+'</div></div>':'');
}

function switchTab(t){tab=t;renderHome();}

// ── OPEN LETTER ────────────────────────────────────────────────
function openView(id,label,emoji){
  const cap=S.cap(id); cap.opened=true; S.saveCap(id,cap);
  const hasAny=cap.letter||cap.photo||cap.voice;
  const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  let html='<div class="v-hdr"><span class="v-emoji">'+emoji+'</span><div class="v-title">'+label+'</div><div class="v-date">Opened '+today+'</div></div>';
  if(!hasAny){
    html+='<div class="empty">This letter hasn\\'t been written yet...</div>';
  } else {
    if(cap.letter) html+='<div class="blk-lbl">Letter</div><div class="letter">'+esc(cap.letter)+'</div>';
    if(cap.photo) html+='<div class="blk-lbl" style="margin-top:20px">Photo</div><div class="photo"><img src="'+cap.photo+'" alt="" loading="lazy"></div>';
    if(cap.voice) html+='<div class="blk-lbl" style="margin-top:20px">Voice message</div>'
      +'<div class="audio-p"><button class="play" id="vPlay" onclick="togglePlay()">▶</button>'
      +'<div class="audio-track" onclick="seekAudio(event)"><div class="audio-fill" id="vFill" style="width:0%"></div></div>'
      +'<div class="audio-time" id="vTime">0:00</div></div>'
      +'<audio id="vAudio" src="'+cap.voice+'" preload="metadata"></audio>';
  }
  html+='<div class="reply-wrap"><div class="reply-lbl">My reply</div>'
    +(cap.reply?'<div class="reply-prev">'+esc(cap.reply)+'</div><div class="reply-date">'+cap.replyDate+'</div>':'')
    +'<textarea class="reply-ta" id="replyIn" placeholder="Write your reply here...">'+esc(cap.reply||'')+'</textarea>'
    +'<button class="reply-save" onclick="saveReply(\\''+id+'\\')">Save reply</button>'
    +'</div>';
  document.getElementById('viewBody').innerHTML=html;
  document.getElementById('viewOv').classList.add('show');
  if(cap.voice){
    audioEl=document.getElementById('vAudio');
    audioEl.addEventListener('timeupdate',updateProgress);
    audioEl.addEventListener('ended',()=>{document.getElementById('vPlay').textContent='▶';document.getElementById('vFill').style.width='0%';audioEl.currentTime=0;});
  }
}

function togglePlay(){if(!audioEl)return;if(audioEl.paused){audioEl.play();document.getElementById('vPlay').textContent='⏸';}else{audioEl.pause();document.getElementById('vPlay').textContent='▶';}}
function seekAudio(e){if(!audioEl||!audioEl.duration)return;const r=e.currentTarget.getBoundingClientRect();audioEl.currentTime=((e.clientX-r.left)/r.width)*audioEl.duration;}
function updateProgress(){if(!audioEl)return;const p=audioEl.duration?(audioEl.currentTime/audioEl.duration*100):0;const f=document.getElementById('vFill'),t=document.getElementById('vTime');if(f)f.style.width=p+'%';if(t)t.textContent=fmtTime(audioEl.currentTime);}

function saveReply(id){
  const inp=document.getElementById('replyIn');if(!inp)return;
  const cap=S.cap(id);
  cap.reply=inp.value.trim();
  cap.replyDate=new Date().toLocaleString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  S.saveCap(id,cap);
}

document.getElementById('viewOv').addEventListener('click',function(e){
  if(e.target===this){if(audioEl){audioEl.pause();audioEl=null;}this.classList.remove('show');renderHome();}
});

// ── ADMIN ──────────────────────────────────────────────────────
function handleTap(){if(isAdmin)return;tapCount++;clearTimeout(tapTimer);if(tapCount>=5){tapCount=0;showPw();}else{tapTimer=setTimeout(()=>tapCount=0,1500);}}
function showPw(){document.getElementById('pwOv').classList.add('show');setTimeout(()=>document.getElementById('pwIn').focus(),150);}
function closePw(){document.getElementById('pwOv').classList.remove('show');document.getElementById('pwIn').value='';document.getElementById('pwErr').style.display='none';}
function checkPw(){const pw=document.getElementById('pwIn').value;const stored=JSON.parse(localStorage.getItem('ltr_cfg')||'{}').adminPw||'admin1234';if(pw===stored){closePw();isAdmin=true;renderHome();}else{document.getElementById('pwErr').style.display='block';}}
document.getElementById('pwIn').addEventListener('keydown',e=>{if(e.key==='Enter')checkPw();});
document.getElementById('pwOv').addEventListener('click',function(e){if(e.target===this)closePw();});
function exitAdmin(){isAdmin=false;renderHome();}
function openEdit(id,label,emoji){}

// ── EXPORT ─────────────────────────────────────────────────────
function exportFile(){
  const data={};Object.keys(localStorage).filter(k=>k.startsWith('ltr_')).forEach(k=>{data[k]=localStorage.getItem(k);});
  const html=document.documentElement.outerHTML;
  const updated=html.replace(/const SEED_DATA\s*=\s*\{[\s\S]*?\};/,'const SEED_DATA = '+JSON.stringify(data)+';');
  const blob=new Blob([updated],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;
  a.download=(APP_NAME||'letterbox').toLowerCase().replace(/\\s+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.html';
  a.click();URL.revokeObjectURL(url);
}

// ── INIT ───────────────────────────────────────────────────────
loadSeed();
trackVisit();
renderHome();
  `
}