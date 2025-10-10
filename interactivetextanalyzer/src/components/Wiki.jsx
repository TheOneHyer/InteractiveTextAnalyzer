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
          <h4>Parts of Speech (POS) Tagging</h4>
          <p>
            <strong>What it does:</strong> Identifies and categorizes each word in text by its grammatical 
            function (noun, verb, adjective, adverb, etc.). This linguistic analysis reveals the syntactic 
            structure and word usage patterns in your documents.
          </p>
          <p>
            <strong>How it works:</strong> The analyzer examines each word and assigns it a part-of-speech 
            tag based on lexical patterns, word morphology, and context. Two methods are available: 
            rules-based tagging using pattern matching and linguistic rules, or NLP-based tagging using 
            the Compromise library for more accurate context-aware categorization.
          </p>
          <p>
            <strong>POS Categories:</strong>
          </p>
          <ul>
            <li><strong>Noun:</strong> Person, place, thing, or idea (e.g., "cat", "city", "happiness")</li>
            <li><strong>Verb:</strong> Action or state of being (e.g., "run", "is", "think")</li>
            <li><strong>Adjective:</strong> Describes or modifies nouns (e.g., "blue", "happy", "tall")</li>
            <li><strong>Adverb:</strong> Modifies verbs, adjectives, or other adverbs (e.g., "quickly", "very")</li>
            <li><strong>Pronoun:</strong> Replaces nouns (e.g., "he", "they", "it")</li>
            <li><strong>Preposition:</strong> Shows relationships (e.g., "in", "on", "at")</li>
            <li><strong>Conjunction:</strong> Connects words or clauses (e.g., "and", "but", "or")</li>
            <li><strong>Determiner:</strong> Specifies nouns (e.g., "the", "a", "this")</li>
            <li><strong>Interjection:</strong> Exclamations (e.g., "wow", "oh", "hey")</li>
          </ul>
          <p>
            <strong>Use cases:</strong> Grammar analysis, writing style assessment, text complexity 
            measurement, linguistic research, educational applications, content analysis, automated 
            essay scoring, and understanding vocabulary diversity in documents.
          </p>
          <p>
            <strong>Interpreting results:</strong> The POS distribution shows the percentage of each word 
            class in your text. Higher noun counts suggest descriptive content, while more verbs indicate 
            action-oriented writing. The balance between different POS categories can reveal writing style 
            and complexity. Academic writing typically has more nouns and prepositions, while narrative 
            text features more verbs and pronouns.
          </p>
          <p>
            <strong>Visualization options:</strong> Bar Chart (POS distribution), Word Cloud (example words)
          </p>
          <p className='wiki-source'>
            <strong>Sources:</strong>
            <br/>Rules-based: Francis, W. N., & Kučera, H. (1979). <em>Brown corpus manual</em>. Brown University. 
            <a href="http://korpus.uib.no/icame/manuals/BROWN/INDEX.HTM" target="_blank" rel="noopener noreferrer">http://korpus.uib.no/icame/manuals/BROWN/INDEX.HTM</a>
            <br/>Jurafsky, D., & Martin, J. H. (2023). <em>Speech and Language Processing</em> (3rd ed. draft). Chapter 8: Part-of-Speech Tagging. 
            <a href="https://web.stanford.edu/~jurafsky/slp3/" target="_blank" rel="noopener noreferrer">https://web.stanford.edu/~jurafsky/slp3/</a>
            <br/>NLP Library: Compromise NLP Documentation. 
            <a href="https://github.com/spencermountain/compromise" target="_blank" rel="noopener noreferrer">https://github.com/spencermountain/compromise</a>
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
          <h4>Sentiment Analysis</h4>
          <p>
            <strong>What it does:</strong> Automatically determines the emotional tone or attitude 
            expressed in text, classifying it as positive, negative, or neutral. Each text sample 
            receives a sentiment label and confidence score.
          </p>
          <p>
            <strong>How it works:</strong> The analyzer examines words and phrases in the text, 
            comparing them against sentiment lexicons (dictionaries of positive and negative words). 
            Different algorithms apply various techniques to handle linguistic nuances like negation, 
            intensifiers, and context.
          </p>
          <p>
            <strong>Three Available Algorithms:</strong>
          </p>
          <ul>
            <li>
              <strong>Lexicon-Based:</strong> Simple word-matching approach that counts positive 
              and negative words from predefined dictionaries. Fast and transparent, works well 
              for straightforward sentiment detection. Best for: quick sentiment overview, 
              domain-general text.
            </li>
            <li>
              <strong>VADER-Like:</strong> Enhanced approach that considers intensifiers 
              ("very," "extremely"), negations ("not," "never"), and word proximity. More 
              sophisticated than lexicon-based, handles nuanced expressions better. 
              Best for: social media text, reviews with modifiers.
            </li>
            <li>
              <strong>Pattern-Based:</strong> Advanced method that detects linguistic patterns 
              including comparative/superlative forms ("better," "worst"), exclamation marks 
              for intensity, and contextual negation. Most context-aware of the three methods. 
              Best for: complex text with varied expressions, comparative statements.
            </li>
          </ul>
          <p>
            <strong>Key concepts:</strong>
          </p>
          <ul>
            <li><strong>Sentiment Score:</strong> A numerical value from -1 (very negative) to +1 (very positive), with 0 being neutral</li>
            <li><strong>Confidence:</strong> Ratio of sentiment-bearing words to total words; higher values indicate stronger sentiment signals</li>
            <li><strong>Intensifiers:</strong> Words that amplify sentiment (e.g., "very good" is more positive than just "good")</li>
            <li><strong>Negation:</strong> Words that flip sentiment polarity (e.g., "not good" becomes negative)</li>
          </ul>
          <p>
            <strong>Use cases:</strong> Customer feedback analysis, product review monitoring, 
            social media sentiment tracking, brand reputation analysis, survey response evaluation, 
            content moderation, and market research.
          </p>
          <p>
            <strong>Interpreting results:</strong> The summary shows the distribution of positive, 
            negative, and neutral texts as both counts and percentages. Average score indicates 
            overall sentiment tendency. Individual results show per-text sentiment with scores 
            and confidence levels. High confidence scores indicate clear sentiment, while low 
            confidence may suggest mixed or neutral content.
          </p>
          <p>
            <strong>Limitations:</strong> Sentiment analysis works best on opinion-rich text. 
            It may struggle with sarcasm, irony, domain-specific jargon, or highly nuanced 
            expressions. Results should be validated against human judgment for critical applications.
          </p>
          <p>
            <strong>Visualization options:</strong> Bar Chart (shows distribution of positive, negative, neutral)
          </p>
          <p className='wiki-source'>
            <strong>Sources:</strong>
            <br/>Sentiment Analysis Overview: Liu, B. (2012). Sentiment Analysis and Opinion Mining. <em>Synthesis Lectures on Human Language Technologies</em>, 5(1), 1-167. Morgan & Claypool Publishers.
            <br/>VADER: Hutto, C. J., & Gilbert, E. (2014). VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text. <em>Proceedings of the International AAAI Conference on Web and Social Media</em>, 8(1), 216-225.
            <br/>Lexicon-based Methods: Wilson, T., Wiebe, J., & Hoffmann, P. (2005). Recognizing contextual polarity in phrase-level sentiment analysis. <em>Proceedings of Human Language Technology Conference and Conference on Empirical Methods in Natural Language Processing</em>, 347-354.
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

        <div className='wiki-item'>
          <h4>Topic Modeling</h4>
          <p>
            <strong>What it does:</strong> Automatically discovers granular sub-topics within your documents 
            by identifying clusters of related terms. For example, a safety document might reveal distinct 
            topics for "ladder safety", "forklift operations", and "protective equipment".
          </p>
          <p>
            <strong>How it works:</strong> Uses hierarchical TF-IDF clustering to dynamically identify topics 
            from the text itself. The algorithm computes TF-IDF scores for all terms, creates a term-document 
            matrix, and applies k-means-like clustering to group related terms into coherent topics. Each topic 
            is represented by its most characteristic terms and assigned a relevance score.
          </p>
          <p>
            <strong>Algorithm details:</strong> The implementation follows these steps:
            <br/>1. Compute TF-IDF scores for all terms across documents
            <br/>2. Build term-document matrix with TF-IDF weights
            <br/>3. Calculate term co-occurrence patterns across documents
            <br/>4. Apply cosine similarity-based clustering to group terms
            <br/>5. Generate topic labels from top terms in each cluster
            <br/>6. Compute document-topic distribution matrix
            <br/>7. Identify topic co-occurrence for network visualization
          </p>
          <p>
            <strong>Use cases:</strong> Document categorization, content discovery, exploratory data analysis, 
            identifying themes in customer feedback, analyzing safety reports, discovering research trends, 
            and organizing large document collections.
          </p>
          <p>
            <strong>Interpreting results:</strong> Each topic is labeled with its top terms (e.g., "Topic 1: ladder, 
            safety, height"). The heatmap shows document-topic distributions where higher values indicate stronger 
            topic presence in a document. The network graph displays topic relationships based on co-occurrence 
            patterns. Topic size/score reflects the cumulative importance of terms in that topic.
          </p>
          <p>
            <strong>Parameters:</strong>
            <br/><strong>Number of Topics:</strong> Controls how many distinct topics to extract (2-20). Use fewer 
            topics for high-level themes, more topics for granular sub-topics. Too few topics create overly broad 
            categories; too many may split coherent topics.
            <br/><strong>Terms per Topic:</strong> Number of representative terms for each topic (5-30). More terms 
            provide better topic characterization but may include less relevant terms.
          </p>
          <p>
            <strong>Visualization options:</strong> Bar Chart (topic sizes), Word Cloud (all topic terms), 
            Network Graph (topic relationships), Heatmap (document-topic matrix)
          </p>
          <p className='wiki-source'>
            <strong>Sources:</strong> 
            <br/>Blei, D. M., Ng, A. Y., & Jordan, M. I. (2003). Latent Dirichlet Allocation. <em>Journal of Machine Learning Research</em>, 3, 993-1022. 
            <a href="https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf" target="_blank" rel="noopener noreferrer">https://www.jmlr.org/papers/volume3/blei03a/blei03a.pdf</a>
            <br/>Hofmann, T. (1999). Probabilistic latent semantic indexing. <em>Proceedings of the 22nd Annual International ACM SIGIR Conference</em>, 50-57. 
            <a href="https://doi.org/10.1145/312624.312649" target="_blank" rel="noopener noreferrer">https://doi.org/10.1145/312624.312649</a>
            <br/>Salton, G., & Buckley, C. (1988). Term-weighting approaches in automatic text retrieval. <em>Information Processing & Management</em>, 24(5), 513-523.
            <a href="https://doi.org/10.1016/0306-4573(88)90021-0" target="_blank" rel="noopener noreferrer">https://doi.org/10.1016/0306-4573(88)90021-0</a>
          </p>
        </div>

        <div className='wiki-item'>
          <h4>Readability Statistics</h4>
          <p>
            <strong>What it does:</strong> Evaluates how easy or difficult your text is to read using 
            six well-established readability formulas. Each algorithm assesses text complexity from a 
            different perspective, providing a comprehensive view of your content's accessibility. 
            Results are expressed as grade levels (years of education required) or standardized scores.
          </p>
          <p>
            <strong>How it works:</strong> The analyzer examines multiple text features including word 
            length (syllables, characters), sentence length, and vocabulary complexity. Each algorithm 
            applies a distinct mathematical formula based on extensive linguistic research. The system 
            automatically counts syllables using vowel clustering patterns, identifies sentence boundaries, 
            and calculates complex word ratios.
          </p>
          <p>
            <strong>The Six Algorithms:</strong>
          </p>
          <ul>
            <li>
              <strong>Flesch Reading Ease:</strong> Provides a score from 0-100 where higher scores 
              indicate easier text. Developed by Rudolf Flesch in 1948, it's one of the most widely 
              used readability metrics. Formula: 206.835 - 1.015(words/sentences) - 84.6(syllables/words). 
              90-100 = 5th grade, 60-70 = 8th-9th grade, 0-30 = college graduate level.
            </li>
            <li>
              <strong>Flesch-Kincaid Grade Level:</strong> Translates the Flesch score into U.S. grade 
              levels. Developed for the U.S. Navy in 1975, it's used extensively in education and 
              government. Formula: 0.39(words/sentences) + 11.8(syllables/words) - 15.59. A score of 
              8.0 means 8th grade reading level.
            </li>
            <li>
              <strong>Coleman-Liau Index:</strong> Uses character count instead of syllables, making it 
              more reliable for computer analysis. Developed in 1975 by Meri Coleman and T. L. Liau. 
              Formula: 0.0588L - 0.296S - 15.8 (L = letters per 100 words, S = sentences per 100 words). 
              Returns U.S. grade level.
            </li>
            <li>
              <strong>Gunning Fog Index:</strong> Estimates years of formal education needed to understand 
              text on first reading. Created by Robert Gunning in 1952, it emphasizes complex words. 
              Formula: 0.4 * ((words/sentences) + 100 * (complex words/words)). Complex words have 3+ 
              syllables. Ideal score is 7-8 (readable), 17+ is very difficult.
            </li>
            <li>
              <strong>SMOG Index:</strong> Simple Measure of Gobbledygook, developed by G. Harry McLaughlin 
              in 1969. Specifically designed for health care materials. Formula: 1.0430 * √(polysyllables * 
              30/sentences) + 3.1291. More reliable for texts with complex vocabulary.
            </li>
            <li>
              <strong>Automated Readability Index (ARI):</strong> Developed in 1967 for real-time readability 
              on electric typewriters. Uses character count and sentence length. Formula: 4.71(characters/words) 
              + 0.5(words/sentences) - 21.43. Returns approximate U.S. grade level.
            </li>
          </ul>
          <p>
            <strong>Use cases:</strong> Educational content creation, technical writing assessment, marketing 
            copy optimization, accessibility compliance, content strategy, health communication, legal document 
            analysis, and ensuring materials match target audience reading level.
          </p>
          <p>
            <strong>Interpreting results:</strong> Each document receives individual scores plus an aggregate 
            average. Grade levels indicate the years of education needed: 6 = elementary, 8 = middle school, 
            12 = high school, 16 = college. Most web content targets 8th-10th grade level. Technical papers 
            typically score 13-16. Children's books score 2-4. Use multiple algorithms together for the most 
            reliable assessment—if all algorithms agree, confidence is high.
          </p>
          <p>
            <strong>Best practices:</strong> For general audiences, aim for 7th-8th grade level (Flesch-Kincaid 
            7-8, Flesch Reading Ease 60-70). For specialized audiences (academic, technical), higher complexity 
            is acceptable. Lower scores don't mean "dumbed down"—they mean clear, accessible communication. 
            Analyze multiple documents together for consistent scoring. Use readability scores as guides, not 
            absolute rules.
          </p>
          <p>
            <strong>Visualization options:</strong> Bar Chart (compare scores across algorithms), List view 
            (detailed per-document analysis)
          </p>
          <p className='wiki-source'>
            <strong>Sources:</strong>
            <br/>Flesch, R. (1948). A new readability yardstick. <em>Journal of Applied Psychology</em>, 32(3), 221-233. 
            <a href="https://doi.org/10.1037/h0057532" target="_blank" rel="noopener noreferrer">https://doi.org/10.1037/h0057532</a>
            <br/>Kincaid, J. P., Fishburne, R. P., Rogers, R. L., & Chissom, B. S. (1975). <em>Derivation of New Readability Formulas for Navy Enlisted Personnel</em>. 
            Research Branch Report 8-75. Naval Technical Training Command. 
            <a href="https://apps.dtic.mil/sti/citations/ADA006655" target="_blank" rel="noopener noreferrer">https://apps.dtic.mil/sti/citations/ADA006655</a>
            <br/>Coleman, M., & Liau, T. L. (1975). A computer readability formula designed for machine scoring. <em>Journal of Applied Psychology</em>, 60(2), 283-284. 
            <a href="https://doi.org/10.1037/h0076540" target="_blank" rel="noopener noreferrer">https://doi.org/10.1037/h0076540</a>
            <br/>Gunning, R. (1952). <em>The Technique of Clear Writing</em>. New York: McGraw-Hill.
            <br/>McLaughlin, G. H. (1969). SMOG Grading: A New Readability Formula. <em>Journal of Reading</em>, 12(8), 639-646. 
            <a href="https://www.jstor.org/stable/40011226" target="_blank" rel="noopener noreferrer">https://www.jstor.org/stable/40011226</a>
            <br/>Smith, E. A., & Senter, R. J. (1967). <em>Automated Readability Index</em>. AMRL-TR-66-220. 
            Aerospace Medical Research Laboratories. 
            <a href="https://apps.dtic.mil/sti/citations/AD0667273" target="_blank" rel="noopener noreferrer">https://apps.dtic.mil/sti/citations/AD0667273</a>
            <br/>DuBay, W. H. (2004). <em>The Principles of Readability</em>. Costa Mesa, CA: Impact Information. 
            <a href="http://www.impact-information.com/impactinfo/readability02.pdf" target="_blank" rel="noopener noreferrer">http://www.impact-information.com/impactinfo/readability02.pdf</a>
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
            <li>Use <strong>Readability Statistics</strong> when assessing content complexity, optimizing for target audiences, or ensuring accessibility compliance</li>
            <li>Use <strong>Embeddings</strong> when visualizing document relationships and exploring corpus structure</li>
            <li>Use <strong>Dependency Parsing</strong> when analyzing sentence structure, grammar, or syntactic relationships</li>
            <li>Use <strong>Topic Modeling</strong> when discovering hidden themes, categorizing documents, or identifying granular sub-topics in large collections</li>
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
