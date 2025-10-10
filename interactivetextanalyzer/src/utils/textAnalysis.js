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

/**
 * Extract keywords using YAKE (Yet Another Keyword Extractor) algorithm
 * A lightweight unsupervised automatic keyword extraction method
 * @param {string[]} texts - Array of texts
 * @param {Object} options - Analysis options
 * @param {number} options.maxNgram - Maximum n-gram size (default: 3, range: 1-3)
 * @param {number} options.top - Number of top keywords to return (default: 80)
 * @param {Set} options.stopwords - Set of stopwords to exclude
 * @returns {Array} Array of keywords with scores (lower scores = more important)
 */
export const extractYakeKeywords = (texts, { maxNgram = 3, top = 80, stopwords }) => {
  // Combine all texts into one document for YAKE processing
  const fullText = texts.join(' ')
  
  // Tokenize and filter stopwords
  const allTokens = tokenize(fullText).filter(t => !stopwords.has(t) && t.length > 2)
  
  if (allTokens.length === 0) return []
  
  // Calculate term statistics
  const termFreq = {}
  const termPositions = {}
  const termSentences = {}
  
  allTokens.forEach((term, idx) => {
    termFreq[term] = (termFreq[term] || 0) + 1
    if (!termPositions[term]) termPositions[term] = []
    termPositions[term].push(idx)
    // Approximate sentence by position
    const sentIdx = Math.floor(idx / 20)
    if (!termSentences[term]) termSentences[term] = new Set()
    termSentences[term].add(sentIdx)
  })
  
  const totalTerms = allTokens.length
  
  // Calculate YAKE features for each term
  const termScores = {}
  
  Object.keys(termFreq).forEach(term => {
    // Feature 1: Casing (simplified - all lowercase already, so not used)
    // const casing = 0
    
    // Feature 2: Position (favor terms appearing early)
    const firstPos = termPositions[term][0]
    const position = Math.log(3 + firstPos / totalTerms)
    
    // Feature 3: Term frequency normalization
    const tf = termFreq[term]
    const freqNorm = tf / (1 + Math.log(tf))
    
    // Feature 4: Relatedness to context (simplified)
    const relatedness = 1
    
    // Feature 5: Different sentences (spread across document)
    const sentenceSpread = termSentences[term].size
    const differentSentences = 1 + Math.log(sentenceSpread)
    
    // Combine features (lower score = better keyword)
    const score = (position * relatedness) / (freqNorm * differentSentences + 0.0001)
    termScores[term] = score
  })
  
  // Extract n-gram candidates (1 to maxNgram words)
  const ngramScores = {}
  
  for (let n = 1; n <= Math.min(maxNgram, 3); n++) {
    for (let i = 0; i <= allTokens.length - n; i++) {
      const ngram = allTokens.slice(i, i + n)
      const ngramKey = ngram.join(' ')
      
      // Skip if already processed or contains stopwords
      if (ngramScores[ngramKey]) continue
      
      // Calculate n-gram score as average of term scores
      const scores = ngram.map(t => termScores[t] || 1)
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
      
      // Bonus for multi-word terms
      const lengthBonus = n > 1 ? 0.85 : 1.0
      
      ngramScores[ngramKey] = avgScore * lengthBonus
    }
  }
  
  // Sort by score (lower is better) and return top results
  return Object.entries(ngramScores)
    .map(([keyword, score]) => ({ keyword, score }))
    .sort((a, b) => a.score - b.score)
    .slice(0, top)
}

/**
 * Analyze lemmatization to reduce words to their base or dictionary form
 * @param {string[]} texts - Array of text documents
 * @param {Object} options - Analysis options
 * @param {string} options.method - Lemmatization method: 'wordnet', 'rules', 'compromise'
 * @param {number} options.top - Number of top lemmas to return (default: 80)
 * @param {Function} options.nlpLib - NLP library (compromise) for 'compromise' method
 * @param {Set} options.stopwords - Set of stopwords to exclude
 * @returns {Array} Array of lemmas with counts and original forms
 */
