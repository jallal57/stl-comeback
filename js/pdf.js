// STL Come-back : bilan PDF avec graphiques (jsPDF, dessin vectoriel)
function buildReport(state, h) {
  const P = PROGRAM;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 14;
  const TEAL = [15, 118, 110], AMBER = [217, 119, 6], RED = [220, 38, 38], VIOLET = [124, 58, 237], GREEN = [5, 150, 105], GREY = [110, 110, 105], LIGHT = [228, 228, 222];

  // Les polices standard du PDF ne couvrent que le Latin-1
  const clean = (s) => String(s ?? '')
    .replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/≈/g, '~').replace(/→/g, '->')
    .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/…/g, '...').replace(/ | /g, ' ').replace(/[^\x00-\xff]/g, '');
  const num = (v) => (v === '' || v == null || isNaN(+v) ? null : +v);
  const fmt = (n, d = 1) => (n == null ? '-' : clean((+n).toLocaleString('fr-FR', { maximumFractionDigits: d })));
  const frDate = (d) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-');
  const T = (txt, x, y, o = {}) => doc.text(clean(txt), x, y, o);
  const font = (size, style = 'normal', color = [28, 28, 26]) => { doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color); };

  const done = P.order.filter((k) => state.logs[k]?.status === 'done');
  const dates = done.map((k) => state.logs[k].date).filter(Boolean).sort();
  const name = state.settings.name || '';
  let pageNo = 1;

  function header(title) {
    doc.setFillColor(...TEAL); doc.rect(0, 0, W, 26, 'F');
    font(18, 'bold', [255, 255, 255]); T('STL Come-back', M, 12);
    font(10, 'normal', [209, 250, 229]); T(`${title}${name ? ' - ' + name : ''}`, M, 19);
    font(8, 'normal', [209, 250, 229]); T(`Page ${pageNo}`, W - M, 19, { align: 'right' });
  }
  function sectionTitle(txt, y) { font(12, 'bold', TEAL); T(txt, M, y); doc.setDrawColor(...LIGHT); doc.setLineWidth(0.3); doc.line(M, y + 1.8, W - M, y + 1.8); return y + 8; }
  function newPage(title) { doc.addPage(); pageNo++; header(title); return 36; }

  const niceMax = (v) => { if (!(v > 0)) return 1; const p = 10 ** Math.floor(Math.log10(v)); return (Math.ceil((v / p) * 2) / 2) * p; };
  // Graphique en lignes. x = index de séance (0-9) ou index libre ; labels = étiquettes d'abscisse
  function lineChart(x, y, w, hgt, title, series, { labels = P.order.map((k) => 'S' + k.replace('-', '')), yMax, unit = '' } = {}) {
    font(9, 'bold'); T(title, x, y);
    const top = y + 3, l = x + 9, r = x + w - 2, b = top + hgt - 7;
    const vals = series.flatMap((s) => s.pts.map((p) => p[1])).filter((v) => v != null);
    if (!vals.length) { font(8, 'italic', GREY); T('Pas de données', x, top + 8); return; }
    const vmin = 0, vmax = yMax || niceMax(Math.max(...vals) * 1.1);
    const n = labels.length;
    const X = (i) => l + (n === 1 ? 0.5 : i / (n - 1)) * (r - l), Y = (v) => b - ((v - vmin) / (vmax - vmin)) * (b - top - 2);
    doc.setLineWidth(0.15); doc.setDrawColor(...LIGHT);
    font(6, 'normal', GREY);
    for (let k = 0; k <= 3; k++) { const v = vmin + ((vmax - vmin) * k) / 3; doc.line(l, Y(v), r, Y(v)); T(fmt(v, vmax < 10 ? 1 : 0), l - 1.5, Y(v) + 1, { align: 'right' }); }
    labels.forEach((lb, i) => { if (n <= 10 || i % 2 === 0) T(lb, X(i), b + 4, { align: 'center' }); });
    for (const s of series) {
      const pts = s.pts.filter((p) => p[1] != null);
      if (!pts.length) continue;
      doc.setDrawColor(...s.color); doc.setFillColor(...s.color); doc.setLineWidth(0.6);
      for (let i = 1; i < pts.length; i++) doc.line(X(pts[i - 1][0]), Y(pts[i - 1][1]), X(pts[i][0]), Y(pts[i][1]));
      pts.forEach((p) => doc.circle(X(p[0]), Y(p[1]), 0.8, 'F'));
    }
    if (series.length > 1) {
      let lx = x + 2; font(7, 'normal', GREY);
      for (const s of series) { doc.setFillColor(...s.color); doc.rect(lx, b + 6.3, 2.5, 2.5, 'F'); T(s.name, lx + 3.5, b + 8.4); lx += doc.getTextWidth(clean(s.name)) + 9; }
    }
    if (unit) { font(6, 'normal', GREY); T(unit, x, top + 1); }
  }

  // Barres avant / après
  function pairBars(x, y, w, hgt, f) {
    const a = num(state.tests.initial[f.id]), c = num(state.tests.final[f.id]);
    font(8, 'bold'); doc.text(doc.splitTextToSize(clean(f.label), w), x, y);
    const top = y + 7, b = top + hgt - 14, max = Math.max(a || 0, c || 0) * 1.2 || 1, bw = w / 4;
    const bar = (v, i, col) => {
      const bx = x + bw * 0.6 + i * bw * 1.5;
      if (v == null) { font(7, 'italic', GREY); T('-', bx + bw / 2, b - 1, { align: 'center' }); return; }
      const hh = (v / max) * (b - top); doc.setFillColor(...col); doc.rect(bx, b - hh, bw, hh, 'F');
      font(7.5, 'bold'); T(fmt(v), bx + bw / 2, b - hh - 1, { align: 'center' });
    };
    doc.setDrawColor(...LIGHT); doc.setLineWidth(0.2); doc.line(x, b, x + w, b);
    bar(a, 0, [148, 163, 184]); bar(c, 1, TEAL);
    font(6.5, 'normal', GREY); T('Départ', x + bw * 1.1, b + 3.5, { align: 'center' }); T('Final', x + bw * 2.6, b + 3.5, { align: 'center' });
    if (a != null && c != null && a !== 0) {
      const d = ((c - a) / a) * 100, good = f.better === 'up' ? d > 0 : f.better === 'down' ? d < 0 : null;
      font(8, 'bold', good == null ? GREY : good ? GREEN : RED); T(`${d > 0 ? '+' : ''}${fmt(d, 0)} %`, x + w / 2, b + 8, { align: 'center' });
    }
    font(6.5, 'normal', GREY); T(f.unit || '', x + w - 1, top - 1, { align: 'right' });
  }

  // ---------- Page 1 : synthèse et tests ----------
  header('Bilan du cycle 1 - Réathlétisation');
  let y = 36;
  font(10, 'normal');
  T(`Période : ${dates.length ? frDate(dates[0]) + ' au ' + frDate(dates[dates.length - 1]) : '-'}`, M, y);
  T(`Assiduité : ${done.length} / 10 séances`, M, y + 5.5);
  T(`FC max utilisée : ${h.hrMax} bpm`, M, y + 11);
  const totalKg = done.reduce((a, k) => a + h.tonnage(state.logs[k]), 0);
  const totalKm = done.reduce((a, k) => a + (num(state.logs[k].cardio?.distance) || 0), 0);
  T(`Volume total soulevé : ${fmt(totalKg, 0)} kg  -  Distance totale à vélo : ${fmt(totalKm)} km`, M, y + 16.5);
  font(8, 'normal', GREY); T(`Document créé le ${frDate(new Date().toISOString().slice(0, 10))}`, W - M, y, { align: 'right' });
  y += 26;

  y = sectionTitle('Tests de départ et tests finaux', y);
  const rowsT = P.tests.filter((f) => f.type !== 'date');
  font(8, 'bold', GREY); T('Mesure', M, y); T('Départ', 128, y, { align: 'right' }); T('Final', 152, y, { align: 'right' }); T('Évolution', W - M, y, { align: 'right' });
  y += 2;
  for (const f of rowsT) {
    const a = num(state.tests.initial[f.id]), c = num(state.tests.final[f.id]);
    y += 5.2; doc.setDrawColor(...LIGHT); doc.setLineWidth(0.15); doc.line(M, y - 3.7, W - M, y - 3.7);
    font(8.5, 'normal'); T(`${f.label}${f.unit ? ' (' + f.unit + ')' : ''}`, M, y); T(fmt(a), 128, y, { align: 'right' }); T(fmt(c), 152, y, { align: 'right' });
    if (a != null && c != null) {
      const d = c - a, good = f.better === 'up' ? d > 0 : f.better === 'down' ? d < 0 : null;
      font(8.5, 'bold', good == null || d === 0 ? GREY : good ? GREEN : RED);
      T(`${d > 0 ? '+' : ''}${fmt(d)}${a ? ` (${d > 0 ? '+' : ''}${fmt((d / a) * 100, 0)} %)` : ''}`, W - M, y, { align: 'right' });
    }
  }
  font(7, 'normal', GREY); T(`Dates des tests : départ ${frDate(state.tests.initial.date)}, final ${frDate(state.tests.final.date)}. Vert = progrès, rouge = recul.`, M, y + 6);
  y += 14;

  y = sectionTitle('Condition physique : avant / après', y);
  const keyTests = ['chair', 'plank', 'bikeDist', 'bikeRec'].map((id) => P.tests.find((t) => t.id === id));
  const cw = (W - 2 * M - 9) / 4;
  keyTests.forEach((f, i) => pairBars(M + i * (cw + 3), y, cw, 46, f));
  y += 52;
  y = sectionTitle('Mensurations : avant / après', y);
  const meas = ['weight', 'waist', 'hips', 'thigh', 'arm'].map((id) => P.tests.find((t) => t.id === id));
  const mw = (W - 2 * M - 12) / 5;
  meas.forEach((f, i) => pairBars(M + i * (mw + 3), y, mw, 44, f));

  // ---------- Page 2 : progression des charges ----------
  y = newPage('Progression des charges');
  font(9, 'normal', GREY);
  T('Charge maximale utilisée à chaque séance (kg). Une courbe qui monte = progression de la force.', M, y - 2);
  y += 4;
  const loadEx = Object.keys(P.exercises).filter((id) => P.exercises[id].load && P.exercises[id].cat !== 'coreRep');
  const withData = loadEx.filter((id) => done.some((k) => state.logs[k].ex?.[id]?.sets?.some((s) => s && s.done && num(s.kg))));
  if (!withData.length) { font(10, 'italic', GREY); T('Aucune charge enregistrée pour le moment.', M, y + 6); }
  const gw = (W - 2 * M - 8) / 3, gh = 40;
  withData.forEach((id, i) => {
    const ex = P.exercises[id], sess = ex.cat && P.sessions.A.list.includes(id) ? 'A' : 'B';
    const keys = P.order.filter((k) => k.endsWith(sess));
    const pts = keys.map((k, j) => { const sets = state.logs[k]?.status === 'done' ? (state.logs[k].ex?.[id]?.sets || []).filter((s) => s && s.done && num(s.kg)) : []; return [j, sets.length ? Math.max(...sets.map((s) => +s.kg)) : null]; });
    const cx = M + (i % 3) * (gw + 4), cy = y + Math.floor(i / 3) * (gh + 6);
    lineChart(cx, cy, gw, gh, ex.name.replace(/\s*\(.*\)/, ''), [{ name: 'kg', color: sess === 'A' ? TEAL : AMBER, pts }], { labels: keys.map((k) => 'S' + k.split('-')[0]), unit: 'kg' });
  });

  // ---------- Page 3 : vélo, ressentis, suite ----------
  y = newPage('Endurance, ressentis et suite');
  const idx = (k) => P.order.indexOf(k);
  lineChart(M, y, (W - 2 * M) / 2 - 3, 52, 'Vélo : distance par séance (km)', [{ name: 'km', color: TEAL, pts: done.map((k) => [idx(k), num(state.logs[k].cardio?.distance)]) }], { unit: 'km' });
  lineChart(W / 2 + 3, y, (W - 2 * M) / 2 - 3, 52, 'Vélo : fréquence cardiaque (bpm)', [
    { name: 'FC moyenne', color: RED, pts: done.map((k) => [idx(k), num(state.logs[k].cardio?.hrAvg)]) },
    { name: 'FC max', color: VIOLET, pts: done.map((k) => [idx(k), num(state.logs[k].cardio?.hrMax)]) }]);
  y += 64;
  lineChart(M, y, (W - 2 * M) / 2 - 3, 52, 'Volume soulevé par séance (kg x rep.)', [
    { name: 'Haut (A)', color: TEAL, pts: done.filter((k) => k.endsWith('A')).map((k) => [idx(k), h.tonnage(state.logs[k])]) },
    { name: 'Bas (B)', color: AMBER, pts: done.filter((k) => k.endsWith('B')).map((k) => [idx(k), h.tonnage(state.logs[k])]) }]);
  lineChart(W / 2 + 3, y, (W - 2 * M) / 2 - 3, 52, 'Douleurs et forme après la séance (0-10)', [
    { name: 'Dos', color: RED, pts: done.map((k) => [idx(k), num(state.logs[k].after?.back)]) },
    { name: 'Épaule', color: VIOLET, pts: done.map((k) => [idx(k), num(state.logs[k].after?.shoulder)]) },
    { name: 'Forme', color: GREEN, pts: done.map((k) => [idx(k), num(state.logs[k].after?.energy)]) }], { yMax: 10 });
  y += 66;

  const notes = done.filter((k) => state.logs[k].after?.notes).map((k) => `S${k.replace('-', '')} : ${state.logs[k].after.notes}`);
  if (notes.length) {
    y = sectionTitle('Notes des séances', y);
    font(8.5, 'normal');
    for (const n of notes) { const lines = doc.splitTextToSize(clean(n), W - 2 * M); if (y + lines.length * 4 > 280) y = newPage('Endurance, ressentis et suite'); doc.text(lines, M, y); y += lines.length * 4 + 1.5; }
    y += 4;
  }

  for (const n of P.next) {
    if (y > 230) y = newPage('Proposition de suite');
    y = sectionTitle(`Proposition : ${n.title}`, y);
    font(8.5, 'normal');
    for (const p of n.points) { const lines = doc.splitTextToSize('- ' + clean(p), W - 2 * M - 3); if (y + lines.length * 4 > 285) y = newPage('Proposition de suite'); doc.text(lines, M + 1, y); y += lines.length * 4 + 1.2; }
    y += 4;
  }
  font(7, 'italic', GREY);
  T('Ce bilan accompagne un programme de reprise ; il ne remplace pas un avis médical. À montrer au kinésithérapeute.', M, 290);

  return doc.output('blob');
}
