#!/usr/bin/env node

/**
 * Accuracy Testing Script for Dependency Parsing Sample Sizes
 * 
 * This script tests whether sampled data produces similar parse trees
 * compared to using the full dataset. We measure accuracy by comparing
 * the actual dependency structures (edges) generated.
 */

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import standalone algorithms
const { eisnerAlgorithm, chuLiuEdmondsAlgorithm, arcStandardSystem } = 
  await import('./dependency-parsing-standalone.mjs')

// Sample sentences for testing
const sampleSentences = [
  "The quick brown fox jumps over the lazy dog",
  "A beautiful sunset painted the sky with vibrant colors",
  "Scientists discovered a new species in the rainforest",
  "The ancient castle stood majestically on the hilltop",
  "Children played happily in the sunny park",
  "Technology advances rapidly in modern society",
  "The orchestra performed brilliantly at the concert hall",
  "Mountains rise dramatically above the valley floor",
  "Researchers analyze data carefully before drawing conclusions",
  "The garden blooms beautifully in spring"
]

// Tokenize and tag function
function tokenizeAndTag(sentence) {
  const words = sentence.split(' ')
  return words.map((word, idx) => {
    let pos = 'Noun'
    
    if (word.toLowerCase().match(/^(the|a|an)$/)) pos = 'Determiner'
    else if (word.toLowerCase().match(/^(is|are|was|were|be|been|being|am|has|have|had|do|does|did|can|could|will|would|should|may|might|must)$/)) pos = 'Verb'
    else if (word.toLowerCase().match(/^(and|or|but|if|when|where|while|because|although)$/)) pos = 'Conjunction'
    else if (word.toLowerCase().match(/^(in|on|at|to|for|with|from|by|about|over|under|above|below|through|during|before|after)$/)) pos = 'Preposition'
    else if (word.toLowerCase().match(/^(very|quickly|slowly|carefully|happily|beautifully|rapidly|dramatically|gently|diligently|brilliantly|peacefully|majestically)$/)) pos = 'Adverb'
    else if (word.toLowerCase().match(/^(quick|brown|lazy|beautiful|vibrant|ancient|sunny|modern|final|peaceful|complex|warm|exciting|excellent|new)$/)) pos = 'Adjective'
    else if (word.match(/^[A-Z]/)) pos = 'Noun'
    else if (word.toLowerCase().match(/(s|ed|ing|ly)$/)) {
      if (word.toLowerCase().match(/ly$/)) pos = 'Adverb'
      else if (word.toLowerCase().match(/(ed|ing)$/)) pos = 'Verb'
    }
    
    return { text: word, pos, idx }
  })
}

// Calculate Jaccard similarity between two edge sets
function calculateEdgeSimilarity(edges1, edges2) {
  // Convert edges to comparable strings
  const edgeSet1 = new Set(edges1.map(e => `${e.source}->${e.target}`))
  const edgeSet2 = new Set(edges2.map(e => `${e.source}->${e.target}`))
  
  // Calculate intersection
  const intersection = new Set([...edgeSet1].filter(x => edgeSet2.has(x)))
  
  // Calculate union
  const union = new Set([...edgeSet1, ...edgeSet2])
  
  // Jaccard similarity = intersection / union
  if (union.size === 0) return 1.0
  return intersection.size / union.size
}

// Calculate attachment score (what percentage of words got the same head)
function calculateAttachmentScore(edges1, edges2) {
  // Build head maps
  const heads1 = new Map()
  const heads2 = new Map()
  
  edges1.forEach(e => heads1.set(e.target, e.source))
  edges2.forEach(e => heads2.set(e.target, e.source))
  
  // Find all unique targets
  const allTargets = new Set([...heads1.keys(), ...heads2.keys()])
  
  if (allTargets.size === 0) return 1.0
  
  // Count matches
  let matches = 0
  allTargets.forEach(target => {
    if (heads1.get(target) === heads2.get(target)) {
      matches++
    }
  })
  
  return matches / allTargets.size
}

// Run algorithm on a set of sentences
function runAlgorithmOnSet(algorithm, sentences, algorithmName) {
  const allEdges = []
  
  for (const sentence of sentences) {
    const tokens = tokenizeAndTag(sentence)
    const result = algorithm(tokens)
    if (result && result.edges) {
      allEdges.push(...result.edges)
    }
  }
  
  return allEdges
}

