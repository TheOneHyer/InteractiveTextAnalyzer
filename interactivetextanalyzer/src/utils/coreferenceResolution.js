/**
 * Coreference Resolution Algorithms
 * 
 * This module implements coreference resolution to identify which words/phrases
 * refer to the same entity in text. Multiple algorithms are provided:
 * 
 * 1. Rule-Based: Uses linguistic rules and heuristics (pronouns, determiners, etc.)
 * 2. Mention-Pair: Compares mention pairs for coreference likelihood
 * 3. Cluster-Based: Groups mentions into coreference clusters
 * 
 * References:
 * - Ng, V., & Cardie, C. (2002). Improving machine learning approaches to coreference resolution.
 *   In ACL 2002. https://aclanthology.org/P02-1014/
 * - Lee, K., He, L., Lewis, M., & Zettlemoyer, L. (2017). End-to-end neural coreference resolution.
 *   In EMNLP 2017. https://aclanthology.org/D17-1018/
 */

/**
 * Load compromise NLP library for linguistic analysis
 * Import directly to support testing environment
 */
const loadCompromise = async () => {
  const compromiseModule = await import('compromise')
  return compromiseModule.default || compromiseModule
}

/**
 * Extract mentions (noun phrases, pronouns, named entities) from text
 */
const extractMentions = (doc, nlp) => {
  const mentions = []
  
  // Get all nouns and pronouns
  const terms = doc.terms()
  terms.forEach((term, idx) => {
    const text = term.text()
    const tags = term.json()[0]?.terms?.[0]?.tags || []
    
    // Extract pronouns
    if (tags.includes('Pronoun')) {
      mentions.push({
        text,
        type: 'pronoun',
        startIdx: idx,
        endIdx: idx,
        number: tags.includes('Plural') ? 'plural' : 'singular',
        person: tags.includes('FirstPerson') ? 1 : tags.includes('SecondPerson') ? 2 : 3,
        gender: tags.includes('Masculine') ? 'male' : tags.includes('Feminine') ? 'female' : 'neutral'
      })
    }
    // Extract proper nouns
    else if (tags.includes('ProperNoun')) {
      mentions.push({
        text,
        type: 'proper',
        startIdx: idx,
        endIdx: idx,
        number: tags.includes('Plural') ? 'plural' : 'singular',
        gender: 'neutral'
      })
    }
    // Extract common nouns
    else if (tags.includes('Noun')) {
      mentions.push({
        text,
        type: 'common',
        startIdx: idx,
        endIdx: idx,
        number: tags.includes('Plural') ? 'plural' : 'singular',
        gender: 'neutral'
      })
    }
  })
  
  // Extract noun phrases
  const nounPhrases = doc.match('#Determiner? #Adjective* #Noun+')
  nounPhrases.forEach(np => {
    const text = np.text()
    const startIdx = np.termStart()
    const endIdx = np.termEnd()
    
    mentions.push({
      text,
      type: 'noun_phrase',
      startIdx,
      endIdx,
      number: np.has('#Plural') ? 'plural' : 'singular',
      gender: 'neutral'
    })
  })
  
  return mentions
}

/**
 * Calculate similarity between two mentions for coreference
 */
const calculateMentionSimilarity = (mention1, mention2) => {
  let score = 0
  
  // Exact match
  if (mention1.text.toLowerCase() === mention2.text.toLowerCase()) {
    return 1.0
  }
  
  // Head noun match for noun phrases
  if (mention1.type === 'noun_phrase' && mention2.type === 'noun_phrase') {
    const words1 = mention1.text.toLowerCase().split(' ')
    const words2 = mention2.text.toLowerCase().split(' ')
    if (words1[words1.length - 1] === words2[words2.length - 1]) {
      score += 0.6
    }
  }
  
  // String containment
  if (mention1.text.toLowerCase().includes(mention2.text.toLowerCase()) ||
      mention2.text.toLowerCase().includes(mention1.text.toLowerCase())) {
    score += 0.4
  }
  
  // Number agreement
  if (mention1.number === mention2.number) {
    score += 0.2
  }
  
  // Gender agreement
  if (mention1.gender === mention2.gender || mention1.gender === 'neutral' || mention2.gender === 'neutral') {
    score += 0.1
  }
  
  return Math.min(score, 1.0)
}

/**
 * Rule-Based Coreference Resolution
 * Uses linguistic rules and heuristics
 */
export const ruleBasedCoreference = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { clusters: [], mentions: [], corefChains: [] }
  }
  
  const nlp = await loadCompromise()
  const allMentions = []
  const clusters = []
  let mentionId = 0
  
  // Process each text sample
  for (const text of textSamples.slice(0, 100)) { // Limit for performance
    const doc = nlp(text)
    const mentions = extractMentions(doc, nlp)
    
    // Assign unique IDs and add to all mentions
    mentions.forEach(mention => {
      mention.id = mentionId++
      mention.text_source = text
      mention.cluster = null
      allMentions.push(mention)
    })
  }
  
  // Build coreference clusters using simple rules
  allMentions.forEach((mention, idx) => {
    if (mention.cluster !== null) return
    
    // Create new cluster
    const cluster = {
      id: clusters.length,
      mentions: [mention],
      representative: mention.text
    }
    mention.cluster = cluster.id
    
    // Look for coreferent mentions
    for (let j = idx + 1; j < Math.min(idx + 50, allMentions.length); j++) {
      const other = allMentions[j]
      if (other.cluster !== null) continue
      
      // Pronoun resolution
      if (mention.type === 'pronoun') {
        // Pronouns refer to nearby nouns
        if (other.type !== 'pronoun') {
          if (mention.number === other.number && mention.gender === other.gender) {
            other.cluster = cluster.id
            cluster.mentions.push(other)
          }
        }
      }
      // Noun phrase matching
      else if (calculateMentionSimilarity(mention, other) > 0.7) {
        other.cluster = cluster.id
        cluster.mentions.push(other)
      }
    }
    
    clusters.push(cluster)
  }
  
  // Build coreference chains for visualization
  const corefChains = clusters
    .filter(c => c.mentions.length > 1)
    .map(c => ({
      id: c.id,
      representative: c.representative,
      mentions: c.mentions.map(m => m.text),
      count: c.mentions.length
    }))
  
  return {
    clusters: corefChains,
    mentions: allMentions,
    corefChains
  }
}

