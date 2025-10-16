import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DependencyTreeVisualization from '../components/DependencyTreeVisualization'

describe('DependencyTreeVisualization Component', () => {
  const mockSentences = [
    {
      sentence: 'The cat sleeps.',
      nodes: [
        { id: 'ROOT', label: 'ROOT', pos: 'ROOT', value: 2 },
        { id: 'The_0', label: 'The', pos: 'DET', value: 1, dep: 'det' },
        { id: 'cat_1', label: 'cat', pos: 'NOUN', value: 1, dep: 'nsubj' },
        { id: 'sleeps_2', label: 'sleeps', pos: 'VERB', value: 1, dep: 'ROOT' }
      ],
      edges: [
        { source: 'cat_1', target: 'The_0', label: 'det', value: 1, color: '#F8B195' },
        { source: 'ROOT', target: 'cat_1', label: 'nsubj', value: 1, color: '#FF6B6B' },
        { source: 'ROOT', target: 'sleeps_2', label: 'ROOT', value: 1, color: '#2D3436' }
      ],
      tokens: [
        { text: 'The', pos: 'DET', dep: 'det', head: 1, idx: 0 },
        { text: 'cat', pos: 'NOUN', dep: 'nsubj', head: 2, idx: 1 },
        { text: 'sleeps', pos: 'VERB', dep: 'ROOT', head: -1, idx: 2 }
      ]
    },
    {
      sentence: 'The dog barks.',
      nodes: [
        { id: 'ROOT', label: 'ROOT', pos: 'ROOT', value: 2 },
        { id: 'The_0', label: 'The', pos: 'DET', value: 1, dep: 'det' },
        { id: 'dog_1', label: 'dog', pos: 'NOUN', value: 1, dep: 'nsubj' },
        { id: 'barks_2', label: 'barks', pos: 'VERB', value: 1, dep: 'ROOT' }
      ],
      edges: [
        { source: 'dog_1', target: 'The_0', label: 'det', value: 1, color: '#F8B195' },
        { source: 'ROOT', target: 'dog_1', label: 'nsubj', value: 1, color: '#FF6B6B' },
        { source: 'ROOT', target: 'barks_2', label: 'ROOT', value: 1, color: '#2D3436' }
      ],
      tokens: [
        { text: 'The', pos: 'DET', dep: 'det', head: 1, idx: 0 },
        { text: 'dog', pos: 'NOUN', dep: 'nsubj', head: 2, idx: 1 },
        { text: 'barks', pos: 'VERB', dep: 'ROOT', head: -1, idx: 2 }
      ]
    }
  ]

  describe('Rendering', () => {
    it('should render without crashing with empty sentences', () => {
      render(<DependencyTreeVisualization sentences={[]} />)
      expect(screen.getByText(/No dependency parse data available/i)).toBeTruthy()
    })

    it('should render sentence selector when sentences provided', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      expect(screen.getByLabelText(/Select Sentence to Visualize/i)).toBeTruthy()
    })

    it('should display correct number of sentences in selector', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      const selector = screen.getByRole('combobox')
      const options = selector.querySelectorAll('option')
      
      expect(options.length).toBe(mockSentences.length)
    })

    it('should display sentence count info', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      expect(screen.getByText(/Showing sentence 1 of 2/i)).toBeTruthy()
    })

    it('should display current sentence text', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      const allMatches = screen.getAllByText(/The cat sleeps\./i)
      expect(allMatches.length).toBeGreaterThan(0)
    })

    it('should render legend section', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      expect(screen.getByText(/Common Dependency Relations/i)).toBeTruthy()
    })

    it('should display legend items', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      
      expect(screen.getByText(/nsubj:/i)).toBeTruthy()
      expect(screen.getByText(/Nominal Subject/i)).toBeTruthy()
      expect(screen.getByText(/obj:/i)).toBeTruthy()
      expect(screen.getByText(/Direct Object/i)).toBeTruthy()
    })

    it('should show hover instruction', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      expect(screen.getByText(/Hover over edge labels/i)).toBeTruthy()
    })
  })

  describe('Props Handling', () => {
    it('should handle undefined sentences prop', () => {
      render(<DependencyTreeVisualization />)
      expect(screen.getByText(/No dependency parse data available/i)).toBeTruthy()
    })

    it('should handle custom width and height', () => {
      const { container } = render(
        <DependencyTreeVisualization 
          sentences={mockSentences} 
          width={1000} 
          height={600} 
        />
      )
      
      const svg = container.querySelector('svg')
      if (svg) {
        // SVG should be responsive with viewBox
        expect(svg.getAttribute('width')).toBe('100%')
        expect(svg.getAttribute('height')).toBe('100%')
        expect(svg.getAttribute('viewBox')).toBe('0 0 1000 600')
      }
    })

    it('should use default dimensions when not provided', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      const svg = container.querySelector('svg')
      if (svg) {
        // SVG should be responsive with viewBox containing default dimensions
        expect(svg.getAttribute('width')).toBe('100%')
        expect(svg.getAttribute('height')).toBe('100%')
        expect(svg.getAttribute('viewBox')).toBeDefined()
        expect(svg.getAttribute('viewBox')).toContain('0 0')
      }
    })
  })

  describe('Sentence Selection', () => {
    it('should default to first sentence', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      const allMatches = screen.getAllByText(/The cat sleeps\./i)
      expect(allMatches.length).toBeGreaterThan(0)
    })

    it('should truncate long sentence text in selector', () => {
      const longSentences = [{
        sentence: 'This is a very long sentence that should be truncated in the selector to prevent UI overflow issues.',
        nodes: [{ id: 'ROOT', label: 'ROOT', pos: 'ROOT', value: 2 }],
        edges: [],
        tokens: []
      }]
      
      const { container } = render(<DependencyTreeVisualization sentences={longSentences} />)
      const option = container.querySelector('option')
      
      if (option) {
        expect(option.textContent.length).toBeLessThan(70)
        expect(option.textContent).toContain('...')
      }
    })
  })

  describe('Visualization Elements', () => {
    it('should create SVG element', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('should handle sentences with no nodes gracefully', () => {
      const emptySentences = [{
        sentence: 'Empty',
        nodes: [],
        edges: [],
        tokens: []
      }]
      
      const { container } = render(
        <DependencyTreeVisualization sentences={emptySentences} />
      )
      
      // Should render without crashing
      expect(container).toBeTruthy()
    })

    it('should handle sentences with no edges gracefully', () => {
      const noEdgeSentences = [{
        sentence: 'Test',
        nodes: [
          { id: 'ROOT', label: 'ROOT', pos: 'ROOT', value: 2 },
          { id: 'test_0', label: 'test', pos: 'NOUN', value: 1 }
        ],
        edges: [],
        tokens: []
      }]
      
      const { container } = render(
        <DependencyTreeVisualization sentences={noEdgeSentences} />
      )
      
      // Should render without crashing
      expect(container).toBeTruthy()
    })
  })

  describe('CSS Classes', () => {
    it('should apply correct container class', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      expect(container.querySelector('.dependency-tree-container')).toBeTruthy()
    })

    it('should apply correct controls class', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      expect(container.querySelector('.dependency-tree-controls')).toBeTruthy()
    })

    it('should apply correct legend class', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      expect(container.querySelector('.dependency-legend')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have labeled select element', () => {
      render(<DependencyTreeVisualization sentences={mockSentences} />)
      
      const select = screen.getByRole('combobox')
      expect(select).toBeTruthy()
      expect(select.id).toBe('sentence-selector')
    })

    it('should have meaningful option values', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      const options = container.querySelectorAll('option')
      options.forEach((option, idx) => {
        expect(option.value).toBe(String(idx))
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle single sentence', () => {
      const singleSentence = [mockSentences[0]]
      render(<DependencyTreeVisualization sentences={singleSentence} />)
      
      expect(screen.getByText(/Showing sentence 1 of 1/i)).toBeTruthy()
    })

    it('should handle many sentences', () => {
      const manySentences = Array(100).fill(mockSentences[0])
      render(<DependencyTreeVisualization sentences={manySentences} />)
      
      const selector = screen.getByRole('combobox')
      const options = selector.querySelectorAll('option')
      
      expect(options.length).toBe(100)
    })

    it('should handle sentences with special characters', () => {
      const specialSentences = [{
        sentence: 'She said, "Hello!" & smiled.',
        nodes: [{ id: 'ROOT', label: 'ROOT', pos: 'ROOT', value: 2 }],
        edges: [],
        tokens: []
      }]
      
      render(<DependencyTreeVisualization sentences={specialSentences} />)
      const allMatches = screen.getAllByText(/She said, "Hello!" & smiled\./i)
      expect(allMatches.length).toBeGreaterThan(0)
    })
  })

  describe('Legend Information', () => {
    it('should display legend colors', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      const legendColors = container.querySelectorAll('.legend-color')
      expect(legendColors.length).toBeGreaterThan(0)
    })

    it('should display legend items in grid', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      const legendGrid = container.querySelector('.legend-grid')
      expect(legendGrid).toBeTruthy()
    })

    it('should display legend note', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      const legendNote = container.querySelector('.legend-note')
      expect(legendNote).toBeTruthy()
    })
  })

  describe('Component Structure', () => {
    it('should have proper nested structure', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      const treeContainer = container.querySelector('.dependency-tree-container')
      const controls = treeContainer.querySelector('.dependency-tree-controls')
      const vizWrapper = treeContainer.querySelector('.dependency-tree-viz-wrapper')
      const sentenceDisplay = treeContainer.querySelector('.sentence-display')
      const legend = treeContainer.querySelector('.dependency-legend')
      
      expect(treeContainer).toBeTruthy()
      expect(controls).toBeTruthy()
      expect(vizWrapper).toBeTruthy()
      expect(sentenceDisplay).toBeTruthy()
      expect(legend).toBeTruthy()
    })
    
    it('should render zoom control buttons', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      // Check for zoom controls
      const zoomControls = container.querySelector('.dependency-tree-zoom-controls')
      expect(zoomControls).toBeTruthy()
      
      // Check for control buttons
      const buttons = container.querySelectorAll('.control-btn')
      expect(buttons.length).toBeGreaterThan(0)
    })
    
    it('should render minimap', () => {
      const { container } = render(
        <DependencyTreeVisualization sentences={mockSentences} />
      )
      
      // Check for minimap
      const minimap = container.querySelector('.dependency-tree-minimap')
      expect(minimap).toBeTruthy()
    })
  })
})
