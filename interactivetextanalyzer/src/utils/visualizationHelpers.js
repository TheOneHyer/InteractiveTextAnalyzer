/**
 * Visualization Helper Utilities
 * 
 * This module provides functions for preparing data for various visualizations
 * including word clouds, bar charts, network graphs, heatmaps, and scatter plots.
 */

/**
 * Get word cloud data based on analysis type
 * @param {Object} params - Parameters object
 * @param {string} params.analysisType - Current analysis type
 * @param {Object} params.tfidf - TF-IDF analysis results
 * @param {Array} params.ngrams - N-gram analysis results
 * @param {Array} params.entities - NER analysis results
 * @param {Object} params.associations - Association mining results
 * @param {Array} params.yakeKeywords - YAKE keyword extraction results
 * @param {Array} params.tokenization - Tokenization analysis results
 * @param {Array} params.lemmatization - Lemmatization analysis results
 * @param {Object} params.partsOfSpeech - Parts of speech analysis results
 * @param {Object} params.topicModel - Topic modeling results
 * @returns {Array} Array of {text, value} objects for word cloud
 */
export function getWordCloudData({
  analysisType,
  tfidf,
  ngrams,
  entities,
  associations,
  yakeKeywords,
  tokenization,
  lemmatization,
  partsOfSpeech,
  topicModel
}) {
  switch (analysisType) {
    case 'tfidf':
      if (tfidf) {
        return tfidf.aggregate.map(t => ({ text: t.term, value: t.score }))
      }
      break
    case 'ngram':
      return ngrams.map(g => ({ text: g.gram, value: g.count }))
    case 'ner':
      return entities.map(e => ({ text: e.value, value: e.count }))
    case 'assoc':
      if (associations) {
        return associations.items.map(i => ({ text: i.item, value: i.support }))
      }
      break
    case 'yake':
      return yakeKeywords.map(k => ({ text: k.keyword, value: 1 / k.score }))
    case 'tokenization':
      return tokenization.map(t => ({ text: t.token, value: t.count }))
    case 'lemmatization':
      return lemmatization.map(l => ({ text: l.lemma, value: l.count }))
    case 'pos':
      if (partsOfSpeech) {
        // Create word cloud from POS examples
        const allWords = []
        Object.entries(partsOfSpeech.posExamples).forEach(([, words]) => {
          words.forEach(({ word, count }) => {
            allWords.push({ text: word, value: count })
          })
        })
        return allWords
      }
      break
    case 'topic':
      if (topicModel) {
        // Create word cloud from all topic terms
        const allTerms = []
        topicModel.topics.forEach(topic => {
          topic.terms.forEach(({ term, score }) => {
            allTerms.push({ text: term, value: score })
          })
        })
        return allTerms
      }
      break
    default:
      return []
  }
  return []
}

/**
 * Get bar chart data based on analysis type
 * @param {Object} params - Parameters object with analysis results
 * @returns {Array} Array of objects for bar chart
 */
export function getBarData({
  analysisType,
  associations,
  tfidf,
  ngrams,
  entities,
  yakeKeywords,
  tokenization,
  lemmatization,
  partsOfSpeech,
  sentiment,
  topicModel,
  readability
}) {
  switch (analysisType) {
    case 'assoc':
      if (associations) {
        return associations.pairs.slice(0, 8).map(p => ({ name: `${p.a}+${p.b}`, lift: Number(p.lift.toFixed(2)) }))
      }
      break
    case 'tfidf':
      if (tfidf) {
        return tfidf.aggregate.slice(0, 8).map(t => ({ name: t.term, score: Number(t.score.toFixed(2)) }))
      }
      break
    case 'ngram':
      return ngrams.slice(0, 8).map(g => ({ name: g.gram, freq: g.count }))
    case 'ner':
      return entities.slice(0, 8).map(e => ({ name: e.value, count: e.count }))
    case 'yake':
      return yakeKeywords.slice(0, 8).map(k => ({ name: k.keyword, score: Number((1 / k.score).toFixed(2)) }))
    case 'tokenization':
      return tokenization.slice(0, 8).map(t => ({ name: t.token, count: t.count }))
    case 'lemmatization':
      return lemmatization.slice(0, 8).map(l => ({ name: l.lemma, count: l.count }))
    case 'pos':
      if (partsOfSpeech) {
        return Object.entries(partsOfSpeech.posCounts)
          .filter(([, count]) => count > 0)
          .map(([pos, count]) => ({ name: pos, count, percentage: Number(partsOfSpeech.percentages[pos]) }))
          .sort((a, b) => b.count - a.count)
      }
      break
    case 'sentiment':
      if (sentiment && sentiment.summary) {
        return [
          { name: 'Positive', count: sentiment.summary.positive, percentage: sentiment.summary.positivePercent },
          { name: 'Negative', count: sentiment.summary.negative, percentage: sentiment.summary.negativePercent },
          { name: 'Neutral', count: sentiment.summary.neutral, percentage: sentiment.summary.neutralPercent }
        ].filter(item => item.count > 0)
      }
      break
    case 'readability':
      if (readability && readability.aggregate) {
        return [
          { name: 'Flesch Reading Ease', score: readability.aggregate.flesch },
          { name: 'Flesch-Kincaid Grade', score: readability.aggregate.fleschKincaid },
          { name: 'Coleman-Liau Index', score: readability.aggregate.colemanLiau },
          { name: 'Gunning Fog Index', score: readability.aggregate.gunningFog },
          { name: 'SMOG Index', score: readability.aggregate.smog },
          { name: 'ARI', score: readability.aggregate.ari }
        ]
      }
      break
    case 'topic':
      if (topicModel) {
        return topicModel.topics.map(t => ({ name: `Topic ${t.id + 1}`, size: Number(t.size.toFixed(2)) }))
      }
      break
    default:
      return []
  }
  return []
}

