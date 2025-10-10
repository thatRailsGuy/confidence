# GitHub Copilot Instructions

## Project Context

This is an NFL Confidence Pool static site built with Eleventy.js. Users rank NFL games by confidence (1-16) and can export/import their picks to spreadsheets.

## Core Guardrails

### 🚫 Never Suggest

- **Server-side code** - This is a static site only
- **React/Vue/Angular** - Use vanilla JavaScript only
- **Node.js runtime code** - Client-side only (except build scripts)
- **Database connections** - No backend, localStorage only
- **External dependencies** - Keep minimal, prefer CDN links
- **Personal data** - No league IDs, personal info, or real team names in examples

### ✅ Always Follow

#### **Architecture Rules**

- Static site generation with Eleventy.js
- Nunjucks templates for HTML generation
- Vanilla JavaScript for client interactions
- Tailwind CSS via CDN for styling
- GitHub Actions for automated deployment

#### **Code Standards**

- **No trailing whitespace** - Always remove trailing spaces and tabs
- **Consistent indentation** - Use 2 spaces for JavaScript, HTML, CSS
- **Clean line endings** - Unix-style line endings (LF) only

```javascript
// ✅ Good - Vanilla JS with clear naming, no trailing whitespace
class ConfidenceApp {
  handleTeamSelection(gameId, team) {
    // Implementation
  }
}

// ❌ Bad - Framework syntax
const [selected, setSelected] = useState();
```

#### **HTML Structure**

```html
<!-- ✅ Good - Semantic, accessible -->
<table class="w-full" role="table" aria-label="NFL Games Confidence Pool">
  <thead>
    <tr class="bg-gray-100">
      <th scope="col">Rank</th>
    </tr>
  </thead>
</table>

<!-- ❌ Bad - Non-semantic divs -->
<div class="table">
  <div class="row">
    <div>Rank</div>
  </div>
</div>
```

#### **Data Handling**

- Use The Odds API format for NFL data
- Store user selections in localStorage
- Export format must be CSV-compatible
- Sample data should use generic team names (Team A vs Team B)

#### **Mobile-First Responsive**

```css
/* ✅ Good - Mobile first with Tailwind */
class="text-sm md:text-base lg:text-lg"
class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

/* ❌ Bad - Desktop first */
class="text-lg md:text-sm"
```

### 🎯 Feature Requirements

#### **Drag & Drop**

- Must work on touch devices
- Visual feedback during drag
- Snap to valid drop zones
- Update confidence rankings automatically

#### **Team Selection**

- Clear visual indication of selected team
- One team per game maximum
- Immediate UI feedback
- Persist selections in localStorage

#### **Changes Detection**

- Show indicator when user modifies defaults
- Provide reset to original state
- Non-intrusive notification style

#### **Export/Import**

- CSV format compatible with Excel/Sheets
- Include team names and confidence rankings
- Handle clipboard operations gracefully
- Validate import data format

### 🔒 Security Guidelines

#### **API Usage**

```javascript
// ✅ Good - Environment variables for build time
const apiKey = process.env.ODDS_API_KEY;

// ❌ Bad - Hardcoded or client-side keys
const apiKey = "sk-1234567890";
```

#### **Data Privacy**

- No user tracking or analytics
- No cookies or session storage for personal data
- Generic examples in all documentation
- No real league URLs or IDs

### 📱 Mobile Considerations

- Touch-friendly drag handles (min 44px)
- Readable text on small screens
- Fast loading (< 3MB total)
- Works offline after initial load

### 🚀 Performance Rules

- Lazy load non-critical JavaScript
- Minimize DOM queries
- Use CSS transforms for animations
- Debounce user input handlers

### 🧪 Testing Approach

```javascript
// ✅ Good - Defensive programming
if (gameElement && gameElement.dataset.gameId) {
  const gameId = gameElement.dataset.gameId;
  // Process game
}

// ❌ Bad - Assumes elements exist
const gameId = gameElement.dataset.gameId;
```

### 📂 File Organization

```
src/
├── _data/nfl-odds.json     # API data (build time)
├── _layouts/base.njk       # Base template
├── js/confidence-app.js    # Main app logic
├── css/style.css           # Custom styles (minimal)
└── index.njk               # Main page template
```

## Helpful Context

### **Common Patterns**

- Games are objects with `id`, `home_team`, `away_team`, `commence_time`
- Confidence rankings are 1-16 (16 = most confident)
- User selections stored as `{gameId: 'home'|'away'}`
- Drag/drop updates both visual order and confidence values

### **Build Process**

- Eleventy generates static HTML from Nunjucks templates
- GitHub Actions fetches fresh NFL data every 6 hours
- Site deploys automatically to GitHub Pages
- No runtime API calls from client

### **Browser Support**

- Modern browsers only (ES6+ features okay)
- Mobile Safari and Chrome priority
- Graceful degradation for drag/drop on older browsers

## Error Handling Patterns

```javascript
// ✅ Good - Comprehensive error handling
try {
  const data = JSON.parse(localStorage.getItem("confidence-picks"));
  if (data && typeof data === "object") {
    this.loadSelections(data);
  }
} catch (error) {
  console.warn("Failed to load saved picks:", error);
  // Continue with empty selections
}

// ❌ Bad - Assumes success
const data = JSON.parse(localStorage.getItem("confidence-picks"));
this.loadSelections(data);
```

Remember: This is a fun, lightweight tool for friends to make NFL picks together. Keep it simple, fast, and accessible! 🏈
