/**
 * Centralized Text Analysis Utilities
 * 
 * This module provides core text analysis functions used throughout the application
 * including tokenization, stemming, TF-IDF, n-grams, association mining, and embeddings.
 */

// Default stopwords set used across text analysis functions
export const DEFAULT_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'of', 'to', 
  'in', 'on', 'for', 'with', 'this', 'that', 'it', 'is', 'are', 'was', 
  'were', 'be', 'as', 'by', 'at', 'from'
])

/**
 * Tokenize text into lowercase words, filtering out non-alphanumeric characters
 * @param {string} text - Input text to tokenize
 * @returns {string[]} Array of tokens
 */
export const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)

/**
 * Build a cached stemmer function for lightweight word stemming
 * Uses simple rule-based stemming (removes common suffixes)
 * @returns {Function} Stemmer function that takes a word and returns its stem
 */
export const buildStem = () => {
  const cache = new Map()
  return (w) => { 
    if(cache.has(w)) return cache.get(w)
    const s = w.replace(/(ing|ed|ly|s)$/,'')
    cache.set(w,s)
    return s 
  }
}

/**
 * Compute TF-IDF (Term Frequency - Inverse Document Frequency) for documents
 * @param {string[]} docs - Array of document texts
 * @param {Object} options - Analysis options
 * @param {Set} options.stopwords - Set of stopwords to exclude
 * @param {boolean} options.stem - Whether to apply stemming
 * @param {Function} options.stemmer - Stemmer function (if stem is true)
 * @returns {Object} Object with perDoc and aggregate TF-IDF scores
 */
export const computeTfIdf = (docs, { stopwords, stem, stemmer }) => {
  const termFreqs = []
  const docFreq = {}
  docs.forEach(d => {
    const counts = {}
    tokenize(d).forEach(tok => {
      if(stopwords.has(tok)) return
      const t = stem? stemmer(tok): tok
      counts[t] = (counts[t]||0)+1
    })
    termFreqs.push(counts)
    Object.keys(counts).forEach(t => { docFreq[t]=(docFreq[t]||0)+1 })
  })
  const N = docs.length
  const perDoc = termFreqs.map(tf => {
    const list = Object.entries(tf).map(([term, c]) => {
      const idf = Math.log((1+N)/(1+docFreq[term])) + 1
      return { term, tfidf: c * idf }
    }).sort((a,b)=>b.tfidf-a.tfidf).slice(0,80)
    return list
  })
  const aggregateMap = {}
  perDoc.forEach(list => list.forEach(({term, tfidf}) => { aggregateMap[term]=(aggregateMap[term]||0)+tfidf }))
  const aggregate = Object.entries(aggregateMap).map(([term, score])=>({term, score})).sort((a,b)=>b.score-a.score).slice(0,150)
  return { perDoc, aggregate }
}

/**
 * Generate n-grams from texts
 * @param {string[]} texts - Array of texts
 * @param {Object} options - Analysis options
 * @param {number} options.n - N-gram size (default: 2)
 * @param {number} options.top - Number of top n-grams to return (default: 80)
 * @param {Set} options.stopwords - Set of stopwords to exclude
 * @param {boolean} options.stem - Whether to apply stemming
 * @param {Function} options.stemmer - Stemmer function (if stem is true)
 * @returns {Array} Array of n-grams with counts, sorted by frequency
 */
export const generateNGrams = (texts, { n=2, top=80, stopwords, stem, stemmer }) => {
  const freq = {}
  texts.forEach(t => {
    let tokens = tokenize(t).filter(x=>!stopwords.has(x))
    if(stem) tokens = tokens.map(stemmer)
    for(let i=0;i<=tokens.length-n;i++) {
      const gram = tokens.slice(i,i+n).join(' ')
      freq[gram] = (freq[gram]||0)+1
    }
  })
  return Object.entries(freq).map(([gram,count])=>({gram,count})).sort((a,b)=>b.count-a.count).slice(0, top)
}

