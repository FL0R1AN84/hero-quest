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
| `src/data/skillSheetData.ts` | **Single source of truth** for all game data: 8 character classes, weapons, armor, special items with bonuses, restrictions, and item types. Also exports `characterAvatars` (symbol + color per class) and `expansionOptions` (registry of game expansions, e.g. "Der eisige Schrecken"). Never duplicate these definitions. |
| `src/stores/skillSheet.ts` | **Pinia store** managing character state (stats, equipment, items, quantities, charges, Druide shape-shift, `enabledExpansions`). Auto-persisted via `pinia-plugin-persistedstate`. |
| `src/views/SkillSheet.vue` | **Main page** orchestrating save/load/end-game flows. Contains file I/O logic (`saveToFile()`, `loadFromFile()`). |
| `src/components/*.vue` | **Presentational components** (Header, Stats, Equipment, etc.) using Composition API `<script setup>`. |
| `src/components/SkillSheetSkills.vue` | **Character skills** — Berserker-only one-use skills (Erzürnung, Vergeltung, Raserei) from `characterSkills`; used state in `store.usedSkills`, cleared only by `resetStats()` / `reset()`. |
| `src/components/KillListModal.vue` | **Kill list tracker** — modal dialog for recording monster kills by match day, with animations and persistent storage. |
| `src/components/ExpansionsModal.vue` | **Expansion manager** — modal dialog (📖 button, top-left of header) to enable/disable game expansions (`store.enabledExpansions`); multiple expansions can be active at once. |
| `src/components/AppUpdatePrompt.vue` | **PWA update banner** — listens for `sw-update-available` custom event, prompts user to reload for new version. Shows the new version number and release notes fetched from `/version.json`. |
| `src/components/AppWhatsNew.vue` | **"What's new" sheet** — shown once after a version change (compares `__APP_VERSION__` with `localStorage['hq-last-seen-version']`; silent on first start); lists `__RELEASE_NOTES__` via `ReleaseNotesList.vue`. |
| `src/components/AppVersion.vue` | **Version display** — shows `package.json` version; 5× click reveals a hidden full-reset button (`store.reset()`). |

### State Management Patterns

- **Use `storeToRefs(store)` in components** — wraps refs in reactive proxies for template binding
- **Computed properties with getters/setters** — `effectiveAttackDice` adds weapon bonus on read, subtracts on write (so base stats stay clean)
- **Array mutations** — use `.splice()` and `.push()` for arrays; avoid `.filter()` + reassignment in nested objects
- **Persistence is automatic** — all store mutations auto-save to `localStorage`; no manual `store.$patch()` needed except during file load

Example pattern from `SkillSheetStats.vue`:
```typescript
const { attackDice } = storeToRefs(store)
const effectiveAttackDice = computed({
  get: () => (attackDice.value ?? 0) + store.weaponBonus + store.druideShapeBonus,
  set: (v: number) => { attackDice.value = v - store.weaponBonus - store.druideShapeBonus }
})
```

## Game Rules & Domain Knowledge

### Character Classes & Starting Stats
8 characters (Barbar, Barde, Berserker, Druide, Elf, Ritter, Zwerg, Zauberer) with unique base stats for Attack Dice, Defense Dice, Body Strength, Intelligence. **Stored in `defaultStats` lookup table** — always fetch from there, never hardcode values. Each class also has an emoji avatar and theme color defined in `characterAvatars`.

### Equipment Restrictions
- **Breitschwert (Broadsword):** Barbar and Berserker only
- **Plattenrüstung (Plate Armor):** Barbar only
- **Stab der Magie + Ring der Magie:** Druide/Zauberer only
- **Stab des Zauberers / Telekinese-Stab:** Druide/Zauberer only (caster weapons)
- **Amulett der Weisheit:** Barbar only
- **Mantel des Zauberers:** Druide/Zauberer only (passive +1 Intelligence)
- **Zauberer cannot equip any weapons** — enforced by `canEquipWeapon()` returning `false` for Zauberer; Druide CAN equip weapons

### Bonus System
- **Weapon bonuses** applied to Attack Dice (cumulative, max 6)
- **Armor bonuses** applied to Defense Dice (cumulative, max 6)
- **Passive item bonuses** (e.g., Amulett +1 Intelligence) added via `intelligenceBonus` field; computed in store
- **Consumables** (potions) used up: either quantity-tracked or charge-tracked (1-use vs 2-use items)

