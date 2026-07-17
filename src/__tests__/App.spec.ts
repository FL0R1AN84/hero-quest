import { describe, expect, it } from 'vitest'

import { characterAvatars, characterOptions, defaultStats, weaponOptions } from '@/data/skillSheetData'

describe('skillSheetData', () => {
  it('includes Berserker as selectable hero with the correct stats', () => {
    expect(characterOptions).toContain('Berserker')
    expect(defaultStats.Berserker).toEqual({
      attackDice: 3,
      defenseDice: 2,
      bodyStrength: 7,
      intelligence: 2,
    })
    expect(characterAvatars.Berserker).toEqual({
      symbol: '🪓',
      color: 'var(--color-red)',
    })
  })

  it('allows the Berserker to equip the Breitschwert', () => {
    expect(weaponOptions.find((weapon) => weapon.id === 'breitschwert')?.allowedCharacters).toContain('Berserker')
  })
})
