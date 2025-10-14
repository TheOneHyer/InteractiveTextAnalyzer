/**
 * Relation and Event Extraction
 * 
 * This module implements relation extraction and event detection from text:
 * 
 * 1. Pattern-Based Relation Extraction: Uses linguistic patterns to identify relationships
 * 2. Dependency-Based Relation Extraction: Uses syntactic dependencies
 * 3. Event Extraction: Identifies events, participants, time, and location
 * 
 * References:
 * - Zelenko, D., Aone, C., & Richardella, A. (2003). Kernel methods for relation extraction.
 *   JMLR, 3, 1083-1106. https://www.jmlr.org/papers/v3/zelenko03a.html
 * - Ahn, D. (2006). The stages of event extraction. In ACL Workshop on Annotating and 
 *   Reasoning about Time and Events. https://aclanthology.org/W06-0901/
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
 * Common relation patterns
 */
const RELATION_PATTERNS = [
  // Organizational relations
  { pattern: '#Noun+ (works for|employed by|works at) #Noun+', type: 'employment' },
  { pattern: '#Noun+ (CEO|president|director) of #Noun+', type: 'leadership' },
  { pattern: '#Noun+ (owns|acquired|purchased) #Noun+', type: 'ownership' },
  { pattern: '#Noun+ (subsidiary of|division of|part of) #Noun+', type: 'organizational' },
  
  // Personal relations
  { pattern: '#Noun+ (married to|spouse of|wife of|husband of) #Noun+', type: 'family' },
  { pattern: '#Noun+ (child of|parent of|son of|daughter of) #Noun+', type: 'family' },
  { pattern: '#Noun+ (friend of|colleague of|partner of) #Noun+', type: 'social' },
  
  // Location relations
  { pattern: '#Noun+ (located in|based in|situated in) #Place+', type: 'location' },
  { pattern: '#Noun+ (from|of) #Place+', type: 'origin' },
  { pattern: '#Noun+ (in|at|near) #Place+', type: 'location' },
  
  // Creation/invention
  { pattern: '#Noun+ (created|invented|founded|established) #Noun+', type: 'creation' },
  { pattern: '#Noun+ (wrote|authored|composed) #Noun+', type: 'authorship' },
  
  // Membership
  { pattern: '#Noun+ (member of|belongs to|part of) #Noun+', type: 'membership' },
]

/**
 * Event trigger words
 */
const EVENT_TRIGGERS = {
  movement: ['went', 'traveled', 'moved', 'left', 'arrived', 'departed', 'returned'],
  transaction: ['bought', 'sold', 'purchased', 'acquired', 'traded', 'paid'],
  communication: ['said', 'announced', 'reported', 'stated', 'declared', 'claimed'],
  conflict: ['attacked', 'fought', 'killed', 'destroyed', 'bombed', 'invaded'],
  creation: ['created', 'built', 'established', 'founded', 'invented', 'developed'],
  change: ['became', 'changed', 'transformed', 'converted', 'turned'],
  meeting: ['met', 'visited', 'gathered', 'assembled', 'convened']
}

/**
 * Extract entities from text
 */
const extractEntitiesForRelations = (doc) => {
  const entities = []
  
  // Extract people
  const people = doc.people().out('array')
  people.forEach((text, idx) => {
    entities.push({
      text,
      type: 'person',
      startIdx: idx,
      endIdx: idx
    })
  })
  
  // Extract places
  const places = doc.places().out('array')
  places.forEach((text, idx) => {
    entities.push({
      text,
      type: 'place',
      startIdx: idx,
      endIdx: idx
    })
  })
  
  // Extract organizations
  const orgs = doc.organizations().out('array')
  orgs.forEach((text, idx) => {
    entities.push({
      text,
      type: 'organization',
      startIdx: idx,
      endIdx: idx
    })
  })
  
  return entities
}

/**
 * Pattern-Based Relation Extraction
 * Uses predefined linguistic patterns
 */
