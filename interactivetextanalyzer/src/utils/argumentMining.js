/**
 * Argument Mining
 * 
 * This module implements argument mining to identify argumentsList, claims, and premises:
 * 
 * 1. Claim Detection: Identifies arguable claims in text
 * 2. Premise Identification: Finds supporting/opposing premises
 * 3. Argument Structure: Analyzes argument components and relationships
 * 
 * References:
 * - Stab, C., & Gurevych, I. (2017). Parsing argumentation structures in persuasive essays.
 *   Computational Linguistics, 43(3), 619-659. https://doi.org/10.1162/COLI_a_00295
 * - Lippi, M., & Torroni, P. (2016). Argumentation mining: State of the art and emerging trends.
 *   ACM TOIT, 16(2), 1-25. https://doi.org/10.1145/2850417
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
 * Claim indicators - words/phrases that often introduce claims
 */
const CLAIM_INDICATORS = [
  'believe', 'think', 'argue', 'claim', 'assert', 'maintain', 'contend',
  'should', 'must', 'ought', 'need to', 'have to',
  'clear that', 'obvious that', 'evident that', 'shows that', 'proves that',
  'important', 'essential', 'necessary', 'crucial', 'vital',
  'therefore', 'thus', 'hence', 'consequently', 'as a result'
]

/**
 * Premise indicators - words/phrases that introduce supporting evidence
 */
const PREMISE_INDICATORS = [
  'because', 'since', 'as', 'for', 'given that', 'considering that',
  'due to', 'owing to', 'on account of',
  'research shows', 'studies indicate', 'evidence suggests', 'data shows',
  'according to', 'based on', 'in light of',
  'first', 'second', 'third', 'firstly', 'secondly', 'finally',
  'for example', 'for instance', 'such as', 'like'
]

/**
 * Counter-argument indicators
 */
const COUNTER_INDICATORS = [
  'however', 'but', 'although', 'though', 'even though',
  'nevertheless', 'nonetheless', 'yet', 'still',
  'on the other hand', 'conversely', 'in contrast',
  'despite', 'in spite of', 'regardless of',
  'some argue', 'critics claim', 'opponents say'
]

/**
 * Calculate claim likelihood score for a sentence
 */
const calculateClaimScore = (sentence, doc) => {
  let score = 0
  const text = sentence.text().toLowerCase()
  
  // Check for claim indicators
  CLAIM_INDICATORS.forEach(indicator => {
    if (text.includes(indicator)) {
      score += 0.3
    }
  })
  
  // Check for modal verbs (should, must, etc.)
  if (sentence.has('#Modal')) {
    score += 0.2
  }
  
  // Check for evaluative adjectives
  if (sentence.has('#Adjective')) {
    const adjectives = sentence.match('#Adjective').out('array')
    const evaluative = ['good', 'bad', 'important', 'necessary', 'essential', 'crucial', 'vital', 'critical']
    adjectives.forEach(adj => {
      if (evaluative.some(e => adj.toLowerCase().includes(e))) {
        score += 0.15
      }
    })
  }
  
  // Check for comparison structures
  if (text.includes('better than') || text.includes('worse than') || text.includes('more') || text.includes('less')) {
    score += 0.15
  }
  
  // Check for negation (often indicates stance)
  if (sentence.has('#Negative')) {
    score += 0.1
  }
  
  // Penalize questions (typically not claims)
  if (text.endsWith('?')) {
    score -= 0.3
  }
  
  return Math.min(score, 1.0)
}

/**
 * Calculate premise likelihood score for a sentence
 */
