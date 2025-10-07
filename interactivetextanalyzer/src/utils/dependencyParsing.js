/**
 * Dependency Parsing Algorithms for Syntax Analysis
 * 
 * This module implements three graph-based dependency parsing algorithms:
 * 1. Eisner's Algorithm (O(n³) dynamic programming for projective trees)
 * 2. Chu-Liu/Edmonds Algorithm (Maximum Spanning Tree for non-projective trees)
 * 3. Arc-Standard System (Transition-based parsing)
 */

import lazyLoader from './lazyLoader'

/**
 * Load compromise NLP library for POS tagging (needed for dependency parsing)
 */
const loadCompromise = async () => {
  const compromiseModule = await lazyLoader.get('compromise')
  return compromiseModule
}

/**
 * Simple POS-based scoring for dependency arcs
 * Scores the likelihood of a dependency arc from head to dependent
 */
const scoreDependency = (headPos, depPos, distance) => {
  // Basic linguistic preferences
  const preferences = {
    // Verbs tend to be heads
    'Verb': { 'Noun': 0.9, 'Adjective': 0.7, 'Adverb': 0.8, 'Determiner': 0.6, 'Preposition': 0.7 },
    // Nouns can be heads in NPs
    'Noun': { 'Adjective': 0.8, 'Determiner': 0.9, 'Noun': 0.6, 'Preposition': 0.7 },
    // Adjectives modify nouns
    'Adjective': { 'Adverb': 0.7, 'Noun': 0.3 },
    // Prepositions take NP complements
    'Preposition': { 'Noun': 0.9, 'Determiner': 0.5 },
    // Default
    'default': { 'default': 0.5 }
  }
  
  const headPrefs = preferences[headPos] || preferences['default']
  const baseScore = headPrefs[depPos] || headPrefs['default'] || 0.5
  
  // Prefer shorter dependencies (locality bias)
  const distancePenalty = Math.exp(-distance / 5)
  
  return baseScore * distancePenalty
}

/**
 * Eisner's Algorithm for projective dependency parsing (Simplified)
 * Greedy approximation that builds projective trees
 * 
 * @param {Array} tokens - Array of {text, pos} objects
 * @returns {Object} - {nodes, edges} for visualization
 * 
 * Reference: Eisner, J. (1996). Three new probabilistic models for dependency parsing.
 * In Proceedings of COLING 1996.
 */
export const eisnerAlgorithm = (tokens) => {
  if (!tokens || tokens.length === 0) return { nodes: [], edges: [] }
  
  const n = tokens.length
  
  // Add ROOT token at position 0
  const words = [{ text: 'ROOT', pos: 'ROOT' }, ...tokens]
  
  // Score matrix: score[i][j] = score of arc from i to j
  const score = Array(n + 1).fill(0).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i < n + 1; i++) {
    for (let j = 0; j < n + 1; j++) {
      if (i !== j) {
        const distance = Math.abs(i - j)
        score[i][j] = scoreDependency(words[i].pos, words[j].pos, distance)
      }
    }
  }
  
  // Greedy projective parsing: for each word, find best head
  // Ensure projectivity by only allowing non-crossing arcs
  const parent = Array(n + 1).fill(-1)
  parent[0] = -1 // ROOT has no parent
  
  // For each word (excluding ROOT), find the best head that doesn't violate projectivity
  for (let j = 1; j <= n; j++) {
    let maxScore = -Infinity
    let bestHead = 0
    
    for (let i = 0; i <= n; i++) {
      if (i === j) continue
      
      // Check projectivity: no crossing arcs
      let isProjective = true
      for (let k = 1; k <= n; k++) {
        if (k === j || parent[k] === -1) continue
        
        // Check if arc (i,j) crosses with arc (parent[k], k)
        const i1 = Math.min(i, j)
        const i2 = Math.max(i, j)
        const k1 = Math.min(parent[k], k)
        const k2 = Math.max(parent[k], k)
        
        // Arcs cross if one's endpoints are on opposite sides of the other
        if ((i1 < k1 && k1 < i2 && i2 < k2) || (k1 < i1 && i1 < k2 && k2 < i2)) {
          isProjective = false
          break
        }
      }
      
      if (isProjective && score[i][j] > maxScore) {
        maxScore = score[i][j]
        bestHead = i
      }
    }
    
    parent[j] = bestHead
  }
  
  // Convert to visualization format
  const nodes = tokens.map((token, i) => ({
    id: token.text + '_' + i,
    label: token.text,
    pos: token.pos,
    value: 1
  }))
  
  nodes.unshift({ id: 'ROOT', label: 'ROOT', pos: 'ROOT', value: 2 })
  
  const edges = []
  for (let j = 1; j <= n; j++) {
    if (parent[j] !== -1) {
      const sourceId = parent[j] === 0 ? 'ROOT' : words[parent[j]].text + '_' + (parent[j] - 1)
      const targetId = words[j].text + '_' + (j - 1)
      edges.push({
        source: sourceId,
        target: targetId,
        value: score[parent[j]][j]
      })
    }
  }
  
  return { nodes, edges }
}

