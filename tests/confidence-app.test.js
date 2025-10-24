/**
 * Unit tests for ConfidenceApp functionality
 */

const { JSDOM } = require("jsdom");
const ConfidenceApp = require("../src/js/confidence-app.js");

describe("ConfidenceApp", () => {
  let dom;
  let app;
  let mockLocalStorage;

  beforeEach(() => {
    // Create comprehensive DOM environment
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="nfl-data">{"games": [
            {
              "id": "1",
              "matchup": "Chiefs vs. Lions",
              "odds": "Chiefs: -140 / Lions: +120",
              "info": "Thu 8:20pm",
              "commence_time": "2024-10-24T00:20:00Z"
            },
            {
              "id": "2",
              "matchup": "Bears vs. Packers",
              "odds": "Packers: -130 / Bears: +110",
              "info": "Sun 1:00pm",
              "commence_time": "2024-10-27T17:00:00Z"
            }
          ], "gamesByWeek": {"8": [
            {
              "id": "1",
              "matchup": "Chiefs vs. Lions",
              "odds": "Chiefs: -140 / Lions: +120",
              "info": "Thu 8:20pm",
              "commence_time": "2024-10-24T00:20:00Z"
            },
            {
              "id": "2",
              "matchup": "Bears vs. Packers",
              "odds": "Packers: -130 / Bears: +110",
              "info": "Sun 1:00pm",
              "commence_time": "2024-10-27T17:00:00Z"
            }
          ]}, "currentWeek": 8}</div>
          <div id="changes-indicator" class="hidden"></div>
          <button id="reset-btn">Reset</button>
          <button id="export-btn">Export</button>
          <button id="import-btn">Import</button>
          <select id="week-select">
            <option value="8">Week 8</option>
          </select>
          <table>
            <tbody id="games-tbody"></tbody>
          </table>
        </body>
      </html>
    `;

    dom = new JSDOM(html, {
      url: "http://localhost",
      resources: "usable",
      runScripts: "dangerously",
    });

    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;

    // Create proper jest mocks for localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = mockLocalStorage;

    // Mock Storage to be available
    global.Storage = function () {};
    global.console = console;

    // Mock clipboard API
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: jest.fn().mockResolvedValue(),
        readText: jest.fn().mockResolvedValue(""),
      },
      configurable: true,
    });

    // Mock setTimeout/clearTimeout for testing
    global.setTimeout = jest.fn((cb) => {
      if (typeof cb === "function") {
        return cb();
      }
    });
    global.clearTimeout = jest.fn();

    // Create app instance but don't let it auto-initialize
    const originalInit = ConfidenceApp.prototype.init;
    ConfidenceApp.prototype.init = jest.fn();

    app = new ConfidenceApp();

    // Restore init and set up basic state
    ConfidenceApp.prototype.init = originalInit;
    app.games = [];
    app.selectedTeams = {};
    app.currentWeek = 8;
    app.draggedElement = null;

    // Clear any stored data from constructor calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }
    jest.clearAllMocks();
  });

  test("should initialize with default values", () => {
    expect(app.games).toBeDefined();
    expect(app.selectedTeams).toBeDefined();
    expect(app.currentWeek).toBeDefined();
    expect(app.draggedElement).toBeNull();
  });

  test("should get favorite info correctly", () => {
    const game = {
      matchup: "Chiefs vs. Lions",
      odds: "Chiefs: -140 / Lions: +120",
    };

    const favoriteInfo = app.getFavoriteInfo(game);
    expect(favoriteInfo.favorite).toBe("Chiefs");
    expect(favoriteInfo.favoriteOdds).toBe(-140);
  });

  test("should sort games by favorite odds", () => {
    app.games = [
      {
        id: "1",
        matchup: "Team A vs. Team B",
        odds: "Team A: -100 / Team B: +120",
      },
      {
        id: "2",
        matchup: "Team C vs. Team D",
        odds: "Team C: -150 / Team D: +130",
      },
    ];

    app.sortGamesByFavoriteOdds();
    expect(app.games[0].id).toBe("2"); // -150 should come first
    expect(app.games[1].id).toBe("1"); // -100 should come second
  });

  test("should initialize default selections", () => {
    app.games = [
      {
        id: "1",
        matchup: "Chiefs vs. Lions",
        odds: "Chiefs: -140 / Lions: +120",
      },
    ];

    app.initializeDefaultSelections();
    expect(app.selectedTeams["1"]).toBe("Chiefs");
  });

  test("should generate correct storage keys", () => {
    app.currentWeek = 8;
    expect(app.getStorageKey("selections")).toBe("nfl-confidence-8-selections");
    expect(app.getStorageKey("games")).toBe("nfl-confidence-8-games");
  });

  test("should create game row correctly", () => {
    const game = {
      id: "1",
      matchup: "Chiefs vs. Lions",
      odds: "Chiefs: -140 / Lions: +120",
      info: "Thu 8:20pm",
    };

    app.selectedTeams["1"] = "Chiefs";
    app.games = [game]; // Set up games array for confidence calculation
    const row = app.createGameRow(game, 0);

    expect(row.tagName).toBe("TR");
    expect(row.dataset.index).toBe("0");
    expect(row.innerHTML).toContain("Chiefs");
    expect(row.innerHTML).toContain("Lions");
    expect(row.innerHTML).toContain("Thu 8:20pm");
  });

  test("should handle clipboard export", async () => {
    app.games = [
      {
        id: "1",
        matchup: "Chiefs vs. Lions",
        odds: "Chiefs: -140 / Lions: +120",
        info: "Thu 8:20pm",
      },
    ];
    app.selectedTeams = { 1: "Chiefs" };

    const result = app.arrayToClipboard(app.games, app.selectedTeams);
    expect(result).toContain("Confidence");
    expect(result).toContain("Chiefs");
    expect(result).toContain("-140");
  });

  test("should parse clipboard data correctly", () => {
    const clipboardText =
      "Confidence\tAway\tAway Odds\tHome\tHome Odds\tInfo\tPick\n1\tChiefs\t-140\tLions\t+120\tThu 8:20pm\tChiefs";

    const { games, selectedTeams } = app.clipboardToArray(clipboardText);
    expect(games).toHaveLength(1);
    expect(games[0].matchup).toBe("Chiefs vs. Lions");
    expect(selectedTeams["1"]).toBe("Chiefs");
  });

  test("should check for stored data when no storage exists", () => {
    // Test when no storage exists
    mockLocalStorage.getItem.mockReturnValue(null);
    expect(app.hasStoredData()).toBe(false);
  });

  test("should test storage operations without mocking complex behavior", () => {
    // Test that the methods exist and don't throw errors
    app.games = [{ id: "1", matchup: "Test vs. Game" }];
    app.selectedTeams = { 1: "Test" };
    app.currentWeek = 8;

    expect(() => {
      app.saveToStorage();
      app.clearStorage();
    }).not.toThrow();
  });

  test("should show success messages", () => {
    // Mock document.createElement and appendChild
    const mockDiv = {
      className: "",
      textContent: "",
      remove: jest.fn(),
    };
    const originalCreateElement = document.createElement;
    const originalAppendChild = document.body.appendChild;

    document.createElement = jest.fn().mockReturnValue(mockDiv);
    document.body.appendChild = jest.fn();

    app.showMessage("Test message", "success");

    expect(mockDiv.textContent).toBe("Test message");
    expect(mockDiv.className).toContain("bg-green-500");

    // Restore originals
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
  });

  test("should show error messages", () => {
    // Mock document.createElement and appendChild
    const mockDiv = {
      className: "",
      textContent: "",
      remove: jest.fn(),
    };
    const originalCreateElement = document.createElement;
    const originalAppendChild = document.body.appendChild;

    document.createElement = jest.fn().mockReturnValue(mockDiv);
    document.body.appendChild = jest.fn();

    app.showMessage("Error message", "error");

    expect(mockDiv.textContent).toBe("Error message");
    expect(mockDiv.className).toContain("bg-red-500");

    // Restore originals
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
  });

  test("should export to clipboard", async () => {
    app.games = [
      {
        id: "1",
        matchup: "Chiefs vs. Lions",
        odds: "Chiefs: -140 / Lions: +120",
        info: "Thu 8:20pm",
      },
    ];
    app.selectedTeams = { 1: "Chiefs" };

    await app.exportToClipboard();

    expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
    const writtenText = global.navigator.clipboard.writeText.mock.calls[0][0];
    expect(writtenText).toContain("Chiefs");
    expect(writtenText).toContain("-140");
  });

  test("should import from clipboard", async () => {
    const clipboardText =
      "Confidence\tAway\tAway Odds\tHome\tHome Odds\tInfo\tPick\n1\tChiefs\t-140\tLions\t+120\tThu 8:20pm\tChiefs";
    global.navigator.clipboard.readText.mockResolvedValue(clipboardText);

    // Mock the renderGamesTable to avoid DOM manipulation issues
    app.renderGamesTable = jest.fn();
    app.saveToStorage = jest.fn();

    await app.importFromClipboard();

    expect(app.games).toHaveLength(1);
    expect(app.games[0].matchup).toBe("Chiefs vs. Lions");
    expect(app.selectedTeams["1"]).toBe("Chiefs");
  });

  test("should reorder games correctly", () => {
    app.games = [
      { id: "1", name: "Game 1" },
      { id: "2", name: "Game 2" },
      { id: "3", name: "Game 3" },
    ];

    // Mock DOM methods to avoid manipulation issues
    app.renderGamesTable = jest.fn();
    app.updateConfidenceNumbers = jest.fn();

    app.reorderGames(0, 2); // Move first game to last position

    expect(app.games[0].id).toBe("2");
    expect(app.games[1].id).toBe("3");
    expect(app.games[2].id).toBe("1");
  });

  test("should handle old format clipboard data", () => {
    const oldFormatText =
      "Confidence\tMatchup\tOdds\tInfo\n1\tChiefs vs. Lions\tChiefs: -140 / Lions: +120\tThu 8:20pm";

    const { games, selectedTeams } = app.clipboardToArray(oldFormatText);
    expect(games).toHaveLength(1);
    expect(games[0].matchup).toBe("Chiefs vs. Lions");
    expect(Object.keys(selectedTeams)).toHaveLength(0); // No picks in old format
  });

  test("should handle favorite detection with different odds formats", () => {
    const gameWithStars = {
      matchup: "Chiefs vs. Lions",
      odds: "Chiefs: -140 ★ / Lions: +120",
    };

    const favoriteInfo = app.getFavoriteInfo(gameWithStars);
    expect(favoriteInfo.favorite).toBe("Chiefs");
    expect(favoriteInfo.favoriteOdds).toBe(-140);
  });

  test("should fallback to home team as favorite when odds parsing fails", () => {
    const gameWithBadOdds = {
      matchup: "Chiefs vs. Lions",
      odds: "Invalid odds format",
    };

    const favoriteInfo = app.getFavoriteInfo(gameWithBadOdds);
    expect(favoriteInfo.favorite).toBe("Lions"); // Home team fallback
    expect(favoriteInfo.favoriteOdds).toBe(0);
  });

  test("should load selections for specific week", () => {
    app.games = [
      {
        id: "1",
        matchup: "Chiefs vs. Lions",
        odds: "Chiefs: -140 / Lions: +120",
      },
      {
        id: "2",
        matchup: "Bears vs. Packers",
        odds: "Packers: -130 / Bears: +110",
      },
    ];

    // Test default behavior
    mockLocalStorage.getItem.mockReturnValue(null);
    app.loadSelectionsForWeek(8);
    expect(app.selectedTeams["1"]).toBe("Chiefs"); // Default favorite
    expect(app.selectedTeams["2"]).toBe("Packers"); // Default favorite
  });

  test("should fallback to defaults when loading invalid saved selections", () => {
    app.games = [
      {
        id: "1",
        matchup: "Chiefs vs. Lions",
        odds: "Chiefs: -140 / Lions: +120",
      },
    ];

    // Mock invalid JSON data
    mockLocalStorage.getItem.mockReturnValue("invalid json");

    app.loadSelectionsForWeek(8);

    // Should fall back to favorite (Chiefs)
    expect(app.selectedTeams["1"]).toBe("Chiefs");
  });

  test("should handle Storage unavailable gracefully", () => {
    // Temporarily remove Storage support
    const originalStorage = global.Storage;
    delete global.Storage;

    expect(app.hasStoredData()).toBe(false);

    // No error should be thrown
    expect(() => {
      app.saveToStorage();
      app.clearStorage();
    }).not.toThrow();

    // Restore Storage
    global.Storage = originalStorage;
  });
});
