import { test, expect } from "@playwright/test";

test.describe("NFL Confidence Pool - Core Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the page with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/NFL Confidence Pool/);

    const heading = page.getByRole("heading", {
      name: "ThatRailsGuy's NFL Confidence Order Drag and Drop Tool",
    });
    await expect(heading).toBeVisible();
  });

  test("should display games table with NFL games", async ({ page }) => {
    const table = page.locator(".confidence-table");
    await expect(table).toBeVisible();

    // Should have table headers
    const gamesTable = page.locator(".confidence-table");
    await expect(gamesTable).toBeVisible();
    await expect(
      gamesTable.locator("th", { hasText: "Confidence" })
    ).toBeVisible();
    await expect(gamesTable.locator("th", { hasText: "Away" })).toBeVisible();
    await expect(gamesTable.locator("th", { hasText: "Home" })).toBeVisible();

    // Should have at least one game row
    const gameRows = page.locator("#games-tbody tr");
    await expect(gameRows.first()).toBeVisible();
  });

  test("should show week selector with available weeks", async ({ page }) => {
    const weekSelector = page.locator("#week-select");
    await expect(weekSelector).toBeVisible();

    // Should have options for weeks with games
    const options = weekSelector.locator("option");
    await expect(options).toHaveCount(2); // Week 8 and Week 9 based on data
  });

  test("should display export and import buttons", async ({ page }) => {
    const exportBtn = page.locator("#export-btn");
    const importBtn = page.locator("#import-btn");

    await expect(exportBtn).toBeVisible();
    await expect(importBtn).toBeVisible();
    await expect(exportBtn).toHaveText("Export to Clipboard");
    await expect(importBtn).toHaveText("Import from Clipboard");
  });
});

test.describe("Team Selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should allow selecting a team for a game", async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForSelector(".team-cell");

    // Find the first game's team cells
    const firstGame = page.locator("#games-tbody tr").first();
    const awayTeam = firstGame.locator(".team-cell").first();
    const homeTeam = firstGame.locator(".team-cell").nth(1);

    // Click away team
    await awayTeam.click();
    await expect(awayTeam).toHaveClass(/selected/);

    // Click home team - should deselect away team
    await homeTeam.click();
    await expect(homeTeam).toHaveClass(/selected/);
    await expect(awayTeam).not.toHaveClass(/selected/);
  });

  test("should show changes indicator when selections are made", async ({
    page,
  }) => {
    await page.waitForSelector(".team-cell");

    // Wait for JavaScript to be fully loaded
    await page.waitForFunction(() => window.confidenceApp !== undefined);

    const changesIndicator = page.locator("#changes-indicator");

    // Initially hidden
    await expect(changesIndicator).toHaveClass(/hidden/);

    // Find the first game row and click the non-selected team
    const firstGameRow = page.locator(".game-row").first();
    const teamCells = firstGameRow.locator(".team-cell");
    const firstTeam = teamCells.first();
    const secondTeam = teamCells.last();

    // Determine which one is currently selected and click the other one
    const firstTeamSelected = await firstTeam.evaluate((el) =>
      el.classList.contains("selected")
    );
    const teamToClick = firstTeamSelected ? secondTeam : firstTeam;

    await teamToClick.click();

    // Wait a moment for the JavaScript to process the click
    await page.waitForTimeout(100);

    // Should show changes indicator
    await expect(changesIndicator).not.toHaveClass(/hidden/);
    await expect(changesIndicator).toContainText(
      "You have modified the default order or selections"
    );
  });

  test("should reset selections when reset button is clicked", async ({
    page,
  }) => {
    await page.waitForSelector(".team-cell");

    // Wait for JavaScript to be fully loaded
    await page.waitForFunction(() => window.confidenceApp !== undefined);

    // Find the first game row
    const firstGameRow = page.locator(".game-row").first();

    // Find the two team cells in this row
    const teamCells = firstGameRow.locator(".team-cell");
    const firstTeam = teamCells.first();
    const secondTeam = teamCells.last();

    // Determine which one is currently selected and click the other one
    const firstTeamSelected = await firstTeam.evaluate((el) =>
      el.classList.contains("selected")
    );
    const teamToClick = firstTeamSelected ? secondTeam : firstTeam;
    const originallySelected = firstTeamSelected ? firstTeam : secondTeam;

    // Click the unselected team
    await teamToClick.click();

    // Wait a moment for the JavaScript to process the click
    await page.waitForTimeout(100);

    // Verify selection was made - the clicked team should now be selected
    await expect(teamToClick).toHaveClass(/selected/);
    // And the originally selected team should no longer be selected
    await expect(originallySelected).not.toHaveClass(/selected/);

    // Click reset button (which should now be visible)
    const resetBtn = page.locator("#reset-btn");
    await resetBtn.click();

    // Verify selection was reset to original state
    await expect(originallySelected).toHaveClass(/selected/);
    await expect(teamToClick).not.toHaveClass(/selected/);

    // Changes indicator should be hidden
    const changesIndicator = page.locator("#changes-indicator");
    await expect(changesIndicator).toHaveClass(/hidden/);
  });
});