/**
 * Mention-Pair Model for Coreference Resolution
 * Evaluates pairs of mentions for coreference likelihood
 */
export const mentionPairCoreference = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { clusters: [], mentions: [], corefChains: [] }
  }
  
  const nlp = await loadCompromise()
  const allMentions = []
  let mentionId = 0
  
  // Extract mentions from all texts
  for (const text of textSamples.slice(0, 100)) {
    const doc = nlp(text)
    const mentions = extractMentions(doc, nlp)
    
    mentions.forEach(mention => {
      mention.id = mentionId++
      mention.text_source = text
      mention.cluster = null
      allMentions.push(mention)
    })
  }
  
  // Build similarity matrix
  const clusters = []
  const processed = new Set()
  
  allMentions.forEach((mention, idx) => {
    if (processed.has(mention.id)) return
    
    const cluster = {
      id: clusters.length,
      mentions: [mention],
      representative: mention.text
    }
    mention.cluster = cluster.id
    processed.add(mention.id)
    
    // Find best coreferent mentions
    for (let j = idx + 1; j < allMentions.length; j++) {
      const other = allMentions[j]
      if (processed.has(other.id)) continue
      
      const similarity = calculateMentionSimilarity(mention, other)
      
      // Threshold for coreference
      if (similarity > 0.6) {
        other.cluster = cluster.id
        cluster.mentions.push(other)
        processed.add(other.id)
      }
    }
    
    clusters.push(cluster)
  })
  
  const corefChains = clusters
    .filter(c => c.mentions.length > 1)
    .map(c => ({
      id: c.id,
      representative: c.representative,
      mentions: c.mentions.map(m => m.text),
      count: c.mentions.length
    }))
  
  return {
    clusters: corefChains,
    mentions: allMentions,
    corefChains
  }
}

/**
 * Cluster-Based Coreference Resolution
 * Builds entity clusters incrementally
 */
export const clusterBasedCoreference = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { clusters: [], mentions: [], corefChains: [] }
  }
  
  const nlp = await loadCompromise()
  const allMentions = []
  const clusters = []
  let mentionId = 0
  
  // Extract mentions
  for (const text of textSamples.slice(0, 100)) {
    const doc = nlp(text)
    const mentions = extractMentions(doc, nlp)
    
    mentions.forEach(mention => {
      mention.id = mentionId++
      mention.text_source = text
      allMentions.push(mention)
    })
  }
  
  // Cluster mentions incrementally
  allMentions.forEach(mention => {
    let bestCluster = null
    let bestScore = 0.5 // Minimum threshold
    
    // Find best matching cluster
    clusters.forEach(cluster => {
      let clusterScore = 0
      cluster.mentions.forEach(clusterMention => {
        clusterScore += calculateMentionSimilarity(mention, clusterMention)
      })
      clusterScore /= cluster.mentions.length // Average similarity
      
      if (clusterScore > bestScore) {
        bestScore = clusterScore
        bestCluster = cluster
      }
    })
    
    if (bestCluster) {
      bestCluster.mentions.push(mention)
      mention.cluster = bestCluster.id
    } else {
      // Create new cluster
      const newCluster = {
        id: clusters.length,
        mentions: [mention],
        representative: mention.text
      }
      mention.cluster = newCluster.id
      clusters.push(newCluster)
    }
  })
  
  const corefChains = clusters
    .filter(c => c.mentions.length > 1)
    .map(c => ({
      id: c.id,
      representative: c.representative,
      mentions: c.mentions.map(m => m.text),
      count: c.mentions.length
    }))
  
  return {
    clusters: corefChains,
    mentions: allMentions,
    corefChains
  }
}

/**
 * Main coreference resolution function with algorithm selection
 */
export const performCoreferenceResolution = async (textSamples, params = {}) => {
  const { algorithm = 'rule-based', maxSamples = 100, onProgress = null } = params
  
  if (!textSamples || textSamples.length === 0) {
    return { clusters: [], mentions: [], corefChains: [], algorithm }
  }
  
  if (onProgress) onProgress(10)
  
  const samplesToProcess = textSamples.slice(0, maxSamples)
  let result
  
  switch (algorithm) {
    case 'mention-pair':
      result = await mentionPairCoreference(samplesToProcess)
      break
    case 'cluster-based':
      result = await clusterBasedCoreference(samplesToProcess)
      break
    case 'rule-based':
    default:
      result = await ruleBasedCoreference(samplesToProcess)
      break
  }
  
  if (onProgress) onProgress(100)
  
  return {
    ...result,
    algorithm,
    totalProcessed: samplesToProcess.length
  }
}

export default {
  ruleBasedCoreference,
  mentionPairCoreference,
  clusterBasedCoreference,
  performCoreferenceResolution
}
