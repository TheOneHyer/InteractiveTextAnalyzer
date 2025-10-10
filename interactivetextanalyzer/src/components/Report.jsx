import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import './Report.css'

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#94a3b8'
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

/**
 * Report Component - Comprehensive text analysis reporting
 * Provides executive summary, content analysis, comparative analysis, and actionable insights
 */
export default function Report({ reportData }) {
  if (!reportData || !reportData.hasData) {
    return (
      <div className='report-container'>
        <div className='report-empty-state'>
          <h2>No Data Available</h2>
          <p>Please select text columns and run analysis in the Analyzer tab first.</p>
          <p>The report will automatically generate once you have analysis results.</p>
        </div>
      </div>
    )
  }

  const { 
    sentiment, 
    topics, 
    readability, 
    wordFrequency, 
    pos, 
    entities,
    statistics 
  } = reportData

  return (
    <div className='report-container'>
      <div className='report-header'>
        <h1>Comprehensive Text Analysis Report</h1>
        <p className='report-subtitle'>Generated on {new Date().toLocaleString()}</p>
        <div className='report-stats-bar'>
          <div className='report-stat-item'>
            <span className='report-stat-label'>Documents</span>
            <span className='report-stat-value'>{statistics.documentCount}</span>
          </div>
          <div className='report-stat-item'>
            <span className='report-stat-label'>Total Tokens</span>
            <span className='report-stat-value'>{statistics.totalTokens}</span>
          </div>
          <div className='report-stat-item'>
            <span className='report-stat-label'>Unique Terms</span>
            <span className='report-stat-value'>{statistics.uniqueTerms}</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <section className='report-section'>
        <h2 className='report-section-title'>📊 Executive Summary</h2>
        <p className='report-section-description'>
          High-level overview of key findings and metrics from the text analysis.
        </p>

        <div className='report-grid'>
          {/* Sentiment Distribution */}
          {sentiment && (
            <div className='report-card'>
              <h3>Sentiment Distribution</h3>
              <div className='report-chart-container'>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sentiment.distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentiment.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='report-insight'>
                <p><strong>Overall Sentiment:</strong> {sentiment.overall}</p>
                <p className='report-muted'>Average Score: {sentiment.averageScore.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Top Topics/Themes */}
          {topics && topics.length > 0 && (
            <div className='report-card'>
              <h3>Key Topics & Themes</h3>
              <div className='report-topics-list'>
                {topics.slice(0, 5).map((topic, idx) => (
                  <div key={idx} className='report-topic-item'>
                    <div className='report-topic-label'>{topic.label}</div>
                    <div className='report-topic-terms'>
                      {topic.terms.slice(0, 5).map(t => t.term).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Keywords */}
          {wordFrequency && wordFrequency.length > 0 && (
            <div className='report-card'>
              <h3>Top Keywords</h3>
              <div className='report-chart-container'>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={wordFrequency.slice(0, 10)}>
                    <XAxis dataKey="term" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Readability Overview */}
          {readability && (
            <div className='report-card'>
              <h3>Readability Metrics</h3>
              <div className='report-readability-grid'>
                <div className='report-metric'>
                  <div className='report-metric-label'>Flesch Reading Ease</div>
                  <div className='report-metric-value'>{readability.flesch}</div>
                  <div className='report-metric-interpretation'>{readability.interpretation.flesch}</div>
                </div>
                <div className='report-metric'>
                  <div className='report-metric-label'>Grade Level</div>
                  <div className='report-metric-value'>{readability.fleschKincaid}</div>
                  <div className='report-metric-interpretation'>{readability.interpretation.fleschKincaid}</div>
                </div>
                <div className='report-metric'>
                  <div className='report-metric-label'>Avg Words/Doc</div>
                  <div className='report-metric-value'>{readability.avgWords}</div>
                  <div className='report-metric-interpretation'>Average document length</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content Analysis */}
      <section className='report-section'>
        <h2 className='report-section-title'>📝 Content Analysis</h2>
        <p className='report-section-description'>
          Detailed breakdown of text content including word patterns, entities, and linguistic features.
        </p>

        <div className='report-grid'>
          {/* Named Entities */}
          {entities && Object.keys(entities).length > 0 && (
            <div className='report-card report-card-full'>
              <h3>Named Entities</h3>
              <div className='report-entities-grid'>
                {Object.entries(entities).map(([type, items]) => (
                  items.length > 0 && (
                    <div key={type} className='report-entity-group'>
                      <h4>{type}</h4>
                      <div className='report-entity-tags'>
                        {items.slice(0, 10).map((entity, idx) => (
                          <span key={idx} className='report-entity-tag'>
                            {entity.text} ({entity.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Parts of Speech Distribution */}
          {pos && pos.length > 0 && (
            <div className='report-card'>
              <h3>Parts of Speech Distribution</h3>
              <div className='report-chart-container'>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={pos.slice(0, 10)}>
                    <XAxis dataKey="pos" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className='report-insight'>
                <p className='report-muted'>
                  Shows the grammatical composition of the text corpus.
                </p>
              </div>
            </div>
          )}

          {/* Sentiment by Category */}
          {sentiment && sentiment.byCategory && Object.keys(sentiment.byCategory).length > 0 && (
            <div className='report-card'>
              <h3>Sentiment by Category</h3>
              <div className='report-category-sentiment'>
                {Object.entries(sentiment.byCategory).map(([category, data]) => (
                  <div key={category} className='report-category-row'>
                    <div className='report-category-name'>{category}</div>
                    <div className='report-category-bars'>
                      <div className='report-sentiment-bar' style={{ width: '100%', background: '#f1f5f9' }}>
                        <div 
                          className='report-sentiment-fill' 
                          style={{ 
                            width: `${data.positive}%`, 
                            background: SENTIMENT_COLORS.positive 
                          }}
                        />
                      </div>
                      <span className='report-category-label'>
                        {data.positive}% positive
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Comparative Analysis */}
      <section className='report-section'>
        <h2 className='report-section-title'>📈 Comparative Analysis</h2>
        <p className='report-section-description'>
          Statistical patterns and comparative metrics across the dataset.
        </p>

        <div className='report-grid'>
          {/* Complexity Comparison */}
          {readability && (
            <div className='report-card'>
              <h3>Text Complexity Metrics</h3>
              <div className='report-chart-container'>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    { metric: 'Flesch', value: Math.min(readability.flesch / 10, 10) },
                    { metric: 'F-K Grade', value: Math.min(readability.fleschKincaid, 10) },
                    { metric: 'Coleman-Liau', value: Math.min(readability.colemanLiau, 10) },
                    { metric: 'Gunning Fog', value: Math.min(readability.gunningFog, 10) },
                    { metric: 'SMOG', value: Math.min(readability.smog, 10) },
                    { metric: 'ARI', value: Math.min(readability.ari, 10) }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar name="Complexity" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className='report-insight'>
                <p className='report-muted'>
                  Normalized view of text complexity across multiple readability algorithms.
                </p>
              </div>
            </div>
          )}

          {/* Statistics Summary */}
          <div className='report-card'>
            <h3>Statistical Summary</h3>
            <div className='report-stats-grid'>
              <div className='report-stat-box'>
                <div className='report-stat-label'>Documents Analyzed</div>
                <div className='report-stat-big'>{statistics.documentCount}</div>
              </div>
              <div className='report-stat-box'>
                <div className='report-stat-label'>Total Tokens</div>
                <div className='report-stat-big'>{statistics.totalTokens}</div>
              </div>
              <div className='report-stat-box'>
                <div className='report-stat-label'>Unique Terms</div>
                <div className='report-stat-big'>{statistics.uniqueTerms}</div>
              </div>
              <div className='report-stat-box'>
                <div className='report-stat-label'>Avg Tokens/Doc</div>
                <div className='report-stat-big'>{Math.round(statistics.totalTokens / statistics.documentCount)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actionable Insights */}
      <section className='report-section'>
        <h2 className='report-section-title'>💡 Actionable Insights</h2>
        <p className='report-section-description'>
          Key recommendations and areas requiring attention based on the analysis.
        </p>

        <div className='report-insights-container'>
          {/* Sentiment Concerns */}
          {sentiment && sentiment.negativeCount > 0 && (
            <div className='report-insight-card report-insight-warning'>
              <div className='report-insight-icon'>⚠️</div>
              <div className='report-insight-content'>
                <h4>Sentiment Concerns</h4>
                <p>
                  {sentiment.negativeCount} documents ({sentiment.negativePercentage}%) show negative sentiment. 
                  Review these areas for potential issues or concerns that may need addressing.
                </p>
              </div>
            </div>
          )}

          {/* Readability Concerns */}
          {readability && readability.flesch < 50 && (
            <div className='report-insight-card report-insight-info'>
              <div className='report-insight-icon'>📚</div>
              <div className='report-insight-content'>
                <h4>Readability Notice</h4>
                <p>
                  Text complexity is relatively high (Flesch Score: {readability.flesch}). 
                  Consider simplifying language if targeting general audiences.
                </p>
              </div>
            </div>
          )}

          {/* Topic Focus */}
          {topics && topics.length > 0 && (
            <div className='report-insight-card report-insight-success'>
              <div className='report-insight-icon'>🎯</div>
              <div className='report-insight-content'>
                <h4>Primary Focus Areas</h4>
                <p>
                  Analysis identified {topics.length} distinct topics. Top theme: <strong>{topics[0].label}</strong>.
                  {topics.length > 3 && ' Content covers diverse subject areas.'}
                </p>
              </div>
            </div>
          )}

          {/* High Frequency Terms */}
          {wordFrequency && wordFrequency.length > 0 && (
            <div className='report-insight-card report-insight-info'>
              <div className='report-insight-icon'>🔑</div>
              <div className='report-insight-content'>
                <h4>Recurring Themes</h4>
                <p>
                  Most frequent terms: <strong>{wordFrequency.slice(0, 3).map(w => w.term).join(', ')}</strong>.
                  These represent core themes throughout the document set.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Export Options */}
      <section className='report-section'>
        <h2 className='report-section-title'>📥 Export Options</h2>
        <div className='report-export-buttons'>
          <button className='btn' onClick={() => window.print()}>
            Print Report
          </button>
          <button className='btn secondary' disabled>
            Export to PDF (Coming Soon)
          </button>
          <button className='btn secondary' disabled>
            Export to PowerPoint (Coming Soon)
          </button>
          <button className='btn secondary' disabled>
            Export Data to CSV (Coming Soon)
          </button>
        </div>
      </section>
    </div>
  )
}