const calculatePremiseScore = (sentence, previousClaim) => {
  let score = 0
  const text = sentence.text().toLowerCase()
  
  // Check for premise indicators
  PREMISE_INDICATORS.forEach(indicator => {
    if (text.includes(indicator)) {
      score += 0.3
    }
  })
  
  // Check for evidence phrases
  if (text.includes('evidence') || text.includes('research') || text.includes('study') || text.includes('data')) {
    score += 0.25
  }
  
  // Check for statistics/numbers (common in premises)
  if (sentence.has('#Value') || sentence.has('#Percent')) {
    score += 0.2
  }
  
  // Check for examples
  if (text.includes('example') || text.includes('instance')) {
    score += 0.15
  }
  
  // Proximity to claim boosts premise likelihood
  if (previousClaim) {
    score += 0.1
  }
  
  return Math.min(score, 1.0)
}

/**
 * Rule-Based Argument Mining
 * Uses linguistic rules and indicators
 */
export const ruleBasedArgumentMining = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { claims: [], premises: [], arguments: [] }
  }
  
  const nlp = await loadCompromise()
  const claims = []
  const premises = []
  const argumentsList = []
  let componentId = 0
  let argumentId = 0
  
  // Process each text sample
  for (const text of textSamples.slice(0, 100)) {
    const doc = nlp(text)
    const sentences = doc.sentences()
    
    let lastClaim = null
    const textComponents = []
    
    // Get array to iterate, but keep sentence objects for analysis
    const sentenceArray = []
    sentences.forEach(s => sentenceArray.push(s))
    
    sentenceArray.forEach((sentence, idx) => {
      const sentenceText = sentence.text()
      const claimScore = calculateClaimScore(sentence, doc)
      const premiseScore = calculatePremiseScore(sentence, lastClaim)
      
      // Classify as claim if score is high enough
      if (claimScore > 0.4) {
        const claim = {
          id: componentId++,
          type: 'claim',
          text: sentenceText,
          score: claimScore,
          source: text,
          premises: []
        }
        claims.push(claim)
        textComponents.push(claim)
        lastClaim = claim
      }
      // Classify as premise if it follows a claim
      else if (premiseScore > 0.3 && lastClaim) {
        const premise = {
          id: componentId++,
          type: 'premise',
          text: sentenceText,
          score: premiseScore,
          source: text,
          supportsClaim: lastClaim.id
        }
        premises.push(premise)
        textComponents.push(premise)
        lastClaim.premises.push(premise.id)
      }
      // Check for counter-argument
      else if (COUNTER_INDICATORS.some(ind => sentenceText.toLowerCase().includes(ind))) {
        const counter = {
          id: componentId++,
          type: 'counter',
          text: sentenceText,
          score: 0.7,
          source: text,
          challengesClaim: lastClaim?.id
        }
        textComponents.push(counter)
      }
    })
    
    // Build argument structures
    if (textComponents.length > 0) {
      const textClaims = textComponents.filter(c => c.type === 'claim')
      textClaims.forEach(claim => {
        const relatedPremises = textComponents.filter(c => c.supportsClaim === claim.id)
        const relatedCounters = textComponents.filter(c => c.challengesClaim === claim.id)
        
        if (relatedPremises.length > 0 || relatedCounters.length > 0) {
          argumentsList.push({
            id: argumentId++,
            claim: claim.text,
            premises: relatedPremises.map(p => p.text),
            counterArguments: relatedCounters.map(c => c.text),
            source: text,
            strength: relatedPremises.length / (relatedPremises.length + relatedCounters.length + 1)
          })
        }
      })
    }
  }
  
  return {
    claims,
    premises,
    arguments: argumentsList,
    totalClaims: claims.length,
    totalPremises: premises.length,
    totalArguments: argumentsList.length
  }
}

/**
 * Pattern-Based Argument Mining
 * Uses specific argumentation patterns
 */
