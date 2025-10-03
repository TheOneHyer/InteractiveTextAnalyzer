# Interactive Text Analyzer

Browser-based exploratory text analytics tool. Upload Excel (.xlsx/.xls) or CSV files containing multiple text columns, perform preprocessing, and run interactive analyses (N-Grams, TF?IDF, Association Rules, NER) with visualizations (Word Cloud, Network Graph, Heatmap) – all client-side.

## Live Demo (GitHub Pages)
If using the `/docs` folder approach (Jekyll default):
```
https://THE_USERNAME.github.io/InteractiveTextAnalyzer/
```
(After pushing the built `docs` folder.)

## Build for GitHub Pages (docs strategy)
This repository now builds directly into the `docs/` directory so GitHub Pages (Jekyll) can serve it without a workflow.

Steps:
```bash
npm install
npm run build   # outputs production build to docs/
```
Commit and push the updated `docs/` folder to `master` (or `main`). In repo Settings -> Pages, set Source = "Deploy from a branch" and pick `master` (or `main`) /docs.

A `.nojekyll` file is included to stop Jekyll from altering asset paths.

If publishing to a user/organization root site (e.g. https://username.github.io/):
Build with an environment override to switch `base` to `/`:
```bash
USER_SITE=1 npm run build
```
(Windows PowerShell: `$env:USER_SITE=1; npm run build`)

## Features
- Multi-sheet Excel ingestion + All Sheets merge
- CSV upload support
- Column rename / hide
- Select multiple text columns for analysis
- Custom stopwords + optional stemming
- Analytic modules: N-Gram, TF?IDF, Association Rules, NER (lazy load)
- Configurable dashboard (bar / word cloud / network / heatmap)
- Export dataset (.xlsx) & analysis (JSON)
- Local persistence (`localStorage`)
- Virtualized data preview
- Network edge lift threshold & bar label toggles

## Local Dev
```bash
npm install
npm run dev
```
Open http://localhost:61201

## Sample Data
`public/sample-data.csv` – load via the UI button.

## Visualizations
- Bar Chart (metric depends on analysis)
- Word Cloud
- Network Graph (lift-based edges with threshold slider)
- TF?IDF Heatmap (TF?IDF mode)

## Roadmap Ideas
- Stopword frequency suggestions
- Phrase-based entity grouping
- k>2 association itemsets
- Sentiment / topic modeling
- Dashboard layout presets import/export

## Tech Stack
React + Vite, XLSX (SheetJS), compromise (NER), d3, recharts.

## Deployment Notes
- `vite.config.js` sets `outDir: docs` and proper `base`.
- `.nojekyll` prevents GitHub Pages processing.
- Use `USER_SITE=1` env var for root site deployments.

## License
MIT (add LICENSE if absent).
