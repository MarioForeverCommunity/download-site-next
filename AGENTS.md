# Agent Guidelines for download.marioforever.net

## Project Overview
Vue 3 static website built with Vite and JavaScript. Bilingual (Chinese/English) catalog for Mario Forever games, fangames, SMWP levels, and Softendo games. Uses YAML data files and supports multiple entry points (index.html, mf-games.html, mw-levels.html, assets.html, mario-worker.html, softendo.html). Also ships a **static JSON API** generated at build time (see `API.md`).

## Technology Stack
- **Package Manager**: bun (**Do NOT use npm/yarn/pnpm**)
- **Vue 3**: Composition API with `<script setup>`
- **JavaScript**: ES modules (no TypeScript)
- **Build Tool**: Vite 8.x with Rolldown bundler (target: ES2022)
- **Styling**: CSS
- **Libraries**: axios, js-cookie, js-yaml, markdown-it, @floating-ui/vue, vue3-carousel, overlayscrollbars, unplugin-vue-markdown

## Build Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server with HMR |
| `bun run build` | Build for production (outputs to dist/) - runs image index generation, API generation, vite build, and data compression |
| `bun run preview` | Preview production build locally |
| `bun run lint` | Run ESLint with auto-fix on all .vue, .js files |
| `bun run lint -- <file>` | Lint a specific file |
| `bun run generate-images` | Generate `image-index.json` |
| `bun run generate-api` | Generate static JSON API into `public/api/` |
| `bun run deploy` | Execute deployment script (deploy.sh) |

## Testing
**No test framework is configured.** Manual testing required:
- Test all features in both Chinese and English
- Verify across all entry points: index, mf-games, mw-levels, assets, mario-worker, softendo
- Test responsive design on mobile, tablet, and desktop
- Validate external API calls and YAML data loading

## Code Style Guidelines

### ESLint Configuration
Uses `eslint-plugin-vue` (flat config), `@eslint/js`, and globals. Config in `eslint.config.js`.

Key enforced rules:
- **2-space indentation** (JS, Vue templates)
- **Object curly spacing**: `{ }`
- **Prefer `const`**, **no `var`**
- **No trailing spaces**, EOF newline required
- **Max 1 empty line** between code blocks
- **Curly braces**: required for multi-line blocks
- **No unused vars**: warn (prefix with `_` to ignore)
- **No empty blocks**: allowed for catch only
- `quotes`, `semi`, `comma-dangle`: off (flexible)
- `eqeqeq`: off
- `no-console`: off
- `no-debugger`: warn
- `linebreak-style`: off

Vue-specific rules:
- `vue/multi-word-component-names`: off
- `vue/no-v-html`: off
- `vue/html-indent`: 2 spaces
- `vue/html-closing-bracket-newline`: multiline always on new line
- `vue/html-closing-bracket-spacing`: error
- `vue/mustache-interpolation-spacing`: always
- `vue/no-multi-spaces`: error
- `vue/first-attribute-linebreak`: multiline below
- `vue/max-attributes-per-line`: 3 singleline, 1 multiline
- `vue/prop-name-casing`: off
- `vue/require-default-prop`: warn
- `vue/require-prop-types`: warn

### EditorConfig
Defined in `.editorconfig`:
- UTF-8 charset
- 2-space indentation for .js, .vue, .css, .html, .json, .md, .yaml, .yml
- Final newline required
- Trailing whitespace trimmed (except .md files)

### Import Ordering
1. Vue imports (`ref`, `reactive`, etc.)
2. Third-party library imports
3. Local utility imports (`@/` alias or relative paths)
4. Component imports

```javascript
import { ref } from 'vue'
import axios from 'axios'
import { getLanguage } from '@/util/Language.js'
import GameCard from '@/components/GameCard.vue'
```

**Rules:**
- Always include `.js` extension for JavaScript imports
- Use `@/` alias for src directory (configured in jsconfig.json)
- Use relative paths for files in same directory (e.g., `./` or `../`)

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GameCard.vue` |
| Functions/Variables | camelCase | `getGameImage`, `gameList` |
| Constants | camelCase or UPPER_SNAKE_CASE | `siteVersion` |
| Props | camelCase | `gameTitle` |
| Events | kebab-case | `@select-game` |
| CSS Classes | kebab-case | `game-card`, `button-primary` |

### Vue Component Structure
Use `<script setup>` syntax (Composition API):
```vue
<script setup>
import { ref } from 'vue'

