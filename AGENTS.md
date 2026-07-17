# AGENTS.md — HeroQuest Character Sheet

## Project Overview

**HeroQuest** is a mobile-friendly digital character sheet for the classic German HeroQuest board game. It's a Vue 3 + Pinia single-page application (no backend) that persists character data to `localStorage` and supports JSON export/import for sharing between players.

**UI Language:** German (Persönlichkeits-Pass). All labels, buttons, and validation messages use German terms specific to the HeroQuest universe.

## Architecture

### Data Flow

```
skillSheetData.ts (game rules & options)
     ↓
Pinia Store (useSkillSheetStore)
     ↓
Vue Components (read state via storeToRefs, dispatch mutations)
     ↓
Computed Properties (derive displayed stats: bonuses, effective dice)
     ↓
Template Rendering + localStorage persistence
```

### Key Files & Responsibilities

| File | Purpose |
|------|---------|
| `src/data/skillSheetData.ts` | **Single source of truth** for all game data: 7 character classes, weapons, armor, special items with bonuses, restrictions, and item types. Never duplicate these definitions. |
| `src/stores/skillSheet.ts` | **Pinia store** managing character state (stats, equipment, items, quantities, charges). Auto-persisted via `pinia-plugin-persistedstate`. |
| `src/views/SkillSheet.vue` | **Main page** orchestrating save/load/end-game flows. Contains file I/O logic (`saveToFile()`, `loadFromFile()`). |
| `src/components/*.vue` | **Presentational components** (Header, Stats, Equipment, etc.) using Composition API `<script setup>`. |

### State Management Patterns

- **Use `storeToRefs(store)` in components** — wraps refs in reactive proxies for template binding
- **Computed properties with getters/setters** — `effectiveAttackDice` adds weapon bonus on read, subtracts on write (so base stats stay clean)
- **Array mutations** — use `.splice()` and `.push()` for arrays; avoid `.filter()` + reassignment in nested objects
- **Persistence is automatic** — all store mutations auto-save to `localStorage`; no manual `store.$patch()` needed except during file load

Example pattern from `SkillSheetStats.vue`:
```typescript
const { attackDice } = storeToRefs(store)
const effectiveAttackDice = computed({
  get: () => (attackDice.value ?? 0) + store.weaponBonus,
  set: (v: number) => { attackDice.value = v - store.weaponBonus }
})
```

## Game Rules & Domain Knowledge

### Character Classes & Starting Stats
7 characters (Barbar, Barde, Druide, Elf, Ritter, Zwerg, Zauberer) with unique base stats for Attack Dice, Defense Dice, Body Strength, Intelligence. **Stored in `defaultStats` lookup table** — always fetch from there, never hardcode values.

### Equipment Restrictions
- **Breitschwert (Broadsword):** Barbar only
- **Plattenrüstung (Plate Armor):** Barbar only
- **Stab der Magie + Ring der Magie:** Druide/Zauberer only
- **Amulett der Weisheit:** Barbar only
- **Zauberer cannot equip weapons** — this is enforced in `canEquipWeapon()` helper

### Bonus System
- **Weapon bonuses** applied to Attack Dice (cumulative, max 6)
- **Armor bonuses** applied to Defense Dice (cumulative, max 6)
- **Passive item bonuses** (e.g., Amulett +1 Intelligence) added via `intelligenceBonus` field; computed in store
- **Consumables** (potions) used up: either quantity-tracked or charge-tracked (1-use vs 2-use items)

### Item Types & Behaviors
- **heal-fixed / heal-potion:** Restore body strength (never above starting value)
- **attack-potion / defense-potion:** Boost dice temporarily (bounded 1–6)
- **fire-shield (Ring des Feuers):** 2-charge item, tracks uses in `itemChargesUsed` lookup
- **magic-ring (Ring der Magie):** 2-charge item for Druide/Zauberer
- **passive items:** Permanently active (no tracking), applied via store computed properties

### Death & Revival
- When **Body Strength = 0** → fullscreen death overlay appears
- Player selects revival Body Strength (1 to class default), overlay closes
- **End-of-game reset** restores all stats to class defaults but **keeps all equipment & items**

## Component Patterns

### Composition API + `<script setup>`
All components use Vue 3 Composition API with `<script setup>`. **No `<script>` block without `setup` attribute.**

```typescript
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
// imports here
</script>
```

### Derived State (Computed Properties)
- Use getter/setter pattern for **bidirectional binding** (e.g., effective dice subtracting bonuses)
- Use **dependencies in templates** for auto-updates (computed properties track reactivity)
- Avoid manual `.watch()` unless absolutely needed (prefer computed)

### Event Handlers
- Use `@click.prevent` for buttons inside forms; `@submit.prevent` for form submission
- Boolean logic in templates: `v-if="isDead"`, `v-show` for visibility toggles
- Disabled state: `:disabled="!character || effectiveAttackDice <= 1"`

### Scoped Styling
All components use `<style scoped>`. **Never use global selectors in component styles.**
- CSS variables for theme colors: `var(--color-red)`, `var(--hq-bg)`, etc. (defined in `src/assets/variables.css`)
- Dark/Light mode: system prefers-color-scheme handled via CSS variable swaps
- Mobile-first: breakpoints at `480px` and above

