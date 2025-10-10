# NFL Confidence Pool - Static Site

A static site version of the NFL Confidence Pool application, built with Eleventy.js and deployed to GitHub Pages with automated data fetching.

## Features

- **Live NFL Odds**: Automatically fetches current NFL odds from The Odds API
- **Drag & Drop Interface**: Reorder games by confidence level
- **Local Storage**: Saves your picks automatically
- **Export/Import**: Copy picks to/from spreadsheets
- **Mobile Responsive**: Works on all devices
- **Static Site**: Fast, secure, and reliable

## How It Works

### Data Fetching

- GitHub Actions runs every 6 hours during football season
- Fetches live NFL odds from The Odds API
- Builds static JSON data files
- Rebuilds and deploys the site automatically

### Site Structure

```
src/
├── _data/           # JSON data files (NFL odds)
├── _layouts/        # Nunjucks templates
├── css/            # Stylesheets
├── js/             # Client-side JavaScript
├── assets/         # Static assets
├── index.njk       # Main confidence pool page
└── about.njk       # About page
```

## Local Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up API key** (optional for development):

   ```bash
   export ODDS_API_KEY=your_api_key_here
   ```

3. **Fetch NFL data:**

   ```bash
   npm run fetch-odds
   ```

4. **Start development server:**

   ```bash
   npm run serve
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment to GitHub Pages

### Setup

1. Fork/clone this repository
2. Go to repository Settings > Pages
3. Set Source to "GitHub Actions"
4. Add your Odds API key as a repository secret:
   - Go to Settings > Secrets and variables > Actions
   - Add secret named `ODDS_API_KEY`

### Automatic Deployment

- Pushes to `main` branch trigger deployment
- Scheduled runs every 6 hours during football season (Sep-Jan)
- Manual deployment available via Actions tab

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` file handles:

- Installing dependencies
- Fetching NFL odds data
- Building the static site with Eleventy
- Deploying to GitHub Pages

## API Configuration

Get a free API key from [The Odds API](https://the-odds-api.com):

- Sign up for free tier (500 requests/month)
- Add key as `ODDS_API_KEY` repository secret
- The app gracefully falls back to placeholder data if API fails

## Customization

### Styling

- Uses Tailwind CSS via CDN
- Custom styles in `src/css/styles.css`
- Modify colors, fonts, and layout as needed

### Functionality

- Main app logic in `src/js/confidence-app.js`
- Add features like user accounts, leagues, etc.
- Extend data fetching for other sports

### Data Sources

- Modify `scripts/fetch-odds.js` to use different APIs
- Add support for other sports or betting markets
- Customize game filtering and sorting

## Original Next.js Version

This static site replaces a Next.js application. Key differences:

- **No server-side rendering** - All data pre-built at deploy time
- **No API routes** - Data fetched via GitHub Actions
- **Static hosting** - Can be hosted anywhere (GitHub Pages, Netlify, etc.)
- **Better performance** - Pre-built pages load instantly
- **Lower cost** - No server costs, just hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run serve`
5. Submit a pull request

## License

MIT License - see original Next.js project for details.
