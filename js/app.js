/* =========================================================================
   app.js — Mon Éphéméride Besançon
   Sommaire :
     0. Outils
     1. Éphéméride (horloge, saints, lune, saisons)
     2. Citation & fond étoilé
     3. Radio
     4. Vie pratique (marchés)
     5. Mémo + mes dates
     6. Ginko : temps réel
     7. Ginko : itinéraires (Dijkstra simplifié sur le réseau)
     8. Carte du réseau
     9. Lieux de Besançon (+ modale)
    10. Agenda du jour + sorties
    11. Actus RSS
    12. Météo + air
    13. Horoscope
    14. Démarrage
   ========================================================================= */
(function () {
'use strict';

const CFG = window.APP_CONFIG || {};
const G   = window.GINKO || { stops: [], variantes: [], lignes: [], doubs: [], canal: [] };

/* ============================ 0. OUTILS ============================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, def) { try { const v = localStorage.getItem('besancon.' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem('besancon.' + k, JSON.stringify(v)); } catch (e) {} }
};
const TZ = CFG.tz || 'Europe/Paris';
const nowParts = (d = new Date()) => {
  const f = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return f.format(d);
};
const frHour = (d = new Date()) => { const t = nowParts(d).split(':'); return (+t[0]) + (+t[1]) / 60; };
const fmtHM = min => { if (min == null || !isFinite(min)) return '—'; const m = Math.round(min); return pad(Math.floor((m % 1440) / 60)) + 'h' + pad(m % 60).replace(/^0(\d)$/, '$1'); };
const minToHM = m => { const t = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(t / 60)) + ':' + pad(t % 60); };
const km = (aLat, aLon, bLat, bLon) => {
  const R = 6371, p1 = aLat * Math.PI / 180, p2 = bLat * Math.PI / 180;
  const dp = p2 - p1, dl = (bLon - aLon) * Math.PI / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const bearing = (aLat, aLon, bLat, bLon) => {
  const φ1 = aLat * Math.PI / 180, φ2 = bLat * Math.PI / 180, Δλ = (bLon - aLon) * Math.PI / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};
const angDiff = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
let toastTimer;
function toast(msg, ms = 3200) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
const fetchJSON = async (url, opts = {}, timeout = 12000) => {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, Object.assign({}, opts, { signal: ctl.signal, cache: 'no-store' }));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(id); }
};

/* ============================ 1. ÉPHÉMÉRIDE ============================ */
const QUOTES = [
  ['La vie est un mystère qu’il faut vivre, et non un problème à résoudre.', 'Gandhi'],
  ['Le bonheur n’est pas une destination, c’est une manière de voyager.', 'Proverbe'],
  ['Il faut toujours viser la lune, car même en cas d’échec on atterrit dans les étoiles.', 'Oscar Wilde'],
  ['On ne voit bien qu’avec le cœur. L’essentiel est invisible pour les yeux.', 'Antoine de Saint-Exupéry'],
  ['Ce n’est pas la destination qui compte, c’est le chemin parcouru.', 'Proverbe'],
  ['La simplicité est la sophistication suprême.', 'Léonard de Vinci'],
  ['Rien ne sert de courir, il faut partir à point.', 'Jean de La Fontaine'],
  ['Le courage, c’est de comprendre sa peur et de la dominer.', 'Romain Rolland'],
  ['Chaque instant est une occasion de recommencer.', 'Proverbe'],
  ['Le temps ne s’arrête jamais ; c’est nous qui devons savoir le prendre.', 'Proverbe comtois'],
  ['Le seul vrai voyage, ce serait de partir sans savoir où l’on va.', 'Nicolas Bouvier'],
  ['Le doute est le commencement de la sagesse.', 'Aristote'],
  ['Qui vivra verra ; qui rira vivra.', 'Proverbe franc-comtois'],
  ['La patience est amère, mais son fruit est doux.', 'Jean-Jacques Rousseau'],
  ['Les petits ruisseaux font les grandes rivières.', 'Proverbe'],
  ['Vivre simplement, pour que simplement d’autres puissent vivre.', 'Gandhi'],
  ['Le meilleur moyen de prédire l’avenir, c’est de le construire.', 'Antoine de Saint-Exupéry'],
  ['S’asseoir au bord du Doubs et regarder passer l’eau, c’est déjà voyager.', 'Proverbe bisontin'],
  ['Tout ce qui est exagéré est insignifiant.', 'Talleyrand'],
  ['Le génie est fait d’un pour cent d’inspiration et de quatre-vingt-dix-neuf pour cent de transpiration.', 'Thomas Edison'],
  ['La joie est en tout ; il faut savoir l’extraire.', 'Confucius'],
  ['Ne pas perdre de temps, c’est gagner du temps.', 'Proverbe'],
  ['L’homme n’est heureux qu’autant qu’il s’oublie.', 'Joseph Joubert'],
  ['Il n’y a pas de vent favorable pour qui ne sait où il va.', 'Sénèque'],
  ['Un petit chez soi vaut mieux qu’un grand chez les autres.', 'Proverbe'],
  ['Le plaisir le plus délicat est de faire celui d’autrui.', 'Jean de La Bruyère'],
  ['L’habitude est une seconde nature.', 'Cicéron'],
  ['Qui fait de son mieux, fait bien.', 'Proverbe'],
  ['Le silence est aussi une réponse.', 'Proverbe'],
  ['La vérité est dans les détails.', 'Proverbe'],
  ['Ce que l’on conçoit bien s’énonce clairement.', 'Boileau'],
  ['La mesure du temps est le soin des horlogers bisontins depuis 1793.', 'Clin d’œil bisontin'],
  ['Rien de grand ne s’est accompli dans le monde sans passion.', 'Hegel'],
  ['L’espérance est le songe d’un homme éveillé.', 'Aristote'],
  ['On ne peut rien apprendre aux gens, on peut seulement les aider à découvrir ce qu’ils ont en eux.', 'Galilée'],
  ['Le désordre des uns fait le bonheur des autres.', 'Proverbe']
];

const MOON = ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'];
function moonPhase(d) {
  const syn = 29.530588853;
  const ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const days = d.getTime() / 86400000 - ref;
  let age = ((days % syn) + syn) % syn;
  const illum = Math.round((1 - Math.cos(2 * Math.PI * age / syn)) / 2 * 100);
  const idx = Math.round(age / syn * 8) % 8;
  return { age, illum, name: MOON[idx] };
}
function seasonOf(d) {
  const m = d.getMonth() + 1, day = d.getDate();
  if (m === 3 && day >= 20 || m === 4 || m === 5 || m === 6 && day < 21) return 'Printemps';
  if (m === 6 && day >= 21 || m === 7 || m === 8 || m === 9 && day < 23) return 'Été';
  if (m === 9 && day >= 23 || m === 10 || m === 11 || m === 12 && day < 21) return 'Automne';
  return 'Hiver';
}
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y0) / 86400000 + 1) / 7);
}
function dayOfYear(d) {
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
}
function saintsOf(d) {
  const key = (d.getMonth() + 1) + '-' + d.getDate();
  const list = (window.SAINTS || {})[key] || [];
  if (!list.length) return '';
  const main = list.filter(n => !/^(Toussaint|Noel|Assomption|Pâques)$/i.test(n)).slice(0, 3);
  return main.length ? main.join(', ') : list.slice(0, 2).join(', ');
}
function momentOf(d, sunrise, sunset) {
  const h = frHour(d);
  if (sunrise && sunset) {
    if (h < sunrise - 0.75) return 'Nuit';
    if (h < sunrise + 0.5) return 'Aube';
    if (h < sunrise + 3) return 'Matin';
    if (h < 13.5) return 'Midi';
    if (h < sunset - 1.5) return 'Après-midi';
    if (h < sunset + 0.5) return 'Soirée';
    return 'Nuit';
  }
  if (h < 6) return 'Nuit'; if (h < 9) return 'Matin'; if (h < 12) return 'Matinée';
  if (h < 14) return 'Midi'; if (h < 18) return 'Après-midi'; if (h < 21) return 'Soirée'; return 'Nuit';
}

const astro = { sunrise: null, sunset: null };

function tickClock() {
  const d = new Date();
  const t = nowParts(d).split(':');
  const clock = $('#clock'); if (clock) clock.textContent = t[0] + ':' + t[1];
  const sec = $('#seconds'); if (sec) sec.textContent = t[2];

  const dateEl = $('#dateLong');
  if (dateEl) dateEl.textContent = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const wk = isoWeek(d);
  if ($('#weekNumber')) $('#weekNumber').textContent = 'semaine ' + wk;
  if ($('#weekNum2')) $('#weekNum2').textContent = 'S' + wk;
  if ($('#dayYear')) $('#dayYear').textContent = dayOfYear(d) + 'ᵉ jour de l’année';
  const m = moonPhase(d);
  if ($('#moon')) $('#moon').textContent = 'lune : ' + m.name.toLowerCase() + ' (' + m.illum + ' %)';
  if ($('#season')) $('#season').textContent = seasonOf(d);
  const saint = saintsOf(d);
  if ($('#badgeSaint')) $('#badgeSaint').innerHTML = saint ? 'Fête : <b>' + esc(saint) + '</b>' : 'Fête du jour';
  if ($('#badgeMoment')) $('#badgeMoment').textContent = momentOf(d, astro.sunrise, astro.sunset);

  // progression du jour (lever → coucher)
  const h = frHour(d);
  if (astro.sunrise != null && astro.sunset != null) {
    const p = Math.max(0, Math.min(1, (h - astro.sunrise) / (astro.sunset - astro.sunrise)));
    if ($('#dayProgress')) $('#dayProgress').style.width = (p * 100).toFixed(1) + '%';
    if ($('#dayProgressLbl')) {
      const rest = astro.sunset - h;
      $('#dayProgressLbl').textContent = p >= 1
        ? 'Soleil couché — nuit en cours'
        : Math.round(p * 100) + ' % de la journée écoulée · ' + (rest > 1 ? Math.floor(rest) + ' h ' + pad(Math.round((rest % 1) * 60)) + ' avant le coucher' : Math.round(rest * 60) + ' min avant le coucher');
    }
  } else if ($('#dayProgressLbl')) {
    $('#dayProgressLbl').textContent = 'Durée du jour en cours de calcul…';
  }
}