export const analyzeLemmatization = (texts, { method = 'rules', top = 80, nlpLib = null, stopwords = new Set() }) => {
  const lemmaCounts = {}
  const lemmaToOriginals = {} // Track original forms for each lemma
  
  // Strategy pattern: map method to handler function
  const strategies = {
    wordnet: () => {
      // Princeton WordNet-based lemmatization
      // Uses a simplified WordNet-inspired approach with common base forms
      const wordnetMap = {
        // Verbs - present/past/gerund to base form
        'running': 'run', 'ran': 'run', 'runs': 'run',
        'walking': 'walk', 'walked': 'walk', 'walks': 'walk',
        'talking': 'talk', 'talked': 'talk', 'talks': 'talk',
        'writing': 'write', 'wrote': 'write', 'writes': 'write', 'written': 'write',
        'reading': 'read', 'reads': 'read',
        'making': 'make', 'made': 'make', 'makes': 'make',
        'thinking': 'think', 'thought': 'think', 'thinks': 'think',
        'going': 'go', 'went': 'go', 'goes': 'go', 'gone': 'go',
        'coming': 'come', 'came': 'come', 'comes': 'come',
        'taking': 'take', 'took': 'take', 'takes': 'take', 'taken': 'take',
        'seeing': 'see', 'saw': 'see', 'sees': 'see', 'seen': 'see',
        'getting': 'get', 'got': 'get', 'gets': 'get', 'gotten': 'get',
        'finding': 'find', 'found': 'find', 'finds': 'find',
        'giving': 'give', 'gave': 'give', 'gives': 'give', 'given': 'give',
        'telling': 'tell', 'told': 'tell', 'tells': 'tell',
        'feeling': 'feel', 'felt': 'feel', 'feels': 'feel',
        'leaving': 'leave', 'left': 'leave', 'leaves': 'leave',
        'putting': 'put', 'puts': 'put',
        'meaning': 'mean', 'meant': 'mean', 'means': 'mean',
        'keeping': 'keep', 'kept': 'keep', 'keeps': 'keep',
        'letting': 'let', 'lets': 'let',
        'beginning': 'begin', 'began': 'begin', 'begins': 'begin', 'begun': 'begin',
        'seeming': 'seem', 'seemed': 'seem', 'seems': 'seem',
        'helping': 'help', 'helped': 'help', 'helps': 'help',
        'showing': 'show', 'showed': 'show', 'shows': 'show', 'shown': 'show',
        'hearing': 'hear', 'heard': 'hear', 'hears': 'hear',
        'playing': 'play', 'played': 'play', 'plays': 'play',
        'moving': 'move', 'moved': 'move', 'moves': 'move',
        'living': 'live', 'lived': 'live', 'lives': 'live',
        'believing': 'believe', 'believed': 'believe', 'believes': 'believe',
        'bringing': 'bring', 'brought': 'bring', 'brings': 'bring',
        'happening': 'happen', 'happened': 'happen', 'happens': 'happen',
        'writing': 'write', 'wrote': 'write', 'writes': 'write', 'written': 'write',
        'providing': 'provide', 'provided': 'provide', 'provides': 'provide',
        'sitting': 'sit', 'sat': 'sit', 'sits': 'sit',
        'standing': 'stand', 'stood': 'stand', 'stands': 'stand',
        'losing': 'lose', 'lost': 'lose', 'loses': 'lose',
        'paying': 'pay', 'paid': 'pay', 'pays': 'pay',
        'meeting': 'meet', 'met': 'meet', 'meets': 'meet',
        'including': 'include', 'included': 'include', 'includes': 'include',
        'continuing': 'continue', 'continued': 'continue', 'continues': 'continue',
        'setting': 'set', 'sets': 'set',
        'learning': 'learn', 'learned': 'learn', 'learns': 'learn', 'learnt': 'learn',
        'changing': 'change', 'changed': 'change', 'changes': 'change',
        'leading': 'lead', 'led': 'lead', 'leads': 'lead',
        'understanding': 'understand', 'understood': 'understand', 'understands': 'understand',
        'watching': 'watch', 'watched': 'watch', 'watches': 'watch',
        'following': 'follow', 'followed': 'follow', 'follows': 'follow',
        'stopping': 'stop', 'stopped': 'stop', 'stops': 'stop',
        'creating': 'create', 'created': 'create', 'creates': 'create',
        'speaking': 'speak', 'spoke': 'speak', 'speaks': 'speak', 'spoken': 'speak',
        'spending': 'spend', 'spent': 'spend', 'spends': 'spend',
        'growing': 'grow', 'grew': 'grow', 'grows': 'grow', 'grown': 'grow',
        'opening': 'open', 'opened': 'open', 'opens': 'open',
        'winning': 'win', 'won': 'win', 'wins': 'win',
        'offering': 'offer', 'offered': 'offer', 'offers': 'offer',
        'remembering': 'remember', 'remembered': 'remember', 'remembers': 'remember',
        'considering': 'consider', 'considered': 'consider', 'considers': 'consider',
        'appearing': 'appear', 'appeared': 'appear', 'appears': 'appear',
        'buying': 'buy', 'bought': 'buy', 'buys': 'buy',
        'waiting': 'wait', 'waited': 'wait', 'waits': 'wait',
        'serving': 'serve', 'served': 'serve', 'serves': 'serve',
        'dying': 'die', 'died': 'die', 'dies': 'die',
        'sending': 'send', 'sent': 'send', 'sends': 'send',
        'expecting': 'expect', 'expected': 'expect', 'expects': 'expect',
        'building': 'build', 'built': 'build', 'builds': 'build',
        'staying': 'stay', 'stayed': 'stay', 'stays': 'stay',
        'falling': 'fall', 'fell': 'fall', 'falls': 'fall', 'fallen': 'fall',
        'cutting': 'cut', 'cuts': 'cut',
        'reaching': 'reach', 'reached': 'reach', 'reaches': 'reach',
        'killing': 'kill', 'killed': 'kill', 'kills': 'kill',
        'remaining': 'remain', 'remained': 'remain', 'remains': 'remain',
        'suggesting': 'suggest', 'suggested': 'suggest', 'suggests': 'suggest',
        'raising': 'raise', 'raised': 'raise', 'raises': 'raise',
        'passing': 'pass', 'passed': 'pass', 'passes': 'pass',
        'selling': 'sell', 'sold': 'sell', 'sells': 'sell',
        'requiring': 'require', 'required': 'require', 'requires': 'require',
        'reporting': 'report', 'reported': 'report', 'reports': 'report',
        'deciding': 'decide', 'decided': 'decide', 'decides': 'decide',
        'pulling': 'pull', 'pulled': 'pull', 'pulls': 'pull',
        
        // Nouns - plural to singular
        'children': 'child', 'men': 'man', 'women': 'woman', 'people': 'person',
        'feet': 'foot', 'teeth': 'tooth', 'geese': 'goose', 'mice': 'mouse',
        'oxen': 'ox', 'sheep': 'sheep', 'deer': 'deer', 'fish': 'fish',
        'books': 'book', 'cats': 'cat', 'dogs': 'dog', 'houses': 'house',
        'cars': 'car', 'computers': 'computer', 'phones': 'phone', 'tables': 'table',
        'chairs': 'chair', 'days': 'day', 'years': 'year', 'months': 'month',
        'weeks': 'week', 'hours': 'hour', 'minutes': 'minute', 'seconds': 'second',
        'cities': 'city', 'countries': 'country', 'companies': 'company', 'parties': 'party',
        'stories': 'story', 'studies': 'study', 'families': 'family', 'babies': 'baby',
        'ladies': 'lady', 'pennies': 'penny', 'puppies': 'puppy', 'berries': 'berry',
        'boxes': 'box', 'churches': 'church', 'watches': 'watch', 'classes': 'class',
        'glasses': 'glass', 'dishes': 'dish', 'wishes': 'wish', 'bushes': 'bush',
        'knives': 'knife', 'wives': 'wife', 'lives': 'life', 'leaves': 'leaf',
        'calves': 'calf', 'halves': 'half', 'wolves': 'wolf', 'thieves': 'thief',
        
        // Adjectives - comparative/superlative to base
        'better': 'good', 'best': 'good', 'worse': 'bad', 'worst': 'bad',
        'bigger': 'big', 'biggest': 'big', 'smaller': 'small', 'smallest': 'small',
        'larger': 'large', 'largest': 'large', 'faster': 'fast', 'fastest': 'fast',
        'slower': 'slow', 'slowest': 'slow', 'higher': 'high', 'highest': 'high',
        'lower': 'low', 'lowest': 'low', 'stronger': 'strong', 'strongest': 'strong',
        'weaker': 'weak', 'weakest': 'weak', 'longer': 'long', 'longest': 'long',
        'shorter': 'short', 'shortest': 'short', 'older': 'old', 'oldest': 'old',
        'younger': 'young', 'youngest': 'young', 'newer': 'new', 'newest': 'new',
        'easier': 'easy', 'easiest': 'easy', 'harder': 'hard', 'hardest': 'hard',
        'happier': 'happy', 'happiest': 'happy', 'sadder': 'sad', 'saddest': 'sad',
      }
      
      texts.forEach(text => {
        const words = tokenize(text)
        words.forEach(word => {
          if (stopwords.has(word)) return
          const lemma = wordnetMap[word] || word
          lemmaCounts[lemma] = (lemmaCounts[lemma] || 0) + 1
          if (!lemmaToOriginals[lemma]) lemmaToOriginals[lemma] = new Set()
          lemmaToOriginals[lemma].add(word)
        })
      })
    },
    
    rules: () => {
      // Rules-based lemmatization using morphological patterns
      const lemmatize = (word) => {
        // Handle irregular plurals first
        const irregulars = {
          'children': 'child', 'men': 'man', 'women': 'woman', 'people': 'person',
          'feet': 'foot', 'teeth': 'tooth', 'geese': 'goose', 'mice': 'mouse',
        }
        if (irregulars[word]) return irregulars[word]
        
        // Rule-based transformations (apply only ONE transformation per word)
        let lemma = word
        
        // Plural nouns
        if (lemma.endsWith('ies') && lemma.length > 4) {
          return lemma.slice(0, -3) + 'y'
        }
        if (lemma.endsWith('es') && lemma.length > 3) {
          // Check for -xes, -ches, -shes, -sses
          if (lemma.match(/(x|ch|sh|ss)es$/)) {
            return lemma.slice(0, -2)
          } else {
            return lemma.slice(0, -1)
          }
        }
        if (lemma.endsWith('s') && lemma.length > 2 && !lemma.endsWith('ss') && !lemma.endsWith('us')) {
          return lemma.slice(0, -1)
        }
        
        // Verb forms
        if (lemma.endsWith('ing') && lemma.length > 5) {
          // Check for doubled consonant (running -> run)
          if (lemma[lemma.length - 4] === lemma[lemma.length - 5] && 
              !'aeiou'.includes(lemma[lemma.length - 4])) {
            return lemma.slice(0, -4)
          } else {
            return lemma.slice(0, -3)
          }
        }
        if (lemma.endsWith('ed') && lemma.length > 4) {
          // Check for doubled consonant (stopped -> stop)
          if (lemma[lemma.length - 3] === lemma[lemma.length - 4] &&
              !'aeiou'.includes(lemma[lemma.length - 3])) {
            return lemma.slice(0, -3)
          } else {
            return lemma.slice(0, -2)
          }
        }
        
        // Adjectives and adverbs
        if (lemma.endsWith('ly') && lemma.length > 4) {
          return lemma.slice(0, -2)
        }
        if (lemma.endsWith('er') && lemma.length > 4) {
          // Check for doubled consonant (bigger -> big)
          if (lemma[lemma.length - 3] === lemma[lemma.length - 4] &&
              !'aeiou'.includes(lemma[lemma.length - 3])) {
            return lemma.slice(0, -3)
          } else {
            return lemma.slice(0, -2)
          }
        }
        if (lemma.endsWith('est') && lemma.length > 5) {
          // Check for doubled consonant (biggest -> big)
          if (lemma[lemma.length - 4] === lemma[lemma.length - 5] &&
              !'aeiou'.includes(lemma[lemma.length - 4])) {
            return lemma.slice(0, -4)
          } else {
            return lemma.slice(0, -3)
          }
        }
        
        return lemma
      }
      
      texts.forEach(text => {
        const words = tokenize(text)
        words.forEach(word => {
          if (stopwords.has(word)) return
          const lemma = lemmatize(word)
          lemmaCounts[lemma] = (lemmaCounts[lemma] || 0) + 1
          if (!lemmaToOriginals[lemma]) lemmaToOriginals[lemma] = new Set()
          lemmaToOriginals[lemma].add(word)
        })
      })
    },
    
    compromise: () => {
      // Compromise NLP-based lemmatization
      if (!nlpLib) {
        console.warn('NLP library not provided, falling back to rules-based lemmatization')
        strategies.rules()
        return
      }
      
      texts.forEach(text => {
        const doc = nlpLib(text)
        
        // Process verbs
        doc.verbs().forEach(verb => {
          const original = verb.text('normal')
          if (stopwords.has(original.toLowerCase())) return
          const lemma = verb.toInfinitive().text('normal') || original
          const lemmaLower = lemma.toLowerCase()
          lemmaCounts[lemmaLower] = (lemmaCounts[lemmaLower] || 0) + 1
          if (!lemmaToOriginals[lemmaLower]) lemmaToOriginals[lemmaLower] = new Set()
          lemmaToOriginals[lemmaLower].add(original.toLowerCase())
        })
        
        // Process nouns
        doc.nouns().forEach(noun => {
          const original = noun.text('normal')
          if (stopwords.has(original.toLowerCase())) return
          const lemma = noun.toSingular().text('normal') || original
          const lemmaLower = lemma.toLowerCase()
          lemmaCounts[lemmaLower] = (lemmaCounts[lemmaLower] || 0) + 1
          if (!lemmaToOriginals[lemmaLower]) lemmaToOriginals[lemmaLower] = new Set()
          lemmaToOriginals[lemmaLower].add(original.toLowerCase())
        })
        
        // Process adjectives (get base form)
        doc.adjectives().forEach(adj => {
          const original = adj.text('normal')
          if (stopwords.has(original.toLowerCase())) return
          // For adjectives, use the text as-is (compromise doesn't have strong adjective lemmatization)
          const lemmaLower = original.toLowerCase()
          lemmaCounts[lemmaLower] = (lemmaCounts[lemmaLower] || 0) + 1
          if (!lemmaToOriginals[lemmaLower]) lemmaToOriginals[lemmaLower] = new Set()
          lemmaToOriginals[lemmaLower].add(original.toLowerCase())
        })
        
        // Process remaining terms (adverbs, etc.)
        doc.terms().forEach(term => {
          const original = term.text('normal')
          if (stopwords.has(original.toLowerCase())) return
          // Skip if already processed as verb, noun, or adjective
          if (term.verbs().length > 0 || term.nouns().length > 0 || term.adjectives().length > 0) return
          const lemmaLower = original.toLowerCase()
          lemmaCounts[lemmaLower] = (lemmaCounts[lemmaLower] || 0) + 1
          if (!lemmaToOriginals[lemmaLower]) lemmaToOriginals[lemmaLower] = new Set()
          lemmaToOriginals[lemmaLower].add(original.toLowerCase())
        })
      })
    }
  }
  
  // Execute the selected strategy
  if (strategies[method]) {
    strategies[method]()
  } else {
    // Default to rules-based if invalid method
    strategies.rules()
  }
  
  // Convert to array and sort by count
  const lemmas = Object.entries(lemmaCounts)
    .map(([lemma, count]) => ({
      lemma,
      count,
      originals: lemmaToOriginals[lemma] ? Array.from(lemmaToOriginals[lemma]).join(', ') : lemma
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top)
  
  return lemmas
}

/**
 * Analyze text tokenization at different granularities
 * @param {string[]} texts - Array of text documents
 * @param {Object} options - Analysis options
 * @param {string} options.level - Tokenization level: 'character', 'word', 'subword', 'sentence'
 * @param {number} options.top - Number of top tokens to return (default: 80)
 * @returns {Array} Array of tokens with counts, sorted by frequency
 */
export const analyzeTokenization = (texts, { level = 'word', top = 80 }) => {
  const fullText = texts.join(' ')
  const tokenCounts = {}
  
  // Strategy pattern: map level to handler function
  const strategies = {
    character: () => {
      // Character-level tokenization (letters, numbers, punctuation)
      const chars = fullText.split('')
      chars.forEach(char => {
        if (char.trim().length > 0) {
          tokenCounts[char] = (tokenCounts[char] || 0) + 1
        }
      })
    },
    word: () => {
      // Word-level tokenization (standard whitespace split)
      const words = tokenize(fullText)
      words.forEach(word => {
        tokenCounts[word] = (tokenCounts[word] || 0) + 1
      })
    },
    subword: () => {
      // Subword tokenization (simple byte-pair encoding approximation)
      // Extract common character sequences (2-4 characters)
      const words = tokenize(fullText)
      words.forEach(word => {
        // Extract character n-grams from each word
        for (let n = 2; n <= Math.min(4, word.length); n++) {
          for (let i = 0; i <= word.length - n; i++) {
            const subword = word.slice(i, i + n)
            tokenCounts[subword] = (tokenCounts[subword] || 0) + 1
          }
        }
        // Also include the full word
        if (word.length > 4) {
          tokenCounts[word] = (tokenCounts[word] || 0) + 1
        }
      })
    },
    sentence: () => {
      // Sentence-level tokenization (split on sentence boundaries)
      const sentences = fullText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
      sentences.forEach(sentence => {
        if (sentence.length > 0) {
          // Use first 50 characters as sentence identifier
          const sentenceKey = sentence.slice(0, 50)
          tokenCounts[sentenceKey] = (tokenCounts[sentenceKey] || 0) + 1
        }
      })
    }
  }

  if (strategies[level]) {
    strategies[level]()
  }
  
  // Convert to array and sort by count
  const tokens = Object.entries(tokenCounts)
    .map(([token, count]) => ({ token, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top)
  
  return tokens
}

/**
 * Analyze Parts of Speech (POS) distribution in texts
 * Performs POS tagging and returns frequency distribution of different word classes
 * @param {string[]} texts - Array of text documents
 * @param {Object} options - Analysis options
 * @param {string} options.method - POS tagging method: 'rules', 'compromise'
 * @param {number} options.top - Number of top words per POS category (default: 50)
 * @param {Function} options.nlpLib - NLP library (compromise) for 'compromise' method
 * @param {Set} options.stopwords - Set of stopwords to exclude
 * @param {boolean} options.includeExamples - Include example words for each POS tag (default: true)
 * @returns {Object} Object with posCounts (frequency distribution), posExamples (top words per category), and totalWords
 */
export const analyzePartsOfSpeech = (texts, { method = 'rules', top = 50, nlpLib = null, stopwords = new Set(), includeExamples = true }) => {
  const posCounts = {
    noun: 0,
    verb: 0,
    adjective: 0,
    adverb: 0,
    pronoun: 0,
    preposition: 0,
    conjunction: 0,
    determiner: 0,
    interjection: 0,
    other: 0
  }
  
  const posExamples = {
    noun: {},
    verb: {},
    adjective: {},
    adverb: {},
    pronoun: {},
    preposition: {},
    conjunction: {},
    determiner: {},
    interjection: {},
    other: {}
  }
  
  let totalWords = 0
  
  // Strategy pattern: map method to handler function
  const strategies = {
    rules: () => {
      // Rules-based POS tagging using lexical patterns and word lists
      const posPatterns = {
        determiner: new Set(['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'some', 'any', 'each', 'every', 'all', 'both', 'few', 'many', 'much', 'several', 'no']),
        pronoun: new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves', 'who', 'whom', 'whose', 'which', 'what', 'this', 'that', 'these', 'those']),
        preposition: new Set(['in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'about', 'over', 'under', 'above', 'below', 'through', 'during', 'before', 'after', 'between', 'among', 'against', 'into', 'onto', 'upon', 'within', 'without', 'throughout', 'across', 'along', 'around', 'behind', 'beneath', 'beside', 'near', 'of', 'off', 'since', 'until', 'toward', 'via']),
        conjunction: new Set(['and', 'or', 'but', 'nor', 'yet', 'so', 'for', 'because', 'although', 'though', 'while', 'if', 'when', 'where', 'whether', 'since', 'unless', 'until', 'after', 'before']),
        interjection: new Set(['oh', 'wow', 'ouch', 'hey', 'hello', 'yes', 'no', 'well', 'hmm', 'ugh', 'yay', 'hurray', 'alas', 'oops']),
        verb: new Set(['is', 'are', 'was', 'were', 'be', 'been', 'being', 'am', 'has', 'have', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'go', 'make', 'take', 'come', 'see', 'know', 'get', 'give', 'find', 'think', 'tell', 'become', 'leave', 'feel', 'put', 'bring', 'begin', 'keep', 'hold', 'write', 'stand', 'hear', 'let', 'mean', 'set', 'meet', 'run', 'move', 'live', 'believe', 'happen', 'appear', 'continue', 'allow', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass', 'sell', 'require', 'report', 'decide', 'pull', 'fly', 'bark', 'play', 'work', 'use', 'try', 'ask', 'need', 'seem', 'help', 'show', 'talk', 'turn', 'start', 'call', 'try', 'provide', 'hold', 'lose', 'pay', 'sit', 'eat', 'sleep', 'drive', 'jump', 'dance', 'sing', 'laugh', 'cry', 'smile', 'look', 'listen', 'touch', 'taste', 'smell', 'like', 'want', 'wish', 'hope', 'care', 'enjoy'])
      }
      
      texts.forEach(text => {
        const words = tokenize(text)
        words.forEach(word => {
          if (stopwords.has(word)) return
          totalWords++
          
          let pos = null
          
          // Check fixed word lists first (most reliable)
          if (posPatterns.determiner.has(word)) {
            pos = 'determiner'
          } else if (posPatterns.pronoun.has(word)) {
            pos = 'pronoun'
          } else if (posPatterns.preposition.has(word)) {
            pos = 'preposition'
          } else if (posPatterns.conjunction.has(word)) {
            pos = 'conjunction'
          } else if (posPatterns.interjection.has(word)) {
            pos = 'interjection'
          } else if (posPatterns.verb.has(word)) {
            pos = 'verb'
          }
          // Check if word without -s suffix is a verb (third person singular: runs -> run)
          else if (word.endsWith('s') && word.length > 2 && posPatterns.verb.has(word.slice(0, -1))) {
            pos = 'verb'
          }
          // Pattern-based detection for verbs
          else if (word.match(/(ing|ed|en)$/) && word.length > 4) {
            pos = 'verb'
          }
          // Pattern-based detection for adverbs
          else if (word.endsWith('ly') && word.length > 3) {
            pos = 'adverb'
          }
          // Pattern-based detection for adjectives
          else if (word.match(/(ful|less|ous|ive|able|ible|al|ic|ish|y|ent|ant)$/) && word.length > 4) {
            pos = 'adjective'
          }
          // Default to noun (most common for remaining words)
          else {
            pos = 'noun'
          }
          
          // Update counts and examples
          posCounts[pos]++
          if (includeExamples) {
            posExamples[pos][word] = (posExamples[pos][word] || 0) + 1
          }
        })
      })
    },
    
    compromise: () => {
      // Compromise NLP-based POS tagging
      if (!nlpLib) {
        console.warn('NLP library not provided for compromise method, falling back to rules-based POS tagging')
        strategies.rules()
        return
      }
      
      texts.forEach(text => {
        const doc = nlpLib(text)
        
        // Process all terms and get their POS tags
        doc.terms().forEach(term => {
          const word = term.text('normal').toLowerCase()
          if (stopwords.has(word)) return
          
          totalWords++
          
          let pos = 'other'
          
          // Compromise has built-in POS tagging
          if (term.nouns().length > 0) {
            pos = 'noun'
          } else if (term.verbs().length > 0) {
            pos = 'verb'
          } else if (term.adjectives().length > 0) {
            pos = 'adjective'
          } else if (term.adverbs().length > 0) {
            pos = 'adverb'
          } else if (term.match('#Pronoun').length > 0) {
            pos = 'pronoun'
          } else if (term.match('#Preposition').length > 0) {
            pos = 'preposition'
          } else if (term.match('#Conjunction').length > 0) {
            pos = 'conjunction'
          } else if (term.match('#Determiner').length > 0) {
            pos = 'determiner'
          }
          
          // Update counts and examples
          posCounts[pos]++
          if (includeExamples) {
            posExamples[pos][word] = (posExamples[pos][word] || 0) + 1
          }
        })
      })
    }
  }
  
  // Execute the selected strategy
  if (strategies[method]) {
    strategies[method]()
  } else {
    // Default to rules-based if invalid method
    strategies.rules()
  }
  
  // Convert examples to sorted arrays
  const sortedExamples = {}
  Object.keys(posExamples).forEach(pos => {
    sortedExamples[pos] = Object.entries(posExamples[pos])
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, top)
  })
  
  return {
    posCounts,
    posExamples: includeExamples ? sortedExamples : {},
    totalWords,
    percentages: Object.entries(posCounts).reduce((acc, [pos, count]) => {
      acc[pos] = totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : '0.00'
      return acc
    }, {})
  }
}

/**
 * Analyze sentiment of texts using various algorithms
 * @param {string[]} texts - Array of texts to analyze
 * @param {Object} options - Analysis options
 * @param {string} options.method - Sentiment analysis method: 'lexicon', 'vader', 'pattern'
 * @param {Set} options.stopwords - Set of stopwords to exclude
 * @returns {Object} Sentiment analysis results with scores and classifications
 */
export const analyzeSentiment = (texts, { method = 'lexicon', stopwords = new Set() }) => {
  // Sentiment lexicons
  const positiveLexicon = new Set([
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'loved',
    'awesome', 'beautiful', 'best', 'brilliant', 'enjoy', 'enjoyed', 'happy', 'perfect',
    'pleased', 'satisfied', 'outstanding', 'superb', 'terrific', 'delightful', 'impressive',
    'appreciate', 'appreciated', 'fabulous', 'nice', 'pleasant', 'positive', 'recommended',
    'superior', 'valuable', 'worthy', 'exceptional', 'marvelous', 'incredible', 'stunning',
    'magnificent', 'spectacular', 'phenomenal', 'favorable', 'beneficial', 'advantage',
    'success', 'successful', 'win', 'winner', 'wins', 'winning', 'triumph', 'victory',
    'helpful', 'useful', 'effective', 'efficient', 'quality', 'reliable', 'trustworthy'
  ])
  
  const negativeLexicon = new Set([
    'bad', 'terrible', 'horrible', 'awful', 'poor', 'worst', 'hate', 'hated', 'disappointing',
    'disappointed', 'dissatisfied', 'unhappy', 'useless', 'pathetic', 'disgusting', 'mediocre',
    'inferior', 'defective', 'broken', 'failed', 'failure', 'problem', 'problems', 'issue',
    'issues', 'concern', 'concerns', 'difficult', 'hard', 'complicated', 'confusing',
    'annoying', 'frustrating', 'frustrated', 'waste', 'wasted', 'lacking',
    'missing', 'slow', 'expensive', 'overpriced', 'uncomfortable', 'unpleasant', 'negative',
    'regret', 'sorry', 'unfortunately', 'sadly', 'boring', 'dull', 'bland', 'weak'
  ])
  
  // Intensifiers for VADER-like approach
  const intensifiers = {
    'very': 1.5, 'really': 1.5, 'extremely': 2.0, 'absolutely': 1.8, 'completely': 1.8,
    'totally': 1.8, 'highly': 1.5, 'incredibly': 2.0, 'remarkably': 1.7, 'exceptionally': 1.9,
    'particularly': 1.3, 'especially': 1.5, 'quite': 1.3, 'fairly': 1.2, 'rather': 1.2,
    'somewhat': 0.8, 'slightly': 0.7, 'barely': 0.5, 'hardly': 0.5, 'scarcely': 0.5
  }
  
  // Negation words
  const negations = new Set([
    'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere', 'none',
    "n't", "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "cannot",
    "couldn't", "shouldn't", "isn't", "aren't", "wasn't", "weren't"
  ])
  
  const results = []
  let totalPositive = 0
  let totalNegative = 0
  let totalNeutral = 0
  
  // Strategy pattern for different sentiment methods
  const analyzeSingle = (text) => {
    const tokens = tokenize(text).filter(tok => !stopwords.has(tok))
    
    if (method === 'lexicon') {
      // Simple lexicon-based approach
      let positiveCount = 0
      let negativeCount = 0
      
      tokens.forEach(token => {
        if (positiveLexicon.has(token)) positiveCount++
        if (negativeLexicon.has(token)) negativeCount++
      })
      
      const totalSentimentWords = positiveCount + negativeCount
      if (totalSentimentWords === 0) {
        return { sentiment: 'neutral', score: 0, positive: 0, negative: 0, confidence: 0 }
      }
      
      const score = (positiveCount - negativeCount) / totalSentimentWords
      const confidence = totalSentimentWords / tokens.length
      
      let sentiment = 'neutral'
      if (score > 0.1) sentiment = 'positive'
      else if (score < -0.1) sentiment = 'negative'
      
      return { 
        sentiment, 
        score: parseFloat(score.toFixed(3)), 
        positive: positiveCount, 
        negative: negativeCount,
        confidence: parseFloat(confidence.toFixed(3))
      }
      
    } else if (method === 'vader') {
      // VADER-like approach with intensifiers and negations
      let score = 0
      let positiveCount = 0
      let negativeCount = 0
      
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const prevToken = i > 0 ? tokens[i - 1] : null
        const prevPrevToken = i > 1 ? tokens[i - 2] : null
        
        let tokenScore = 0
        if (positiveLexicon.has(token)) {
          tokenScore = 1
          positiveCount++
        } else if (negativeLexicon.has(token)) {
          tokenScore = -1
          negativeCount++
        }
        
        if (tokenScore !== 0) {
          // Apply intensifier from previous token
          if (prevToken && intensifiers[prevToken]) {
            tokenScore *= intensifiers[prevToken]
          }
          
          // Apply negation from previous tokens (within 3 words)
          let negated = false
          if (prevToken && negations.has(prevToken)) negated = true
          if (prevPrevToken && negations.has(prevPrevToken)) negated = true
          
          if (negated) {
            tokenScore *= -0.8  // Flip and slightly reduce
          }
          
          score += tokenScore
        }
      }
      
      // Normalize score to [-1, 1]
      if (tokens.length > 0) {
        score = score / tokens.length
        score = Math.max(-1, Math.min(1, score))
      }
      
      const confidence = (positiveCount + negativeCount) / tokens.length
      
      let sentiment = 'neutral'
      if (score > 0.05) sentiment = 'positive'
      else if (score < -0.05) sentiment = 'negative'
      
      return { 
        sentiment, 
        score: parseFloat(score.toFixed(3)), 
        positive: positiveCount, 
        negative: negativeCount,
        confidence: parseFloat(confidence.toFixed(3))
      }
      
    } else if (method === 'pattern') {
      // Pattern-based approach with additional context
      let score = 0
      let positiveCount = 0
      let negativeCount = 0
      
      // Check for patterns like "not good" or "very bad"
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const prevToken = i > 0 ? tokens[i - 1] : null
        const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null
        
        let tokenScore = 0
        if (positiveLexicon.has(token)) {
          tokenScore = 0.5
          positiveCount++
        } else if (negativeLexicon.has(token)) {
          tokenScore = -0.5
          negativeCount++
        }
        
        // Context modifiers
        if (tokenScore !== 0) {
          // Check for negation pattern
          if (prevToken && negations.has(prevToken)) {
            tokenScore *= -1
          }
          
          // Check for intensifier pattern
          if (prevToken && intensifiers[prevToken]) {
            tokenScore *= intensifiers[prevToken]
          }
          
          // Check for comparative/superlative patterns (better/best, worse/worst)
          if (token === 'better' || token === 'best' || token === 'improved') {
            tokenScore = 0.7
            positiveCount++
          } else if (token === 'worse' || token === 'worst' || token === 'deteriorated') {
            tokenScore = -0.7
            negativeCount++
          }
          
          score += tokenScore
        }
        
        // Look for exclamation marks (increases intensity)
        // (Moved outside the token loop)
      }
      
      // Apply exclamation mark intensity modifier once per text
      if (text.includes('!')) {
        score *= 1.1
      }
      
      // Normalize
      if (tokens.length > 0) {
        score = score / Math.sqrt(tokens.length)  // Square root for softer normalization
        score = Math.max(-1, Math.min(1, score))
      }
      
      const confidence = (positiveCount + negativeCount) / tokens.length
      
      let sentiment = 'neutral'
      if (score > 0.08) sentiment = 'positive'
      else if (score < -0.08) sentiment = 'negative'
      
      return { 
        sentiment, 
        score: parseFloat(score.toFixed(3)), 
        positive: positiveCount, 
        negative: negativeCount,
        confidence: parseFloat(confidence.toFixed(3))
      }
    }
    
    return { sentiment: 'neutral', score: 0, positive: 0, negative: 0, confidence: 0 }
  }
  
  // Analyze each text
  texts.forEach((text, index) => {
    const analysis = analyzeSingle(text)
    results.push({
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),  // Truncate for display
      ...analysis,
      index
    })
    
    if (analysis.sentiment === 'positive') totalPositive++
    else if (analysis.sentiment === 'negative') totalNegative++
    else totalNeutral++
  })
  
  // Calculate aggregate statistics
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  
  return {
    results,
    summary: {
      total: texts.length,
      positive: totalPositive,
      negative: totalNegative,
      neutral: totalNeutral,
      positivePercent: parseFloat(((totalPositive / texts.length) * 100).toFixed(2)),
      negativePercent: parseFloat(((totalNegative / texts.length) * 100).toFixed(2)),
      neutralPercent: parseFloat(((totalNeutral / texts.length) * 100).toFixed(2)),
      avgScore: parseFloat(avgScore.toFixed(3)),
      avgConfidence: parseFloat(avgConfidence.toFixed(3))
    },
    method
  }
}
