# Utility Modules Documentation

This directory contains centralized utility modules used throughout the Interactive Text Analyzer application. Each module groups related functions to improve maintainability, reduce code duplication, and enhance testability.

## Table of Contents

1. [Text Analysis (`textAnalysis.js`)](#text-analysis)
2. [Statistics (`statistics.js`)](#statistics)
3. [Categorical Utilities (`categoricalUtils.js`)](#categorical-utilities)
4. [Dimensionality Reduction (`dimensionalityReduction.js`)](#dimensionality-reduction)
5. [Data Versioning (`dataVersioning.js`)](#data-versioning)
6. [Dependency Parsing (`dependencyParsing.js`)](#dependency-parsing)
7. [Lazy Loading (`lazyLoader.js`, `useLazyLoader.js`)](#lazy-loading)

---

## Text Analysis

**File:** `textAnalysis.js`

Core text processing and natural language analysis utilities.

### Exports

#### Constants
- **`DEFAULT_STOPWORDS`**: Set of common English stopwords used to filter out non-meaningful words

#### Functions

##### `tokenize(text)`
Splits text into lowercase tokens, filtering out non-alphanumeric characters (preserves apostrophes).

```javascript
import { tokenize } from './utils/textAnalysis'

const tokens = tokenize("Hello, world! It's a nice day.")
// Returns: ['hello', 'world', "it's", 'a', 'nice', 'day']
```

##### `buildStem()`
Creates a cached stemmer function for basic word stemming (removes common suffixes: ing, ed, ly, s).

```javascript
import { buildStem } from './utils/textAnalysis'

const stemmer = buildStem()
console.log(stemmer('running'))  // 'run'
console.log(stemmer('happily'))  // 'happi'
```

##### `computeTfIdf(docs, options)`
Computes TF-IDF (Term Frequency-Inverse Document Frequency) scores for documents.

**Parameters:**
- `docs` (string[]): Array of document texts
- `options.stopwords` (Set): Stopwords to exclude
- `options.stem` (boolean): Whether to apply stemming
- `options.stemmer` (Function): Stemmer function if stem is true

**Returns:** Object with `perDoc` (per-document scores) and `aggregate` (overall scores)

```javascript
import { computeTfIdf, DEFAULT_STOPWORDS, buildStem } from './utils/textAnalysis'

const docs = ['cat sat mat', 'dog sat log', 'cats dogs animals']
const stemmer = buildStem()
const result = computeTfIdf(docs, { 
  stopwords: DEFAULT_STOPWORDS, 
  stem: true, 
  stemmer 
})
```

##### `generateNGrams(texts, options)`
Generates n-grams (sequences of n consecutive words) from texts.

**Parameters:**
- `texts` (string[]): Array of texts
- `options.n` (number): N-gram size (default: 2)
- `options.top` (number): Number of top n-grams to return (default: 80)
- `options.stopwords` (Set): Stopwords to exclude
- `options.stem` (boolean): Whether to apply stemming
- `options.stemmer` (Function): Stemmer function if stem is true

```javascript
import { generateNGrams, DEFAULT_STOPWORDS } from './utils/textAnalysis'

const texts = ['machine learning algorithms', 'deep learning networks']
const bigrams = generateNGrams(texts, { 
  n: 2, 
  stopwords: DEFAULT_STOPWORDS 
})
```

##### `mineAssociations(rows, cols, options)`
Mines word associations (frequent item pairs) using association rule mining.

**Parameters:**
- `rows` (Array): Array of data rows
- `cols` (string[]): Column names to analyze
- `options.minSupport` (number): Minimum support threshold (default: 0.02)
- `options.stopwords` (Set): Stopwords to exclude
- `options.stem` (boolean): Whether to apply stemming
- `options.stemmer` (Function): Stemmer function if stem is true

**Returns:** Object with `items` (frequent items) and `pairs` (associated pairs with lift scores)

##### `extractEntities(texts, nlpLib)`
Extracts named entities (people, places, organizations) using NLP library.

**Parameters:**
- `texts` (string[]): Array of texts
- `nlpLib` (Function): NLP library function (e.g., compromise)

**Returns:** Array of entities with counts

##### `extractYakeKeywords(texts, options)`
Extracts keywords using YAKE (Yet Another Keyword Extractor) algorithm - a lightweight unsupervised keyword extraction method.

**Parameters:**
- `texts` (string[]): Array of texts
- `options.maxNgram` (number): Maximum n-gram size (default: 3, range: 1-3)
- `options.top` (number): Number of top keywords to return (default: 80)
- `options.stopwords` (Set): Stopwords to exclude

**Returns:** Array of keywords with scores (lower scores indicate more important keywords)

```javascript
import { extractYakeKeywords, DEFAULT_STOPWORDS } from './utils/textAnalysis'

const texts = ['Machine learning and artificial intelligence are transforming technology']
const keywords = extractYakeKeywords(texts, { 
  maxNgram: 2, 
  top: 10, 
  stopwords: DEFAULT_STOPWORDS 
})
// Returns keywords like 'machine learning', 'artificial intelligence', etc.
```

##### `analyzeLemmatization(texts, options)`
Reduces words to their base or dictionary form (lemma), grouping together inflected forms.

**Parameters:**
- `texts` (string[]): Array of texts
- `options.method` (string): Lemmatization method - 'wordnet', 'rules', or 'compromise' (default: 'rules')
- `options.top` (number): Number of top lemmas to return (default: 80)
- `options.nlpLib` (Function): NLP library (compromise) for 'compromise' method
- `options.stopwords` (Set): Stopwords to exclude

**Returns:** Array of lemmas with counts and original forms

**Methods:**
- `wordnet`: Uses Princeton WordNet-inspired dictionary for common English words and irregular forms
- `rules`: Applies morphological transformation rules (fast, works with any word)
- `compromise`: Uses Compromise NLP library for context-aware lemmatization (most accurate)

```javascript
import { analyzeLemmatization, DEFAULT_STOPWORDS } from './utils/textAnalysis'

const texts = ['The cats were running quickly', 'Children ran faster']
const lemmas = analyzeLemmatization(texts, { 
  method: 'rules', 
  top: 20, 
  stopwords: DEFAULT_STOPWORDS 
})
// Returns: [{lemma: 'cat', count: 1, originals: 'cats'}, {lemma: 'run', count: 2, originals: 'running, ran'}, ...]
```

##### `analyzeSentiment(texts, options)`
Analyzes the sentiment (emotional tone) of texts, classifying them as positive, negative, or neutral.

**Parameters:**
- `texts` (string[]): Array of texts to analyze
- `options.method` (string): Sentiment analysis method - 'lexicon', 'vader', or 'pattern' (default: 'lexicon')
- `options.stopwords` (Set): Stopwords to exclude from analysis

**Returns:** Object with sentiment results and summary statistics

**Methods:**
- `lexicon`: Simple lexicon-based approach using positive/negative word lists
- `vader`: VADER-like approach with intensifiers, negations, and context awareness
- `pattern`: Pattern-based approach with comparative/superlative detection and exclamation marks

**Result Structure:**
```javascript
{
  results: [
    {
      text: 'truncated text...',
      sentiment: 'positive' | 'negative' | 'neutral',
      score: number,        // -1 to 1 range
      positive: number,     // count of positive words
      negative: number,     // count of negative words
      confidence: number,   // 0 to 1 range
      index: number
    }
  ],
  summary: {
    total: number,
    positive: number,
    negative: number,
    neutral: number,
    positivePercent: number,
    negativePercent: number,
    neutralPercent: number,
    avgScore: number,
    avgConfidence: number
  },
  method: string
}
```

**Example:**
```javascript
import { analyzeSentiment, DEFAULT_STOPWORDS } from './utils/textAnalysis'

const texts = [
  'This product is absolutely amazing!',
  'Terrible experience, would not recommend',
  'It works as expected'
]

const result = analyzeSentiment(texts, { 
  method: 'vader', 
  stopwords: DEFAULT_STOPWORDS 
})

console.log(result.summary)
// {
//   total: 3,
//   positive: 1,
//   negative: 1,
//   neutral: 1,
//   positivePercent: 33.33,
//   negativePercent: 33.33,
//   neutralPercent: 33.33,
//   ...
// }
```

##### `computeDocumentEmbeddings(docs, options)`
Computes TF-IDF-based document embeddings (vector representations).

**Parameters:**
- `docs` (string[]): Array of document texts
- `options.stopwords` (Set): Stopwords to exclude
- `options.stem` (boolean): Whether to apply stemming
- `options.stemmer` (Function): Stemmer function if stem is true

**Returns:** Object with `vectors` (document vectors) and `vocab` (vocabulary)

##### `performTopicModeling(docs, options)`
Performs hierarchical topic modeling to identify granular sub-topics in documents using TF-IDF based clustering.

**Parameters:**
- `docs` (string[]): Array of document texts
- `options.numTopics` (number): Number of topics to extract (default: 5)
- `options.termsPerTopic` (number): Number of top terms per topic (default: 10)
- `options.stopwords` (Set): Stopwords to exclude
- `options.stem` (boolean): Whether to apply stemming
- `options.stemmer` (Function): Stemmer function if stem is true

**Returns:** Object with:
- `topics`: Array of topic objects with id, label, terms, and size
- `docTopicMatrix`: 2D array of document-topic probability distributions
- `topicCooccurrence`: Array of topic co-occurrence data for network visualization

**Example:**
```javascript
import { performTopicModeling, DEFAULT_STOPWORDS, buildStem } from './utils/textAnalysis'

const docs = [
  'Always use proper ladder safety when working at heights',
  'Forklift operators must be certified and trained',
  'Wear protective equipment including hard hats'
]
const stemmer = buildStem()
const result = performTopicModeling(docs, { 
  numTopics: 3,
  termsPerTopic: 10,
  stopwords: DEFAULT_STOPWORDS, 
  stem: false, 
  stemmer 
})

// Result contains:
// - topics: [{id, label, terms, size}, ...]
// - docTopicMatrix: [[0.8, 0.1, 0.1], ...] (each row sums to 1)
// - topicCooccurrence: [{source, target, weight}, ...]
```

**Algorithm:**
1. Computes TF-IDF scores for all terms
2. Builds term-document matrix
3. Applies k-means-like clustering using cosine similarity
4. Generates topic labels from top terms
5. Calculates document-topic distributions
6. Identifies topic co-occurrence patterns

##### `analyzeReadability(texts, options)`
Analyzes text readability using six established readability formulas to assess content complexity and accessibility.

**Parameters:**
- `texts` (string[]): Array of text documents to analyze
- `options.perDocument` (boolean): Return per-document scores (default: true)

**Returns:** Object with:
- `results`: Array of per-document readability scores (if perDocument is true)
- `aggregate`: Average scores across all documents
- `interpretation`: Human-readable interpretations for each algorithm
- `algorithms`: List of algorithm names used

**Six Readability Algorithms:**

1. **Flesch Reading Ease** (0-100 scale, higher = easier)
   - 90-100: Very Easy (5th grade)
   - 60-70: Standard (8th-9th grade)
   - 0-30: Very Difficult (college graduate)

2. **Flesch-Kincaid Grade Level** (U.S. grade level)
   - Returns approximate years of education needed
   
3. **Coleman-Liau Index** (U.S. grade level)
   - Uses character count instead of syllables
   - More reliable for computer analysis
   
4. **Gunning Fog Index** (years of education)
   - Emphasizes complex words (3+ syllables)
   - Ideal score: 7-8 (readable)
   
5. **SMOG Index** (grade level)
   - Simple Measure of Gobbledygook
   - Designed for health care materials
   
6. **Automated Readability Index (ARI)** (grade level)
   - Uses character count and sentence length
   - Fast and reliable

**Result Structure:**
```javascript
{
  results: [
    {
      index: 0,
      text: 'truncated text...',
      flesch: 65.5,
      fleschKincaid: 8.2,
      colemanLiau: 9.1,
      gunningFog: 10.4,
      smog: 9.8,
      ari: 8.7,
      words: 150,
      sentences: 8,
      syllables: 220,
      characters: 650,
      complexWords: 25
    }
  ],
  aggregate: {
    flesch: 65.5,
    fleschKincaid: 8.2,
    colemanLiau: 9.1,
    gunningFog: 10.4,
    smog: 9.8,
    ari: 8.7,
    totalWords: 150,
    totalSentences: 8,
    totalSyllables: 220,
    totalCharacters: 650,
    totalComplexWords: 25,
    avgWords: 150,
    avgSentences: 8
  },
  interpretation: {
    flesch: 'Standard (8th-9th grade)',
    fleschKincaid: 'Middle School',
    colemanLiau: 'Middle School',
    gunningFog: 'High School',
    smog: 'Middle School',
    ari: 'Middle School'
  },
  algorithms: [...]
}
```

**Example:**
```javascript
import { analyzeReadability } from './utils/textAnalysis'

const texts = [
  'The cat sat on the mat. It was a sunny day.',
  'Photosynthesis is a complex biochemical process that converts light energy into chemical energy.'
]

const result = analyzeReadability(texts, { perDocument: true })

console.log(result.aggregate)
// {
//   flesch: 55.2,
//   fleschKincaid: 10.5,
//   colemanLiau: 9.8,
//   ...
// }

console.log(result.interpretation.flesch)
// 'Fairly Difficult (10th-12th grade)'

// Get scores for individual documents
result.results.forEach((doc, i) => {
  console.log(`Document ${i + 1}: Grade Level ${doc.fleschKincaid}`)
})
```

**Use Cases:**
- Assessing content accessibility for target audiences
- Optimizing marketing copy and web content (target 7th-8th grade)
- Evaluating educational materials
- Ensuring compliance with accessibility standards
- Technical writing assessment
- Health communication analysis

**Best Practices:**
- For general audiences, aim for Flesch-Kincaid grade 7-8
- Use multiple algorithms together for most reliable assessment
- Lower scores mean clearer communication, not "dumbed down" content
- Analyze similar documents together for consistency
- Consider audience expertise when interpreting scores

**Academic Sources:**
- Flesch, R. (1948). A new readability yardstick. *Journal of Applied Psychology*, 32(3), 221-233.
- Kincaid et al. (1975). Derivation of New Readability Formulas. Naval Technical Training Command.
- Coleman, M., & Liau, T. L. (1975). A computer readability formula. *Journal of Applied Psychology*, 60(2), 283-284.
- McLaughlin, G. H. (1969). SMOG Grading. *Journal of Reading*, 12(8), 639-646.

---

## Statistics

**File:** `statistics.js`

Statistical functions for data analysis and hypothesis testing.

### Exports

##### `mean(arr)`
Calculates the arithmetic mean (average) of numbers.

```javascript
import { mean } from './utils/statistics'

console.log(mean([1, 2, 3, 4, 5]))  // 3
```

##### `stdDev(arr)`
Calculates the standard deviation of numbers.

```javascript
import { stdDev } from './utils/statistics'

console.log(stdDev([2, 4, 4, 4, 5, 5, 7, 9]))  // ~2
```

##### `erf(x)`
Error function approximation (Abramowitz and Stegun method).

##### `normalCDF(z)`
Cumulative distribution function for standard normal distribution.

```javascript
import { normalCDF } from './utils/statistics'

console.log(normalCDF(0))   // 0.5
console.log(normalCDF(1.96)) // ~0.975
```

##### `welchTTest(arr1, arr2)`
Performs Welch's t-test for comparing two samples with potentially unequal variances.

**Returns:** Object with `tStatistic`, `df` (degrees of freedom), and `pValue`

```javascript
import { welchTTest } from './utils/statistics'

const sample1 = [1, 2, 3, 4, 5]
const sample2 = [3, 4, 5, 6, 7]
const result = welchTTest(sample1, sample2)
console.log(result.pValue < 0.05 ? 'Significant' : 'Not significant')
```

---

## Categorical Utilities

**File:** `categoricalUtils.js`

Utilities for handling and normalizing categorical data.

### Exports

##### `normalizeValue(val)`
Normalizes categorical values with synonym detection (e.g., 'y', 'yes', 'true' → 'yes').

```javascript
import { normalizeValue } from './utils/categoricalUtils'

console.log(normalizeValue('Y'))      // 'yes'
console.log(normalizeValue('true'))   // 'yes'
console.log(normalizeValue('N'))      // 'no'
console.log(normalizeValue('false'))  // 'no'
console.log(normalizeValue('active')) // 'active'
```

##### `getCategoricalValues(rows, column)`
Extracts unique normalized categorical values from a data column.

```javascript
import { getCategoricalValues } from './utils/categoricalUtils'

const rows = [
  { status: 'Active' },
  { status: 'active' },
  { status: 'Pending' }
]
const values = getCategoricalValues(rows, 'status')
// Returns: ['active', 'pending']
```

---

## Dimensionality Reduction

**File:** `dimensionalityReduction.js`

Algorithms for reducing high-dimensional data to 2D for visualization.

### Exports

##### `simplePCA(vectors)`
Performs Principal Component Analysis (PCA) to reduce vectors to 2D.

**Parameters:**
- `vectors` (Array<number[]>): Array of high-dimensional vectors

**Returns:** Array of 2D points with `x` and `y` coordinates

```javascript
import { simplePCA } from './utils/dimensionalityReduction'

const vectors = [
  [1, 2, 3, 4, 5],
  [2, 3, 4, 5, 6],
  [3, 4, 5, 6, 7]
]
const points2D = simplePCA(vectors)
// Returns: [{ x: ..., y: ... }, { x: ..., y: ... }, { x: ..., y: ... }]
```

##### `loadDimReductionLibs()`
Loads dimensionality reduction libraries (currently returns PCA).

**Returns:** Promise resolving to object with `pca` function and `loaded` flag

##### `applyDimensionalityReduction(vectors, method, libs)`
Applies dimensionality reduction using specified method.

**Parameters:**
- `vectors` (Array<number[]>): High-dimensional vectors
- `method` (string): Method to use ('pca', 'tsne', or 'umap')
- `libs` (Object): Loaded libraries from `loadDimReductionLibs()`

**Returns:** Promise resolving to array of 2D points

---

## Testing

All utility modules have comprehensive unit tests located in `src/test/`:

- `statistics.test.js` - 15 tests for statistical functions
- `categoricalUtils.test.js` - 13 tests for categorical utilities
- `dimensionalityReduction.test.js` - 12 tests for dimensionality reduction
- `utils.test.js` - Tests for text analysis functions
- `embeddings.test.js` - Tests for document embeddings
- `sentiment.test.js` - Comprehensive tests for sentiment analysis (all 3 methods)
- `lemmatization.test.js` - Tests for lemmatization
- `tokenization.test.js` - Tests for tokenization
- `partsOfSpeech.test.js` - Tests for POS tagging

Run tests with:
```bash
npm test
```

---

## Best Practices

1. **Import only what you need** to keep bundle size small
2. **Reuse the DEFAULT_STOPWORDS** constant rather than creating new stopword sets
3. **Cache stemmers** created with `buildStem()` to improve performance
4. **Use appropriate minSupport values** in association mining based on dataset size
5. **Handle empty inputs** - all functions gracefully handle edge cases

---

## Migration Notes

If you have code that duplicates these functions, migrate to the centralized versions:

### Before:
```javascript
const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)
```

### After:
```javascript
import { tokenize } from './utils/textAnalysis'
```

This ensures:
- Consistent behavior across the application
- Single source of truth for bug fixes and improvements
- Better testability
- Reduced bundle size

---

## Contributing

When adding new utility functions:

1. Add them to the appropriate module (or create a new one if needed)
2. Export the function with clear JSDoc comments
3. Create comprehensive unit tests
4. Update this README
5. Ensure all tests pass and linting is clean

```bash
npm run lint
npm test
```
