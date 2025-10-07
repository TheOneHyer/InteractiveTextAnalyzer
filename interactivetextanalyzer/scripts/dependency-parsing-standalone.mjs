/**
 * Standalone Dependency Parsing for Performance Testing
 * Simplified version without lazy loader dependency
 */

/**
 * Simple POS-based scoring for dependency arcs
 */
const scoreDependency = (headPos, depPos, distance) => {
  const preferences = {
    'Verb': { 'Noun': 0.9, 'Adjective': 0.7, 'Adverb': 0.8, 'Determiner': 0.6, 'Preposition': 0.7 },
    'Noun': { 'Adjective': 0.8, 'Determiner': 0.9, 'Noun': 0.6, 'Preposition': 0.7 },
    'Adjective': { 'Adverb': 0.7, 'Noun': 0.3 },
    'Preposition': { 'Noun': 0.9, 'Determiner': 0.5 },
    'default': { 'default': 0.5 }
  }
  
  const headPrefs = preferences[headPos] || preferences['default']
  const baseScore = headPrefs[depPos] || headPrefs['default'] || 0.5
  const distancePenalty = Math.exp(-distance / 5)
  
  return baseScore * distancePenalty
}

/**
 * Eisner's Algorithm (Simplified)
 */
export const eisnerAlgorithm = (tokens) => {
  if (!tokens || tokens.length === 0) return { nodes: [], edges: [] }
  
  const n = tokens.length
  const words = [{ text: 'ROOT', pos: 'ROOT' }, ...tokens]
  
  const score = Array(n + 1).fill(0).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i < n + 1; i++) {
    for (let j = 0; j < n + 1; j++) {
      if (i !== j) {
        const distance = Math.abs(i - j)
        score[i][j] = scoreDependency(words[i].pos, words[j].pos, distance)
      }
    }
  }
  
  const parent = Array(n + 1).fill(-1)
  parent[0] = -1
  
  for (let j = 1; j <= n; j++) {
    let maxScore = -Infinity
    let bestHead = 0
    
    for (let i = 0; i <= n; i++) {
      if (i === j) continue
      
      let isProjective = true
      for (let k = 1; k <= n; k++) {
        if (k === j || parent[k] === -1) continue
        
        const i1 = Math.min(i, j)
        const i2 = Math.max(i, j)
        const k1 = Math.min(parent[k], k)
        const k2 = Math.max(parent[k], k)
        
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
 * Chu-Liu/Edmonds Algorithm
 */
export const chuLiuEdmondsAlgorithm = (tokens) => {
  if (!tokens || tokens.length === 0) return { nodes: [], edges: [] }
  
  const n = tokens.length
  const words = [{ text: 'ROOT', pos: 'ROOT' }, ...tokens]
  
  const score = Array(n + 1).fill(0).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i < n + 1; i++) {
    for (let j = 0; j < n + 1; j++) {
      if (i !== j && j !== 0) {
        const distance = Math.abs(i - j)
        score[i][j] = scoreDependency(words[i].pos, words[j].pos, distance)
      }
    }
  }
  
  const parent = Array(n + 1).fill(-1)
  
  for (let j = 1; j < n + 1; j++) {
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
 * Arc-Standard System
 */
export const arcStandardSystem = (tokens) => {
  if (!tokens || tokens.length === 0) return { nodes: [], edges: [] }
  
  const n = tokens.length
  const words = [{ text: 'ROOT', pos: 'ROOT', idx: 0 }, ...tokens.map((t, i) => ({ ...t, idx: i + 1 }))]
  
  const stack = [0]
  const buffer = Array.from({ length: n }, (_, i) => i + 1)
  const arcs = []
  
  while (buffer.length > 0 || stack.length > 1) {
    if (stack.length < 2) {
      if (buffer.length > 0) {
        stack.push(buffer.shift())
      } else {
        break
      }
    } else {
      const top = stack[stack.length - 1]
      const second = stack[stack.length - 2]
      
      const leftScore = scoreDependency(words[top].pos, words[second].pos, Math.abs(top - second))
      const rightScore = scoreDependency(words[second].pos, words[top].pos, Math.abs(top - second))
      
      if (rightScore > leftScore && rightScore > 0.3) {
        arcs.push({ head: second, dep: top })
        stack.pop()
      } else if (leftScore > 0.3 && second !== 0) {
        arcs.push({ head: top, dep: second })
        stack.splice(stack.length - 2, 1)
      } else {
        if (buffer.length > 0) {
          stack.push(buffer.shift())
        } else {
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
