# Testing Documentation

This NFL Confidence Pool application includes comprehensive testing with both unit tests and end-to-end tests.

## Testing Stack

- **Jest**: Unit testing framework with JSDOM for DOM testing
- **Playwright**: End-to-end testing across multiple browsers
- **GitHub Actions**: Automated CI/CD pipeline with testing

## Test Structure

```
tests/
├── setup.js                    # Jest configuration and mocks
├── test-utils.js               # Common testing utilities and helpers
├── smoke.test.js               # Basic infrastructure tests
├── confidence-app.test.js      # Unit tests for main application logic
└── e2e/
    └── confidence-pool.spec.js # End-to-end browser tests
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests

```bash
# Run e2e tests (requires built site)
npm run test:e2e

# Run e2e tests with UI mode for debugging
npm run test:e2e:ui

# Run all tests (unit + e2e)
npm run test:all
```

## Test Coverage

The tests cover:

### Unit Tests (`confidence-app.test.js`)

- ✅ Application initialization and data loading
- ✅ Team selection and game interactions
- ✅ Local storage operations (save/load user selections)
- ✅ Week switching functionality
- ✅ Changes detection and reset functionality
- ✅ Import/export CSV data handling
- ✅ Drag and drop reordering
- ✅ Error handling and edge cases

### End-to-End Tests (`confidence-pool.spec.js`)

- ✅ Page loading and basic UI elements
- ✅ Games table display and interaction
- ✅ Team selection with visual feedback
- ✅ Week switching with data persistence
- ✅ Changes indicator and reset functionality
- ✅ Drag and drop reordering in browser
- ✅ Import/export clipboard operations
- ✅ External links and navigation
- ✅ Responsive design on mobile/tablet

## Testing Utilities

### `test-utils.js` provides:

- `mockGameData`: Sample NFL games data for testing
- `createMockDOM()`: Generate test DOM structure
- `setupMockLocalStorage()`: Mock localStorage implementation
- `mockClipboardAPI()`: Mock clipboard read/write operations
- `createDragEvent()`: Generate drag/drop events for testing

### Mock Data Structure

```javascript
const mockGameData = {
  games: [...],           // Array of game objects
  gamesByWeek: {...},     // Games organized by week number
  currentWeek: 8,         // Current NFL week
  lastUpdated: "..."      // Timestamp of last data update
};
```

## Continuous Integration

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:

1. **Runs on every push/PR to main branch**
2. **Tests against Node.js 18.x and 20.x**
3. **Executes unit tests with coverage reporting**
4. **Runs Playwright e2e tests across browsers**
5. **Builds and deploys site if tests pass**
6. **Runs Lighthouse performance audits**

### Test Stages

1. **Install dependencies** and setup test environment
2. **Unit testing** with Jest and coverage reports
3. **End-to-end testing** with Playwright across browsers:
   - Chromium (Desktop Chrome)
   - Firefox
   - WebKit (Desktop Safari)
   - Mobile Chrome (Pixel 5)
   - Mobile Safari (iPhone 12)
4. **Build verification** ensures site builds successfully
5. **Deployment** (only on main branch after tests pass)

## Writing Tests

### Adding Unit Tests

1. Create test files in `tests/` with `.test.js` suffix
2. Import utilities from `test-utils.js` for common operations
3. Use JSDOM environment for DOM testing
4. Mock localStorage, clipboard, and other browser APIs

### Adding E2E Tests

1. Create test files in `tests/e2e/` with `.spec.js` suffix
2. Use Playwright's `page` object for browser automation
3. Test real user workflows and interactions
4. Verify functionality across different devices/browsers

### Test Naming Convention

- **Unit tests**: `functionality.test.js`
- **E2E tests**: `feature-area.spec.js`
- **Test descriptions**: Use clear, behavior-focused descriptions

```javascript
// Good test descriptions
test("should save user selections to localStorage");
test("should switch between weeks and maintain separate data");
test("should export game picks in CSV format");

// Less clear descriptions
test("storage test");
test("week functionality");
test("export feature");
```

## Debugging Tests

### Unit Test Debugging

```bash
# Run specific test file
npm test confidence-app.test.js

# Run tests matching pattern
npm test -- --testNamePattern="team selection"

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Test Debugging

```bash
# Run with headed browser (visible)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/confidence-pool.spec.js

# Debug with Playwright Inspector
npx playwright test --debug
```

## Performance Testing

Lighthouse audits run automatically in CI and check:

- **Performance**: Page load speed and optimization
- **Accessibility**: WCAG compliance and screen reader support
- **Best Practices**: Security headers, HTTPS, etc.
- **SEO**: Meta tags, structured data, etc.

Local Lighthouse testing:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit on local development server
lighthouse http://localhost:8080 --output html --output-path ./lighthouse-report.html
```

## Coverage Reports

Coverage reports are generated automatically and include:

- **Statement coverage**: Lines of code executed
- **Branch coverage**: Conditional paths tested
- **Function coverage**: Functions called during tests
- **Line coverage**: Individual lines executed

View coverage after running tests:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```
