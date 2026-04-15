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
  },
  {
    id: 'ring-der-magie',
    label: 'Ring der Magie',
    symbol: '💍',
    ability: 'Klont einen Zauber und speichert ihn im Ring',
    allowedCharacters: ['Druide', 'Zauberer'],
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
]