### Item Types & Behaviors
- **heal-fixed:** Restore body strength +4 (never above starting value)
- **heal-fixed-2:** Restore body strength +2 (e.g. Gegengift)
- **heal-potion:** Roll 1d6 → heal that amount (never above starting value); opens inline dice dialog
- **attack-potion / defense-potion:** Boost dice temporarily (bounded 1–6)
- **extra-attack-same:** Roll combat dice a 2nd time against the same enemy (e.g. Kampfestrank, Fluch der Orks)
- **extra-attack-multi:** Roll 2× attack dice, usable against 2 enemies (e.g. Stärkungstrank)
- **movement-potion:** Temporary +5 movement points (e.g. Geschicklichkeitstrank; display-only, no store field)
- **restore-small:** Restore +1 Körperkraft and +1 Intelligence (never above starting value)
- **fire-shield (Ring des Feuers):** 2-charge item, tracks uses in `itemChargesUsed` lookup
- **magic-ring (Ring der Magie):** 2-charge item for Druide/Zauberer
- **consumable (Werkzeug, Magischer Wurfdolch):** Stackable via `itemQuantities` (+/−); the `useLabel` button consumes one, the last one removes the item. Not a weapon.
- **scroll (Schriftrolle: …):** One-use magic items, effect text is display-only
- **Legacy saves:** Werkzeug in `equippedWeapon` and Borins Rüstung in `equippedSpecialItems` are migrated on load (`loadFromFile()`) and on hydrate (store `afterHydrate`)
- **passive items:** Permanently active (no tracking), applied via store computed properties (`intelligenceBonus`); `bonusLabel` is display-only for other passive bonuses (e.g. Ring der Stärke +1 ⚔️ — label only, no computed store field)

### Death & Revival
- When **Body Strength = 0** → fullscreen death overlay appears
- Player may optionally use a healing potion (from inventory) before selecting revival points
- Player selects revival Body Strength (1 to class default), overlay closes
- **End-of-game reset** restores all stats to class defaults but **keeps all equipment & items**

### Berserker Skills
- Defined in `characterSkills` (`skillSheetData.ts`), shown by `SkillSheetSkills.vue` above the equipment, only for `Berserker`
- Erzürnung, Vergeltung (≤5 Körperpunkte), Raserei (≤3 Körperpunkte) are display-only rules; requirements are not enforced
- Clicking a skill adds its id to `store.usedSkills` and disables it; re-enabled only by "Spielende – Werte zurücksetzen"

### Druide Shape-Shifting
- Store ref `druideShapeShifted` (boolean) tracks active shift state
- `druideShapeBonus` computed: adds +1 to both attack and defense dice when `character === 'Druide'` and shifted
- `toggleDruideShape()`: only togglable when Körperkraft is at the Druide's starting max (6); auto-exposed in store
- `deactivateDruideShape()`: called automatically in `changeBodyStrength()` whenever body strength decreases
- `effectiveAttackDice` and `effectiveDefenseDice` both include `druideShapeBonus` in their getter/setter

### Kill List Feature
- **Purpose:** Track every monster defeat during a campaign with animations and statistics
- **UI Location:** 💀 button in top-right corner of character sheet
- **Recording:** Single click on "+ Kill hinzufügen" button instantly records a kill with timestamp
- **Grouping:** Kills automatically grouped by match day (gaming session date)
- **Display:** Shows last 5 match days with per-day kill counts; total cumulative kills at top
- **Storage:** Organized by `matchDay` (ISO date YYYY-MM-DD) with individual `timestamp` for time-of-day display
- **Persistence:** Saved to `localStorage` via Pinia, included in JSON export/import, survives app restart

**Kill Data Structure** (in store and JSON):
```typescript
interface Kill {
  id: string          // Unique identifier
  matchDay: string    // ISO date (YYYY-MM-DD) for grouping
  timestamp: number   // JavaScript timestamp for time display
}
```

