/* ATEMPO — SPA estática (hash routing), interações mockadas */
(function () {
  'use strict';

  var D = window.ATEMPO_DATA;
  var ICONS = window.ICONS;
  var ART = window.ART;
  var FORMATS = D.formatos;
  var app = document.getElementById('app');
  var modalRoot = document.getElementById('modal-root');
  var toastEl = document.getElementById('toast');

  /* ---------- utilitários ---------- */
  function ic(n, cls, sw) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function map(a, f) { return a.map(f).join(''); }
  function fmtTime(s) { s = Math.max(0, Math.floor(s)); var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('atempo:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('atempo:' + k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } }
  };

  var now = Date.now(), H = 3600e3;
  var state = {
    nome: store.get('nome', 'Viviane'),
    favs: store.get('favs', ['constitucional/direitos-fundamentais', 'penal/teoria-do-crime']),
    studied: store.get('studied', []),
    hist: store.get('hist', [
      { d: 'empresarial', t: 'teoria-da-empresa', f: 'pdf', ts: now - 2 * H },
      { d: 'constitucional', t: 'direitos-fundamentais', f: 'podcast', ts: now - 26 * H },
      { d: 'penal', t: 'teoria-do-crime', f: 'mapa', ts: now - 50 * H },
      { d: 'civil', t: 'contratos', f: 'video', ts: now - 74 * H }
    ]),
    prefs: store.get('prefs', { notif: true, lembrete: true, autoplay: false, offline: false, meta: '10' }),
    best: store.get('best', {})
  };
  function save(k) { store.set(k, state[k]); }

  var ui = { tab: 0, answers: {}, sel: {}, pdf: { key: '', page: 1, zoom: 100 }, sim: null, mm: null, lmenu: false };

  function disc(id) { return D.disciplinas.filter(function (d) { return d.id === id; })[0]; }
  function topic(d, id) { return d && d.topicos.filter(function (t) { return t.id === id; })[0]; }
  function fmt(id) { return FORMATS.filter(function (f) { return f.id === id; })[0]; }
  function progress() { return Math.min(100, 68 + state.studied.length * 2); }
  function discProgress(d) {
    var n = state.studied.filter(function (k) { return k.indexOf(d.id + '/') === 0; }).length;
    return Math.min(100, d.progresso + n * 4);
  }
  function isFav(d, t) { return state.favs.indexOf(d.id + '/' + t.id) > -1; }
  function isStudied(d, t) { return state.studied.indexOf(d.id + '/' + t.id) > -1; }
  function initial() { return (state.nome.trim()[0] || 'V').toUpperCase(); }

  var content = D.content;

  /* ---------- toast & modais ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.innerHTML = ic('check') + '<span>' + esc(msg) + '</span>';
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }
  function openModal(html, cls) {
    modalRoot.innerHTML = '<div class="modal ' + (cls || '') + '" role="dialog" aria-modal="true"><div class="modal__bg" data-action="close-modal"></div><div class="modal__card">' +
      '<button class="modal__x" data-action="close-modal" aria-label="Fechar">' + ic('x') + '</button>' + html + '</div></div>';
    document.body.classList.add('no-scroll');
    var f = modalRoot.querySelector('[autofocus]');
    if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closeModal() { modalRoot.innerHTML = ''; document.body.classList.remove('no-scroll'); }

  function logo(variant) {
    return '<a href="#/" class="logo logo--' + variant + '" aria-label="ATEMPO — início">' + ic('scale', 'logo__ic', 1.5) +
      '<span class="logo__txt"><b>ATEMPO</b><small>Aprenda no seu tempo</small></span></a>';
  }

  /* ---------- busca ---------- */
  function searchResults(q) {
    q = norm(q.trim());
    if (!q) return null;
    var out = [];
    D.disciplinas.forEach(function (d) {
      if (norm(d.nome).indexOf(q) > -1) out.push({ href: '#/disciplina/' + d.id, t: d.nome, m: 'Disciplina', icon: d.icon });
      d.topicos.forEach(function (t) {
        if (norm(t.nome).indexOf(q) > -1) out.push({ href: '#/disciplina/' + d.id + '/' + t.id, t: t.nome, m: d.nome, icon: 'filetext' });
      });
    });
    FORMATS.forEach(function (f) {
      if (norm(f.nome).indexOf(q) > -1) out.push({ href: '#/estudo/empresarial/teoria-da-empresa/' + f.id, t: f.nome + ' — Teoria da Empresa', m: 'Material · ' + f.dur, icon: f.icon });
    });
    return out.slice(0, 8);
  }
  function searchHTML(q) {
    var r = searchResults(q);
    if (!r) return '';
    if (!r.length) return '<p class="sres__empty">Nenhum resultado para “' + esc(q) + '”.</p>';
    return map(r, function (x) {
      return '<a class="sres__item" href="' + x.href + '">' + '<span class="sres__ic">' + ic(x.icon) + '</span><span><b>' + esc(x.t) + '</b><small>' + esc(x.m) + '</small></span>' + ic('chevronRight', 'sres__go') + '</a>';
    });
  }
  function searchBox(id) {
    return '<div class="search" data-search-wrap><input id="' + id + '" data-search type="search" autocomplete="off" placeholder="Busque por disciplina, assunto ou material..." aria-label="Buscar">' +
      '<span class="search__ic">' + ic('search') + '</span><div class="search__res"></div></div>';
  }

  /* ================= LANDING ================= */
  function viewLanding() {
    var fc = map(FORMATS, function (f) {
      return '<button class="fcard" data-action="open-login"><span class="fcard__ic">' + ic(f.icon, '', 1.7) + '</span>' +
        '<span class="fcard__txt"><b>' + (f.nomeLp || f.nome) + '</b><small>' + f.l1 + '<br>' + f.l2 + '</small></span></button>';
    });
    var dc = map(D.disciplinas, function (d) {
      return '<button class="dcard" data-action="open-login">' + ic(d.icon, '', 1.4) + '<span>' + d.l1 + '<br>' + d.l2 + '</span></button>';
    });
    return '' +
'<div class="landing">' +
  '<header class="lhead">' +
    logo('dark') +
    '<nav class="lnav' + (ui.lmenu ? ' is-open' : '') + '" aria-label="Seções">' +
      '<button data-action="scroll" data-target="inicio" class="is-active">Início</button>' +
      '<button data-action="scroll" data-target="disciplinas">Disciplinas</button>' +
      '<button data-action="scroll" data-target="planos">Planos</button>' +
      '<button data-action="scroll" data-target="sobre">Sobre nós</button>' +
    '</nav>' +
    '<div class="lhead__r">' +
      '<button class="iconbtn" data-action="open-search" aria-label="Buscar">' + ic('search', '', 2) + '</button>' +
      '<button class="btn btn--navy btn--xs" data-action="open-login">Entrar</button>' +
      '<button class="iconbtn lburger" data-action="toggle-lmenu" aria-label="Abrir menu">' + ic(ui.lmenu ? 'x' : 'menu') + '</button>' +
    '</div>' +
  '</header>' +
  '<section class="hero" id="inicio">' +
    '<div class="hero__in">' +
      '<div class="hero__text">' +
        '<p class="hero__kicker">Uma nova forma de aprender</p>' +
        '<h1 class="hero__title"><span class="hero__big">Direito.</span><span class="hero__sub">Aprenda no seu tempo.</span></h1>' +
        '<p class="hero__desc">Conteúdos jurídicos organizados, objetivos e em diferentes formatos, para você estudar de forma prática e eficiente.</p>' +
        '<button class="btn btn--yellow btn--lg" data-action="open-login">Começar a estudar ' + ic('arrowRight', '', 2) + '</button>' +
      '</div>' +
      '<div class="hero__art">' + ART.hero() + '</div>' +
    '</div>' +
  '</section>' +
  '<div class="fcards-wrap"><span class="hero__corner" aria-hidden="true"></span><div class="fcards">' + fc + '</div></div>' +

  '<section class="lsec" id="disciplinas"><div class="lsec__in">' +
    '<p class="kicker">Disciplinas</p><h2 class="lsec__title">Tudo o que você precisa, organizado por matéria</h2>' +
    '<p class="lsec__sub">Escolha a disciplina, o assunto e o formato que combina com o seu momento.</p>' +
    '<div class="dgrid dgrid--lp">' + dc + '</div>' +
  '</div></section>' +

  '<section class="lsec lsec--alt" id="planos"><div class="lsec__in">' +
    '<p class="kicker">Planos</p><h2 class="lsec__title">Comece grátis, evolua no seu ritmo</h2>' +
    '<div class="plans">' +
      plan('Essencial', 'Grátis', '', ['Resumos em PDF', '1 disciplina por vez', 'Histórico de estudos'], false) +
      plan('Estudante', 'R$ 19,90', '/mês', ['Todos os formatos', 'Todas as disciplinas', 'Simulados ilimitados', 'Acesso offline'], true) +
      plan('Aprovação', 'R$ 39,90', '/mês', ['Tudo do Estudante', 'Mentoria mensal', 'Correção de peças', 'Plano de estudos personalizado'], false) +
    '</div>' +
  '</div></section>' +

  '<section class="lsec" id="sobre"><div class="lsec__in about">' +
    '<div><p class="kicker">Sobre nós</p><h2 class="lsec__title">Aprender Direito pode ser leve</h2>' +
      '<p class="lsec__sub">O ATEMPO nasceu para quem estuda entre o trabalho, o estágio e a vida. Transformamos conteúdos jurídicos densos em materiais objetivos — para ler, ouvir, visualizar ou assistir.</p>' +
      '<div class="about__devices">' + ic('devices', '', 1.6) + '<span>Acesse de onde estiver, pelo celular, tablet ou computador.</span></div>' +
    '</div>' +
    '<div class="stats">' +
      stat('6', 'disciplinas') + stat('30+', 'assuntos') + stat('4', 'formatos de estudo') + stat('24h', 'disponível') +
    '</div>' +
  '</div></section>' +

  '<footer class="lfoot"><div class="lfoot__in">' + logo('light') + '<p>© 2026 ATEMPO · Projeto acadêmico — interface demonstrativa.</p></div></footer>' +
'</div>';
  }
  function plan(n, p, per, items, hl) {
    return '<div class="plan' + (hl ? ' is-hl' : '') + '">' + (hl ? '<span class="plan__tag">Mais escolhido</span>' : '') +
      '<h3>' + n + '</h3><p class="plan__price"><b>' + p + '</b>' + per + '</p><ul>' + map(items, function (i) { return '<li>' + ic('check', '', 2.2) + i + '</li>'; }) + '</ul>' +
      '<button class="btn ' + (hl ? 'btn--yellow' : 'btn--navy') + ' btn--block" data-action="open-login">Começar agora</button></div>';
  }
  function stat(n, l) { return '<div class="stat"><b>' + n + '</b><span>' + l + '</span></div>'; }

  function loginHTML() {
    return '<div class="login">' + logo('dark') +
      '<h2>Bem-vinda de volta!</h2><p class="muted">Entre para continuar seus estudos.</p>' +
      '<form data-form="login" novalidate>' +
        '<label class="field"><span>E-mail</span><span class="field__in">' + ic('mail') + '<input type="email" value="viviane@atempo.app" autocomplete="off"></span></label>' +
        '<label class="field"><span>Senha</span><span class="field__in">' + ic('lock') + '<input type="password" value="atempo" autocomplete="off"></span></label>' +
        '<div class="row-between"><label class="chk"><input type="checkbox" checked> Lembrar de mim</label><button type="button" class="link" data-action="toast" data-msg="Enviamos um link de recuperação para o seu e-mail.">Esqueci a senha</button></div>' +
        '<button class="btn btn--navy btn--block btn--lg" type="submit">Entrar ' + ic('arrowRight', '', 2) + '</button>' +
      '</form>' +
      '<p class="login__foot">Não tem conta? <button class="link" data-action="toast" data-msg="Cadastro disponível em breve!">Cadastre-se</button></p></div>';
  }

  /* ================= SHELL (área logada) ================= */
  var NAV = [
    { id: 'inicio', href: '/app', icon: 'home', label: 'Início' },
    { id: 'materias', href: '/materias', icon: 'book', label: 'Minhas Matérias' },
    { id: 'favoritos', href: '/favoritos', icon: 'star', label: 'Favoritos' },
    { id: 'historico', href: '/historico', icon: 'history', label: 'Histórico' },
    { id: 'simulados', href: '/simulados', icon: 'edit', label: 'Simulados' },
    { id: 'configuracoes', href: '/configuracoes', icon: 'settings', label: 'Configurações' }
  ];
  var BNAV = [
    { id: 'inicio', href: '/app', icon: 'home', label: 'Início' },
    { id: 'materias', href: '/materias', icon: 'book', label: 'Minhas Matérias' },
    { id: 'favoritos', href: '/favoritos', icon: 'star', label: 'Favoritos' },
    { id: 'perfil', href: '/perfil', icon: 'user', label: 'Perfil' }
  ];

  function shell(active, inner, opts) {
    opts = opts || {};
    var p = progress();
    var bActive = active === 'historico' || active === 'simulados' || active === 'configuracoes' ? 'perfil' : (opts.bnav || active);
    return '' +
'<div class="shell" id="shell">' +
  '<aside class="sidebar" id="sidebar" aria-label="Menu principal">' +
    '<div class="sidebar__logo' + (opts.stack ? ' is-stack' : '') + '">' + logo('light') +
      '<button class="iconbtn sidebar__close" data-action="close-drawer" aria-label="Fechar menu">' + ic('x') + '</button></div>' +
    '<nav class="snav">' + map(NAV, function (n) {
      return '<a href="#' + n.href + '" class="snav__item' + (active === n.id ? ' is-active' : '') + '" title="' + n.label + '">' + ic(n.icon) + '<span>' + n.label + '</span></a>';
    }) + '</nav>' +
    '<div class="sprog"><div class="sprog__top"><span>Seu progresso</span>' + ic('sparkle', 'sprog__spark') + '</div>' +
      '<div class="sprog__row"><div class="bar"><i style="width:' + p + '%"></i></div><b>' + p + '%</b></div></div>' +
  '</aside>' +
  '<div class="scrim" data-action="close-drawer"></div>' +
  '<div class="main">' +
    '<header class="mtop">' +
      '<button class="iconbtn" data-action="open-drawer" aria-label="Abrir menu">' + ic('menu', '', 2) + '</button>' +
      logo('dark') +
      '<button class="iconbtn bellbtn" data-action="notif" aria-label="Notificações">' + ic('bell') + '<i class="dot"></i></button>' +
    '</header>' +
    '<main class="content' + (opts.wide ? ' content--wide' : '') + '" id="content">' + inner + '</main>' +
  '</div>' +
  '<nav class="bnav" aria-label="Navegação inferior">' + map(BNAV, function (n) {
    return '<a href="#' + n.href + '" class="bnav__item' + (bActive === n.id ? ' is-active' : '') + '">' + ic(n.icon) + '<span>' + n.label + '</span></a>';
  }) + '</nav>' +
'</div>';
  }

  /* ================= DASHBOARD ================= */
  function ring(p, size) {
    var r = 16, c = 2 * Math.PI * r;
    return '<svg class="ring" viewBox="0 0 40 40" width="' + size + '" height="' + size + '" aria-hidden="true"><circle cx="20" cy="20" r="' + r + '" fill="none" stroke="#d6ebe8" stroke-width="5"/>' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="#17958f" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (c * p / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 20 20)"/></svg>';
  }

  function viewDashboard() {
    var p = progress();
    var dcards = map(D.disciplinas, function (d) {
      return '<a class="dcard" href="#/disciplina/' + d.id + '">' + ic(d.icon, '', 1.4) + '<span>' + d.l1 + '<br>' + d.l2 + '</span></a>';
    });
    var recent = [
      { href: '#/estudo/constitucional/teoria-da-constituicao/pdf', icon: 'pdf', t: 'Resumo - Direito Constitucional', m: 'PDF • 12 min' },
      { href: '#/estudo/constitucional/direitos-fundamentais/podcast', icon: 'headphones', t: 'Podcast - Direitos Fundamentais', m: 'Áudio • 15 min' }
    ];
    var inner = '' +
'<div class="dash">' +
  '<div class="dash__head">' +
    '<div class="dash__greet">' +
      '<h1>Olá, ' + esc(state.nome) + '!</h1>' +
      '<p>Que bom te ver por aqui. Vamos continuar seus estudos?</p>' +
      searchBox('q-dash') +
    '</div>' +
    '<div class="dash__side">' +
      '<div class="topicons">' +
        '<button class="iconbtn bellbtn" data-action="notif" aria-label="Notificações">' + ic('bell') + '<i class="dot"></i></button>' +
        '<button class="avatar" data-action="usermenu" aria-label="Menu do usuário">' + initial() + '</button>' +
      '</div>' +
      '<a class="progcard" href="#/materias">' +
        '<div class="progcard__l"><small>Seu progresso</small><strong>' + p + '<span>%</span></strong><div class="bar bar--light"><i style="width:' + p + '%"></i></div></div>' +
        ring(p, 52) +
      '</a>' +
    '</div>' +
  '</div>' +
  '<section><div class="sec-head"><h2>Suas disciplinas</h2><a class="link-more" href="#/materias">Ver todas ' + ic('arrowRight') + '</a></div>' +
    '<div class="dgrid">' + dcards + '</div></section>' +
  '<div class="dash__row">' +
    '<section><div class="sec-head"><h2>Continue estudando</h2></div>' +
      '<div class="ccard"><a class="ccard__img" href="#/estudo/empresarial/teoria-da-empresa/pdf" aria-label="Abrir Teoria da Empresa">' + ART.building() + '</a>' +
        '<div class="ccard__body"><h3>Direito Empresarial</h3><p>Teoria da Empresa · 2h de estudo</p>' +
          '<div class="bar bar--light ccard__bar"><i style="width:' + discProgress(disc('empresarial')) + '%"></i></div></div>' +
        '<a class="btn btn--navy btn--sm" href="#/estudo/empresarial/teoria-da-empresa/pdf">Continuar ' + ic('arrowRight', '', 2) + '</a></div>' +
    '</section>' +
    '<section><div class="sec-head"><h2>Materiais recentes</h2></div>' +
      '<div class="rlist">' + map(recent, function (r) {
        return '<a class="ritem" href="' + r.href + '"><span class="ritem__ic">' + ic(r.icon, '', 1.6) + '</span><span><span class="ritem__t">' + r.t + '</span><span class="ritem__m">' + r.m + '</span></span></a>';
      }) + '</div>' +
    '</section>' +
  '</div>' +
'</div>';
    return shell('inicio', inner, { stack: true });
  }

  /* ================= ASSUNTOS ================= */
  function viewTopics(d) {
    var sel = topic(d, ui.sel[d.id]) || d.topicos[0];
    var inner = '' +
'<a class="back" href="#/app">' + ic('arrowLeft') + ' Voltar</a>' +
'<div class="topics">' +
  '<div>' +
    '<h1 class="page-title">' + d.nome + '</h1>' +
    '<p class="page-sub">Escolha o assunto que deseja estudar:</p>' +
    '<div class="tlist" role="listbox" aria-label="Assuntos">' + map(d.topicos, function (t) {
      var on = t.id === sel.id;
      return '<button class="titem' + (on ? ' is-active' : '') + '" role="option" aria-selected="' + on + '" data-action="select-topic" data-d="' + d.id + '" data-t="' + t.id + '">' +
        '<span class="titem__l">' + ic('diamond', 'titem__dot', 2) + '<span>' + t.nome + '</span>' + (D.especifico[d.id + '/' + t.id] ? '<em class="tag tag--pdf">Apostila</em>' : '') + (isStudied(d, t) ? '<em class="tag">Estudado</em>' : '') + '</span>' + ic('chevronRight') + '</button>';
    }) + '</div>' +
  '</div>' +
  '<aside class="tdetail" id="tdetail">' +
    ic('landmark', 'tdetail__ic', 1.3) +
    (D.especifico[d.id + '/' + sel.id] ? '<span class="tdetail__badge">' + ic('pdf', '', 1.6) + 'Apostila ATEMPO · ' + D.especifico[d.id + '/' + sel.id].pdf.n + ' páginas</span>' : '') +
    '<h2>' + sel.nome + '</h2>' +
    '<p>' + sel.desc + '</p>' +
    '<a class="btn btn--navy" href="#/disciplina/' + d.id + '/' + sel.id + '">Ver formatos de estudo ' + ic('arrowRight', '', 2) + '</a>' +
  '</aside>' +
'</div>';
    return shell('', inner, { bnav: 'materias' });
  }

  /* ================= FORMATOS ================= */
  function viewFormats(d, t) {
    var last = store.get('lastFmt', 'pdf');
    var inner = '' +
'<a class="back" href="#/disciplina/' + d.id + '">' + ic('arrowLeft') + ' Voltar</a>' +
'<nav class="crumbs" aria-label="Caminho"><a href="#/disciplina/' + d.id + '">' + d.nome + '</a>' + ic('chevronRight') + '<span>' + t.nome + '</span></nav>' +
'<h1 class="page-title fmt-title">Escolha o formato ideal para você:</h1>' +
'<div class="fmt-grid">' + map(FORMATS, function (f) {
  return '<a class="fmt' + (f.id === last ? ' is-active' : '') + '" href="#/estudo/' + d.id + '/' + t.id + '/' + f.id + '">' +
    (f.id === last ? '<span class="fmt__badge" title="Último formato usado">' + ic('check', '', 2.4) + '</span>' : '') +
    ic(f.iconFmt || f.icon, 'fmt__ic', 1.5) + '<h3>' + f.nome + '</h3><p>' + f.l1 + '<br>' + f.l2.replace(/$/, '.') + '</p><span class="btn btn--white">Selecionar</span></a>';
}) + '</div>';
    return shell('', inner, { bnav: 'materias' });
  }

  /* ================= ÁREA DE ESTUDO ================= */
  /* áudio real: um elemento para podcast/videoaula e outro para "Ouvir resumo" */
  var AUDIO = window.ATEMPO_AUDIO || {};
  var audio = new Audio(), resumoAudio = new Audio();
  audio.preload = 'metadata'; resumoAudio.preload = 'none';
  var player = { key: '', info: null, speed: 1, d: null, t: null, kind: '' };
  function audioInfo(d, t, kind) { return (AUDIO[d.id + '/' + t.id] || {})[kind]; }
  function pDur() { return (player.info && player.info.dur) || audio.duration || 0; }
  function pTime() { return audio.currentTime || 0; }
  function stopPlayer() { audio.pause(); resumoAudio.pause(); }
  function setupPlayer(kind, d, t) {
    var key = d.id + '/' + t.id + '/' + kind;
    if (player.key !== key) {
      audio.pause();
      player.key = key; player.kind = kind; player.d = d; player.t = t;
      player.info = audioInfo(d, t, kind);
      audio.src = player.info ? player.info.src : '';
      audio.defaultPlaybackRate = audio.playbackRate = player.speed;
    }
    return player.info;
  }
  function chapterIdx(list) {
    var idx = 0, now = pTime();
    (list || []).forEach(function (x, i) { if (now >= x.t - 0.05) idx = i; });
    return idx;
  }
  function mediaSession() {
    if (!('mediaSession' in navigator) || !player.t) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: player.t.nome, artist: player.kind === 'podcast' ? 'ATEMPO Podcast' : 'ATEMPO Videoaula', album: player.d.nome, artwork: [{ src: 'assets/icon.svg', sizes: '512x512', type: 'image/svg+xml' }] });
      navigator.mediaSession.setActionHandler('seekbackward', function () { audio.currentTime = Math.max(0, pTime() - 15); });
      navigator.mediaSession.setActionHandler('seekforward', function () { audio.currentTime = Math.min(pDur(), pTime() + 15); });
    } catch (e) { /* Media Session indisponível */ }
  }

  function viewStudy(d, t, f) {
    var c = content(d, t);
    var key = d.id + '/' + t.id;
    if (ui.pdf.key !== key) { ui.pdf = { key: key, page: 1, zoom: 100 }; ui.tab = 0; ui.mm = null; }
    store.set('lastFmt', f.id);
    addHist(d, t, f);
    var fav = isFav(d, t), studied = isStudied(d, t);
    var main;
    if (f.id === 'pdf') main = pdfViewer(c, d, t);
    else if (f.id === 'podcast') main = podcastView(c, d, t, f);
    else if (f.id === 'video') main = videoView(c, d, t, f);
    else main = mindmapView(c, d, t);

    var inner = '' +
'<div class="study-top">' +
  '<nav class="crumbs crumbs--study" aria-label="Caminho">' +
    '<a class="crumbs__back" href="#/disciplina/' + d.id + '/' + t.id + '" aria-label="Voltar">' + ic('arrowLeft') + '</a>' +
    '<a href="#/materias">' + d.l1 + '</a>' + ic('chevronRight') + '<a href="#/disciplina/' + d.id + '">' + d.abrev + '</a>' + ic('chevronRight') +
    '<a href="#/disciplina/' + d.id + '/' + t.id + '">' + t.nome + '</a>' + ic('chevronRight') + '<span>' + f.nome + '</span>' +
  '</nav>' +
  '<button class="iconbtn bm' + (fav ? ' is-on' : '') + '" data-action="fav" data-d="' + d.id + '" data-t="' + t.id + '" aria-label="' + (fav ? 'Remover dos favoritos' : 'Favoritar') + '">' + ic(fav ? 'bookmarkFill' : 'bookmark') + '</button>' +
'</div>' +
'<div class="study">' +
  '<div class="study__main">' + main + '</div>' +
  '<div class="study__side">' +
    panel(c, d, t) +
    '<div class="actions">' +
      '<button class="abtn' + (studied ? ' is-on' : '') + '" data-action="studied" data-d="' + d.id + '" data-t="' + t.id + '"><span class="abtn__chk">' + ic('check', '', 2.6) + '</span>' + (studied ? 'Estudado' : 'Marcar como estudado') + '</button>' +
      '<button class="abtn' + (fav ? ' is-fav' : '') + '" data-action="fav" data-d="' + d.id + '" data-t="' + t.id + '">' + ic(fav ? 'bookmarkFill' : 'bookmark', 'abtn__bm') + (fav ? 'Favoritado' : 'Favoritar') + '</button>' +
    '</div>' +
  '</div>' +
'</div>';
    return shell('', inner, { bnav: 'materias', wide: true });
  }

  function pageCount(c) { return c.pdf ? c.pdf.n : c.pages.length; }
  function pdfImg(c, n) { return c.pdf.dir + '/p' + (n < 10 ? '0' : '') + n + '.jpg'; }
  function pdfReal(c, d, t) {
    var P = c.pdf, pg = ui.pdf.page, z = ui.pdf.zoom;
    return '' +
'<div class="viewer viewer--real">' +
  '<div class="vbar">' +
    '<div class="vbar__l"><a class="vlink" href="#/disciplina/' + d.id + '/' + t.id + '">' + ic('chevronLeft') + '<span>Voltar</span></a><button class="vbtn" data-action="pdf-toc" aria-label="Sumário">' + ic('menu') + '</button></div>' +
    '<div class="vbar__c">' +
      '<button class="vbtn" data-action="pdf-prev" aria-label="Página anterior"' + (pg <= 1 ? ' disabled' : '') + '>' + ic('chevronLeft') + '</button>' +
      '<span class="vnum">' + pg + ' / ' + P.n + '</span>' +
      '<button class="vbtn" data-action="pdf-next" aria-label="Próxima página"' + (pg >= P.n ? ' disabled' : '') + '>' + ic('chevronRight') + '</button>' +
      '<span class="vsep"></span>' +
      '<button class="vbtn" data-action="zoom" data-z="-20" aria-label="Diminuir zoom"' + (z <= 60 ? ' disabled' : '') + '>' + ic('minus') + '</button>' +
      '<span class="vnum hide-sm">' + z + '%</span>' +
      '<button class="vbtn" data-action="zoom" data-z="20" aria-label="Aumentar zoom"' + (z >= 200 ? ' disabled' : '') + '>' + ic('plus') + '</button>' +
      '<button class="vbtn hide-sm" data-action="zoom" data-z="0" aria-label="Ajustar à largura">' + ic('target') + '</button>' +
    '</div>' +
    '<div class="vbar__r"><a class="vbtn" href="' + P.src + '" download aria-label="Baixar PDF" title="Baixar PDF">' + ic('download') + '</a>' +
      '<a class="vbtn hide-sm" href="' + P.src + '" target="_blank" rel="noopener" aria-label="Abrir o PDF original para imprimir" title="Abrir PDF original">' + ic('printer') + '</a>' +
      '<button class="vbtn hide-sm" data-action="fullscreen" data-el=".viewer" aria-label="Tela cheia">' + ic('maximize') + '</button></div>' +
  '</div>' +
  '<div class="vstage vstage--img' + (z > 100 ? ' is-zoom' : '') + '" data-swipe="pdf">' +
    '<img class="vimg" src="' + pdfImg(c, pg) + '" style="width:' + z + '%" alt="Página ' + pg + ' de ' + P.n + ' da apostila ' + esc(t.nome) + '" draggable="false">' +
  '</div>' +
  '<div class="vfoot"><span>' + ic('pdf', '', 1.6) + 'Apostila ATEMPO · ' + esc(c.parte) + '</span><a href="' + P.src + '" target="_blank" rel="noopener">Abrir PDF original ' + ic('arrowRight', '', 2) + '</a></div>' +
'</div>';
  }
  function pdfViewer(c, d, t) {
    if (c.pdf) return pdfReal(c, d, t);
    var pg = c.pages[ui.pdf.page - 1], n = 0;
    for (var i = 0; i < ui.pdf.page - 1; i++) n += c.pages[i].length;
    var body = map(pg, function (s, i) {
      return '<h4>' + (n + i + 1) + '. ' + s.h + '</h4>' + (s.p ? '<p>' + s.p + '</p>' : '') + (s.li ? '<ul>' + map(s.li, function (x) { return '<li>' + x + '</li>'; }) + '</ul>' : '');
    });
    return '' +
'<div class="viewer">' +
  '<div class="vbar">' +
    '<div class="vbar__l"><a class="vlink" href="#/disciplina/' + d.id + '/' + t.id + '">' + ic('chevronLeft') + '<span>Voltar</span></a><button class="vbtn hide-sm" data-action="toast" data-msg="Sumário: 8 páginas · ' + esc(t.nome) + '" aria-label="Sumário">' + ic('more') + '</button></div>' +
    '<div class="vbar__c">' +
      '<button class="vbtn" data-action="pdf-prev" aria-label="Página anterior"' + (ui.pdf.page <= 1 ? ' disabled' : '') + '>' + ic('chevronLeft') + '</button>' +
      '<span class="vnum">' + ui.pdf.page + ' / ' + c.pages.length + '</span>' +
      '<button class="vbtn" data-action="pdf-next" aria-label="Próxima página"' + (ui.pdf.page >= c.pages.length ? ' disabled' : '') + '>' + ic('chevronRight') + '</button>' +
      '<span class="vsep"></span>' +
      '<button class="vbtn" data-action="zoom" data-z="-10" aria-label="Diminuir zoom">' + ic('minus') + '</button>' +
      '<span class="vnum">' + ui.pdf.zoom + '%</span>' +
      '<button class="vbtn" data-action="zoom" data-z="10" aria-label="Aumentar zoom">' + ic('plus') + '</button>' +
      '<button class="vbtn hide-sm" data-action="zoom" data-z="0" aria-label="Ajustar">' + ic('target') + '</button>' +
    '</div>' +
    '<div class="vbar__r"><button class="vbtn" data-action="toast" data-msg="Download do PDF iniciado (demonstração)." aria-label="Baixar">' + ic('download') + '</button>' +
      '<button class="vbtn hide-sm" data-action="toast" data-msg="Enviado para impressão (demonstração)." aria-label="Imprimir">' + ic('printer') + '</button>' +
      '<button class="vbtn hide-sm" data-action="fullscreen" data-el=".viewer" aria-label="Tela cheia">' + ic('maximize') + '</button></div>' +
  '</div>' +
  '<div class="vstage" data-swipe="pdf">' +
    '<article class="vpage" style="--z:' + (ui.pdf.zoom / 100) + '">' +
      '<div class="vpage__body">' +
        (ui.pdf.page === 1 ? '<h2>' + t.nome + '</h2><p class="vpage__sub">' + d.nome + '</p>' : '<p class="vpage__run">' + t.nome + ' · ' + d.nome + '</p>') +
        body +
      '</div>' +
      '<span class="vpage__num">' + ui.pdf.page + '</span>' +
    '</article>' +
  '</div>' +
'</div>';
  }

  function panel(c, d, t) {
    var tabs = ['Resumo', 'Referências', 'Questões'];
    var body;
    if (ui.tab === 0) {
      var ra = audioInfo(d, t, 'resumo'), ron = ra && !resumoAudio.paused && resumoAudio.getAttribute('src') === ra.src;
      body = '<div class="rhead"><h3>Resumo</h3>' + (ra ? '<button class="rplay' + (ron ? ' is-on' : '') + '" id="r-play" data-action="resumo-audio" data-src="' + ra.src + '">' + ic(ron ? 'pause' : 'volume') + '<span>' + (ron ? 'Pausar' : 'Ouvir resumo') + '</span></button>' : '') + '</div><ul class="blist">' + map(c.resumo, function (r) { return '<li>' + r + '</li>'; }) + '</ul>';
    } else if (ui.tab === 1) {
      body = '<h3>Referências</h3><ul class="rflist">' + map(c.refs, function (r) { return '<li>' + ic('book', '', 1.6) + '<span>' + r + '</span></li>'; }) + '</ul>';
    } else {
      body = '<h3>Questões</h3>' + map(c.questoes, function (q, qi) {
        var k = d.id + '/' + t.id + '/' + qi, ans = ui.answers[k];
        return '<div class="q"><p class="q__t"><b>' + (qi + 1) + '.</b> ' + q.q + '</p>' + map(q.opts, function (o, oi) {
          var cls = ans === undefined ? '' : (oi === q.a ? ' ok' : (oi === ans ? ' bad' : ' dim'));
          return '<button class="opt' + cls + '" data-action="answer" data-k="' + k + '" data-o="' + oi + '"' + (ans !== undefined ? ' disabled' : '') + '><span class="opt__l">' + 'ABCD'[oi] + '</span>' + o + '</button>';
        }) + (ans !== undefined ? '<p class="q__exp ' + (ans === q.a ? 'is-ok' : 'is-bad') + '">' + (ans === q.a ? 'Correto! ' : 'Resposta correta: ' + 'ABCD'[q.a] + '. ') + q.exp + '</p>' : '') + '</div>';
      });
    }
    return '<aside class="panel"><div class="tabs" role="tablist">' + map(tabs, function (n, i) {
      return '<button class="tab' + (ui.tab === i ? ' is-active' : '') + '" role="tab" aria-selected="' + (ui.tab === i) + '" data-action="tab" data-i="' + i + '">' + n + '</button>';
    }) + '</div><div class="panel__body">' + body + '</div></aside>';
  }

  function chapList(list) {
    var cur = chapterIdx(list);
    return '<div class="chapters"><h3>Capítulos</h3>' + map(list, function (x, i) {
      return '<button class="chap' + (i === cur ? ' is-on' : '') + '" data-action="seekto" data-s="' + x.t + '" data-i="' + i + '"><span class="chap__n">' + (i + 1) + '</span><span class="chap__t">' + esc(x.h) + '</span><span class="chap__time">' + fmtTime(x.t) + '</span></button>';
    }) + '</div>';
  }

  function podcastView(c, d, t) {
    var info = setupPlayer('podcast', d, t), playing = !audio.paused;
    var ch = info ? info.ch : [];
    var bars = '';
    for (var i = 0; i < 28; i++) bars += '<i style="--h:' + (20 + Math.round(Math.abs(Math.sin(i * 1.7)) * 70)) + '%;--d:' + (i % 7) * 0.09 + 's"></i>';
    return '' +
'<div class="player' + (playing ? ' is-playing' : '') + '" id="player">' +
  '<div class="player__top">' +
    '<div class="player__cover">' + ic('headphones', '', 1.4) + '<div class="wave">' + bars + '</div><span>ATEMPO Podcast</span></div>' +
    '<div class="player__info">' +
      '<small>Podcast · ' + d.nome + '</small>' +
      '<h2>' + t.nome + '</h2>' +
      '<p>' + t.desc + '</p>' +
      progressBar('') +
      '<div class="ptimes"><span id="p-cur">' + fmtTime(pTime()) + '</span><span>' + fmtTime(pDur()) + '</span></div>' +
      '<div class="pctrl">' +
        '<button class="pbtn" data-action="skip" data-s="-15" aria-label="Voltar 15 segundos">' + ic('back15', '', 1.7) + '</button>' +
        '<button class="pbtn pbtn--main" data-action="play" aria-label="Reproduzir ou pausar" id="p-play">' + ic(playing ? 'pause' : 'play') + '</button>' +
        '<button class="pbtn" data-action="skip" data-s="15" aria-label="Avançar 15 segundos">' + ic('fwd15', '', 1.7) + '</button>' +
        '<button class="pspeed" data-action="speed" id="p-speed">' + player.speed + 'x</button>' +
      '</div>' +
    '</div>' +
  '</div>' +
  chapList(ch) +
'</div>';
  }
  function progressBar(cls) {
    var pct = pDur() ? pTime() / pDur() * 100 : 0;
    return '<div class="ptrack' + cls + '" data-action="seek" role="slider" aria-label="Progresso" aria-valuemin="0" aria-valuemax="' + Math.round(pDur()) + '" aria-valuenow="' + Math.floor(pTime()) + '"><i id="p-fill" style="width:' + pct + '%"></i></div>';
  }

  function videoSlide() {
    var sl = player.info ? player.info.slides : [];
    if (!sl.length) return '';
    var idx = chapterIdx(sl), s = sl[idx];
    return '<small>' + (idx + 1) + ' / ' + sl.length + ' · ' + esc(idx === 0 ? 'Introdução' : s.h) + '</small><h3>' + esc(s.h) + '</h3><ul>' + map(s.pts, function (p) { return '<li>' + esc(p) + '</li>'; }) + '</ul>';
  }
  function videoView(c, d, t) {
    var info = setupPlayer('video', d, t), playing = !audio.paused;
    var ch = info ? info.slides.map(function (s, i) { return { h: i === 0 ? 'Introdução' : s.h, t: s.t }; }) : [];
    return '' +
'<div class="vid' + (playing ? ' is-playing' : '') + '" id="player">' +
  '<div class="vid__screen">' +
    '<div class="vid__slide" id="v-slide">' + videoSlide() + '</div>' +
    '<div class="vid__prof" aria-hidden="true"><span>' + ic('user', '', 1.5) + '</span><b>Prof.ª Helena Martins</b></div>' +
    '<button class="vid__big" data-action="play" aria-label="Reproduzir">' + ic('play') + '</button>' +
    '<div class="vid__bar">' +
      '<button class="vbtn" data-action="play" id="p-play" aria-label="Reproduzir ou pausar">' + ic(playing ? 'pause' : 'play') + '</button>' +
      '<span class="vid__time"><span id="p-cur">' + fmtTime(pTime()) + '</span> / ' + fmtTime(pDur()) + '</span>' +
      progressBar(' ptrack--dark') +
      '<button class="pspeed pspeed--dark" data-action="speed" id="p-speed">' + player.speed + 'x</button>' +
      '<button class="vbtn" data-action="mute" id="p-mute" aria-label="Som">' + ic(audio.muted ? 'volumeOff' : 'volume') + '</button>' +
      '<button class="vbtn" data-action="fullscreen" data-el=".vid__screen" aria-label="Tela cheia">' + ic('maximize') + '</button>' +
    '</div>' +
  '</div>' +
  '<div class="vid__meta"><small>Videoaula · ' + d.nome + '</small><h2>' + t.nome + '</h2></div>' +
  chapList(ch) +
'</div>';
  }

  function mindmapView(c) {
    var m = c.mapa, W = 820, Hh = 540, cx = W / 2, cy = Hh / 2, n = m.ramos.length;
    var lines = '', nodes = '';
    function box(x, y, txt, cls, i, fs) {
      var w = Math.max(70, txt.length * (fs * 0.6) + 26), h = fs * 2.5;
      return '<g class="mm__node ' + cls + (ui.mm === i ? ' is-sel' : '') + '"' + (i !== undefined ? ' data-action="mm" data-i="' + i + '" tabindex="0" role="button"' : '') + '>' +
        '<rect x="' + (x - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + h / 2 + '"/>' +
        '<text x="' + x + '" y="' + (y + fs * 0.35) + '" text-anchor="middle" font-size="' + fs + '">' + esc(txt) + '</text></g>';
    }
    m.ramos.forEach(function (r, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      var bx = cx + Math.cos(a) * 205, by = cy + Math.sin(a) * 150;
      lines += '<path d="M' + cx + ' ' + cy + ' Q' + ((cx + bx) / 2) + ' ' + (cy + (by - cy) * 0.1) + ' ' + bx + ' ' + by + '" class="mm__l1"/>';
      r.c.forEach(function (ch, j) {
        var spread = (j - (r.c.length - 1) / 2) * 0.36;
        var aa = a + spread;
        var x = cx + Math.cos(aa) * 335, y = cy + Math.sin(aa) * 228;
        x = Math.max(70, Math.min(W - 70, x)); y = Math.max(24, Math.min(Hh - 24, y));
        lines += '<path d="M' + bx + ' ' + by + ' L' + x + ' ' + y + '" class="mm__l2"/>';
        nodes += box(x, y, ch, 'mm__leaf', undefined, 12);
      });
      nodes += box(bx, by, r.n, 'mm__branch', i, 14);
    });
    nodes += box(cx, cy, m.centro, 'mm__center', -1, 16);
    var sel = ui.mm !== null && ui.mm >= 0 ? m.ramos[ui.mm] : null;
    return '' +
'<div class="mm">' +
  '<div class="mm__head"><div><small>Mapa mental</small><h2>' + esc(m.centro) + '</h2></div><span class="mm__hint">' + ic('info') + 'Toque nos ramos para explorar</span></div>' +
  '<div class="mm__tree"><div class="mm__root">' + esc(m.centro) + '</div>' + map(m.ramos, function (r, i) {
    return '<button class="mm__tb' + (ui.mm === i ? ' is-sel' : '') + '" data-action="mm" data-i="' + i + '"><b>' + esc(r.n) + '</b><span class="mm__chips">' + map(r.c, function (ch) { return '<i>' + esc(ch) + '</i>'; }) + '</span>' +
      (ui.mm === i ? '<p>' + esc(r.d) + '</p>' : '') + '</button>';
  }) + '</div>' +
  '<div class="mm__scroll"><svg class="mm__svg" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="Mapa mental de ' + esc(m.centro) + '">' + lines + nodes + '</svg></div>' +
  '<div class="mm__info' + (sel ? ' is-on' : '') + '">' + (sel ? '<b>' + esc(sel.n) + '</b><p>' + esc(sel.d) + '</p>' : '<p>Selecione um ramo do mapa para ver a explicação.</p>') + '</div>' +
'</div>';
  }

  function addHist(d, t, f) {
    var h0 = state.hist[0];
    if (h0 && h0.d === d.id && h0.t === t.id && h0.f === f.id) { h0.ts = Date.now(); save('hist'); return; }
    state.hist = state.hist.filter(function (h) { return !(h.d === d.id && h.t === t.id && h.f === f.id); });
    state.hist.unshift({ d: d.id, t: t.id, f: f.id, ts: Date.now() });
    state.hist = state.hist.slice(0, 15);
    save('hist');
  }

  /* ================= PÁGINAS DO MENU ================= */
  function pageHead(title, sub) { return '<h1 class="page-title">' + title + '</h1>' + (sub ? '<p class="page-sub">' + sub + '</p>' : ''); }

  function viewMaterias() {
    var inner = pageHead('Minhas Matérias', 'Acompanhe seu progresso em cada disciplina.') +
      '<div class="mgrid">' + map(D.disciplinas, function (d) {
        var p = discProgress(d), n = state.studied.filter(function (k) { return k.indexOf(d.id + '/') === 0; }).length;
        return '<a class="mcard" href="#/disciplina/' + d.id + '"><span class="mcard__ic">' + ic(d.icon, '', 1.5) + '</span>' +
          '<div class="mcard__b"><h3>' + d.nome + '</h3><p>' + d.topicos.length + ' assuntos · ' + n + ' estudado' + (n === 1 ? '' : 's') + '</p>' +
          '<div class="mcard__p"><div class="bar bar--light"><i style="width:' + p + '%"></i></div><b>' + p + '%</b></div></div>' + ic('chevronRight', 'mcard__go') + '</a>';
      }) + '</div>';
    return shell('materias', inner);
  }

  function viewFavoritos() {
    var items = state.favs.map(function (k) { var s = k.split('/'), d = disc(s[0]); return d && { d: d, t: topic(d, s[1]) }; }).filter(function (x) { return x && x.t; });
    var inner = pageHead('Favoritos', 'Seus conteúdos salvos para revisar depois.') + (items.length ?
      '<div class="list">' + map(items, function (x) {
        return '<div class="lrow"><a class="lrow__main" href="#/disciplina/' + x.d.id + '/' + x.t.id + '"><span class="lrow__ic lrow__ic--star">' + ic('starFill') + '</span>' +
          '<span><b>' + x.t.nome + '</b><small>' + x.d.nome + '</small></span></a>' +
          '<button class="iconbtn" data-action="fav" data-d="' + x.d.id + '" data-t="' + x.t.id + '" aria-label="Remover dos favoritos">' + ic('trash') + '</button></div>';
      }) + '</div>' :
      empty('star', 'Você ainda não favoritou nenhum conteúdo.', 'Toque em “Favoritar” na área de estudo para salvar aqui.'));
    return shell('favoritos', inner);
  }

  function when(ts) {
    var dt = new Date(ts), today = new Date(); today.setHours(0, 0, 0, 0);
    var diff = Math.floor((today - new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())) / 864e5);
    var hm = (dt.getHours() < 10 ? '0' : '') + dt.getHours() + ':' + (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes();
    if (diff <= 0) return 'Hoje, ' + hm;
    if (diff === 1) return 'Ontem, ' + hm;
    return diff + ' dias atrás';
  }
  function viewHistorico() {
    var items = state.hist.map(function (h) { var d = disc(h.d), t = topic(d, h.t), f = fmt(h.f); return d && t && f && { d: d, t: t, f: f, ts: h.ts }; }).filter(Boolean);
    var inner = pageHead('Histórico', 'Tudo o que você estudou recentemente.') + (items.length ?
      '<div class="timeline">' + map(items, function (x) {
        return '<a class="tl" href="#/estudo/' + x.d.id + '/' + x.t.id + '/' + x.f.id + '"><span class="tl__ic">' + ic(x.f.icon, '', 1.6) + '</span>' +
          '<span class="tl__b"><b>' + x.t.nome + '</b><small>' + x.d.nome + ' · ' + x.f.nome + '</small></span><span class="tl__w">' + when(x.ts) + '</span></a>';
      }) + '</div>' : empty('history', 'Nenhum estudo registrado ainda.', ''));
    return shell('historico', inner);
  }

  /* ================= SIMULADOS ================= */
  function simById(id) { return D.simulados.filter(function (x) { return x.id === id; })[0]; }
  function simProg(id) { return store.get('sim:' + id, null); }
  function simSave() { if (ui.sim) store.set('sim:' + ui.sim.id, { i: ui.sim.i, answers: ui.sim.answers }); }
  function simAnswered(ans) { return ans.filter(function (a) { return a !== undefined && a !== null; }).length; }
  function simBtn(s, label) {
    var pr = simProg(s.id), n = pr ? simAnswered(pr.answers) : 0;
    return n ? '<div class="scard__btns"><button class="btn btn--navy" data-action="sim-start" data-id="' + s.id + '">Continuar (' + n + '/' + s.qs.length + ') ' + ic('arrowRight', '', 2) + '</button>' +
      '<button class="btn btn--ghost" data-action="sim-start" data-id="' + s.id + '" data-fresh="1">Recomeçar</button></div>'
      : '<button class="btn btn--navy btn--block" data-action="sim-start" data-id="' + s.id + '">' + label + ' ' + ic('arrowRight', '', 2) + '</button>';
  }
  function viewSimulados() {
    if (ui.sim) return shell('simulados', simRun());
    var main = simById('oab46'), apost = simById('empresarial'), b = state.best[main.id];
    var areas = D.simulados.filter(function (s) { return s.area; });
    var inner = pageHead('Simulados', 'Treine com questões reais da OAB e com as questões das suas apostilas.') +
      '<section class="sfeat">' +
        '<div class="sfeat__b"><span class="sfeat__tag">' + ic('trophy', '', 1.8) + 'Prova real · FGV</span><h2>' + main.nome + '</h2><p>' + main.desc + '</p>' +
          '<div class="sfeat__meta"><span>' + ic('filetext') + main.qs.length + ' questões</span><span>' + ic('clock') + '5 horas</span><span>' + ic('book') + areas.length + ' disciplinas</span>' + (b !== undefined ? '<span class="sfeat__best">' + ic('trophy') + 'Melhor: ' + b + '%</span>' : '') + '</div>' +
          simBtn(main, b !== undefined ? 'Refazer a prova' : 'Começar a prova') + '</div>' +
        '<div class="sfeat__ring" aria-hidden="true"><b>80</b><small>questões</small></div>' +
      '</section>' +
      '<h3 class="ssec">Das suas apostilas</h3>' +
      '<div class="sgrid">' + scard(apost, 'briefcase') + '</div>' +
      '<h3 class="ssec">Treine por disciplina <small>46º Exame de Ordem</small></h3>' +
      '<div class="agrid">' + map(areas, function (s) {
        var bb = state.best[s.id], pr = simProg(s.id), n = pr ? simAnswered(pr.answers) : 0;
        return '<button class="acard" data-action="sim-start" data-id="' + s.id + '"><b>' + s.nome + '</b><small>' + s.qs.length + ' questões' + (n ? ' · ' + n + ' feitas' : '') + '</small>' +
          (bb !== undefined ? '<em>' + bb + '%</em>' : ic('chevronRight', 'acard__go')) + '</button>';
      }) + '</div>';
    return shell('simulados', inner);
  }
  function scard(s, icon) {
    var b = state.best[s.id];
    return '<div class="scard"><span class="scard__ic">' + ic(icon || 'edit', '', 1.6) + '</span><h3>' + s.nome + '</h3><p>' + s.desc + '</p>' +
      '<div class="scard__meta"><span>' + ic('filetext') + s.qs.length + ' questões</span><span>' + ic('clock') + s.min + ' min</span>' + (b !== undefined ? '<span class="scard__best">' + ic('trophy') + b + '%</span>' : '') + '</div>' +
      simBtn(s, b !== undefined ? 'Refazer' : 'Iniciar simulado') + '</div>';
  }
  function simResult(s, S) {
    var ok = 0, byArea = {}, order = [];
    s.qs.forEach(function (q, i) {
      var k = q.areaNome || 'Questões';
      if (!byArea[k]) { byArea[k] = { ok: 0, n: 0 }; order.push(k); }
      byArea[k].n++;
      if (S.answers[i] === q.a) { ok++; byArea[k].ok++; }
    });
    var N = s.qs.length, pct = Math.round(ok / N * 100), blank = N - simAnswered(S.answers);
    var full = s.id === 'oab46', pass = ok >= 40;
    var head = full ? (pass ? 'Aprovada na 1ª fase, ' + esc(state.nome) + '!' : 'Faltaram ' + (40 - ok) + ' acertos para a aprovação') : (pct >= 70 ? 'Mandou bem, ' + esc(state.nome) + '!' : 'Continue praticando!');
    return '<div class="simres">' + ring(pct, 120) + '<b class="simres__pct">' + pct + '%</b><h2>' + head + '</h2>' +
      '<p>Você acertou <b>' + ok + ' de ' + N + '</b> questões em “' + esc(s.nome) + '”' + (blank ? ' (' + blank + ' em branco)' : '') + '.' + (full ? ' Na OAB, a aprovação na 1ª fase exige 40 acertos.' : '') + '</p>' +
      (order.length > 1 ? '<div class="sarea">' + map(order, function (k) {
        var x = byArea[k], p2 = Math.round(x.ok / x.n * 100);
        return '<div class="sarea__r"><span>' + esc(k) + '</span><div class="bar bar--light"><i style="width:' + p2 + '%"></i></div><b>' + x.ok + '/' + x.n + '</b></div>';
      }) + '</div>' : '') +
      '<div class="simres__btns"><button class="btn btn--navy" data-action="sim-review">' + ic('history', '', 2) + ' Revisar respostas</button><button class="btn btn--ghost" data-action="sim-start" data-id="' + s.id + '" data-fresh="1">Refazer</button><button class="btn btn--ghost" data-action="sim-exit">Voltar aos simulados</button></div></div>';
  }
  function simRun() {
    var S = ui.sim, s = simById(S.id), N = s.qs.length;
    if (S.done) return simResult(s, S);
    var q = s.qs[S.i], ans = S.answers[S.i], has = ans !== undefined && ans !== null, done = simAnswered(S.answers);
    var stem = q.p ? '<div class="simq__stem">' + map(q.p, function (x, i) { return '<p' + (i === q.p.length - 1 ? ' class="simq__cmd"' : '') + '>' + esc(x) + '</p>'; }) + '</div>' : '<h2>' + q.q + '</h2>';
    var nav = S.nav ? '<div class="qnav">' + map(s.qs, function (x, i) {
      var a = S.answers[i], c = a === undefined || a === null ? '' : (a === x.a ? ' ok' : ' bad');
      return '<button class="qnav__b' + c + (i === S.i ? ' is-cur' : '') + '" data-action="sim-go" data-i="' + i + '" aria-label="Questão ' + (i + 1) + '">' + (i + 1) + '</button>';
    }) + '<div class="qnav__foot"><span><i class="ok"></i>Certa</span><span><i class="bad"></i>Errada</span><span><i></i>Em branco</span><button class="btn btn--navy btn--sm" data-action="sim-finish">Finalizar (' + done + '/' + N + ')</button></div></div>' : '';
    return '<div class="simbar"><button class="back" data-action="sim-exit">' + ic('arrowLeft') + ' Sair</button><span class="simbar__save">' + ic('check', '', 2) + 'Progresso salvo</span></div>' +
      '<div class="simq"><div class="simq__top"><small>' + esc(s.nome) + '</small><span>' + (S.i + 1) + ' / ' + N + '</span></div>' +
      '<div class="bar bar--light"><i style="width:' + (done / N * 100) + '%"></i></div>' +
      '<div class="simq__tools"><span class="simq__area">' + esc(q.areaNome || '') + (q.n ? ' · Questão ' + q.n : '') + '</span><button class="simq__navbtn' + (S.nav ? ' is-on' : '') + '" data-action="sim-nav">' + ic('menu', '', 2) + 'Questões</button></div>' +
      nav + stem + map(q.opts, function (o, oi) {
        var cls = !has ? '' : (oi === q.a ? ' ok' : (oi === ans ? ' bad' : ' dim'));
        return '<button class="opt opt--lg' + cls + '" data-action="sim-answer" data-o="' + oi + '"' + (has ? ' disabled' : '') + '><span class="opt__l">' + 'ABCD'[oi] + '</span><span>' + esc(o) + '</span></button>';
      }) + (has ? '<p class="q__exp ' + (ans === q.a ? 'is-ok' : 'is-bad') + '">' + (ans === q.a ? 'Correto! ' : 'Resposta correta: ' + 'ABCD'[q.a] + '. ') + esc(q.exp) + '</p>' : '') +
      '<div class="simq__nav"><button class="btn btn--ghost" data-action="sim-prev"' + (S.i === 0 ? ' disabled' : '') + '>' + ic('chevronLeft', '', 2) + 'Anterior</button>' +
        (S.i + 1 < N ? '<button class="btn ' + (has ? 'btn--navy' : 'btn--ghost') + '" data-action="sim-next">' + (has ? 'Próxima' : 'Pular') + ic('chevronRight', '', 2) + '</button>'
          : '<button class="btn btn--navy" data-action="sim-finish">Ver resultado ' + ic('arrowRight', '', 2) + '</button>') + '</div></div>';
  }

  function toggle(k, label, desc) {
    var on = !!state.prefs[k];
    return '<div class="setrow"><div><b>' + label + '</b><small>' + desc + '</small></div><button class="switch' + (on ? ' is-on' : '') + '" role="switch" aria-checked="' + on + '" aria-label="' + label + '" data-action="pref" data-k="' + k + '"><i></i></button></div>';
  }
  function viewConfig() {
    var inner = pageHead('Configurações', 'Personalize sua experiência de estudo.') +
      '<div class="setgrid">' +
        '<section class="setcard"><h3>Perfil</h3>' +
          '<form data-form="perfil"><label class="field"><span>Nome</span><span class="field__in">' + ic('user') + '<input name="nome" value="' + esc(state.nome) + '" maxlength="30"></span></label>' +
          '<label class="field"><span>E-mail</span><span class="field__in">' + ic('mail') + '<input value="viviane@atempo.app" disabled></span></label>' +
          '<button class="btn btn--navy" type="submit">Salvar alterações</button></form></section>' +
        '<section class="setcard"><h3>Preferências</h3>' +
          toggle('notif', 'Novos conteúdos', 'Avisar quando houver materiais novos') +
          toggle('lembrete', 'Lembrete diário', 'Receber um lembrete para estudar') +
          toggle('autoplay', 'Reprodução automática', 'Iniciar podcasts e vídeos automaticamente') +
          toggle('offline', 'Modo offline', 'Baixar materiais para estudar sem internet') +
          '<div class="setrow"><div><b>Meta semanal</b><small>Horas de estudo por semana</small></div><select class="select" data-pref="meta" aria-label="Meta semanal">' +
            map(['5', '10', '15', '20'], function (v) { return '<option value="' + v + '"' + (state.prefs.meta === v ? ' selected' : '') + '>' + v + 'h</option>'; }) + '</select></div>' +
        '</section>' +
        '<section class="setcard"><h3>Conta</h3><p class="muted">Plano <b>Estudante</b> · renova em 12/12/2026</p>' +
          '<div class="setbtns"><button class="btn btn--ghost" data-action="reset">Restaurar dados da demonstração</button><button class="btn btn--danger" data-action="logout">' + ic('logout') + 'Sair</button></div></section>' +
      '</div>';
    return shell('configuracoes', inner);
  }

  function viewPerfil() {
    var inner = '<div class="profile"><div class="profile__av">' + initial() + '</div><h1>' + esc(state.nome) + '</h1><p class="muted">Estudante de Direito · 5º período</p>' +
      '<div class="pstats"><div><b>' + progress() + '%</b><span>Progresso</span></div><div><b>' + state.studied.length + '</b><span>Estudados</span></div><div><b>' + state.favs.length + '</b><span>Favoritos</span></div></div>' +
      '<div class="list plinks">' +
        plink('#/historico', 'history', 'Histórico') + plink('#/simulados', 'edit', 'Simulados') + plink('#/favoritos', 'star', 'Favoritos') + plink('#/configuracoes', 'settings', 'Configurações') +
      '</div><button class="btn btn--danger btn--block" data-action="logout">' + ic('logout') + 'Sair</button></div>';
    return shell('perfil', inner);
  }
  function plink(h, i, l) { return '<a class="lrow lrow--link" href="' + h + '"><span class="lrow__main"><span class="lrow__ic">' + ic(i, '', 1.7) + '</span><b>' + l + '</b></span>' + ic('chevronRight') + '</a>'; }
  function empty(icon, t, s) { return '<div class="empty"><span>' + ic(icon, '', 1.4) + '</span><b>' + t + '</b>' + (s ? '<p>' + s + '</p>' : '') + '<a class="btn btn--navy" href="#/materias">Explorar matérias</a></div>'; }

  /* ================= ROTEAMENTO ================= */
  var lastPath = null;
  function route() { return (location.hash.replace(/^#/, '').split('?')[0] || '/').split('/').filter(Boolean); }

  function render(keepScroll) {
    var p = route(), html, a = p[0];
    var path = p.join('/');
    if (path !== lastPath) { closePop(); closeModal(); if (!/^estudo/.test(path)) stopPlayer(); ui.lmenu = false; }
    var sc = window.scrollY;
    document.body.classList.toggle('is-landing', !a);
    if (!a) html = viewLanding();
    else if (a === 'app') html = viewDashboard();
    else if (a === 'materias') html = viewMaterias();
    else if (a === 'favoritos') html = viewFavoritos();
    else if (a === 'historico') html = viewHistorico();
    else if (a === 'simulados') html = viewSimulados();
    else if (a === 'configuracoes') html = viewConfig();
    else if (a === 'perfil') html = viewPerfil();
    else if (a === 'disciplina' && disc(p[1])) {
      var d = disc(p[1]), t = topic(d, p[2]);
      html = t ? viewFormats(d, t) : viewTopics(d);
    } else if (a === 'estudo' && disc(p[1]) && topic(disc(p[1]), p[2]) && fmt(p[3])) {
      if (path !== lastPath) stopPlayer();
      html = viewStudy(disc(p[1]), topic(disc(p[1]), p[2]), fmt(p[3]));
    } else { location.replace('#/'); return; }
    app.innerHTML = html;
    var ct = document.getElementById('content');
    if (ct && path !== lastPath) ct.classList.add('is-enter');
    var titles = { app: 'Início', materias: 'Minhas Matérias', favoritos: 'Favoritos', historico: 'Histórico', simulados: 'Simulados', configuracoes: 'Configurações', perfil: 'Perfil' };
    document.title = a ? (titles[a] || (disc(p[1]) ? (topic(disc(p[1]), p[2]) || disc(p[1])).nome : 'ATEMPO')) + ' · ATEMPO' : 'ATEMPO — Direito. Aprenda no seu tempo.';
    if (keepScroll) window.scrollTo(0, sc);
    else if (path !== lastPath) window.scrollTo(0, 0);
    lastPath = path;
    var vimg = document.querySelector('.vimg');
    if (vimg) { var nx = vimg.getAttribute('src').replace(/p(\d+)\.jpg$/, function (m, n) { var k = +n + 1; return 'p' + (k < 10 ? '0' : '') + k + '.jpg'; }); (new Image()).src = nx; }
  }

  /* ---------- player ---------- */
  function updatePlayer() {
    var pl = document.getElementById('player');
    if (!pl) return;
    var playing = !audio.paused;
    var fill = document.getElementById('p-fill'), cur = document.getElementById('p-cur');
    if (fill) { fill.style.width = (pDur() ? pTime() / pDur() * 100 : 0) + '%'; fill.parentNode.setAttribute('aria-valuenow', Math.floor(pTime())); }
    if (cur) cur.textContent = fmtTime(pTime());
    var btns = document.querySelectorAll('#p-play');
    for (var i = 0; i < btns.length; i++) btns[i].innerHTML = ic(playing ? 'pause' : 'play');
    var sp = document.getElementById('p-speed'); if (sp) sp.textContent = player.speed + 'x';
    var mu = document.getElementById('p-mute'); if (mu) mu.innerHTML = ic(audio.muted ? 'volumeOff' : 'volume');
    pl.classList.toggle('is-playing', playing);
    var list = player.info ? (player.info.ch || player.info.slides) : [], ci = chapterIdx(list);
    var chs = document.querySelectorAll('.chap');
    for (var j = 0; j < chs.length; j++) chs[j].classList.toggle('is-on', j === ci);
    var slide = document.getElementById('v-slide');
    if (slide) { var h = videoSlide(); if (slide.getAttribute('data-i') !== String(ci)) { slide.innerHTML = h; slide.setAttribute('data-i', ci); } }
  }
  function togglePlay() {
    if (!player.info) { toast('Áudio indisponível para este conteúdo.'); return; }
    if (audio.paused) {
      resumoAudio.pause();
      if (audio.ended) audio.currentTime = 0;
      var pr = audio.play();
      if (pr && pr.catch) pr.catch(function () { toast('Toque novamente no play para ouvir.'); });
      mediaSession();
    } else audio.pause();
  }
  ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata', 'seeked'].forEach(function (ev) { audio.addEventListener(ev, updatePlayer); });
  audio.addEventListener('error', function () { if (audio.getAttribute('src')) toast('Não foi possível carregar o áudio. Verifique a conexão.'); });
  ['play', 'pause', 'ended'].forEach(function (ev) { resumoAudio.addEventListener(ev, updateResumoBtn); });
  function updateResumoBtn() {
    var b = document.getElementById('r-play');
    if (b) { var on = !resumoAudio.paused; b.classList.toggle('is-on', on); b.innerHTML = ic(on ? 'pause' : 'volume') + '<span>' + (on ? 'Pausar' : 'Ouvir resumo') + '</span>'; }
  }

  /* ---------- popovers ---------- */
  function closePop() { var p = document.getElementById('pop'); if (p) p.remove(); }
  function openPop(html, anchor) {
    closePop();
    var el = document.createElement('div');
    el.id = 'pop'; el.className = 'pop'; el.innerHTML = html;
    document.body.appendChild(el);
    var r = anchor.getBoundingClientRect();
    el.style.top = (r.bottom + 10) + 'px';
    el.style.right = Math.max(12, window.innerWidth - r.right - 6) + 'px';
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!e.target.closest('#pop') && !(el && (el.dataset.action === 'notif' || el.dataset.action === 'usermenu'))) closePop();
    if (!e.target.closest('[data-search-wrap]')) {
      var ws = document.querySelectorAll('[data-search-wrap].has-res');
      for (var w = 0; w < ws.length; w++) ws[w].classList.remove('has-res');
    }
    if (!el) return;
    var A = el.dataset.action, ds = el.dataset, shellEl = document.getElementById('shell'), d, t, k;
    switch (A) {
      case 'open-login': openModal(loginHTML(), 'modal--login'); break;
      case 'close-modal': closeModal(); break;
      case 'open-search':
        openModal('<div class="msearch"><h2>Buscar</h2>' + searchBox('q-modal') + '</div>', 'modal--search');
        setTimeout(function () { var i = document.getElementById('q-modal'); if (i) i.focus(); }, 60);
        break;
      case 'toggle-lmenu': ui.lmenu = !ui.lmenu; render(true); break;
      case 'scroll':
        ui.lmenu = false;
        var target = document.getElementById(ds.target);
        var nav = el.parentNode.querySelectorAll('button');
        for (var i = 0; i < nav.length; i++) nav[i].classList.toggle('is-active', nav[i] === el);
        el.parentNode.classList.remove('is-open');
        var bg = document.querySelector('.lburger'); if (bg) bg.innerHTML = ic('menu');
        if (target) window.scrollTo({ top: ds.target === 'inicio' ? 0 : target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
        break;
      case 'toast': toast(ds.msg); break;
      case 'open-drawer': if (shellEl) { shellEl.classList.add('drawer-open'); document.body.classList.add('no-scroll'); } break;
      case 'close-drawer': if (shellEl) { shellEl.classList.remove('drawer-open'); document.body.classList.remove('no-scroll'); } break;
      case 'notif':
        if (document.getElementById('pop')) { closePop(); break; }
        openPop('<div class="pop__head"><b>Notificações</b><button class="link" data-action="toast" data-msg="Todas marcadas como lidas.">Marcar como lidas</button></div>' +
          notif('pdf', 'Apostilas de Empresarial disponíveis', 'Partes 01, 02 e 03 — PDF, podcast e videoaula', 'há 10 min', '#/disciplina/empresarial') +
          notif('trophy', 'Meta semanal quase lá!', 'Você já completou ' + progress() + '% do seu progresso', 'há 2 h', '#/materias') +
          notif('edit', 'Novo simulado: 46º Exame de Ordem', '80 questões com gabarito oficial da FGV', 'ontem', '#/simulados'), el);
        break;
      case 'usermenu':
        if (document.getElementById('pop')) { closePop(); break; }
        openPop('<div class="pop__user"><span class="avatar avatar--sm">' + initial() + '</span><span><b>' + esc(state.nome) + '</b><small>viviane@atempo.app</small></span></div>' +
          '<a class="pop__link" href="#/perfil">' + ic('user') + 'Meu perfil</a><a class="pop__link" href="#/configuracoes">' + ic('settings') + 'Configurações</a>' +
          '<button class="pop__link" data-action="logout">' + ic('logout') + 'Sair</button>', el);
        break;
      case 'logout': closePop(); location.hash = '#/'; toast('Você saiu da sua conta.'); break;
      case 'select-topic':
        d = disc(ds.d);
        if (ui.sel[d.id] === ds.t && window.innerWidth >= 768) { location.hash = '#/disciplina/' + ds.d + '/' + ds.t; break; }
        ui.sel[d.id] = ds.t; render(true);
        if (window.innerWidth < 768) { var det = document.getElementById('tdetail'); if (det) det.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        break;
      case 'fav':
        k = ds.d + '/' + ds.t;
        if (state.favs.indexOf(k) > -1) { state.favs = state.favs.filter(function (x) { return x !== k; }); toast('Removido dos favoritos.'); }
        else { state.favs.push(k); toast('Adicionado aos favoritos!'); }
        save('favs'); render(true); break;
      case 'studied':
        k = ds.d + '/' + ds.t;
        if (state.studied.indexOf(k) > -1) { state.studied = state.studied.filter(function (x) { return x !== k; }); toast('Marcação removida.'); }
        else { state.studied.push(k); toast('Conteúdo marcado como estudado! Seu progresso subiu para ' + progress() + '%.'); }
        save('studied'); render(true); break;
      case 'tab': ui.tab = +ds.i; render(true); break;
      case 'answer': ui.answers[ds.k] = +ds.o; render(true); break;
      case 'pdf-prev': if (ui.pdf.page > 1) { ui.pdf.page--; render(true); } break;
      case 'pdf-next': ui.pdf.page++; { var pp = route(); var cc = content(disc(pp[1]), topic(disc(pp[1]), pp[2])); ui.pdf.page = Math.min(ui.pdf.page, pageCount(cc)); } render(true); break;
      case 'pdf-go': ui.pdf.page = +ds.p; closeModal(); render(true); { var vs = document.querySelector('.vstage'); if (vs) vs.scrollTop = 0; } break;
      case 'pdf-toc':
        var tp = route(), tc = content(disc(tp[1]), topic(disc(tp[1]), tp[2]));
        openModal('<div class="toc"><small>' + esc(tc.parte) + '</small><h2>Sumário</h2>' + map(tc.pdf.sumario, function (x) {
          return '<button class="toc__i' + (x[0] === ui.pdf.page ? ' is-on' : '') + '" data-action="pdf-go" data-p="' + x[0] + '"><span>' + esc(x[1]) + '</span><b>p. ' + x[0] + '</b></button>';
        }) + '</div>', 'modal--toc');
        break;
      case 'zoom': var z = +ds.z, zp = route(), zc = content(disc(zp[1]), topic(disc(zp[1]), zp[2]));
        ui.pdf.zoom = z === 0 ? 100 : Math.max(60, Math.min(zc.pdf ? 200 : 160, ui.pdf.zoom + z)); render(true); break;
      case 'fullscreen':
        var fe = document.querySelector(ds.el);
        if (document.fullscreenElement) document.exitFullscreen();
        else if (fe && fe.requestFullscreen) fe.requestFullscreen().catch(function () { toast('Tela cheia indisponível neste dispositivo.'); });
        else toast('Tela cheia indisponível neste dispositivo.');
        break;
      case 'play': togglePlay(); break;
      case 'skip': audio.currentTime = Math.max(0, Math.min(pDur(), pTime() + (+ds.s))); updatePlayer(); break;
      case 'seekto': audio.currentTime = +ds.s + 0.05; if (audio.paused) togglePlay(); else updatePlayer(); break;
      case 'seek':
        var r = el.getBoundingClientRect();
        audio.currentTime = Math.max(0, Math.min(0.999, (e.clientX - r.left) / r.width)) * pDur(); updatePlayer(); break;
      case 'speed': var sp = [1, 1.25, 1.5, 2]; player.speed = sp[(sp.indexOf(player.speed) + 1) % sp.length];
        audio.defaultPlaybackRate = audio.playbackRate = player.speed; updatePlayer(); break;
      case 'mute': audio.muted = !audio.muted; updatePlayer(); break;
      case 'resumo-audio':
        if (!resumoAudio.paused) { resumoAudio.pause(); break; }
        audio.pause();
        if (resumoAudio.getAttribute('src') !== ds.src) resumoAudio.src = ds.src;
        var rp = resumoAudio.play();
        if (rp && rp.catch) rp.catch(function () { toast('Toque novamente para ouvir.'); });
        break;
      case 'mm': ui.mm = ui.mm === +ds.i ? null : +ds.i; render(true); break;
      case 'sim-start':
        var pr0 = ds.fresh ? null : simProg(ds.id);
        ui.sim = { id: ds.id, i: pr0 ? Math.min(pr0.i, simById(ds.id).qs.length - 1) : 0, answers: pr0 ? pr0.answers : [], done: false, nav: false };
        simSave(); render(); window.scrollTo(0, 0); break;
      case 'sim-answer': ui.sim.answers[ui.sim.i] = +ds.o; simSave(); render(true); break;
      case 'sim-next': case 'sim-prev': case 'sim-go':
        ui.sim.i = A === 'sim-go' ? +ds.i : ui.sim.i + (A === 'sim-next' ? 1 : -1);
        ui.sim.i = Math.max(0, Math.min(simById(ui.sim.id).qs.length - 1, ui.sim.i));
        ui.sim.nav = false; simSave(); render(); window.scrollTo(0, 0); break;
      case 'sim-nav': ui.sim.nav = !ui.sim.nav; render(true); break;
      case 'sim-finish':
        var sf = simById(ui.sim.id), okf = sf.qs.filter(function (q, i) { return ui.sim.answers[i] === q.a; }).length;
        state.best[sf.id] = Math.max(state.best[sf.id] || 0, Math.round(okf / sf.qs.length * 100)); save('best');
        ui.sim.done = true; ui.sim.nav = false;
        try { localStorage.removeItem('atempo:sim:' + sf.id); } catch (er) { /* sem armazenamento */ }
        render(); window.scrollTo(0, 0); break;
      case 'sim-review': ui.sim.done = false; ui.sim.i = 0; ui.sim.nav = true; render(); window.scrollTo(0, 0); break;
      case 'sim-exit': ui.sim = null; render(); window.scrollTo(0, 0); break;
      case 'pref': state.prefs[ds.k] = !state.prefs[ds.k]; save('prefs'); render(true); toast('Preferência atualizada.'); break;
      case 'reset':
        ['nome', 'favs', 'studied', 'hist', 'prefs', 'best', 'lastFmt'].concat(D.simulados.map(function (x) { return 'sim:' + x.id; })).forEach(function (x) { try { localStorage.removeItem('atempo:' + x); } catch (er) { /* sem armazenamento */ } });
        location.hash = '#/app'; location.reload(); break;
    }
  });

  function notif(i, t, s, w, href) {
    return '<a class="pop__item" href="' + href + '"><span class="pop__ic">' + ic(i, '', 1.7) + '</span><span><b>' + t + '</b><small>' + s + '</small><em>' + w + '</em></span></a>';
  }

  document.addEventListener('input', function (e) {
    if (e.target.matches('[data-search]')) {
      var wrap = e.target.closest('[data-search-wrap]'), res = wrap.querySelector('.search__res');
      res.innerHTML = searchHTML(e.target.value);
      wrap.classList.toggle('has-res', !!e.target.value.trim());
    }
  });
  document.addEventListener('focusin', function (e) {
    if (e.target.matches('[data-search]') && e.target.value.trim()) e.target.closest('[data-search-wrap]').classList.add('has-res');
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-pref]')) { state.prefs[e.target.dataset.pref] = e.target.value; save('prefs'); toast('Meta semanal: ' + e.target.value + 'h.'); }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.dataset.form;
    if (!f) return;
    e.preventDefault();
    if (f === 'login') { closeModal(); location.hash = '#/app'; setTimeout(function () { toast('Bem-vinda, ' + state.nome + '!'); }, 150); }
    if (f === 'perfil') {
      var v = e.target.nome.value.trim();
      if (!v) { toast('Informe um nome.'); return; }
      state.nome = v; save('nome'); render(true); toast('Perfil atualizado!');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal(); closePop();
      var sh = document.getElementById('shell'); if (sh) sh.classList.remove('drawer-open');
      document.body.classList.remove('no-scroll');
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.mm__node[data-action]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    if (e.target.matches('input, textarea, select')) return;
    if (document.querySelector('.viewer')) {
      if (e.key === 'ArrowRight') { var n = document.querySelector('[data-action="pdf-next"]:not([disabled])'); if (n) n.click(); }
      if (e.key === 'ArrowLeft') { var pv = document.querySelector('[data-action="pdf-prev"]:not([disabled])'); if (pv) pv.click(); }
    }
  });

  /* gesto de deslizar no PDF (celular) */
  var sx = null, sy = null;
  document.addEventListener('touchstart', function (e) { if (e.target.closest('[data-swipe]')) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } else sx = null; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && ui.pdf.zoom <= 100) {
      var b = document.querySelector('[data-action="' + (dx < 0 ? 'pdf-next' : 'pdf-prev') + '"]:not([disabled])');
      if (b) b.click();
    }
    sx = null;
  }, { passive: true });

  window.addEventListener('hashchange', function () { render(); });
  window.addEventListener('resize', closePop);
  window.addEventListener('scroll', function () { if (document.getElementById('pop')) closePop(); }, { passive: true });
  render();
})();
