# InteractiveTextAnalyzer

An interactive web application for analyzing text data with visualizations and natural language processing.

## Live Demo

The app is automatically deployed to GitHub Pages: [https://theonehyer.github.io/InteractiveTextAnalyzer/](https://theonehyer.github.io/InteractiveTextAnalyzer/)

## Features

- **Comprehensive Reporting** - All-in-one report with executive summary, content analysis, comparative analysis, and actionable insights
- Text analysis with natural language processing
- Multiple visualization types (Word Cloud, Network Graph, Heatmap, Charts)
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

## Testing

The project includes comprehensive unit tests for utility functions and components.

To run tests:

```bash
cd interactivetextanalyzer
npm test
```

Additional test commands:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

Test coverage includes:
- Tokenization and text processing utilities
- TF-IDF calculation
- N-gram generation
- Association rule mining
- React components (Heatmap, NetworkGraph, WordCloud)
- Main App component integration tests

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the `master` branch. The deployment workflow:

1. Installs dependencies
2. Builds the React application with Vite
3. Uploads the build artifacts
4. Deploys to GitHub Pages

The deployment workflow can also be triggered manually from the Actions tab.

## Report Feature

The **Report** tab provides a comprehensive all-in-one analysis report that automatically aggregates results from all analysis types. Located between the Analyzer and Wiki tabs in the navigation sidebar.

### Report Sections

#### 📊 Executive Summary
- **Sentiment Distribution**: Pie chart showing positive, negative, and neutral sentiment percentages
- **Key Topics & Themes**: Top identified topics with their representative terms
- **Top Keywords**: Bar chart of most significant terms by TF-IDF score
- **Readability Metrics**: Overview of text complexity with plain-language interpretations

#### 📝 Content Analysis
- **Named Entities**: Organizations, locations, and people mentioned in the text
- **Parts of Speech Distribution**: Grammatical composition analysis
- **Sentiment by Category**: Breakdown of sentiment across different content areas

#### 📈 Comparative Analysis
- **Text Complexity Metrics**: Radar chart comparing all 6 readability algorithms
- **Statistical Summary**: Document count, token count, unique terms, and averages

#### 💡 Actionable Insights
- **Sentiment Concerns**: Warnings when significant negative sentiment is detected
- **Readability Notices**: Alerts for unusually high or low text complexity
- **Primary Focus Areas**: Summary of dominant topics and themes
- **Recurring Themes**: Highlights of most frequent terms and patterns

### Export Options
- **Print Report**: Functional browser print for PDF generation
- Export to PDF (coming soon)
- Export to PowerPoint (coming soon)
- Export to CSV (coming soon)

### Technical Details
- Automatically generates from available analysis results
- Lazy loaded for optimal performance
- Responsive design adapts to all screen sizes
- Print-friendly CSS for report generation

See [REPORT_FEATURE_SUMMARY.md](REPORT_FEATURE_SUMMARY.md) for detailed implementation documentation.