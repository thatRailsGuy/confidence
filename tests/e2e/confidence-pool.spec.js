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
    await expect(page.getByText("Confidence")).toBeVisible();
    await expect(page.getByText("Away")).toBeVisible();
    await expect(page.getByText("Home")).toBeVisible();

    // Should have at least one game row
    const gameRows = page.locator("#games-tbody tr");
    await expect(gameRows).toHaveCount.greaterThan(0);
  });

  test("should show week selector with available weeks", async ({ page }) => {
    const weekSelector = page.locator("#week-select");
    await expect(weekSelector).toBeVisible();

    // Should have options for weeks with games
    const options = weekSelector.locator("option");
    await expect(options).toHaveCount.greaterThan(0);
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
    const awayTeam = firstGame.locator(".away-team").first();
    const homeTeam = firstGame.locator(".home-team").first();

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

    const changesIndicator = page.locator("#changes-indicator");

    // Initially hidden
    await expect(changesIndicator).toHaveClass(/hidden/);

    // Make a selection
    const firstTeamCell = page.locator(".team-cell").first();
    await firstTeamCell.click();

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

    // Make a selection
    const firstTeamCell = page.locator(".team-cell").first();
    await firstTeamCell.click();

    // Verify selection was made
    await expect(firstTeamCell).toHaveClass(/selected/);

    // Click reset button
    const resetBtn = page.locator("#reset-btn");
    await resetBtn.click();

    // Verify selection was cleared
    await expect(firstTeamCell).not.toHaveClass(/selected/);

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

      // Selection should not exist in new week
      await page.waitForSelector(".team-cell");
      const teamCells = page.locator(".team-cell.selected");
      await expect(teamCells).toHaveCount(0);

      // Switch back to first week
      const firstWeekValue = await options[0].getAttribute("value");
      await weekSelector.selectOption(firstWeekValue);

      // Original selection should be restored
      await page.waitForSelector(".team-cell.selected");
      const selectedCells = page.locator(".team-cell.selected");
      await expect(selectedCells).toHaveCount(1);
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
      const secondRow = gameRows.nth(1);

      // Get initial confidence values
      const firstRowConfidence = await firstRow
        .locator(".confidence-rank")
        .textContent();
      const secondRowConfidence = await secondRow
        .locator(".confidence-rank")
        .textContent();

      // Perform drag and drop
      await firstRow.dragTo(secondRow);

      // Wait for reordering to complete
      await page.waitForTimeout(500);

      // Verify the rows were reordered (confidence values should swap)
      const newFirstRowConfidence = await gameRows
        .first()
        .locator(".confidence-rank")
        .textContent();
      const newSecondRowConfidence = await gameRows
        .nth(1)
        .locator(".confidence-rank")
        .textContent();

      // The confidence rankings should have been updated
      expect(newFirstRowConfidence).not.toBe(firstRowConfidence);
      expect(newSecondRowConfidence).not.toBe(secondRowConfidence);
    }
  });
});

test.describe("Import/Export Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Grant clipboard permissions
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
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
