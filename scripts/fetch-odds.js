import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NFL odds fetching utility converted for Node.js
async function fetchNflOdds() {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.error("Missing ODDS_API_KEY environment variable");
    return [];
  }

  console.log("Fetching NFL odds from The Odds API...");

  try {
    const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?oddsFormat=american&regions=us&markets=h2h,spreads,totals&apiKey=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`Fetched ${data.length} games from API`);

    // List of preferred US bookmakers in order
    const preferredBookmakers = [
      "draftkings",
      "fanduel",
      "caesars",
      "betmgm",
      "pointsbetus",
      "barstool",
      "betrivers",
      "unibet",
      "betonlineag",
      "bovada",
      "williamhill_us",
      "sugarhouse",
    ];

    const games = data.map((game, idx) => {
      const home = game.home_team;
      const away = game.away_team;
      const matchup = `${away} vs. ${home}`;
      const commence = new Date(game.commence_time);
      const info = commence.toLocaleString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      const commence_time = game.commence_time;

      // Find preferred bookmaker with h2h odds
      let bookmaker = null;
      if (game.bookmakers && Array.isArray(game.bookmakers)) {
        bookmaker = preferredBookmakers
          .map((key) => game.bookmakers.find((b) => b.key === key))
          .find(
            (b) => b && b.markets && b.markets.some((m) => m.key === "h2h")
          );
        if (!bookmaker) {
          // fallback: just use the first bookmaker with h2h
          bookmaker = game.bookmakers.find(
            (b) => b.markets && b.markets.some((m) => m.key === "h2h")
          );
        }
      }

      let odds = "";
      let overUnder = undefined;
      let impliedHome = undefined;
      let impliedAway = undefined;

      if (bookmaker) {
        const h2h = bookmaker.markets.find((m) => m.key === "h2h");
        const totals = bookmaker.markets.find((m) => m.key === "totals");

        if (h2h && h2h.outcomes) {
          // Find odds for away and home teams
          const awayOdds = h2h.outcomes.find((o) => o.name === away);
          const homeOdds = h2h.outcomes.find((o) => o.name === home);

          if (awayOdds && homeOdds) {
            const awayPrice = awayOdds.price;
            const homePrice = homeOdds.price;

            let favorite, favoriteOdds, underdog, underdogOdds;
            if (awayPrice < homePrice) {
              favorite = away;
              favoriteOdds = awayPrice;
              underdog = home;
              underdogOdds = homePrice;
            } else {
              favorite = home;
              favoriteOdds = homePrice;
              underdog = away;
              underdogOdds = awayPrice;
            }
            odds = `${favorite}: ${
              favoriteOdds > 0 ? "+" : ""
            }${favoriteOdds} ★ / ${underdog}: ${
              underdogOdds > 0 ? "+" : ""
            }${underdogOdds}`;

            // Implied probability: -odds/(odds-100) for negative, 100/(odds+100) for positive
            function impliedProb(odds) {
              return odds < 0 ? -odds / (-odds + 100) : 100 / (odds + 100);
            }

            // Over/under (totals) and spread for implied points
            if (totals && totals.outcomes) {
              // Find the first "Over" outcome for the total points
              const over = totals.outcomes.find((o) => o.name === "Over");
              if (over && over.point) {
                overUnder = over.point;
                const total = Number(over.point);

                // Try to get spread from spreads market
                const spreads = bookmaker.markets.find(
                  (m) => m.key === "spreads"
                );
                let spread = undefined;

                if (spreads && spreads.outcomes) {
                  // Find spread for home team (should be negative if favored)
                  const homeSpread = spreads.outcomes.find(
                    (o) => o.name === home
                  );
                  const awaySpread = spreads.outcomes.find(
                    (o) => o.name === away
                  );
                  // Prefer home spread if available, else away (negate for away)
                  if (homeSpread && typeof homeSpread.point === "number") {
                    spread = homeSpread.point;
                  } else if (
                    awaySpread &&
                    typeof awaySpread.point === "number"
                  ) {
                    spread = -awaySpread.point;
                  }
                }

                if (typeof spread === "number" && !isNaN(spread)) {
                  // Use spread for implied points
                  impliedHome = Math.round(total / 2 - spread / 2);
                  impliedAway = Math.round(total / 2 + spread / 2);
                } else {
                  // Fallback: use odds to estimate
                  const homeProb = impliedProb(homePrice);
                  const awayProb = impliedProb(awayPrice);
                  impliedHome = Math.round(
                    (total * homeProb) / (homeProb + awayProb)
                  );
                  impliedAway = Math.round(
                    (total * awayProb) / (homeProb + awayProb)
                  );
                }
              }
            }
          } else {
            // fallback: show all outcomes
            odds = h2h.outcomes
              .map((o) => `${o.name}: ${o.price > 0 ? "+" : ""}${o.price}`)
              .join(" / ");
          }
        }
      }

      return {
        id: game.id || String(idx),
        matchup,
        odds,
        info,
        commence_time,
        overUnder,
        impliedHome,
        impliedAway,
      };
    });

    return games;
  } catch (error) {
    console.error("Error fetching NFL odds:", error);
    return [];
  }
}

