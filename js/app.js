// STL Come-back : application (état local, écrans, minuteurs, exports)
(function () {
  const KEY = 'stl-comeback-v1';
  const P = PROGRAM;
  const $ = (sel, root = document) => root.querySelector(sel);
  const view = $('#view');

  // ---------- État ----------
  const blank = () => ({ settings: { name: '', age: 52, hrMax: '' }, logs: {}, tests: { initial: {}, final: {} } });
  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { state = blank(); }
  state.settings = Object.assign(blank().settings, state.settings);
  state.tests = Object.assign({ initial: {}, final: {} }, state.tests);
  state.logs = state.logs || {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('Sauvegarde impossible sur cet appareil'); } };
  const getLog = (key) => (state.logs[key] = state.logs[key] || { status: 'draft', ex: {}, warm: {}, cardio: {}, after: {} });

  // ---------- Utilitaires ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (v) => (v === '' || v == null || isNaN(+v) ? null : +v);
  const today = () => new Date().toISOString().slice(0, 10);
  const frDate = (d) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '');
  const fmt = (n, d = 1) => (n == null ? '–' : (+n).toLocaleString('fr-FR', { maximumFractionDigits: d }));
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const sessLabel = (key) => { const [w, s] = key.split('-'); return `Semaine ${w} · Séance ${s}`; };
  const isDone = (key) => state.logs[key]?.status === 'done';
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); }

  const hrMax = () => num(state.settings.hrMax) || Math.round(208 - 0.7 * (num(state.settings.age) || 52));
  const zone = (z) => P.zones.find((x) => String(x.z) === String(z));
  const zoneBpm = (z) => { const Z = zone(z), m = hrMax(); return [Math.round(Z.lo * m), Math.round(Z.hi * m)]; };
  const zoneColor = (z) => `var(--z${z})`;

  // Audio (bip de fin de récupération / changement de phase)
  let actx;
  function beep(times = 1) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < times; i++) {
        const o = actx.createOscillator(), g = actx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(actx.destination);
        const t0 = actx.currentTime + i * 0.25;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        o.start(t0); o.stop(t0 + 0.2);
      }
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(200);
  }
  document.addEventListener('touchstart', () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) {} }, { once: true });

  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => (wakeLock = null)); }
      if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) {}
  }

  // ---------- Minuteur de récupération ----------
  const timerEl = $('#timer');
  let rest = null;
  function startRest(seconds, label) {
    rest = { end: Date.now() + seconds * 1000, label, fired: false };
    timerEl.hidden = false; timerEl.classList.remove('end');
    tickRest();
  }
  function tickRest() {
    if (!rest) return;
    const left = (rest.end - Date.now()) / 1000;
    $('#timerLabel').textContent = left > 0 ? rest.label : 'C’est reparti !';
    $('#timerTime').textContent = mmss(left);
    if (left <= 0 && !rest.fired) { rest.fired = true; timerEl.classList.add('end'); beep(3); setTimeout(() => { if (rest && rest.fired) stopRest(); }, 6000); }
  }
  function stopRest() { rest = null; timerEl.hidden = true; }
  $('#timerStop').onclick = stopRest;
  $('#timerPlus').onclick = () => { if (rest) { rest.end += 15000; rest.fired = false; timerEl.classList.remove('end'); } };

  // ---------- Minuteur vélo ----------
  let ride = null; // {key, start, acc, running, lastIdx}
  const segs = (key) => P.cardio[key].seg;
  function rideElapsed() { if (!ride) return 0; return ride.acc + (ride.running ? (Date.now() - ride.start) / 1000 : 0); }
  function rideState(key) {
    const s = segs(key); let t = rideElapsed(), acc = 0;
    for (let i = 0; i < s.length; i++) { const d = s[i][0] * 60; if (t < acc + d) return { i, left: acc + d - t, total: t }; acc += d; }
    return { i: s.length, left: 0, total: t };
  }
  function renderRide() {
    const box = $('#ridebox'); if (!box || !ride) return;
    const key = ride.key, s = segs(key), st = rideState(key);
    if (st.i !== ride.lastIdx) { if (ride.lastIdx != null) beep(st.i >= s.length ? 3 : 2); ride.lastIdx = st.i; document.querySelectorAll('.seglist li').forEach((li, i) => li.classList.toggle('now', i === st.i)); }
    if (st.i >= s.length) { box.style.background = 'var(--accent-soft)'; box.innerHTML = `<div class="lab">Terminé · ${mmss(st.total)}</div><div class="hr">Note ta distance et ta FC ci-dessous.</div>`; ride.running = false; keepAwake(false); return; }
    const [, z, lab] = s[st.i], [lo, hi] = zoneBpm(z);
    box.style.background = zoneColor(z);
    box.innerHTML = `<div class="lab">${esc(lab)}</div><div class="clock">${mmss(st.left)}</div><div class="hr">${esc(zone(z).name)} · <b>${lo}–${hi} bpm</b> · ${esc(zone(z).talk)}</div><div class="small">Temps total ${mmss(st.total)}${ride.running ? '' : ' · en pause'}</div>`;
  }
  setInterval(() => { tickRest(); if (ride && ride.running) renderRide(); }, 250);

  // ---------- Conseils de charge ----------
  function lastPerf(exId, key) {
    const idx = P.order.indexOf(key);
    for (let i = idx - 1; i >= 0; i--) {
      const k = P.order[i], e = state.logs[k]?.ex?.[exId];
      if (e && e.sets && e.sets.some((s) => s.done)) return { key: k, ...e };
    }
    return null;
  }
  function advice(exId, key) {
    const ex = P.exercises[exId], w = +key.split('-')[0], d = P.dose(exId, w);
    const last = lastPerf(exId, key);
    if (!ex.load) return last ? `Dernière fois (${shortKey(last.key)}) : ${last.sets.filter((s) => s.done).map((s) => s.reps || '–').join(' / ')}${last.rpe ? ` · effort ${last.rpe}/10` : ''}` : '';
    if (!last) {
      if (ex.cat === 'coiffe') return 'Première fois : élastique léger ou 1 à 2,5 kg. Aucune douleur.';
      return `Première fois : choisis une charge que tu pourrais pousser environ ${d.hi + 5} fois. Tu dois finir chaque série à ${d.rpe}/10.`;
    }
    const done = last.sets.filter((s) => s.done);
    const kg = Math.max(...done.map((s) => num(s.kg) || 0));
    const lw = +last.key.split('-')[0], ld = P.dose(exId, lw), target = parseFloat(String(ld.rpe));
    const hit = done.length >= ld.s && done.every((s) => (num(s.reps) || 0) >= ld.hi);
    let tip;
    if (ex.cat === 'coiffe') tip = 'Reste léger : l’objectif est la qualité, pas la charge.';
    else if (last.rpe && last.rpe >= target + 2) tip = 'C’était dur : garde la même charge (ou baisse un peu).';
    else if (w > lw && P.dose(exId, w).lo < ld.lo) tip = 'Moins de répétitions cette semaine : monte d’un cran (+1 à 2,5 kg).';
    else if (hit && (!last.rpe || last.rpe <= target)) tip = 'Tout réussi facilement : monte d’un cran (+1 à 2,5 kg).';
    else tip = 'Garde la même charge et vise toutes les répétitions.';
    return `Dernière fois (${shortKey(last.key)}) : ${fmt(kg)} kg × ${done.map((s) => s.reps || '–').join(' / ')}${last.rpe ? ` · effort ${last.rpe}/10` : ''}<br><b>${tip}</b>`;
  }
  const shortKey = (k) => `S${k.split('-')[0]}·${k.split('-')[1]}`;

  // ---------- Navigation ----------
  const titleEl = $('#title'), backBtn = $('#backBtn');
  backBtn.onclick = () => history.back();
  document.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => (location.hash = b.dataset.tab)));
  window.addEventListener('hashchange', route);

  function route() {
    const h = location.hash.slice(1) || 'home';
    const [page, arg] = h.split('/');
    const tab = page === 's' ? 'home' : page;
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    backBtn.hidden = page !== 's';
    if (page !== 's' && ride && !ride.running) ride = null;
    view.onclick = view.oninput = view.onchange = null;
    window.scrollTo(0, 0);
    ({ home: renderHome, s: () => renderSession(arg), history: renderHistory, tests: renderTests, infos: renderInfos }[page] || renderHome)();
  }

  // ---------- Écran : programme ----------
  function renderHome() {
    titleEl.textContent = P.title;
    const doneN = P.order.filter(isDone).length;
    const next = P.order.find((k) => !isDone(k));
    const name = state.settings.name ? `, ${esc(state.settings.name)}` : '';
    let html = `<div class="card hero">
      <div class="small" style="opacity:.85">${P.cycle}</div>
      <h2 style="margin:2px 0 0">${doneN === 0 ? `Bienvenue${name} !` : doneN === 10 ? `Cycle terminé${name} !` : `Bravo${name}, continue !`}</h2>
      <div class="progress"><div style="width:${doneN * 10}%"></div></div>
      <div class="small muted">${doneN} / 10 séances · 5 semaines · ≈ 90 min par séance</div>
      ${next ? `<div style="margin-top:12px"><button class="btn white block" data-go="s/${next}">${state.logs[next] ? 'Reprendre' : 'Commencer'} : ${sessLabel(next)}</button></div>`
             : `<div style="margin-top:12px"><button class="btn white block" data-go="tests">Voir et exporter le bilan</button></div>`}
    </div>`;
    if (!state.tests.initial.date) html += `<div class="card"><h3>Avant la première séance</h3><p class="muted" style="margin:4px 0 10px">Fais valider le programme par le kiné ou le chirurgien, puis remplis le bilan de départ (mesures + tests) pendant la séance 1·A.</p><button class="btn light sm" data-go="infos">Lire les consignes de sécurité</button></div>`;
    for (const wk of P.weeks) {
      html += `<div class="card week"><h2>Semaine ${wk.n} <span class="tag">${wk.name}</span></h2><p class="muted" style="margin:0 0 6px">${wk.goal}</p>`;
      for (const s of ['A', 'B']) {
        const key = `${wk.n}-${s}`, lg = state.logs[key];
        const status = isDone(key) ? `Faite le ${frDate(lg.date)}` : lg ? 'En cours' : `${P.cardio[key].title}`;
        html += `<div class="sess ${isDone(key) ? 'done' : ''}" data-go="s/${key}"><div class="badge">${isDone(key) ? '✓' : s}</div><div class="meta"><div><b>${P.sessions[s].name}</b></div><div class="muted small">${esc(status)}</div></div><div class="chev">›</div></div>`;
      }
      html += `</div>`;
    }
    view.innerHTML = html;
  }

  // ---------- Écran : séance ----------
  function renderSession(key) {
    if (!P.cardio[key]) return renderHome();
    const [w, s] = key.split('-').map((x, i) => (i ? x : +x));
    titleEl.textContent = `S${w} · ${P.sessions[s].name}`;
    const log = state.logs[key] || { ex: {}, warm: {}, cardio: {}, after: {} };
    const wk = P.weeks[w - 1];
    let html = `<div class="card"><div class="muted small">Semaine ${w} · ${wk.name}</div><h2>Séance ${s} · ${P.sessions[s].name}</h2><p class="muted" style="margin:0">${wk.goal}</p>
      <div class="dose" style="margin-top:10px"><span class="pill grey">Échauffement 15 min</span><span class="pill grey">Musculation ≈ 40 min</span><span class="pill grey">Vélo ≈ ${Math.round(segs(key).reduce((a, x) => a + x[0], 0))} min</span><span class="pill grey">Retour au calme 8 min</span></div></div>`;

    if (key === '1-A' || key === '5-B') {
      const which = key === '1-A' ? 'de départ' : 'final';
      html += `<div class="card" style="border-color:var(--accent)"><h3>Bilan ${which}</h3><p class="muted" style="margin:4px 0 10px">Aujourd’hui : lever de chaise et gainage après l’échauffement, test vélo au début de la partie cardio. Mesures et FC de repos de préférence le matin.</p><button class="btn light sm" data-go="tests">Ouvrir le bilan ${which}</button></div>`;
    }

    // Échauffement
    const warm = [...P.warmup.common, ...P.warmup[s]];
    html += `<div class="section-title">1 · Échauffement articulaire</div><div class="card">`;
    for (const it of warm) {
      html += `<div class="warm"><button class="check ${log.warm[it.id] ? 'on' : ''}" data-warm="${it.id}">${log.warm[it.id] ? '✓' : ''}</button><div class="txt"><div><b>${esc(it.name)}</b></div><div class="muted small">${esc(it.dose)}</div></div>${it.video ? `<a class="video" href="${it.video}" target="_blank" rel="noopener">▶ Vidéo</a>` : ''}</div>`;
    }
    html += `<div class="warm"><div class="txt muted small">Ou suivre la ${esc(P.warmup.full.name.toLowerCase())}</div><a class="video" href="${P.warmup.full.video}" target="_blank" rel="noopener">▶ Vidéo</a></div></div>`;

    // Musculation
    html += `<div class="section-title">2 · Musculation</div>`;
    for (const id of P.exercisesFor(key)) {
      const ex = P.exercises[id], d = P.dose(id, w), e = log.ex[id] || {};
      const sets = e.sets || [];
      const partner = ex.superset && P.exercisesFor(key).includes(ex.superset) ? P.exercises[ex.superset].name : null;
      html += `<div class="card ex" id="ex-${id}"><div class="head"><h3>${esc(ex.name)}</h3><a class="video" href="${ex.video}" target="_blank" rel="noopener">▶ Vidéo</a></div>
        <div class="muted small">${esc(ex.muscles)}</div>
        <div class="dose"><span class="pill">${d.s} × ${d.r}</span><span class="pill">Effort ${d.rpe}/10</span><span class="pill">Récup ${d.rest} s</span>${d.hold ? '' : '<span class="pill grey">Descente 3 s</span>'}</div>
        ${partner ? `<div class="muted small">⇄ En alternance avec « ${esc(partner)} » : une série de chaque, puis la récupération.</div>` : ''}
        ${ex.caution ? `<div class="caution">⚠︎ ${esc(ex.caution)}</div>` : ''}
        ${advice(id, key) ? `<div class="suggest">${advice(id, key)}</div>` : ''}
        <details><summary>Consignes et alternative</summary><ul>${ex.cues.map((c) => `<li>${esc(c)}</li>`).join('')}<li><i>Si la machine est prise : ${esc(ex.alt)}</i></li></ul><div style="margin-top:6px"><a href="${ex.videoAlt}" target="_blank" rel="noopener" class="small">Autre vidéo de démonstration</a></div></details>
        <table class="sets"><tr><th>Série</th>${ex.load ? '<th>Charge (kg)</th>' : ''}<th>${d.hold ? 'Secondes' : 'Répétitions'}</th><th></th></tr>`;
      for (let i = 0; i < d.s; i++) {
        const st = sets[i] || {};
        html += `<tr><td>${i + 1}</td>${ex.load ? `<td><input type="number" inputmode="decimal" step="0.5" data-set="${id}|${i}|kg" value="${esc(st.kg ?? '')}" placeholder="${esc(sets[i - 1]?.kg ?? lastPerf(id, key)?.sets?.[i]?.kg ?? '')}"></td>` : ''}<td><input type="number" inputmode="numeric" data-set="${id}|${i}|reps" value="${esc(st.reps ?? '')}" placeholder="${d.lo}"></td><td><button class="check ${st.done ? 'on' : ''}" data-done="${id}|${i}">${st.done ? '✓' : ''}</button></td></tr>`;
      }
      html += `</table><div class="muted small" style="margin-top:8px">Effort ressenti sur l’exercice (1 = très facile, 10 = maximal)</div><div class="rpe">${[1,2,3,4,5,6,7,8,9,10].map((n) => `<button data-rpe="${id}|${n}" class="${e.rpe === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>`;
    }

    // Cardio
    const c = P.cardio[key], cl = log.cardio || {};
    html += `<div class="section-title">3 · Vélo · ${esc(c.title)}</div><div class="card">
      <div class="muted small">FC max estimée : <b>${hrMax()} bpm</b> (formule de Tanaka, modifiable dans Infos). Pédale entre 80 et 90 tours/min.</div>
      <ul class="seglist">${c.seg.map((sg, i) => { const [lo, hi] = zoneBpm(sg[1]); return `<li data-seg="${i}"><span class="t">${sg[0] < 1 ? sg[0] * 60 + ' s' : (sg[0] % 1 ? mmss(sg[0] * 60) : sg[0] + ' min')}</span><span><span class="zone" style="background:${zoneColor(sg[1])}"></span>${esc(sg[2])} · ${lo}–${hi} bpm</span></li>`; }).join('')}</ul>
      <div class="bigtimer" id="ridebox" style="background:var(--accent-soft)"><div class="lab">Minuteur vélo</div><div class="hr">Lance-le au début du vélo : il bipe à chaque changement de phase.</div></div>
      <div class="row wrap"><button class="btn sm" data-ride="start">▶ Démarrer</button><button class="btn sm light" data-ride="pause">Pause</button><button class="btn sm ghost" data-ride="reset">Remettre à zéro</button></div>
      <div class="grid2">
        <div><label class="f">Durée totale (min)</label><input type="number" inputmode="numeric" data-cardio="duration" value="${esc(cl.duration ?? '')}"></div>
        <div><label class="f">Distance totale (km)</label><input type="number" inputmode="decimal" step="0.1" data-cardio="distance" value="${esc(cl.distance ?? '')}"></div>
        <div><label class="f">FC moyenne (bpm)</label><input type="number" inputmode="numeric" data-cardio="hrAvg" value="${esc(cl.hrAvg ?? '')}"></div>
        <div><label class="f">FC max atteinte (bpm)</label><input type="number" inputmode="numeric" data-cardio="hrMax" value="${esc(cl.hrMax ?? '')}"></div>
        ${c.test ? `<div><label class="f">Test : distance en 10 min (km)</label><input type="number" inputmode="decimal" step="0.01" data-cardio="testDist" value="${esc(cl.testDist ?? '')}"></div>
        <div><label class="f">Test : FC moyenne</label><input type="number" inputmode="numeric" data-cardio="testHr" value="${esc(cl.testHr ?? '')}"></div>
        <div><label class="f">FC 1 min après le test</label><input type="number" inputmode="numeric" data-cardio="testRec" value="${esc(cl.testRec ?? '')}"></div>
        <div><label class="f">Niveau de résistance</label><input type="number" inputmode="numeric" data-cardio="level" value="${esc(cl.level ?? '')}"></div>` : `<div><label class="f">Niveau de résistance</label><input type="number" inputmode="numeric" data-cardio="level" value="${esc(cl.level ?? '')}"></div>`}
      </div>
      <div class="muted small" style="margin-top:10px">Effort ressenti sur le vélo</div><div class="rpe">${[1,2,3,4,5,6,7,8,9,10].map((n) => `<button data-crpe="${n}" class="${cl.rpe === n ? 'on' : ''}">${n}</button>`).join('')}</div>
    </div>`;

    // Retour au calme
    html += `<div class="section-title">4 · Retour au calme</div><div class="card"><ul class="plain">${P.sessions[s].cooldown.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="muted small">Étirements doux, sans douleur, en respirant lentement.</div></div>`;

    // Bilan de séance
    const a = log.after || {};
    const scale = (field, val) => `<div class="rpe">${[0,1,2,3,4,5,6,7,8,9,10].map((n) => `<button data-after="${field}|${n}" class="${val === n ? 'on' : ''}">${n}</button>`).join('')}</div>`;
    html += `<div class="section-title">5 · Comment ça s’est passé ?</div><div class="card">
      <label class="f">Douleur au dos (0 = aucune)</label>${scale('back', a.back)}
      <label class="f">Douleur à l’épaule (0 = aucune)</label>${scale('shoulder', a.shoulder)}
      <label class="f">Forme / énergie (10 = au top)</label>${scale('energy', a.energy)}
      <label class="f">Notes (machine utilisée, réglages, ressentis…)</label><textarea data-after-notes>${esc(a.notes ?? '')}</textarea>
      <div id="painWarn"></div>
      <label class="f">Date de la séance</label><input type="date" data-date value="${esc(log.date || today())}">
      <div style="margin-top:14px"><button class="btn block" data-finish>${isDone(key) ? 'Mettre à jour la séance' : 'Terminer la séance ✓'}</button></div>
    </div>`;

    view.innerHTML = html;
    painWarn(key);
    if (ride && ride.key === key) { renderRide(); }
    else ride = null;

    // Liaisons
    view.oninput = (ev) => {
      const t = ev.target, L = getLog(key);
      if (t.dataset.set) { const [id, i, f] = t.dataset.set.split('|'); const e = (L.ex[id] = L.ex[id] || { sets: [] }); e.sets = e.sets || []; e.sets[i] = e.sets[i] || {}; e.sets[i][f] = t.value; }
      else if (t.dataset.cardio) L.cardio[t.dataset.cardio] = t.value;
      else if ('afterNotes' in t.dataset) L.after.notes = t.value;
      else if ('date' in t.dataset) L.date = t.value;
      else return;
      save();
    };
    view.onclick = (ev) => {
      const b = ev.target.closest('button'); if (!b) return;
      const L = () => getLog(key);
      if (b.dataset.warm) { const W = L().warm; W[b.dataset.warm] = !W[b.dataset.warm]; b.classList.toggle('on'); b.textContent = W[b.dataset.warm] ? '✓' : ''; save(); }
      else if (b.dataset.done) {
        const [id, i] = b.dataset.done.split('|'); const ex = P.exercises[id], d = P.dose(id, w);
        const e = (L().ex[id] = L().ex[id] || { sets: [] }); e.sets = e.sets || []; const st = (e.sets[i] = e.sets[i] || {});
        st.done = !st.done;
        if (st.done) {
          const row = b.closest('tr');
          if (!st.reps) { st.reps = String(d.lo); row.querySelector('[data-set$="|reps"]').value = st.reps; }
          const kgIn = row.querySelector('[data-set$="|kg"]');
          const kgDefault = e.sets[i - 1]?.kg || (kgIn && kgIn.placeholder);
          if (kgIn && !st.kg && kgDefault) { st.kg = kgDefault; kgIn.value = st.kg; }
          const partner = ex.superset && P.exercisesFor(key).includes(ex.superset);
          const pairFirst = partner && P.exercisesFor(key).indexOf(id) < P.exercisesFor(key).indexOf(ex.superset);
          if (pairFirst) { stopRest(); toast(`Enchaîne : ${P.exercises[ex.superset].name}`); }
          else startRest(d.rest, `Récupération · ${ex.name.split(' (')[0]}`);
        }
        b.classList.toggle('on', !!st.done); b.textContent = st.done ? '✓' : ''; save();
      }
      else if (b.dataset.rpe) { const [id, n] = b.dataset.rpe.split('|'); const e = (L().ex[id] = L().ex[id] || { sets: [] }); e.rpe = +n; b.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); save(); }
      else if (b.dataset.crpe) { L().cardio.rpe = +b.dataset.crpe; b.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); save(); }
      else if (b.dataset.after) { const [f, n] = b.dataset.after.split('|'); L().after[f] = +n; b.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); save(); painWarn(key); }
      else if (b.dataset.ride) {
        const a = b.dataset.ride;
        if (a === 'start') { if (!ride || ride.key !== key) ride = { key, acc: 0, start: Date.now(), running: true, lastIdx: null }; else if (!ride.running) { ride.start = Date.now(); ride.running = true; } keepAwake(true); beep(1); }
        if (a === 'pause' && ride && ride.running) { ride.acc = rideElapsed(); ride.running = false; keepAwake(false); }
        if (a === 'reset') { ride = null; keepAwake(false); $('#ridebox').innerHTML = '<div class="lab">Minuteur vélo</div><div class="hr">Prêt.</div>'; $('#ridebox').style.background = 'var(--accent-soft)'; document.querySelectorAll('.seglist li').forEach((li) => li.classList.remove('now')); return; }
        renderRide();
      }
      else if ('finish' in b.dataset) {
        const Lg = L(); Lg.status = 'done'; Lg.date = Lg.date || today();
        // Le test vélo alimente le bilan s’il n’est pas déjà rempli
        if (P.cardio[key].test) {
          const T = state.tests[key === '1-A' ? 'initial' : 'final'];
          [['bikeDist', 'testDist'], ['bikeHr', 'testHr'], ['bikeRec', 'testRec']].forEach(([t, c]) => { if (!T[t] && Lg.cardio[c]) T[t] = Lg.cardio[c]; });
          if (!T.date) T.date = Lg.date;
        }
        save(); stopRest(); ride = null; keepAwake(false);
        toast('Séance enregistrée 👏'); location.hash = 'home';
      }
    };
  }

  function painWarn(key) {
    const a = state.logs[key]?.after || {}, el = $('#painWarn'); if (!el) return;
    const high = Math.max(a.back ?? 0, a.shoulder ?? 0);
    el.innerHTML = high > 3 ? `<div class="caution" style="margin-top:10px">Douleur supérieure à 3/10 : à la prochaine séance, ne pas augmenter les charges et alléger l’exercice en cause. Si la douleur persiste le lendemain ou s’aggrave, en parler au kiné ou au médecin.</div>` : '';
  }

  // ---------- Écran : historique ----------
  const tonnage = (log) => Object.values(log.ex || {}).reduce((a, e) => a + (e.sets || []).filter((s) => s.done).reduce((b, s) => b + (num(s.kg) || 0) * (num(s.reps) || 0), 0), 0);
  function renderHistory() {
    titleEl.textContent = 'Historique';
    const done = P.order.filter(isDone);
    let html = `<div class="card"><h2>${done.length} séance${done.length > 1 ? 's' : ''} terminée${done.length > 1 ? 's' : ''}</h2><div class="muted small">Touchez une séance pour la revoir ou la corriger.</div></div>`;
    if (done.length > 1) html += `<div class="card chart"><h3>Volume soulevé par séance (kg × répétitions)</h3>${lineSvg([{ name: 'Haut (A)', color: '#0f766e', pts: done.filter((k) => k.endsWith('A')).map((k) => [P.order.indexOf(k), tonnage(state.logs[k])]) }, { name: 'Bas (B)', color: '#d97706', pts: done.filter((k) => k.endsWith('B')).map((k) => [P.order.indexOf(k), tonnage(state.logs[k])]) }])}</div>
      <div class="card chart"><h3>Douleurs et forme (0-10)</h3>${lineSvg([{ name: 'Dos', color: '#dc2626', pts: done.map((k) => [P.order.indexOf(k), state.logs[k].after?.back]).filter((p) => p[1] != null) }, { name: 'Épaule', color: '#7c3aed', pts: done.map((k) => [P.order.indexOf(k), state.logs[k].after?.shoulder]).filter((p) => p[1] != null) }, { name: 'Forme', color: '#059669', pts: done.map((k) => [P.order.indexOf(k), state.logs[k].after?.energy]).filter((p) => p[1] != null) }], 10)}</div>`;
    for (const k of done.slice().reverse()) {
      const L = state.logs[k], a = L.after || {};
      html += `<div class="card sess done" data-go="s/${k}" style="padding:12px 14px"><div class="badge">✓</div><div class="meta"><div><b>${sessLabel(k)}</b> · ${frDate(L.date)}</div><div class="muted small">${fmt(tonnage(L), 0)} kg soulevés · vélo ${fmt(num(L.cardio?.distance))} km${L.cardio?.hrAvg ? ` · FC ${L.cardio.hrAvg}` : ''} · dos ${a.back ?? '–'}/10 · épaule ${a.shoulder ?? '–'}/10</div></div><div class="chev">›</div></div>`;
    }
    if (!done.length) html += `<div class="card muted">Aucune séance terminée pour l’instant.</div>`;
    view.innerHTML = html;
  }

  function niceMax(v) { if (!(v > 0)) return 1; const p = 10 ** Math.floor(Math.log10(v)); return (Math.ceil((v / p) * 2) / 2) * p; }
  // Petit graphique SVG (x = numéro de séance 1-10)
  function lineSvg(series, yMaxFixed) {
    const W = 340, H = 170, l = 34, r = 10, t = 10, b = 26;
    const all = series.flatMap((s) => s.pts.map((p) => p[1]));
    if (!all.length) return '<div class="muted small">Pas encore de données.</div>';
    const yMax = yMaxFixed || niceMax(Math.max(...all) * 1.1);
    const X = (i) => l + (i / 9) * (W - l - r), Y = (v) => H - b - (v / yMax) * (H - t - b);
    let g = '';
    for (let k = 0; k <= 4; k++) { const v = (yMax * k) / 4; g += `<line x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" opacity=".12"/><text x="${l - 4}" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="currentColor" opacity=".6">${Math.round(v)}</text>`; }
    for (let i = 0; i < 10; i++) g += `<text x="${X(i)}" y="${H - 8}" font-size="9" text-anchor="middle" fill="currentColor" opacity=".6">${P.order[i].replace('-', '')}</text>`;
    for (const s of series) {
      if (!s.pts.length) continue;
      g += `<polyline fill="none" stroke="${s.color}" stroke-width="2.5" points="${s.pts.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ')}"/>`;
      g += s.pts.map((p) => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3.5" fill="${s.color}"/>`).join('');
    }
    const legend = series.map((s) => `<span style="margin-right:12px"><span class="zone" style="background:${s.color}"></span>${s.name}</span>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg><div class="small muted">${legend}</div>`;
  }

  // ---------- Écran : bilan ----------
  let testTab = 'initial';
  function renderTests() {
    titleEl.textContent = 'Bilan';
    const T = state.tests[testTab];
    let html = `<div class="card"><h2>Bilan de départ et bilan final</h2><p class="muted" style="margin:4px 0 10px">Mêmes conditions les deux fois : même heure, même vélo, même résistance. Les tests vélo se remplissent aussi depuis les séances 1·A et 5·B.</p>
      <div class="row"><button class="btn sm ${testTab === 'initial' ? '' : 'ghost'}" data-tt="initial">Départ (S1)</button><button class="btn sm ${testTab === 'final' ? '' : 'ghost'}" data-tt="final">Final (S5)</button></div></div><div class="card">`;
    for (const f of P.tests) {
      html += `<label class="f">${esc(f.label)}${f.unit ? ` (${f.unit})` : ''}</label><input type="${f.type === 'date' ? 'date' : 'number'}" ${f.type === 'date' ? '' : 'inputmode="decimal" step="any"'} data-test="${f.id}" value="${esc(T[f.id] ?? '')}">${f.help ? `<div class="muted small" style="margin-top:3px">${esc(f.help)}</div>` : ''}`;
    }
    html += `</div>`;
    html += `<div class="card"><h3>Comparaison</h3>${compareTable()}</div>`;
    html += `<div class="card"><h3>Exporter</h3><p class="muted" style="margin:4px 0 10px">Le bilan PDF contient les tests avant/après, les graphiques de progression des charges, du vélo et des douleurs, et la proposition de suite.</p>
      <button class="btn block" data-export="pdf">Exporter le bilan PDF</button>
      <div class="row" style="margin-top:8px"><button class="btn light sm" data-export="csv">Tableau CSV (Excel)</button><button class="btn light sm" data-export="json">Sauvegarde complète</button></div></div>`;
    view.innerHTML = html;
    view.oninput = (ev) => { const t = ev.target; if (t.dataset.test) { state.tests[testTab][t.dataset.test] = t.value; save(); const c = view.querySelector('.cmp-wrap'); if (c) c.outerHTML = compareTable(); } };
    view.onclick = (ev) => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.tt) { testTab = b.dataset.tt; renderTests(); }
      if (b.dataset.export) exportData(b.dataset.export);
    };
  }
  function compareTable() {
    const I = state.tests.initial, F = state.tests.final;
    let rows = '';
    for (const f of P.tests) {
      if (f.type === 'date') continue;
      const a = num(I[f.id]), b = num(F[f.id]);
      let ev = '–', cls = '';
      if (a != null && b != null) { const d = b - a; ev = `${d > 0 ? '+' : ''}${fmt(d)}${a ? ` (${d > 0 ? '+' : ''}${fmt((d / a) * 100, 0)} %)` : ''}`; if (f.better === 'up') cls = d > 0 ? 'up' : d < 0 ? 'down' : ''; if (f.better === 'down') cls = d < 0 ? 'up' : d > 0 ? 'down' : ''; }
      rows += `<tr><td>${esc(f.label)}</td><td>${fmt(a)}</td><td>${fmt(b)}</td><td class="${cls}">${ev}</td></tr>`;
    }
    return `<div class="cmp-wrap"><table class="cmp"><tr><th></th><th>Départ</th><th>Final</th><th>Évolution</th></tr>${rows}</table></div>`;
  }

  // ---------- Exports ----------
  function deliver(blob, filename, title) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title }).catch(() => {}); return; }
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function csv() {
    const rows = [['Séance', 'Date', 'Exercice', 'Série', 'Charge (kg)', 'Répétitions', 'Effort exercice', 'Vélo durée (min)', 'Vélo distance (km)', 'FC moyenne', 'FC max', 'Effort vélo', 'Douleur dos', 'Douleur épaule', 'Forme']];
    for (const k of P.order) {
      const L = state.logs[k]; if (!L) continue;
      const c = L.cardio || {}, a = L.after || {};
      const tail = [c.duration, c.distance, c.hrAvg, c.hrMax, c.rpe, a.back, a.shoulder, a.energy];
      let any = false;
      for (const [id, e] of Object.entries(L.ex || {})) (e.sets || []).forEach((s, i) => { if (s && s.done) { any = true; rows.push([shortKey(k), L.date || '', P.exercises[id].name, i + 1, s.kg || '', s.reps || '', e.rpe || '', ...tail]); } });
      if (!any) rows.push([shortKey(k), L.date || '', '', '', '', '', '', ...tail]);
    }
    rows.push([]); rows.push(['Test', 'Départ', 'Final']);
    for (const f of P.tests) rows.push([f.label + (f.unit ? ` (${f.unit})` : ''), state.tests.initial[f.id] || '', state.tests.final[f.id] || '']);
    return '﻿' + rows.map((r) => r.map((v) => { v = String(v ?? '').replace('.', ','); return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }).join(';')).join('\n');
  }
  function exportData(kind) {
    const stamp = today();
    if (kind === 'csv') return deliver(new Blob([csv()], { type: 'text/csv' }), `STL-Comeback-${stamp}.csv`, 'STL Come-back – données');
    if (kind === 'json') return deliver(new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' }), `STL-Comeback-sauvegarde-${stamp}.json`, 'STL Come-back – sauvegarde');
    if (kind === 'pdf') {
      if (!window.jspdf) return toast('Connexion nécessaire une première fois pour le PDF');
      try { deliver(buildReport(state, { hrMax: hrMax(), tonnage }), `STL-Comeback-bilan-${stamp}.pdf`, 'STL Come-back – bilan'); }
      catch (e) { console.error(e); toast('Erreur pendant la création du PDF'); }
    }
  }

  // ---------- Écran : infos & réglages ----------
  function renderInfos() {
    titleEl.textContent = 'Infos';
    const S = state.settings, m = hrMax();
    let html = `<div class="card"><h2>Réglages</h2>
      <label class="f">Prénom (affiché dans l’app et le bilan)</label><input type="text" data-setting="name" value="${esc(S.name)}" placeholder="Prénom">
      <div class="grid2"><div><label class="f">Âge</label><input type="number" inputmode="numeric" data-setting="age" value="${esc(S.age)}"></div>
      <div><label class="f">FC max mesurée (facultatif)</label><input type="number" inputmode="numeric" data-setting="hrMax" value="${esc(S.hrMax)}" placeholder="${Math.round(208 - 0.7 * (num(S.age) || 52))}"></div></div>
      <div class="muted small" style="margin-top:6px">Sans valeur mesurée, la FC max est estimée par la formule de Tanaka : 208 − 0,7 × âge.</div></div>`;
    html += `<div class="card"><h2>Zones de fréquence cardiaque</h2><div class="muted small">FC max utilisée : <b id="hrm">${m}</b> bpm</div><table class="cmp" style="margin-top:6px">${P.zones.filter((z) => z.z !== 'T').map((z) => { const [lo, hi] = zoneBpm(z.z); return `<tr><td><span class="zone" style="background:${zoneColor(z.z)}"></span>${z.name}</td><td>${lo}–${hi}</td><td class="small muted" style="text-align:left">${z.talk}</td></tr>`; }).join('')}</table><div class="muted small" style="margin-top:6px">Si la FC du vélo semble incohérente, se fier à la sensation (« test de la parole »).</div></div>`;
    html += `<div class="card"><h2>Sécurité</h2><ul class="plain">${P.safety.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    html += `<div class="card"><h2>Pourquoi cette organisation ?</h2><ul class="plain">
      <li><b>Musculation puis vélo</b> : faire la musculation en premier donne de meilleurs gains de force des jambes (méta-analyse Eddens 2018).</li>
      <li><b>Progression en 5 semaines</b> : 2 semaines faciles pour réhabituer tendons et dos, 2 semaines de développement, 1 semaine plus légère avec les tests.</li>
      <li><b>Effort 1-10 plutôt qu’un % de max</b> : pas de test de charge maximale, à éviter avec une épaule opérée et une lombalgie récente.</li>
      <li><b>Gainage anti-mouvement</b> (dead bug, bird dog, Pallof, planche) plutôt que crunchs : renforce les abdos en protégeant le bas du dos.</li>
      <li><b>Épaule</b> : tirages et rotations externes renforcent la coiffe ; aucune poussée au-dessus de la tête dans ce cycle.</li></ul></div>`;
    for (const n of P.next) html += `<div class="card"><h2>Et après ? ${esc(n.title)}</h2><ul class="plain">${n.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    html += `<div class="card"><h2>Sources</h2><ul class="plain">${P.sources.map((s) => `<li><a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ul><div class="muted small">Vidéos : chaînes de kinésithérapeutes et de coachs, vérifiées le 29/10/2026. Ce programme ne remplace pas un avis médical.</div></div>`;
    html += `<div class="card"><h2>Données</h2><p class="muted small" style="margin:0 0 10px">Les données restent sur ce téléphone. Fais une sauvegarde de temps en temps.</p>
      <div class="row wrap"><button class="btn light sm" data-x="json">Sauvegarder</button><label class="btn light sm" style="margin:0">Restaurer<input type="file" accept="application/json,.json" data-restore hidden></label><button class="btn ghost sm" data-x="reset" style="color:var(--danger)">Tout effacer</button></div></div>`;
    view.innerHTML = html;
    view.oninput = (ev) => { const t = ev.target; if (t.dataset.setting) { state.settings[t.dataset.setting] = t.value; save(); const h = $('#hrm'); if (h) h.textContent = hrMax(); } };
    view.onclick = (ev) => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.x === 'json') exportData('json');
      if (b.dataset.x === 'reset' && confirm('Effacer toutes les séances et tous les tests ? (fais une sauvegarde avant)')) { state = blank(); save(); renderInfos(); toast('Données effacées'); }
    };
    view.onchange = (ev) => {
      const t = ev.target; if (!('restore' in t.dataset) || !t.files[0]) return;
      t.files[0].text().then((txt) => { const d = JSON.parse(txt); if (!d.logs || !d.tests) throw new Error(); state = d; save(); toast('Sauvegarde restaurée'); renderInfos(); }).catch(() => toast('Fichier non reconnu'));
    };
  }

  // Liens internes (data-go)
  document.addEventListener('click', (ev) => { const g = ev.target.closest('[data-go]'); if (g && !ev.target.closest('button:not([data-go])')) location.hash = g.dataset.go; });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  route();
})();