export const patternBasedRelations = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { relations: [], entities: [] }
  }
  
  const nlp = await loadCompromise()
  const relations = []
  const allEntities = []
  let relationId = 0
  
  // Process each text sample
  for (const text of textSamples.slice(0, 100)) {
    const doc = nlp(text)
    const entities = extractEntitiesForRelations(doc)
    allEntities.push(...entities)
    
    // Apply each pattern
    RELATION_PATTERNS.forEach(({ pattern, type }) => {
      const matches = doc.match(pattern)
      matches.forEach(match => {
        const matchText = match.text()
        const terms = match.terms()
        
        // Extract subject and object
        const words = matchText.split(' ')
        let subject = ''
        let object = ''
        let relation = ''
        
        // Simple heuristic: first noun phrase is subject, last is object
        let inSubject = true
        words.forEach(word => {
          if (['works', 'employed', 'CEO', 'president', 'owns', 'married', 'child', 'located', 'created', 'wrote', 'member'].some(r => word.toLowerCase().includes(r.toLowerCase()))) {
            inSubject = false
            relation = word
          } else if (inSubject) {
            subject += word + ' '
          } else {
            object += word + ' '
          }
        })
        
        if (subject.trim() && object.trim()) {
          relations.push({
            id: relationId++,
            subject: subject.trim(),
            relation: relation || type,
            object: object.trim(),
            type,
            text: matchText,
            source: text
          })
        }
      })
    })
  }
  
  return {
    relations,
    entities: allEntities,
    totalRelations: relations.length
  }
}

/**
 * Dependency-Based Relation Extraction
 * Uses verb-argument structure
 */
export const dependencyBasedRelations = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { relations: [], entities: [] }
  }
  
  const nlp = await loadCompromise()
  const relations = []
  const allEntities = []
  let relationId = 0
  
  // Process each text sample
  for (const text of textSamples.slice(0, 100)) {
    const doc = nlp(text)
    const entities = extractEntitiesForRelations(doc)
    allEntities.push(...entities)
    
    // Find sentences with subject-verb-object structure
    const sentences = doc.sentences()
    sentences.forEach(sentence => {
      const subjects = sentence.match('#Noun+').out('array')
      const verbs = sentence.verbs().out('array')
      const objects = sentence.match('#Noun+').out('array')
      
      // Extract SVO triples
      if (subjects.length > 0 && verbs.length > 0 && objects.length > 1) {
        const subject = subjects[0]
        const verb = verbs[0]
        const object = objects[objects.length - 1] // Last noun is typically object
        
        if (subject !== object) {
          relations.push({
            id: relationId++,
            subject,
            relation: verb,
            object,
            type: 'svo',
            text: sentence.text(),
            source: text
          })
        }
      }
    })
  }
  
  return {
    relations,
    entities: allEntities,
    totalRelations: relations.length
  }
}

/**
 * Event Extraction
 * Identifies events with participants, time, and location
 */
export const extractEvents = async (textSamples) => {
  if (!textSamples || textSamples.length === 0) {
    return { events: [], entities: [] }
  }
  
  const nlp = await loadCompromise()
  const events = []
  const allEntities = []
  let eventId = 0
  
  // Process each text sample
  for (const text of textSamples.slice(0, 100)) {
    const doc = nlp(text)
    const entities = extractEntitiesForRelations(doc)
    allEntities.push(...entities)
    
    const sentences = doc.sentences()
    
    sentences.forEach(sentence => {
      // Look for event triggers
      Object.entries(EVENT_TRIGGERS).forEach(([eventType, triggers]) => {
        triggers.forEach(trigger => {
          if (sentence.has(trigger)) {
            // Extract event components
            const agent = sentence.match('#Noun+').first().text()
            const time = sentence.dates().first().text() || null
            const location = sentence.places().first().text() || null
            const participants = sentence.people().out('array')
            
            events.push({
              id: eventId++,
              type: eventType,
              trigger,
              agent: agent || 'unknown',
              participants,
              time,
              location,
              text: sentence.text(),
              source: text
            })
          }
        })
      })
    })
  }
  
  return {
    events,
    entities: allEntities,
    totalEvents: events.length
  }
}

/**
 * Main relation and event extraction function with algorithm selection
 */
export const performRelationEventExtraction = async (textSamples, params = {}) => {
  const { algorithm = 'pattern', maxSamples = 100, onProgress = null } = params
  
  if (!textSamples || textSamples.length === 0) {
    return { relations: [], events: [], entities: [], algorithm }
  }
  
  if (onProgress) onProgress(10)
  
  const samplesToProcess = textSamples.slice(0, maxSamples)
  let result
  
  switch (algorithm) {
    case 'dependency':
      result = await dependencyBasedRelations(samplesToProcess)
      break
    case 'events':
      result = await extractEvents(samplesToProcess)
      break
    case 'pattern':
    default:
      result = await patternBasedRelations(samplesToProcess)
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
  patternBasedRelations,
  dependencyBasedRelations,
  extractEvents,
  performRelationEventExtraction
}
