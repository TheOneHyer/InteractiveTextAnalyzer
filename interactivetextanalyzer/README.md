# Interactive Text Analyzer

Browser-based exploratory text analytics tool. Upload Excel (.xlsx/.xls) or CSV files containing multiple text columns, perform preprocessing, and run interactive analyses (N-Grams, TF?IDF, Association Rules, NER) with visualizations (Word Cloud, Network Graph, Heatmap) – all client-side.

## Features
- Multi-sheet Excel ingestion + All Sheets merge
- CSV upload support
- Column rename / hide (PowerPivot-like munging)
- Select multiple text columns for analysis
- Preprocessing: custom stopwords + optional stemming
- Analytic modules: N-Gram, TF?IDF, Association Rules (support / confidence / lift), Named Entity Recognition
- Visualizations: Word Cloud, Network Graph (lift weighting), TF?IDF Heatmap, configurable dashboard (bar, cloud, network, heatmap panels)
- Export transformed dataset (.xlsx) & analysis results (JSON)
- Local persistence of settings in `localStorage`
- Lazy loading of NLP libraries for performance
- Virtualized data preview for large files

## Quick Start (Local)
```bash
npm install
npm run dev
```
Open http://localhost:61201

## Run in GitHub Codespaces
Click: https://codespaces.new/TheOneHyer/InteractiveTextAnalyzer

The devcontainer automatically:
- Installs dependencies (`npm install`)
- Forwards port 61201
- Opens the Vite dev server when you run:
```bash
npm run dev
```
If port forwarding tab does not open automatically, open the Ports panel and click the 61201 link.

## Sample Data
A sample CSV is provided at `public/sample-data.csv`.
1. Click the file input and choose `sample-data.csv`.
2. Select columns (e.g. `review`, `notes`) as text sources (TXT toggles).
3. Choose an analysis type and configure dashboard layout/visuals.

## File Formats
- Excel: `.xlsx` / `.xls` (all sheets imported)
- CSV: Comma delimited UTF-8; header row required.

## Recommended Workflow
1. Upload file (Excel or CSV)
2. Hide / rename columns as needed
3. Mark text columns (TXT buttons)
4. Adjust preprocessing (stopwords, stemming, support / thresholds)
5. Switch analysis type & visuals (dashboard layout)
6. Export data / results if desired

## Dashboard Visualizations
- Bar Chart (context-aware metric: TF-IDF / Frequency / Lift / Count)
- Word Cloud
- Association Network Graph (filter edges by lift threshold)
- TF-IDF Heatmap (when in TF-IDF mode)

## Roadmap Ideas
- Stopword frequency suggestions
- Phrase-based entity grouping
- Advanced association rule mining (k>2 itemsets)
- Sentiment & topic modeling
- Export/import of dashboard layout presets

## Tech Stack
- React + Vite
- XLSX (SheetJS) for parsing & export
- compromise for NER (lazy loaded)
- d3 for network + custom visuals
- recharts for charts

All logic executes in the browser—no server required.

## Dev Notes
- To deploy to GitHub Pages, add `base` to `vite.config.js` and use a Pages workflow.
- Large libraries (xlsx, compromise) dominate bundle size—consider conditional builds if needed.

## License
MIT (add a LICENSE file if not present).