**Animations on Kill Record:**
1. **Button Pulse** (600ms) — "+ Kill hinzufügen" button scales 1x→1.05x with expanding red glow
2. **Badge Bounce** (600ms) — Kill counter badge scales 1x→1.2x→1x
3. **Stats Glow** (600ms) — "Gesamt Kills" number scales and brightens (#f67449→#ff8566)
4. **Slide-In** (500ms) — New kill item slides in from left with highlight
5. **Highlight** (1000ms) — New kill has gold background + orange border, auto-fades

**Store Methods & Computed:**
- `store.addKill()` — Record new kill for today
- `store.removeKill(killId)` — Delete specific kill
- `store.clearKills()` — Clear all kills
- `store.killsByMatchDay` — Kills grouped by date
- `store.last5MatchDays` — Last 5 gaming days
- `store.totalKills` — Total across all games
- `store.todayKills` — Today's kills only

### Expansions (Erweiterungen)
- **Purpose:** Support official HeroQuest expansions that add new weapons, armor, and special items. Expansion content is hidden by default and only appears once the player explicitly enables that expansion; multiple expansions can be combined at the same time.
- **Registry:** `expansionOptions` in `skillSheetData.ts` — `{ id, label, symbol }[]`. The first registered expansion is `der-eisige-schrecken` ("Der eisige Schrecken"); it contains Barbarin, the Söldner, and 14 ❄️ cards in `specialItemOptions` (Amulett des Nordens, Armband aus Eis, Ring der Wärme, Schneeschuhe der Geschwindigkeit, 6 Zauberschriftrollen, Trank der Kampfeswut / eisigen Stärke / Frosthaut, Verjüngungstrank). Prices are part of the `ability` text; the Amulett's +2 Körperkraft and the Schneeschuhe's +2 Bewegung are display-only (`bonusLabel`, shown on passive items).
- **Tagging cards:** `WeaponOption`, `ArmorOption`, and `SpecialItemOption` all have an optional `expansion?: string` field referencing an `expansionOptions` id. Omitted/`undefined` means the card belongs to the base game and is always visible.
- **UI Location:** 📖 button in top-left corner of character sheet (`ExpansionsModal.vue`), mirroring the 💀 kill list button on the right. Clicking an expansion row toggles it on/off.
- **Filtering:** `SkillSheetEquipment.vue`'s `canEquipWeapon()` / `canEquipArmor()` / `canEquipSpecialItem()` helpers additionally check `isExpansionAvailable()`, which looks up `store.enabledExpansions`. Already-equipped cards from a since-disabled expansion remain visible/removable on the sheet; only the "add" dropdowns hide unavailable cards.
- **Store:** `store.enabledExpansions: string[]` (expansion ids), `store.isExpansionEnabled(id)`, `store.toggleExpansion(id)`. Cleared by `reset()` (full reset); **not** cleared by `resetStats()` (end-of-game reset), since expansions are a persistent setting, not per-campaign stats.
- **Expansion heroes:** `expansionCharacters` in `skillSheetData.ts` (hero name → expansion id) are part of `characterOptions` but only listed in the hero dropdown (prefixed with ❄️) while their expansion is enabled or the hero is already selected. Stats in `defaultStats`, avatar in `characterAvatars`. Der eisige Schrecken: Barbarin (shares Barbar equipment restrictions).
- **Mercenaries (Söldner)** of Der eisige Schrecken are extra board figures hired per adventure (not heroes, no equipment/items), so they are not in the hero dropdown. Instead `mercenaryOptions` (`skillSheetData.ts`) feeds the "Söldner" section (`SkillSheetMercenaries.vue`, visible only with the expansion enabled): dropdown + "Anheuern", ✕ to dismiss, stats display-only. Hired ids live in `store.hiredMercenaries` (cleared by `reset()`, saved as `hiredMercenaries`).
- **Persistence:** Saved to `localStorage` via Pinia, included in JSON export/import as `enabledExpansions` (see File Format below).

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

### Equipment UI Pattern
`SkillSheetEquipment.vue` uses a **dropdown-add pattern**: only equipped items are shown in the list; unequipped available items appear in a `<select>` dropdown with an "Hinzufügen" button. Equipped weapons/armor/items are removed **only via the ✕ button** (`.equip-item-remove`), never by clicking the card; stackable potions ask `confirm()` first (`removeSpecialItem()`). Key computed helpers:
- `availableWeapons` / `availableArmor` / `availableSpecialItems` — filtered & sorted lists for the dropdowns
- `equippedWeaponOptions` / `equippedArmorOptions` / `equippedSpecialOptions` — resolve IDs to option objects for rendering
- `getItemCategory(item)` — returns 0 (Tränke), 1 (Magische Gegenstände), or 2 (Sonstiges) for thematic grouping
- `potionKinds` / `magicKinds` — `Set` constants that drive categorization and rendering branches

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
- **PWA:** Service worker at `public/service-worker.js` polls for updates every 60 s; fires `sw-update-available` custom event consumed by `AppUpdatePrompt.vue`. The worker does **not** call `skipWaiting()` on install (only on the `SKIP_WAITING` message from the prompt). `vite.config.ts` (plugin `release-info`) injects `__APP_VERSION__` / `__RELEASE_NOTES__` (commit subjects since the previous `package.json` version bump, so CI needs `fetch-depth: 0`), emits `dist/version.json` and stamps the version into the service worker cache name. **Bump `package.json` version for every release** — it triggers the update flow

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
  "usedSkills": [],
  "itemQuantities": {"heiltrank": 2},
  "itemChargesUsed": {"ring-des-feuers": 1},
  "druideShapeShifted": false,
  "kills": [
    {"id": "1722716400000-abc123", "matchDay": "2026-08-04", "timestamp": 1722716400000},
    {"id": "1722716420000-xyz789", "matchDay": "2026-08-04", "timestamp": 1722716420000},
    {"id": "1722802800000-def456", "matchDay": "2026-08-03", "timestamp": 1722802800000}
  ],
  "enabledExpansions": ["der-eisige-schrecken"],
  "hiredMercenaries": ["armbrustschuetze"]
}
```

**When loading:** `store.$patch({...data})` applies entire snapshot. **Validate IDs exist** in current game data before patching to prevent orphaned references. Kills are preserved as-is with their match days intact.

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
2. Add UI rendering logic in `SkillSheetEquipment.vue` template if new layout needed — items are categorized by `getItemCategory()`: potion kinds → category 0 (Tränke), passive/magic-ring/fire-shield → category 1 (Magische Gegenstände), others → category 2 (Sonstiges)
3. If item has charges, hook into `itemChargesUsed` ref
4. If passive bonus, add `passive: true` and `intelligenceBonus` to definition; other passive bonus types (e.g. attack) use `bonusLabel` for display only

### Adding a New Character
1. Add character name to `characterOptions` array in `skillSheetData.ts`
2. Define avatar emoji and theme color in `characterAvatars`
3. Add base stats entry in `defaultStats` (attackDice, defenseDice, bodyStrength, intelligence)
4. If the character has weapon restrictions, add them to `allowedCharacters` on the relevant weapon (e.g. Berserker gets Breitschwert alongside Barbar)

### Modifying Equipment Bonuses
1. Update `weaponOptions` or `armorOptions` in `skillSheetData.ts`
2. Computed properties in store (`weaponBonus`, `armorBonus`) automatically recalculate
3. Components using `effectiveAttackDice` or `effectiveDefenseDice` automatically re-render

### Changing Character Restrictions
1. Edit `allowedCharacters` array in item definition (`null` = unrestricted)
2. Restriction helpers in `SkillSheetEquipment.vue` (`canEquipWeapon()`, etc.) automatically filter options
3. Template `v-if` bindings prevent equipping restricted items

### Adding a New Expansion
0. **Convention:** every card/hero from an expansion gets the expansion's icon (❄️ for Der eisige Schrecken) as prefix in its `label`.
1. Add a new entry `{ id, label, symbol }` to `expansionOptions` in `skillSheetData.ts` (id is the kebab-case key used everywhere, e.g. `'der-eisige-schrecken'`)
2. It immediately appears as a toggle in `ExpansionsModal.vue` (📖 button) — no further UI changes needed
3. Add the expansion's new weapons/armor/items to `weaponOptions` / `armorOptions` / `specialItemOptions` with `expansion: '<expansion-id>'` set
4. Those cards are automatically hidden from the equip dropdowns until the player enables the expansion; already-equipped legacy cards are unaffected

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

**Last Updated:** July 29, 2026 | **Framework:** Vue 3 (Composition API) + Pinia + Tailwind CSS v4 | **Target:** German HeroQuest players

