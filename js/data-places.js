/* =========================================================================
   data-places.js — Lieux d'intérêt, repères et événements de Besançon
   Coordonnées GPS : OpenStreetMap (ODbL). Textes rédigés pour cet agenda.
   ========================================================================= */
window.PLACES = [

/* ---------- MES REPÈRES ---------- */
{
  id:'domicile', nom:'Mon domicile — rue du Languedoc', cat:'repère', ic:'⌂',
  lat:47.21887, lon:5.96494, station:'Languedoc', adresse:'Rue du Languedoc, 25000 Besançon (Planoise / Châteaufarine)',
  desc:"Point de départ de tous les trajets. L'arrêt <b>Languedoc</b> (bus <b>L4</b> et <b>7</b>, + ligne 22) est à quelques minutes à pied.",
  infos:["L4 : Châteaufarine ↔ Pôle Orchamps (tram T1/T2 en correspondance à Île de France)","7 : Hauts du Chazal ↔ Palente","Zone Châteaufarine (commerces, CHU Minjoz, UFR Santé) à 10 min"],
  lien:{t:'ginko.voyage — horaires à l’arrêt', u:'https://www.ginko.voyage/se-deplacer/bus-tram-car/horaires-a-larret/'}
},
{
  id:'centreville', nom:'Centre-ville — la Boucle', cat:'repère', ic:'★',
  lat:47.2392, lon:6.0240, station:'8 Septembre',
  adresse:'Grande Rue, place du 8 Septembre, place de la Révolution',
  desc:"Le cœur historique, inscrit dans la boucle du Doubs : commerces, restaurants, musées, tramways T1 et T2. Idéal pour une journée « tout à pied ».",
  infos:["T1/T2 : arrêts Révolution, Battant, Chamars","Accès depuis Languedoc : L4 puis T1/T2 (≈ 30-35 min)","Parkings : Révolution, Mairie, Beaux-Arts, Chamars"],
  lien:{t:'besancon.fr', u:'https://www.besancon.fr/'}
},
{
  id:'renechar', nom:'Rue René Char', cat:'repère', ic:'◆',
  lat:47.21792, lon:5.95063, station:'René Char', adresse:'Rue René Char, ZAC de Châteaufarine / Hauts du Chazal',
  desc:"À deux pas des Hauts du Chazal et de Châteaufarine. L'arrêt <b>René Char</b> est desservi par le <b>L4</b> (et les cars 53 à 61 vers Pôle Micropolis).",
  infos:["L4 direct vers Châteaufarine (5 min) et vers le centre via Île de France","Correspondance tram T1/T2 à Hauts du Chazal"],
  lien:{t:'Voir les arrêts sur Ginko', u:'https://www.ginko.voyage/plan'}
},
{
  id:'gareviotte', nom:'Gare Viotte', cat:'gare', ic:'✦',
  lat:47.24628, lon:6.02196, station:'Gare Viotte', adresse:'Avenue de la Paix, 25000 Besançon',
  desc:"La gare bisontine : TER Bourgogne-Franche-Comté, correspondances vers Paris et les grandes lignes (TGV à Besançon Franche-Comté TGV). Pôle d'échanges bus + tram.",
  infos:["Tram T2 vers la Boucle (Révolution, Chamars) en 4 min","Bus L3, L5, Plan B, ligne 8 à Gare Viotte Nord","Distributeurs de titres Ginko sur place"],
  lien:{t:'SNCF Connect', u:'https://www.sncf-connect.com/'}
},
{
  id:'stferjeux-cimetiere', nom:'Cimetière de Saint-Ferjeux', cat:'repère', ic:'✝',
  lat:47.23382, lon:5.98704, station:'Basilique', adresse:'Saint-Ferjeux, 25000 Besançon',
  desc:"Cimetière du quartier Saint-Ferjeux, sur les hauteurs de la ville, à quelques minutes de la basilique. L'arrêt <b>Basilique</b> (ligne 10) est le plus proche.",
  infos:["Ligne 10 : CHU Minjoz ↔ Chaffanjon","Depuis Languedoc : L4 + tram ou ligne 10","Cimetière ouvert tous les jours (horaires affichés à l’entrée)"],
  lien:{t:'Ville de Besançon', u:'https://www.besancon.fr/'}
},
{
  id:'havrais', nom:'Le Havrais — bureau « annexe »', cat:'repère', ic:'☕',
  lat:47.21946, lon:5.95573, station:'Châteaufarine', adresse:'Quartier Châteaufarine (ouest de Besançon)',
  desc:"Le quartier de Châteaufarine : commerces, services et accès rapide au CHU Minjoz. Repère pratique pour les rendez-vous de proximité.",
  infos:["L4, arrêt Châteaufarine (10 min depuis Languedoc)","Centre commercial et moyennes surfaces à proximité","Latitude/longitude à ajuster si besoin dans js\\data-places.js"],
  lien:{t:'Ginko — plan du réseau', u:'https://www.ginko.voyage/plan'}
},

/* ---------- LIEUX QUI ME SONT CHERS ---------- */
{
  id:'basilique', nom:'Basilique Saint-Ferjeux', cat:'spirituel', ic:'✝',
  lat:47.23276, lon:5.98926, station:'Basilique', adresse:'Rue de la Basilique, Saint-Ferjeux',
  desc:"Basilique néo-byzantine du XIXᵉ siècle, dédiée aux saints Ferréol et Ferjeux, évangélisateurs de la Franche-Comté. Lieu de recueillement et de promenade sur les hauteurs bisontines.",
  infos:["Ligne 10, arrêt Basilique","Messes et visites : voir la paroisse","À 5 min du cimetière de Saint-Ferjeux"],
  lien:{t:'Diocèse de Besançon', u:'https://www.diocese-besancon.fr/'}
},
{
  id:'citadelle', nom:'Citadelle de Besançon', cat:'culture', ic:'🏰',
  lat:47.22973, lon:6.03436, station:'Citadelle', adresse:'99 rue des Fusillés de la Résistance',
  desc:"Chef-d'œuvre de Vauban (inscrit à l'UNESCO avec les fortifications de Vauban, 2008), sur 11 hectares : musées, zoo, parcours souterrains et vue à 360° sur la ville.",
  infos:["Accès : bus <b>Ginko Citadelle</b> (depuis Chamars / centre-ville) ou à pied depuis la Boucle","En famille : zoo et parcours enfants","Prévoir 2 à 3 h — bonnes chaussures !"],
  lien:{t:'citadelle.com', u:'https://citadelle.com/'}
},
{
  id:'maisonhugo', nom:'Musée Maison natale de Victor Hugo', cat:'culture', ic:'📖',
  lat:47.23500, lon:6.02911, station:'8 Septembre', adresse:'140 Grande Rue',
  desc:"C'est ici que naquit Victor Hugo en 1802, dans l'hôtel particulier familial. Maison d'écrivain, musée et bibliothèque, au cœur du centre ancien.",
  infos:["À 5 min à pied de la place du 8 Septembre","Visites et animations littéraires toute l'année"],
  lien:{t:'maisonvictorhugo.besancon.fr', u:'https://maisonvictorhugo.besancon.fr/'}
},
{
  id:'musee-temps', nom:'Musée du Temps (Palais Granvelle)', cat:'culture', ic:'◷',
  lat:47.23584, lon:6.02691, station:'8 Septembre', adresse:'96 Grande Rue',
  desc:"La grande aventure horlogère de Besançon, dans le superbe Palais Granvelle : collections d'horlogerie, histoire de la ville et pendule de Foucault.",
  infos:["Fermé le lundi","Gratuité le 1er dimanche du mois (visites guidées sur réservation)","Programmation culturelle sur mdt.besancon.fr"],
  lien:{t:'mdt.besancon.fr', u:'https://www.mdt.besancon.fr/'}
},
{
  id:'mbaa', nom:'Musée des Beaux-Arts et d’Archéologie', cat:'culture', ic:'🖼',
  lat:47.24021, lon:6.02317, station:'Granvelle', adresse:'1 place de la Révolution',
  desc:"L'une des plus anciennes collections publiques de France (1694) : peintures, dessins, antiquités et trésors archéologiques, à côté des Halles Beaux-Arts.",
  infos:["Tram T1/T2, arrêt Révolution","Couplage possible avec le Musée du Temps","Mégarama Beaux-Arts juste à côté"],
  lien:{t:'Musées d’Art & du Temps', u:'https://www.mdt.besancon.fr/'}
},
{
  id:'portenoire', nom:'Porte Noire & square Castan', cat:'culture', ic:'▲',
  lat:47.23413, lon:6.03022, station:'Chamars', adresse:'Rue de la Convention',
  desc:"Arc de triomphe gallo-romain du IIᵉ siècle, adossé à la cathédrale, avec le square Castan et ses vestiges antiques : un concentré d'histoire à ciel ouvert.",
  infos:["Gratuit, à visiter en flânant","À 2 min de la Cathédrale Saint-Jean","Proche du parc Chamars"],
  lien:{t:'Besançon tourisme', u:'https://www.besancon-tourisme.com/'}
},
{
  id:'cathedrale', nom:'Cathédrale Saint-Jean', cat:'culture', ic:'✝',
  lat:47.23365, lon:6.03042, station:'Chamars', adresse:'Rue du Chapitre',
  desc:"Cathédrale mêlant XIᵉ et XVIIIᵉ siècles, célèbre pour son horloge astronomique à automates et son riche mobilier baroque.",
  infos:["Visite libre ; concerts et veillées organisés par la paroisse","Tram T1/T2, arrêt Chamars"],
  lien:{t:'Diocèse de Besançon', u:'https://www.diocese-besancon.fr/'}
},
{
  id:'frac', nom:'FRAC Franche-Comté', cat:'culture', ic:'◨',
  lat:47.23588, lon:6.03396, station:'Chamars', adresse:'1 avenue Arthur Gaulard',
  desc:"Art contemporain dans une architecture remarquable du site Citadelle ; expositions temporaires, collections, médiation et événements.",
  infos:["Entrée selon expositions (voir site)","Tram T1/T2, arrêt Chamars puis 8 min à pied"],
  lien:{t:'frac-franche-comte.fr', u:'https://www.frac-franche-comte.fr/'}
},
{
  id:'comedie', nom:'La Comédie de Besançon (CDN)', cat:'culture', ic:'🎭',
  lat:47.23454, lon:6.02950, station:'Chamars', adresse:'4 rue de la Convention',
  desc:"Centre dramatique national : théâtre, créations, tournées et ateliers. La belle salle de la rue de la Convention, au pied de la Citadelle.",
  infos:["Billetterie en ligne ; tarifs abonnés","Tram T1/T2, arrêt Chamars"],
  lien:{t:'cdn-besancon.fr', u:'https://www.cdn-besancon.fr/'}
},
{
  id:'rodia', nom:'La Rodia — musiques actuelles', cat:'culture', ic:'♪',
  lat:47.23240, lon:6.03761, station:'Prés de Vaux', adresse:'4 avenue de Chardonnet',
  desc:"La SMAC de Besançon : concerts amplifiés, club, découvertes et festivals (dont Détonation). Une salle au son réputé, côté Prés-de-Vaux.",
  infos:["Bus 12, arrêt Prés de Vaux","Billetterie et agenda sur larodia.com","Bars et foodtrucks sur place"],
  lien:{t:'larodia.com', u:'https://larodia.com/'}
},
{
  id:'micropolis', nom:'Micropolis — parc des expositions', cat:'culture', ic:'🎪',
  lat:47.22068, lon:5.97802, station:'Micropolis', adresse:'Boulevard Salvador Allende',
  desc:"Le grand parc des expositions du Grand Besançon : concerts, salons, foires (dont la Vache de Salon) et grands spectacles.",
  infos:["Tram T1/T2 + bus 7, arrêt Micropolis","Depuis Languedoc : L4 vers Île de France puis T1/T2, ou L4 + marche","Parking gratuit sur place"],
  lien:{t:'micropolis.fr', u:'https://www.micropolis.fr/'}
},
{
  id:'megarama', nom:'Mégarama Beaux-Arts — cinéma', cat:'culture', ic:'🎬',
  lat:47.24030, lon:6.02381, station:'Révolution', adresse:'Rue Gustave Courbet',
  desc:"Cinéma du centre-ville, à deux pas de la place de la Révolution ; séances « Beaux-Arts », avant-premières, films en VO.",
  infos:["Tram T1/T2, arrêt Révolution","Séances et réservations : beaux-arts.megarama.fr"],
  lien:{t:'Mégarama Beaux-Arts', u:'https://beaux-arts.megarama.fr/'}
},

/* ---------- NATURE & PROMENADES ---------- */
{
  id:'micaud', nom:'Parc Micaud', cat:'nature', ic:'✿',
  lat:47.24206, lon:6.03154, station:'Parc Micaud', adresse:'Avenue Édouard Droz',
  desc:"Grand parc à l'anglaise le long du Doubs, entre la gare et la Mouillère : promenades, aires de jeux, guinguettes en saison et vue sur les collines.",
  infos:["Tram T1/T2, arrêt Parc Micaud","Idéal pour un footing plat le long de l'eau","Proche des berges du Doubs et du centre"],
  lien:{t:'Destination Besançon', u:'https://www.besancon-tourisme.com/'}
},
{
  id:'garedeau', nom:'Parc de la Gare d’Eau', cat:'nature', ic:'☘',
  lat:47.23191, lon:6.02210, station:'Chamars', adresse:'Avenue de la Gare d’Eau',
  desc:"Plan d'eau et parc paysager à deux pas du centre : balades au bord de l'eau, jeux pour enfants et activités nautiques en saison.",
  infos:["Tram T1/T2, arrêt Chamars","Boucle de promenade à pied depuis la Boucle","Pique-nique et aires de jeux"],
  lien:{t:'besancon.fr — parcs et jardins', u:'https://www.besancon.fr/'}
},
{
  id:'bregille', nom:'Fort de Bregille & colline', cat:'nature', ic:'▲',
  lat:47.23510, lon:6.04374, station:'Fort de Bregille', adresse:'Chemin du Fort de Bregille',
  desc:"Fortification militaire sur les hauteurs de Bregille, point de départ de sentiers boisés avec de beaux points de vue sur la ville et le Doubs.",
  infos:["Ligne 10, arrêt Fort de Bregille","Chaussures de marche conseillées","Panorama sur la Citadelle et la Boucle"],
  lien:{t:'besancon.fr', u:'https://www.besancon.fr/'}
},
{
  id:'rivotte', nom:'Rivotte & quai Vauban', cat:'nature', ic:'⚑',
  lat:47.2330, lon:6.0345, station:'Rivotte', adresse:'Place Rivotte / quai de Strasbourg',
  desc:"Porte historique de la Boucle côté est : quais aménagés, vieux bassin, départ de balades vers la Citadelle et le tunnel fluvial.",
  infos:["Ligne 11, arrêt Rivotte","Marché de Rivotte le dimanche matin (place des Jacobins)","Accès piéton depuis le centre-ville"],
  lien:{t:'besancon.fr', u:'https://www.besancon.fr/'}
},

/* ---------- COMMERCES, VIE PRATIQUE, SANTÉ ---------- */
{
  id:'revolution', nom:'Marché de la Révolution', cat:'commerce', ic:'🥖',
  lat:47.24003, lon:6.02238, station:'Révolution', adresse:'Place de la Révolution',
  desc:"Le grand marché bisontin : entre 60 et 100 exposants, producteurs locaux et halles alimentaires. Le samedi matin, c'est le rendez-vous du centre-ville.",
  infos:["Mardi & vendredi : 7 h – 13 h","Samedi : 7 h – 18 h","Tram T1/T2, arrêt Révolution — arriver avant 9 h le samedi"],
  lien:{t:'Ville de Besançon — marchés', u:'https://www.besancon.fr/'}
},
{
  id:'halles', nom:'Halles Beaux-Arts (marché couvert)', cat:'commerce', ic:'🧺',
  lat:47.24084, lon:6.02363, station:'Granvelle', adresse:'Rue Goudimel / rue Jean Petit',
  desc:"Marché couvert historique du centre : fromagers, bouchers, primeurs, poissonniers et restauration sur le pouce.",
  infos:["Mar. à jeu. : 7 h – 14 h ; ven. & sam. : 7 h – 18 h 30 ; dim. : 8 h – 13 h","Tram T1/T2, arrêt Révolution / Granvelle"],
  lien:{t:'Halles Beaux-Arts', u:'https://www.besancon.fr/'}
},
{
  id:'palente', nom:'Marché de Palente', cat:'commerce', ic:'🥕',
  lat:47.25993, lon:6.04536, station:'Croix de Palente', adresse:'Rue des Roses / place des Tilleuls, Palente',
  desc:"Marché de quartier du nord-est bisontin : produits frais et ambiance conviviale, autour de la place des Tilleuls.",
  infos:["Mercredi & samedi : 7 h – 13 h","Tram T1, arrêt Croix de Palente (puis 5 min à pied)","Bus 7, arrêt Palente Espace Industriel"],
  lien:{t:'Ville de Besançon — marchés', u:'https://www.besancon.fr/'}
},
{
  id:'saintferjeux-marche', nom:'Marché de Saint-Ferjeux', cat:'commerce', ic:'🧀',
  lat:47.2320, lon:5.9880, station:'Basilique', adresse:'Quartier Saint-Ferjeux',
  desc:"Marché du dimanche matin dans le quartier Saint-Ferjeux : de quoi faire ses courses après la messe ou avant une balade.",
  infos:["Dimanche matin : 7 h – 13 h","Ligne 10, arrêt Basilique"],
  lien:{t:'Ville de Besançon — marchés', u:'https://www.besancon.fr/'}
},
{
  id:'chateaufarine', nom:'Centre commercial Châteaufarine', cat:'commerce', ic:'🛒',
  lat:47.21492, lon:5.94744, station:'Châteaufarine', adresse:'Rue Guillaume Apollinaire, ZAC de Châteaufarine',
  desc:"La grande zone commerciale à l'ouest de Besançon : hypermarché, boutiques, restaurants et services, à 10 min en L4 depuis le domicile.",
  infos:["L4, arrêt Châteaufarine puis zone piétonne","CHU Minjoz et UFR Santé à proximité","Parking gratuit"],
  lien:{t:'Ginko — itinéraires', u:'https://www.ginko.voyage/se-deplacer/itineraires/calcul-ditineraires/'}
},
{
  id:'espacevalentin', nom:'Espace Valentin', cat:'commerce', ic:'🛍',
  lat:47.28222, lon:5.99118, station:'École-Valentin - Espace Valentin', adresse:'École-Valentin (nord de Besançon)',
  desc:"Zone commerciale et de loisirs d'École-Valentin, au nord de l'agglomération : boutiques, restauration, cinéma et grandes enseignes.",
  infos:["Ligne 8, arrêt École-Valentin - Espace Valentin","Accès voiture : A36, sortie Valentin"],
  lien:{t:'Ginko — itinéraires', u:'https://www.ginko.voyage/se-deplacer/itineraires/calcul-ditineraires/'}
},
{
  id:'chu', nom:'CHU Minjoz', cat:'sante', ic:'✚',
  lat:47.22755, lon:5.96546, station:'CHU Minjoz', adresse:'Boulevard Alexandre Fleming',
  desc:"Le centre hospitalier universitaire de Besançon : urgences, consultations spécialisées, maternité. Desservi par le tram et la ligne 10.",
  infos:["Tram T1/T2 + ligne 10, arrêt CHU Minjoz","Depuis Languedoc : L4 vers Île de France puis tram (~15 min)","Urgences ouvertes 24 h/24"],
  lien:{t:'chu-besancon.fr', u:'https://www.chu-besancon.fr/'}
},
{
  id:'pharmacie', nom:'Pharmacie de garde (3237)', cat:'sante', ic:'✚',
  lat:47.21887, lon:5.96494, station:'Languedoc', adresse:'Besançon et environs',
  desc:"Pour trouver la pharmacie de garde la plus proche, 24 h/24 : le service 3237 (appel gratuit depuis un poste fixe) ou le site dédié.",
  infos:["Nº court : 3237","Urgences médicales : 15 (SAMU), 112 (Europe)","SOS Médecins : 3624"],
  lien:{t:'3237.fr — pharmacies de garde', u:'https://www.3237.fr/'}
},
{
  id:'dechetterie', nom:'Déchetteries du Grand Besançon', cat:'commerce', ic:'♻',
  lat:47.2200, lon:5.9700, station:'Languedoc', adresse:'Grand Besançon Métropole',
  desc:"Le réseau de déchetteries et les consignes de tri du Grand Besançon : encombrants, végétaux, gravats, déchets dangereux.",
  infos:["Horaires et accès par déchetterie sur grandbesancon.fr","Besoin d’un badge pour l’accès véhicule","Collecte des déchets : jours selon le quartier"],
  lien:{t:'Grand Besançon — déchets', u:'https://www.grandbesancon.fr/toutes-les-demarches/dechets/'}
},
{
  id:'planoise', nom:'Planoise — maison de quartier', cat:'repère', ic:'◆',
  lat:47.22077, lon:5.96733, station:'Planoise', adresse:'Avenue de l’Île-de-France',
  desc:"Le grand quartier ouest de Besançon, avec sa maison de quartier, ses équipements culturels et sportifs, et le marché de l'Île de France.",
  infos:["Bus 7, arrêt Planoise","Marché de l’Île de France : jeudi & dimanche (7 h – 13 h)","Maison de quartier : activités et événements"],
  lien:{t:'Ville de Besançon', u:'https://www.besancon.fr/'}
},
{
  id:'mallarme', nom:'Piscine Mallarmé', cat:'sport', ic:'≈',
  lat:47.24436, lon:5.99856, station:'Palente', adresse:'Avenue Léo Lagrange',
  desc:"Piscine municipale côté Observatoire / Léo Lagrange : bassins et créneaux pour tous, écoles de natation et activités aquatiques.",
  infos:["Horaires et tarifs sur besancon.fr","Bus 7 vers Palente puis marche, ou correspondances centre","Penser au bonnet de bain"],
  lien:{t:'besancon.fr — piscines', u:'https://www.besancon.fr/'}
},
{
  id:'citiz', nom:'Citiz — autopartage', cat:'sport', ic:'⛟',
  lat:47.2378, lon:6.0241, station:'Révolution', adresse:'26 stations dans le Grand Besançon',
  desc:"Voitures en libre-service 24 h/24 (citadines, familiales, utilitaires) : pratique pour un déménagement ou une sortie hors réseau Ginko. Abonnement annuel offert avec la carte Ginko Mobilités.",
  infos:["Réservation via l’application Citiz","Abonnement offert avec Ginko Mobilités","Stations en centre-ville et quartiers"],
  lien:{t:'citiz.coop', u:'https://www.citiz.coop/'}
}
];