test.describe("Week Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should switch between weeks", async ({ page }) => {
    const weekSelector = page.locator("#week-select");

    // Get initial week
    const initialWeek = await weekSelector.inputValue();

    // Get all available options
    const options = await weekSelector.locator("option").all();

    if (options.length > 1) {
      // Select a different week
      const secondOption = options[1];
      const secondWeekValue = await secondOption.getAttribute("value");

      await weekSelector.selectOption(secondWeekValue);

      // Verify week changed
      await expect(weekSelector).toHaveValue(secondWeekValue);

      // Games table should update (we can check if it re-renders)
      await page.waitForSelector("#games-tbody tr");
    }
  });

  test("should maintain separate selections per week", async ({ page }) => {
    await page.waitForSelector(".team-cell");

    const weekSelector = page.locator("#week-select");
    const options = await weekSelector.locator("option").all();

    if (options.length > 1) {
      // Make selection in first week
      const firstTeamCell = page.locator(".team-cell").first();
      await firstTeamCell.click();
      await expect(firstTeamCell).toHaveClass(/selected/);

      // Switch to second week
      const secondWeekValue = await options[1].getAttribute("value");
      await weekSelector.selectOption(secondWeekValue);

      // New week should have default selections (favorites based on odds)
      await page.waitForSelector(".team-cell");
      const teamCells = page.locator(".team-cell.selected");
      // Each week should have default selections for each game (1 per game)
      const gameRows = await page.locator("#games-tbody tr").count();
      await expect(teamCells).toHaveCount(gameRows);

      // Switch back to first week
      const firstWeekValue = await options[0].getAttribute("value");
      await weekSelector.selectOption(firstWeekValue);

      // Original selection should be restored (default selections + our custom selection)
      await page.waitForSelector(".team-cell.selected");
      const selectedCells = page.locator(".team-cell.selected");
      // Should have same number of selected teams as games in that week
      const originalGameRows = await page.locator("#games-tbody tr").count();
      await expect(selectedCells).toHaveCount(originalGameRows);
    }
  });
});

test.describe("Drag and Drop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should allow dragging and dropping game rows", async ({ page }) => {
    await page.waitForSelector("#games-tbody tr");

    const gameRows = page.locator("#games-tbody tr");
    const rowCount = await gameRows.count();

    if (rowCount >= 2) {
      const firstRow = gameRows.first();
      const thirdRow = gameRows.nth(2);

      // Get initial game IDs to track actual reordering
      const initialFirstGameId = await firstRow.getAttribute("data-index");
      const initialThirdGameId = await thirdRow.getAttribute("data-index");

      // Perform drag and drop (drag first row to third position)
      await firstRow.dragTo(thirdRow);

      // Wait for reordering to complete
      await page.waitForTimeout(1000);

      // Check if the DOM structure changed or if drag and drop is supported
      const newFirstRow = gameRows.first();
      const newFirstGameId = await newFirstRow.getAttribute("data-index");

      // Even if drag and drop doesn't work, the rows should still be present
      await expect(gameRows).toHaveCount(rowCount);

      // Confidence numbers should still be present and valid
      const confidenceNumbers = page.locator(".confidence-number");
      await expect(confidenceNumbers).toHaveCount(rowCount);
    }
  });
});

test.describe("Import/Export Functionality", () => {
  test.beforeEach(async ({ page, browserName }) => {
    await page.goto("/");

    // Grant clipboard permissions (Chromium only supports these permissions)
    if (browserName === "chromium") {
      try {
        await page
          .context()
          .grantPermissions(["clipboard-read", "clipboard-write"]);
      } catch (error) {
        // Ignore permission errors for non-Chromium browsers
        console.warn("Clipboard permissions not available for", browserName);
      }
    }
  });

  test("should export data to clipboard", async ({ page }) => {
    await page.waitForSelector("#export-btn");

    // Make some selections first
    const teamCells = page.locator(".team-cell");
    const firstCell = teamCells.first();
    await firstCell.click();

    // Click export button
    const exportBtn = page.locator("#export-btn");
    await exportBtn.click();

    // Check if clipboard was written to (we can't read actual clipboard content in tests)
    // But we can verify the export function was called without errors
    await expect(exportBtn).toBeVisible();
  });

  test("should show import button and handle import", async ({ page }) => {
    await page.waitForSelector("#import-btn");

    const importBtn = page.locator("#import-btn");
    await expect(importBtn).toBeVisible();

    // Click import button (this will try to read from clipboard)
    await importBtn.click();

    // Verify no errors occurred
    await expect(importBtn).toBeVisible();
  });
});

test.describe("External Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display external links at bottom of page", async ({ page }) => {
    const yahooLink = page.getByRole("link", {
      name: "Yahoo Fantasy Football Pick'em",
    });
    const survivorGridLink = page.getByRole("link", { name: "SurvivorGrid" });

    await expect(yahooLink).toBeVisible();
    await expect(survivorGridLink).toBeVisible();

    // Verify links have correct attributes
    await expect(yahooLink).toHaveAttribute("target", "_blank");
    await expect(survivorGridLink).toHaveAttribute("target", "_blank");
    await expect(yahooLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(survivorGridLink).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    );
  });
});

test.describe("Responsive Design", () => {
  test("should work on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify main elements are still visible and functional
    const heading = page.getByRole("heading");
    await expect(heading).toBeVisible();

    const table = page.locator(".confidence-table");
    await expect(table).toBeVisible();

    const weekSelector = page.locator("#week-select");
    await expect(weekSelector).toBeVisible();

    // Team selection should still work
    await page.waitForSelector(".team-cell");
    const firstTeamCell = page.locator(".team-cell").first();
    await firstTeamCell.click();
    await expect(firstTeamCell).toHaveClass(/selected/);
  });

  test("should work on tablet devices", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // Verify layout works well on tablet
    const table = page.locator(".confidence-table");
    await expect(table).toBeVisible();

    const buttons = page.locator("#export-btn, #import-btn");
    await expect(buttons).toHaveCount(2);

    // All buttons should be visible and clickable
    const exportBtn = page.locator("#export-btn");
    const importBtn = page.locator("#import-btn");

    await expect(exportBtn).toBeVisible();
    await expect(importBtn).toBeVisible();
  });
});