/**
 * Mine associations (word pairs) from data
 * @param {Array} rows - Array of data rows
 * @param {Array} cols - Column names to analyze
 * @param {Object} options - Analysis options
 * @param {number} options.minSupport - Minimum support threshold (default: 0.02)
 * @param {Set} options.stopwords - Set of stopwords to exclude
 * @param {boolean} options.stem - Whether to apply stemming
 * @param {Function} options.stemmer - Stemmer function (if stem is true)
 * @returns {Object} Object with items and pairs arrays
 */
export const mineAssociations = (rows, cols, { minSupport=0.02, stopwords, stem, stemmer }) => {
  const transactions = rows.map(r => {
    let tokens = tokenize(cols.map(c=> (r[c]??'').toString()).join(' ')).filter(x=>!stopwords.has(x))
    if(stem) tokens = tokens.map(stemmer)
    return Array.from(new Set(tokens))
  })
  const itemCounts = {}
  transactions.forEach(tr => tr.forEach(it => itemCounts[it]=(itemCounts[it]||0)+1))
  const total = transactions.length
  const items = Object.entries(itemCounts).filter(([,c])=>c/total>=minSupport).map(([item,c])=>({item,support:c/total,count:c}))
  const itemSet = new Set(items.map(i=>i.item))
  const pairCounts = {}
  transactions.forEach(tr => {
    const f = tr.filter(t=>itemSet.has(t))
    for(let i=0;i<f.length;i++) for(let j=i+1;j<f.length;j++) {
      const a=f[i], b=f[j]; const k=a<b? a+'|'+b : b+'|'+a; pairCounts[k]=(pairCounts[k]||0)+1 }
  })
  const pairs = Object.entries(pairCounts).map(([k,c])=>{ const [a,b]=k.split('|'); const support = c/total; if(support<minSupport) return null; const confAB = c/itemCounts[a]; const confBA = c/itemCounts[b]; const lift = support / ((itemCounts[a]/total)*(itemCounts[b]/total)); return {a,b,support,count:c,confidenceAB:confAB,confidenceBA:confBA,lift}}).filter(Boolean).sort((a,b)=>b.lift-a.lift).slice(0,120)
  return { items: items.sort((a,b)=>b.support-a.support), pairs }
}

/**
 * Extract named entities from texts using NLP library
 * @param {string[]} texts - Array of texts
 * @param {Function} nlpLib - NLP library function (e.g., compromise)
 * @returns {Array} Array of entities with counts
 */
export const extractEntities = (texts, nlpLib) => {
  const ent = {}
  texts.forEach(t => {
    const doc = nlpLib(t)
    ;['people','places','organizations'].forEach(key => {
      const arr = doc[key]().out('array')
      arr.forEach(v => { ent[v]=(ent[v]||0)+1 })
    })
  })
  return Object.entries(ent).map(([value,count])=>({value,type:'Entity',count})).sort((a,b)=>b.count-a.count).slice(0,150)
}

/**
 * Compute document embeddings using TF-IDF vectors
 * @param {string[]} docs - Array of document texts
 * @param {Object} options - Analysis options
 * @param {Set} options.stopwords - Set of stopwords to exclude
 * @param {boolean} options.stem - Whether to apply stemming
 * @param {Function} options.stemmer - Stemmer function (if stem is true)
 * @returns {Object} Object with vectors array and vocab array
 */
export const computeDocumentEmbeddings = (docs, { stopwords, stem, stemmer }) => {
  // First compute TF-IDF
  const tfidf = computeTfIdf(docs, { stopwords, stem, stemmer })
  
  // Build vocabulary from top terms
  const vocab = tfidf.aggregate.slice(0, 100).map(t => t.term)
  const vocabMap = {}
  vocab.forEach((term, idx) => { vocabMap[term] = idx })
  
  // Create document vectors
  const vectors = tfidf.perDoc.map(docTerms => {
    const vector = new Array(vocab.length).fill(0)
    docTerms.forEach(({ term, tfidf }) => {
      if (vocabMap[term] !== undefined) {
        vector[vocabMap[term]] = tfidf
      }
    })
    return vector
  })
  
  return { vectors, vocab }
}
