# Report Component UI Layout

## Navigation Sidebar
```
┌─────────────────┐
│  ITA Logo       │
├─────────────────┤
│  ✏️  Editor     │
│  📊 Analyzer    │
│  📄 Report ⭐   │  <-- NEW!
│  📖 Wiki        │
└─────────────────┘
```

## Report View Layout
```
┌────────────────────────────────────────────────────────────────┐
│ Comprehensive Text Analysis Report                             │
│ Generated on: [timestamp]                                      │
│                                                                │
│ Documents: 150    Total Tokens: 12,543    Unique Terms: 3,247 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 📊 Executive Summary                                           │
│ High-level overview of key findings and metrics                │
├──────────────────┬──────────────────┬──────────────────────────┤
│ Sentiment        │ Key Topics       │ Top Keywords             │
│ Distribution     │ & Themes         │                          │
│   [Pie Chart]    │ • Topic 1        │   [Bar Chart]            │
│                  │ • Topic 2        │                          │
│ Overall: Positive│ • Topic 3        │ customer, product...     │
├──────────────────┴──────────────────┴──────────────────────────┤
│ Readability Metrics                                            │
│ Flesch: 65.5 | Grade Level: 8.2 | Avg Words: 83              │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 📝 Content Analysis                                            │
│ Detailed breakdown of text content                             │
├──────────────────────────────┬─────────────────────────────────┤
│ Named Entities               │ Parts of Speech                 │
│ Organizations: Apple, Google │   [Bar Chart]                   │
│ Locations: NY, CA            │ Nouns: 3,245                    │
│ People: John, Mary           │ Verbs: 1,987                    │
└──────────────────────────────┴─────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 📈 Comparative Analysis                                        │
│ Statistical patterns and comparative metrics                   │
├──────────────────────────────┬─────────────────────────────────┤
│ Text Complexity Metrics      │ Statistical Summary             │
│   [Radar Chart]              │ Documents: 150                  │
│ Flesch, F-K, Coleman-Liau,   │ Tokens: 12,543                  │
│ Gunning Fog, SMOG, ARI       │ Unique: 3,247                   │
└──────────────────────────────┴─────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 💡 Actionable Insights                                         │
│ Key recommendations and areas requiring attention              │
├────────────────────────────────────────────────────────────────┤
│ 🎯 Primary Focus Areas                                         │
│ Analysis identified 5 topics. Top: Technology and Innovation   │
├────────────────────────────────────────────────────────────────┤
│ 🔑 Recurring Themes                                            │
│ Most frequent: customer, product, service                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 📥 Export Options                                              │
│ [Print Report] [PDF] [PowerPoint] [CSV]                        │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram
```
┌─────────────┐
│   Editor    │ User loads data, selects text columns
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Text Samples│ Combined text from selected columns
└──────┬──────┘
       │
       ├──────► Sentiment Analysis ──────┐
       │                                  │
       ├──────► Topic Modeling ───────────┤
       │                                  │
       ├──────► TF-IDF Analysis ──────────┤
       │                                  ├──► generateReport()
       ├──────► Readability Stats ────────┤
       │                                  │
       ├──────► POS Tagging ──────────────┤
       │                                  │
       └──────► Named Entity Recognition ─┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Report Data  │
                                   │ (aggregated) │
                                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │   Report     │ Renders all sections
                                   │  Component   │ with visualizations
                                   └──────────────┘
```

## Component Hierarchy
```
App.jsx
└── Report View (when activeView === 'report')
    └── <Report reportData={reportData} />
        ├── Report Header
        │   ├── Title & Timestamp
        │   └── Statistics Bar
        ├── Executive Summary Section
        │   ├── Sentiment Card (PieChart from recharts)
        │   ├── Topics Card (list rendering)
        │   ├── Keywords Card (BarChart from recharts)
        │   └── Readability Card (metrics grid)
        ├── Content Analysis Section
        │   ├── Named Entities Card (tag rendering)
        │   ├── POS Card (BarChart from recharts)
        │   └── Sentiment by Category Card (progress bars)
        ├── Comparative Analysis Section
        │   ├── Complexity Card (RadarChart from recharts)
        │   └── Statistics Card (stat boxes)
        ├── Actionable Insights Section
        │   └── Insight Cards (conditional rendering)
        └── Export Options Section
            └── Action Buttons
```

## Key Features by Section

### Executive Summary
✓ Sentiment pie chart with color-coded segments
✓ Overall sentiment label (Positive/Negative/Neutral)
✓ Top 5 topics with their key terms
✓ Top 10 keywords bar chart
✓ Readability scores with interpretations

### Content Analysis
✓ Named entities grouped by type (Person, Org, Location)
✓ POS distribution bar chart
✓ Entity count badges
✓ Sentiment breakdown by category

### Comparative Analysis
✓ Radar chart normalizing all 6 readability algorithms
✓ Statistical summary boxes
✓ Document/token/term counts

### Actionable Insights
✓ Conditional warnings for negative sentiment
✓ Readability difficulty notices
✓ Topic focus summaries
✓ High-frequency term highlights
✓ Color-coded cards (success/info/warning)

### Export Options
✓ Print button (functional)
✓ PDF export (coming soon)
✓ PowerPoint export (coming soon)
✓ CSV export (coming soon)
