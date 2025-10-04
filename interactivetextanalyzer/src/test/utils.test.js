import { describe, it, expect } from 'vitest'

// Import utility functions - since they're not exported, we'll need to test them indirectly
// For now, we'll create a utilities module to export these functions

// Utility function duplicates for testing (extracted from App.jsx)
const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)

const buildStem = () => {
  const cache = new Map()
  return (w) => { 
    if(cache.has(w)) return cache.get(w)
    const s = w.replace(/(ing|ed|ly|s)$/,'')
    cache.set(w,s)
    return s 
  }
}

const computeTfIdf = (docs, { stopwords, stem, stemmer }) => {
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

const generateNGrams = (texts, { n=2, top=80, stopwords, stem, stemmer }) => {
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

const mineAssociations = (rows, cols, { minSupport=0.02, stopwords, stem, stemmer }) => {
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
  const pairs = Object.entries(pairCounts).map(([k,c])=>{ 
    const [a,b]=k.split('|')
    const support = c/total
    if(support<minSupport) return null
    const confAB = c/itemCounts[a]
    const confBA = c/itemCounts[b]
    const lift = support / ((itemCounts[a]/total)*(itemCounts[b]/total))
    return {a,b,support,count:c,confidenceAB:confAB,confidenceBA:confBA,lift}
  }).filter(Boolean).sort((a,b)=>b.lift-a.lift).slice(0,120)
  return { items: items.sort((a,b)=>b.support-a.support), pairs }
}

describe('Tokenization Utilities', () => {
  describe('tokenize', () => {
    it('should convert text to lowercase tokens', () => {
      const result = tokenize('Hello World')
      expect(result).toEqual(['hello', 'world'])
    })

    it('should filter out non-alphanumeric characters', () => {
      const result = tokenize('Hello, World! How are you?')
      expect(result).toEqual(['hello', 'world', 'how', 'are', 'you'])
    })

    it('should preserve apostrophes', () => {
      const result = tokenize("don't can't won't")
      expect(result).toEqual(["don't", "can't", "won't"])
    })

    it('should handle empty strings', () => {
      const result = tokenize('')
      expect(result).toEqual([])
    })

    it('should handle numbers', () => {
      const result = tokenize('Test 123 hello')
      expect(result).toEqual(['test', '123', 'hello'])
    })
  })

  describe('buildStem', () => {
    it('should create a stemming function', () => {
      const stemmer = buildStem()
      expect(typeof stemmer).toBe('function')
    })

    it('should remove common suffixes', () => {
      const stemmer = buildStem()
      expect(stemmer('running')).toBe('runn')
      expect(stemmer('walked')).toBe('walk')
      expect(stemmer('quickly')).toBe('quick')
      expect(stemmer('books')).toBe('book')
    })

    it('should cache results', () => {
      const stemmer = buildStem()
      const first = stemmer('running')
      const second = stemmer('running')
      expect(first).toBe(second)
    })

    it('should not modify words without suffixes', () => {
      const stemmer = buildStem()
      expect(stemmer('hello')).toBe('hello')
      expect(stemmer('world')).toBe('world')
    })
  })
})

describe('Text Analysis Functions', () => {
  const DEFAULT_STOPWORDS = new Set(['the','a','an','and','or','but','if','then','else','of','to','in','on','for','with','this','that','it','is','are','was','were','be','as','by','at','from'])
  
  describe('computeTfIdf', () => {
    it('should compute TF-IDF scores for documents', () => {
      const docs = [
        'the cat sat on the mat',
        'the dog sat on the log',
        'cats and dogs are animals'
      ]
      const stemmer = buildStem()
      const result = computeTfIdf(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      expect(result).toHaveProperty('perDoc')
      expect(result).toHaveProperty('aggregate')
      expect(result.perDoc).toHaveLength(3)
      expect(Array.isArray(result.aggregate)).toBe(true)
    })

    it('should filter out stopwords', () => {
      const docs = ['the quick brown fox']
      const stemmer = buildStem()
      const result = computeTfIdf(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      const terms = result.aggregate.map(item => item.term)
      expect(terms).not.toContain('the')
    })

    it('should apply stemming when enabled', () => {
      const docs = ['running quickly']
      const stemmer = buildStem()
      const result = computeTfIdf(docs, { stopwords: new Set(), stem: true, stemmer })
      
      const terms = result.aggregate.map(item => item.term)
      expect(terms).toContain('runn')
      expect(terms).toContain('quick')
    })

    it('should handle empty documents', () => {
      const docs = []
      const stemmer = buildStem()
      const result = computeTfIdf(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      expect(result.perDoc).toHaveLength(0)
      expect(result.aggregate).toHaveLength(0)
    })
  })

  describe('generateNGrams', () => {
    it('should generate bigrams by default', () => {
      const texts = ['hello world example']
      const result = generateNGrams(texts, { 
        n: 2, 
        top: 80, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('gram')
      expect(result[0]).toHaveProperty('count')
    })

    it('should generate trigrams when n=3', () => {
      const texts = ['one two three four']
      const result = generateNGrams(texts, { 
        n: 3, 
        top: 80, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      expect(result.some(item => item.gram.split(' ').length === 3)).toBe(true)
    })

    it('should filter stopwords', () => {
      const texts = ['the quick brown fox']
      const result = generateNGrams(texts, { 
        n: 2, 
        top: 80, 
        stopwords: DEFAULT_STOPWORDS, 
        stem: false, 
        stemmer: buildStem() 
      })
      
      const grams = result.map(item => item.gram)
      expect(grams.every(gram => !gram.includes('the'))).toBe(true)
    })

    it('should count ngram frequencies', () => {
      const texts = ['hello world', 'hello world', 'goodbye world']
      const result = generateNGrams(texts, { 
        n: 2, 
        top: 80, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      const helloWorld = result.find(item => item.gram === 'hello world')
      expect(helloWorld).toBeDefined()
      expect(helloWorld.count).toBe(2)
    })
  })

  describe('mineAssociations', () => {
    it('should mine item associations from rows', () => {
      const rows = [
        { text: 'apple banana orange' },
        { text: 'apple banana' },
        { text: 'orange apple' }
      ]
      const cols = ['text']
      const result = mineAssociations(rows, cols, { 
        minSupport: 0.3, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('pairs')
      expect(Array.isArray(result.items)).toBe(true)
      expect(Array.isArray(result.pairs)).toBe(true)
    })

    it('should calculate support for items', () => {
      const rows = [
        { text: 'apple' },
        { text: 'apple' },
        { text: 'banana' }
      ]
      const cols = ['text']
      const result = mineAssociations(rows, cols, { 
        minSupport: 0.1, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      const apple = result.items.find(item => item.item === 'apple')
      expect(apple).toBeDefined()
      expect(apple.support).toBeCloseTo(0.667, 2)
    })

    it('should calculate lift for pairs', () => {
      const rows = [
        { text: 'coffee tea' },
        { text: 'coffee tea' },
        { text: 'coffee' }
      ]
      const cols = ['text']
      const result = mineAssociations(rows, cols, { 
        minSupport: 0.1, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      if (result.pairs.length > 0) {
        expect(result.pairs[0]).toHaveProperty('lift')
        expect(result.pairs[0]).toHaveProperty('confidenceAB')
        expect(result.pairs[0]).toHaveProperty('confidenceBA')
      }
    })

    it('should filter by minimum support', () => {
      const rows = [
        { text: 'rare' },
        { text: 'common common common' }
      ]
      const cols = ['text']
      const result = mineAssociations(rows, cols, { 
        minSupport: 0.6, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      expect(result.items.every(item => item.support >= 0.6)).toBe(true)
    })
  })
})
