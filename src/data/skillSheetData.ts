export interface WeaponOption {
  id: string
  label: string
  note: string | null
  bonus: number
  allowedCharacters: string[] | null
}

export interface ArmorOption {
  id: string
  label: string
  bonus: number
  allowedCharacters: string[] | null
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
}

export const characterOptions = ['Barbar', 'Barde', 'Druide', 'Elf', 'Ritter', 'Zwerg', 'Zauberer']

export const characterAvatars: Record<string, { symbol: string; color: string }> = {
  Barbar: { symbol: '⚔️', color: 'var(--color-red)' },
  Barde: { symbol: '📯', color: 'var(--color-blue)' },
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
  Barbar: { attackDice: 3, defenseDice: 2, bodyStrength: 8, intelligence: 2 },
  Barde: { attackDice: 2, defenseDice: 2, bodyStrength: 5, intelligence: 4 },
  Druide: { attackDice: 1, defenseDice: 2, bodyStrength: 6, intelligence: 4 },
  Elf: { attackDice: 2, defenseDice: 2, bodyStrength: 6, intelligence: 4 },
  Ritter: { attackDice: 2, defenseDice: 3, bodyStrength: 7, intelligence: 2 },
  Zwerg: { attackDice: 2, defenseDice: 2, bodyStrength: 7, intelligence: 3 },
  Zauberer: { attackDice: 1, defenseDice: 2, bodyStrength: 4, intelligence: 6 },
}

export const weaponOptions: WeaponOption[] = [
  { id: 'breitschwert', label: 'Breitschwert', note: null, bonus: 2, allowedCharacters: ['Barbar'] },
  {
    id: 'langschwert',
    label: 'Langschwert',
    note: 'Kann auch diagonal angreifen',
    bonus: 1,
    allowedCharacters: null,
  },
  { id: 'streitaxt', label: 'Streitaxt', note: null, bonus: 2, allowedCharacters: null },
  { id: 'kurzschwert', label: 'Kurzschwert', note: null, bonus: 1, allowedCharacters: null },
  {
    id: 'ork-kurzschwert',
    label: 'Ork-Kurzschwert',
    note: 'Orks können zweimal hintereinander angegriffen werden',
    bonus: 1,
    allowedCharacters: null,
  },
]

export const armorOptions: ArmorOption[] = [
  { id: 'helm', label: 'Helm', bonus: 1, allowedCharacters: null },
  { id: 'plattenruestung', label: 'Plattenrüstung', bonus: 2, allowedCharacters: ['Barbar'] },
  { id: 'kettenhemd', label: 'Kettenhemd', bonus: 1, allowedCharacters: null },
  { id: 'schild', label: 'Schild', bonus: 1, allowedCharacters: null },
  { id: 'armpanzer', label: 'Armpanzer', bonus: 1, allowedCharacters: null },
]

export const specialItemOptions: SpecialItemOption[] = [
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
    allowedCharacters: ['Barbar'],
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
    ability: '+1 Angriffswürfel (max. 6)',
    allowedCharacters: null,
    kind: 'attack-potion',
  },
  {
    id: 'verteidigungstrank',
    label: 'Verteidigungstrank',
    symbol: '🛡️',
    ability: '+1 Verteidigungswürfel (max. 6)',
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
]