// Main accuracy testing function
async function testSamplingAccuracy() {
  console.log('🎯 Dependency Parsing Sampling Accuracy Test\n')
  console.log('=' .repeat(80))
  
  const algorithms = [
    { name: 'Eisner', func: eisnerAlgorithm },
    { name: 'Chu-Liu/Edmonds', func: chuLiuEdmondsAlgorithm },
    { name: 'Arc-Standard', func: arcStandardSystem }
  ]
  
  // Generate test dataset
  const fullDataset = []
  for (let i = 0; i < 1000; i++) {
    fullDataset.push(sampleSentences[i % sampleSentences.length])
  }
  
  console.log(`\n📊 Dataset: ${fullDataset.length} sentences`)
  console.log(`Sample sizes to test: 20%, 40%, 60%, 80%`)
  console.log(`Runs per sample size: 10`)
  console.log(`\nAccuracy Metrics:`)
  console.log(`  - Jaccard Similarity: Measures edge set overlap`)
  console.log(`  - Attachment Score: Measures correct head assignment`)
  console.log(`  - Target: >= 90% similarity for acceptable sampling\n`)
  
  const results = {}
  
  for (const algorithm of algorithms) {
    console.log('\n' + '='.repeat(80))
    console.log(`Testing: ${algorithm.name}`)
    console.log('='.repeat(80))
    
    // Get full dataset results
    console.log('\n  Computing full dataset parse...')
    const fullEdges = runAlgorithmOnSet(algorithm.func, fullDataset, algorithm.name)
    console.log(`  ✅ Full dataset: ${fullEdges.length} edges`)
    
    results[algorithm.name] = {
      fullDataset: { edgeCount: fullEdges.length },
      samples: {}
    }
    
    // Test different sample sizes
    const sampleSizes = [0.2, 0.4, 0.6, 0.8]
    
    for (const sampleSize of sampleSizes) {
      const samplePercent = (sampleSize * 100).toFixed(0)
      console.log(`\n  📐 Testing ${samplePercent}% samples...`)
      
      const jaccardScores = []
      const attachmentScores = []
      
      for (let run = 1; run <= 10; run++) {
        // Random sample
        const sampleCount = Math.floor(fullDataset.length * sampleSize)
        const indices = new Set()
        while (indices.size < sampleCount) {
          indices.add(Math.floor(Math.random() * fullDataset.length))
        }
        const sample = Array.from(indices).map(i => fullDataset[i])
        
        // Get sample results
        const sampleEdges = runAlgorithmOnSet(algorithm.func, sample, algorithm.name)
        
        // Scale sample edges to compare with full dataset proportionally
        // We compare the structure/patterns, not absolute counts
        const jaccard = calculateEdgeSimilarity(fullEdges, sampleEdges)
        const attachment = calculateAttachmentScore(fullEdges, sampleEdges)
        
        jaccardScores.push(jaccard)
        attachmentScores.push(attachment)
      }
      
      const avgJaccard = jaccardScores.reduce((a, b) => a + b, 0) / jaccardScores.length
      const avgAttachment = attachmentScores.reduce((a, b) => a + b, 0) / attachmentScores.length
      
      results[algorithm.name].samples[samplePercent] = {
        jaccardSimilarity: avgJaccard,
        attachmentScore: avgAttachment,
        acceptable: avgJaccard >= 0.9 || avgAttachment >= 0.9
      }
      
      console.log(`    Jaccard Similarity: ${(avgJaccard * 100).toFixed(2)}%`)
      console.log(`    Attachment Score: ${(avgAttachment * 100).toFixed(2)}%`)
      console.log(`    Status: ${(avgJaccard >= 0.9 || avgAttachment >= 0.9) ? '✅ Acceptable' : '⚠️  Below threshold'}`)
    }
  }
  
  // Summary Report
  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY REPORT')
  console.log('='.repeat(80))
  
  console.log('\n📊 Sampling Accuracy Results:\n')
  
  for (const algorithm of algorithms) {
    console.log(`\n${algorithm.name}:`)
    console.log('  ' + '-'.repeat(76))
    console.log('  Sample% | Jaccard | Attachment | Acceptable?')
    console.log('  ' + '-'.repeat(76))
    
    for (const sampleSize of ['20', '40', '60', '80']) {
      const data = results[algorithm.name].samples[sampleSize]
      console.log(
        `  ${sampleSize.padStart(7)}% | ` +
        `${(data.jaccardSimilarity * 100).toFixed(1).padStart(7)}% | ` +
        `${(data.attachmentScore * 100).toFixed(1).padStart(10)}% | ` +
        `${data.acceptable ? '✅ Yes' : '❌ No'}`
      )
    }
  }
  
  // Determine recommendation
  console.log('\n' + '='.repeat(80))
  console.log('RECOMMENDATION')
  console.log('='.repeat(80))
  
  let allAcceptable = true
  let anyAcceptable = false
  
  for (const algorithm of algorithms) {
    for (const sampleSize of ['20', '40', '60', '80']) {
      const data = results[algorithm.name].samples[sampleSize]
      if (data.acceptable) anyAcceptable = true
      if (!data.acceptable) allAcceptable = false
    }
  }
  
  if (allAcceptable) {
    console.log('\n✅ SAMPLING IS VIABLE')
    console.log('\nAll sample sizes produce acceptable accuracy (>= 90% similarity).')
    console.log('Recommendation: Can use sampling for performance optimization.')
    console.log('Suggested: 40-60% sample for good balance of speed and accuracy.')
  } else if (anyAcceptable) {
    console.log('\n⚠️  PARTIAL SAMPLING VIABILITY')
    console.log('\nSome sample sizes are acceptable, others are not.')
    console.log('Recommendation: Use larger sample sizes (60-80%) or full dataset.')
    console.log('For best accuracy, process full dataset with async/web worker.')
  } else {
    console.log('\n❌ SAMPLING NOT RECOMMENDED')
    console.log('\nSampled data produces significantly different results from full dataset.')
    console.log('Recommendation: Process full dataset using web worker or async processing.')
    console.log('This ensures UI remains responsive while maintaining result accuracy.')
  }
  
  console.log('\n📝 Implementation Note:')
  console.log('For dependency parsing, the actual parse tree structure matters, not just')
  console.log('performance. If sampling produces different trees, use full dataset processing')
  console.log('with async/web worker to prevent UI freeze while maintaining accuracy.')
  
  console.log('\n✅ Accuracy testing complete!\n')
  
  return results
}

// Run the test
testSamplingAccuracy().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