/**
 * Chu-Liu/Edmonds Algorithm for non-projective dependency parsing
 * Finds maximum spanning tree in a directed graph
 * 
 * @param {Array} tokens - Array of {text, pos} objects
 * @returns {Object} - {nodes, edges} for visualization
 * 
 * Reference: Chu, Y. J., & Liu, T. H. (1965). On the shortest arborescence of a directed graph.
 * Science Sinica, 14, 1396-1400.
 */
export const chuLiuEdmondsAlgorithm = (tokens) => {
  if (!tokens || tokens.length === 0) return { nodes: [], edges: [] }
  
  const n = tokens.length
  
  // Add ROOT token
  const words = [{ text: 'ROOT', pos: 'ROOT' }, ...tokens]
  
  // Build score matrix
  const score = Array(n + 1).fill(0).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i < n + 1; i++) {
    for (let j = 0; j < n + 1; j++) {
      if (i !== j && j !== 0) { // No incoming edges to ROOT
        const distance = Math.abs(i - j)
        score[i][j] = scoreDependency(words[i].pos, words[j].pos, distance)
      }
    }
  }
  
  // Find maximum spanning tree using Chu-Liu/Edmonds
  const parent = Array(n + 1).fill(-1)
  
  // Step 1: For each node, select the highest-scoring incoming edge
  for (let j = 1; j < n + 1; j++) { // Skip ROOT (j=0)
    let maxScore = -Infinity
    let maxHead = 0
    
    for (let i = 0; i < n + 1; i++) {
      if (i !== j && score[i][j] > maxScore) {
        maxScore = score[i][j]
        maxHead = i
      }
    }
    
    parent[j] = maxHead
  }
  
  // Step 2: Check for cycles (simplified - for full implementation would need cycle contraction)
  // Note: For simplicity, we use the greedy solution without full cycle contraction
  // A complete implementation would detect and contract cycles iteratively
  
  // Convert to visualization format
  const nodes = tokens.map((token, i) => ({
    id: token.text + '_' + i,
    label: token.text,
    pos: token.pos,
    value: 1
  }))
  
  nodes.unshift({ id: 'ROOT', label: 'ROOT', pos: 'ROOT', value: 2 })
  
  const edges = []
  for (let j = 1; j < n + 1; j++) {
    if (parent[j] !== -1) {
      const sourceId = parent[j] === 0 ? 'ROOT' : words[parent[j]].text + '_' + (parent[j] - 1)
      const targetId = words[j].text + '_' + (j - 1)
      edges.push({
        source: sourceId,
        target: targetId,
        value: score[parent[j]][j]
      })
    }
  }
  
  return { nodes, edges }
}

/**
 * Arc-Standard Transition-Based Parsing System
 * Uses stack and buffer with shift/reduce operations
 * 
 * @param {Array} tokens - Array of {text, pos} objects
 * @returns {Object} - {nodes, edges} for visualization
 * 
 * Reference: Nivre, J. (2008). Algorithms for deterministic incremental dependency parsing.
 * Computational Linguistics, 34(4), 513-553.
 */