## Build & Development Workflow

```bash
npm run dev           # Start Vite dev server (hot reload)
npm run build         # Type-check + Vite build (for deployment)
npm run test:unit    # Vitest (jsdom environment)
npm run test:e2e     # Playwright tests (need `npx playwright install` first)
npm run lint         # Oxlint + ESLint (dual linting)
npm run format       # Prettier (src/ only)
```

### Key Build Configuration
- **Vite aliases:** `@` maps to `./src`
- **TypeScript strict mode:** Full type checking, no implicit `any`
- **Tailwind CSS v4:** via `@tailwindcss/vite` plugin
- **Vue DevTools:** Vite plugin included (dev only)

## File Format (Save/Load)

When users export a character, it's a `.json` file with this structure:
```json
{
  "name": "Hero Name",
  "character": "Zwerg",
  "attackDice": 2,
  "defenseDice": 3,
  "bodyStrength": 7,
  "intelligence": 3,
  "equippedWeapon": ["helm"],
  "equippedArmor": ["schild"],
  "equippedSpecialItems": ["ring-des-feuers"],
  "usedSpecialItems": [],
  "itemQuantities": {"heiltrank": 2},
  "itemChargesUsed": {"ring-des-feuers": 1}
}
```

**When loading:** `store.$patch({...data})` applies entire snapshot. **Validate IDs exist** in current game data before patching to prevent orphaned references.

## Testing Practices

### Unit Tests (Vitest)
- Located in `src/__tests__/` matching component names
- Use `describe()` and `it()` blocks
- Mount Vue components with `@vue/test-utils`
- Example: `mount(App)` and check template output

### E2E Tests (Playwright)
- Located in `e2e/` directory
- Test full user workflows (character creation, equipment changes, save/load)
- Must run `npm run build` first, then `npm run test:e2e`

## Code Conventions

### Naming
- **Files:** kebab-case (e.g., `SkillSheetStats.vue` not `skillSheetStats.vue`)
- **JavaScript variables/functions:** camelCase
- **CSS classes:** kebab-case or BEM in scoped contexts
- **Data IDs:** kebab-case (e.g., `'ork-kurzschwert'`, `'ring-des-feuers'`)

### TypeScript
- **Interfaces for data structures** — defined in `src/data/skillSheetData.ts` (`WeaponOption`, `ArmorOption`, `SpecialItemOption`)
- **Use `type` for simple unions**, `interface` for complex shapes
- **No implicit `any`** — always provide type hints

### German UI Text
- All user-facing text is in German (buttons, labels, error messages)
- Translatable strings hardcoded in component templates (no i18n framework)
- Common terms: Werte (stats), Ausrüstung (equipment), Gegenstände (items), Körperkraft (body strength), Angriffswürfel (attack dice)

## Common Tasks

### Adding a New Item Type
1. Add entry to `specialItemOptions` array in `skillSheetData.ts` with correct `kind`, `allowedCharacters`, and `maxUses`
2. Add UI rendering logic in `SkillSheetEquipment.vue` template if new layout needed
3. If item has charges, hook into `itemChargesUsed` ref
4. If passive bonus, add `passive: true` and `intelligenceBonus` to definition

### Modifying Equipment Bonuses
1. Update `weaponOptions` or `armorOptions` in `skillSheetData.ts`
2. Computed properties in store (`weaponBonus`, `armorBonus`) automatically recalculate
3. Components using `effectiveAttackDice` or `effectiveDefenseDice` automatically re-render

### Changing Character Restrictions
1. Edit `allowedCharacters` array in item definition (`null` = unrestricted)
2. Restriction helpers in `SkillSheetEquipment.vue` (`canEquipWeapon()`, etc.) automatically filter options
3. Template `v-if` bindings prevent equipping restricted items

### Fixing Display Bugs
- **Stats not updating?** → Check if computed property is reactive (use `storeToRefs()`)
- **Equipment not showing?** → Verify `allowedCharacters` restriction or item visibility logic
- **Save/load broken?** → Inspect JSON structure in `saveToFile()` and `loadFromFile()` in `SkillSheet.vue`

## Linting & Code Quality

- **Oxlint** (Rust-based, fast) — runs first for performance
- **ESLint** with Prettier — runs after for Vue/TypeScript specifics
- **No console warnings** — watch build output for unused imports or type issues
- **.oxlintrc.json** configures Oxlint rules (custom config file in project root)

## Debugging Tips

1. **Vue DevTools:** Installed via Vite plugin during dev
2. **Pinia DevTools:** Inspect store state mutations in browser console
3. **Vitest UI:** Run `npx vitest --ui` to see test coverage in browser
4. **localStorage inspection:** Open DevTools → Application → localStorage → `file://` entry to see persisted store
5. **Character restrictions failing?** → Log `canEquipWeapon(item)` in template or add breakpoint in helper function

---

**Last Updated:** July 2026 | **Framework:** Vue 3 (Composition API) + Pinia + Tailwind CSS v4 | **Target:** German HeroQuest players

