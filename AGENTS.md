# Agent Guidelines for download.marioforever.net

## Project Overview
This is a Vue 3 static website built with Vite and JavaScript. It provides a bilingual (Chinese/English) catalog for Mario Forever games, fangames, and Super Mario Worker Project levels. The site uses YAML files for data storage and supports multiple entry points (index.html, mf-games.html, mw-levels.html).

## Build Commands

### Development
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Build for production (outputs to dist/)
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint with auto-fix on all .vue, .js, .jsx, .cjs, .mjs files
- **Note**: No test framework is currently configured

### Deployment
- `npm run deploy` - Execute deployment script (deploy.sh)

## Code Style Guidelines

### JavaScript / Vue Components

**Import Ordering:**
1. Vue imports (ref, reactive, etc.)
2. Third-party library imports
3. Local utility imports (with @/ alias or relative paths)
4. Component imports

```javascript
import { ref } from 'vue'
import axios from 'axios'
import { getLanguage } from '@/util/Language.js'
import GameCard from '@/components/GameCard.vue'
```

**Imports:**
- Always include `.js` extension for JavaScript imports
- Use `@/` alias for src directory (configured in jsconfig.json)
- Use relative paths for files in same directory

**Naming Conventions:**
- Components: PascalCase (GameCard.vue)
- Functions/Variables: camelCase (getGameImage, gameList)
- Constants: camelCase or UPPER_SNAKE_CASE (siteVersion)
- Props: camelCase
- Events: kebab-case (@select-game, @change-lan-zh)

**Vue Component Structure:**
- Use `<script setup>` syntax (Composition API)
- Define props with `defineProps()` at top of script
- Define emits with `defineEmits()`
- Use template refs with `ref()` in script setup
- Exported functions go at top level

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

**Variable Declarations:**
- Prefer `const` over `let` when possible
- Use `var` only when necessary (rare cases in existing codebase)
- Arrow functions for callbacks and inline functions

**Strings:**
- Use double quotes for strings ("game name", "zh")
- Template literals for multi-line or interpolated strings

**Conditionals:**
- Use `==` for loose equality (matches existing codebase style)
- Prefer ternary operators for simple conditionals in templates

### Styling

**CSS:**
- Use scoped styles in components: `<style scoped>`
- Import shared styles: `@import "../assets/general.css"`
- 2-space indentation for YAML, 4-space for CSS/JS
- Use kebab-case for class names (game-card, button-primary)
- Mobile-first responsive design patterns

**SCSS:**
- Project uses SASS with modern compiler
- Follow existing CSS patterns when writing SCSS

### File Organization

**Directory Structure:**
```
src/
├── components/       # Reusable Vue components
├── pages/           # Page-level components (index/, mf-games/, mw-levels/)
├── util/            # Utility functions
├── assets/          # CSS, images, fonts
├── config.js        # Application configuration
└── main.js          # Entry point
```

**Component Files:**
- Keep components focused on single responsibility
- Shared components go in components/
- Page-specific components in pages/{page-name}/

### Data Files

**YAML Structure:**
- Data files in `public/lists/`
- list.yaml - Mario Forever games
- list-mw.yaml - SMWP levels
- list-original-mf.yaml - Original MF versions
- Use 2-space indentation (enforced by .editorconfig)
- Date format: YYYY-MM-DD

### Language Support

The site is bilingual (Chinese/English). Follow these patterns:
- Language state stored in variable named `lan` (values: "zh", "en")
- Use `_zh` and `_en` suffixes for localized data fields
- Use `_alt` suffix for English translations of Chinese content
- Language switching uses js-cookie for persistence

```javascript
const lan = ref(getLanguage())
const title = lan.value === 'zh' ? titleZh : titleEn
```

### Error Handling

- Use try-catch blocks around async operations
- Check for null/undefined before accessing nested properties
- Provide fallbacks for missing data

```javascript
if (!item || !item.currentVer) {
  return null
}
```

### ESLint Rules

Project uses:
- `plugin:vue/vue3-essential`
- `eslint:recommended`
- ECMAScript latest

Always run `npm run lint` before committing.

## Technology Stack

- **Node.js**: 20.x
- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Language**: JavaScript (no TypeScript)
- **Build Tool**: Vite 6.x
- **Package Manager**: npm
- **Styling**: CSS with SCSS support

## Development Notes

- Use `import` syntax (ES modules) - package.json has `"type": "module"`
- Avoid modifying existing Vite configuration unless necessary
- Test on multiple pages (index, mf-games, mw-levels)
- All features should work in both Chinese and English
- Image assets in `public/images/`
- External API calls use axios
