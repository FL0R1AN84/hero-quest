export interface WeaponOption {
  id: string
  label: string
  note: string | null
  bonus: number
  allowedCharacters: string[] | null
  /** id of the expansion this card belongs to; omitted/undefined = base game */
  expansion?: string
}

export interface ArmorOption {
  id: string
  label: string
  bonus: number
  allowedCharacters: string[] | null
  /** id of the expansion this card belongs to; omitted/undefined = base game */
  expansion?: string
}

export interface SpecialItemOption {
  id: string
  label: string
  symbol: string
  ability: string
  allowedCharacters: string[] | null
  passive?: boolean
  intelligenceBonus?: number
  /** 'heal-potion' | 'attack-potion' | 'defense-potion' | 'fire-shield' | 'magic-ring' */
  kind?: string
  /** max uses before fully consumed (e.g. 2 for Ring des Feuers) */
  maxUses?: number
  /** optional static bonus label shown in the item box */
  bonusLabel?: string
  /** button text for stackable 'consumable' items */
  useLabel?: string
  /** id of the expansion this card belongs to; omitted/undefined = base game */
  expansion?: string
}

export interface ExpansionOption {
  id: string
  label: string
  symbol: string
}

/**
 * Registry of all available game expansions. New expansions are added here;
 * cards (weapons/armor/special items) reference them via their `expansion` field
 * and are only shown once the player enables the expansion (see store `enabledExpansions`).
 */
export const expansionOptions: ExpansionOption[] = [
  { id: 'der-eisige-schrecken', label: 'Der eisige Schrecken', symbol: '❄️' },
]

export const characterOptions = [
  'Barbar',
  'Barbarin',
  'Barde',
  'Berserker',
  'Druide',
  'Elf',
  'Ritter',
  'Zwerg',
  'Zauberer',
]

/** Heroes that only become selectable once their expansion is enabled (character name → expansion id) */
export const expansionCharacters: Record<string, string> = {
  Barbarin: 'der-eisige-schrecken',
}

export interface MercenaryOption {
  id: string
  label: string
  symbol: string
  expansion: string
  movement: number
  attackDice: number
  defenseDice: number
  bodyStrength: number
  intelligence: number
  ability: string | null
}

/** Söldner: hired per adventure, extra board figures (no equipment/items) */
export const mercenaryOptions: MercenaryOption[] = [
  {
    id: 'armbrustschuetze',
    label: 'Armbrustschütze',
    symbol: '🏹',
    expansion: 'der-eisige-schrecken',
    movement: 6,
    attackDice: 3,
    defenseDice: 3,
    bodyStrength: 2,
    intelligence: 2,
    ability: 'Kann aus der Entfernung mit der Armbrust angreifen',
  },
  {
    id: 'hellebardistin',
    label: 'Hellebardistin',
    symbol: '🔱',
    expansion: 'der-eisige-schrecken',
    movement: 6,
    attackDice: 3,
    defenseDice: 3,
    bodyStrength: 2,
    intelligence: 2,
    ability: 'Kann mit der Hellebarde auch diagonal angreifen',
  },
  {
    id: 'spaeherin',
    label: 'Späherin',
    symbol: '🏃‍♀️',
    expansion: 'der-eisige-schrecken',
    movement: 9,
    attackDice: 2,
    defenseDice: 3,
    bodyStrength: 2,
    intelligence: 2,
    ability: 'Darf Fallen suchen und entschärfen',
  },
  {
    id: 'schwertkaempfer',
    label: 'Schwertkämpfer',
    symbol: '🗡️',
    expansion: 'der-eisige-schrecken',
    movement: 5,
    attackDice: 4,
    defenseDice: 5,
    bodyStrength: 2,
    intelligence: 2,
    ability: null,
  },
]