/**
 * Get network graph data based on analysis type
 * @param {Object} params - Parameters object
 * @returns {Object} Object with nodes and edges arrays
 */
export function getNetworkData({ analysisType, associations, dependencyResult, lemmatization, topicModel, coreferenceResult, relationResult, argumentResult }) {
  if (analysisType === 'assoc' && associations) {
    return {
      nodes: associations.items.slice(0, 50).map(i => ({ id: i.item, value: i.support })),
      edges: associations.pairs.filter(p => p.lift >= 1).map(p => ({ source: p.a, target: p.b, value: p.lift }))
    }
  }
  
  if (analysisType === 'dependency' && dependencyResult) {
    return { nodes: dependencyResult.nodes, edges: dependencyResult.edges }
  }
  
  if (analysisType === 'topic' && topicModel) {
    // Create network graph from topic co-occurrence
    const nodes = topicModel.topics.map(t => ({
      id: `topic_${t.id}`,
      value: t.size,
      label: t.label
    }))
    const edges = topicModel.topicCooccurrence.map(cooc => ({
      source: `topic_${cooc.source}`,
      target: `topic_${cooc.target}`,
      value: cooc.weight
    }))
    return { nodes, edges }
  }
  
  if (analysisType === 'lemmatization' && lemmatization.length > 0) {
    // Create a co-occurrence network from lemmas
    const lemmaNodes = lemmatization.slice(0, 30).map(l => ({ id: l.lemma, value: l.count }))
    const edges = []
    
    // Simple approach: connect top lemmas based on their frequency
    for (let i = 0; i < Math.min(lemmatization.length, 20); i++) {
      for (let j = i + 1; j < Math.min(lemmatization.length, 20); j++) {
        if (i !== j) {
          // Create edges with decreasing weights based on position
          const weight = 1 / (Math.abs(i - j) + 1)
          if (weight > 0.2) {
            edges.push({ source: lemmatization[i].lemma, target: lemmatization[j].lemma, value: weight })
          }
        }
      }
    }
    return { nodes: lemmaNodes, edges: edges.slice(0, 40) }
  }
  
  if (analysisType === 'coref' && coreferenceResult) {
    // Create network graph from coreference chains
    const nodes = []
    const edges = []
    const nodeSet = new Set()
    
    coreferenceResult.corefChains.slice(0, 20).forEach(chain => {
      // Add representative as main node
      if (!nodeSet.has(chain.representative)) {
        nodes.push({ 
          id: chain.representative, 
          value: chain.count, 
          label: chain.representative 
        })
        nodeSet.add(chain.representative)
      }
      
      // Add mentions as nodes and link to representative
      chain.mentions.slice(0, 5).forEach(mention => {
        if (mention !== chain.representative && !nodeSet.has(mention)) {
          nodes.push({ id: mention, value: 1, label: mention })
          nodeSet.add(mention)
        }
        if (mention !== chain.representative) {
          edges.push({ 
            source: chain.representative, 
            target: mention, 
            value: 0.8 
          })
        }
      })
    })
    
    return { nodes: nodes.slice(0, 50), edges: edges.slice(0, 50) }
  }
  
  if (analysisType === 'relation' && relationResult) {
    // Create network graph from relations or events
    const nodes = []
    const edges = []
    const nodeSet = new Set()
    
    if (relationResult.relations) {
      relationResult.relations.slice(0, 30).forEach(rel => {
        // Add subject and object as nodes
        if (!nodeSet.has(rel.subject)) {
          nodes.push({ id: rel.subject, value: 1, label: rel.subject })
          nodeSet.add(rel.subject)
        }
        if (!nodeSet.has(rel.object)) {
          nodes.push({ id: rel.object, value: 1, label: rel.object })
          nodeSet.add(rel.object)
        }
        
        // Add edge with relation type as label
        edges.push({ 
          source: rel.subject, 
          target: rel.object, 
          value: 1,
          label: rel.relation
        })
      })
    } else if (relationResult.events) {
      relationResult.events.slice(0, 30).forEach(event => {
        // Add agent as main node
        if (!nodeSet.has(event.agent)) {
          nodes.push({ id: event.agent, value: 2, label: event.agent })
          nodeSet.add(event.agent)
        }
        
        // Add participants as nodes and link to agent
        event.participants.forEach(participant => {
          if (participant && !nodeSet.has(participant)) {
            nodes.push({ id: participant, value: 1, label: participant })
            nodeSet.add(participant)
          }
          if (participant) {
            edges.push({ 
              source: event.agent, 
              target: participant, 
              value: 0.7,
              label: event.trigger
            })
          }
        })
      })
    }
    
    return { nodes: nodes.slice(0, 50), edges: edges.slice(0, 50) }
  }
  
  if (analysisType === 'argument' && argumentResult) {
    // Create network graph from argument structures
    const nodes = []
    const edges = []
    const nodeSet = new Set()
    
    argumentResult.arguments.slice(0, 20).forEach(arg => {
      // Add claim as main node
      const claimId = `claim_${arg.id}`
      if (!nodeSet.has(claimId)) {
        nodes.push({ 
          id: claimId, 
          value: 3, 
          label: arg.claim.slice(0, 40) + '...'
        })
        nodeSet.add(claimId)
      }
      
      // Add premises as nodes and link to claim
      arg.premises.forEach((premise, idx) => {
        const premiseId = `premise_${arg.id}_${idx}`
        if (!nodeSet.has(premiseId)) {
          nodes.push({ 
            id: premiseId, 
            value: 1, 
            label: premise.slice(0, 30) + '...'
          })
          nodeSet.add(premiseId)
        }
        edges.push({ 
          source: premiseId, 
          target: claimId, 
          value: 0.8,
          label: 'supports'
        })
      })
      
      // Add counter-arguments if present
      if (arg.counterArguments) {
        arg.counterArguments.forEach((counter, idx) => {
          const counterId = `counter_${arg.id}_${idx}`
          if (!nodeSet.has(counterId)) {
            nodes.push({ 
              id: counterId, 
              value: 1, 
              label: counter.slice(0, 30) + '...'
            })
            nodeSet.add(counterId)
          }
          edges.push({ 
            source: counterId, 
            target: claimId, 
            value: 0.6,
            label: 'challenges'
          })
        })
      }
    })
    
    return { nodes: nodes.slice(0, 50), edges: edges.slice(0, 50) }
  }
  
  return { nodes: [], edges: [] }
}