/* ---------- ÉVÉNEMENTS (à compléter / modifier librement) ---------- */
window.EVENTS = [
  { date:'2026-10-31', fin:'2026-11-01', titre:'Cit’Alloween à la Citadelle', lieu:'Citadelle de Besançon', cat:'culture',
    desc:'Fantômes, créatures et animations frissonnantes pour les 31 octobre et 1ᵉʳ novembre.', lien:'https://citadelle.com/' },
  { date:'2026-11-01', titre:'Toussaint — cimetières et basilique', lieu:'Cimetière de Saint-Ferjeux & Basilique', cat:'repère',
    desc:'Affluence attendue : ligne 10 renforcée, pensez au tram T1/T2 + marche ou partez avant 10 h.', lien:'https://www.ginko.voyage/' },
  { date:'2026-11-05', titre:'Casse-Noisette — ballet & orchestre', lieu:'Micropolis', cat:'culture',
    desc:'Le ballet féerique de Noël en tournée 2026/2027.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2026-11-06', titre:'I Muvrini — tournée', lieu:'Micropolis', cat:'concert',
    desc:'Le groupe corse en concert à 20 h 30.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2026-11-11', titre:'Armistice — commémorations', lieu:'Monuments de Besançon', cat:'repère',
    desc:'Cérémonies officielles du 11 novembre ; circulation adaptée en centre-ville.', lien:'https://www.besancon.fr/' },
  { date:'2026-11-15', titre:'Legendary Rock Voices', lieu:'Micropolis', cat:'concert',
    desc:'Le grand spectacle symphonique rock, à 20 h.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2026-11-20', fin:'2026-11-22', titre:'Vache de Salon', lieu:'Micropolis', cat:'foire',
    desc:'Le rendez-vous agricole et gourmand du Grand Besançon : 20 au 22 novembre.', lien:'https://www.micropolis.fr/' },
  { date:'2026-11-25', titre:'L’Héritage Goldman 2', lieu:'Micropolis', cat:'concert',
    desc:'Le répertoire de Jean-Jacques Goldman revisité, à 20 h.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2026-11-26', titre:'Barbara par Pietragalla', lieu:'Micropolis', cat:'culture',
    desc:'Hommage dansé à Barbara par Marie-Claude Pietragalla.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2026-11-27', fin:'2026-12-24', titre:'Marché de Noël de Besançon', lieu:'Centre-ville — place Granvelle & Révolution', cat:'marché',
    desc:'Chalets, animations de fin d’année et illuminations dans la Boucle.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2026-12-02', titre:'Musiques de Hans Zimmer & Alan Silvestri', lieu:'Micropolis', cat:'concert',
    desc:'50 musiciens, choristes et solistes pour les musiques de films.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2026-12-04', titre:'Tendances 80’90', lieu:'Micropolis', cat:'concert',
    desc:'Douze artistes culte des années 80-90 sur une même scène.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2026-12-11', titre:'De Michel Berger à France Gall', lieu:'Micropolis', cat:'concert',
    desc:'Tribute aux deux icônes de la chanson française.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2027-01-23', fin:'2027-01-24', titre:'Festival Drôlement Bien', lieu:'Besançon', cat:'culture',
    desc:'Rires et humour pour bien commencer l’année.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2027-02-05', titre:'Booder — « Ah… l’École ! »', lieu:'Micropolis', cat:'culture',
    desc:'Seul en scène humour.', lien:'https://www.jds.fr/besancon/agenda/' },
  { date:'2027-03-12', titre:'Laurent Gerra — « Se met à table ! »', lieu:'Micropolis', cat:'culture',
    desc:'L’humoriste et ses personnages.', lien:'https://www.jds.fr/besancon/agenda/' }
];

/* ---------- BONS PLANS / LIENS ---------- */
window.LINKS = {
  ginko: 'https://www.ginko.voyage/',
  ginkoPlan: 'https://www.ginko.voyage/plan',
  ginkoItin: 'https://www.ginko.voyage/se-deplacer/itineraires/calcul-ditineraires/',
  velocite: 'https://www.grandbesancon.fr/infos-pratiques/transports/se-deplacer-plus-simplement/',
  ville: 'https://www.besancon.fr/',
  agglo: 'https://www.grandbesancon.fr/',
  actu: 'https://www.macommune.info/',
  agendaVille: 'https://www.grandbesancon.fr/agenda/',
  tourisme: 'https://www.besancon-tourisme.com/'
};
