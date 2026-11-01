/* MSR phase 1: auth, profile, news comments (Supabase). All user text is rendered with textContent only. */
(function () {
  'use strict';
  var C = window.MSR_CONFIG || {}, ok = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);
  var sb = ok ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true } }) : null;
  var S = { user: null, profile: null, admin: false }, PAGE = 10, UNAME = /^[A-Za-z0-9_]{3,20}$/, TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  var AV = ok ? C.SUPABASE_URL.replace(/\/$/, '') + '/storage/v1/object/public/avatars/' : '', BACK = location.origin + location.pathname;

  var css = '.msr-auth{display:flex;align-items:center;gap:8px;margin-left:12px;margin-bottom:14px}@media(max-width:760px){.msr-auth{margin-left:auto;margin-bottom:10px}}.msr-btn{background:var(--surface,#161E2A);color:var(--text,#E9EDF3);border:1px solid var(--line,#2A3645);border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;font-size:13px;cursor:pointer}.msr-btn:hover:not(:disabled){border-color:var(--tracer,#2FD27B)}.msr-btn:disabled{opacity:.5;cursor:default}.msr-btn.pri{background:var(--tracer,#2FD27B);color:#06130C;border-color:transparent}.msr-btn.sm{padding:4px 9px;font-size:12px}.msr-btn.link{background:none;border:0;padding:2px 4px;color:var(--muted,#8899AE)}.msr-btn.link:hover{color:var(--text,#E9EDF3)}'
    + '.msr-av{width:32px;height:32px;border-radius:50%;object-fit:cover;background:var(--raised,#1E2836);display:inline-grid;place-items:center;font-size:11px;font-weight:700;color:var(--muted,#8899AE);flex:none}.msr-av.lg{width:84px;height:84px;font-size:24px}'
    + '.msr-menu{position:relative}.msr-pop{position:absolute;right:0;top:calc(100% + 6px);min-width:170px;background:var(--surface,#161E2A);border:1px solid var(--line,#2A3645);border-radius:10px;padding:6px;z-index:60;display:flex;flex-direction:column}.msr-pop a,.msr-pop button{background:none;border:0;color:var(--text,#E9EDF3);text-align:left;padding:8px 10px;border-radius:6px;font:inherit;font-size:13.5px;cursor:pointer;text-decoration:none}.msr-pop a:hover,.msr-pop button:hover{background:var(--raised,#1E2836)}'
    + 'dialog.msr-modal{border:1px solid var(--line,#2A3645);border-radius:14px;background:var(--surface,#161E2A);color:var(--text,#E9EDF3);padding:22px;width:min(400px,92vw)}dialog.msr-modal::backdrop{background:rgba(0,0,0,.65)}.msr-modal h2{margin:0 0 4px;font-size:20px}.msr-modal form{display:flex;flex-direction:column;gap:10px;margin-top:12px}.msr-modal input,.msr-cm textarea{background:var(--bg,#0D121A);color:var(--text,#E9EDF3);border:1px solid var(--line,#2A3645);border-radius:8px;padding:10px 12px;font:inherit;font-size:14px;width:100%;box-sizing:border-box}.msr-modal input:focus,.msr-cm textarea:focus{outline:2px solid var(--tracer,#2FD27B);outline-offset:0}.msr-tabs{display:flex;gap:6px}.msr-tabs button{flex:1}.msr-tabs .on{border-color:var(--tracer,#2FD27B)}.msr-or{text-align:center;color:var(--dim,#5E6F86);font-size:12px;margin:2px 0}.msr-msg{min-height:18px;margin:0;font-size:13px}.msr-msg.bad{color:#FF6B7A}.msr-msg.ok{color:var(--win,#3FB977)}'
    + '.msr-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--raised,#1E2836);border:1px solid var(--line,#2A3645);color:var(--text,#E9EDF3);padding:11px 18px;border-radius:10px;z-index:200;font-size:14px;max-width:90vw}.msr-toast.bad{border-color:#FF6B7A}'
    + '.msr-cm{margin:34px 0 10px}.msr-cm h3{font-size:18px;margin:0 0 14px}.msr-cm textarea{min-height:84px;resize:vertical}.msr-row{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:8px;color:var(--dim,#5E6F86);font-size:12px}.msr-c{display:flex;gap:11px;padding:14px 0;border-top:1px solid var(--line-soft,#1F2937)}.msr-c .bd{flex:1;min-width:0}.msr-c .nm{font-weight:700;font-size:14px}.msr-c .tm{color:var(--dim,#5E6F86);font-size:12px;margin-left:8px}.msr-c .tx{margin:4px 0 6px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5}.msr-c .ac{display:flex;gap:4px;flex-wrap:wrap}.msr-c .ac .on{color:#FF6B7A}.msr-rep{margin-left:43px;border-left:2px solid var(--line-soft,#1F2937);padding-left:10px}.msr-note{color:var(--muted,#8899AE);font-size:14px}.msr-prof{max-width:640px}.msr-prof .hd{display:flex;gap:18px;align-items:center;margin:14px 0 20px}.msr-prof dl{display:grid;grid-template-columns:130px 1fr;gap:8px 12px;margin:0 0 18px;font-size:14px}.msr-prof dt{color:var(--dim,#5E6F86)}.msr-prof dd{margin:0;overflow-wrap:anywhere}.msr-bdg{font-size:11px;font-weight:800;letter-spacing:.08em;padding:2px 8px;border-radius:6px;background:var(--raised,#1E2836);margin-left:8px}';
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
    if (!S.user) { box.appendChild(el('button', { class: 'msr-btn', type: 'button', onclick: function () { openModal('login'); } }, 'Нэвтрэх')); return; }
    var menu = el('div', { class: 'msr-menu' }), btn = el('button', { class: 'msr-btn', type: 'button', 'aria-haspopup': 'true', style: 'display:flex;align-items:center;gap:8px', onclick: function (e) {
      e.stopPropagation(); var ex = menu.querySelector('.msr-pop'); if (ex) { ex.remove(); return; }
      menu.appendChild(el('div', { class: 'msr-pop' }, [el('a', { href: '#profile' }, 'Профайл'), el('button', { type: 'button', onclick: function () { sb.auth.signOut().then(function () { toast('Системээс гарлаа.'); if (location.hash === '#profile') location.hash = '#news'; }); } }, 'Гарах')]));
    } }, [avatar(S.profile), (S.profile && S.profile.username) || 'Профайл']);
    menu.appendChild(btn); box.appendChild(menu);
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
    function say(t, bad) { msg.textContent = t; msg.className = 'msr-msg ' + (bad ? 'bad' : 'ok'); }
    var email = el('input', { type: 'email', required: true, autocomplete: 'email', placeholder: 'Имэйл' });
    var pass = el('input', { type: 'password', required: true, minlength: 8, autocomplete: mode === 'login' ? 'current-password' : 'new-password', placeholder: mode === 'reset' ? 'Шинэ нууц үг (8+ тэмдэгт)' : 'Нууц үг (8+ тэмдэгт)' });
    var pass2 = el('input', { type: 'password', required: true, minlength: 8, autocomplete: 'new-password', placeholder: 'Нууц үгээ давтах' });
    var user = el('input', { type: 'text', required: true, maxlength: 20, autocomplete: 'username', placeholder: 'Username (3–20: үсэг, тоо, _)' });
    var go = el('button', { class: 'msr-btn pri', type: 'submit' }, mode === 'login' ? 'Нэвтрэх' : mode === 'register' ? 'Бүртгүүлэх' : mode === 'forgot' ? 'Холбоос илгээх' : 'Хадгалах');
    var fields = mode === 'login' ? [email, pass] : mode === 'register' ? [user, email, pass, pass2] : mode === 'forgot' ? [email] : [pass, pass2];
    if (mode === 'reset') fields = [pass, pass2];
    var form = el('form', { onsubmit: async function (e) {
      e.preventDefault(); go.disabled = true; say('');
      try {
        if (mode === 'login') { var r = await sb.auth.signInWithPassword({ email: email.value.trim(), password: pass.value }); if (r.error) throw r.error; closeModal(); toast('Тавтай морил!'); }
        else if (mode === 'register') {
          var u = user.value.trim();
          if (!UNAME.test(u)) return say('Username 3–20 тэмдэгт, зөвхөн латин үсэг, тоо, _ байна.', true);
          if (pass.value !== pass2.value) return say('Нууц үг таарахгүй байна.', true);
          var av = await sb.rpc('username_available', { name: u }); if (av.error) throw av.error; if (!av.data) return say('Энэ username аль хэдийн авагдсан байна.', true);
          var s = await sb.auth.signUp({ email: email.value.trim(), password: pass.value, options: { data: { username: u }, emailRedirectTo: BACK } }); if (s.error) throw s.error;
          if (s.data.session) { closeModal(); toast('Бүртгэл амжилттай!'); } else say('Баталгаажуулах холбоос имэйлээр илгээгдлээ. Имэйлээ шалгаад холбоос дээр дарна уу.');
        } else if (mode === 'forgot') { var f = await sb.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: BACK }); if (f.error) throw f.error; say('Хэрэв энэ имэйл бүртгэлтэй бол сэргээх холбоос илгээгдлээ.'); }
        else { if (pass.value !== pass2.value) return say('Нууц үг таарахгүй байна.', true); var up = await sb.auth.updateUser({ password: pass.value }); if (up.error) throw up.error; closeModal(); toast('Нууц үг шинэчлэгдлээ.'); }
      } catch (x) { say(err(x), true); } finally { go.disabled = false; }
    } }, fields.concat([go, msg]));
    var tabs = (mode === 'login' || mode === 'register') ? el('div', { class: 'msr-tabs' }, [['login', 'Нэвтрэх'], ['register', 'Бүртгүүлэх']].map(function (t) { return el('button', { type: 'button', class: 'msr-btn' + (mode === t[0] ? ' on' : ''), onclick: function () { openModal(t[0]); } }, t[1]); })) : null;
    var google = (mode === 'login' || mode === 'register') ? [el('div', { class: 'msr-or' }, 'эсвэл'), el('button', { class: 'msr-btn', type: 'button', onclick: function () { if (C.GOOGLE_AUTH_ENABLED !== true) return toast('Google нэвтрэлт хараахан идэвхжээгүй байна. Имэйлээр нэвтэрнэ үү.', true); sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: BACK } }).then(function (r) { if (r.error) toast(err(r.error), true); }); } }, 'Google-ээр нэвтрэх')] : [];
    var extra = mode === 'login' ? el('button', { class: 'msr-btn link', type: 'button', onclick: function () { openModal('forgot'); } }, 'Нууц үгээ мартсан уу?') : mode === 'forgot' ? el('button', { class: 'msr-btn link', type: 'button', onclick: function () { openModal('login'); } }, '← Нэвтрэх рүү буцах') : null;
    d.appendChild(el('h2', null, title)); if (tabs) d.appendChild(tabs); d.appendChild(form); google.forEach(function (g) { d.appendChild(g); }); if (extra) d.appendChild(extra);
    d.appendChild(el('button', { class: 'msr-btn link', type: 'button', onclick: closeModal, 'aria-label': 'Хаах', style: 'position:absolute;right:10px;top:10px' }, '✕'));
    d.showModal();
  }

  /* ---------- profile page ---------- */
  function profileView() {
    var box = el('div', { class: 'msr-prof' });
    function draw() {
      if (!box.isConnected && box.dataset.m) { document.removeEventListener('msr:auth', draw); return; } box.dataset.m = '1';
      box.textContent = ''; box.appendChild(el('h1', null, 'Профайл'));
      if (!ok) { box.appendChild(el('p', { class: 'msr-note' }, 'Хэрэглэгчийн систем одоохондоо тохируулагдаагүй байна.')); return; }
      if (!S.user) { box.appendChild(el('p', { class: 'msr-note' }, 'Профайлаа харахын тулд нэвтэрнэ үү.')); box.appendChild(el('button', { class: 'msr-btn pri', type: 'button', onclick: function () { openModal('login'); } }, 'Нэвтрэх / Бүртгүүлэх')); return; }
      var p = S.profile || { username: '' }, msg = el('p', { class: 'msr-msg', role: 'status' });
      function say(t, bad) { msg.textContent = t; msg.className = 'msr-msg ' + (bad ? 'bad' : 'ok'); }
      var name = el('input', { type: 'text', maxlength: 20, value: p.username, 'aria-label': 'Username' });
      var file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', 'aria-label': 'Профайл зураг' });
      var save = el('button', { class: 'msr-btn pri', type: 'button', onclick: async function () {
        save.disabled = true; say('');
        try {
          var patch = {}, nv = name.value.trim();
          if (nv !== p.username) { if (!UNAME.test(nv)) return say('Username 3–20 тэмдэгт, зөвхөн латин үсэг, тоо, _ байна.', true); var a = await sb.rpc('username_available', { name: nv }); if (a.error) throw a.error; if (!a.data && nv.toLowerCase() !== p.username.toLowerCase()) return say('Энэ username авагдсан байна.', true); patch.username = nv; }
          var f = file.files[0];
          if (f) {
            if (!TYPES[f.type]) return say('Зөвхөн JPG, PNG, WebP зураг оруулна.', true);
            if (f.size > 2 * 1024 * 1024) return say('Зургийн хэмжээ 2MB-аас бага байна.', true);
            var path = S.user.id + '/avatar-' + Date.now() + '.' + TYPES[f.type], up = await sb.storage.from('avatars').upload(path, f, { contentType: f.type, upsert: false }); if (up.error) throw up.error;
            patch.avatar_url = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
          }
          if (!Object.keys(patch).length) return say('Өөрчлөлт алга.');
          var r = await sb.from('profiles').update(patch).eq('id', S.user.id).select('id').single(); if (r.error) throw r.error;
          await loadUser((await sb.auth.getSession()).data.session); toast('Профайл хадгалагдлаа.');
        } catch (x) { say(err(x), true); } finally { save.disabled = false; }
      } }, 'Хадгалах');
      box.appendChild(el('div', { class: 'hd' }, [avatar(p, 'lg'), el('div', null, [el('b', { style: 'font-size:20px' }, p.username), el('span', { class: 'msr-bdg' }, S.admin ? 'ADMIN' : 'USER')])]));
      box.appendChild(el('dl', null, [el('dt', null, 'Имэйл'), el('dd', null, S.user.email), el('dt', null, 'Бүртгүүлсэн'), el('dd', null, new Date(S.user.created_at).toLocaleDateString('mn-MN')), el('dt', null, 'Username'), el('dd', null, name), el('dt', null, 'Профайл зураг'), el('dd', null, file)]));
      box.appendChild(save); box.appendChild(msg);
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
