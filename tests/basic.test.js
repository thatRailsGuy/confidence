/**
 * Basic tests for NFL Confidence Pool
 */

const { JSDOM } = require("jsdom");

describe("Basic Functionality", () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Create a simple JSDOM environment
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="nfl-data">{"games": [], "currentWeek": 8}</div>
          <select id="week-select">
            <option value="8" selected>Week 8</option>
          </select>
          <div id="changes-indicator" class="hidden"></div>
          <button id="reset-btn">Reset</button>
        </body>
      </html>
    `;

    dom = new JSDOM(html);
    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;

    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }
  });

  test("should have basic DOM elements", () => {
    expect(document.getElementById("nfl-data")).toBeTruthy();
    expect(document.getElementById("week-select")).toBeTruthy();
    expect(document.getElementById("changes-indicator")).toBeTruthy();
    expect(document.getElementById("reset-btn")).toBeTruthy();
  });

  test("should parse NFL data from DOM", () => {
    const dataElement = document.getElementById("nfl-data");
    const data = JSON.parse(dataElement.textContent);

    expect(data).toHaveProperty("games");
    expect(data).toHaveProperty("currentWeek");
    expect(data.currentWeek).toBe(8);
  });

  test("should handle localStorage operations", () => {
    // Test that localStorage is available and has expected methods
    expect(localStorage).toBeDefined();
    expect(localStorage.getItem).toBeDefined();
    expect(localStorage.setItem).toBeDefined();
    expect(localStorage.removeItem).toBeDefined();
    expect(localStorage.clear).toBeDefined();

    // Test that we can call localStorage methods without errors
    expect(() => {
      localStorage.setItem("test", "value");
      localStorage.getItem("test");
      localStorage.removeItem("test");
    }).not.toThrow();
  });

  test("should manipulate CSS classes", () => {
    const indicator = document.getElementById("changes-indicator");

    // Should start hidden
    expect(indicator.classList.contains("hidden")).toBe(true);

    // Can remove hidden class
    indicator.classList.remove("hidden");
    expect(indicator.classList.contains("hidden")).toBe(false);

    // Can add hidden class back
    indicator.classList.add("hidden");
    expect(indicator.classList.contains("hidden")).toBe(true);
  });

  test("should handle form elements", () => {
    const weekSelect = document.getElementById("week-select");

    expect(weekSelect.value).toBe("8");
    expect(weekSelect.options.length).toBe(1);
    expect(weekSelect.options[0].value).toBe("8");
    expect(weekSelect.options[0].text).toBe("Week 8");
  });
});

describe("Mock ConfidenceApp Logic", () => {
  let mockApp;

  beforeEach(() => {
    // Create a simple mock of the ConfidenceApp logic
    mockApp = {
      selectedTeams: {},
      currentWeek: 8,

      selectTeam(gameId, team) {
        this.selectedTeams[gameId] = team;
      },

      hasChanges() {
        return Object.keys(this.selectedTeams).length > 0;
      },

      reset() {
        this.selectedTeams = {};
      },

      getStorageKey(type) {
        return `confidence-pool-${type}-week-${this.currentWeek}`;
      },
    };
  });

  test("should select teams correctly", () => {
    mockApp.selectTeam("game1", "Team A");
    expect(mockApp.selectedTeams["game1"]).toBe("Team A");

    mockApp.selectTeam("game2", "Team B");
    expect(mockApp.selectedTeams["game2"]).toBe("Team B");

    expect(Object.keys(mockApp.selectedTeams)).toHaveLength(2);
  });

  test("should detect changes", () => {
    expect(mockApp.hasChanges()).toBe(false);

    mockApp.selectTeam("game1", "Team A");
    expect(mockApp.hasChanges()).toBe(true);
  });

  test("should reset selections", () => {
    mockApp.selectTeam("game1", "Team A");
    mockApp.selectTeam("game2", "Team B");

    expect(mockApp.hasChanges()).toBe(true);

    mockApp.reset();
    expect(mockApp.hasChanges()).toBe(false);
    expect(Object.keys(mockApp.selectedTeams)).toHaveLength(0);
  });

  test("should generate correct storage keys", () => {
    expect(mockApp.getStorageKey("selections")).toBe(
      "confidence-pool-selections-week-8"
    );

    mockApp.currentWeek = 9;
    expect(mockApp.getStorageKey("selections")).toBe(
      "confidence-pool-selections-week-9"
    );
  });
});
