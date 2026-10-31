/* =========================================================================
   config.js — TOUT SE RÈGLE ICI
   -------------------------------------------------------------------------
   1) La clé API Ginko (temporaire, à renouveler chaque jour sur
      https://api.ginko.voyage/  → rubrique « clé temporaire »)
   2) Mes arrêts favoris (les arrêts dont les passages s'affichent en direct)
   3) Mes destinations habituelles depuis la rue du Languedoc
   4) Les flux d'actualités, la météo, mes dates perso…
   ========================================================================= */
window.APP_CONFIG = {

  version: '2.2 · automne 2026 · web',
  ville: 'Besançon',
  tz: 'Europe/Paris',

  /* ---------- 1. GINKO ---------- */
  ginko: {
    apiKey: 'c81c7738e3f6b7395afcf5ebf24281fd',   // ← clé temporaire de test
    base: 'https://api.ginko.voyage',
    refetchSec: 30,          // rafraîchissement des temps d'attente
    nbParLigne: 3,           // nombre de passages demandés par ligne/sens
    domicile: { lat: 47.21887, lon: 5.96494, nom: 'Rue du Languedoc' }
  },

  /* ---------- 2. ARRÊTS FAVORIS (temps réel) ----------
     nom  : nom exact de l'arrêt tel que le connaît Ginko
     label: le petit nom affiché
     walk : minutes à pied depuis chez vous (indicatif)
     keep : lignes/sens à afficher en priorité (facultatif)          */
  favoris: [
    { nom: 'Languedoc',  label: 'Domicile',             walk: 2,  lignes: ['L4', '7'] },
    { nom: 'René Char',  label: 'Rue René Char',        walk: 6,  lignes: ['L4'] },
    { nom: 'Basilique',  label: 'Cimetière St-Ferjeux', walk: 3,  lignes: ['10'] },
    { nom: 'Gare Viotte',label: 'Gare Viotte',          walk: 0,  lignes: ['T2', 'L3', 'L5'] },
    { nom: 'Révolution', label: 'Centre-ville',         walk: 3,  lignes: ['T1', 'T2'] },
    { nom: 'Chamars',    label: 'Chamars / Citadelle',  walk: 2,  lignes: ['T1', 'T2', 'Ginko Citadelle'] }
  ],

  /* ---------- 3. MES DESTINATIONS ----------
     stop : nom de l'arrêt Ginko d'arrivée (destination du trajet)
     walk : minutes de marche à l'arrivée
     via  : petite note affichée sous le titre                          */
  destinations: [
    { id: 'centre',  label: 'Centre-ville',        ic: '★', stop: '8 Septembre', walk: 1, via: 'Grande Rue, marchés, musées' },
    { id: 'renechar',label: 'Rue René Char',       ic: '◆', stop: 'René Char',   walk: 2, via: 'Châteaufarine / Hauts du Chazal' },
    { id: 'ferjeux', label: 'Cimetière St-Ferjeux',ic: '✝', stop: 'Basilique',   walk: 3, via: 'Quartier Saint-Ferjeux' },
    { id: 'viotte',  label: 'Gare Viotte',         ic: '✦', stop: 'Gare Viotte', walk: 1, via: 'TER, TGV, correspondances' },
    { id: 'citadelle',label:'Citadelle',           ic: '🏰', stop: 'Citadelle',   walk: 1, via: 'Vauban, musées, zoo' },
    { id: 'chu',     label: 'CHU Minjoz',          ic: '✚', stop: 'CHU Minjoz',  walk: 1, via: 'Hôpital / consultations' },
    { id: 'micropolis',label:'Micropolis',         ic: '🎪', stop: 'Micropolis',  walk: 2, via: 'Concerts, salons, foires' },
    { id: 'chateaufarine',label:'Châteaufarine',   ic: '🛒', stop: 'Châteaufarine',walk: 4, via: 'Commerces, CHU, UFR' }
  ],

  /* ---------- 4. MÉTÉO / AIR (Besançon centre) ---------- */
  meteo: { lat: 47.2378, lon: 6.0241 },

  /* ---------- 5. ACTUS (flux RSS locaux) ---------- */
  actus: {
    // flux principal (le plus fiable) — les rubriques sont accessibles via le site
    une:     'https://www.macommune.info/feed/',
    loisirs: 'https://www.macommune.info/feed/',
    culture: 'https://www.macommune.info/feed/'
  },

  /* ---------- 5 bis. MES SIGNES (horoscope du bas de page) ----------
     slug  : nom du fichier de flux (rss_<slug>.php)
     label : ce qui s'affiche dans la carte, avec son symbole
     Ajoutez, retirez ou réordonnez librement : 12 signes possibles
     (belier, taureau, gemeaux, cancer, lion, vierge, balance, scorpion,
      sagittaire, capricorne, verseau, poissons).                          */
  horo: [
    { slug: 'verseau', label: '♒ Verseau' },
    { slug: 'balance', label: '♎ Balance' }
  ],

  /* ---------- 6. MES DATES (anniversaires, rendez-vous fixes) ----------
     date : 'AAAA-MM-JJ' pour une date unique, ou 'MM-JJ' pour un rappel annuel */
  PERSO: [
    { date: '11-01', label: 'Toussaint',            note: 'Cimetière : fleurs, circulation chargée' },
    { date: '11-11', label: 'Armistice 1918',       note: 'Cérémonies aux monuments' },
    { date: '12-25', label: 'Noël',                 note: 'Marché de Noël jusqu’au 24 décembre' }
    /* { date: '03-14', label: 'Anniversaire de …', note: '' } */
  ]
};
