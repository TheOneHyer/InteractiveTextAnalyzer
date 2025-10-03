# Interactive Text Analyzer

Browser-based exploratory text analytics tool. Upload Excel (.xlsx/.xls) or CSV files containing multiple text columns, perform preprocessing, and run interactive analyses (N-Grams, TF?IDF, Association Rules, NER) with visualizations (Word Cloud, Network Graph, Heatmap) – all client-side.

## Live Demo (GitHub Pages)
After the first successful GitHub Actions run, the app will be available at:
```
https://THE_USERNAME.github.io/InteractiveTextAnalyzer/
```
Replace `THE_USERNAME` with your GitHub handle.

## Features
- Multi-sheet Excel ingestion + All Sheets merge
- CSV upload support
- Column rename / hide (PowerPivot-like munging)
- Select multiple text columns for analysis
- Preprocessing: custom stopwords + optional stemming
- Analytic modules: N-Gram, TF?IDF, Association Rules (support / confidence / lift), Named Entity Recognition (lazy)
- Configurable dashboard (bar / word cloud / network / heatmap panels)
- Export transformed dataset (.xlsx) & analysis results (JSON)
- Local persistence (`localStorage`)
- Virtualized data preview
- Network edge lift threshold + bar label toggles

## Quick Start (Local)
```bash
npm install
npm run dev
```
Open http://localhost:61201

## Run in GitHub Codespaces
Open in browser (replace with your user if you fork):
https://codespaces.new/THE_USERNAME/InteractiveTextAnalyzer

Then:
```bash
npm run dev
```
The dev container forwards port 61201.

## Sample Data
Located at `public/sample-data.csv`. Use the Load button in the UI.

## GitHub Pages Deployment
Already configured:
- `vite.config.js` includes `base: '/InteractiveTextAnalyzer/'`.
- Workflow: `.github/workflows/deploy-pages.yml` builds & deploys on pushes to `master`.

First-time setup:
1. Push to `master` (triggers workflow).
2. In Repo Settings ? Pages ensure Source = GitHub Actions (auto after deploy).
3. Visit the published URL (see above).  

If you fork: update the README demo URL and optionally adjust branch name in the workflow if not `master`.

## File Formats
- Excel: `.xlsx` / `.xls`
- CSV: Comma delimited UTF?8; header row required.

## Workflow
1. Upload file
2. Hide / rename columns
3. Mark text columns (TXT)
4. Adjust preprocessing / thresholds
5. Choose analysis + dashboard layout
6. Export if desired

## Visualizations
- Bar Chart (metric varies by analysis)
- Word Cloud
- Association Network Graph (lift weighting & filter)
- TF?IDF Heatmap (TF?IDF mode only)

## Roadmap Ideas
- Stopword frequency suggestions
- Phrase-based entity grouping
- k>2 association itemsets
- Sentiment / topic modeling
- Dashboard presets import/export

## Tech Stack
React + Vite, XLSX (SheetJS), compromise (NER), d3, recharts.

## Dev Notes
Large bundles mainly from `xlsx` & `compromise`. Consider conditional builds or dynamic import gating for production variants.

## License
MIT (add LICENSE file if absent).