function pickQuote() {
  const d = new Date();
  const idx = dayOfYear(d) % QUOTES.length;
  const q = QUOTES[idx];
  const el = $('#quote');
  if (el) el.innerHTML = '<span class="quote-text">« ' + esc(q[0]) + ' »</span><span class="quote-author">— ' + esc(q[1]) + '</span>';
}

function buildStars() {
  const box = $('#starnote'); if (!box) return;
  let html = '';
  for (let i = 0; i < 70; i++) {
    const x = (Math.random() * 100).toFixed(2), y = (Math.random() * 100).toFixed(2);
    const delay = (Math.random() * 4).toFixed(2), dur = (3 + Math.random() * 4).toFixed(2);
    const big = Math.random() > 0.88 ? ' class="big"' : '';
    html += '<i' + big + ' style="left:' + x + '%;top:' + y + '%;animation-delay:' + delay + 's;animation-duration:' + dur + 's"></i>';
  }
  box.innerHTML = html;
}

/* ============================ 2. RADIO ============================ */
const radio = {
  el: null, playing: false, quality: 'midfi',
  streams: {
    midfi: 'https://icecast.radiofrance.fr/fbbesancon-midfi.mp3',
    lofi: 'https://icecast.radiofrance.fr/fbbesancon-lofi.mp3'
  },
  init() {
    this.el = $('#radioPlayer');
    const btn = $('#playBtn');
    if (!this.el || !btn) return;
    this.el.volume = 0.7;
    btn.addEventListener('click', () => this.toggle());
    const vol = $('#volumeSlider');
    if (vol) vol.addEventListener('input', e => {
      this.el.volume = e.target.value / 100;
      $('#volumeValue').textContent = e.target.value + ' %';
    });
    $$('.radio-controls .mini-btn').forEach(b => b.addEventListener('click', () => {
      $$('.radio-controls .mini-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.quality = b.dataset.q;
      if (this.playing) { this.stop(true); setTimeout(() => this.play(), 400); }
    }));
  },
  toggle() { this.playing ? this.stop() : this.play(); },
  play() {
    this.el.src = this.streams[this.quality] + '?t=' + Date.now();
    this.el.play().then(() => {
      this.playing = true;
      $('#playIcon').textContent = '❚❚';
      $('#playBtn').classList.add('playing');
      $('#radioEq').classList.add('on');
      $('#statusText').textContent = 'En direct : France Bleu Besançon';
    }).catch(err => {
      console.warn('radio', err);
      $('#statusText').textContent = 'Lecture impossible — utilisez le lien ci-dessous';
      toast('Le flux radio a été refusé par le navigateur. Utilisez « Écouter sur francebleu.fr ».', 5000);
    });
  },
  stop(silent) {
    this.el.pause(); this.el.removeAttribute('src'); this.el.load();
    this.playing = false;
    $('#playIcon').textContent = '▶';
    $('#playBtn').classList.remove('playing');
    $('#radioEq').classList.remove('on');
    if (!silent) $('#statusText').textContent = 'Radio arrêtée';
  }
};

/* ============================ 3. VIE PRATIQUE ============================ */
function renderMarkets() {
  const today = new Date().getDay(); // 0=dim
  const rows = $$('#marketsList li');
  let openNow = [];
  rows.forEach(li => {
    const jours = (li.dataset.jours || '').split(',').map(Number);
    if (jours.includes(today)) { li.classList.add('today'); openNow.push(li.querySelector('b').textContent); }
    else li.classList.remove('today');
  });
  const box = $('#marketToday');
  if (!box) return;
  const h = frHour();
  if (openNow.length) {
    box.className = 'market-today';
    box.innerHTML = '<span>🥕</span><div><b>Marché' + (openNow.length > 1 ? 's' : '') + ' aujourd’hui :</b> ' + esc([...new Set(openNow)].join(', ')) +
      '<br><small>' + (h < 13 ? 'Ouvert ce matin — pensez au panier.' : (h < 18 ? 'Vérifiez les horaires (certains ferment à 13 h).' : 'La plupart des étals sont fermés.')) + '</small></div>';
  } else {
    box.className = 'market-today closed';
    box.innerHTML = '<span>🌙</span><div>Pas de marché aujourd’hui dans votre secteur — les Halles Beaux-Arts sont ouvertes du mardi au dimanche.</div>';
  }
}

/* ============================ 4. MÉMO & MES DATES ============================ */
function initMemo() {
  const area = $('#myNotes'); if (!area) return;
  area.value = store.get('memo', '');
  let t;
  area.addEventListener('input', () => {
    clearTimeout(t);
    $('#memoStatus').textContent = 'Saisie…';
    t = setTimeout(() => { store.set('memo', area.value); $('#memoStatus').textContent = 'Enregistré à ' + nowParts().slice(0, 5); }, 500);
  });
  $('#memoClear')?.addEventListener('click', () => {
    if (confirm('Effacer tout le mémo ?')) { area.value = ''; store.set('memo', ''); $('#memoStatus').textContent = 'Mémo effacé'; }
  });
}

function upcoming(dates, count) {
  const out = [];
  const now = new Date(); const y = now.getFullYear();
  (dates || []).forEach(item => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(item.date);
    let d;
    if (m) d = new Date(+m[1], +m[2] - 1, +m[3]);
    else {
      const r = /^(\d{2})-(\d{2})$/.exec(item.date); if (!r) return;
      d = new Date(y, +r[1] - 1, +r[2]);
      if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) d = new Date(y + 1, +r[1] - 1, +r[2]);
    }
    out.push(Object.assign({}, item, { d }));
  });
  out.sort((a, b) => a.d - b.d);
  return { list: out.slice(0, count || 4), all: out };
}

function renderPerso() {
  const ul = $('#persoList'); if (!ul) return;
  const { list } = upcoming(CFG.PERSO, 4);
  if (!list.length) { ul.innerHTML = '<li class="empty">Aucune date enregistrée.</li>'; return; }
  const today0 = new Date(); today0.setHours(0, 0, 0, 0);
  ul.innerHTML = list.map(it => {
    const days = Math.round((it.d - today0) / 86400000);
    const when = days === 0 ? 'aujourd’hui' : days === 1 ? 'demain' : 'dans ' + days + ' j';
    return '<li><span class="d">' + pad(it.d.getDate()) + '/' + pad(it.d.getMonth() + 1) + '</span><div class="in">' + esc(it.label) +
      (it.note ? '<small>' + esc(it.note) + '</small>' : '') + '</div><small style="color:var(--txt-3)">' + when + '</small></li>';
  }).join('');
}

/* ============================ 5. GINKO — TEMPS RÉEL ============================ */
/* Durée d'attente en minutes, robuste aux réponses de l'API :
   - tempsEnMinute = -1 (valeur sentinelle) alors que la vraie durée est en secondes
   - « temps » texte du type « 9 min », « 1 h 05 » */
function dureeMin(t) {
  const m = t.tempsEnMinute;
  if (m != null && m >= 0) return Math.round(m);
  const sec = t.tempsEnSeconde;
  if (sec != null && sec >= 0) return Math.round(sec / 60);
  const txt = String(t.temps || '').replace(/\s+/g, ' ').trim();
  if (!txt) return null;
  // la valeur la plus lisible compte : on prend la plus grande, le texte étant parfois cumulatif
  const hs = /(\d+)\s*h\s*(\d{1,2})?/i.exec(txt);
  const ms = /(\d+)\s*min/i.exec(txt);
  const cands = [];
  if (hs) cands.push(+hs[1] * 60 + (hs[2] ? +hs[2] : 0));
  if (ms) cands.push(+ms[1]);
  if (cands.length) return Math.round(Math.min.apply(null, cands));
  const seul = /^(\d+)$/.exec(txt);
  return seul ? +seul[1] : null;
}

