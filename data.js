// ===================================================================================
// SPELLINGREGELS, CATEGORIEËN EN GROEPEN
// Dit bestand bevat alle statische data voor de applicatie.
// ===================================================================================

const spellingRegels = [
  { "id": 1, "naam": "Hakwoord", "regel": "Ik schrijf het woord zoals ik het hoor. Speciaal hakwoord (zoals in 'melk'): daar mag geen 'u' tussen." },
  { "id": 2, "naam": "Zingwoord", "regel": "Net als bij ding dong." },
  { "id": 3, "naam": "Luchtwoord", "regel": "Korte klank + cht met de ch van lucht. Uitzonderingen: hij ligt, hij legt, hij zegt." },
  { "id": 4, "naam": "Plankwoord", "regel": "Daar mag geen 'g' tussen." },
  { "id": 5, "naam": "Eer-oor-eur woord", "regel": "Ik schrijf eer, oor, of eur." },
  { "id": 6, "naam": "Aai-ooi-oei woord", "regel": "Ik hoorde de 'j', maar ik schrijf de 'i'." },
  { "id": 7, "naam": "Eeuw-ieuw woord", "regel": "Ik denk aan de 'u' bij eeuw." },
  { "id": 8, "naam": "Langermaakwoord", "regel": "Ik hoor een 't' aan het eind, dus langer maken om te horen of ik 'd' of 't' moet schrijven (hond-honden). Ook voor woorden die eindigen op 'b' (krab-krabben)." },
  { "id": 9, "naam": "Voorvoegsel", "regel": "Ik hoor de 'u', maar ik schrijf de 'e' (be-, ge-, ver-)." },
  { "id": 10, "naam": "Klankgroepenwoord", "regel": "Verdeel het woord in klankgroepen. Korte klank aan het eind van een klankgroep: medeklinker dubbel schrijven (bakker). Lange klank aan het eind van een klankgroep: een stukje van de lange klank weghalen (apen)." },
  { "id": 11, "naam": "Verkleinwoord", "regel": "Grondwoord + -je, -tje of -pje. Ik hoor '-utje', maar ik schrijf '-etje'." },
  { "id": 12, "naam": "Achtervoegsel", "regel": "-ig: Ik hoor '-ug', maar ik schrijf '-ig'. -lijk: Ik hoor '-luk', maar ik schrijf '-lijk'." },
  { "id": 13, "naam": "Kilowoord", "regel": "Ik hoor de 'ie', maar ik schrijf de 'i'." },
  { "id": 14, "naam": "Komma-s meervoud", "regel": "Meervoud en aan het eind een lange klank, dan komma-s, behalve bij de -e." },
  { "id": 15, "naam": "Centwoord", "regel": "Ik hoor de 's', maar ik schrijf de 'c'." },
  { "id": 16, "naam": "Komma-s diverse", "regel": "Komma-s bij meervoud, bezit, verkleinwoorden of weglatingsteken." },
  { "id": 17, "naam": "Politiewoord", "regel": "Ik hoor 'sie', maar ik schrijf 'tie'." },
  { "id": 18, "naam": "Colawoord", "regel": "Ik hoor de 'k', maar ik schrijf de 'c'." },
  { "id": 19, "naam": "Tropisch woord", "regel": "Ik hoor 'ies', maar ik schrijf 'isch'." },
  { "id": 20, "naam": "Taxiwoord", "regel": "Ik hoor 'ks', maar ik schrijf de 'x'." },
  { "id": 21, "naam": "Chefwoord", "regel": "Ik hoor 'sj', maar ik schrijf 'ch'." },
  { "id": 22, "naam": "Theewoord", "regel": "Ik hoor 't', maar ik schrijf 'th'." },
  { "id": 23, "naam": "Caféwoord", "regel": "Met een streepje op de 'e'." },
  { "id": 24, "naam": "Cadeauwoord", "regel": "Ik hoor 'oo', maar ik schrijf 'eau'." },
  { "id": 25, "naam": "Routewoord", "regel": "Ik hoor 'oe', maar ik schrijf 'ou'." },
  { "id": 26, "naam": "Garagewoord", "regel": "Ik hoor 'zj', maar ik schrijf 'g'." },
  { "id": 27, "naam": "Lollywoord", "regel": "Ik hoor 'ie' aan het eind, maar ik schrijf 'y'." },
  { "id": 28, "naam": "Tremawoord", "regel": "Bij klinkerbotsing, een trema op de volgende klinker. Uitzondering: -ee en -ie." },
  { "id": 29, "naam": "Militairwoord", "regel": "Ik hoor 'èr', maar ik schrijf 'air'." },
  { "id": 30, "naam": "Koppelteken", "regel": "In samenstellingen met klinkerbotsing, aardrijkskundige namen, afkortingen." },
  { "id": 31, "naam": "Trottoirwoord", "regel": "Ik hoor 'waar', maar ik schrijf 'oir'." },
  { "id": 32, "naam": "Tussen-e of -en", "regel": "Samenstelling met tussen -n of -en. Hoofdregel: schrijf altijd -en, tenzij het eerste deel uniek is of geen -en meervoud heeft." },
  { "id": 33, "naam": "Apostrofwoord", "regel": "Bij meervoud van woorden op -a, -i, -o, -u, -y. Bij bezit als de naam eindigt op een sisklank of een lange klinker." },
  { "id": 34, "naam": "Latijns voorvoegsel", "regel": "Voorvoegsels zoals ab-, ad-, con-, ob-, sub-." },
  { "id": 35, "naam": "Samenstelling", "regel": "Een woord dat bestaat uit twee of meer woorden die ook zelfstandig kunnen voorkomen." },
  { "id": 36, "naam": "Ei-plaat", "regel": "Weetwoord, leer de woorden van de ei-plaat." },
  { "id": 37, "naam": "Au-plaat", "regel": "Weetwoord, leer de woorden van de au-plaat." }
];

const categories = {
    1: "Hakwoord", 2: "Zingwoord", 3: "Luchtwoord", 4: "Plankwoord", 5: "Eer-oor-eur woord",
    6: "Aai-ooi-oei woord", 7: "Eeuw-ieuw woord", 8: "Langermaakwoord", 9: "Voorvoegsel", 10: "Klankgroepenwoord",
    11: "Verkleinwoord", 12: "Achtervoegsel (-ig/-lijk)", 13: "Kilowoord", 14: "Komma-s meervoud", 15: "Centwoord",
    16: "Komma-s diverse", 17: "Politiewoord", 18: "Colawoord", 19: "Tropisch woord", 20: "Taxiwoord",
    21: "Chefwoord", 22: "Theewoord", 23: "Caféwoord", 24: "Cadeauwoord", 25: "Routewoord",
    26: "Garagewoord", 27: "Lollywoord", 28: "Tremawoord", 29: "Militairwoord", 30: "Koppelteken",
    31: "Trottoirwoord", 32: "Tussen-e of -en", 33: "Apostrofwoord", 34: "Latijns voorvoegsel",
    35: "Samenstelling", 36: "Ei-plaat", 37: "Au-plaat"
};

const groupCategories = {
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 35, 36, 37],
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 35, 36, 37],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 35, 36, 37],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]
};