// Helper to get NFL week 1 start date (Tuesday after Labor Day)
function getNflSeasonStart(year = new Date().getUTCFullYear()) {
  // Find first Monday in September (Labor Day)
  const sep1 = new Date(Date.UTC(year, 8, 1)); // September 1
  const laborDay = new Date(sep1);
  while (laborDay.getUTCDay() !== 1) {
    // Find first Monday
    laborDay.setUTCDate(laborDay.getUTCDate() + 1);
  }

  // Week 1 starts the Tuesday after Labor Day
  const week1Start = new Date(laborDay);
  week1Start.setUTCDate(laborDay.getUTCDate() + 1); // Tuesday after Labor Day

  return week1Start;
}

// Helper to get week start/end for a given NFL week
function getNflWeekRange(week, year = new Date().getUTCFullYear()) {
  const week1Start = getNflSeasonStart(year);

  // Start of week N: week1Start + (week-1)*7 days (Tuesday)
  // But start at 12:00 PM UTC on Tuesday to avoid overlap with previous week's Monday night games
  const weekStart = new Date(week1Start);
  weekStart.setUTCDate(week1Start.getUTCDate() + (week - 1) * 7);
  weekStart.setUTCHours(12, 0, 0, 0); // Noon UTC on Tuesday

  // End: weekStart + 7 days at 11:59 AM UTC (to capture Monday night games)
  // Monday night games in US are typically Tuesday 1-2 AM UTC
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);
  weekEnd.setUTCHours(11, 59, 59, 999); // Tuesday 11:59 AM UTC (next week)

  return { weekStart, weekEnd };
}

// Helper to get current NFL week number (week 1 starts Tuesday after Labor Day)
function getCurrentNflWeek(today = new Date()) {
  const year = today.getUTCFullYear();

  // Determine which season year to use. If today is before the season
  // start for the current calendar year, the active NFL season started
  // in the previous calendar year (e.g. Jan/Feb games belong to prior season).
  let seasonYear = year;
  const currentYearWeek1Start = getNflSeasonStart(year);
  if (today < currentYearWeek1Start) {
    seasonYear = year - 1;
  }

  const week1Start = getNflSeasonStart(seasonYear);

  // If still before the computed week1Start, return 1 as a safe default
  if (today < week1Start) return 1;

  // Calculate week number based on days since week 1 start
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const week = Math.floor((today.getTime() - week1Start.getTime()) / msPerWeek) + 1;

  // Cap at week 18 (end of regular season)
  return Math.min(week, 18);
}

async function main() {
  console.log("Starting NFL odds fetch script...");

  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, "..", "src", "_data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Fetch all games
  const allGames = await fetchNflOdds();

  if (allGames.length === 0) {
    console.log("No games fetched, using fallback data");
    // Fallback games
    const fallbackGames = [
      {
        id: "1",
        matchup: "Chiefs vs. Lions",
        odds: "+120 / -140",
        info: "Thu 8:20pm",
        commence_time: new Date().toISOString(),
      },
      {
        id: "2",
        matchup: "Bears vs. Packers",
        odds: "+110 / -130",
        info: "Sun 1:00pm",
        commence_time: new Date().toISOString(),
      },
      {
        id: "3",
        matchup: "Cowboys vs. Giants",
        odds: "+105 / -125",
        info: "Sun 8:20pm",
        commence_time: new Date().toISOString(),
      },
    ];

    // Write fallback data
    const outputPath = path.join(dataDir, "nfl_odds.json");
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          lastUpdated: new Date().toISOString(),
          currentWeek: getCurrentNflWeek(),
          games: fallbackGames,
        },
        null,
        2
      )
    );

    console.log(`Wrote fallback data to ${outputPath}`);
    return;
  }

  // Group games by week
  const gamesByWeek = {};
  const currentWeek = getCurrentNflWeek();

  for (let week = 1; week <= 18; week++) {
    const { weekStart, weekEnd } = getNflWeekRange(week);
    const weekGames = allGames.filter((game) => {
      if (!game.commence_time) return false;
      const dt = new Date(game.commence_time);
      return dt >= weekStart && dt < weekEnd;
    });
    gamesByWeek[week] = weekGames;
  }

  // Write main odds file
  const outputPath = path.join(dataDir, "nfl_odds.json");
  const data = {
    lastUpdated: new Date().toISOString(),
    currentWeek: currentWeek,
    games: allGames,
    gamesByWeek: gamesByWeek,
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Wrote ${allGames.length} games to ${outputPath}`);
  console.log(`Current NFL Week: ${currentWeek}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { fetchNflOdds, getNflWeekRange, getCurrentNflWeek, getNflSeasonStart };
