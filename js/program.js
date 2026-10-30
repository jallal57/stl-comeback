// STL Come-back : contenu du programme (cycle 1, 5 semaines, 2 séances / semaine)
// Toutes les vidéos ont été vérifiées (existence + titre) via l'API oEmbed de YouTube le 29/10/2026.

const yt = (id) => `https://www.youtube.com/watch?v=${id}`;

const PROGRAM = {
  title: 'STL Come-back',
  cycle: 'Cycle 1 · Réathlétisation',

  weeks: [
    { n: 1, name: 'Reprise', goal: "Réapprendre les gestes, trouver les bonnes charges, réveiller le cœur. Effort volontairement facile (5/10). Bilan de départ à la séance A." },
    { n: 2, name: 'Ancrage', goal: "Ajouter une série. Toujours facile à modéré (6/10). On allonge le vélo en endurance." },
    { n: 3, name: 'Développement', goal: "Charges en hausse, 10 à 12 répétitions (7/10). Premiers intervalles doux sur le vélo." },
    { n: 4, name: 'Intensification', goal: "Semaine la plus dure du cycle (7-8/10). Intervalles plus nombreux, gainage plus long." },
    { n: 5, name: 'Consolidation & bilan', goal: "Volume réduit pour récupérer, puis bilan final à la séance B. Export du bilan PDF." },
  ],

  // Séries / répétitions / effort (RPE 1-10) / récupération (s), par catégorie et par semaine
  doses: {
    poly:    [ {s:2,r:'15',   lo:15,hi:15,rpe:5,  rest:60}, {s:3,r:'12-15',lo:12,hi:15,rpe:6,rest:60}, {s:3,r:'10-12',lo:10,hi:12,rpe:7,rest:75}, {s:3,r:'10-12',lo:10,hi:12,rpe:'7-8',rest:75}, {s:2,r:'10-12',lo:10,hi:12,rpe:7,rest:75} ],
    iso:     [ {s:2,r:'15',   lo:15,hi:15,rpe:5,  rest:45}, {s:2,r:'15',   lo:15,hi:15,rpe:6,rest:45}, {s:3,r:'12',   lo:12,hi:12,rpe:7,rest:60}, {s:3,r:'12',   lo:12,hi:12,rpe:'7-8',rest:60}, {s:2,r:'12',   lo:12,hi:12,rpe:7,rest:60} ],
    coiffe:  [ {s:2,r:'15',   lo:15,hi:15,rpe:4,  rest:45}, {s:2,r:'15-20',lo:15,hi:20,rpe:5,rest:45}, {s:3,r:'15',   lo:15,hi:15,rpe:5,rest:45}, {s:3,r:'15',   lo:15,hi:15,rpe:5,rest:45}, {s:2,r:'15',   lo:15,hi:15,rpe:5,rest:45} ],
    coreRep: [ {s:2,r:'6 / côté',lo:6,hi:6,rpe:5,rest:45}, {s:3,r:'8 / côté',lo:8,hi:8,rpe:6,rest:45}, {s:3,r:'10 / côté',lo:10,hi:10,rpe:6,rest:45}, {s:3,r:'12 / côté',lo:12,hi:12,rpe:7,rest:45}, {s:2,r:'10 / côté',lo:10,hi:10,rpe:6,rest:45} ],
    coreHold:[ {s:2,r:'20 s',lo:20,hi:20,rpe:5,rest:45,hold:true}, {s:3,r:'25 s',lo:25,hi:25,rpe:6,rest:45,hold:true}, {s:3,r:'30 s',lo:30,hi:30,rpe:6,rest:45,hold:true}, {s:3,r:'40 s',lo:40,hi:40,rpe:7,rest:45,hold:true}, {s:2,r:'40 s',lo:40,hi:40,rpe:6,rest:45,hold:true} ],
  },

  exercises: {
    // ---------- Séance A : haut du corps + abdos ----------
    tirage: {
      name: 'Tirage vertical prise neutre (poulie haute)', cat: 'poly', load: true, muscles: 'Dos (grand dorsal), arrière d’épaule, biceps',
      video: yt('XQw-novvrQw'), videoAlt: yt('qgkKyENeK7o'),
      cues: ['Poignée prise neutre (paumes face à face), cuisses bloquées sous les boudins', 'Tirer vers le haut de la poitrine en abaissant d’abord les omoplates', 'Remonter lentement (3 s), bras presque tendus sans hausser les épaules'],
      caution: 'Épaule opérée : jamais derrière la nuque. Amplitude haute sans douleur ; si l’épaule tire en haut, ne pas tendre complètement les bras.',
      alt: 'Machine de tirage guidée, ou tirage à l’élastique à genoux.',
    },
    chest: {
      name: 'Chest press machine (développé assis)', cat: 'poly', load: true, muscles: 'Pectoraux, avant d’épaule, triceps',
      video: yt('r8CG2MjEwmc'), videoAlt: yt('B-cCh7H0CPY'),
      cues: ['Régler le siège : poignées à hauteur du milieu de la poitrine', 'Omoplates serrées contre le dossier, pieds bien posés', 'Pousser en soufflant, revenir en 3 s'],
      caution: 'Épaule opérée : au retour, les coudes ne dépassent pas la ligne du buste. Préférer les poignées neutres si la machine en a.',
      alt: 'Pompes inclinées mains sur un banc haut (amplitude réduite).',
    },
    rowing: {
      name: 'Rowing assis poulie basse (prise neutre)', cat: 'poly', load: true, muscles: 'Milieu du dos, trapèzes moyens, rhomboïdes',
      video: yt('w2Q7LbkhtLI'), videoAlt: yt('EL147ZCxp9s'),
      cues: ['Buste droit, légèrement penché en avant au départ, genoux un peu fléchis', 'Tirer la poignée vers le nombril en serrant les omoplates', 'Ne pas basculer le buste en arrière pour tirer'],
      caution: 'Dos : garder le bas du dos neutre, ne pas s’enrouler vers l’avant en fin de retour.',
      alt: 'Rowing machine assise avec appui poitrine (encore mieux pour le dos).',
    },
    facepull: {
      name: 'Face pull à la poulie (corde)', cat: 'coiffe', load: true, superset: 'rotext', muscles: 'Arrière d’épaule, coiffe des rotateurs (rotateurs externes), trapèzes moyens',
      video: yt('4FAiPDzKRUw'), videoAlt: yt('Vg76pYcCcdI'),
      cues: ['Poulie réglée à hauteur du visage, corde prise pouces vers l’arrière', 'Tirer vers le front en écartant les mains, coudes à hauteur des épaules au maximum', 'Charge légère, mouvement lent et contrôlé'],
      caution: 'Épaule opérée : charge légère uniquement, aucune douleur tolérée. Coudes pas plus hauts que les épaules.',
      alt: 'Tirage horizontal à l’élastique vers le visage.',
    },
    rotext: {
      name: 'Rotation externe d’épaule (poulie ou élastique)', cat: 'coiffe', load: true, superset: 'facepull', muscles: 'Coiffe des rotateurs (sous-épineux, petit rond)',
      video: yt('xE5782I38WU'), videoAlt: yt('sfFt1qzam3c'),
      cues: ['Debout de profil, coude plié à 90°, petite serviette roulée entre le coude et le corps', 'Ouvrir l’avant-bras vers l’extérieur en gardant le coude collé', 'Revenir lentement ; les deux bras'],
      caution: 'Exercice de protection de l’épaule : toujours très léger (élastique ou 1 à 2,5 kg à la poulie). Effort 4-5/10.',
      alt: 'Rotation externe couchée sur le côté avec un haltère de 1 kg.',
    },
    curl: {
      name: 'Curl marteau aux haltères', cat: 'iso', load: true, superset: 'triceps', muscles: 'Biceps, brachial, avant-bras',
      video: yt('Pq_DEJr4pNs'), videoAlt: yt('9fSck6P-PXk'),
      cues: ['Debout ou assise, paumes face à face', 'Coudes collés au corps, monter sans balancer le buste', 'Descendre en 3 s jusqu’à bras presque tendus'],
      caution: 'Biceps opéré : semaines 1-2 avec des haltères très légers. Arrêter si douleur à l’avant de l’épaule ou au pli du coude.',
      alt: 'Curl à la poulie basse avec corde.',
    },
    triceps: {
      name: 'Extension triceps poulie haute (corde)', cat: 'iso', load: true, superset: 'curl', muscles: 'Triceps',
      video: yt('ADRve8qqC1U'), videoAlt: yt('5Yv-2CCMqxM'),
      cues: ['Coudes fixes près du corps, buste légèrement penché', 'Tendre les bras en écartant la corde en bas', 'Remonter lentement sans que les coudes avancent'],
      caution: '',
      alt: 'Extension à la poulie avec barre droite.',
    },
    deadbug: {
      name: 'Dead bug', cat: 'coreRep', load: false, muscles: 'Abdominaux profonds (transverse), stabilité du bassin',
      video: yt('zJMNbNYYrsY'), videoAlt: yt('gZtAwS79jJw'),
      cues: ['Sur le dos, bas du dos plaqué au sol, bras vers le plafond, genoux à 90°', 'Tendre bras et jambe opposés en soufflant, sans que le dos se décolle', 'Revenir et changer de côté'],
      caution: 'Dos : réduire l’amplitude si le bas du dos se cambre.',
      alt: 'Version jambes seules (bras posés au sol).',
    },
    pallof: {
      name: 'Pallof press (anti-rotation à la poulie)', cat: 'coreRep', load: true, muscles: 'Obliques, gainage anti-rotation',
      video: yt('dBAmQ9bx3JA'), videoAlt: yt('LA6Uc5yIV1c'),
      cues: ['De profil par rapport à la poulie (hauteur poitrine), pieds largeur de hanches', 'Pousser la poignée droit devant, tenir 2 s sans laisser le buste tourner', 'Revenir à la poitrine ; faire les deux côtés'],
      caution: 'Excellent pour le dos : le tronc résiste à la rotation au lieu de la produire.',
      alt: 'Même exercice avec un élastique accroché à un poteau.',
    },

    // ---------- Séance B : bas du corps + abdos ----------
    presse: {
      name: 'Presse à cuisses', cat: 'poly', load: true, muscles: 'Quadriceps, fessiers, ischio-jambiers',
      video: yt('WkOQLZ45v54'), videoAlt: yt('rAyf09C6rkQ'),
      cues: ['Dos et fesses collés au dossier, pieds à largeur de hanches au milieu du plateau', 'Descendre lentement, genoux dans l’axe des pieds', 'Pousser sans verrouiller les genoux en haut'],
      caution: 'Dos (lombalgie récente) : descendre seulement tant que le bassin reste collé au siège. Si le bas du dos décolle, réduire l’amplitude.',
      alt: 'Hack squat machine ou squat guidé (charge légère).',
    },
    goblet: {
      name: 'Squat gobelet sur banc (haltère)', cat: 'poly', load: true, muscles: 'Quadriceps, fessiers, gainage',
      video: yt('QNPVhVsJS2A'), videoAlt: yt('D1IEI-lfLxU'),
      cues: ['Haltère tenu contre la poitrine, dos au banc, pieds un peu plus larges que les hanches', 'Reculer les fesses et descendre jusqu’à effleurer le banc', 'Remonter en poussant dans les talons, buste fier'],
      caution: 'Dos : ne pas descendre plus bas que le banc ; dos neutre. Les bras restent près du corps (épaule).',
      alt: 'Squat au poids du corps sur banc.',
    },
    pont: {
      name: 'Pont fessier au sol', cat: 'iso', load: true, weeks: [1, 2], muscles: 'Fessiers, ischio-jambiers',
      video: yt('m7qQiAUcWaE'), videoAlt: yt('grOBXdy2m3Y'),
      cues: ['Sur le dos, pieds à plat près des fesses', 'Serrer les fessiers et monter le bassin jusqu’à l’alignement épaules-hanches-genoux', 'Tenir 2 s en haut, redescendre lentement'],
      caution: 'Dos : ne pas cambrer en haut ; le mouvement vient des fesses, pas du bas du dos. Haltère posé sur les hanches quand ça devient facile.',
      alt: 'Machine à fessiers (glute) si disponible.',
    },
    hipthrust: {
      name: 'Hip thrust sur banc (haltère)', cat: 'poly', load: true, weeks: [3, 4, 5], muscles: 'Fessiers, ischio-jambiers',
      video: yt('MQ_pHfRk8xI'), videoAlt: yt('34xR5kn02xY'),
      cues: ['Haut du dos sur le banc, haltère posé sur les hanches (avec une serviette)', 'Monter les hanches en serrant les fessiers, menton rentré', 'Redescendre contrôlé sans poser les fesses'],
      caution: 'Dos : en haut, bassin légèrement basculé vers l’arrière, sans hyper-cambrer.',
      alt: 'Machine hip thrust / glute bridge machine.',
    },
    legcurl: {
      name: 'Leg curl assis (machine)', cat: 'iso', load: true, superset: 'abduct', muscles: 'Ischio-jambiers',
      video: yt('CjwlGF7pAgo'), videoAlt: yt('xIma8xzjeBM'),
      cues: ['Genou aligné avec l’axe de la machine, boudin juste au-dessus des talons', 'Fléchir les genoux en contrôlant, dos contre le dossier', 'Remonter lentement (3 s)'],
      caution: '',
      alt: 'Leg curl allongé.',
    },
    legext: {
      name: 'Leg extension (machine)', cat: 'iso', load: true, weeks: [1, 2], muscles: 'Quadriceps',
      video: yt('axCZk-__AdM'), videoAlt: yt('Z6msAYaaxnE'),
      cues: ['Genou aligné avec l’axe de la machine, boudin au-dessus des chevilles', 'Tendre les jambes, serrer 1 s en haut', 'Redescendre en 3 s'],
      caution: 'En cas de gêne au genou, réduire l’amplitude (ne pas descendre jusqu’en bas).',
      alt: 'Presse à cuisses une jambe, charge légère.',
    },
    abduct: {
      name: 'Abducteurs assis (machine)', cat: 'iso', load: true, superset: 'legcurl', muscles: 'Moyen fessier (galbe et stabilité de la hanche)',
      video: yt('H8y4t2Qdb_E'), videoAlt: yt('TDMroDFThJo'),
      cues: ['Dos contre le dossier, genoux contre les coussinets', 'Écarter les cuisses, tenir 1 s', 'Revenir lentement sans que les plaques se touchent'],
      caution: '',
      alt: 'Élastique au-dessus des genoux, écartements en position de pont.',
    },
    stepup: {
      name: 'Montée sur banc (step-up)', cat: 'iso', load: true, weeks: [3, 4, 5], muscles: 'Fessiers, quadriceps, équilibre',
      video: yt('sSOz4NMosWA'), videoAlt: yt('8vefcSuGUvw'),
      cues: ['Banc ou step bas (hauteur sous le genou)', 'Monter en poussant dans le talon de la jambe posée sur le banc', 'Redescendre lentement ; faire toutes les répétitions d’une jambe puis l’autre'],
      caution: 'Commencer au poids du corps, puis haltères légers tenus bras le long du corps.',
      alt: 'Fente arrière avec appui à une barre.',
    },
    birddog: {
      name: 'Bird dog', cat: 'coreRep', load: false, muscles: 'Stabilité du tronc et du bassin, fessiers',
      video: yt('ZCrnGuPQmUM'), videoAlt: yt('BKRlCzV9yto'),
      cues: ['À quatre pattes, mains sous les épaules, genoux sous les hanches', 'Tendre bras et jambe opposés sans faire bouger le bassin', 'Tenir 2 s, revenir, changer de côté'],
      caution: 'Épaule : si l’appui sur la main opérée gêne, ne tendre que la jambe.',
      alt: 'Jambe seule tendue en arrière.',
    },
    planche: {
      name: 'Gainage planche (genoux puis complète)', cat: 'coreHold', load: false, muscles: 'Sangle abdominale',
      video: yt('ARCrsCnSB-k'), videoAlt: yt('hoPwUu8vvvw'),
      cues: ['Semaines 1-2 sur les genoux ; à partir de la semaine 3 sur les pieds si c’est facile', 'Coudes sous les épaules, corps aligné, fessiers serrés', 'Respirer calmement'],
      caution: 'Épaule ou dos douloureux : rester sur les genoux, ou remplacer par le dead bug.',
      alt: 'Planche inclinée avant-bras sur un banc.',
    },
    lateral: {
      name: 'Gainage latéral sur les genoux', cat: 'coreHold', load: false, weeks: [3, 4, 5], muscles: 'Obliques, moyen fessier',
      video: yt('eJxg2uINEpU'), videoAlt: yt('hz00PzRgxNc'),
      cues: ['Sur le côté, appui sur l’avant-bras et les genoux fléchis', 'Monter le bassin pour aligner épaule-hanche-genou', 'Tenir, puis changer de côté'],
      caution: 'Épaule opérée : commencer côté sain ; arrêter si douleur en appui sur le côté opéré.',
      alt: 'Pallof press.',
    },
  },

  warmup: {
    common: [
      { id: 'velo', name: 'Vélo progressif', dose: '6 min, de très facile à facile (zone 1 → 2)', video: null },
      { id: 'cheville', name: 'Chevilles et genoux', dose: '10 rotations par sens et par cheville, 10 flexions de genoux', video: yt('v2gBxsVJUbk') },
      { id: 'hanche', name: 'Cercles de hanches', dose: '8 cercles par sens et par jambe, en se tenant', video: yt('VcpoDKlvEkk') },
      { id: 'bassin', name: 'Bascule du bassin debout', dose: '10 allers-retours lents', video: yt('m_KSmJvmheA') },
      { id: 'chatvache', name: 'Chat-vache', dose: '8 à 10 répétitions lentes, sans forcer', video: yt('r43PNCct6Yw') },
    ],
    A: [
      { id: 'openbook', name: 'Rotation thoracique « open book » (vidéo en anglais)', dose: '8 par côté, le bras opéré ouvre seulement sans douleur', video: yt('rDviWORCWEw') },
      { id: 'omoplates', name: 'Mobilisation des omoplates', dose: '10 répétitions', video: yt('sruFaP52VRM') },
      { id: 'rotelast', name: 'Rotation externe à l’élastique (activation coiffe)', dose: '15 par bras, élastique léger', video: yt('cTPhjO1Xoow') },
    ],
    B: [
      { id: 'pontact', name: 'Pont fessier d’activation', dose: '12 répétitions au poids du corps', video: yt('m7qQiAUcWaE') },
      { id: 'squatbanc', name: 'Assis-debout du banc au poids du corps', dose: '10 répétitions lentes', video: yt('D1IEI-lfLxU') },
    ],
    full: { name: 'Routine guidée complète (7 min, kinésithérapeute)', video: yt('fc3K0AeEEdk') },
  },

  sessions: {
    A: { name: 'Haut du corps & abdos', list: ['tirage', 'chest', 'rowing', 'facepull', 'rotext', 'curl', 'triceps', 'deadbug', 'pallof'],
         cooldown: ['Vélo très facile 3 min', 'Étirement pectoraux au mur, bras bas (sans douleur) – 2 × 20 s', 'Étirement dos : mains sur un banc, reculer les fesses – 2 × 20 s', 'Étirement triceps doux, côté sain puis opéré si confortable – 20 s', 'Respiration lente allongée, 1 min'] },
    B: { name: 'Bas du corps & abdos', list: ['presse', 'goblet', 'pont', 'hipthrust', 'legcurl', 'legext', 'abduct', 'stepup', 'birddog', 'planche', 'lateral'],
         cooldown: ['Vélo très facile 3 min', 'Quadriceps debout en se tenant – 2 × 20 s par jambe', 'Ischio-jambiers allongée avec une sangle – 2 × 20 s', 'Fessiers allongée (jambe en « 4 ») – 2 × 20 s', 'Mollets contre le mur – 20 s', 'Respiration lente allongée, 1 min'] },
  },

  // Cardio : segments [minutes, zone, libellé]
  cardio: {
    '1-A': { title: 'Test vélo de départ + endurance', test: true, seg: [[10, 'T', 'TEST : 10 min à FC stable ≈ 70 % (voir zones) – noter la distance'], [1, 1, 'Arrêt pédalage léger : noter la FC à 1 min'], [10, 2, 'Endurance facile']] },
    '1-B': { title: 'Endurance fondamentale', seg: [[20, 2, 'Endurance : tu peux parler en phrases']] },
    '2-A': { title: 'Endurance fondamentale', seg: [[25, 2, 'Endurance continue']] },
    '2-B': { title: 'Endurance fondamentale', seg: [[25, 2, 'Endurance continue']] },
    '3-A': { title: 'Intervalles courts (6 × 1 min)', seg: [[6, 2, 'Échauffement endurance'], ...rep(6, [[1, 4, 'Soutenu'], [2, 1, 'Récupération facile']]), [4, 2, 'Retour endurance']] },
    '3-B': { title: 'Blocs tempo (3 × 4 min)', seg: [[6, 2, 'Échauffement endurance'], ...rep(3, [[4, 3, 'Tempo'], [2, 1, 'Récupération facile']]), [4, 2, 'Retour endurance']] },
    '4-A': { title: 'Intervalles courts (8 × 1 min)', seg: [[5, 2, 'Échauffement endurance'], ...rep(8, [[1, 4, 'Soutenu'], [1.5, 1, 'Récupération facile']]), [5, 2, 'Retour endurance']] },
    '4-B': { title: 'Blocs tempo (3 × 6 min)', seg: [[5, 2, 'Échauffement endurance'], ...rep(3, [[6, 3, 'Tempo'], [2, 1, 'Récupération facile']]), [3, 2, 'Retour endurance']] },
    '5-A': { title: 'Endurance avec accélérations (3 × 3 min)', seg: [[8, 2, 'Endurance'], ...rep(3, [[3, 3, 'Tempo'], [2, 2, 'Endurance']]), [5, 2, 'Endurance']] },
    '5-B': { title: 'Test vélo final + endurance', test: true, seg: [[10, 'T', 'TEST : mêmes réglages qu’au départ – noter la distance'], [1, 1, 'Arrêt pédalage léger : noter la FC à 1 min'], [10, 2, 'Endurance facile']] },
  },

  zones: [
    { z: 1, name: 'Zone 1 · Récupération', lo: 0.50, hi: 0.60, rpe: '2-3/10', talk: 'Conversation très facile' },
    { z: 2, name: 'Zone 2 · Endurance', lo: 0.60, hi: 0.70, rpe: '4-5/10', talk: 'Tu peux parler en phrases complètes' },
    { z: 3, name: 'Zone 3 · Tempo', lo: 0.70, hi: 0.80, rpe: '6/10', talk: 'Phrases courtes seulement' },
    { z: 4, name: 'Zone 4 · Soutenu', lo: 0.80, hi: 0.88, rpe: '7-8/10', talk: 'Quelques mots seulement' },
    { z: 'T', name: 'Test · FC stable', lo: 0.69, hi: 0.71, rpe: '5/10', talk: 'Garder la même FC tout le test' },
  ],

  tests: [
    { id: 'date', label: 'Date', type: 'date' },
    { id: 'weight', label: 'Poids', unit: 'kg', better: 'info' },
    { id: 'waist', label: 'Tour de taille (nombril)', unit: 'cm', better: 'down' },
    { id: 'hips', label: 'Tour de hanches', unit: 'cm', better: 'info' },
    { id: 'thigh', label: 'Tour de cuisse (mi-cuisse, droite)', unit: 'cm', better: 'info' },
    { id: 'arm', label: 'Tour de bras (mi-bras, côté sain)', unit: 'cm', better: 'info' },
    { id: 'hrRest', label: 'FC de repos (au réveil)', unit: 'bpm', better: 'down' },
    { id: 'chair', label: 'Lever de chaise en 30 s', unit: 'rép.', better: 'up', help: 'Chaise sans accoudoirs contre un mur, bras croisés sur la poitrine : nombre de levers complets en 30 s (Rikli & Jones).' },
    { id: 'plank', label: 'Gainage planche sur genoux (max 2 min)', unit: 's', better: 'up', help: 'Arrêter dès que l’alignement se perd ou à 120 s. Même version au début et à la fin.' },
    { id: 'bikeDist', label: 'Vélo : distance en 10 min à FC stable', unit: 'km', better: 'up', help: 'Même vélo, même niveau de résistance, FC maintenue ≈ 70 % de la FC max.' },
    { id: 'bikeHr', label: 'Vélo : FC moyenne du test', unit: 'bpm', better: 'info' },
    { id: 'bikeRec', label: 'Vélo : FC 1 min après le test', unit: 'bpm', better: 'down', help: 'Plus elle redescend vite, meilleure est la forme cardio.' },
    { id: 'backPain', label: 'Douleur dos au repos', unit: '/10', better: 'down' },
    { id: 'shoulderPain', label: 'Douleur épaule au repos', unit: '/10', better: 'down' },
  ],

  safety: [
    "Avant de commencer : faire valider ce programme par le chirurgien ou le kinésithérapeute (épaule opérée, lombalgie récente).",
    "Règle de la douleur : une gêne jusqu’à 3/10 pendant l’effort est acceptable si elle disparaît le lendemain. Au-delà, ou si c’est pire le lendemain, ne pas augmenter et alléger la séance suivante.",
    "Douleur vive, irradiation dans la jambe, fourmillements, ou douleur d’épaule la nuit : arrêter et consulter.",
    "Exclus de ce cycle : développé au-dessus de la tête, tirage nuque, rowing menton, dips, crunchs et relevés de buste, soulevé de terre lourd, squat barre sur les épaules.",
    "Expirer pendant l’effort, ne jamais bloquer la respiration.",
    "Si un traitement ralentit le cœur (bêtabloquants), se fier à l’effort perçu plutôt qu’aux fréquences cardiaques.",
  ],

  next: [
    { title: 'Cycle 2 · Renforcement (6 semaines)', points: [
      'Passer à 3 séances par semaine : les 2 séances actuelles + 1 séance vélo seule (ou marche active), pour se rapprocher des 150 min d’endurance par semaine recommandées par l’OMS.',
      'Musculation 3 × 8-12 à 7-8/10, plus d’exercices sur une jambe (fentes, step-up plus haut), introduction du soulevé de terre roumain léger aux haltères si le dos le permet.',
      'Vélo : intervalles longs (par exemple 4 × 4 min en zone 4) : le travail par intervalles améliore nettement la capacité cardio des femmes d’âge moyen.',
      'Épaule : réintroduire un développé épaules avec haltères légers uniquement avec l’accord du kiné.',
      'Semaine 6 allégée + nouveaux tests.',
    ] },
    { title: 'Cycle 3 · Force & santé osseuse (6-8 semaines)', points: [
      'Charges plus lourdes sur les exercices de base (5 × 5 à 6-8 répétitions, 8/10), introduites progressivement avec une technique parfaite : c’est ce qui stimule le plus la densité osseuse après la ménopause (étude LIFTMOR).',
      'Petits sauts et exercices d’impact (corde à sauter légère, sauts sur place) si dos et genoux le tolèrent, en profitant de son passé de danseuse.',
      'Équilibre et pliométrie légère, utiles aussi pour la prévention des chutes à long terme.',
      'Bilan complet et comparaison avec les deux premiers cycles.',
    ] },
  ],

  sources: [
    { t: 'OMS – Lignes directrices sur l’activité physique et la sédentarité (2020)', u: 'https://www.who.int/europe/fr/publications/i/item/9789240014886' },
    { t: 'HAS – Lombalgie commune : éviter le passage à la chronicité (2019)', u: 'https://www.has-sante.fr/jcms/pprd_2974152/fr/lombalgie-commune-eviter-le-passage-a-la-chronicite' },
    { t: 'HAS – Fiche de prescription d’activité physique : lombalgie chronique (2024)', u: 'https://www.has-sante.fr/upload/docs/application/pdf/2024-04/fiche_aps_lombalgie_commune_chronique.pdf' },
    { t: 'Eddens et al. 2018 – Ordre musculation / endurance dans la séance (méta-analyse)', u: 'https://pubmed.ncbi.nlm.nih.gov/28917030/' },
    { t: 'Watson et al. 2018 – Étude LIFTMOR (musculation et densité osseuse après la ménopause)', u: 'https://research-repository.griffith.edu.au/items/70307370-05b3-5d8b-8454-78b328f0f15b' },
    { t: 'HSS – Rééducation après réparation de la coiffe des rotateurs', u: 'https://www.hss.edu/HSSRehabilitationClinicalGuidelines-Shou.pdf' },
    { t: 'Oxford University Hospitals (NHS) – Après une réparation de la coiffe', u: 'https://ulive.ouh.nhs.uk/media/k3gdunou/rotator-cuff-repair.pdf' },
    { t: 'Test du lever de chaise en 30 s (Rikli & Jones)', u: 'https://www.sralab.org/rehabilitation-measures/30-second-sit-stand-test' },
    { t: 'Fréquence cardiaque max – formule de Tanaka (208 − 0,7 × âge)', u: 'https://new.topendsports.com/testing/heart-rate-max.htm' },
    { t: 'HIIT chez les femmes d’âge moyen (Frontiers in Physiology, 2026)', u: 'https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2026.1778052/full' },
  ],
};

function rep(n, block) { const out = []; for (let i = 0; i < n; i++) out.push(...block); return out; }

// Liste ordonnée des 10 séances
PROGRAM.order = [];
for (let w = 1; w <= 5; w++) for (const s of ['A', 'B']) PROGRAM.order.push(`${w}-${s}`);

PROGRAM.exercisesFor = (key) => {
  const [w, s] = key.split('-');
  return PROGRAM.sessions[s].list.filter((id) => {
    const ex = PROGRAM.exercises[id];
    return !ex.weeks || ex.weeks.includes(+w);
  });
};
PROGRAM.dose = (exId, week) => PROGRAM.doses[PROGRAM.exercises[exId].cat][week - 1];