export const characterAvatars: Record<string, { symbol: string; color: string }> = {
  Barbarin: { symbol: '⚔️', color: 'var(--color-red)' },
  Barbar: { symbol: '⚔️', color: 'var(--color-red)' },
  Barde: { symbol: '📯', color: 'var(--color-blue)' },
  Berserker: { symbol: '🪓', color: 'var(--color-red)' },
  Druide: { symbol: '🧙', color: 'var(--color-green)' },
  Elf: { symbol: '🧝‍♂️', color: 'var(--color-green)' },
  Ritter: { symbol: '🏰', color: 'var(--color-yellow)' },
  Zwerg: { symbol: '⚒️', color: 'var(--color-yellow)' },
  Zauberer: { symbol: '🪄', color: 'var(--color-blue)' },
}

export const defaultStats: Record<
  string,
  { attackDice: number; defenseDice: number; bodyStrength: number; intelligence: number }
> = {
  Barbarin: { attackDice: 3, defenseDice: 2, bodyStrength: 8, intelligence: 2 },
  Barbar: { attackDice: 3, defenseDice: 2, bodyStrength: 8, intelligence: 2 },
  Barde: { attackDice: 2, defenseDice: 2, bodyStrength: 5, intelligence: 4 },
  Berserker: { attackDice: 3, defenseDice: 2, bodyStrength: 7, intelligence: 2 },
  Druide: { attackDice: 1, defenseDice: 2, bodyStrength: 6, intelligence: 4 },
  Elf: { attackDice: 2, defenseDice: 2, bodyStrength: 6, intelligence: 4 },
  Ritter: { attackDice: 2, defenseDice: 3, bodyStrength: 7, intelligence: 2 },
  Zwerg: { attackDice: 2, defenseDice: 2, bodyStrength: 7, intelligence: 3 },
  Zauberer: { attackDice: 1, defenseDice: 2, bodyStrength: 4, intelligence: 6 },
}

export interface CharacterSkill {
  id: string
  name: string
  symbol: string
  requirement?: string
  description: string
}

export const characterSkills: Partial<Record<string, CharacterSkill[]>> = {
  Berserker: [
    {
      id: 'berserker-wut',
      name: 'Erzürnung',
      symbol: '😡',
      description:
        'Als Aktion darfst du bis zu 2 Körperpunkte opfern und sofort angreifen. Du erhältst so viele zusätzliche Angriffswürfel, wie du Körperpunkte verloren hast.',
    },
    {
      id: 'berserker-vergeltung',
      name: 'Vergeltung',
      symbol: '😵',
      requirement: 'Nur bei 5 oder weniger Körperpunkten.',
      description: 'Fügt dir ein benachbartes Monster Schaden zu, darfst du sofort zurückschlagen.',
    },
    {
      id: 'berserker-raserei',
      name: 'Raserei',
      symbol: '😤',
      requirement: 'Nur bei 3 oder weniger Körperpunkten.',
      description:
        'Als Aktion führst du einen einzigen Rundumschlag gegen alle Monster orthogonal und diagonal um dich herum aus.',
    },
  ],
}