const ginko = {
  timer: null, last: {}, errors: 0,

  /* Une clé valide = 32 caractères hexadécimaux. Tout le reste (clé d'hier
     restée en mémoire, valeur tronquée, guillemets collés) est ignoré et
     l'agenda retombe sur la clé permanente du fichier config.js. */
  cleValide(k) { return /^[0-9a-f]{32}$/i.test(String(k || '').trim()); },

  key() {
    const fichier = CFG.ginko.apiKey || '';
    if (this.cleValide(fichier)) {
      /* La clé permanente du fichier est prioritaire. Depuis la suppression du
         bouton 🔑, plus rien n'écrit dans la mémoire du navigateur : une clé
         oubliée là (clé temporaire d'hier, valeur tronquée) est effacée. */
      try { if (store.get('ginkoKey', '')) store.set('ginkoKey', ''); } catch (e) {}
      return fichier;
    }
    const perso = store.get('ginkoKey', '');
    return this.cleValide(perso) ? perso : fichier;
  },

  url(path, params) {
    const p = new URLSearchParams(Object.assign({ apiKey: this.key() }, params || {}));
    return CFG.ginko.base + path + '?' + p.toString();
  },

  async stopTimes(nom, nb) {
    const j = await fetchJSON(this.url('/TR/getTempsLieu.do', { nom: nom, nb: nb || CFG.ginko.nbParLigne || 3 }), {}, 10000);
    if (!j || !j.ok || !j.objets) throw new Error(j && j.msg ? j.msg : 'Réponse inattendue');
    const o = j.objets;
    const list = (o.listeTemps || []).map(t => ({
      ligne: t.numLignePublic, couleur: '#' + (t.couleurFond || '555555'), couleurTexte: '#' + (t.couleurTexte || 'FFFFFF'),
      dest: t.destination || '', min: dureeMin(t),
      heure: t.typeDeTemps === 1 && t.temps ? t.temps : null,
      texte: t.typeDeTemps === 2 ? (t.temps || '') : '',
      fiable: !!t.fiable, arret: t.idArret, affluence: t.affluence
    }));
    return { nom: o.nomExact || nom, lat: o.latitude, lon: o.longitude, list };
  },

  pick(list, favori) {
    let arr = list;
    if (favori && favori.lignes && favori.lignes.length) {
      const kept = arr.filter(d => favori.lignes.some(l => String(l).toLowerCase() === String(d.ligne).toLowerCase()));
      if (kept.length) arr = kept;
    }
    // dédoublonne par ligne + destination, garde les 2 premiers
    const seen = new Map();
    arr.forEach(d => {
      const k = d.ligne + '|' + d.dest;
      seen.set(k, (seen.get(k) || []).concat([d]));
    });
    let out = [];
    seen.forEach(v => { out = out.concat(v.slice(0, 2)); });
    // si trop de lignes, priorité aux favoris puis aux plus proches
    const prio = l => favori && favori.lignes ? (favori.lignes.indexOf(l) + 1 || 99) : 0;
    out.sort((a, b) => (prio(a.ligne) - prio(b.ligne)) || ((a.min ?? 999) - (b.min ?? 999)));
    return out.slice(0, 6);
  },

  renderCard(favori, data) {
    const id = 'stop-' + favori.nom.replace(/\W+/g, '');
    const deps = data ? this.pick(data.list, favori) : [];
    const lines = [...new Set((data ? data.list : []).map(d => d.ligne))].slice(0, 8);
    const pill = (l) => {
      const meta = G.lignes.find(x => x.num === l);
      const bg = meta ? meta.c : '#444';
      const hex = (bg || '').replace('#', '');
      const lum = meta ? (parseInt(hex.substr(0, 2), 16) * .299 + parseInt(hex.substr(2, 2), 16) * .587 + parseInt(hex.substr(4, 2), 16) * .114) : 0;
      const fg = lum > 150 ? '#14122b' : '#fff';
      return '<span class="pill" style="background:' + bg + ';color:' + fg + '">' + esc(l) + '</span>';
    };
    let body = '';
    if (!data) body = '<div class="stop-empty">Données momentanément indisponibles…</div>';
    else if (!deps.length) body = '<div class="stop-empty">Pas de passage annoncé (fin de service ou perturbations).</div>';
    else body = deps.map(d => {
      const m = d.min;
      const cls = m == null ? '' : m <= 1 ? 'now' : m <= 5 ? 'soon' : '';
      const label = d.texte ? esc(d.texte) : (m == null ? '—' : (m <= 0 ? 'à quai' : Math.round(m) + '<small> min</small>'));
      const heure = d.heure ? d.heure.replace(/\s/g, '').slice(0, 5) : (m != null ? minToHM(frHour() * 60 + m) : '');
      return '<div class="dep" title="' + esc(d.ligne + ' → ' + d.dest + (d.fiable ? ' (temps réel GPS)' : ' (horaire théorique)')) + '">' +
        '<i class="rt' + (d.fiable ? '' : ' est') + '"></i>' + pill(d.ligne) +
        '<span class="dest">' + esc(d.dest) + '</span>' +
        '<span class="min ' + cls + '">' + label + '</span>' +
        '<span class="hr">' + esc(heure) + '</span></div>';
    }).join('');

    return '<div class="stop-card" id="' + id + '" data-nom="' + esc(favori.nom) + '" tabindex="0">' +
      '<div class="stop-name"><b><svg><use href="#i-pin"/></svg>' + esc(favori.label || favori.nom) + '</b>' +
      '<span class="stop-walk">' + (favori.walk != null ? '⌂ ' + favori.walk + ' min' : '') + '</span></div>' +
      '<div class="stop-lines">' + lines.map(pill).join('') + '</div>' + body + '</div>';
  },

  async refresh() {
    const grid = $('#stopGrid'); if (!grid) return;
    const list = CFG.favoris || [];
    if (!list.length) { grid.innerHTML = '<div class="empty">Aucun arrêt favori configuré.</div>'; return; }
    const results = await Promise.all(list.map(async f => {
      try { const d = await this.stopTimes(f.nom); this.errors = Math.max(0, this.errors - 1); return { f, d }; }
      catch (e) { console.warn('Ginko', f.nom, e); this.errors++; return { f, d: null, err: e }; }
    }));
    grid.innerHTML = results.map(r => this.renderCard(r.f, r.d)).join('');
    $$('.stop-card', grid).forEach(card => {
      const act = () => openStopModal(card.dataset.nom);
      card.addEventListener('click', act);
      card.addEventListener('keydown', e => { if (e.key === 'Enter') act(); });
    });
    const okCount = results.filter(r => r.d).length;
    const dot = $('#liveDot');
    if (dot) dot.className = 'live-dot ' + (okCount === results.length ? 'ok' : okCount ? 'warn' : 'err');
    if ($('#ginkoUpdated')) $('#ginkoUpdated').textContent = 'Passages mis à jour à ' + nowParts().slice(0, 5) + ' · ' + okCount + '/' + results.length + ' arrêts · temps réel';
    this.last = results;
    if (okCount === 0) {
      toast('Ginko ne répond pas pour le moment. Les données réelles reviendront à la prochaine actualisation.', 6000);
    }
    this.traffic(okCount > 0);
  },

  async traffic(dataOk) {
    const el = $('#ginkoTraffic'); if (!el) return;
    try {
      const j = await fetchJSON(this.url('/TR/getMessages.do'), {}, 10000);
      if (!j || !j.ok) throw 0;
      const msgs = (j.objets || []).slice(0, 2);
      if (!msgs.length) { el.innerHTML = '<span class="ok">✔</span> Aucune perturbation signalée sur le réseau.'; return; }
      el.innerHTML = msgs.map(m => {
        const tmp = document.createElement('div');
        tmp.innerHTML = String(m.texte || '');          // décode &#233; &nbsp; etc.
        const txt = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
        const lignes = (m.lignes || []).map(l => '<span class="pill" style="background:#3a3550">' + esc(l) + '</span>').join(' ');
        return '<div class="tr-line"><b>⚠ ' + esc(m.titre || 'Info trafic') + '</b> ' + lignes + '<br><span>' + esc(txt.slice(0, 160)) + (txt.length > 160 ? '…' : '') + '</span></div>';
      }).join('');
    } catch (e) {
      el.innerHTML = dataOk === false
        ? '<span class="muted">Clé API à vérifier — <a href="https://api.ginko.voyage/" target="_blank" rel="noopener">api.ginko.voyage ↗</a></span>'
        : '<span class="muted">Infos trafic indisponibles.</span>';
    }
  },

  start() {
    this.refresh();
    clearInterval(this.timer);
    this.timer = setInterval(() => { if (!document.hidden) this.refresh(); }, (CFG.ginko.refetchSec || 30) * 1000);
  }
};

