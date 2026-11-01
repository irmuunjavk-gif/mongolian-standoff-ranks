/* MSR phase 1: auth, profile, news comments (Supabase). All user text is rendered with textContent only. */
(function () {
  'use strict';
  var C = window.MSR_CONFIG || {}, ok = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);
  var sb = ok ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true } }) : null;
  var S = { user: null, profile: null, admin: false }, PAGE = 10, UNAME = /^(?=.{3,32}$)(?!.*[<>])(?!.*\s{2})[^\u0000-\u001F\u007F]+$/u, TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  var AV = ok ? C.SUPABASE_URL.replace(/\/$/, '') + '/storage/v1/object/public/avatars/' : '', BACK = location.origin + location.pathname;

  var css = '.msr-auth{display:flex;align-items:center;gap:8px;margin-left:12px;margin-bottom:14px}@media(max-width:760px){.msr-auth{margin-left:auto;margin-bottom:10px}}.msr-btn{background:var(--surface,#161E2A);color:var(--text,#E9EDF3);border:1px solid var(--line,#2A3645);border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;font-size:13px;cursor:pointer}.msr-btn:hover:not(:disabled){border-color:var(--tracer,#2FD27B)}.msr-btn:disabled{opacity:.5;cursor:default}.msr-btn.pri{background:var(--tracer,#2FD27B);color:#06130C;border-color:transparent}.msr-btn.sm{padding:4px 9px;font-size:12px}.msr-btn.link{background:none;border:0;padding:2px 4px;color:var(--muted,#8899AE)}.msr-btn.link:hover{color:var(--text,#E9EDF3)}'
    + '.msr-av{width:32px;height:32px;border-radius:50%;object-fit:cover;background:var(--raised,#1E2836);display:inline-grid;place-items:center;font-size:11px;font-weight:700;color:var(--muted,#8899AE);flex:none}.msr-av.lg{width:84px;height:84px;font-size:24px}'
    + '.msr-menu{position:relative}.msr-pop{position:absolute;right:0;top:calc(100% + 6px);min-width:170px;background:var(--surface,#161E2A);border:1px solid var(--line,#2A3645);border-radius:10px;padding:6px;z-index:60;display:flex;flex-direction:column}.msr-pop a,.msr-pop button{background:none;border:0;color:var(--text,#E9EDF3);text-align:left;padding:8px 10px;border-radius:6px;font:inherit;font-size:13.5px;cursor:pointer;text-decoration:none}.msr-pop a:hover,.msr-pop button:hover{background:var(--raised,#1E2836)}'
    + 'dialog.msr-modal{border:1px solid var(--line,#2A3645);border-radius:14px;background:var(--surface,#161E2A);color:var(--text,#E9EDF3);padding:22px;width:min(400px,92vw)}dialog.msr-modal::backdrop{background:rgba(0,0,0,.65)}.msr-modal h2{margin:0 0 4px;font-size:20px}.msr-modal form{display:flex;flex-direction:column;gap:10px;margin-top:12px}.msr-modal input,.msr-cm textarea{background:var(--bg,#0D121A);color:var(--text,#E9EDF3);border:1px solid var(--line,#2A3645);border-radius:8px;padding:10px 12px;font:inherit;font-size:14px;width:100%;box-sizing:border-box}.msr-modal input:focus,.msr-cm textarea:focus{outline:2px solid var(--tracer,#2FD27B);outline-offset:0}.msr-tabs{display:flex;gap:6px}.msr-tabs button{flex:1}.msr-tabs .on{border-color:var(--tracer,#2FD27B)}.msr-or{text-align:center;color:var(--dim,#5E6F86);font-size:12px;margin:2px 0}.msr-msg{min-height:18px;margin:0;font-size:13px}.msr-msg.bad{color:#FF6B7A}.msr-msg.ok{color:var(--win,#3FB977)}'
    + '.msr-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--raised,#1E2836);border:1px solid var(--line,#2A3645);color:var(--text,#E9EDF3);padding:11px 18px;border-radius:10px;z-index:200;font-size:14px;max-width:90vw}.msr-toast.bad{border-color:#FF6B7A}'
    + '.msr-cm{margin:34px 0 10px}.msr-cm h3{font-size:18px;margin:0 0 14px}.msr-cm textarea{min-height:84px;resize:vertical}.msr-row{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:8px;color:var(--dim,#5E6F86);font-size:12px}.msr-c{display:flex;gap:11px;padding:14px 0;border-top:1px solid var(--line-soft,#1F2937)}.msr-c .bd{flex:1;min-width:0}.msr-c .nm{font-weight:700;font-size:14px}.msr-c .tm{color:var(--dim,#5E6F86);font-size:12px;margin-left:8px}.msr-c .tx{margin:4px 0 6px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5}.msr-c .ac{display:flex;gap:4px;flex-wrap:wrap}.msr-c .ac .on{color:#FF6B7A}.msr-rep{margin-left:43px;border-left:2px solid var(--line-soft,#1F2937);padding-left:10px}.msr-note{color:var(--muted,#8899AE);font-size:14px}.msr-prof{max-width:640px}.msr-prof .hd{display:flex;gap:18px;align-items:center;margin:14px 0 20px}.msr-prof dl{display:grid;grid-template-columns:130px 1fr;gap:8px 12px;margin:0 0 18px;font-size:14px}.msr-prof dt{color:var(--dim,#5E6F86)}.msr-prof dd{margin:0;overflow-wrap:anywhere}.msr-bdg{font-size:11px;font-weight:800;letter-spacing:.08em;padding:2px 8px;border-radius:6px;background:var(--raised,#1E2836);margin-left:8px}';
  css += ".msr-avatar-edit-wrap{position:relative;display:inline-flex;flex:none}.msr-avatar-pencil{position:absolute;right:-9px;bottom:-4px;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:2px solid #182b40;background:#5fa6f5;color:#06182b;font-size:23px;font-weight:900;cursor:pointer;box-shadow:0 3px 12px #0008;z-index:2}.msr-avatar-pencil:hover{background:#93c9ff}.msr-avatar-pencil:focus-visible{outline:3px solid #fff;outline-offset:2px}";
  css += '.msr-account-link{display:inline-flex;align-items:center;gap:9px;text-decoration:none;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.msr-account-link .msr-av{width:28px;height:28px}.msr-prof{width:100%;max-width:740px;margin:0 auto}.msr-prof h1{font-size:clamp(25px,5vw,34px);letter-spacing:-.03em}.msr-prof .msr-profile-hero{background:linear-gradient(135deg,#172c43,#111b2a 65%,#15334a);border:1px solid #30445b;border-radius:18px;padding:20px;margin:15px 0 16px}.msr-prof .msr-profile-hero .hd{margin:0;gap:15px}.msr-prof .msr-profile-hero .msr-av.lg{width:76px;height:76px;border:2px solid #5a87c6}.msr-prof .msr-profile-hero b{font-size:clamp(19px,4.5vw,25px)!important;overflow-wrap:anywhere}.msr-prof .msr-profile-card{background:rgba(14,22,35,.83);border:1px solid #2c3d53;border-radius:16px;padding:18px;margin:12px 0}.msr-prof .msr-profile-card dl{grid-template-columns:minmax(110px,145px) minmax(0,1fr);gap:14px 12px;margin:0}.msr-prof .msr-profile-card dd{min-width:0}.msr-prof .msr-profile-card input[type=text]{width:100%;min-width:0;background:#101b2b;color:#f0f5ff;border:1px solid #40516a;border-radius:9px;padding:10px 12px;box-sizing:border-box;font-size:16px}.msr-prof .msr-profile-card input[type=file]{width:100%;max-width:100%;font-size:13px;color:#b9c9df}.msr-prof .msr-profile-card .msr-profile-title{font-size:16px;font-weight:800;margin:0 0 15px}.msr-prof .msr-profile-logout{width:100%;margin:18px 0 24px;padding:13px;border:1px solid #a84d60;color:#ffb8c5;background:rgba(105,28,48,.18);border-radius:11px;font-weight:700;cursor:pointer}@media(max-width:520px){.msr-prof .msr-profile-hero{padding:15px}.msr-prof .msr-profile-card{padding:14px}.msr-prof .msr-profile-card dl{grid-template-columns:1fr;gap:5px}.msr-prof .msr-profile-card dt:not(:first-child){margin-top:9px}.msr-account-link{max-width:145px;font-size:12px;padding:6px 9px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function el(tag, a, kids) {
    var e = document.createElement(tag); a = a || {};
    Object.keys(a).forEach(function (k) { var v = a[k]; if (v == null || v === false) return; if (k === 'class') e.className = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); });
    [].concat(kids == null ? [] : kids).forEach(function (c) { if (c == null || c === false) return; e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); });
    return e;
  }
  function toast(m, bad) { var t = el('div', { class: 'msr-toast' + (bad ? ' bad' : ''), role: 'status' }, m); document.body.appendChild(t); setTimeout(function () { t.remove(); }, 4500); }
  function err(e) {
    var m = (e && e.message) || '';
    if (/rate_limit/.test(m)) return 'Хэт олон сэтгэгдэл бичлээ. Түр хүлээгээд дахин оролдоно уу.';
    if (/Invalid login/i.test(m)) return 'Имэйл эсвэл нууц үг буруу байна.';
    if (/not confirmed/i.test(m)) return 'Имэйл хаягаа баталгаажуулаагүй байна. Имэйлээ шалгана уу.';
    if (/already (been )?registered/i.test(m)) return 'Энэ имэйл бүртгэлтэй байна.';
    if (/Database error saving/i.test(m)) return 'Бүртгэл үүсгэж чадсангүй. Username давхцсан байж магадгүй.';
    if (/duplicate key|username_lower/i.test(m)) return 'Энэ username аль хэдийн авагдсан байна.';
    if (/row-level security|permission|not allowed/i.test(m)) return 'Танд энэ үйлдлийг хийх эрх алга.';
    if (/fetch|network/i.test(m)) return 'Сүлжээний алдаа. Холболтоо шалгана уу.';
    return 'Алдаа гарлаа. Дахин оролдоно уу.';
  }
  function need() { if (ok) return false; toast('Supabase тохируулаагүй байна (msr-config.js-ийг бөглөнө үү).', true); return true; }
  function avatar(p, cls) { var u = p && p.avatar_url; if (u && u.indexOf(AV) === 0) return el('img', { class: 'msr-av ' + (cls || ''), src: u, alt: '', loading: 'lazy' }); return el('span', { class: 'msr-av ' + (cls || ''), 'aria-hidden': 'true' }, ((p && p.username) || '?').slice(0, 2).toUpperCase()); }
  function ago(d) { var s = (Date.now() - new Date(d)) / 1000; if (s < 60) return 'саяхан'; if (s < 3600) return Math.floor(s / 60) + ' минутын өмнө'; if (s < 86400) return Math.floor(s / 3600) + ' цагийн өмнө'; if (s < 2592000) return Math.floor(s / 86400) + ' өдрийн өмнө'; return new Date(d).toLocaleDateString('mn-MN'); }

  /* ---------- session ---------- */
  async function loadUser(session) {
    S.user = session ? session.user : null; S.profile = null; S.admin = false;
    if (S.user) {
      var p = await sb.from('profiles').select('id,username,avatar_url,created_at').eq('id', S.user.id).maybeSingle(); S.profile = p.data;
      var r = await sb.from('user_roles').select('role').eq('user_id', S.user.id).maybeSingle(); S.admin = !!(r.data && r.data.role === 'ADMIN');
    }
    drawBar(); document.dispatchEvent(new CustomEvent('msr:auth'));
  }
  var barBound = false;
  function drawBar() {
    var box = document.getElementById('msr-auth'); if (!box) return; box.textContent = '';
    if (!barBound) { barBound = true; document.addEventListener('click', function () { var p = document.querySelector('.msr-pop'); if (p) p.remove(); }); }
    if (!S.user) { box.appendChild(el('button', { class: 'msr-btn', type: 'button', onclick: function () { openModal('login'); } }, 'Log in')); return; }
    var btn = el('a', { class: 'msr-btn msr-account-link', href: '#profile', 'aria-label': 'Миний профайл' }, [avatar(S.profile), (S.profile && S.profile.username) || 'Профайл']);
    box.appendChild(btn);
  }

  /* ---------- login / register modal ---------- */
  var modal = null;
  function closeModal() { if (modal) { modal.close(); modal.remove(); modal = null; } }
  function openModal(mode) {
    if (need()) return; closeModal(); mode = mode || 'login';
    var d = el('dialog', { class: 'msr-modal', 'aria-label': 'Нэвтрэх' }); modal = d; document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d) closeModal(); });
    var title = { login: 'Нэвтрэх', register: 'Бүртгүүлэх', forgot: 'Нууц үг сэргээх', reset: 'Шинэ нууц үг' }[mode];
    var msg = el('p', { class: 'msr-msg', role: 'alert' });
    function say(t, bad) { msg.textContent = t; msg.className = 'msr-msg msr-no-translate ' + (bad ? 'bad' : 'ok'); }
    var email = el('input', { type: 'email', required: true, autocomplete: 'email', placeholder: 'Имэйл' });
    var pass = el('input', { type: 'password', required: true, minlength: 8, autocomplete: mode === 'login' ? 'current-password' : 'new-password', placeholder: mode === 'reset' ? 'Шинэ нууц үг (8+ тэмдэгт)' : 'Нууц үг (8+ тэмдэгт)' });
    var pass2 = el('input', { type: 'password', required: true, minlength: 8, autocomplete: 'new-password', placeholder: 'Нууц үгээ давтах' });
    var user = el('input', { type: 'text', required: true, maxlength: 32, autocomplete: 'username', placeholder: 'Username (3–32, any language + symbols)' });
    var game = el('input', { type: 'text', required: true, inputmode: 'numeric', pattern: '[0-9]{4,20}', maxlength: 20, placeholder: 'Standoff 2 ID (зөвхөн тоо)' });
    var warning = el('p', { class: 'msr-note', style: 'padding:10px;border:1px solid var(--line);border-radius:8px' }, 'Анхааруулга: Standoff 2 ID-гаа зөв оруулна уу. Бүртгүүлсний дараа Discord-оор админд SO2 профайлын screenshot явуулж баталгаажуулна. ID давхардсан эсвэл буруу бол админтай холбогдоно.');
    var discordLink = el('a', { class: 'msr-btn pri', href: 'https://discord.com/users/1128188613230874727', target: '_blank', rel: 'noopener noreferrer', style: 'display:inline-block;text-decoration:none;text-align:center;margin-top:8px' }, 'Админтай холбогдох');
    var go = el('button', { class: 'msr-btn pri', type: 'submit' }, mode === 'login' ? 'Нэвтрэх' : mode === 'register' ? 'Бүртгүүлэх' : mode === 'forgot' ? 'Холбоос илгээх' : 'Хадгалах');
    var fields = mode === 'login' ? [email, pass] : mode === 'register' ? [user, game, email, pass, pass2, warning, discordLink] : mode === 'forgot' ? [email] : [pass, pass2];
    if (mode === 'reset') fields = [pass, pass2];
    var form = el('form', { onsubmit: async function (e) {
      e.preventDefault(); go.disabled = true; say('');
      try {
        if (mode === 'login') { var r = await sb.auth.signInWithPassword({ email: email.value.trim(), password: pass.value }); if (r.error) throw r.error; closeModal(); toast('Тавтай морил!'); }
        else if (mode === 'register') {
          var u = user.value.trim();
          if (!UNAME.test(u)) return say('Username 3–32 тэмдэгт: бүх хэлний үсэг, emoji, тэмдэг ашиглаж болно. < > зөвшөөрөхгүй.', true);
          if (pass.value !== pass2.value) return say('Нууц үг таарахгүй байна.', true);
          if (!/^[0-9]{4,20}$/.test(game.value.trim())) return say('Standoff 2 ID 4–20 оронтой тоо байх ёстой.', true);
          var check = await sb.from('player_id_verifications').select('game_id').eq('game_id', game.value.trim()).limit(1);
          if (check.error) throw check.error;
          if (check.data && check.data.length) return say('Энэ ID аль хэдийн бүртгэлтэй. Админтай Discord-оор холбогдоно уу.', true);
          var av = await sb.rpc('username_available', { name: u }); if (av.error) throw av.error; if (!av.data) return say('Энэ username аль хэдийн авагдсан байна.', true);
          var s = await sb.auth.signUp({ email: email.value.trim(), password: pass.value, options: { data: { username: u }, emailRedirectTo: BACK } }); if (s.error) throw s.error;
          if (s.data.user && s.data.session) {
            var claim = await sb.from('player_id_verifications').insert({ user_id: s.data.user.id, game_id: game.value.trim(), status: 'pending' });
            if (claim.error) toast('Аккаунт үүссэн ч ID бүртгэгдээгүй. Профайл хэсгээс ID-гаа оруулна уу.', true);
          } else if (s.data.user) { try { localStorage.setItem('msr-pending-game-' + s.data.user.id, game.value.trim()); } catch (_) {} }
          if (s.data.session) { closeModal(); toast('Бүртгэл амжилттай! ID баталгаажуулалт хүлээгдэж байна.'); } else say('Баталгаажуулах холбоос имэйлээр илгээгдлээ. Имэйлээ шалгаад холбоос дээр дарна уу.');
        } else if (mode === 'forgot') { var f = await sb.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: BACK }); if (f.error) throw f.error; say('Хэрэв энэ имэйл бүртгэлтэй бол сэргээх холбоос илгээгдлээ.'); }
        else { if (pass.value !== pass2.value) return say('Нууц үг таарахгүй байна.', true); var up = await sb.auth.updateUser({ password: pass.value }); if (up.error) throw up.error; closeModal(); toast('Нууц үг шинэчлэгдлээ.'); }
      } catch (x) { say(err(x), true); } finally { go.disabled = false; }
    } }, fields.concat([go, msg]));
    var tabs = (mode === 'login' || mode === 'register') ? el('div', { class: 'msr-tabs' }, [['login', 'Нэвтрэх'], ['register', 'Бүртгүүлэх']].map(function (t) { return el('button', { type: 'button', class: 'msr-btn' + (mode === t[0] ? ' on' : ''), onclick: function () { openModal(t[0]); } }, t[1]); })) : null;
    var google = (mode === 'login' || mode === 'register') ? [el('div', { class: 'msr-or' }, 'эсвэл'), el('button', { class: 'msr-btn', type: 'button', onclick: function () { if (C.GOOGLE_AUTH_ENABLED !== true) return toast('Google нэвтрэлт хараахан идэвхжээгүй байна. Имэйлээр нэвтэрнэ үү.', true); sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: BACK } }).then(function (r) { if (r.error) toast(err(r.error), true); }); } }, 'Google-ээр нэвтрэх')] : [];
    var extra = mode === 'login' ? el('button', { class: 'msr-btn link', type: 'button', onclick: function () { openModal('forgot'); } }, 'Нууц үгээ мартсан уу?') : mode === 'forgot' ? el('button', { class: 'msr-btn link', type: 'button', onclick: function () { openModal('login'); } }, '← Нэвтрэх рүү буцах') : null;
    var info = (mode === 'login' || mode === 'register') ? el('section', { class:'msr-login-info', style:'margin:10px 0 16px;padding:12px;border:1px solid var(--line,#2A3645);border-radius:10px;background:var(--raised,#1E2836);font-size:12.5px;line-height:1.65' }, [
      el('strong', null, mode === 'login' ? 'MSR аккаунтаараа нэвтрэх' : 'MSR аккаунт үүсгэх'),
      el('p', { style:'margin:6px 0 0' }, mode === 'login' ? 'Бүртгэлтэй имэйл, нууц үгээ оруулна. Нэвтэрсний дараа профайл, Shop захиалга болон Inventory-гаа харах боломжтой.' : 'Username, Standoff 2 ID, имэйл, 8-аас дээш тэмдэгттэй нууц үг шаардлагатай. Имэйл баталгаажуулалт шаардагдаж болно.'),
      el('p', { style:'margin:6px 0 0;color:var(--muted,#8899AE)' }, mode === 'login' ? 'Нууц үгээ мартсан бол доорх сэргээх холбоосыг ашиглаарай.' : 'Standoff 2 ID-г зөвхөн өөрийнхөө ID-аар бүртгүүлнэ. ID-г админ баталгаажуулна. Нууц үгээ хэнд ч бүү өг.')
    ]) : null;
    d.appendChild(el('h2', null, title)); if (tabs) d.appendChild(tabs); if(info)d.appendChild(info); d.appendChild(form); google.forEach(function (g) { d.appendChild(g); }); if (extra) d.appendChild(extra);
    d.appendChild(el('button', { class: 'msr-btn link', type: 'button', onclick: closeModal, 'aria-label': 'Хаах', style: 'position:absolute;right:10px;top:10px' }, '✕'));
    d.showModal();
  }

  /* ---------- profile page ---------- */
  function profileView() {
    var box = el('div', { class: 'msr-prof' });
    function draw() {
      if (!box.isConnected && box.dataset.m) { document.removeEventListener('msr:auth', draw); return; } box.dataset.m = '1';
      box.textContent = '';
      var top=el('div',{style:'display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px'},[
        el('h1',{style:'margin:0'},'Профайл'),
        el('button',{type:'button',class:'msr-btn',onclick:function(){var settings=box.querySelector('#msr-profile-settings');if(settings){settings.hidden=!settings.hidden;if(!settings.hidden)settings.scrollIntoView({behavior:'smooth',block:'start'});}}},'⚙ Settings')
      ]);
      box.appendChild(top);
      if (!ok) { box.appendChild(el('p', { class: 'msr-note' }, 'Хэрэглэгчийн систем одоохондоо тохируулагдаагүй байна.')); return; }
      if (!S.user) { box.appendChild(el('p', { class: 'msr-note' }, 'Профайлаа харахын тулд нэвтэрнэ үү.')); box.appendChild(el('button', { class: 'msr-btn pri', type: 'button', onclick: function () { openModal('login'); } }, 'Нэвтрэх / Бүртгүүлэх')); return; }
      var p = S.profile || { username: '' }, msg = el('p', { class: 'msr-msg', role: 'status' });
      function say(t, bad) { msg.textContent = t; msg.className = 'msr-msg ' + (bad ? 'bad' : 'ok'); }
      var name = el('input', { type: 'text', maxlength: 32, value: p.username, 'aria-label': 'Username' });
      var file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', 'aria-label': 'Профайл зураг', style: 'display:none' });
      var save = el('button', { class: 'msr-btn pri', type: 'button', onclick: async function () {
        save.disabled = true; say('');
        try {
          var patch = {}, nv = name.value.trim();
          if (nv !== p.username) { if (!UNAME.test(nv)) return say('Username must be 3–32 characters. Any language, emoji and symbols are supported except < > and control characters.', true); var a = await sb.rpc('username_available', { name: nv }); if (a.error) throw a.error; if (!a.data && nv.toLowerCase() !== p.username.toLowerCase()) return say('Энэ username авагдсан байна.', true); patch.username = nv; }
          var f = file.files[0];
          if (f) {
            if (!TYPES[f.type]) return say('Зөвхөн JPG, PNG, WebP зураг оруулна.', true);
            if (f.size > 2 * 1024 * 1024) return say('Зургийн хэмжээ 2MB-аас бага байна.', true);
            var path = S.user.id + '/avatar-' + Date.now() + '.' + TYPES[f.type], up = await sb.storage.from('avatars').upload(path, f, { contentType: f.type, upsert: false }); if (up.error) throw up.error;
            patch.avatar_url = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
          }
          if (!Object.keys(patch).length) return say('No changes to save.');
          var r = await sb.from('profiles').update(patch).eq('id', S.user.id).select('id').single(); if (r.error) throw r.error;
          await loadUser((await sb.auth.getSession()).data.session); toast('Профайл хадгалагдлаа.');
        } catch (x) { say(err(x), true); } finally { save.disabled = false; }
      } }, 'Хадгалах');
      var avatarWrap = el('div', { class: 'msr-avatar-edit-wrap' }, avatar(p, 'lg'));
      var editAvatar = el('button', { type: 'button', class: 'msr-avatar-pencil', title: 'Зураг солих', 'aria-label': 'Зураг солих', onclick: function () { file.click(); } }, '✎');
      avatarWrap.appendChild(editAvatar);
      file.addEventListener('change', function () {
        var f = file.files && file.files[0]; if (!f) return;
        if (!TYPES[f.type] || f.size > 2 * 1024 * 1024) { say('JPG, PNG, WebP зураг (2MB хүртэл) сонгоно уу.', true); file.value = ''; return; }
        var img = avatarWrap.querySelector('img');
        if (img) { var preview = URL.createObjectURL(f); img.onload = function () { URL.revokeObjectURL(preview); }; img.src = preview; }
        say('Зураг сонгогдлоо. Хадгалах товчийг дарна уу.');
      });
      var hero=el('div', { class: 'msr-profile-hero' }, el('div', { class: 'hd' }, [avatarWrap, el('div', null, [el('b', { style: 'font-size:20px' }, p.username), el('span', { class: 'msr-bdg' }, S.admin ? 'ADMIN' : 'USER')])]));
      hero.id='msr-profile-hero';
      box.appendChild(hero);
      box.appendChild(el('button',{class:'msr-btn pri',type:'button',style:'margin:10px 0 16px',onclick:function(){var settings=box.querySelector('#msr-profile-settings');if(settings){settings.hidden=false;settings.scrollIntoView({behavior:'smooth',block:'start'});}}},'✎ Edit Profile'));
      var settings=el('div',{id:'msr-profile-settings',class:'msr-profile-card',hidden:true},[
        el('h3',{class:'msr-profile-title'},'⚙ Account Settings'),
        el('dl',null,[el('dt',null,'Имэйл'),el('dd',null,S.user.email),el('dt',null,'Бүртгүүлсэн'),el('dd',null,new Date(S.user.created_at).toLocaleDateString('mn-MN')),el('dt',null,'Username'),el('dd',null,name),el('dt',null,'Профайл зураг'),el('dd',null,'Зураг солихын тулд дээрх харандаа дээр дарна уу.')])
      ]);
      settings.appendChild(file);settings.appendChild(save);settings.appendChild(msg);box.appendChild(settings);
      var claimBox = el('div', { style: 'margin:18px 0;padding:15px;border:1px solid var(--line);border-radius:10px' }, el('b', null, 'Standoff 2 ID Verification'));
      box.appendChild(claimBox);
      (async function () {
        var r = await sb.from('player_id_verifications').select('game_id,status').eq('user_id', S.user.id).maybeSingle();
        if (!box.isConnected) return;
        if (r.error) { claimBox.appendChild(el('p', { class: 'msr-note' }, 'ID мэдээллийг ачаалж чадсангүй.')); return; }
        if (r.data) { claimBox.appendChild(el('p', null, 'ID: ' + r.data.game_id + ' · ' + (r.data.status === 'verified' ? '✓ Verified' : r.data.status === 'rejected' ? 'Rejected — админтай холбогдоно уу' : 'Pending — Discord-оор screenshot илгээнэ үү'))); claimBox.appendChild(el('a', { class: 'msr-btn pri', href: 'https://discord.com/users/1128188613230874727', target: '_blank', rel: 'noopener noreferrer', style: 'display:inline-block;text-decoration:none;text-align:center;margin-top:8px' }, 'Админтай холбогдох')); return; }
        var saved = ''; try { saved = localStorage.getItem('msr-pending-game-' + S.user.id) || ''; } catch (_) {}
        var input = el('input', { type: 'text', inputmode: 'numeric', maxlength: 20, placeholder: 'Standoff 2 ID', value: saved, style: 'font-size:16px;max-width:100%;padding:10px' });
        var add = el('button', { class: 'msr-btn pri', type: 'button', onclick: async function () {
          var id = input.value.trim(); if (!/^[0-9]{4,20}$/.test(id)) return toast('4–20 оронтой ID оруулна уу.', true);
          add.disabled = true;
          var result = await sb.from('player_id_verifications').insert({ user_id: S.user.id, game_id: id, status: 'pending' });
          add.disabled = false;
          if (result.error) return toast(result.error.code === '23505' ? 'Энэ ID аль хэдийн бүртгэлтэй. Discord-оор админтай холбогдоно уу.' : err(result.error), true);
          try { localStorage.removeItem('msr-pending-game-' + S.user.id); } catch (_) {}
          claimBox.textContent = 'ID: ' + id + ' · Pending — Discord-оор screenshot илгээнэ үү';
        } }, 'ID бүртгүүлэх');
        claimBox.appendChild(el('p', { class: 'msr-note' }, 'SO2 ID-гаа бүртгүүлээд Discord-оор screenshot явуулна уу.')); claimBox.appendChild(input); claimBox.appendChild(add); claimBox.appendChild(el('a', { class: 'msr-btn pri', href: 'https://discord.com/users/1128188613230874727', target: '_blank', rel: 'noopener noreferrer', style: 'display:inline-block;text-decoration:none;text-align:center;margin-top:8px' }, 'Админтай холбогдох'));
      })();
      if (S.admin) {
        var adminBox = el('div', { style: 'margin:18px 0;padding:15px;border:1px solid var(--line);border-radius:10px' }, el('h3', null, 'Admin · ID Verification'));
        var reload = el('button', { class: 'msr-btn', type: 'button' }, 'Хүсэлтүүдийг ачаалах');
        var items = el('div');
        reload.addEventListener('click', async function () {
          items.textContent = ''; var res = await sb.from('player_id_verifications').select('user_id,game_id,status').order('game_id', { ascending: true }).limit(100);
          if (res.error) return toast(err(res.error), true);
          res.data.forEach(function (v) {
            var edit = el('input', { type: 'text', value: v.game_id, maxlength: 20, inputmode: 'numeric', style: 'font-size:16px;width:130px;max-width:100%' });
            var row = el('div', { style: 'padding:10px 0;border-bottom:1px solid var(--line)' }, [el('small', null, v.user_id.slice(0,8) + ' · ' + v.status), edit]);
            [['verified','Verify'],['rejected','Reject'],['pending','Save ID']].forEach(function (a) {
              row.appendChild(el('button', { class: 'msr-btn sm', type: 'button', onclick: async function () {
                var id = edit.value.trim(); if (!/^[0-9]{4,20}$/.test(id)) return toast('ID буруу байна.', true);
                var up = await sb.from('player_id_verifications').update({ game_id: id, status: a[0] }).eq('user_id', v.user_id);
                if (up.error) return toast(up.error.code === '23505' ? 'ID давхардсан байна.' : err(up.error), true);
                toast('Хадгаллаа'); reload.click();
              } }, a[1]));
            });
            items.appendChild(row);
          });
        });
        adminBox.appendChild(reload); adminBox.appendChild(items); box.appendChild(adminBox);
      }
      box.appendChild(save); box.appendChild(msg); box.appendChild(el('button', { class: 'msr-profile-logout', type: 'button', onclick: async function () { var result = await sb.auth.signOut(); if (result.error) return toast(err(result.error), true); location.hash = '#news'; toast('Аккаунтаас гарлаа.'); } }, '↪ Аккаунтаас гарах'));
    }
    document.addEventListener('msr:auth', draw); draw(); return box;
  }

  /* ---------- comments ---------- */
  var SEL = 'id,body,created_at,edited_at,like_count,parent_id,user_id,profiles!news_comments_user_id_fkey(username,avatar_url)', lastPost = 0;
  function comments(aid) {
    aid = String(aid); var root = el('section', { class: 'msr-cm', 'aria-label': 'Сэтгэгдэл' });
    if (!ok) { root.appendChild(el('h3', null, 'Сэтгэгдэл')); root.appendChild(el('p', { class: 'msr-note' }, 'Сэтгэгдлийн систем одоохондоо тохируулагдаагүй байна.')); return root; }
    var head = el('h3', null, 'Сэтгэгдэл'), formBox = el('div'), list = el('div'), more = el('button', { class: 'msr-btn', type: 'button', style: 'margin-top:12px', onclick: function () { page(); } }, 'Дахин ачаалах'), shown = 0, liked = {}, generation = 0;
    root.appendChild(head); root.appendChild(formBox); root.appendChild(list); root.appendChild(more);
    function form(parent, onDone, prefix) {
      if (!S.user) return el('button', { class: 'msr-btn', type: 'button', onclick: function () { openModal('login'); } }, 'Сэтгэгдэл бичихийн тулд нэвтэрнэ үү');
      var ta = el('textarea', { maxlength: 1000, placeholder: 'Сэтгэгдлээ бичнэ үү…', 'aria-label': 'Сэтгэгдэл' }); ta.value = prefix || '';
      var cnt = el('span', null, '0/1000'), btn = el('button', { class: 'msr-btn pri', type: 'button', onclick: async function () {
        var t = ta.value.trim(); if (!t) return; if (Date.now() - lastPost < 5000) return toast('Хэт хурдан илгээж байна. Хэдэн секунд хүлээнэ үү.', true);
        btn.disabled = true;
        try { var r = await sb.from('news_comments').insert({ article_id: aid, user_id: S.user.id, body: t, parent_id: parent || null }); if (r.error) throw r.error; lastPost = Date.now(); ta.value = ''; onDone(); }
        catch (x) { toast(err(x), true); } finally { btn.disabled = false; }
      } }, 'Илгээх');
      ta.addEventListener('input', function () { cnt.textContent = ta.value.length + '/1000'; });
      return el('div', null, [ta, el('div', { class: 'msr-row' }, [cnt, btn])]);
    }
    function item(c, top, likedSet, replies) {
      var mine = S.user && c.user_id === S.user.id, text = el('div', { class: 'tx' }, c.body), ac = el('div', { class: 'ac' }), replyBox = el('div');
      var likeBtn = el('button', { class: 'msr-btn link sm' + (likedSet[c.id] ? ' on' : ''), type: 'button', 'aria-pressed': likedSet[c.id] ? 'true' : 'false', onclick: async function () {
        if (!S.user) return openModal('login'); likeBtn.disabled = true;
        try { if (likedSet[c.id]) { var d = await sb.from('comment_likes').delete().eq('comment_id', c.id).eq('user_id', S.user.id); if (d.error) throw d.error; delete likedSet[c.id]; c.like_count = Math.max(0, c.like_count - 1); }
          else { var i = await sb.from('comment_likes').insert({ comment_id: c.id, user_id: S.user.id }); if (i.error) throw i.error; likedSet[c.id] = 1; c.like_count++; }
          likeBtn.textContent = '♥ ' + c.like_count; likeBtn.className = 'msr-btn link sm' + (likedSet[c.id] ? ' on' : ''); likeBtn.setAttribute('aria-pressed', likedSet[c.id] ? 'true' : 'false'); }
        catch (x) { toast(err(x), true); } finally { likeBtn.disabled = false; }
      } }, '♥ ' + c.like_count);
      ac.appendChild(likeBtn);
      ac.appendChild(el('button', { class: 'msr-btn link sm', type: 'button', onclick: function () { if (!S.user) return openModal('login'); replyBox.textContent = ''; replyBox.appendChild(form(top ? c.id : c.parent_id, reload, top ? '' : '@' + ((c.profiles && c.profiles.username) || '') + ' ')); } }, 'Хариу'));
      if (mine) ac.appendChild(el('button', { class: 'msr-btn link sm', type: 'button', onclick: function () {
        var ta = el('textarea', { maxlength: 1000, 'aria-label': 'Засах' }); ta.value = c.body;
        var ok2 = el('button', { class: 'msr-btn pri sm', type: 'button', onclick: async function () { var t = ta.value.trim(); if (!t) return; var r = await sb.from('news_comments').update({ body: t }).eq('id', c.id); if (r.error) return toast(err(r.error), true); reload(); } }, 'Хадгалах');
        replyBox.textContent = ''; replyBox.appendChild(el('div', null, [ta, el('div', { class: 'msr-row' }, [el('span'), ok2])]));
      } }, 'Засах'));
      if (mine || S.admin) ac.appendChild(el('button', { class: 'msr-btn link sm', type: 'button', onclick: async function () { if (!confirm('Энэ сэтгэгдлийг устгах уу?')) return; var r = await sb.from('news_comments').delete().eq('id', c.id); if (r.error) return toast(err(r.error), true); reload(); } }, S.admin && !mine ? 'Устгах (admin)' : 'Устгах'));
      var pr = c.profiles || { username: 'Устгагдсан' };
      var node = el('div', { class: 'msr-c' }, [avatar(pr), el('div', { class: 'bd' }, [el('div', null, [el('span', { class: 'nm' }, pr.username), el('span', { class: 'tm' }, ago(c.created_at) + (c.edited_at ? ' · засварласан' : ''))]), text, ac, replyBox])]);
      if (!top) return node;
      var wrap = el('div', null, node); if (replies && replies.length) wrap.appendChild(el('div', { class: 'msr-rep' }, replies.map(function (r) { return item(r, false, likedSet); }))); return wrap;
    }
    async function count() { var version = generation; var r = await sb.from('news_comments').select('id', { count: 'exact', head: true }).eq('article_id', aid); if (version !== generation || r.error) return; head.textContent = 'Сэтгэгдэл (' + (r.count || 0) + ')'; }
    async function page() {
      var version = generation;
      more.disabled = true;
      try {
        var r = await sb.from('news_comments').select(SEL).eq('article_id', aid).is('parent_id', null).order('created_at', { ascending: false }).range(shown, shown + PAGE - 1); if (r.error) throw r.error;
        var rows = r.data || [], ids = rows.map(function (x) { return x.id; }), reps = {};
        if (ids.length) {
          var q = await sb.from('news_comments').select(SEL).in('parent_id', ids).order('created_at', { ascending: true }); if (q.error) throw q.error;
          (q.data || []).forEach(function (x) { (reps[x.parent_id] = reps[x.parent_id] || []).push(x); });
          if (S.user) {
            var all = ids.concat((q.data || []).map(function (x) { return x.id; }));
            var lk = await sb.from('comment_likes').select('comment_id').eq('user_id', S.user.id).in('comment_id', all); if (lk.error) throw lk.error;
            (lk.data || []).forEach(function (x) { liked[x.comment_id] = 1; });
          }
        }
        if (version !== generation) return;
        rows.forEach(function (c) { list.appendChild(item(c, true, liked, reps[c.id])); });
        shown += rows.length; more.style.display = rows.length === PAGE ? '' : 'none';
        if (!shown) list.appendChild(el('p', { class: 'msr-note' }, 'Одоохондоо сэтгэгдэл алга. Эхний сэтгэгдлийг та бичээрэй.'));
      } catch (x) { toast(err(x), true); } finally { more.disabled = false; }
    }
    function drawForm() { formBox.textContent = ''; formBox.appendChild(form(null, reload)); }
    function reload() { generation++; shown = 0; liked = {}; list.textContent = ''; more.style.display = 'none'; drawForm(); count(); return page(); }
    function onAuth() { if (!root.isConnected) { document.removeEventListener('msr:auth', onAuth); return; } reload(); }
    document.addEventListener('msr:auth', onAuth);
    reload();
    return root;
  }

  /* ---------- start ---------- */
  window.MSR = { comments: comments, profileView: profileView, openModal: openModal };
  drawBar();
  document.dispatchEvent(new CustomEvent('msr:ready'));
  if (ok) {
    sb.auth.onAuthStateChange(function (ev, session) {
      var uid = session && session.user ? session.user.id : null;
      // token refresh / tab refocus must not redraw the page while someone is typing
      if (ev === 'TOKEN_REFRESHED' || (ev === 'SIGNED_IN' && uid && S.user && S.user.id === uid)) { if (session) S.user = session.user; return; }
      setTimeout(function () { loadUser(session).then(function () { if (ev === 'PASSWORD_RECOVERY') openModal('reset'); }); }, 0);
    });
  } else { drawBar(); }
})();