const props = defineProps({
  game: { type: Object, required: true },
  lan: { required: true }
})

const emit = defineEmits(['selectGame', 'showTooltip'])

const handleClick = () => {
  emit('selectGame', props.game)
}
</script>
```

- Define props with `defineProps()` at top of script
- Define emits with `defineEmits()`
- Use template refs with `ref()` in script setup

### Variables & Strings
- Prefer `const` over `let`
- Use double quotes for strings
- Use template literals for interpolation
- Arrow functions for callbacks and inline functions

### Styling
- Use scoped styles: `<style scoped>`
- Import shared styles: `@import "../assets/general.css"`
- Mobile-first responsive design

### Error Handling
```javascript
try {
  // async operations
} catch (e) {
  // handle error
}

// Null checks
if (!item || !item.currentVer) {
  return null
}
```

## File Organization

```
src/
├── components/      # Reusable Vue components
│   └── icons/       # Icon components
├── pages/           # Page-level components (per entry point)
├── markdown/        # Markdown files for pages
├── util/            # Utility functions and composables
├── assets/          # CSS
├── config.js        # Application configuration
└── main.js          # Entry point
scripts/             # Build scripts
├── generate-image-index.js  # Generate image-index.json
├── generate-api.js          # Generate static JSON API (public/api/)
├── compress-data.js         # Compress built assets
├── check_yaml.py            # YAML validation script
├── mf-list-schema.yaml      # YAML schema for MF games
└── mw-list-schema.yaml      # YAML schema for MW levels
public/
├── data/                    # YAML data, images for each game
│   ├── assets/              # Asset images
│   ├── mf-games/            # MF games images
|   ├── mf-index/            # MF index page images
|   ├── mw-index/            # MW index page images
|   ├── mw-levels/           # MW levels images
|   ├── image-index.json     # Image index (generated by generate-image-index.js)
│   └── *.yaml               # Data files
├── api/                     # Static JSON API (generated by generate-api.js)
│   ├── index.json           # Endpoint manifest
│   └── {mf,mw,assets,softendo,original-mf}.json
└── images/                  # Image assets (website)
```

Data files in `public/data/`:
- `list-mf.yaml` - Mario Forever games
- `list-mw.yaml` - SMWP levels
- `list-original-mf.yaml` - Original MF versions
- `list-assets.yaml` - Mario Forever Assets
- `list-softendo.yaml` - Softendo / Buziol Games

YAML: 2-space indentation, YYYY-MM-DD dates.

## Static JSON API
The site ships a static JSON API under `public/api/`, generated by `scripts/generate-api.js` from the YAML data, `image-index.json`, and each work's `description*.md` files. See `API.md` for the full field reference and consumption guide.

Key points when modifying `generate-api.js`:
- Download link objects are uniform across endpoints: `{ fileName, zh, en, cdn }` (MW omits `en` since SMWP works only have Chinese resource-site paths)
- URL construction **mirrors** `src/util/GameUtil.js`, `src/util/SoftendoUtil.js`, `src/util/AssetUtil.js`, and `src/components/OriginalMfTable.vue` - keep both sides in sync when changing path rules
- `description` content is inlined (not just paths) so consumers need no extra requests
- MF `currentVersion` is an **array** of version names, supporting works with multiple `current: true` versions
- Output is committed to the repo; regenerate with `bun run generate-api` after editing YAML data or the script
- Do not hand-edit files in `public/api/` - they are generated artifacts

## Language Support
- Language state: `lan` variable ("zh" or "en")
- Localized fields: `_zh` / `_en` suffixes
- English translations: `_alt` suffix
- Use js-cookie for persistence

```javascript
const lan = ref(getLanguage())
const title = lan.value === 'zh' ? titleZh : titleEn
```

## Development Notes
- All features must work in Chinese and English
- Image assets: `public/data/` (all pages)
- External API calls use axios
- Always run `bun run lint` before committing
- Build includes gzip/brotli compression for assets >5KB
- Global `BUILD_TIME` variable available (readonly)
- scripts/ directory uses Node.js globals, not browser globals
- Keep component props minimal and well-typed
- Use composables for reusable logic
- Follow Vue 3 reactivity principles
- **Vite 8 uses Rolldown as bundler**: `manualChunks` in `vite.config.js` must use function format, not object format