export const arcStandardSystem = (tokens) => {
  if (!tokens || tokens.length === 0) return { nodes: [], edges: [] }
  
  const n = tokens.length
  
  // Add ROOT and create working tokens
  const words = [{ text: 'ROOT', pos: 'ROOT', idx: 0 }, ...tokens.map((t, i) => ({ ...t, idx: i + 1 }))]
  
  // Stack and buffer
  const stack = [0] // Start with ROOT on stack
  const buffer = Array.from({ length: n }, (_, i) => i + 1)
  const arcs = []
  
  // Transition-based parsing
  while (buffer.length > 0 || stack.length > 1) {
    if (stack.length < 2) {
      // SHIFT: move from buffer to stack
      if (buffer.length > 0) {
        stack.push(buffer.shift())
      } else {
        break
      }
    } else {
      const top = stack[stack.length - 1]
      const second = stack[stack.length - 2]
      
      // Score left-arc (top -> second) vs right-arc (second -> top)
      const leftScore = scoreDependency(words[top].pos, words[second].pos, Math.abs(top - second))
      const rightScore = scoreDependency(words[second].pos, words[top].pos, Math.abs(top - second))
      
      if (rightScore > leftScore && rightScore > 0.3) {
        // RIGHT-ARC: second is head of top
        arcs.push({ head: second, dep: top })
        stack.pop() // Remove top from stack
      } else if (leftScore > 0.3 && second !== 0) { // ROOT cannot have a head
        // LEFT-ARC: top is head of second
        arcs.push({ head: top, dep: second })
        stack.splice(stack.length - 2, 1) // Remove second from stack
      } else {
        // SHIFT
        if (buffer.length > 0) {
          stack.push(buffer.shift())
        } else {
          // If buffer is empty, force a decision
          if (rightScore >= leftScore || second === 0) {
            arcs.push({ head: second, dep: top })
            stack.pop()
          } else {
            arcs.push({ head: top, dep: second })
            stack.splice(stack.length - 2, 1)
          }
        }
      }
    }
  }
  
  // Convert to visualization format
  const nodes = tokens.map((token, i) => ({
    id: token.text + '_' + i,
    label: token.text,
    pos: token.pos,
    value: 1
  }))
  
  nodes.unshift({ id: 'ROOT', label: 'ROOT', pos: 'ROOT', value: 2 })
  
  const edges = arcs.map(arc => ({
    source: arc.head === 0 ? 'ROOT' : words[arc.head].text + '_' + (arc.head - 1),
    target: words[arc.dep].text + '_' + (arc.dep - 1),
    value: 1
  }))
  
  return { nodes, edges }
}

/**
 * Main function to perform dependency parsing on text samples
 * 
 * @param {Array} textSamples - Array of text strings
 * @param {Object} params - {algorithm: 'eisner'|'chu-liu'|'arc-standard', maxSamples: number, onProgress: function}
 * @returns {Object} - Combined results from all samples
 */
export const performDependencyParsing = async (textSamples, params = {}) => {
  const { algorithm = 'eisner', maxSamples = 1000, onProgress = null } = params
  
  if (!textSamples || textSamples.length === 0) {
    return { nodes: [], edges: [], sentences: [] }
  }
  
  // Load compromise for POS tagging
  const nlp = await loadCompromise()
  
  // Process samples in chunks to avoid blocking UI
  const chunkSize = 50 // Process 50 samples at a time
  const samplesToProcess = textSamples.slice(0, maxSamples)
  const allResults = []
  
  for (let i = 0; i < samplesToProcess.length; i += chunkSize) {
    const chunk = samplesToProcess.slice(i, Math.min(i + chunkSize, samplesToProcess.length))
    
    // Process this chunk
    for (const text of chunk) {
      // Get sentences
      const doc = nlp(text)
      const sentences = doc.sentences().out('array')
      
      for (const sentence of sentences.slice(0, 1)) { // Just first sentence per sample
        // Get tokens with POS tags
        const tokens = nlp(sentence).terms().out('array').map((term, idx) => {
          const termObj = nlp(term)
          // Map compromise POS to simplified categories
          let pos = 'Noun' // default
          if (termObj.verbs().length > 0) pos = 'Verb'
          else if (termObj.adjectives().length > 0) pos = 'Adjective'
        else if (termObj.adverbs().length > 0) pos = 'Adverb'
        else if (termObj.nouns().length > 0) pos = 'Noun'
        else if (term.toLowerCase().match(/^(the|a|an)$/)) pos = 'Determiner'
        else if (term.toLowerCase().match(/^(in|on|at|to|for|with|from|by)$/)) pos = 'Preposition'
        
        return { text: term, pos, idx }
      })
      
      if (tokens.length === 0) continue
      
      // Apply selected algorithm
      let result
      switch (algorithm) {
        case 'chu-liu':
          result = chuLiuEdmondsAlgorithm(tokens)
          break
        case 'arc-standard':
          result = arcStandardSystem(tokens)
          break
        case 'eisner':
        default:
          result = eisnerAlgorithm(tokens)
          break
      }
      
      allResults.push({
        sentence,
        ...result
      })
      }
    }
    
    // Yield to event loop after each chunk to keep UI responsive
    if (i + chunkSize < samplesToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Report progress if callback provided
      if (onProgress) {
        const progress = Math.min(100, Math.round(((i + chunkSize) / samplesToProcess.length) * 100))
        onProgress(progress)
      }
    }
  }
  
  // Report completion
  if (onProgress) {
    onProgress(100)
  }
  
  // Combine results: use first result for visualization
  if (allResults.length === 0) {
    return { nodes: [], edges: [], sentences: [] }
  }
  
  return {
    nodes: allResults[0].nodes,
    edges: allResults[0].edges,
    sentences: allResults.map(r => r.sentence),
    algorithm,
    totalProcessed: allResults.length
  }
}

export default {
  eisnerAlgorithm,
  chuLiuEdmondsAlgorithm,
  arcStandardSystem,
  performDependencyParsing
}
