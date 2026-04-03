# ⚔️ HeroQuest — Persönlichkeits-Pass

> **Note:** The user interface of this app is entirely in **German**, as it is designed for the German edition of the HeroQuest board game.

A mobile-friendly digital character sheet (*Persönlichkeits-Pass*) for the classic fantasy board game **HeroQuest**. Built with Vue 3, Vite, TypeScript, Pinia, and Tailwind CSS.

---

## About the App

This web app lets HeroQuest players manage their hero's character sheet directly in the browser — no paper required. It covers all the essential information a hero needs during a quest:

- **Hero name & character class** — choose from Barbar, Barde, Druide, Elf, Ritter, Zwerg, or Zauberer
- **Core stats** — Attack Dice (*Angriffswürfel*), Defense Dice (*Verteidigungswürfel*), Body Strength (*Körperkraft*), and Intelligence (*Intelligenz*) are pre-filled with the class defaults and can be adjusted freely
- **Equipment** — equip weapons, armor pieces, and special items; bonuses are calculated automatically and reflected in the displayed stats
- **Special items** — track one-time-use magic items (e.g. *Stab der Magie*, *Ring der Magie*); mark them as used and restore them if needed
- **Persistent state** — all data is automatically saved in the browser via `localStorage`; nothing is lost on a page refresh
- **Save & Load** — export the full character sheet as a `.json` file and reload it later (or share it with others)

---

## Characters & Stats

| Character   | Attack Dice | Defense Dice | Body Strength | Intelligence |
|-------------|:-----------:|:------------:|:-------------:|:------------:|
| Barbar      | 3           | 2            | 8             | 2            |
| Barde       | 2           | 2            | 5             | 4            |
| Druide      | 1           | 2            | 6             | 4            |
| Elf         | 2           | 2            | 6             | 4            |
| Ritter      | 2           | 3            | 7             | 2            |
| Zwerg       | 2           | 2            | 7             | 3            |
| Zauberer    | 1           | 2            | 4             | 6            |

> Weapon and armor bonuses are added on top of these base values automatically.

---

## Tech Stack

| Layer       | Technology                         |
|-------------|-----------------------------------|
| Framework   | [Vue 3](https://vuejs.org/) (Composition API) |
| Build tool  | [Vite](https://vite.dev/)         |
| Language    | TypeScript                        |
| State       | [Pinia](https://pinia.vuejs.org/) with `pinia-plugin-persistedstate` |
| Styling     | [Tailwind CSS](https://tailwindcss.com/) + scoped CSS variables |
| Unit tests  | [Vitest](https://vitest.dev/)     |
| E2E tests   | [Playwright](https://playwright.dev/) |

---

## Project Setup

```sh
npm install
```

### Development server

```sh
npm run dev
```

### Type-check, compile and minify for production

```sh
npm run build
```

### Run unit tests

```sh
npm run test:unit
```

### Run end-to-end tests

```sh
# Install browsers (first time only)
npx playwright install

# Build first when running on CI
npm run build

# Run all e2e tests
npm run test:e2e

# Run only on Chromium
npm run test:e2e -- --project=chromium
```

### Lint

```sh
npm run lint
```

---

## Project Structure

```
src/
├── components/
│   ├── SkillSheetHeader.vue       # App title and ornament bar
│   ├── SkillSheetHeroFields.vue   # Hero name + character class selector
│   ├── SkillSheetAvatar.vue       # Character avatar / icon display
│   ├── SkillSheetStats.vue        # The four diamond-shaped stat fields
│   └── SkillSheetEquipment.vue    # Weapons, armor, and special items
├── data/
│   └── skillSheetData.ts          # All game data (characters, items, stats)
├── stores/
│   └── skillSheet.ts              # Pinia store with persistence
├── views/
│   └── SkillSheet.vue             # Main page view (save/load logic)
└── router/
    └── index.ts                   # Vue Router setup
```

---

## Save File Format

The exported `.json` file contains the full character state and can be re-imported at any time:

```json
{
  "name": "Thorin",
  "character": "Zwerg",
  "attackDice": 2,
  "defenseDice": 2,
  "bodyStrength": 7,
  "intelligence": 3,
  "equippedWeapon": ["kurzschwert"],
  "equippedArmor": ["helm", "schild"],
  "equippedSpecialItems": [],
  "usedSpecialItems": []
}
```
