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
        
        // Rule-based transformations (order matters)
        let lemma = word
        
        // Plural nouns
        if (lemma.endsWith('ies') && lemma.length > 4) {
          lemma = lemma.slice(0, -3) + 'y'
        } else if (lemma.endsWith('es') && lemma.length > 3) {
          // Check for -xes, -ches, -shes, -sses
          if (lemma.match(/(x|ch|sh|ss)es$/)) {
            lemma = lemma.slice(0, -2)
          } else {
            lemma = lemma.slice(0, -1)
          }
        } else if (lemma.endsWith('s') && lemma.length > 2 && !lemma.endsWith('ss') && !lemma.endsWith('us')) {
          lemma = lemma.slice(0, -1)
        }
        
        // Verb forms
        if (lemma.endsWith('ing') && lemma.length > 5) {
          // Check for doubled consonant (running -> run)
          if (lemma[lemma.length - 4] === lemma[lemma.length - 5] && 
              !'aeiou'.includes(lemma[lemma.length - 4])) {
            lemma = lemma.slice(0, -4)
          } else {
            lemma = lemma.slice(0, -3)
          }
        } else if (lemma.endsWith('ed') && lemma.length > 4) {
          // Check for doubled consonant (stopped -> stop)
          if (lemma[lemma.length - 3] === lemma[lemma.length - 4] &&
              !'aeiou'.includes(lemma[lemma.length - 3])) {
            lemma = lemma.slice(0, -3)
          } else {
            lemma = lemma.slice(0, -2)
          }
        }
        
        // Adjectives and adverbs
        if (lemma.endsWith('ly') && lemma.length > 4) {
          lemma = lemma.slice(0, -2)
        } else if (lemma.endsWith('er') && lemma.length > 4) {
          lemma = lemma.slice(0, -2)
        } else if (lemma.endsWith('est') && lemma.length > 5) {
          lemma = lemma.slice(0, -3)
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