/* ============================ 6. GINKO — ITINÉRAIRES ============================ */
const net = {
  stops: [], byName: new Map(), variants: [], edges: [], built: false,
  home: null,

  build() {
    if (this.built) return;
    this.built = true;
    this.home = CFG.ginko.domicile || { lat: 47.21887, lon: 5.96494 };
    // lieux
    G.stops.forEach((s, i) => {
      const o = { i, nom: s[0], lat: s[1], lon: s[2], lignes: s[3] };
      this.stops.push(o);
      if (!this.byName.has(s[0])) this.byName.set(s[0], []);
      this.byName.get(s[0]).push(o);
    });
    // variantes + vitesses
    G.variantes.forEach((v, vi) => {
      const meta = G.lignes.find(l => l.num === v.ligne);
      const tram = meta && meta.mode === 1;
      const speed = tram ? 19 : 15.5;
      const seq = v.stops, bearings = [], times = [];
      for (let i = 0; i < seq.length; i++) {
        const a = this.stops[seq[i]];
        const bI = i < seq.length - 1 ? seq[i + 1] : null;
        const prev = i > 0 ? seq[i - 1] : null;
        let brg = null, t = 0;
        if (bI != null) {
          const b = this.stops[bI];
          brg = bearing(a.lat, a.lon, b.lat, b.lon);
          t = km(a.lat, a.lon, b.lat, b.lon) / speed * 60 + 0.6;
        }
        bearings.push(brg); times.push(t);
      }
      this.variants.push({ vi, ligne: v.ligne, dest: v.dest, c: v.c, seq, bearings, times });
    });
    // marche entre arrêts proches (noms différents)
    for (let a = 0; a < this.stops.length; a++) {
      for (let b = a + 1; b < this.stops.length; b++) {
        const A = this.stops[a], B = this.stops[b];
        if (A.nom === B.nom) continue;
        const d = km(A.lat, A.lon, B.lat, B.lon);
        if (d < 0.22) {
          const t = d * 1000 / 1.35 / 60 * 1.15 + 1.2;
          this.addWalk(a, b, t, d);
        }
      }
    }
    // accès à pied depuis le domicile (arrêts < 900 m)
    this.stops.forEach(s => {
      const d = km(this.home.lat, this.home.lon, s.lat, s.lon);
      if (d < 0.95) this.addWalk(-1, s.i, d * 1000 / 1.35 / 60 * 1.1 + 0.5, d);
    });
  },

  addWalk(a, b, t, d) {
    this.walkEdges = this.walkEdges || [];
    this.walkEdges.push({ a, b, t, d });
  },

  /* Dijkstra : état (arrêt, variante en cours | -1 = à pied) */
  route(fromName, toName, toCoord) {
    this.build();
    const fromNodes = [];
    if (fromName && this.byName.has(fromName)) this.byName.get(fromName).forEach(s => fromNodes.push({ stop: s.i, via: -1 }));
    else fromNodes.push({ stop: -1, via: -1 }); // départ du domicile
    // cible : un arrêt (nom) ou des coordonnées
    let targetStops = null;
    if (toName && this.byName.has(toName)) targetStops = new Set(this.byName.get(toName).map(s => s.i));
    const nStop = this.stops.length;
    const nV = this.variants.length;
    const nodeId = (st, vi) => (vi + 1) * (nStop + 1) + (st + 1);
    const dist = new Map(), prev = new Map();
    const pq = [];
    const push = (st, vi, d, from) => {
      const id = nodeId(st, vi);
      if (dist.has(id) && dist.get(id) <= d) return;
      dist.set(id, d); if (from) prev.set(id, from);
      pq.push({ st, vi, d });
    };
    fromNodes.forEach(n => push(n.stop, -1, 0, null));

    // pré-indexe : pour chaque arrêt, dans quelles variantes et à quel indice
    const at = this.at || (this.at = (() => {
      const m = new Map();
      this.variants.forEach(v => v.seq.forEach((st, i) => {
        if (!m.has(st)) m.set(st, []);
        m.get(st).push({ vi: v.vi, i });
      }));
      return m;
    })());
    const walkBy = this.walkBy || (this.walkBy = (() => {
      const m = new Map();
      (this.walkEdges || []).forEach(e => {
        if (!m.has(e.a)) m.set(e.a, []); m.get(e.a).push(e);
        if (!m.has(e.b)) m.set(e.b, []); m.get(e.b).push(e);
      });
      return m;
    })());

    let guard = 0;
    while (pq.length && guard++ < 60000) {
      // extrait le minimum (file simple : tri partiel suffisant à cette échelle)
      let bi = 0;
      for (let i = 1; i < pq.length; i++) if (pq[i].d < pq[bi].d) bi = i;
      const cur = pq.splice(bi, 1)[0];
      if (dist.get(nodeId(cur.st, cur.vi)) < cur.d - 1e-9) continue;

      // arrivée ?
      if (cur.vi === -1 && targetStops && targetStops.has(cur.st)) {
        return this.rebuild(prev, nodeId, cur, targetStops, toCoord);
      }

      if (cur.vi === -1) {
        // à pied : marche vers un autre arrêt
        (walkBy.get(cur.st) || []).forEach(e => {
          const other = e.a === cur.st ? e.b : e.a;
          push(other, -1, cur.d + e.t, { st: cur.st, vi: -1, kind: 'walk', t: e.t, d: e.d });
        });
        // montée dans une variante
        (at.get(cur.st) || []).forEach(x => {
          const v = this.variants[x.vi];
          if (x.i >= v.seq.length - 1) return; // terminus
          push(cur.st, x.vi, cur.d + 2.2, { st: cur.st, vi: -1, kind: 'board', t: 2.2, ligne: v.ligne });
        });
      } else {
        const v = this.variants[cur.vi];
        const i = v.seq.indexOf(cur.st);
        // descente
        push(cur.st, -1, cur.d, { st: cur.st, vi: cur.vi, kind: 'alight', t: 0 });
        if (i >= 0 && i < v.seq.length - 1) {
          const next = v.seq[i + 1];
          push(next, cur.vi, cur.d + v.times[i], { st: cur.st, vi: cur.vi, kind: 'ride', t: v.times[i], ligne: v.ligne, dest: v.dest });
        }
        // correspondance à quai (même côté si cap proche)
        const brg = i >= 0 ? v.bearings[i] : null;
        (at.get(cur.st) || []).forEach(x => {
          if (x.vi === cur.vi) return;
          const v2 = this.variants[x.vi];
          if (x.i >= v2.seq.length - 1) return;
          const b2 = v2.bearings[x.i];
          const same = (brg != null && b2 != null) ? angDiff(brg, b2) < 55 : false;
          const cost = same ? 1.0 : 3.6;
          push(cur.st, x.vi, cur.d + cost, { st: cur.st, vi: cur.vi, kind: same ? 'platform' : 'cross', t: cost, ligne: v2.ligne });
        });
      }
    }
    return null;
  },

  rebuild(prev, nodeId, endNode, targetStops, toCoord) {
    const steps = [];
    let cur = { st: endNode.st, vi: endNode.vi };
    let id = nodeId(cur.st, cur.vi);
    let guard = 0;
    while (prev.has(id) && guard++ < 500) {
      const p = prev.get(id);
      steps.push(Object.assign({ to: cur.st }, p));
      cur = { st: p.st, vi: p.vi };
      id = nodeId(cur.st, cur.vi);
    }
    steps.reverse();
    // regroupe
    const legs = [];
    steps.forEach(s => {
      const last = legs[legs.length - 1];
      if (last && last.kind === s.kind && last.ligne === s.ligne && s.kind !== 'board' && s.kind !== 'alight') {
        last.to = s.to; last.t += s.t || 0; last.n = (last.n || 0) + (s.kind === 'ride' ? 1 : 0);
        last.arrêts = (last.arrêts || []).concat([this.stops[s.to].nom]);
      } else {
        legs.push({ kind: s.kind, ligne: s.ligne, from: s.st, to: s.to, t: s.t || 0, n: s.kind === 'ride' ? 1 : 0, arrêts: s.kind === 'ride' ? [this.stops[s.to].nom] : [] });
      }
    });
    // nettoie les micro-étapes
    const clean = legs.filter(l => l.kind !== 'board' && l.kind !== 'alight' && !(l.t < 0.05 && l.kind === 'walk' && l.from === l.to));
    // marche finale vers la destination si coordonnées fournies
    let walkEnd = null;
    if (toCoord) {
      const st = this.stops[clean.length ? clean[clean.length - 1].to : 0];
      const d = km(st.lat, st.lon, toCoord.lat, toCoord.lon);
      if (d > 0.03) walkEnd = { kind: 'walk', from: st.i, to: null, t: d * 1000 / 1.35 / 60 * 1.1, d, nom: 'jusqu’à la destination' };
    }
    const total = clean.reduce((a, l) => a + l.t, 0) + (walkEnd ? walkEnd.t : 0);
    return { legs: clean, walkEnd, total, targetStops };
  },

  label(stIdx) { return stIdx === -1 ? 'Mon domicile' : this.stops[stIdx].nom; },

  /* destinations acceptables pour un tronçon (les deux sens possibles de la même ligne à cet arrêt) */
  possibleDests(leg) {
    const v = this.variants.find(x => x.ligne === leg.ligne && x.seq.indexOf(leg.from) >= 0);
    const v2 = this.variants.find(x => x.ligne === leg.ligne && x.seq.indexOf(leg.from) >= 0 && (!v || x.vi !== v.vi));
    const dests = [];
    if (v) dests.push(v.dest);
    if (v2) dests.push(v2.dest);
    return dests;
  }
};

