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
