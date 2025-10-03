# Interactive Text Analyzer

Browser-based exploratory text analytics tool. Upload Excel (.xlsx/.xls) or CSV files containing multiple text columns, perform preprocessing, and run interactive analyses (N-Grams, TF?IDF, Association Rules, NER) with visualizations (Word Cloud, Network Graph, Heatmap) – all client-side.

## Features
- Multi-sheet Excel ingestion + All Sheets merge
- CSV upload support
- Column rename / hide (PowerPivot-like munging)
- Select multiple text columns for analysis
- Preprocessing: custom stopwords + optional stemming
- Analytic modules: N-Gram, TF?IDF, Association Rules (support / confidence / lift), Named Entity Recognition
- Visualizations: Word Cloud, Network Graph (lift weighting), TF?IDF Heatmap
- Export transformed dataset (.xlsx) & analysis results (JSON)
- Local persistence of settings in `localStorage`
- Lazy loading of NLP libraries for performance

## Quick Start
```bash
npm install
npm run dev
```
Open http://localhost:61201

## Sample Data
A sample CSV is provided at `public/sample-data.csv`. Use it to quickly test:
1. Click the file input and choose `sample-data.csv`.
2. Select columns `review` and/or `notes` as text sources (press the TXT toggle buttons).
3. Choose an analysis type and visualization mode.

## File Formats
- Excel: `.xlsx` / `.xls` (all sheets imported)
- CSV: Comma delimited UTF-8; header row required.

## Recommended Workflow
1. Upload file (Excel or CSV)
2. Hide / rename columns as needed
3. Mark text columns (TXT buttons)
4. Adjust preprocessing (stopwords, stemming)
5. Run analyses & switch visual views
6. Export data / results if desired

## Roadmap Ideas
- Stopword frequency suggestions
- Phrase-based entity grouping
- Dynamic code-splitting of heavy modules
- Advanced association rule mining (k>2 itemsets)
- Sentiment & topic modeling

## Tech Stack
- React + Vite
- XLSX (SheetJS) for parsing & export
- natural / compromise for NLP
- d3 & custom components for visuals

All logic executes in the browser—no server required.
