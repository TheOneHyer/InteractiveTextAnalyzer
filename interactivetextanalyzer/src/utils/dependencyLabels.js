/**
 * Dependency Labels Definitions
 * 
 * This module provides comprehensive documentation for Universal Dependencies (UD) labels
 * used in dependency parsing. These are standard labels used across many parsers including spaCy.
 * 
 * Reference: Universal Dependencies v2 guidelines
 * https://universaldependencies.org/u/dep/
 */

/**
 * Map of dependency labels to their descriptions
 */
export const DEPENDENCY_LABELS = {
  // Core dependents of clausal predicates
  'nsubj': {
    label: 'Nominal Subject',
    description: 'A nominal subject is a noun phrase which is the syntactic subject of a clause. The subject typically performs the action described by the verb.',
    example: 'The cat [nsubj] sleeps.',
    color: '#FF6B6B'
  },
  'nsubj:pass': {
    label: 'Passive Nominal Subject',
    description: 'A passive nominal subject is a noun phrase which is the syntactic subject of a passive clause.',
    example: 'The ball was caught [nsubj:pass] by John.',
    color: '#FF8787'
  },
  'obj': {
    label: 'Direct Object',
    description: 'The direct object of a verb is the noun phrase that denotes the entity acted upon.',
    example: 'She reads the book [obj].',
    color: '#4ECDC4'
  },
  'iobj': {
    label: 'Indirect Object',
    description: 'The indirect object of a verb is the noun phrase that denotes the recipient or beneficiary of the action.',
    example: 'She gave him [iobj] a gift.',
    color: '#45B7D1'
  },
  'csubj': {
    label: 'Clausal Subject',
    description: 'A clausal subject is a clause which is the syntactic subject of another clause.',
    example: 'What she said [csubj] makes sense.',
    color: '#FF9F9F'
  },
  'ccomp': {
    label: 'Clausal Complement',
    description: 'A clausal complement is a dependent clause that is a core argument.',
    example: 'He says [ccomp] that you like to swim.',
    color: '#96CEB4'
  },
  'xcomp': {
    label: 'Open Clausal Complement',
    description: 'An open clausal complement is a predicative or clausal complement without its own subject.',
    example: 'She wants to go [xcomp].',
    color: '#88D8B0'
  },
  
  // Non-core dependents of clausal predicates
  'obl': {
    label: 'Oblique Nominal',
    description: 'An oblique nominal is a noun phrase that functions as a non-core argument or adjunct.',
    example: 'She lives in Paris [obl].',
    color: '#FFEAA7'
  },
  'vocative': {
    label: 'Vocative',
    description: 'The vocative relation is used to mark a dialogue participant addressed in text.',
    example: 'John [vocative], come here!',
    color: '#DFE6E9'
  },
  'expl': {
    label: 'Expletive',
    description: 'An expletive is a word that fills the syntactic position of subject or object but has no semantic content.',
    example: 'There [expl] is a problem.',
    color: '#B2BEC3'
  },
  'dislocated': {
    label: 'Dislocated',
    description: 'The dislocated relation is used for fronted or postposed elements that are not core arguments.',
    example: 'John [dislocated], I saw him yesterday.',
    color: '#A29BFE'
  },
  'advcl': {
    label: 'Adverbial Clause Modifier',
    description: 'An adverbial clause modifier is a clause which modifies a verb or other predicate.',
    example: 'She left when he arrived [advcl].',
    color: '#FD79A8'
  },
  'advmod': {
    label: 'Adverbial Modifier',
    description: 'An adverbial modifier is a word that modifies a verb or other predicate.',
    example: 'He runs very [advmod] fast.',
    color: '#FDCB6E'
  },
  'discourse': {
    label: 'Discourse Element',
    description: 'Discourse elements are interjections and other particles that are not clearly linked to the structure of the sentence.',
    example: 'Well [discourse], that was unexpected.',
    color: '#E17055'
  },
  'aux': {
    label: 'Auxiliary',
    description: 'An auxiliary is a function word that accompanies the main verb of a verb phrase.',
    example: 'She has [aux] gone.',
    color: '#74B9FF'
  },
  'aux:pass': {
    label: 'Passive Auxiliary',
    description: 'A passive auxiliary is an auxiliary used in a passive construction.',
    example: 'The book was [aux:pass] read.',
    color: '#A29BFE'
  },
  'cop': {
    label: 'Copula',
    description: 'A copula is a linking verb that links a subject to its complement.',
    example: 'She is [cop] happy.',
    color: '#6C5CE7'
  },
  'mark': {
    label: 'Marker',
    description: 'A marker is a word that introduces a finite clause subordinate to another clause.',
    example: 'She says that [mark] you are right.',
    color: '#00B894'
  },
  
  // Nominal dependents
  'nmod': {
    label: 'Nominal Modifier',
    description: 'A nominal modifier is a nominal dependent of another noun or noun phrase.',
    example: 'The office of the chair [nmod].',
    color: '#00CEC9'
  },
  'appos': {
    label: 'Appositional Modifier',
    description: 'An appositional modifier is a nominal that is in apposition to another nominal.',
    example: 'Sam, my brother [appos], arrived.',
    color: '#81ECEC'
  },
  'nummod': {
    label: 'Numeric Modifier',
    description: 'A numeric modifier is a numeral that modifies a noun.',
    example: 'I have three [nummod] cats.',
    color: '#55EFC4'
  },
  'acl': {
    label: 'Clausal Modifier of Noun',
    description: 'A clausal modifier of a noun is a clause that modifies a noun.',
    example: 'The man who left [acl] was my friend.',
    color: '#00D2D3'
  },
  'amod': {
    label: 'Adjectival Modifier',
    description: 'An adjectival modifier is an adjective or adjective phrase that modifies a noun.',
    example: 'The big [amod] house.',
    color: '#FEA47F'
  },
  'det': {
    label: 'Determiner',
    description: 'A determiner is a word that modifies a noun or noun phrase and expresses definiteness, quantity, or other characteristics.',
    example: 'The [det] book is interesting.',
    color: '#F8B195'
  },
  'clf': {
    label: 'Classifier',
    description: 'A classifier is a word that appears in various languages to classify the noun by its shape or function.',
    example: 'Three head [clf] of cattle.',
    color: '#C44569'
  },
  'case': {
    label: 'Case Marking',
    description: 'Case marking is typically a preposition or postposition that marks the relationship of a nominal to another word.',
    example: 'He lives in [case] Paris.',
    color: '#F8EFBA'
  },
  
  // Coordination
  'conj': {
    label: 'Conjunct',
    description: 'A conjunct is the relation between two elements connected by a coordinating conjunction.',
    example: 'Bill is honest and [conj] reliable.',
    color: '#58B19F'
  },
  'cc': {
    label: 'Coordinating Conjunction',
    description: 'A coordinating conjunction is a word that links words or larger constituents without subordinating one to the other.',
    example: 'Bill is honest and [cc] reliable.',
    color: '#2C7873'
  },
  
  // MWE (Multi-Word Expressions)
  'fixed': {
    label: 'Fixed Multiword Expression',
    description: 'A fixed multiword expression is a group of words that together function as a single unit.',
    example: 'As well as [fixed].',
    color: '#D6A2E8'
  },
  'flat': {
    label: 'Flat Multiword Expression',
    description: 'A flat multiword expression is used for names and other expressions where the internal structure is not clear.',
    example: 'New York [flat] City.',
    color: '#B8E994'
  },
  'compound': {
    label: 'Compound',
    description: 'A compound is a word that combines with another word to form a single semantic unit.',
    example: 'Phone book [compound].',
    color: '#78E08F'
  },
  
  // Other
  'list': {
    label: 'List',
    description: 'The list relation is used for items in a list.',
    example: 'Ingredients: 1. flour [list] 2. sugar [list].',
    color: '#B8B8B8'
  },
  'parataxis': {
    label: 'Parataxis',
    description: 'Parataxis is a relation between two clauses that are loosely connected.',
    example: 'The dog barked; the cat meowed [parataxis].',
    color: '#95A5A6'
  },
  'orphan': {
    label: 'Orphan',
    description: 'The orphan relation is used for words that appear in coordination structures but lack an overt coordinator.',
    example: 'Mary won silver and John bronze [orphan].',
    color: '#7F8C8D'
  },
  'goeswith': {
    label: 'Goes With',
    description: 'The goeswith relation is used for words that are split across tokens.',
    example: 'He under [goeswith] stands the problem.',
    color: '#34495E'
  },
  'reparandum': {
    label: 'Reparandum',
    description: 'A reparandum is an overridden or repeated word in speech.',
    example: 'Go to the righ- [reparandum] left.',
    color: '#2C3E50'
  },
  
  // Special
  'punct': {
    label: 'Punctuation',
    description: 'This is used for punctuation marks.',
    example: 'Hello [punct] .',
    color: '#636E72'
  },
  'ROOT': {
    label: 'Root',
    description: 'The root of a sentence is the main verb or predicate that governs the entire sentence structure.',
    example: 'ROOT -> The cat sleeps [ROOT].',
    color: '#2D3436'
  },
  'dep': {
    label: 'Unspecified Dependency',
    description: 'A dependency that cannot be determined with certainty.',
    example: 'Various unclear relationships.',
    color: '#95A5A6'
  }
}

/**
 * Get a dependency label description
 * @param {string} label - The dependency label
 * @returns {Object} Label information including description
 */
export function getDependencyLabelInfo(label) {
  const info = DEPENDENCY_LABELS[label]
  if (info) {
    return info
  }
  
  // Return default for unknown labels
  return {
    label: label,
    description: 'Unknown dependency relation.',
    example: 'N/A',
    color: '#95A5A6'
  }
}

/**
 * Get all dependency labels
 * @returns {Array} Array of all dependency label keys
 */
export function getAllDependencyLabels() {
  return Object.keys(DEPENDENCY_LABELS)
}

/**
 * Get a color for a dependency label
 * @param {string} label - The dependency label
 * @returns {string} Hex color code
 */
export function getDependencyColor(label) {
  const info = DEPENDENCY_LABELS[label]
  if (info && info.color) {
    return info.color
  }
  return '#95A5A6' // Default gray
}