export const weaponOptions: WeaponOption[] = [
  {
    id: 'armbrust',
    label: 'Armbrust',
    note: 'Mit diesem scharfen Messer können Sie tödlich treffen',
    bonus: 2,
    allowedCharacters: null,
  },
  {
    id: 'breitschwert',
    label: 'Breitschwert',
    note: null,
    bonus: 2,
    allowedCharacters: ['Barbar', 'Barbarin', 'Berserker'],
  },
  {
    id: 'dolch',
    label: 'Dolch',
    note: 'Mit diesem scharfen Messer können Sie tödlich treffen',
    bonus: 1,
    allowedCharacters: null,
  },
  {
    id: 'geisterschwert',
    label: 'Geisterschwert',
    note: 'Magisches Schwert mit geheimen Kräften',
    bonus: 2,
    allowedCharacters: null,
  },
  {
    id: 'handbeil',
    label: 'Handbeil',
    note: 'Eine vielseitige Waffe für jeden Fall',
    bonus: 2,
    allowedCharacters: null,
  },
  { id: 'kurzschwert', label: 'Kurzschwert', note: null, bonus: 1, allowedCharacters: null },
  {
    id: 'langschwert',
    label: 'Langschwert',
    note: 'Kann auch diagonal angreifen',
    bonus: 1,
    allowedCharacters: null,
  },
  {
    id: 'langschwert-des-gluecks',
    label: 'Langschwert des Glücks',
    note: 'Verschafft zusätzliche Angriffsmöglichkeiten',
    bonus: 2,
    allowedCharacters: null,
  },
  {
    id: 'ork-kurzschwert',
    label: 'Ork-Kurzschwert',
    note: 'Orks können zweimal hintereinander angegriffen werden',
    bonus: 1,
    allowedCharacters: null,
  },
  {
    id: 'phantomklinge',
    label: 'Phantomklinge',
    note: 'Unsichtbare Waffe mit phänomenalem Angriff',
    bonus: 3,
    allowedCharacters: null,
  },
  {
    id: 'stab',
    label: 'Stab',
    note: 'Dank diesen langen und hölzernen Stabs erhältst du die Angriffskraft von 2. Dieser Stab kann diagonal angreifen, dank eines Stabes eingesetzt kannst du keinen Schild verwenden',
    bonus: 2,
    allowedCharacters: null,
  },
  { id: 'streitaxt', label: 'Streitaxt', note: null, bonus: 2, allowedCharacters: null },
  {
    id: 'stab-des-zauberers',
    label: 'Stab des Zauberers',
    note: 'Verstärkt Zauberkraft',
    bonus: 2,
    allowedCharacters: ['Druide', 'Zauberer'],
  },
  {
    id: 'telekinese-stab',
    label: 'Telekinese-Stab',
    note: 'Ermöglicht Angriffe aus der Ferne',
    bonus: 2,
    allowedCharacters: ['Druide', 'Zauberer'],
  },
]

export const armorOptions: ArmorOption[] = [
  { id: 'armbrust', label: 'Armbrust', bonus: 1, allowedCharacters: null },
  { id: 'armschutz', label: 'Armschutz', bonus: 1, allowedCharacters: null },
  { id: 'armpanzer', label: 'Armpanzer', bonus: 1, allowedCharacters: null },
  { id: 'borins-ruestung', label: 'Borins Rüstung', bonus: 3, allowedCharacters: null },
  { id: 'harnisch', label: 'Harnisch', bonus: 2, allowedCharacters: null },
  { id: 'helm', label: 'Helm', bonus: 1, allowedCharacters: null },
  { id: 'kettenhemd', label: 'Kettenhemd', bonus: 1, allowedCharacters: null },
  { id: 'plattenruestung', label: 'Plattenrüstung', bonus: 2, allowedCharacters: ['Barbar', 'Barbarin'] },
  { id: 'schild', label: 'Schild', bonus: 1, allowedCharacters: null },
]

