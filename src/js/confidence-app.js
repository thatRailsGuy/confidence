// NFL Confidence Pool JavaScript App
class ConfidenceApp {
  constructor() {
    this.games = [];
    this.selectedTeams = {};
    this.currentWeek = 1;
    this.draggedElement = null;
    this.init();
  }

  init() {
    this.loadInitialData();
    this.setupEventListeners();
    this.loadFromStorage();
    // Set up drag and drop for existing server-rendered table
    this.setupDragAndDrop();
    this.setupTeamSelection();
    this.updateAllTeamSelections();
  }

  loadInitialData() {
    // Load data from the page's data attributes or inline JSON
    const dataElement = document.getElementById("nfl-data");
    if (dataElement) {
      try {
        const data = JSON.parse(dataElement.textContent);
        this.games = data.games || [];
        this.currentWeek = data.currentWeek || 1;

        // Sort games by best odds (lowest favorites first)
        this.sortGamesByFavoriteOdds();

        // Initialize selections based on server-rendered data
        this.initializeDefaultSelections();

        // Re-render the table with the sorted order
        this.renderGamesTable();

        // Initialize changes indicator
        this.updateChangesIndicator();
      } catch (error) {
        console.error("Failed to parse NFL data:", error);
        this.loadFallbackData();
      }
    } else {
      this.loadFallbackData();
    }
  }

  loadFallbackData() {
    this.games = [
      {
        id: "1",
        matchup: "Chiefs vs. Lions",
        odds: "Chiefs: -140 ★ / Lions: +120",
        info: "Thu 8:20pm",
        commence_time: new Date().toISOString(),
      },
      {
        id: "2",
        matchup: "Bears vs. Packers",
        odds: "Packers: -130 ★ / Bears: +110",
        info: "Sun 1:00pm",
        commence_time: new Date().toISOString(),
      },
      {
        id: "3",
        matchup: "Cowboys vs. Giants",
        odds: "Cowboys: -125 ★ / Giants: +105",
        info: "Sun 8:20pm",
        commence_time: new Date().toISOString(),
      },
    ];
    this.sortGamesByFavoriteOdds();
    this.initializeDefaultSelections();
    this.updateChangesIndicator();
  }

  getFavoriteInfo(game) {
    const [away, home] = game.matchup.split(" vs. ");
    let awayOdds = null,
      homeOdds = null;

    if (
      game.odds &&
      game.odds.includes("/") &&
      game.odds.includes(away) &&
      game.odds.includes(home)
    ) {
      const oddsParts = game.odds.split("/").map((s) => s.trim());
      for (const part of oddsParts) {
        if (part.startsWith(away + ":"))
          awayOdds = parseInt(
            part.replace(away + ":", "").replace(/[^-\d]/g, ""),
            10
          );
        if (part.startsWith(home + ":"))
          homeOdds = parseInt(
            part.replace(home + ":", "").replace(/[^-\d]/g, ""),
            10
          );
      }
    }

    if (awayOdds !== null && homeOdds !== null) {
      if (awayOdds < homeOdds)
        return { favorite: away, favoriteOdds: awayOdds };
      else return { favorite: home, favoriteOdds: homeOdds };
    }
    return { favorite: home, favoriteOdds: 0 }; // fallback
  }

  sortGamesByFavoriteOdds() {
    this.games.sort((a, b) => {
      const aFav = this.getFavoriteInfo(a).favoriteOdds;
      const bFav = this.getFavoriteInfo(b).favoriteOdds;
      return aFav - bFav;
    });
  }

  initializeDefaultSelections() {
    for (const game of this.games) {
      this.selectedTeams[game.id] = this.getFavoriteInfo(game).favorite;
    }
  }