/* --- Itinéraires : rendu --- */
const router = {
  current: null,
  dests: [],
  init() {
    const tabs = $('#routeTabs'); if (!tabs) return;
    this.dests = (CFG.destinations || []).slice();
    tabs.innerHTML = this.dests.map((d, i) =>
      '<button class="route-tab' + (i === 0 ? ' active' : '') + '" data-id="' + d.id + '">' + (d.ic ? d.ic + ' ' : '') + esc(d.label) + '</button>'
    ).join('');
    $$('.route-tab', tabs).forEach(b => b.addEventListener('click', () => {
      $$('.route-tab', tabs).forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const dest = this.dests.find(d => d.id === b.dataset.id);
      if (dest) showRoute(dest);
    }));
    this.initFinder();
    $('#swapBtn')?.addEventListener('click', () => {
      if (!this.current) return;
      const r = net.route(this.current.toName, 'Languedoc');
      if (r) paintRoute({ label: 'Retour', via: 'vers la rue du Languedoc', stop: 'Languedoc', id: 'retour' }, r);
    });
    showRoute(this.dests[0]);
  },

  /* ---------- recherche d'un arrêt par son nom ---------- */
  norm(t) {
    return String(t || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // accents
      .replace(/['’`]/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  },

  /* tous les arrêts, avec leurs lignes, pour la liste de suggestions */
  fillSuggestions() {
    const dl = $('#stopList'); if (!dl || !G.stops.length) return;
    dl.innerHTML = G.stops
      .slice().sort((a, b) => a[0].localeCompare(b[0], 'fr'))
      .map(s => '<option value="' + esc(s[0]) + '">' + esc((s[3] || []).join(' · ')) + '</option>')
      .join('');
  },

  /* retrouve un nom d'arrêt : exact, puis commence par, puis contient */
  findStop(q) {
    this.fillSuggestions();
    const nq = this.norm(q);
    if (!nq) return { err: 'empty' };
    const list = G.stops.map(s => ({ nom: s[0], n: this.norm(s[0]), lignes: s[3] || [] }));
    const exact = list.filter(x => x.n === nq);
    if (exact.length) return { nom: exact[0].nom, lignes: exact[0].lignes, exact: true };
    const start = list.filter(x => x.n.startsWith(nq));
    if (start.length === 1) return { nom: start[0].nom, lignes: start[0].lignes, approx: true };
    if (start.length > 1) return { err: 'many', cands: start.slice(0, 6) };
    const inName = list.filter(x => x.n.includes(nq));
    if (inName.length === 1) return { nom: inName[0].nom, lignes: inName[0].lignes, approx: true };
    if (inName.length > 1) return { err: 'many', cands: inName.slice(0, 6) };
    return { err: 'none' };
  },

  say(html) {
    const m = $('#stopMsg'); if (!m) return;
    if (!html) { m.hidden = true; m.innerHTML = ''; return; }
    m.hidden = false; m.innerHTML = html;
  },

  goToStop() {
    const input = $('#stopQuery'); if (!input) return;
    const res = this.findStop(input.value);
    input.classList.toggle('bad', !!(res.err && res.err !== 'empty'));

    if (res.err === 'empty') {
      this.say('Saisissez d’abord le nom d’un arrêt — par exemple <b>Révolution</b>, ' +
        '<b>Chamars</b> ou <b>Gare Viotte</b>.');
      input.focus(); return;
    }
    if (res.err === 'none') {
      this.say('Aucun arrêt de ce nom sur le réseau. Vérifiez l’orthographe, essayez ' +
        'un mot plus court, ou ouvrez le <a href="' + this.planUrl() + '" target="_blank" rel="noopener">' +
        '<b>plan des lignes</b></a> pour lire le nom exact.');
      return;
    }
    if (res.err === 'many') {
      this.say('Plusieurs arrêts correspondent : ' +
        res.cands.map(c => '« <b>' + esc(c.nom) + '</b> »').join(', ') + '. Précisez le nom.');
      return;
    }

    // c'est le domicile lui-même : rien à calculer
    if (res.nom === 'Languedoc') {
      this.say('« Languedoc » est votre arrêt de domicile — c’est le point de départ de tous les itinéraires.');
      return;
    }

    // trouvé : on affiche l'itinéraire depuis le domicile
    $$('.route-tab').forEach(x => x.classList.remove('active'));
    showRoute({ label: res.nom, stop: res.nom, via: 'Arrêt choisi dans la liste du réseau', id: 'custom' });
    const lg = (res.lignes && res.lignes.length) ? ' — lignes <b>' + esc(res.lignes.join(' · ')) + '</b>' : '';
    this.say('Itinéraire jusqu’à <b>' + esc(res.nom) + '</b> depuis la rue du Languedoc' + lg +
      (res.approx ? ' <i>(nom rapproché de votre saisie)</i>' : ''));
    const body = $('#routeBody'); if (body) body.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  planUrl() {
    return (window.LINKS && window.LINKS.ginkoPlan) ? window.LINKS.ginkoPlan : 'https://www.ginko.voyage/plan';
  },

  initFinder() {
    const input = $('#stopQuery'), go = $('#stopGo'), browse = $('#stopBrowse');
    this.fillSuggestions();
    go?.addEventListener('click', () => this.goToStop());
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); this.goToStop(); }
    });
    input?.addEventListener('input', () => { input.classList.remove('bad'); });
    browse?.addEventListener('click', () => {
      window.open(this.planUrl(), '_blank', 'noopener');
      this.say('Le plan s’ouvre dans un nouvel onglet : cliquez sur un arrêt pour lire son nom exact, ' +
        'puis revenez ici et tapez-le dans le champ.');
    });
  }
};

function fmtLeg(leg) {
  if (leg.kind === 'walk') {
    return { ic: '🚶', cls: 'walk', title: 'À pied', sub: (leg.d ? (Math.round(leg.d * 1000) + ' m') : '') };
  }
  if (leg.kind === 'platform' || leg.kind === 'cross') {
    return { ic: '⇄', cls: 'plat', title: 'Correspondance', sub: (leg.kind === 'cross' ? 'changer de quai' : 'même quai') + ' · ' + Math.round(leg.t) + ' min' };
  }
  const meta = G.lignes.find(l => l.num === leg.ligne) || { c: '#444', ct: '#fff' };
  return { ic: '●', cls: 'ride', title: '', sub: '', meta };
}

function paintRoute(dest, r) {
  const box = $('#routeBody'); if (!box) return;
  router.current = { toName: r.toName, dest };
  if (!r) { box.innerHTML = '<div class="empty">Aucun itinéraire trouvé avec le réseau urbain.</div>'; return; }
  const legs = r.legs;
  const rides = legs.filter(l => l.kind === 'ride');
  const firstRide = rides[0];
  const depart = nowParts().slice(0, 5);
  const nowMin = frHour() * 60;
  const arrive = nowMin + r.total;

  const stepsHtml = legs.map((leg, idx) => {
    const f = fmtLeg(leg);
    if (leg.kind === 'ride') {
      const meta = G.lignes.find(l => l.num === leg.ligne) || { c: '#555', ct: '#fff' };
      const dests = net.possibleDests(leg).filter(Boolean);
      const destLabel = dests.length > 1 ? dests.join(' ou ') : (dests[0] || '');
      const isTram = (G.lignes.find(l => l.num === leg.ligne) || {}).mode === 1;
      const icon = isTram ? '<svg><use href="#i-tram"/></svg>' : '<svg><use href="#i-bus"/></svg>';
      return '<li><span class="st-ic ride" style="background:' + meta.c + ';color:' + (meta.ct || '#fff') + '">' + icon + '</span>' +
        '<div class="st-txt"><div class="st-line"><span class="pill" style="background:' + meta.c + ';color:' + meta.ct + '">' + esc(leg.ligne) + '</span><i>direction ' + esc(destLabel) + '</i></div>' +
        '<b>' + esc(net.label(leg.from)) + ' → ' + esc(net.label(leg.to)) + '</b>' +
        '<span>' + (leg.n > 1 ? leg.n + ' arrêts · ' : '') + (leg.arrêts && leg.arrêts.length > 1 ? 'via ' + esc(leg.arrêts.slice(0, -1).slice(0, 3).join(', ')) + (leg.arrêts.length > 4 ? '…' : '') : 'direct') + '</span></div>' +
        '<div class="st-side"><b>' + Math.round(leg.t) + ' min</b>&nbsp;</div></li>';
    }
    const from = net.label(leg.from), to = leg.to == null ? 'destination' : net.label(leg.to);
    const label = leg.kind === 'walk'
      ? (leg.from === -1 ? 'Depuis chez vous jusqu’à ' + to : from + ' → ' + to)
      : 'à ' + from;
    return '<li><span class="st-ic ' + f.cls + '">' + f.ic + '</span>' +
      '<div class="st-txt"><b>' + (f.cls === 'plat' ? 'Correspondance à ' + esc(from) : 'À pied : ' + esc(from === 'Mon domicile' ? 'mon domicile' : from) + ' → ' + esc(to)) + '</b>' +
      '<span>' + esc(f.sub || '') + '</span></div>' +
      '<div class="st-side"><b>' + Math.round(leg.t) + ' min</b></div></li>';
  }).join('');

  const extraWalk = r.walkEnd ? '<li><span class="st-ic walk">🚶</span><div class="st-txt"><b>À pied : ' + esc(net.label(legs.length ? legs[legs.length - 1].to : 0)) + ' → ' + esc(dest.label || 'destination') + '</b><span>' + Math.round(r.walkEnd.d * 1000) + ' m · ' + Math.round(r.walkEnd.t) + ' min</span></div><div class="st-side"><b>' + Math.round(r.walkEnd.t) + ' min</b></div></li>' : '';

  box.innerHTML =
    '<div class="route-head">' +
      '<div class="route-big">≈ ' + Math.round(r.total) + '<small>min</small></div>' +
      '<div class="route-note">' + esc(dest.via || 'Trajet estimé depuis la rue du Languedoc') + '<br>' +
        '<small>Départ maintenant (' + depart + ') → arrivée vers <b>' + fmtHM(arrive) + '</b> · ' + (rides.length ? rides.length + ' ligne' + (rides.length > 1 ? 's' : '') : 'à pied') + '</small></div>' +
    '</div>' +
    '<div class="realtime-box" id="rtBox"><span>⏱</span><div id="rtText">Recherche du prochain passage réel…</div></div>' +
    '<ol class="steps">' + stepsHtml + extraWalk + '</ol>' +
    '<div class="route-alt">' +
      '<a class="mini-btn" href="' + (window.LINKS ? window.LINKS.ginkoItin : 'https://www.ginko.voyage/') + '" target="_blank" rel="noopener">Calculateur Ginko ↗</a>' +
      '<a class="mini-btn" href="https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=' + CFG.ginko.domicile.lat + ',' + CFG.ginko.domicile.lon + ';' + (r.endLat || '') + ',' + (r.endLon || '') + '" target="_blank" rel="noopener">Itinéraire vélo/à pied ↗</a>' +
      '<span style="font-size:.72rem;color:var(--txt-3)">Horaires théoriques — vérifiez le terminus affiché avant de monter.</span>' +
    '</div>';

  // --- le direct sur le premier tronçon ---
  if (firstRide) {
    const box2 = $('#rtText');
    ginko.stopTimes(net.label(firstRide.from), 4).then(async data => {
      const dests = net.possibleDests(firstRide);
      const matched = data.list.filter(d => d.ligne === firstRide.ligne && dests.some(x => x && (d.dest === x || d.dest.indexOf(x) >= 0 || x.indexOf(d.dest) >= 0)));
      const all = data.list.filter(d => d.ligne === firstRide.ligne);
      const use = matched.length ? matched : all;
      if (!use.length) { box2.innerHTML = '<b>Pas de passage annoncé</b> sur la ligne ' + esc(firstRide.ligne) + ' à ' + esc(net.label(firstRide.from)) + '. Réessayez dans un instant.'; return; }
      const next = use[0];
      const wait = next.min != null ? next.min : 0;
      const arriveReal = nowMin + Math.max(0, wait) + (r.total - 2.2 - firstRide.t * 0); // durée hors attente moyenne
      const arriveEst = nowMin + Math.max(0, wait) + r.total - 2.2;
      const quand = next.min != null
        ? (next.min <= 0 ? ' <b>à quai</b>' : ' dans <b>' + next.min + ' min</b>')
        : (next.heure ? ' à <b>' + esc(String(next.heure).replace(/\s/g, '').slice(0, 5)) + '</b>' : '');
      const suivants = use.slice(1, 4)
        .filter(d => d.min != null && d.min >= 0)
        .map(d => d.min + ' min (' + esc(d.dest) + ')');
      box2.innerHTML = '<b>' + esc(next.ligne) + ' → ' + esc(next.dest) + '</b> à ' + esc(net.label(firstRide.from)) + quand +
        (next.fiable ? ' <span style="opacity:.7">(temps réel)</span>' : ' <span style="opacity:.7">(théorique)</span>') +
        ' — vous seriez à destination vers <b>' + fmtHM(arriveEst) + '</b>' +
        (suivants.length ? '<br><small>Ensuite : ' + suivants.join(' · ') + '</small>' : '');
      document.getElementById('rtBox')?.classList.remove('warn');
    }).catch(() => {
      const t = $('#rtText'); if (t) t.innerHTML = '<b>Direct indisponible.</b> Itinéraire théorique ci-dessous.';
      $('#rtBox')?.classList.add('warn');
    });
  } else {
    const t = $('#rtText'); if (t) t.innerHTML = 'Trajet entièrement à pied — pas de correspondance nécessaire.';
  }
}

function showRoute(dest) {
  if (!dest) return;
  const toName = dest.stop;
  const r = net.route('Languedoc', toName);
  if (r) { r.toName = toName; }
  paintRoute(dest, r);
  if ($('#detailTitle')) $('#detailTitle').textContent = 'Depuis chez moi → ' + dest.label;
  if ($('#detailSub')) $('#detailSub').textContent = (dest.via || '') + (toName ? ' · arrêt ' + toName : '');
  const sw = $('#swapBtn'); if (sw) sw.style.display = toName ? 'grid' : 'none';
}

/* Itinéraire vers un lieu libre (depuis la modale des lieux) */
function routeToPlace(place) {
  net.build();
  // arrêt le plus proche
  let best = null;
  net.stops.forEach(s => {
    const d = km(s.lat, s.lon, place.lat, place.lon);
    if (!best || d < best.d) best = { s, d };
  });
  if (!best) return null;
  const r = net.route('Languedoc', best.s.nom, { lat: place.lat, lon: place.lon });
  if (!r) return null;
  r.toName = best.s.nom; r.endLat = place.lat; r.endLon = place.lon;
  const dest = { label: place.nom, via: 'vers ' + place.nom + ' · arrêt ' + best.s.nom, stop: best.s.nom, ic: place.ic };
  paintRoute(dest, r);
  if ($('#detailTitle')) $('#detailTitle').textContent = 'Depuis chez moi → ' + place.nom;
  if ($('#detailSub')) $('#detailSub').textContent = 'Arrêt conseillé : ' + best.s.nom + ' · ' + Math.round(best.d * 1000) + ' m jusqu’au lieu';
  $('#transitCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  $$('.route-tab').forEach(x => x.classList.remove('active'));
  const sw = $('#swapBtn'); if (sw) sw.style.display = 'grid';
  return r;
}

/* ============================ 7. CARTE DU RÉSEAU ============================ */
const map = {
  LINES: ['T1', 'T2', 'L3', 'L4', 'L5', 'L6', '7', '8', '9', '10', '11', '12', 'Plan B', 'Ginko Citadelle'],
  DEFAULT: ['T1', 'T2', 'L4', '7', '10', 'Ginko Citadelle'],
  visible: null, W: 360, H: 250, PAD: 12,

  project(lat, lon) {
    const b = { lonMin: 5.937, lonMax: 6.072, latMin: 47.202, latMax: 47.263 };
    const cosLat = Math.cos((b.latMin + b.latMax) / 2 * Math.PI / 180);
    const wkm = (b.lonMax - b.lonMin) * 111.32 * cosLat, hkm = (b.latMax - b.latMin) * 110.57;
    const s = Math.min((this.W - 2 * this.PAD) / wkm, (this.H - 2 * this.PAD) / hkm);
    const x0 = (this.W - wkm * s) / 2, y0 = (this.H - hkm * s) / 2;
    const x = x0 + (lon - b.lonMin) * 111.32 * cosLat * s;
    const y = y0 + (b.latMax - lat) * 110.57 * s;
    return [x, y];
  },

  offsetPath(pts, off) {
    // décale perpendiculairement chaque segment
    if (pts.length < 2) return '';
    let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len * off, ny = dx / len * off;
      d += 'L' + (x2 + nx).toFixed(1) + ' ' + (y2 + ny).toFixed(1);
      if (i < pts.length - 1) {
        const [x3, y3] = pts[i + 1];
        const dx2 = x3 - x2, dy2 = y3 - y2, len2 = Math.hypot(dx2, dy2) || 1;
        const nx2 = -dy2 / len2 * off, ny2 = dx2 / len2 * off;
        d += 'L' + (x2 + nx2).toFixed(1) + ' ' + (y2 + ny2).toFixed(1);
      }
    }
    return d;
  },

  init() {
    const svg = $('#mapSvg'); if (!svg || !G.stops.length) return;
    net.build();
    this.visible = new Set(store.get('mapLines', this.DEFAULT));
    svg.setAttribute('viewBox', '0 0 ' + this.W + ' ' + this.H);
    let html = '';

    // eau (Doubs + canal)
    const drawWater = (segs, w, color, op) => segs.map(seg => {
      const pts = seg.map(p => this.project(p[1], p[0]));
      return '<path d="' + this.offsetPath(pts, 0) + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + op + '"/>';
    }).join('');
    html += '<g>' + drawWater(G.doubs || [], 5.5, '#1d4f9c', .45) + drawWater(G.canal || [], 2.2, '#1d4f9c', .35) + '</g>';

    // lignes
    const lineIdx = {};
    this.LINES.forEach((l, i) => lineIdx[l] = i);
    const groups = {};
    G.variantes.forEach(v => { (groups[v.ligne] = groups[v.ligne] || []).push(v); });
    this.LINES.forEach(num => {
      const vs = groups[num]; if (!vs) return;
      const meta = G.lignes.find(x => x.num === num) || { c: '#888' };
      const off = (lineIdx[num] % 5 - 2) * 1.15;
      // une seule direction pour le tracé (évite les doublons)
      const v = vs[0];
      const pts = v.stops.map(i => this.project(G.stops[i][1], G.stops[i][2]));
      const on = this.visible.has(num);
      html += '<path data-line="' + esc(num) + '" d="' + this.offsetPath(pts, off) + '" fill="none" stroke="' + meta.c + '" ' +
        'stroke-width="' + (num === 'T1' || num === 'T2' ? 2.6 : 1.7) + '" stroke-linecap="round" stroke-linejoin="round" ' +
        'opacity="' + (on ? .95 : .13) + '"/>';
    });

    // arrêts
    html += '<g id="mapStops">';
    net.stops.forEach(s => {
      const [x, y] = this.project(s.lat, s.lon);
      const isFav = (CFG.favoris || []).some(f => f.nom === s.nom);
      html += '<circle class="mstop' + (isFav ? ' fav' : '') + '" data-nom="' + esc(s.nom) + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (isFav ? 2.6 : 1.5) + '" fill="' + (isFav ? '#ffd66b' : '#e9e7ff') + '" opacity="' + (isFav ? 1 : .55) + '"/>';
    });
    html += '</g>';

    // domicile
    const [hx, hy] = this.project(CFG.ginko.domicile.lat, CFG.ginko.domicile.lon);
    html += '<g id="mapHome"><circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="7" fill="#7f6bff" opacity=".28"><animate attributeName="r" values="5;9;5" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".35;.05;.35" dur="2.6s" repeatCount="indefinite"/></circle>' +
      '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="3.4" fill="#c9beff" stroke="#fff" stroke-width="1.2"/>' +
      '<text x="' + (hx + 7).toFixed(1) + '" y="' + (hy + 3).toFixed(1) + '" font-size="7.5" fill="#efeaff" font-weight="700">⌂ Languedoc</text></g>';

    svg.innerHTML = html;

    // légende
    const leg = $('#mapLegend');
    if (leg) leg.innerHTML = this.LINES.map(l => {
      const meta = G.lignes.find(x => x.num === l) || { c: '#888' };
      return '<span class="lg' + (this.visible.has(l) ? '' : ' off') + '" data-line="' + esc(l) + '"><i style="background:' + meta.c + '"></i>' + esc(l) + '</span>';
    }).join('');
    $$('#mapLegend .lg').forEach(chip => chip.addEventListener('click', () => {
      const l = chip.dataset.line;
      if (this.visible.has(l)) this.visible.delete(l); else this.visible.add(l);
      chip.classList.toggle('off');
      store.set('mapLines', [...this.visible]);
      $$('#mapSvg path[data-line]').forEach(p => {
        const on = this.visible.has(p.dataset.line);
        p.setAttribute('opacity', on ? .95 : .13);
        p.setAttribute('stroke-width', (p.dataset.line === 'T1' || p.dataset.line === 'T2') ? 2.6 : 1.7);
      });
    }));

    // interactions
    const tip = $('#mapTip');
    let tipTimer;
    svg.addEventListener('mousemove', e => {
      const c = e.target.closest('.mstop');
      if (!c) return;
      const s = net.byName.get(c.dataset.nom);
      if (!s) return;
      if (tip) {
        tip.textContent = c.dataset.nom + ' · ' + [...new Set(s.flatMap(x => x.lignes))].join(', ');
        clearTimeout(tipTimer);
      }
    });
    svg.addEventListener('mouseleave', () => { if (tip) tip.textContent = 'Survolez un arrêt'; });
    svg.addEventListener('click', e => {
      const c = e.target.closest('.mstop');
      if (c) openStopModal(c.dataset.nom);
    });
  }
};

/* ============================ 8. LIEUX ============================ */
const CATS = [
  { id: 'all', label: 'Tout' },
  { id: 'repère', label: 'Repères' },
  { id: 'culture', label: 'Culture' },
  { id: 'nature', label: 'Nature' },
  { id: 'commerce', label: 'Courses' },
  { id: 'sante', label: 'Santé' },
  { id: 'spirituel', label: 'Spirituel' }
];
const placesUI = {
  filter: 'all', q: '',
  init() {
    const chips = $('#placeChips'); if (!chips) return;
    chips.innerHTML = CATS.map(c => '<span class="chip' + (c.id === 'all' ? ' active' : '') + '" data-cat="' + c.id + '">' + c.label + '</span>').join('');
    $$('.chip', chips).forEach(ch => ch.addEventListener('click', () => {
      this.filter = ch.dataset.cat;
      $$('.chip', chips).forEach(x => x.classList.toggle('active', x === ch));
      this.render();
    }));
    $('#placeSearch')?.addEventListener('input', e => { this.q = e.target.value.toLowerCase(); this.render(); });
    this.render();
  },
  render() {
    const box = $('#placeList'); if (!box) return;
    const list = (window.PLACES || []).filter(p => (this.filter === 'all' || p.cat === this.filter) &&
      (!this.q || (p.nom + ' ' + (p.adresse || '') + ' ' + (p.desc || '')).toLowerCase().includes(this.q)));
    if (!list.length) { box.innerHTML = '<div class="empty">Aucun lieu ne correspond.</div>'; return; }
    box.innerHTML = list.map(p => '<div class="place-item" data-id="' + esc(p.id) + '" tabindex="0">' +
      '<span class="ic">' + (p.ic || '•') + '</span>' +
      '<div class="nm"><b>' + esc(p.nom) + '</b><span>' + esc(p.adresse || '') + '</span></div>' +
      '<span class="go">voir ›</span></div>').join('');
    $$('.place-item', box).forEach(el => {
      const open = () => openPlaceModal(el.dataset.id);
      el.addEventListener('click', open);
      el.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
    });
  }
};

function modalOpen(html) {
  const m = $('#placeModal');
  $('#modalBody').innerHTML = html;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
}
function modalClose() {
  $('#placeModal').hidden = true;
  document.body.style.overflow = '';
}

function openPlaceModal(id) {
  const p = (window.PLACES || []).find(x => x.id === id); if (!p) return;
  const stopNames = p.station ? [p.station] : [];
  const cat = (CATS.find(c => c.id === p.cat) || {}).label || '';
  modalOpen(
    '<div class="m-title"><span class="ic">' + (p.ic || '•') + '</span><div><h3>' + esc(p.nom) + '</h3><div class="cat">' + esc(cat) + '</div></div></div>' +
    '<div class="m-addr">' + esc(p.adresse || '') + '</div>' +
    '<div class="m-desc">' + p.desc + '</div>' +
    (p.infos && p.infos.length ? '<div class="m-sec">Bon à savoir</div><ul class="m-list">' + p.infos.map(i => '<li>' + i + '</li>').join('') + '</ul>' : '') +
    (stopNames.length ? '<div class="m-sec">Arrêt(s) Ginko à proximité</div><div class="m-stops" id="mStops">' + stopNames.map(n => '<div class="m-stop" data-nom="' + esc(n) + '"><b>' + esc(n) + '</b><span>chargement des passages…</span></div>').join('') + '</div>' : '') +
    '<div class="m-sec">Y aller depuis chez moi</div>' +
    '<div class="m-links">' +
      '<a href="#" id="mGoRoute">🚏 Itinéraire dans l’agenda</a>' +
      '<a href="https://www.openstreetmap.org/?mlat=' + p.lat + '&mlon=' + p.lon + '#map=16/' + p.lat + '/' + p.lon + '" target="_blank" rel="noopener">🗺 Voir sur la carte</a>' +
      '<a href="https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lon + '&travelmode=transit" target="_blank" rel="noopener">🧭 Google Maps</a>' +
      (p.lien ? '<a href="' + p.lien.u + '" target="_blank" rel="noopener">🔗 ' + esc(p.lien.t) + '</a>' : '') +
    '</div>'
  );
  // itinéraire
  $('#mGoRoute')?.addEventListener('click', e => {
    e.preventDefault(); modalClose(); routeToPlace(p);
  });
  // passages réels
  stopNames.forEach(nom => {
    ginko.stopTimes(nom, 3).then(d => {
      const el = $('.m-stop[data-nom="' + CSS.escape(nom) + '"]');
      if (!el) return;
      const seen = {}; const picked = [];
      d.list.forEach(x => { const k = x.ligne + '|' + x.dest; if (!seen[k]) { seen[k] = 1; picked.push(x); } });
      const best = picked.slice(0, 5).map(x => '<span style="color:#8bffc4;font-weight:700">' + esc(x.ligne) + '</span> ' + esc(x.dest) + ' · ' + (x.min != null ? (x.min <= 0 ? 'à quai' : x.min + ' min') : (x.heure || ''))).join('<br>');
      el.innerHTML = '<b>' + esc(d.nom) + '</b><span>' + (best || 'pas de passage') + '</span>';
    }).catch(() => {});
  });
}

function openStopModal(nom) {
  net.build();
  const ss = net.byName.get(nom);
  if (!ss) { toast('Arrêt inconnu : ' + nom); return; }
  const lignes = [...new Set(ss.flatMap(s => s.lignes))];
  const meta = lignes.map(l => {
    const m = G.lignes.find(x => x.num === l) || { c: '#555', ct: '#fff' };
    return '<span class="pill" style="background:' + m.c + ';color:' + m.ct + '">' + esc(l) + '</span>';
  }).join(' ');
  const dist = Math.round(km(CFG.ginko.domicile.lat, CFG.ginko.domicile.lon, ss[0].lat, ss[0].lon) * 1000);
  modalOpen(
    '<div class="m-title"><span class="ic">🚏</span><div><h3>Arrêt ' + esc(nom) + '</h3><div class="cat">' + dist + ' m du domicile</div></div></div>' +
    '<div class="m-stops" style="margin-bottom:6px"><div class="m-stop" id="mStopLive" data-nom="' + esc(nom) + '"><b>' + esc(nom) + '</b><span>chargement des passages…</span></div></div>' +
    '<div class="m-sec">Lignes desservies</div><div class="m-stops">' + meta + '</div>' +
    '<div class="m-sec">Depuis / vers le domicile</div>' +
    '<div class="m-links"><a href="#" id="mGoStop">🚏 Itinéraire depuis la rue du Languedoc</a>' +
    '<a href="https://www.ginko.voyage/plan" target="_blank" rel="noopener">🔗 Plan du réseau</a></div>'
  );
  ginko.stopTimes(nom, 3).then(d => {
    const el = $('#mStopLive'); if (!el) return;
    // un premier passage par ligne et par sens, puis le suivant
    const seen = {};
    d.list.forEach(x => { const k = x.ligne + '|' + x.dest; seen[k] = (seen[k] || 0) + 1; });
    const picked = [];
    const used = {};
    d.list.forEach(x => {
      const k = x.ligne + '|' + x.dest;
      if ((used[k] || 0) < 2) { used[k] = (used[k] || 0) + 1; picked.push(x); }
    });
    const rows = picked.slice(0, 7).map(x => '<span><span style="color:#8bffc4;font-weight:700">' + esc(x.ligne) + '</span> ' + esc(x.dest) + ' — ' + (x.min != null ? (x.min <= 0 ? 'à quai' : x.min + ' min') : (x.heure || '—')) + (x.fiable ? '' : ' <em style="opacity:.6;font-style:normal">(théorique)</em>') + '</span>').join('');
    el.innerHTML = '<b>' + esc(d.nom) + '</b>' + (rows || '<span>aucun passage</span>');
  }).catch(() => { const el = $('#mStopLive'); if (el) el.querySelector('span').textContent = 'passages indisponibles'; });
  $('#mGoStop')?.addEventListener('click', e => {
    e.preventDefault(); modalClose();
    const r = net.route('Languedoc', nom);
    if (!r) { toast('Pas d’itinéraire trouvé.'); return; }
    r.toName = nom;
    paintRoute({ label: nom, via: 'Depuis la rue du Languedoc', stop: nom, ic: '🚏' }, r);
    $('#transitCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('#detailTitle').textContent = 'Depuis chez moi → ' + nom;
  });
}

/* ============================ 9. AGENDA DU JOUR ============================ */
const agenda = {
  key() { const d = new Date(); return 'agenda.' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
  items() { return store.get(this.key(), []); },
  save(items) { store.set(this.key(), items); this.render(); },
  init() {
    $('#addAgenda')?.addEventListener('click', () => {
      const f = $('#agendaForm'); f.hidden = !f.hidden;
      if (!f.hidden) { $('#evTime').value = nowParts().slice(0, 5); $('#evText').focus(); }
    });
    $('#agendaForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const t = $('#evTime').value, txt = $('#evText').value.trim();
      if (!t || !txt) return;
      const items = this.items(); items.push({ t, txt, done: false, id: Date.now() });
      this.save(items); $('#evText').value = ''; $('#agendaForm').hidden = true;
      toast('Ajouté à l’agenda du jour.');
    });
    this.render();
  },
  render() {
    const ul = $('#agendaList'); if (!ul) return;
    const items = this.items().sort((a, b) => a.t.localeCompare(b.t));
    if (!items.length) { ul.innerHTML = '<li class="empty">Rien de prévu aujourd’hui. Cliquez sur « + Ajouter ».</li>'; return; }
    const now = nowParts().slice(0, 5);
    ul.innerHTML = items.map(it =>
      '<li class="' + (it.done ? 'done' : '') + '" data-id="' + it.id + '"><input type="checkbox" ' + (it.done ? 'checked' : '') + '>' +
      '<span class="h">' + esc(it.t) + '</span><span class="t">' + esc(it.txt) + '</span>' +
      (it.t < now && !it.done ? '<span style="font-size:.64rem;color:var(--orange)">passé</span>' : '') +
      '<button class="x" title="Supprimer">✕</button></li>'
    ).join('');
    $$('#agendaList li').forEach(li => {
      const id = +li.dataset.id;
      li.querySelector('input')?.addEventListener('change', e => {
        const items = this.items().map(x => x.id === id ? Object.assign({}, x, { done: e.target.checked }) : x);
        this.save(items);
      });
      li.querySelector('.x')?.addEventListener('click', () => {
        this.save(this.items().filter(x => x.id !== id));
      });
    });
  }
};

/* ============================ 10. SORTIES ============================ */
function renderEvents() {
  const ul = $('#eventsList'); if (!ul) return;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const evs = (window.EVENTS || []).map(e => {
    const [y, m, d] = e.date.split('-').map(Number);
    const end = e.fin ? new Date(...e.fin.split('-').map((v, i) => i === 1 ? +v - 1 : +v)) : new Date(y, m - 1, d);
    return Object.assign({}, e, { start: new Date(y, m - 1, d), end });
  }).filter(e => e.end >= today).sort((a, b) => a.start - b.start).slice(0, 10);
  if (!evs.length) { ul.innerHTML = '<li class="empty">Aucune sortie enregistrée.</li>'; return; }
  const mois = ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
  ul.innerHTML = evs.map(e => {
    const j = e.start < today ? today : e.start;
    return '<li><div class="ev-date"><b>' + pad(j.getDate()) + '</b><span>' + mois[j.getMonth()] + '</span></div>' +
      '<div class="ev-body"><b>' + esc(e.titre) + '<span class="ev-cat">' + esc(e.cat || 'sortie') + '</span></b>' +
      '<span>' + esc(e.lieu) + (e.fin ? ' · jusqu’au ' + pad(e.end.getDate()) + '/' + pad(e.end.getMonth() + 1) : '') + '</span><br>' +
      '<span style="opacity:.75">' + esc(e.desc || '') + '</span>' +
      (e.lien ? ' <a href="' + e.lien + '" target="_blank" rel="noopener">infos ↗</a>' : '') + '</div></li>';
  }).join('');
}

/* ============================ 11. ACTUS ============================ */
const news = {
  cache: {},
  async viaRss2json(url) {
    const j = await fetchJSON('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url), {}, 15000);
    if (j.status !== 'ok' || !j.items) throw new Error('rss2json: ' + (j.message || j.status));
    return j.items.map(i => ({
      title: i.title, link: i.link, date: i.pubDate,
      desc: (i.description || i.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }));
  },
  async viaAllOrigins(url) {
    const j = await fetchJSON('https://api.allorigins.win/get?url=' + encodeURIComponent(url), {}, 20000);
    let txt = j && j.contents ? String(j.contents) : '';
    const m = /^data:[^;]+;base64,(.*)$/s.exec(txt);
    if (m) { try { txt = atob(m[1]); } catch (e) { txt = decodeURIComponent(escape(atob(m[1]))); } }
    if (!txt) throw new Error('réponse vide');
    const doc = new DOMParser().parseFromString(txt, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 8).map(it => ({
      title: it.querySelector('title')?.textContent || '',
      link: it.querySelector('link')?.textContent || '',
      date: it.querySelector('pubDate')?.textContent || '',
      desc: (it.querySelector('description')?.textContent || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }));
    if (!items.length) throw new Error('flux vide');
    return items;
  },
  async load(feed) {
    const url = (CFG.actus || {})[feed];
    const box = $('#newsContent'); if (!box || !url) return;
    let items = this.cache[feed];
    if (!items) {
      box.innerHTML = '<div class="skeleton">Chargement des actualités…</div>';
      try { items = await this.viaRss2json(url); }
      catch (e1) {
        console.warn('actus: rss2json KO, proxy de secours', e1.message);
        try { items = await this.viaAllOrigins(url); }
        catch (e2) {
          console.warn('actus: proxy KO', e2.message);
          box.innerHTML = '<div class="empty">Flux momentanément inaccessible depuis ce poste.<br><a href="https://www.macommune.info/" target="_blank" rel="noopener">Lire directement maCommune.info ↗</a></div>';
          return;
        }
      }
      this.cache[feed] = items;
    }
    box.innerHTML = items.slice(0, 6).map(i => {
      let d = '';
      if (i.date) {
        const dd = new Date(String(i.date).replace(' ', 'T'));
        if (!isNaN(dd)) d = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(dd);
      }
      return '<article class="news-item"><div class="k">' + (feed === 'une' ? 'À la une' : feed === 'loisirs' ? 'Loisirs' : 'Culture') + '</div>' +
        '<h3><a href="' + esc(i.link) + '" target="_blank" rel="noopener">' + esc(i.title) + '</a></h3>' +
        '<p>' + esc((i.desc || '').slice(0, 150)) + ((i.desc || '').length > 150 ? '…' : '') + '</p>' +
        '<div class="d">' + esc(d) + '</div></article>';
    }).join('');
  },
  init() {
    const tabs = $('#newsTabs');
    tabs?.addEventListener('click', e => {
      const b = e.target.closest('button[data-feed]'); if (!b) return;
      $$('button', tabs).forEach(x => x.classList.toggle('active', x === b));
      this.load(b.dataset.feed);
    });
    this.load('une');
  }
};

/* ============================ 12. MÉTÉO ============================ */
const WEATHER = {
  0: ['☀', 'Ensoleillé'], 1: ['🌤', 'Peu nuageux'], 2: ['⛅', 'Partiellement nuageux'], 3: ['☁', 'Couvert'],
  45: ['🌫', 'Brouillard'], 48: ['🌫', 'Brouillard givrant'], 51: ['🌦', 'Bruine'], 53: ['🌦', 'Bruine'],
  55: ['🌦', 'Bruine dense'], 56: ['🌧', 'Bruine verglaçante'], 57: ['🌧', 'Bruine verglaçante'],
  61: ['🌧', 'Pluie faible'], 63: ['🌧', 'Pluie'], 65: ['🌧', 'Forte pluie'], 66: ['🌧', 'Pluie verglaçante'],
  67: ['🌧', 'Pluie verglaçante'], 71: ['🌨', 'Neige faible'], 73: ['🌨', 'Neige'], 75: ['❄', 'Forte neige'],
  77: ['🌨', 'Grains de neige'], 80: ['🌦', 'Averses'], 81: ['🌦', 'Averses'], 82: ['⛈', 'Fortes averses'],
  85: ['🌨', 'Averses de neige'], 86: ['🌨', 'Averses de neige'], 95: ['⛈', 'Orage'], 96: ['⛈', 'Orage grêleux'],
  99: ['⛈', 'Orage violent']
};
const airColor = aqi => aqi == null ? '#888' : aqi <= 20 ? '#41d18b' : aqi <= 40 ? '#c7e04a' : aqi <= 60 ? '#ffcf5c' : aqi <= 80 ? '#ff9f43' : aqi <= 100 ? '#ff6b6b' : '#c0392b';
const airLabel = aqi => aqi == null ? '—' : aqi <= 20 ? 'très bonne' : aqi <= 40 ? 'bonne' : aqi <= 60 ? 'moyenne' : aqi <= 80 ? 'médiocre' : aqi <= 100 ? 'mauvaise' : 'très mauvaise';

async function loadWeather() {
  const box = $('#weatherContent'); if (!box) return;
  const { lat, lon } = CFG.meteo || { lat: 47.2378, lon: 6.0241 };
  try {
    const j = await fetchJSON('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=Europe%2FParis&forecast_days=5', {}, 14000);
    const c = j.current, d = j.daily;
    const [ic, txt] = WEATHER[c.weather_code] || ['◌', 'Variable'];
    box.innerHTML =
      '<div class="weather-main"><div class="w-icon">' + ic + '</div><div>' +
        '<div class="w-temp">' + Math.round(c.temperature_2m) + '<small>°C</small></div>' +
        '<div class="w-desc">' + txt + '</div>' +
        '<div class="w-feels">ressenti ' + Math.round(c.apparent_temperature) + '° · humidité ' + Math.round(c.relative_humidity_2m) + ' %</div>' +
      '</div></div>' +
      '<div class="w-details">' +
        '<div class="w-det"><b>' + Math.round(d.temperature_2m_min[0]) + '°</b><span>min</span></div>' +
        '<div class="w-det"><b>' + Math.round(d.temperature_2m_max[0]) + '°</b><span>max</span></div>' +
        '<div class="w-det"><b>' + Math.round(c.wind_speed_10m) + '</b><span>km/h</span></div>' +
      '</div>';

    const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    $('#forecast').innerHTML = d.time.slice(0, 5).map((t, i) => {
      const dd = new Date(t + 'T12:00:00');
      const [i2] = WEATHER[d.weather_code[i]] || ['◌'];
      return '<div class="fc"><b>' + (i === 0 ? 'auj.' : days[dd.getDay()]) + '</b><span class="i">' + i2 + '</span>' +
        '<span class="t">' + Math.round(d.temperature_2m_max[i]) + '° <small>' + Math.round(d.temperature_2m_min[i]) + '°</small></span>' +
        (d.precipitation_probability_max[i] > 15 ? '<b style="color:#9ad9ff">' + d.precipitation_probability_max[i] + ' %</b>' : '') + '</div>';
    }).join('');

    astro.sunrise = +d.sunrise[0].split('T')[1].slice(0, 2) + (+d.sunrise[0].split('T')[1].slice(3, 5)) / 60;
    astro.sunset = +d.sunset[0].split('T')[1].slice(0, 2) + (+d.sunset[0].split('T')[1].slice(3, 5)) / 60;
    if ($('#sunrise')) $('#sunrise').textContent = d.sunrise[0].split('T')[1].slice(0, 5);
    if ($('#sunset')) $('#sunset').textContent = d.sunset[0].split('T')[1].slice(0, 5);
    if ($('#daylight')) {
      const mins = Math.round((astro.sunset - astro.sunrise) * 60);
      $('#daylight').textContent = Math.floor(mins / 60) + ' h ' + pad(mins % 60);
    }
    tickClock();

    try {
      const a = await fetchJSON('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + lat + '&longitude=' + lon +
        '&current=european_aqi,pm2_5&timezone=Europe%2FParis', {}, 10000);
      const aqi = a.current.european_aqi;
      $('#airQuality').innerHTML = '<span class="dot" style="background:' + airColor(aqi) + '"></span> Qualité de l’air : <b>' + airLabel(aqi) + '</b> (indice ' + aqi + ') · PM2,5 ' + Math.round(a.current.pm2_5) + ' µg/m³';
    } catch (e) { $('#airQuality').innerHTML = ''; }
  } catch (e) {
    console.warn('météo', e);
    box.innerHTML = '<div class="empty">Météo indisponible pour le moment.</div>';
  }
}

/* ============================ 13. HOROSCOPE ============================ */
async function loadHoroscope() {
  const box = $('#horoBox'); if (!box) return;
  // signes définis dans config.js (bloc « horo ») — 2 par défaut : Verseau et Balance
  const signs = (CFG.horo && CFG.horo.length ? CFG.horo : [{ slug: 'verseau', label: '♒ Verseau' }])
    .map(h => [h.slug, h.label]);
  const grab = async (url) => {
    // 1) rss2json (CORS ouvert, fonctionne aussi en mode fichier)
    try {
      const j = await fetchJSON('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url), {}, 12000);
      const it = j.items && j.items[0];
      if (it) return it.description || it.content || '';
    } catch (e) { /* on tente le proxy */ }
    // 2) proxy allorigins (réponse parfois en base64)
    const j = await fetchJSON('https://api.allorigins.win/get?url=' + encodeURIComponent(url), {}, 20000);
    let txt = j && j.contents ? String(j.contents) : '';
    const m = /^data:[^;]+;base64,(.*)$/s.exec(txt);
    if (m) { try { txt = atob(m[1]); } catch (e) {} }
    const doc = new DOMParser().parseFromString(txt, 'text/xml');
    const it = doc.querySelector('item');
    if (!it) throw new Error('vide');
    return (it.querySelector('description')?.textContent || it.querySelector('title')?.textContent || '').trim();
  };
  const out = await Promise.all(signs.map(async ([sg, label]) => {
    try {
      let txt = await grab('https://www.mon-horoscope-du-jour.com/rss/rss_' + sg + '.php');
      txt = txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      txt = txt.replace(/^[A-ZÉÈÀ][A-Za-zéèêàçûôîï'-]+ ?:/, '');
      if (!txt) return '';
      return '<details class="horo"><summary><b>' + label + '</b><span>' + esc(txt.slice(0, 78)) + '…</span></summary><p>' + esc(txt.slice(0, 460)) + (txt.length > 460 ? '…' : '') + '</p></details>';
    } catch (e) { return ''; }
  }));
  const html = out.filter(Boolean).join('');
  box.innerHTML = html || '<div class="empty">Horoscopes indisponibles aujourd’hui — <a href="https://www.mon-horoscope-du-jour.com/" target="_blank" rel="noopener">voir sur le site ↗</a></div>';
}

/* ============================ 14. DÉMARRAGE ============================ */
function bindExtras() {
  $('#ginkoRefresh')?.addEventListener('click', () => { ginko.refresh(); toast('Rafraîchissement des passages…', 1400); });
  $('#modalClose')?.addEventListener('click', modalClose);
  $('#placeModal')?.addEventListener('click', e => { if (e.target.id === 'placeModal') modalClose(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modalClose(); });
  // clic sur la carte "arrêts favoris" -> carte plus bas
  $('#version').textContent = CFG.version || '';
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tickClock(); ginko.refresh(); } });
}

function boot() {
  try {
    // nettoyage : toute clé mémorisée par l'ancien bouton 🔑 est effacée
    try { if (store.get('ginkoKey', '')) store.set('ginkoKey', ''); } catch (e) {}
    buildStars();
    tickClock(); setInterval(tickClock, 1000);
    pickQuote();
    radio.init();
    renderMarkets(); setInterval(renderMarkets, 60000);
    initMemo();
    renderPerso();
    net.build();
    router.init();
    map.init();
    placesUI.init();
    agenda.init();
    renderEvents();
    news.init();
    loadWeather();
    loadHoroscope();
    ginko.start();
    bindExtras();
    console.log('%cMon Éphéméride Besançon — prêt', 'color:#00a5c2;font-weight:700');
  } catch (e) {
    console.error('Erreur au démarrage', e);
    toast('Une partie de l’agenda n’a pas pu démarrer : ' + e.message, 6000);
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

// API minimale pour la console / le debug
window.AgendaBesancon = { ginko, net, routeToPlace, openPlaceModal, openStopModal, CFG };

})();
