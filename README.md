# InteractiveTextAnalyzer

An interactive web application for analyzing text data with visualizations and natural language processing.

## Live Demo

The app is automatically deployed to GitHub Pages: [https://theonehyer.github.io/InteractiveTextAnalyzer/](https://theonehyer.github.io/InteractiveTextAnalyzer/)

## Features

- Text analysis with natural language processing
- Multiple visualization types (Word Cloud, Network Graph, Heatmap)
- CSV and XLSX data import and export
- Dark/Light theme support
- Responsive design

## Local Development

To run the application locally:

```bash
cd interactivetextanalyzer
npm install
npm run dev
```

The app will be available at `http://localhost:61201`

## Building

To build the application for production:

```bash
cd interactivetextanalyzer
npm run build
```

The built files will be in the `interactivetextanalyzer/dist` directory.

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the `master` branch. The deployment workflow:

1. Installs dependencies
2. Builds the React application with Vite
3. Uploads the build artifacts
4. Deploys to GitHub Pages

The deployment workflow can also be triggered manually from the Actions tab.