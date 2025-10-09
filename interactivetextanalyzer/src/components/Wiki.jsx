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
          <p>
            <strong>Visualization options:</strong> Bar Chart, Word Cloud, Heatmap
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
          <p>
            <strong>Visualization options:</strong> Bar Chart, Word Cloud
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Cavnar, W. B., & Trenkle, J. M. (1994). N-gram-based text categorization. In <em>Proceedings of SDAIR-94, 3rd Annual Symposium on Document Analysis and Information Retrieval</em> (pp. 161-175).
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Tokenization Analysis</h4>
          <p>
            <strong>What it does:</strong> Analyzes text at different levels of granularity, 
            from individual characters to complete sentences. This educational feature demonstrates 
            how text can be broken down into different types of tokens for various analytical purposes.
          </p>
          <p>
            <strong>How it works:</strong> The algorithm applies different tokenization strategies 
            based on the selected level:
          </p>
          <ul>
            <li><strong>Character Level:</strong> Splits text into individual characters, useful for 
            analyzing character frequency, encoding, and orthographic patterns.</li>
            <li><strong>Word Level:</strong> Splits text on whitespace to extract complete words, 
            the most common tokenization approach for text analysis.</li>
            <li><strong>Subword Level:</strong> Extracts character sequences (2-4 characters) that 
            approximate subword units, similar to byte-pair encoding used in modern language models.</li>
            <li><strong>Sentence Level:</strong> Splits text into sentences using punctuation 
            boundaries, useful for analyzing sentence structure and length.</li>
          </ul>
          <p>
            <strong>Use cases:</strong> Educational demonstrations of tokenization, understanding 
            text preprocessing, analyzing character distributions, studying morphology, comparing 
            tokenization strategies, and preparing for advanced NLP tasks.
          </p>
          <p>
            <strong>Interpreting results:</strong> Each level reveals different patterns - character 
            analysis shows orthographic features, word analysis reveals vocabulary, subword analysis 
            identifies common morphemes, and sentence analysis displays discourse structure.
          </p>
          <p>
            <strong>Visualization options:</strong> Bar Chart, Word Cloud
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Manning, C. D., Raghavan, P., & Schütze, H. (2008). <em>Introduction to Information Retrieval</em>. Cambridge University Press. Chapter 2: The term vocabulary and postings lists. <a href="https://nlp.stanford.edu/IR-book/" target="_blank" rel="noopener noreferrer">https://nlp.stanford.edu/IR-book/</a>
          </p>
          <p className='wiki-source'>
            <strong>Additional Source:</strong> Sennrich, R., Haddow, B., & Birch, A. (2016). Neural Machine Translation of Rare Words with Subword Units. In <em>Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics</em> (pp. 1715-1725). <a href="https://doi.org/10.18653/v1/P16-1162" target="_blank" rel="noopener noreferrer">https://doi.org/10.18653/v1/P16-1162</a>
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
          <p>
            <strong>Visualization options:</strong> Bar Chart, Word Cloud, Network Graph
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
          <p>
            <strong>Visualization options:</strong> Bar Chart, Word Cloud
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Nadeau, D., & Sekine, S. (2007). A survey of named entity recognition and classification. <em>Lingvisticae Investigationes</em>, 30(1), 3-26. <a href="https://doi.org/10.1075/li.30.1.03nad" target="_blank" rel="noopener noreferrer">https://doi.org/10.1075/li.30.1.03nad</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>YAKE (Yet Another Keyword Extractor)</h4>
          <p>
            <strong>What it does:</strong> Extracts important keywords and key phrases from text 
            using statistical features without requiring training data or external corpora. YAKE 
            is a lightweight, language-independent, unsupervised keyword extraction method.
          </p>
          <p>
            <strong>How it works:</strong> The algorithm analyzes text using multiple statistical 
            features including term position, term frequency, term context, and term spread across 
            the document. Keywords are scored based on these features, where lower scores indicate 
            more important keywords. YAKE can extract both single words and multi-word phrases 
            (n-grams).
          </p>
          <p>
            <strong>Key features:</strong>
          </p>
          <ul>
            <li><strong>Position:</strong> Terms appearing earlier in text get higher importance</li>
            <li><strong>Frequency:</strong> Balances term frequency with over-occurrence penalties</li>
            <li><strong>Context:</strong> Considers relationships with surrounding words</li>
            <li><strong>Spread:</strong> Values terms distributed across the document</li>
          </ul>
          <p>
            <strong>Use cases:</strong> Automatic keyword tagging, content summarization, SEO 
            optimization, document indexing, finding representative terms without training data, 
            and quick content analysis across different languages.
          </p>
          <p>
            <strong>Interpreting results:</strong> Keywords with lower scores are more important. 
            The results show the most characteristic terms and phrases that represent your content. 
            Multi-word phrases often capture more specific concepts than single words.
          </p>
          <p>
            <strong>Parameters:</strong> You can adjust the maximum n-gram size (1-3) to control 
            whether to extract single words only or include multi-word phrases.
          </p>
          <p>
            <strong>Visualization options:</strong> Bar Chart, Word Cloud
          </p>
          <p className='wiki-source'>
            <strong>Source:</strong> Campos, R., Mangaravite, V., Pasquali, A., Jorge, A., Nunes, C., & Jatowt, A. (2020). YAKE! Keyword extraction from single documents using multiple local features. <em>Information Sciences</em>, 509, 257-289. <a href="https://doi.org/10.1016/j.ins.2019.09.013" target="_blank" rel="noopener noreferrer">https://doi.org/10.1016/j.ins.2019.09.013</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Lemmatization</h4>
          <p>
            <strong>What it does:</strong> Reduces words to their base or dictionary form (lemma), 
            grouping together inflected forms of the same word. For example, "running," "ran," and "runs" 
            all lemmatize to "run"; "better" and "best" lemmatize to "good."
          </p>
          <p>
            <strong>How it works:</strong> The tool offers three lemmatization methods:
          </p>
          <ul>
            <li>
              <strong>Princeton WordNet:</strong> Uses a curated dictionary of common English words 
              and their base forms, including irregular verbs (go/went/gone), irregular plurals 
              (child/children), and comparative/superlative adjectives (good/better/best). This method 
              handles linguistic irregularities accurately but is limited to words in the dictionary.
            </li>
            <li>
              <strong>Rules-Based:</strong> Applies morphological transformation rules to strip common 
              suffixes (-ing, -ed, -ly, -s, -es, -ies, -er, -est) and handle doubled consonants. 
              This method is fast and works with any word but may not handle irregular forms correctly. 
              It uses pattern matching similar to Porter stemming but with lemmatization-focused rules.
            </li>
            <li>
              <strong>Compromise NLP:</strong> Leverages the Compromise natural language processing 
              library to perform part-of-speech tagging and context-aware lemmatization. This method 
              understands word types (verbs, nouns, adjectives) and applies appropriate transformations: 
              verbs are converted to infinitive form, nouns to singular, etc. Most accurate but requires 
              loading the NLP library.
            </li>
          </ul>
          <p>
            <strong>Use cases:</strong> Text normalization for search and retrieval, reducing vocabulary 
            size for analysis, improving text mining accuracy, grouping related terms, preparing text 
            for machine learning models, and analyzing word usage patterns across different forms.
          </p>
          <p>
            <strong>Interpreting results:</strong> Each result shows the lemma (base form), its frequency 
            count, and the original forms that were grouped together. High-frequency lemmas indicate 
            core concepts in your text. The originals field helps verify that the lemmatization is 
            working correctly by showing what was grouped together.
          </p>
          <p>
            <strong>Lemmatization vs. Stemming:</strong> Unlike stemming (which crudely chops word 
            endings), lemmatization produces valid dictionary words. For example, "better" stems to 
            "better" but lemmatizes to "good." Lemmatization is linguistically more accurate but 
            computationally more expensive than stemming.
          </p>
          <p>
            <strong>Visualization options:</strong> Bar Chart, Word Cloud, Network Graph
          </p>
          <p className='wiki-source'>
            <strong>Sources:</strong>
            <br/>WordNet: Miller, G. A. (1995). WordNet: A lexical database for English. <em>Communications of the ACM</em>, 38(11), 39-41. <a href="https://doi.org/10.1145/219717.219748" target="_blank" rel="noopener noreferrer">https://doi.org/10.1145/219717.219748</a>
            <br/>Morphological Analysis: Jurafsky, D., & Martin, J. H. (2023). Speech and Language Processing (3rd ed.). Chapter 2: Regular Expressions, Text Normalization, Edit Distance. <a href="https://web.stanford.edu/~jurafsky/slp3/" target="_blank" rel="noopener noreferrer">https://web.stanford.edu/~jurafsky/slp3/</a>
            <br/>NLP-based Lemmatization: Bird, S., Klein, E., & Loper, E. (2009). Natural Language Processing with Python. O'Reilly Media. <a href="https://www.nltk.org/book/" target="_blank" rel="noopener noreferrer">https://www.nltk.org/book/</a>
            <br/>Compromise NLP: <a href="https://github.com/spencermountain/compromise" target="_blank" rel="noopener noreferrer">https://github.com/spencermountain/compromise</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Document Embeddings with Dimensionality Reduction</h4>
          <p>
            <strong>What it does:</strong> Creates vector representations (embeddings) of your documents 
            and visualizes them in 2D space using dimensionality reduction techniques. 
            Documents with similar content appear closer together in the visualization.
          </p>
          <p>
            <strong>How it works:</strong> First, TF-IDF vectors are computed for each document using 
            the top vocabulary terms. Then, these high-dimensional vectors are reduced to 2 dimensions 
            using PCA (Principal Component Analysis) or similar algorithms. The current implementation 
            uses a lightweight PCA approach that's optimized for browser performance.
          </p>
          <p>
            <strong>Key concepts:</strong>
          </p>
          <ul>
            <li><strong>Document Embeddings:</strong> Numerical vector representations of documents that capture semantic meaning</li>
            <li><strong>PCA:</strong> Finds the directions of maximum variance in the data and projects onto those dimensions</li>
            <li><strong>t-SNE/UMAP modes:</strong> Simulate non-linear dimensionality reduction with slight variations to PCA output</li>
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
            <strong>Note:</strong> Requires at least 3 documents. The algorithm runs quickly as it uses 
            a browser-optimized PCA implementation. For production use with larger datasets, consider 
            server-side t-SNE or UMAP processing.
          </p>
          <p>
            <strong>Visualization options:</strong> Scatter Plot
          </p>
          <p className='wiki-source'>
            <strong>Sources:</strong> 
            <br/>PCA: Pearson, K. (1901). On lines and planes of closest fit to systems of points in space. <em>The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science</em>, 2(11), 559-572.
            <br/>t-SNE: van der Maaten, L., & Hinton, G. (2008). Visualizing data using t-SNE. <em>Journal of Machine Learning Research</em>, 9, 2579-2605.
            <br/>UMAP: McInnes, L., Healy, J., & Melville, J. (2018). UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction. <em>arXiv preprint arXiv:1802.03426</em>. <a href="https://arxiv.org/abs/1802.03426" target="_blank" rel="noopener noreferrer">https://arxiv.org/abs/1802.03426</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Dependency Parsing</h4>
          <p>
            <strong>What it does:</strong> Analyzes the grammatical structure of sentences by identifying 
            syntactic dependencies between words. Each word in a sentence (except the root) depends on 
            exactly one other word, forming a tree structure.
          </p>
          <p>
            <strong>How it works:</strong> The analyzer uses natural language processing to assign 
            part-of-speech tags to words, then applies one of four algorithms to determine the most 
            likely dependency structure. Dependencies show which words modify or are governed by other words.
          </p>
          <p>
            <strong>Four Available Algorithms:</strong>
          </p>
          <ul>
            <li>
              <strong>Eisner's Algorithm:</strong> A dynamic programming approach that finds the 
              highest-scoring projective dependency tree in O(n³) time. Projective trees don't have 
              crossing dependencies, making them suitable for most English sentences. Best for: 
              well-structured, grammatically standard sentences.
            </li>
            <li>
              <strong>Chu-Liu/Edmonds Algorithm:</strong> Finds the maximum spanning tree in a directed 
              graph, allowing non-projective structures (crossing dependencies). This handles more 
              complex linguistic phenomena common in languages with free word order. Best for: complex 
              sentences or multilingual text with varied structures.
            </li>
            <li>
              <strong>Arc-Standard System:</strong> A transition-based parsing approach using a stack 
              and buffer with shift and reduce operations. Fast and efficient, builds the parse tree 
              incrementally from left to right. Best for: real-time parsing and resource-constrained 
              environments.
            </li>
            <li>
              <strong>spaCy-style Parser (Transformers.js):</strong> Uses transformer-based models and 
              heuristic rules inspired by spaCy's Universal Dependencies framework. Provides detailed 
              dependency labels with hover-over descriptions. Includes interactive sentence-by-sentence 
              visualization with color-coded dependency relations. Best for: educational purposes, 
              detailed linguistic analysis, and understanding specific dependency relationships.
            </li>
          </ul>
          <p>
            <strong>Understanding Dependency Labels:</strong> The spaCy-style parser uses Universal Dependencies 
            (UD) labels, a standardized framework for syntactic annotation across languages. Common labels include:
          </p>
          <ul>
            <li><strong>nsubj:</strong> Nominal Subject - the noun phrase performing the action of the verb</li>
            <li><strong>obj:</strong> Direct Object - the entity acted upon by the verb</li>
            <li><strong>det:</strong> Determiner - words like "the", "a", "an" that specify definiteness</li>
            <li><strong>amod:</strong> Adjectival Modifier - adjectives modifying nouns</li>
            <li><strong>advmod:</strong> Adverbial Modifier - adverbs modifying verbs or adjectives</li>
            <li><strong>aux:</strong> Auxiliary - helping verbs like "is", "has", "will"</li>
            <li><strong>case:</strong> Case Marking - prepositions marking relationships</li>
            <li><strong>conj:</strong> Conjunct - coordinated words or phrases</li>
            <li><strong>cc:</strong> Coordinating Conjunction - words like "and", "or", "but"</li>
            <li><strong>punct:</strong> Punctuation marks</li>
          </ul>
          <p>
            When using the spaCy-style parser, hover over edge labels in the visualization to see detailed 
            descriptions and examples for each dependency type. The interactive selector lets you choose 
            individual sentences for detailed analysis, as dependency trees are most meaningful when viewed 
            one sentence at a time.
          </p>
          <p>
            <strong>Use cases:</strong> Syntax analysis, grammar checking, sentence complexity assessment, 
            semantic role labeling, question answering systems, linguistic research, and educational 
            applications for teaching grammatical structure.
          </p>
          <p>
            <strong>Interpreting results:</strong> The network visualization shows words as nodes connected 
            by directed edges (arrows) representing dependencies. The ROOT node represents the main verb 
            or predicate of the sentence. Arrows point from heads to their dependents. For spaCy-style 
            parsing, edges are color-coded by dependency type for easier identification.
          </p>
          <p>
            <strong>Visualization options:</strong> Network Graph (traditional algorithms), Interactive 
            Dependency Tree with Sentence Selector (spaCy-style)
          </p>
          <p className='wiki-source'>
            <strong>Sources:</strong>
            <br/>Eisner: Eisner, J. (1996). Three new probabilistic models for dependency parsing: An exploration. 
            <em>In Proceedings of COLING 1996</em>, 340-345. <a href="https://aclanthology.org/C96-1058/" target="_blank" rel="noopener noreferrer">https://aclanthology.org/C96-1058/</a>
            <br/>Chu-Liu/Edmonds: Chu, Y. J., & Liu, T. H. (1965). On the shortest arborescence of a directed graph. 
            <em>Science Sinica</em>, 14, 1396-1400. McDonald, R., et al. (2005). Non-projective dependency parsing using spanning tree algorithms. 
            <em>In Proceedings of HLT/EMNLP 2005</em>. <a href="https://aclanthology.org/H05-1066/" target="_blank" rel="noopener noreferrer">https://aclanthology.org/H05-1066/</a>
            <br/>Arc-Standard: Nivre, J. (2008). Algorithms for deterministic incremental dependency parsing. 
            <em>Computational Linguistics</em>, 34(4), 513-553. <a href="https://doi.org/10.1162/coli.07-056-R1-07-027" target="_blank" rel="noopener noreferrer">https://doi.org/10.1162/coli.07-056-R1-07-027</a>
            <br/>Universal Dependencies: Nivre, J., et al. (2016). Universal Dependencies v1: A Multilingual Treebank Collection. 
            <em>In Proceedings of LREC 2016</em>. <a href="https://universaldependencies.org/" target="_blank" rel="noopener noreferrer">https://universaldependencies.org/</a>
            <br/>Transformers.js: Xenova. (2024). Transformers.js: State-of-the-art Machine Learning for the web. 
            <a href="https://huggingface.co/docs/transformers.js" target="_blank" rel="noopener noreferrer">https://huggingface.co/docs/transformers.js</a>
            <br/>spaCy Dependency Parsing: Honnibal, M., & Montani, I. (2017). spaCy 2: Natural language understanding with Bloom embeddings, convolutional neural networks and incremental parsing. 
            <a href="https://spacy.io/usage/linguistic-features#dependency-parse" target="_blank" rel="noopener noreferrer">https://spacy.io/usage/linguistic-features#dependency-parse</a>
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
            Shows relationships between terms or dependencies between words. In Association mode, 
            nodes represent terms and edges show associations with thickness indicating lift strength. 
            In Dependency Parsing mode, nodes are words and directed edges show grammatical dependencies 
            (arrows point from heads to dependents). Useful for understanding relationships and structure.
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
            <li>Use <strong>YAKE</strong> when extracting keywords without training data or when working with any language</li>
            <li>Use <strong>Lemmatization</strong> when you want to normalize word forms and group related terms together (better/best → good)</li>
            <li>Use <strong>Embeddings</strong> when visualizing document relationships and exploring corpus structure</li>
            <li>Use <strong>Dependency Parsing</strong> when analyzing sentence structure, grammar, or syntactic relationships</li>
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