export const specialItemOptions: SpecialItemOption[] = [
  {
    id: 'werkzeug',
    label: 'Werkzeug',
    symbol: '🔧',
    ability: 'Entschärft eine mechanische Falle; danach ist das Werkzeug verbraucht',
    allowedCharacters: null,
    kind: 'consumable',
    useLabel: '🔧 Falle entschärfen',
  },
  {
    id: 'stab-der-magie',
    label: 'Stab der Magie',
    symbol: '🪄',
    ability: '2× hintereinander zaubern',
    allowedCharacters: ['Druide', 'Zauberer'],
    bonusLabel: '2× 🪄',
  },
  {
    id: 'ring-der-magie',
    label: 'Ring der Magie',
    symbol: '💍',
    ability: '1. Verwendung: Zauber speichern · 2. Verwendung: Zauber abfeuern',
    allowedCharacters: ['Druide', 'Zauberer'],
    kind: 'magic-ring',
    maxUses: 2,
  },
  {
    id: 'amulett-der-weisheit',
    label: 'Amulett der Weisheit',
    symbol: '📿',
    ability: 'Dauerhaft +1 Intelligenz',
    allowedCharacters: null,
    passive: true,
    intelligenceBonus: 1,
  },
  // ── Universelle Gegenstände (alle Helden) ────────────
  {
    id: 'heiltrank',
    label: 'Heiltrank',
    symbol: '🧪',
    ability: 'Stellt immer genau +4 Körperkraft wieder her (nie über Startwert)',
    allowedCharacters: null,
    kind: 'heal-fixed',
  },
  {
    id: 'heiltrank-gewuerfelt',
    label: 'Heiltrank (Würfel)',
    symbol: '🎲',
    ability: 'Würfle 1W6 – heilt genau das gewürfelte Ergebnis (nie über Startwert)',
    allowedCharacters: null,
    kind: 'heal-potion',
  },
  {
    id: 'staerketrank',
    label: 'Stärketrank',
    symbol: '💪',
    ability: '+2 Angriffswürfel (max. 6)',
    allowedCharacters: null,
    kind: 'attack-potion',
  },
  {
    id: 'verteidigungstrank',
    label: 'Immuntrank',
    symbol: '🛡️',
    ability: '+2 Verteidigungswürfel (max. 6)',
    allowedCharacters: null,
    kind: 'defense-potion',
  },
  {
    id: 'ring-des-feuers',
    label: 'Ring des Feuers',
    symbol: '🔥',
    ability: 'Wehrt 2 Feuerzauber ab',
    allowedCharacters: null,
    kind: 'fire-shield',
    maxUses: 2,
  },
  // ── Neue Gegenstände (vom Benutzer angefragt) ───────────
  {
    id: 'kampfestrank',
    label: 'Kampfestrank',
    symbol: '🥊',
    ability: 'Erlaubt ein 2. Mal die Kampfwürfel zu würfeln (gegen denselben Gegner)',
    allowedCharacters: null,
    kind: 'extra-attack-same',
  },
  {
    id: 'geschicklichkeitstrank',
    label: 'Geschicklichkeitstrank',
    symbol: '🏃',
    ability: '+5 Bewegungspunkte (temporär)',
    allowedCharacters: null,
    kind: 'movement-potion',
    bonusLabel: '+5 ⇢',
  },
  {
    id: 'wiederherstellungstrank',
    label: 'Wiederherstellungstrank',
    symbol: '🔄',
    ability: 'Stellt +1 Körperkraft und +1 Intelligenz wieder her (nie über Startwert)',
    allowedCharacters: null,
    kind: 'restore-small',
  },
  {
    id: 'gegengift',
    label: 'Gegengift',
    symbol: '🧪',
    ability: 'Heilt +2 Körperkraft (nie über Startwert)',
    allowedCharacters: null,
    kind: 'heal-fixed-2',
  },
  {
    id: 'staerkungstrank-dual',
    label: 'Stärkungstrank',
    symbol: '⚡',
    ability: 'Erlaubt 2× Angriffswürfel zu werfen — kann gegen 2 Gegner eingesetzt werden',
    allowedCharacters: null,
    kind: 'extra-attack-multi',
  },
  // ── Neue Gegenstände von Board-Game Karten ───────────
  {
    id: 'elixier-des-lebens',
    label: 'Elixier des Lebens',
    symbol: '🧴',
    ability: 'Stellt alle verlorenen Körperkraft-Punkte wieder her',
    allowedCharacters: null,
    kind: 'heal-fixed',
    bonusLabel: 'Vollständig ❤️',
  },
  {
    id: 'fluch-der-orks',
    label: 'Fluch der Orks',
    symbol: '💀',
    ability: 'Ruft die Macht der Orks an – bei Benutzung: 2× Angriffswürfel gegen einen Gegner',
    allowedCharacters: null,
    kind: 'extra-attack-same',
  },
  {
    id: 'geweihtes-wasser',
    label: 'Geweihtes Wasser',
    symbol: '💧',
    ability: 'Stellt Körperkraft wieder her und hilft gegen Zaubervergiftung',
    allowedCharacters: null,
    kind: 'heal-fixed',
    bonusLabel: '+3 ❤️',
  },
  {
    id: 'mantel-des-zauberers',
    label: 'Mantel des Zauberers',
    symbol: '🧥',
    ability: 'Dauerhaft +1 Intelligenz',
    allowedCharacters: ['Druide', 'Zauberer'],
    passive: true,
    intelligenceBonus: 1,
  },
  {
    id: 'ring-der-rueckkehr',
    label: 'Ring der Rückkehr',
    symbol: '💫',
    ability: 'Gestattet Rückkehr zum Startpunkt der Aufgabe',
    allowedCharacters: null,
  },
  {
    id: 'ring-der-staerke',
    label: 'Ring der Stärke',
    symbol: '💪',
    ability: 'Dauerhaft +1 Angriffswürfel',
    allowedCharacters: null,
    passive: true,
    bonusLabel: '+1 ⚔️',
  },
  // ── Magischer Wurfdolch & Schriftrollen (Artefaktübersicht) ──
  {
    id: 'magischer-wurfdolch',
    label: 'Magischer Wurfdolch',
    symbol: '🗡️',
    ability:
      'Verursacht 1 Körperkraft-Verlust bei einem Monster in Sichtlinie; keine Verteidigung möglich. Nach dem Wurf verloren',
    allowedCharacters: null,
    kind: 'consumable',
    useLabel: '🗡️ Dolch werfen',
  },
  {
    id: 'schriftrolle-heilzauber',
    label: 'Schriftrolle: Heilzauber',
    symbol: '📜',
    ability:
      'Heilt einen beliebigen Helden (auch dich selbst) um bis zu 4 verlorene Körperkraft-Punkte, nie über den Startwert. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
  },
  {
    id: 'schriftrolle-umwetter',
    label: 'Schriftrolle: Umwetter',
    symbol: '📜',
    ability: 'Ein Monster deiner Wahl muss die nächste Runde aussetzen. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
  },
  {
    id: 'schriftrolle-feuerkugel',
    label: 'Schriftrolle: Feuerkugel',
    symbol: '📜',
    ability:
      'Ein Monster verliert 2 Körperkraft; es wirft 2 rote Würfel, jede 5 oder 6 reduziert den Verlust um 1. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
  },
  {
    id: 'schriftrolle-tapferkeit',
    label: 'Schriftrolle: Tapferkeit',
    symbol: '📜',
    ability:
      'Ein beliebiger Held (auch du selbst) wirft beim nächsten Angriff 2 zusätzliche Kampfwürfel. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
  },
  {
    id: 'schriftrolle-flammende-wut',
    label: 'Schriftrolle: Flammende Wut',
    symbol: '📜',
    ability:
      'Ein Monster verliert 1 Körperkraft, sofern es nicht sofort mit 1 roten Würfel eine 5 oder 6 würfelt. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
  },
  {
    id: 'schriftrolle-schlafzauber',
    label: 'Schriftrolle: Schlafzauber',
    symbol: '📜',
    ability:
      'Versetzt ein Monster in tiefen Schlaf (kein Marschieren, Angreifen oder Verteidigen); Bann bricht bei einer 6 auf 1 roten Würfel je Intelligenz-Punkt. Nicht gegen Mumien, Zombies, Skelette. Zerfällt zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
  },
  {
    id: 'schriftrolle-granithaut',
    label: 'Schriftrolle: Granithaut',
    symbol: '📜',
    ability:
      'Ein beliebiger Held (auch du selbst) wirft bei der Verteidigung 1 zusätzlichen Kampfwürfel; endet bei Verlust von 1 Körperkraft. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
  },
  {
    id: 'schriftrolle-flaschengeist',
    label: 'Schriftrolle: Flaschengeist',
    symbol: '📜',
    ability:
      'Öffnet eine beliebige Tür auf dem Spielplan oder setzt 5 Kampfwürfel gegen ein Monster in deiner Sichtlinie ein. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
  },
  // ── Der eisige Schrecken ────────────────────────────
  {
    id: 'amulett-des-nordens',
    label: '❄️ Amulett des Nordens',
    symbol: '📿',
    ability: 'Dauerhaft +2 Körperkraft und +1 Intelligenz',
    allowedCharacters: ['Barbar', 'Barbarin'],
    passive: true,
    intelligenceBonus: 1,
    bonusLabel: '+2 ❤️',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'armband-aus-eis',
    label: '❄️ Armband aus Eis',
    symbol: '🧊',
    ability:
      'Schützt vor Gehirnfrost und Kältezaubern sowie vor Schaden durch Eisgewölbe und eisige Flüsse; verringert Schaden durch Eissturm um 1',
    allowedCharacters: null,
    passive: true,
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'ring-der-waerme',
    label: '❄️ Ring der Wärme',
    symbol: '💍',
    ability: 'Schützt vor Kältezaubern und den Auswirkungen von Eisgewölben und eisigen Flüssen',
    allowedCharacters: null,
    passive: true,
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'schneeschuhe-der-geschwindigkeit',
    label: '❄️ Schneeschuhe der Geschwindigkeit',
    symbol: '🥾',
    ability:
      'Erhöhen die Bewegung um 2 Felder und verhindern das Ausrutschen auf Glatteis; nur in eisigen Abenteuern verwendbar',
    allowedCharacters: null,
    passive: true,
    bonusLabel: '+2 👣',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'schriftrolle-abkuehlung',
    label: '❄️ Schriftrolle: Abkühlung',
    symbol: '📜',
    ability:
      'Verursacht bei einem angrenzenden Monster 1 Körperkraft-Schaden; keine Verteidigung möglich. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'schriftrolle-eisbruecke',
    label: '❄️ Schriftrolle: Eisbrücke',
    symbol: '📜',
    ability:
      'Erzeugt eine dauerhafte Brücke aus magischem Eis, über die Gruben, Fallen, Schluchten und eisige Felder überquert werden können. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'schriftrolle-eissturm',
    label: '❄️ Schriftrolle: Eissturm',
    symbol: '📜',
    ability:
      'Greift alle Figuren in einem Bereich von 2 × 2 Feldern mit 3 Kampfwürfeln an; keine Verteidigung möglich. Nicht in Korridoren einsetzbar. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'schriftrolle-psychische-erholung',
    label: '❄️ Schriftrolle: Psychische Erholung',
    symbol: '📜',
    ability:
      'Stellt dem Anwender oder einem gewählten Helden alle verlorenen Intelligenzpunkte wieder her. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'schriftrolle-schlittschuh',
    label: '❄️ Schriftrolle: Schlittschuh',
    symbol: '📜',
    ability:
      'Der Anwender zählt in dieser Runde 6 zur Bewegungswürfelzahl hinzu und darf durch Helden und Monster hindurchgehen. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'schriftrolle-waerme',
    label: '❄️ Schriftrolle: Wärme',
    symbol: '📜',
    ability:
      'Stellt dem Anwender oder einem gewählten Helden bis zu 3 verlorene Körperkraftpunkte wieder her. Zerfällt nach der Verwendung zu Staub',
    allowedCharacters: null,
    kind: 'scroll',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'trank-der-kampfeswut',
    label: '❄️ Trank der Kampfeswut',
    symbol: '🔥',
    ability: 'Der Barbar darf zwei Angriffe pro Runde ausführen, solange Monster in Sichtweite sind',
    allowedCharacters: ['Barbar', 'Barbarin'],
    kind: 'extra-attack-same',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'trank-der-eisigen-staerke',
    label: '❄️ Trank der eisigen Stärke',
    symbol: '🧊',
    ability: 'Der nächste Angriff verursacht doppelten Körperkraft-Schaden entsprechend den gewürfelten Treffern',
    allowedCharacters: ['Barbar', 'Barbarin'],
    kind: 'extra-attack-same',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'verjuengungstrank',
    label: '❄️ Verjüngungstrank',
    symbol: '🧪',
    ability: 'Würfle 1 roten Würfel – so viele Körperkraftpunkte kehren zurück (nie über Startwert)',
    allowedCharacters: null,
    kind: 'heal-potion',
    expansion: 'der-eisige-schrecken',
  },
  {
    id: 'trank-der-frosthaut',
    label: '❄️ Trank der Frosthaut',
    symbol: '🛡️',
    ability: 'Der Barbar erhält beim Verteidigen 2 zusätzliche Kampfwürfel, solange Monster in Sichtweite sind',
    allowedCharacters: ['Barbar', 'Barbarin'],
    kind: 'defense-potion',
    expansion: 'der-eisige-schrecken',
  },
]