/**
 * Get heatmap data based on analysis type
 * @param {Object} params - Parameters object
 * @returns {Object} Object with matrix, xLabels, and yLabels
 */
export function getHeatmapData({ analysisType, tfidf, textSamples, topicModel }) {
  if (analysisType === 'tfidf' && tfidf) {
    const top = tfidf.aggregate.slice(0, 20).map(t => t.term)
    const matrix = tfidf.perDoc.slice(0, 25).map(doc => top.map(term => {
      const f = doc.find(x => x.term === term)
      return f ? Number(f.tfidf.toFixed(2)) : 0
    }))
    
    // Create better document labels using text preview
    const yLabels = matrix.map((_, i) => {
      if (i < textSamples.length) {
        const text = textSamples[i]
        // Get first 40 chars or up to first sentence
        const preview = text.slice(0, 40).replace(/\s+/g, ' ').trim()
        return preview.length < text.length ? preview + '...' : preview
      }
      return 'Doc ' + (i + 1)
    })
    
    return { matrix, xLabels: top, yLabels }
  }
  
  if (analysisType === 'topic' && topicModel) {
    // Create document-topic heatmap
    const xLabels = topicModel.topics.map(t => `T${t.id + 1}`)
    const yLabels = topicModel.docTopicMatrix.slice(0, 25).map((_, i) => {
      if (i < textSamples.length) {
        const text = textSamples[i]
        const preview = text.slice(0, 40).replace(/\s+/g, ' ').trim()
        return preview.length < text.length ? preview + '...' : preview
      }
      return 'Doc ' + (i + 1)
    })
    const matrix = topicModel.docTopicMatrix.slice(0, 25).map(docTopics =>
      docTopics.map(score => Number(score.toFixed(3)))
    )
    
    return { matrix, xLabels, yLabels }
  }
  
  return { matrix: [], xLabels: [], yLabels: [] }
}