  setupEventListeners() {
    // Week selector
    const weekSelect = document.getElementById("week-select");
    if (weekSelect) {
      weekSelect.addEventListener("change", (e) => {
        this.currentWeek = parseInt(e.target.value, 10);
        this.loadWeekData(this.currentWeek);
      });
    }

    // Export/Import/Reset buttons
    const exportBtn = document.getElementById("export-btn");
    const importBtn = document.getElementById("import-btn");
    const resetBtn = document.getElementById("reset-btn");

    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportToClipboard());
    }

    if (importBtn) {
      importBtn.addEventListener("click", () => this.importFromClipboard());
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetToDefaults());
    }

    this.setupDragAndDrop();
    this.setupTeamSelection();
  }

  setupDragAndDrop() {
    const gameRows = document.querySelectorAll(".game-row");
    console.log(`Setting up drag and drop for ${gameRows.length} rows`);

    gameRows.forEach((row, index) => {
      row.draggable = true;
      row.dataset.index = index;

      // Add visual indicator that row is draggable
      row.style.cursor = "grab";

      row.addEventListener("dragstart", (e) => {
        console.log("Drag start", index);
        this.draggedElement = row;
        row.classList.add("dragging");
        row.style.cursor = "grabbing";
        e.dataTransfer.effectAllowed = "move";

        // Add ghost image for better visual feedback
        const dragImage = row.cloneNode(true);
        dragImage.style.opacity = "0.8";
        dragImage.style.transform = "scale(1.02)";
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
        setTimeout(() => document.body.removeChild(dragImage), 0);
      });

      row.addEventListener("dragend", () => {
        console.log("Drag end");
        row.classList.remove("dragging");
        row.style.cursor = "grab";
        this.draggedElement = null;
        this.clearDropZoneStyles();
        this.saveToStorage();
      });

      row.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (this.draggedElement && this.draggedElement !== row) {
          row.classList.add("drag-target");
        }
      });

      row.addEventListener("dragleave", (e) => {
        e.preventDefault();
        row.classList.remove("drag-target", "drag-over", "drag-over-bottom");
      });

      row.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (this.draggedElement && this.draggedElement !== row) {
          // Clear previous indicators
          this.clearDropZoneStyles();

          // Determine if we're in the top or bottom half of the row
          const rect = row.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          const isTopHalf = e.clientY < midpoint;

          if (isTopHalf) {
            row.classList.add("drag-over");
          } else {
            row.classList.add("drag-over-bottom");
          }
        }
      });

      row.addEventListener("drop", (e) => {
        e.preventDefault();
        console.log("Drop event", e);
        this.clearDropZoneStyles();

        if (this.draggedElement && this.draggedElement !== row) {
          const fromIndex = parseInt(this.draggedElement.dataset.index, 10);
          let toIndex = parseInt(row.dataset.index, 10);

          // Determine insertion point based on drop position
          const rect = row.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          const isTopHalf = e.clientY < midpoint;

          // Adjust target index for bottom half drops
          if (!isTopHalf && fromIndex < toIndex) {
            // No adjustment needed when dragging down and dropping in bottom half
          } else if (!isTopHalf && fromIndex > toIndex) {
            toIndex += 1;
          } else if (isTopHalf && fromIndex > toIndex) {
            // No adjustment needed when dragging up and dropping in top half
          } else if (isTopHalf && fromIndex < toIndex) {
            toIndex -= 1;
          }

          console.log(
            `Reordering from ${fromIndex} to ${toIndex} (${
              isTopHalf ? "top" : "bottom"
            } half)`
          );
          this.reorderGames(fromIndex, toIndex);
        }
      });
    });
  }

  clearDropZoneStyles() {
    const rows = document.querySelectorAll(".game-row");
    rows.forEach((row) => {
      row.classList.remove("drag-target", "drag-over", "drag-over-bottom");
    });
  }

  setupTeamSelection() {
    const teamCells = document.querySelectorAll(".team-cell");

    teamCells.forEach((cell) => {
      cell.addEventListener("click", () => {
        const gameId = cell.dataset.gameId;
        const team = cell.dataset.team;

        if (gameId && team) {
          this.selectedTeams[gameId] = team;
          this.updateTeamSelection(gameId);
          this.saveToStorage();
          this.updateChangesIndicator();
        }
      });
    });
  }

  reorderGames(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    const [removed] = this.games.splice(fromIndex, 1);
    this.games.splice(toIndex, 0, removed);

    this.renderGamesTable();
    this.updateConfidenceNumbers();
    this.updateChangesIndicator();
  }

  updateConfidenceNumbers() {
    const rows = document.querySelectorAll(".game-row");
    rows.forEach((row, index) => {
      const confidenceCell = row.querySelector(".confidence-number");
      if (confidenceCell) {
        confidenceCell.textContent = this.games.length - index;
      }
      // Update data-index for drag and drop
      row.dataset.index = index;
    });
  }

  updateTeamSelection(gameId) {
    const cells = document.querySelectorAll(`[data-game-id="${gameId}"]`);
    cells.forEach((cell) => {
      if (cell.dataset.team === this.selectedTeams[gameId]) {
        cell.classList.add("selected");
      } else {
        cell.classList.remove("selected");
      }
    });
    this.updateChangesIndicator();
  }

  renderGamesTable() {
    const tbody = document.getElementById("games-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    this.games.forEach((game, index) => {
      const row = this.createGameRow(game, index);
      tbody.appendChild(row);
    });

    this.setupDragAndDrop();
    this.setupTeamSelection();
    this.updateAllTeamSelections();
  }

  createGameRow(game, index) {
    const [away, home] = game.matchup.split(" vs. ");
    const confidence = this.games.length - index;

    // Parse odds
    let awayOdds = "",
      homeOdds = "";
    if (
      game.odds &&
      game.odds.includes("/") &&
      game.odds.includes(away) &&
      game.odds.includes(home)
    ) {
      const oddsParts = game.odds.split("/").map((s) => s.trim());
      for (const part of oddsParts) {
        if (part.startsWith(away + ":"))
          awayOdds = part.replace(away + ":", "").trim();
        if (part.startsWith(home + ":"))
          homeOdds = part.replace(home + ":", "").trim();
      }
    }

    const row = document.createElement("tr");
    row.className = "game-row bg-white hover:bg-gray-50 transition-colors";
    row.dataset.index = index;

    row.innerHTML = `
      <td class="p-2 text-center font-bold text-gray-800 confidence-number">${confidence}</td>
      <td class="p-2 cursor-pointer rounded team-cell ${
        this.selectedTeams[game.id] === away ? "selected" : ""
      }"
          data-game-id="${game.id}" data-team="${away}">
        <div class="flex flex-col items-center">
          <span>${away}</span>
          <span class="text-xs ${
            this.selectedTeams[game.id] === away
              ? "text-white"
              : "text-gray-600"
          }">${awayOdds}</span>
        </div>
      </td>
      <td class="p-2 cursor-pointer rounded team-cell ${
        this.selectedTeams[game.id] === home ? "selected" : ""
      }"
          data-game-id="${game.id}" data-team="${home}">
        <div class="flex flex-col items-center">
          <span>${home}</span>
          <span class="text-xs ${
            this.selectedTeams[game.id] === home
              ? "text-white"
              : "text-gray-600"
          }">${homeOdds}</span>
        </div>
      </td>
      <td class="p-2 text-center text-gray-800">
        ${
          game.overUnder
            ? `<span>${game.overUnder}</span>`
            : '<span class="text-gray-400">—</span>'
        }
      </td>
      <td class="p-2 text-center text-gray-800">
        ${
          game.impliedHome !== undefined && game.impliedAway !== undefined
            ? `<span><span class="text-xs text-gray-600">A:</span> ${game.impliedAway} <span class="text-xs text-gray-600">H:</span> ${game.impliedHome}</span>`
            : '<span class="text-gray-400">—</span>'
        }
      </td>
      <td class="p-2 text-gray-800">${game.info}</td>
    `;

    return row;
  }

  updateAllTeamSelections() {
    Object.keys(this.selectedTeams).forEach((gameId) => {
      this.updateTeamSelection(gameId);
    });
  }

  loadWeekData(week) {
    // In a static site, this would typically reload the page with new data
    // For now, we'll filter existing games by week or show a message
    console.log(`Loading week ${week} data...`);

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set("week", week);
    window.history.pushState({}, "", url);

    // You could implement client-side filtering here if the data includes all weeks
  }

  getStorageKey(suffix) {
    return `nfl-confidence-${this.currentWeek}-${suffix}`;
  }

  saveToStorage() {
    if (typeof Storage !== "undefined") {
      localStorage.setItem(
        this.getStorageKey("games"),
        JSON.stringify(this.games)
      );
      localStorage.setItem(
        this.getStorageKey("selections"),
        JSON.stringify(this.selectedTeams)
      );
    }
  }

  loadFromStorage() {
    if (typeof Storage !== "undefined") {
      const savedGames = localStorage.getItem(this.getStorageKey("games"));
      const savedSelections = localStorage.getItem(
        this.getStorageKey("selections")
      );

      if (savedGames && savedSelections) {
        try {
          const parsedGames = JSON.parse(savedGames);
          const parsedSelections = JSON.parse(savedSelections);

          // Verify saved games match current games
          const currentGameIds = new Set(this.games.map((g) => g.id));
          const savedGameIds = new Set(parsedGames.map((g) => g.id));

          if (
            parsedGames.length === this.games.length &&
            [...currentGameIds].every((id) => savedGameIds.has(id))
          ) {
            this.games = parsedGames;
            this.selectedTeams = parsedSelections;
            this.renderGamesTable();
            this.updateChangesIndicator();
          }
        } catch (error) {
          console.warn("Failed to restore saved data:", error);
        }
      }
    }
  }

  arrayToClipboard(games, selectedTeams) {
    const header = "Confidence\tAway\tAway Odds\tHome\tHome Odds\tInfo\tPick";
    const rows = games.map((g, i) => {
      const [away, home] = g.matchup.split(" vs. ");
      let awayOdds = "",
        homeOdds = "";

      if (
        g.odds &&
        g.odds.includes("/") &&
        g.odds.includes(away) &&
        g.odds.includes(home)
      ) {
        const oddsParts = g.odds.split("/").map((s) => s.trim());
        for (const part of oddsParts) {
          if (part.startsWith(away + ":"))
            awayOdds = part.replace(away + ":", "").trim();
          if (part.startsWith(home + ":"))
            homeOdds = part.replace(home + ":", "").trim();
        }
      }

      const pick = selectedTeams[g.id] || "";
      return `${
        games.length - i
      }\t${away}\t${awayOdds}\t${home}\t${homeOdds}\t${g.info}\t${pick}`;
    });

    return [header, ...rows].join("\n");
  }

  async exportToClipboard() {
    try {
      const text = this.arrayToClipboard(this.games, this.selectedTeams);
      await navigator.clipboard.writeText(text);
      this.showMessage("Exported to clipboard!");
    } catch (error) {
      console.error("Export failed:", error);
      this.showMessage("Export failed. Please try again.", "error");
    }
  }

  async importFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const { games, selectedTeams } = this.clipboardToArray(text);

      if (games.length) {
        this.games = games;
        if (Object.keys(selectedTeams).length) {
          this.selectedTeams = selectedTeams;
        }
        this.renderGamesTable();
        this.saveToStorage();
        this.updateChangesIndicator();
        this.showMessage("Data imported successfully!");
      } else {
        this.showMessage("Clipboard data invalid or empty.", "error");
      }
    } catch (error) {
      console.error("Import failed:", error);
      this.showMessage("Failed to parse clipboard data.", "error");
    }
  }

  clipboardToArray(text) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines[0].toLowerCase();
    const isNewFormat = header.includes("away") && header.includes("pick");
    const games = [];
    const selectedTeams = {};

    lines.slice(1).forEach((line, idx) => {
      const cols = line.split("\t");
      if (isNewFormat) {
        const [, away, awayOdds, home, homeOdds, info, pick] = cols;
        const matchup = `${away} vs. ${home}`;
        const odds = `${away}: ${awayOdds} / ${home}: ${homeOdds}`;

        games.push({
          id: `${idx + 1}`,
          matchup,
          odds,
          info,
          commence_time: new Date().toISOString(),
        });

        if (pick) selectedTeams[`${idx + 1}`] = pick;
      } else {
        // Fallback to old format
        const [, matchup, odds, info] = cols;
        games.push({
          id: `${idx + 1}`,
          matchup,
          odds,
          info,
          commence_time: new Date().toISOString(),
        });
      }
    });

    return { games, selectedTeams };
  }

  resetToDefaults() {
    // Reload original data from the page
    const dataElement = document.getElementById("nfl-data");
    if (dataElement) {
      try {
        const data = JSON.parse(dataElement.textContent);
        this.games = [...(data.games || [])]; // Create a fresh copy

        // Sort games by best odds (lowest favorites first)
        this.sortGamesByFavoriteOdds();

        // Reset to default selections (favorites)
        this.initializeDefaultSelections();

        // Re-render the table
        this.renderGamesTable();

        // Clear localStorage
        this.clearStorage();

        // Update changes indicator
        this.updateChangesIndicator();

        this.showMessage("Reset to default order and selections!");
      } catch (error) {
        console.error("Failed to reset:", error);
        this.showMessage("Failed to reset. Please refresh the page.", "error");
      }
    }
  }

  getDefaultState() {
    // Get the original data and default selections
    const dataElement = document.getElementById("nfl-data");
    if (dataElement) {
      try {
        const data = JSON.parse(dataElement.textContent);
        const defaultGames = [...(data.games || [])];

        // Sort to get default order
        defaultGames.sort((a, b) => {
          const aFav = this.getFavoriteInfo(a).favoriteOdds;
          const bFav = this.getFavoriteInfo(b).favoriteOdds;
          return aFav - bFav;
        });

        // Get default selections (favorites)
        const defaultSelections = {};
        for (const game of defaultGames) {
          defaultSelections[game.id] = this.getFavoriteInfo(game).favorite;
        }

        return { defaultGames, defaultSelections };
      } catch (error) {
        console.error("Failed to get default state:", error);
      }
    }
    return null;
  }

  hasChangesFromDefaults() {
    const defaultState = this.getDefaultState();
    if (!defaultState) {
      console.log("No default state available");
      return false;
    }

    const { defaultGames, defaultSelections } = defaultState;

    // Check if game order has changed
    const currentOrder = this.games.map((g) => g.id).join(",");
    const defaultOrder = defaultGames.map((g) => g.id).join(",");

    console.log("Current order:", currentOrder);
    console.log("Default order:", defaultOrder);

    if (currentOrder !== defaultOrder) {
      console.log("Order has changed");
      return true;
    }

    // Check if team selections have changed
    for (const gameId of Object.keys(this.selectedTeams)) {
      console.log(
        `Game ${gameId}: current=${this.selectedTeams[gameId]}, default=${defaultSelections[gameId]}`
      );
      if (this.selectedTeams[gameId] !== defaultSelections[gameId]) {
        console.log("Team selection has changed");
        return true;
      }
    }

    console.log("No changes detected");
    return false;
  }

  updateChangesIndicator() {
    const indicator = document.getElementById("changes-indicator");
    if (!indicator) {
      console.warn("Changes indicator element not found!");
      return;
    }

    const hasChanges = this.hasChangesFromDefaults();
    console.log("Checking for changes:", hasChanges);

    if (hasChanges) {
      indicator.classList.remove("hidden");
      console.log("Showing changes indicator");
    } else {
      indicator.classList.add("hidden");
      console.log("Hiding changes indicator");
    }
  }
  clearStorage() {
    if (typeof Storage !== "undefined") {
      localStorage.removeItem(this.getStorageKey("games"));
      localStorage.removeItem(this.getStorageKey("selections"));
    }
  }

  showMessage(message, type = "success") {
    // Create and show a temporary message
    const messageDiv = document.createElement("div");
    messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing ConfidenceApp...");

  // Debug: Check if changes indicator exists
  const indicator = document.getElementById("changes-indicator");
  console.log("Changes indicator element found:", !!indicator);

  const app = new ConfidenceApp();
  console.log("ConfidenceApp initialized:", app);

  // Make app available globally for debugging
  window.confidenceApp = app;
});