export const patternBasedArgumentMining = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { claims: [], premises: [], arguments: [] }
  }
  
  const nlp = await loadCompromise()
  const claims = []
  const premises = []
  const argumentsList = []
  let componentId = 0
  let argumentId = 0
  
  // Argumentation patterns
  const patterns = [
    { pattern: 'I #Verb that', type: 'claim' },
    { pattern: 'we should #Verb', type: 'claim' },
    { pattern: 'it is #Adjective that', type: 'claim' },
    { pattern: 'because #Noun+ #Verb', type: 'premise' },
    { pattern: 'since #Noun+ #Verb', type: 'premise' },
    { pattern: 'therefore #Noun+ #Verb', type: 'conclusion' },
    { pattern: 'however #Noun+ #Verb', type: 'counter' }
  ]
  
  // Process each text sample
  for (const text of textSamples.slice(0, 100)) {
    const doc = nlp(text)
    
    patterns.forEach(({ pattern, type }) => {
      const matches = doc.match(pattern)
      if (!matches || matches.length === 0) return
      
      const matchTexts = matches.out('array')
      matchTexts.forEach(matchText => {
        if (type === 'claim') {
          claims.push({
            id: componentId++,
            type: 'claim',
            text: matchText,
            pattern,
            source: text
          })
        } else if (type === 'premise') {
          premises.push({
            id: componentId++,
            type: 'premise',
            text: matchText,
            pattern,
            source: text
          })
        }
      })
    })
  }
  
  return {
    claims,
    premises,
    arguments: argumentsList,
    totalClaims: claims.length,
    totalPremises: premises.length
  }
}

/**
 * Structured Argument Mining
 * Analyzes complete argument structures
 */
export const structuredArgumentMining = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { claims: [], premises: [], arguments: [] }
  }
  
  const nlp = await loadCompromise()
  const argumentsList = []
  let argumentId = 0
  
  // Process each text sample as a potential argument
  for (const text of textSamples.slice(0, 100)) {
    const doc = nlp(text)
    const sentences = doc.sentences()
    
    // Get array to iterate
    const sentenceArray = []
    sentences.forEach(s => sentenceArray.push(s))
    
    if (sentenceArray.length < 2) continue // Need at least 2 sentences for argument
    
    // Heuristic: First sentence is often claim, following are premises
    const firstSentence = sentenceArray[0]
    const claimScore = calculateClaimScore(firstSentence, doc)
    
    if (claimScore > 0.3) {
      const claim = firstSentence.text()
      const premises = []
      
      // Collect following sentences as premises
      for (let i = 1; i < sentenceArray.length; i++) {
        const sentence = sentenceArray[i]
        const premiseScore = calculatePremiseScore(sentence, true)
        
        if (premiseScore > 0.2) {
          premises.push(sentence.text())
        }
      }
      
      if (premises.length > 0) {
        argumentsList.push({
          id: argumentId++,
          claim,
          premises,
          source: text,
          structure: 'linear',
          strength: premises.length / sentenceArray.length
        })
      }
    }
  }
  
  return {
    claims: argumentsList.map(a => ({ text: a.claim, source: a.source })),
    premises: argumentsList.flatMap(a => a.premises.map(p => ({ text: p, source: a.source }))),
    arguments: argumentsList,
    totalArguments: argumentsList.length
  }
}

/**
 * Main argument mining function with algorithm selection
 */
export const performArgumentMining = async (textSamples, params = {}) => {
  const { algorithm = 'rule-based', maxSamples = 100, onProgress = null } = params
  
  if (!textSamples || textSamples.length === 0) {
    return { claims: [], premises: [], arguments: [], algorithm }
  }
  
  if (onProgress) onProgress(10)
  
  const samplesToProcess = textSamples.slice(0, maxSamples)
  let result
  
  switch (algorithm) {
    case 'pattern':
      result = await patternBasedArgumentMining(samplesToProcess)
      break
    case 'structured':
      result = await structuredArgumentMining(samplesToProcess)
      break
    case 'rule-based':
    default:
      result = await ruleBasedArgumentMining(samplesToProcess)
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
  ruleBasedArgumentMining,
  patternBasedArgumentMining,
  structuredArgumentMining,
  performArgumentMining
}
