import { describe, it, expect } from 'vitest'
import { 
  getDependencyLabelInfo, 
  getAllDependencyLabels, 
  getDependencyColor,
  DEPENDENCY_LABELS 
} from '../utils/dependencyLabels'

describe('Dependency Labels', () => {
  describe('DEPENDENCY_LABELS', () => {
    it('should have label definitions', () => {
      expect(DEPENDENCY_LABELS).toBeDefined()
      expect(Object.keys(DEPENDENCY_LABELS).length).toBeGreaterThan(0)
    })

    it('should have required fields for each label', () => {
      Object.values(DEPENDENCY_LABELS).forEach((value) => {
        expect(value).toHaveProperty('label')
        expect(value).toHaveProperty('description')
        expect(value).toHaveProperty('example')
        expect(value).toHaveProperty('color')
        
        expect(typeof value.label).toBe('string')
        expect(typeof value.description).toBe('string')
        expect(typeof value.example).toBe('string')
        expect(typeof value.color).toBe('string')
        
        // Color should be a hex code
        expect(value.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })

    it('should include common dependency labels', () => {
      const commonLabels = ['nsubj', 'obj', 'det', 'amod', 'advmod', 'aux', 'ROOT']
      
      commonLabels.forEach(label => {
        expect(DEPENDENCY_LABELS).toHaveProperty(label)
      })
    })

    it('should have non-empty descriptions', () => {
      Object.values(DEPENDENCY_LABELS).forEach(labelInfo => {
        expect(labelInfo.description.length).toBeGreaterThan(10)
      })
    })

    it('should have non-empty examples', () => {
      Object.values(DEPENDENCY_LABELS).forEach(labelInfo => {
        expect(labelInfo.example.length).toBeGreaterThan(3)
      })
    })
  })

  describe('getDependencyLabelInfo', () => {
    it('should return info for valid labels', () => {
      const info = getDependencyLabelInfo('nsubj')
      
      expect(info).toBeDefined()
      expect(info.label).toBe('Nominal Subject')
      expect(info.description).toContain('syntactic subject')
      expect(info.color).toBeDefined()
    })

    it('should return info for ROOT', () => {
      const info = getDependencyLabelInfo('ROOT')
      
      expect(info).toBeDefined()
      expect(info.label).toBe('Root')
      expect(info.description).toContain('root')
    })

    it('should return default info for unknown labels', () => {
      const info = getDependencyLabelInfo('unknown_label')
      
      expect(info).toBeDefined()
      expect(info.label).toBe('unknown_label')
      expect(info.description).toContain('Unknown')
      expect(info.color).toBeDefined()
    })

    it('should handle various dependency labels', () => {
      const labels = ['det', 'amod', 'obj', 'advmod', 'aux', 'case']
      
      labels.forEach(label => {
        const info = getDependencyLabelInfo(label)
        expect(info).toBeDefined()
        expect(info.label).toBeTruthy()
        expect(info.description).toBeTruthy()
      })
    })
  })

  describe('getAllDependencyLabels', () => {
    it('should return array of all labels', () => {
      const labels = getAllDependencyLabels()
      
      expect(Array.isArray(labels)).toBe(true)
      expect(labels.length).toBeGreaterThan(0)
    })

    it('should include standard UD labels', () => {
      const labels = getAllDependencyLabels()
      
      expect(labels).toContain('nsubj')
      expect(labels).toContain('obj')
      expect(labels).toContain('det')
      expect(labels).toContain('ROOT')
    })

    it('should return unique labels', () => {
      const labels = getAllDependencyLabels()
      const uniqueLabels = [...new Set(labels)]
      
      expect(labels.length).toBe(uniqueLabels.length)
    })
  })

  describe('getDependencyColor', () => {
    it('should return color for valid labels', () => {
      const color = getDependencyColor('nsubj')
      
      expect(color).toBeDefined()
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    it('should return default color for unknown labels', () => {
      const color = getDependencyColor('unknown_label')
      
      expect(color).toBeDefined()
      expect(color).toBe('#95A5A6') // Default gray
    })

    it('should return different colors for different labels', () => {
      const colors = new Set()
      
      const labels = ['nsubj', 'obj', 'det', 'amod', 'advmod']
      labels.forEach(label => {
        colors.add(getDependencyColor(label))
      })
      
      // Should have multiple different colors (not all the same)
      expect(colors.size).toBeGreaterThan(1)
    })

    it('should handle all defined labels', () => {
      const labels = getAllDependencyLabels()
      
      labels.forEach(label => {
        const color = getDependencyColor(label)
        expect(color).toBeDefined()
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })
  })

  describe('Specific Label Definitions', () => {
    it('should have correct nsubj definition', () => {
      const info = getDependencyLabelInfo('nsubj')
      
      expect(info.label).toBe('Nominal Subject')
      expect(info.description).toContain('subject')
    })

    it('should have correct obj definition', () => {
      const info = getDependencyLabelInfo('obj')
      
      expect(info.label).toBe('Direct Object')
      expect(info.description).toContain('object')
    })

    it('should have correct det definition', () => {
      const info = getDependencyLabelInfo('det')
      
      expect(info.label).toBe('Determiner')
      expect(info.description).toContain('determiner')
    })

    it('should have correct amod definition', () => {
      const info = getDependencyLabelInfo('amod')
      
      expect(info.label).toBe('Adjectival Modifier')
      expect(info.description).toContain('adjective')
    })

    it('should have correct ROOT definition', () => {
      const info = getDependencyLabelInfo('ROOT')
      
      expect(info.label).toBe('Root')
      expect(info.description).toContain('root')
    })
  })

  describe('Label Coverage', () => {
    it('should cover core argument labels', () => {
      const coreLabels = ['nsubj', 'obj', 'iobj', 'csubj', 'ccomp', 'xcomp']
      
      coreLabels.forEach(label => {
        expect(DEPENDENCY_LABELS).toHaveProperty(label)
      })
    })

    it('should cover non-core dependent labels', () => {
      const nonCoreLabels = ['obl', 'vocative', 'expl', 'dislocated', 'advcl', 'advmod', 'discourse', 'aux', 'cop', 'mark']
      
      nonCoreLabels.forEach(label => {
        expect(DEPENDENCY_LABELS).toHaveProperty(label)
      })
    })

    it('should cover nominal dependent labels', () => {
      const nominalLabels = ['nmod', 'appos', 'nummod', 'acl', 'amod', 'det', 'case']
      
      nominalLabels.forEach(label => {
        expect(DEPENDENCY_LABELS).toHaveProperty(label)
      })
    })

    it('should cover coordination labels', () => {
      const coordLabels = ['conj', 'cc']
      
      coordLabels.forEach(label => {
        expect(DEPENDENCY_LABELS).toHaveProperty(label)
      })
    })

    it('should cover MWE labels', () => {
      const mweLabels = ['fixed', 'flat', 'compound']
      
      mweLabels.forEach(label => {
        expect(DEPENDENCY_LABELS).toHaveProperty(label)
      })
    })

    it('should cover special labels', () => {
      const specialLabels = ['punct', 'ROOT', 'dep']
      
      specialLabels.forEach(label => {
        expect(DEPENDENCY_LABELS).toHaveProperty(label)
      })
    })
  })
})
