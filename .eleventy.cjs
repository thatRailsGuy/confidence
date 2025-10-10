module.exports = function (eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Watch for changes
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // Add date filter
  eleventyConfig.addFilter("dateFormat", function (date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  });

  // Add range filter for generating number sequences
  eleventyConfig.addFilter("range", function (start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  });

  // Add split filter for strings
  eleventyConfig.addFilter("split", function (str, delimiter) {
    return str ? str.split(delimiter) : [];
  });

  // Add includes filter for checking if string contains substring
  eleventyConfig.addFilter("includes", function (str, substring) {
    return str ? str.includes(substring) : false;
  });

  // Add startsWith filter
  eleventyConfig.addFilter("startsWith", function (str, prefix) {
    return str ? str.startsWith(prefix) : false;
  });

  // Add replace filter
  eleventyConfig.addFilter("replace", function (str, search, replacement) {
    return str ? str.replace(new RegExp(search, "g"), replacement) : "";
  });

  // Add trim filter
  eleventyConfig.addFilter("trim", function (str) {
    return str ? str.trim() : "";
  });

  // Add JSON filter for safe JSON serialization
  eleventyConfig.addFilter("json", function (obj) {
    return JSON.stringify(obj);
  });

  // Add filter to get favorite team from odds
  eleventyConfig.addFilter("getFavorite", function (game) {
    if (!game || !game.odds || !game.matchup) return null;

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
      if (awayOdds < homeOdds) return away;
      else return home;
    }
    return home; // fallback
  });

  // Add filter to get favorite odds value for sorting
  eleventyConfig.addFilter("getFavoriteOdds", function (game) {
    if (!game || !game.odds || !game.matchup) return 0;

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
      return Math.min(awayOdds, homeOdds); // Return the favorite odds (more negative = stronger favorite)
    }
    return 0; // fallback
  });

  // Add filter to sort games by favorite odds
  eleventyConfig.addFilter("sortByFavoriteOdds", function (games) {
    if (!Array.isArray(games)) return [];

    function getFavoriteOdds(game) {
      if (!game || !game.odds || !game.matchup) return 0;

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
        return Math.min(awayOdds, homeOdds); // Return the favorite odds (more negative = stronger favorite)
      }
      return 0; // fallback
    }

    return [...games].sort((a, b) => {
      const aOdds = getFavoriteOdds(a);
      const bOdds = getFavoriteOdds(b);
      return aOdds - bOdds; // Sort by strongest favorite first (most negative)
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html", "md", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
