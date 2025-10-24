/**
 * Test utilities for NFL Confidence Pool testing
 * Common helpers and mock data for unit and integration tests
 */

export const mockGameData = {
  games: [
    {
      id: "game1",
      matchup: "Minnesota Vikings vs. Los Angeles Chargers",
      odds: "Los Angeles Chargers: -166 ★ / Minnesota Vikings: +140",
      info: "Thu 07:15 PM",
      commence_time: "2025-10-24T00:15:00Z",
      overUnder: 44.5,
      impliedHome: 24,
      impliedAway: 21,
    },
    {
      id: "game2",
      matchup: "Miami Dolphins vs. Atlanta Falcons",
      odds: "Atlanta Falcons: -440 ★ / Miami Dolphins: +340",
      info: "Sun 12:00 PM",
      commence_time: "2025-10-26T17:00:00Z",
      overUnder: 44.5,
      impliedHome: 26,
      impliedAway: 18,
    },
    {
      id: "game3",
      matchup: "Buffalo Bills vs. Green Bay Packers",
      odds: "Buffalo Bills: -200 ★ / Green Bay Packers: +170",
      info: "Sun 4:25 PM",
      commence_time: "2025-10-26T21:25:00Z",
      overUnder: 47.5,
      impliedHome: 23,
      impliedAway: 25,
    },
  ],
  gamesByWeek: {
    8: [
      {
        id: "game1",
        matchup: "Minnesota Vikings vs. Los Angeles Chargers",
        odds: "Los Angeles Chargers: -166 ★ / Minnesota Vikings: +140",
        info: "Thu 07:15 PM",
      },
      {
        id: "game2",
        matchup: "Miami Dolphins vs. Atlanta Falcons",
        odds: "Atlanta Falcons: -440 ★ / Miami Dolphins: +340",
        info: "Sun 12:00 PM",
      },
    ],
    9: [
      {
        id: "game3",
        matchup: "Buffalo Bills vs. Green Bay Packers",
        odds: "Buffalo Bills: -200 ★ / Green Bay Packers: +170",
        info: "Sun 4:25 PM",
      },
    ],
  },
  currentWeek: 8,
  lastUpdated: "2025-10-23T22:59:41.066Z",
};

export function createMockDOM(gamesData = mockGameData) {
  return `
    <div id="nfl-data">${JSON.stringify(gamesData)}</div>
    <select id="week-select" class="week-selector">
      <option value="8" selected>Week 8</option>
      <option value="9">Week 9</option>
    </select>
    <table class="confidence-table">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2">Confidence</th>
          <th class="p-2">Away</th>
          <th class="p-2">Home</th>
          <th class="p-2">O/U</th>
          <th class="p-2">Implied</th>
          <th class="p-2">Info</th>
        </tr>
      </thead>
      <tbody id="games-tbody">
        ${gamesData.games
          .map((game, index) => {
            const teams = game.matchup.split(" vs. ");
            const confidence = gamesData.games.length - index;
            return `
            <tr data-game-id="${game.id}" draggable="true">
              <td class="confidence-rank p-2">${confidence}</td>
              <td class="team-cell away-team p-2" data-team="${teams[0]}">${
              teams[0]
            }</td>
              <td class="team-cell home-team p-2" data-team="${teams[1]}">${
              teams[1]
            }</td>
              <td class="p-2">${game.overUnder || "N/A"}</td>
              <td class="p-2">${game.impliedAway || 0} - ${
              game.impliedHome || 0
            }</td>
              <td class="p-2">${game.info}</td>
            </tr>
          `;
          })
          .join("")}
      </tbody>
    </table>
    <button id="export-btn" class="export-btn">Export to Clipboard</button>
    <button id="import-btn" class="import-btn">Import from Clipboard</button>
    <button id="reset-btn" class="reset-btn">Reset to Defaults</button>
    <div id="changes-indicator" class="hidden">Changes indicator</div>
  `;
}

export function setupMockLocalStorage() {
  const store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
}

export function createDragEvent(type, dataTransfer = null) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  event.dataTransfer = dataTransfer || new DataTransfer();
  return event;
}

export function waitForAsync(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mockClipboardAPI() {
  const mockClipboard = {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(""),
    read: jest.fn().mockResolvedValue([]),
    write: jest.fn().mockResolvedValue(undefined),
  };

  Object.defineProperty(navigator, "clipboard", {
    value: mockClipboard,
    writable: true,
  });

  return mockClipboard;
}

export function createMockConfidenceApp(customData = {}) {
  const defaultData = {
    games: mockGameData.games,
    gamesByWeek: mockGameData.gamesByWeek,
    currentWeek: mockGameData.currentWeek,
    selectedTeams: {},
    draggedElement: null,
  };

  return {
    ...defaultData,
    ...customData,
    init: jest.fn(),
    loadInitialData: jest.fn(),
    setupEventListeners: jest.fn(),
    loadFromStorage: jest.fn(),
    saveToStorage: jest.fn(),
    selectTeam: jest.fn(),
    updateTeamSelection: jest.fn(),
    hasChangesFromDefaults: jest.fn(() => false),
    updateChangesIndicator: jest.fn(),
    resetToDefaults: jest.fn(),
    loadWeekData: jest.fn(),
    getStorageKey: jest.fn(
      (key) => `confidence-pool-${key}-week-${defaultData.currentWeek}`
    ),
    generateExportData: jest.fn(),
    importData: jest.fn(),
    setupDragAndDrop: jest.fn(),
    handleDragStart: jest.fn(),
    handleDragOver: jest.fn(),
    handleDrop: jest.fn(),
  };
}

export const csvTestData = {
  valid: `Confidence,Matchup,Pick
1,Minnesota Vikings vs. Los Angeles Chargers,Los Angeles Chargers
2,Miami Dolphins vs. Atlanta Falcons,Atlanta Falcons
3,Buffalo Bills vs. Green Bay Packers,Buffalo Bills`,

  invalid: `Invalid,CSV,Data
1,2,3`,

  empty: "",

  malformed: `Confidence,Matchup
1,Team A vs Team B,Extra Column`,
};

export function assertElementHasClass(element, className) {
  expect(element.classList.contains(className)).toBe(true);
}

export function assertElementNotHasClass(element, className) {
  expect(element.classList.contains(className)).toBe(false);
}
