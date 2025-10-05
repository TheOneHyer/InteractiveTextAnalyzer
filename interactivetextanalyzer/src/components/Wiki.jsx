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
          <p className='wiki-source'>
            <strong>Source:</strong> Salton, G., & Buckley, C. (1988). Term-weighting approaches in automatic text retrieval. <em>Information Processing & Management</em>, 24(5), 513-523. <a href="https://doi.org/10.1016/0306-4573(88)90021-0" target="_blank" rel="noopener noreferrer">https://doi.org/10.1016/0306-4573(88)90021-0</a>
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
          <p className='wiki-source'>
            <strong>Source:</strong> Cavnar, W. B., & Trenkle, J. M. (1994). N-gram-based text categorization. In <em>Proceedings of SDAIR-94, 3rd Annual Symposium on Document Analysis and Information Retrieval</em> (pp. 161-175).
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
          <p className='wiki-source'>
            <strong>Source:</strong> Agrawal, R., Imieliński, T., & Swami, A. (1993). Mining association rules between sets of items in large databases. In <em>ACM SIGMOD Record</em>, 22(2), 207-216. <a href="https://doi.org/10.1145/170036.170072" target="_blank" rel="noopener noreferrer">https://doi.org/10.1145/170036.170072</a>
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
          <p className='wiki-source'>
            <strong>Source:</strong> Nadeau, D., & Sekine, S. (2007). A survey of named entity recognition and classification. <em>Lingvisticae Investigationes</em>, 30(1), 3-26. <a href="https://doi.org/10.1075/li.30.1.03nad" target="_blank" rel="noopener noreferrer">https://doi.org/10.1075/li.30.1.03nad</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Document Embeddings with Dimensionality Reduction</h4>
          <p>
            <strong>What it does:</strong> Creates vector representations (embeddings) of your documents 
            and visualizes them in 2D space using dimensionality reduction techniques (t-SNE or UMAP). 
            Documents with similar content appear closer together in the visualization.
          </p>
          <p>
            <strong>How it works:</strong> First, TF-IDF vectors are computed for each document using 
            the top vocabulary terms. Then, these high-dimensional vectors are reduced to 2 dimensions 
            using either t-SNE (t-distributed Stochastic Neighbor Embedding) or UMAP (Uniform Manifold 
            Approximation and Projection) algorithms.
          </p>
          <p>
            <strong>Key concepts:</strong>
          </p>
          <ul>
            <li><strong>Document Embeddings:</strong> Numerical vector representations of documents that capture semantic meaning</li>
            <li><strong>t-SNE:</strong> Focuses on preserving local structure and clustering patterns. Best for exploring clusters and outliers.</li>
            <li><strong>UMAP:</strong> Balances local and global structure preservation. Often faster and better at maintaining data topology.</li>
          </ul>
          <p>
            <strong>Use cases:</strong> Document clustering, finding similar documents, detecting outliers, 
            exploratory data analysis, visualizing corpus structure, understanding document relationships, 
            and quality checking document collections.
          </p>
          <p>
            <strong>Interpreting results:</strong> Each point represents a document. Proximity indicates 
            semantic similarity - documents close together have similar content. Clusters suggest groups 
            of thematically related documents. Outliers may represent unique or unusual content.
          </p>
          <p>
            <strong>Note:</strong> Requires at least 3 documents. The algorithm may take a moment to 
            compute on first run as it loads the dimensionality reduction libraries.
          </p>
          <p className='wiki-source'>
            <strong>Sources:</strong> 
            <br/>t-SNE: van der Maaten, L., & Hinton, G. (2008). Visualizing data using t-SNE. <em>Journal of Machine Learning Research</em>, 9, 2579-2605.
            <br/>UMAP: McInnes, L., Healy, J., & Melville, J. (2018). UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction. <em>arXiv preprint arXiv:1802.03426</em>. <a href="https://arxiv.org/abs/1802.03426" target="_blank" rel="noopener noreferrer">https://arxiv.org/abs/1802.03426</a>
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
          <p className='wiki-source'>
            <strong>Source:</strong> Porter, M. F. (1980). An algorithm for suffix stripping. <em>Program</em>, 14(3), 130-137. <a href="https://doi.org/10.1108/eb046814" target="_blank" rel="noopener noreferrer">https://doi.org/10.1108/eb046814</a>
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
          <p className='wiki-source'>
            <strong>Source:</strong> Fox, C. (1990). A stop list for general text. <em>ACM SIGIR Forum</em>, 24(1-2), 19-21. <a href="https://doi.org/10.1145/378881.378888" target="_blank" rel="noopener noreferrer">https://doi.org/10.1145/378881.378888</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>N Size (for N-Grams)</h4>
          <p>
            The number of consecutive words to group together. N=2 finds word pairs (bigrams), 
            N=3 finds three-word phrases (trigrams), etc. Lower values find more frequent patterns, 
            higher values find more specific phrases.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Shannon, C. E. (1948). A mathematical theory of communication. <em>The Bell System Technical Journal</em>, 27(3), 379-423. <a href="https://doi.org/10.1002/j.1538-7305.1948.tb01338.x" target="_blank" rel="noopener noreferrer">https://doi.org/10.1002/j.1538-7305.1948.tb01338.x</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Min Support (for Associations)</h4>
          <p>
            The minimum frequency threshold (as a decimal, e.g., 0.02 = 2%) for terms and pairs 
            to be included in the analysis. Lower values include more rare terms, higher values 
            focus on common patterns. Adjust based on your corpus size and analytical goals.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Han, J., Pei, J., & Kamber, M. (2011). <em>Data Mining: Concepts and Techniques</em> (3rd ed.). Morgan Kaufmann.
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
          <p className='wiki-source'>
            <strong>Source:</strong> Cleveland, W. S. (1985). <em>The Elements of Graphing Data</em>. Wadsworth Advanced Books and Software.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Word Cloud</h4>
          <p>
            Visual representation where term size corresponds to importance or frequency. 
            Provides an intuitive at-a-glance view of your text's main themes. Larger words 
            are more significant in your corpus.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Viégas, F. B., Wattenberg, M., & Feinberg, J. (2009). Participatory visualization with wordle. <em>IEEE Transactions on Visualization and Computer Graphics</em>, 15(6), 1137-1144. <a href="https://doi.org/10.1109/TVCG.2009.171" target="_blank" rel="noopener noreferrer">https://doi.org/10.1109/TVCG.2009.171</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Network Graph</h4>
          <p>
            Shows relationships between terms (available in Association mode). Nodes represent 
            terms, edges represent associations, and edge thickness indicates lift strength. 
            Useful for understanding how concepts relate to each other.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Newman, M. E. (2010). <em>Networks: An Introduction</em>. Oxford University Press. <a href="https://doi.org/10.1093/acprof:oso/9780199206650.001.0001" target="_blank" rel="noopener noreferrer">https://doi.org/10.1093/acprof:oso/9780199206650.001.0001</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Heatmap</h4>
          <p>
            Matrix visualization showing term distributions across documents (available in TF-IDF mode). 
            Darker colors indicate higher TF-IDF scores. Helps identify which terms characterize 
            which documents.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Wilkinson, L., & Friendly, M. (2009). The history of the cluster heat map. <em>The American Statistician</em>, 63(2), 179-184. <a href="https://doi.org/10.1198/tas.2009.0033" target="_blank" rel="noopener noreferrer">https://doi.org/10.1198/tas.2009.0033</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Scatter Plot (Embeddings)</h4>
          <p>
            2D visualization of document embeddings (available in Embeddings mode). Each point 
            represents a document positioned according to its semantic content. Documents with 
            similar themes cluster together, while outliers appear distant. Hover over points 
            to see document previews.
          </p>
          <p>
            The axes represent the two principal dimensions extracted by the dimensionality 
            reduction algorithm (t-SNE or UMAP). These dimensions capture the most important 
            variations in document content.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Cleveland, W. S. (1993). <em>Visualizing Data</em>. Hobart Press.
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
            <li>Use <strong>Embeddings</strong> when visualizing document relationships and exploring corpus structure</li>
          </ul>
          <p className='wiki-source'>
            <strong>Source:</strong> Feldman, R., & Sanger, J. (2007). <em>The Text Mining Handbook: Advanced Approaches in Analyzing Unstructured Data</em>. Cambridge University Press.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Data Quality</h4>
          <p>
            Better input data leads to better results. Clean your text data by removing irrelevant 
            content, fixing encoding issues, and ensuring consistent formatting. Select only the 
            columns that contain meaningful text for analysis.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Rahm, E., & Do, H. H. (2000). Data cleaning: Problems and current approaches. <em>IEEE Data Engineering Bulletin</em>, 23(4), 3-13.
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Iterative Analysis</h4>
          <p>
            Text analysis is often iterative. Start with default settings, review results, adjust 
            parameters (stopwords, stemming, thresholds), and re-analyze. Different settings may 
            reveal different insights.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Hearst, M. A. (1999). Untangling text data mining. In <em>Proceedings of the 37th Annual Meeting of the Association for Computational Linguistics</em> (pp. 3-10). <a href="https://doi.org/10.3115/1034678.1034679" target="_blank" rel="noopener noreferrer">https://doi.org/10.3115/1034678.1034679</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Combining Multiple Views</h4>
          <p>
            Don't rely on just one analysis mode. Try multiple approaches on the same data to 
            get a comprehensive understanding. Use the different visualization layouts (single, 
            side-by-side, 2x2 grid) to compare results efficiently.
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Few, S. (2012). <em>Show Me the Numbers: Designing Tables and Graphs to Enlighten</em> (2nd ed.). Analytics Press.
          </p>
        </div>
      </section>
    </div>
  )
}
