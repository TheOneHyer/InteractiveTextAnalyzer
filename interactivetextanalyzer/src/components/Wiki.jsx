import './Wiki.css'

export default function Wiki() {
  return (
    <div className='wiki-container'>
      <h2>Interactive Text Analyzer Wiki</h2>
      <p className='wiki-intro'>
        Comprehensive guide to understanding text analysis terms, algorithms, and interpretation.
      </p>

      <section className='wiki-section'>
        <h3>📊 Statistical Terms</h3>
        
        <div className='wiki-item'>
          <h4>Documents</h4>
          <p>
            The number of text samples being analyzed. Each document represents a row of text data 
            that has been combined from your selected columns. More documents generally provide 
            more robust analysis results.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Tokens</h4>
          <p>
            Individual words or terms extracted from the text by splitting on whitespace. 
            Tokenization is the first step in text analysis, breaking down sentences into 
            individual units. The token count gives you a sense of the total volume of text 
            being analyzed.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Unique Terms</h4>
          <p>
            The count of distinct terms, n-grams, or entities found in your text data. 
            This varies by analysis type - for TF-IDF it's unique weighted terms, for N-Grams 
            it's unique phrase combinations, and for NER it's unique named entities. A higher 
            unique count indicates more vocabulary diversity.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Mode</h4>
          <p>
            The currently active analysis algorithm. Different modes reveal different insights 
            about your text data. Choose the mode that best suits your analytical goals.
          </p>
        </div>
      </section>

      <section className='wiki-section'>
        <h3>🔬 Analysis Algorithms</h3>
        
        <div className='wiki-item'>
          <h4>TF-IDF (Term Frequency-Inverse Document Frequency)</h4>
          <p>
            <strong>What it does:</strong> Identifies the most important terms in your documents 
            by balancing how frequently a term appears in a document against how common it is 
            across all documents.
          </p>
          <p>
            <strong>How it works:</strong> Terms that appear frequently in a specific document 
            but rarely in others receive higher scores. This helps identify distinctive vocabulary 
            that characterizes each document.
          </p>
          <p>
            <strong>Use cases:</strong> Document classification, keyword extraction, finding 
            distinctive features of texts, content recommendation, and search ranking.
          </p>
          <p>
            <strong>Interpreting results:</strong> Higher TF-IDF scores indicate more important 
            terms for distinguishing documents. Look at the per-document results to see what 
            makes each document unique.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>N-Gram Analysis</h4>
          <p>
            <strong>What it does:</strong> Identifies the most common sequences of N consecutive 
            words (phrases) in your text data. For example, 2-grams (bigrams) find word pairs 
            like "customer service" or "machine learning".
          </p>
          <p>
            <strong>How it works:</strong> The algorithm slides through your text, extracting 
            all possible N-word sequences and counting their frequencies. You can adjust N to 
            find phrases of different lengths (2-6 words).
          </p>
          <p>
            <strong>Use cases:</strong> Discovering common phrases, understanding multi-word 
            expressions, finding collocations, analyzing idiomatic language, and extracting 
            domain-specific terminology.
          </p>
          <p>
            <strong>Interpreting results:</strong> The most frequent n-grams reveal the key 
            phrases and expressions in your corpus. Higher N values capture longer phrases but 
            may have lower frequencies.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Association Rules Mining</h4>
          <p>
            <strong>What it does:</strong> Discovers which terms frequently appear together 
            across documents, revealing patterns and relationships in your text data.
          </p>
          <p>
            <strong>How it works:</strong> The algorithm treats each document as a transaction 
            and terms as items, then calculates metrics like support (frequency), confidence 
            (conditional probability), and lift (strength of association) for term pairs.
          </p>
          <p>
            <strong>Key metrics:</strong>
          </p>
          <ul>
            <li><strong>Support:</strong> How often the term(s) appear in documents (as a percentage)</li>
            <li><strong>Confidence:</strong> The conditional probability that term B appears when term A is present</li>
            <li><strong>Lift:</strong> How much more likely terms appear together than by chance (lift &gt; 1 indicates positive association)</li>
          </ul>
          <p>
            <strong>Use cases:</strong> Market basket analysis, content recommendation, finding 
            related topics, discovering semantic relationships, and understanding co-occurrence patterns.
          </p>
          <p>
            <strong>Interpreting results:</strong> High lift values indicate strong associations. 
            Adjust the minimum support threshold to control how common terms must be to be included.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>NER (Named Entity Recognition)</h4>
          <p>
            <strong>What it does:</strong> Automatically identifies and extracts named entities 
            from text, including people, places, and organizations.
          </p>
          <p>
            <strong>How it works:</strong> Uses natural language processing (NLP) models to 
            recognize proper nouns and categorize them into predefined entity types. The system 
            leverages linguistic patterns and contextual clues.
          </p>
          <p>
            <strong>Entity types detected:</strong>
          </p>
          <ul>
            <li><strong>People:</strong> Personal names and references to individuals</li>
            <li><strong>Places:</strong> Geographic locations, cities, countries, landmarks</li>
            <li><strong>Organizations:</strong> Companies, institutions, brands, groups</li>
          </ul>
          <p>
            <strong>Use cases:</strong> Information extraction, building knowledge graphs, 
            content tagging, analyzing mentions of specific entities, customer feedback analysis, 
            and competitive intelligence.
          </p>
          <p>
            <strong>Interpreting results:</strong> Entity counts show which people, places, and 
            organizations are most frequently mentioned in your data. This helps understand the 
            main actors and topics in your text corpus.
          </p>
          <p>
            <strong>Note:</strong> NER requires loading an additional NLP library and may take 
            a moment to initialize on first use.
          </p>
        </div>
      </section>

      <section className='wiki-section'>
        <h3>⚙️ Settings & Options</h3>
        
        <div className='wiki-item'>
          <h4>Stemming</h4>
          <p>
            Reduces words to their root form (e.g., "running" → "run", "better" → "bet"). 
            This helps group related terms together but may occasionally produce unexpected results. 
            Enable for more consolidated results, disable for exact word matching.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Stopwords</h4>
          <p>
            Common words (like "the", "a", "and") that are typically excluded from analysis 
            because they don't carry much meaning. You can customize the stopword list by adding 
            your own comma-separated terms in the text area. More stopwords = cleaner results 
            focused on content words.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>N Size (for N-Grams)</h4>
          <p>
            The number of consecutive words to group together. N=2 finds word pairs (bigrams), 
            N=3 finds three-word phrases (trigrams), etc. Lower values find more frequent patterns, 
            higher values find more specific phrases.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Min Support (for Associations)</h4>
          <p>
            The minimum frequency threshold (as a decimal, e.g., 0.02 = 2%) for terms and pairs 
            to be included in the analysis. Lower values include more rare terms, higher values 
            focus on common patterns. Adjust based on your corpus size and analytical goals.
          </p>
        </div>
      </section>

      <section className='wiki-section'>
        <h3>📈 Visualizations</h3>
        
        <div className='wiki-item'>
          <h4>Bar Chart</h4>
          <p>
            Shows the top terms, pairs, or entities ranked by their importance metric (TF-IDF score, 
            frequency, lift, or count depending on analysis mode). Great for quickly identifying 
            the most significant elements.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Word Cloud</h4>
          <p>
            Visual representation where term size corresponds to importance or frequency. 
            Provides an intuitive at-a-glance view of your text's main themes. Larger words 
            are more significant in your corpus.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Network Graph</h4>
          <p>
            Shows relationships between terms (available in Association mode). Nodes represent 
            terms, edges represent associations, and edge thickness indicates lift strength. 
            Useful for understanding how concepts relate to each other.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Heatmap</h4>
          <p>
            Matrix visualization showing term distributions across documents (available in TF-IDF mode). 
            Darker colors indicate higher TF-IDF scores. Helps identify which terms characterize 
            which documents.
          </p>
        </div>
      </section>

      <section className='wiki-section'>
        <h3>💡 Tips & Best Practices</h3>
        
        <div className='wiki-item'>
          <h4>Choosing the Right Analysis Mode</h4>
          <ul>
            <li>Use <strong>TF-IDF</strong> when comparing multiple documents and finding distinctive features</li>
            <li>Use <strong>N-Grams</strong> when looking for common phrases and multi-word expressions</li>
            <li>Use <strong>Associations</strong> when discovering which terms co-occur frequently</li>
            <li>Use <strong>NER</strong> when you need to extract specific entities like names and places</li>
          </ul>
        </div>

        <div className='wiki-item'>
          <h4>Data Quality</h4>
          <p>
            Better input data leads to better results. Clean your text data by removing irrelevant 
            content, fixing encoding issues, and ensuring consistent formatting. Select only the 
            columns that contain meaningful text for analysis.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Iterative Analysis</h4>
          <p>
            Text analysis is often iterative. Start with default settings, review results, adjust 
            parameters (stopwords, stemming, thresholds), and re-analyze. Different settings may 
            reveal different insights.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Combining Multiple Views</h4>
          <p>
            Don't rely on just one analysis mode. Try multiple approaches on the same data to 
            get a comprehensive understanding. Use the different visualization layouts (single, 
            side-by-side, 2x2 grid) to compare results efficiently.
          </p>
        </div>
      </section>
    </div>
  )
}
