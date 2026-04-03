# Agent Guidelines for download.marioforever.net

## Project Overview
Vue 3 static website built with Vite and JavaScript. Bilingual (Chinese/English) catalog for Mario Forever games, fangames, and SMWP levels. Uses YAML data files and supports multiple entry points (index.html, mf-games.html, mw-levels.html, assets.html, mario-worker.html).

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production (outputs to dist/) - runs image index generation, vite build, and data compression |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint with auto-fix on all .vue, .js files |
| `npm run lint -- <file>` | Lint a specific file |
| `npm run generate-images` | Generate `image-index.json` |
| `npm run deploy` | Execute deployment script (deploy.sh) |

## Testing
**No test framework is configured.** Manual testing required:
- Test all features in both Chinese and English
- Verify across all entry points: index, mf-games, mw-levels, assets, mario-worker
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
- `linebreak-style`: off

Vue-specific rules:
- `vue/multi-word-component-names`: off
- `vue/no-v-html`: off
- `vue/html-indent`: 2 spaces
- `vue/html-closing-bracket-newline`: multiline always on new line
- `vue/max-attributes-per-line`: 3 singleline, 1 multiline
- `vue/require-default-prop`: warn
- `vue/require-prop-types`: warn

### EditorConfig
Defined in `.editorconfig`:
- UTF-8 charset
- 2-space indentation for .js, .vue, .css, .scss, .html, .json, .md, .yaml, .yml
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
- SCSS supported with modern compiler (`api: 'modern-compiler'`)
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
├── pages/           # Page-level components
├── markdown/        # Markdown files for pages
├── util/            # Utility functions
├── assets/          # CSS
├── config.js        # Application configuration
└── main.js          # Entry point
scripts/             # Build scripts (generate-image-index.js, compress-data.js)
public/
├── data/            # YAML data, image for each game
└── images/          # Image assets (website)
```

Data files in `public/data/`:
- `list-mf.yaml` - Mario Forever games
- `list-mw.yaml` - SMWP levels
- `list-original-mf.yaml` - Original MF versions
- `list-assets.yaml` - Mario Forever Assets

YAML: 2-space indentation, YYYY-MM-DD dates.

## Language Support
- Language state: `lan` variable ("zh" or "en")
- Localized fields: `_zh` / `_en` suffixes
- English translations: `_alt` suffix
- Use js-cookie for persistence

```javascript
const lan = ref(getLanguage())
const title = lan.value === 'zh' ? titleZh : titleEn
```

## Technology Stack
- **Node.js**: 20.x
- **Vue 3**: Composition API with `<script setup>`
- **JavaScript**: ES modules (no TypeScript)
- **Build Tool**: Vite 6.x (target: ES2022)
- **Styling**: CSS with SCSS support
- **Libraries**: axios, js-cookie, js-yaml, vue-router, markdown-it, @floating-ui/vue, vue3-carousel, overlayscrollbars

## Development Notes
- All features must work in Chinese and English
- Image assets: `public/data/` (all pages)
- External API calls use axios
- Always run `npm run lint` before committing
- Build includes gzip/brotli compression for assets >5KB
- Global `BUILD_TIME` variable available (readonly)
- scripts/ directory uses Node.js globals, not browser globals
- Keep component props minimal and well-typed
- Use composables for reusable logic
- Follow Vue 3 reactivity principles
