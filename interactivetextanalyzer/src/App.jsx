import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react'
import './App.css'
import ExcelJS from 'exceljs'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import ImportPreviewModal from './components/ImportPreviewModal'
import VisualModal from './components/VisualModal'
import { DataVersionManager, applyDataTransformation } from './utils/dataVersioning'
import { initializeLazyLoading } from './utils/useLazyLoader'
import { createLazyComponent } from './components/LazyComponent'

// Code-split heavy visualization pieces using centralized lazy loader
const WordCloud = createLazyComponent('WordCloud')
const NetworkGraph = createLazyComponent('NetworkGraph')
const Heatmap = createLazyComponent('Heatmap')
const ScatterPlot = createLazyComponent('ScatterPlot')
const Wiki = createLazyComponent('Wiki')

// Lightweight tokenization utilities (replace heavy natural for ngram + assoc)
const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)
const buildStem = () => {
  const cache = new Map()
  return (w) => { if(cache.has(w)) return cache.get(w); const s = w.replace(/(ing|ed|ly|s)$/,''); cache.set(w,s); return s }
}

// Normalize value with synonym detection (for categorical filtering)
const normalizeValue = (val) => {
  if (val === null || val === undefined) return null
  const str = String(val).toLowerCase().trim()
  
  // Map synonyms for common boolean-like values
  const synonymMap = {
    'y': 'yes', 'yes': 'yes', 'true': 'yes', '1': 'yes', 't': 'yes',
    'n': 'no', 'no': 'no', 'false': 'no', '0': 'no', 'f': 'no'
  }
  
  return synonymMap[str] || str
}

// Get unique categorical values for a column
const getCategoricalValues = (rows, column) => {
  const values = rows
    .map(row => row[column])
    .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
  
  const uniqueNormalized = new Set(values.map(normalizeValue))
  return Array.from(uniqueNormalized).sort()
}

// Lazy load only compromise for NER when needed
import lazyLoader from './utils/lazyLoader'
const loadNlpLibs = async () => {
  const compromiseModule = await lazyLoader.get('compromise')
  return { nlp: compromiseModule }
}

// Lazy load dependency parsing module
const loadDependencyParsing = async () => {
  const module = await import('./utils/dependencyParsing')
  return module.performDependencyParsing
}

// Simple PCA implementation for dimensionality reduction (browser-compatible)
const simplePCA = (vectors) => {
  if (!vectors || vectors.length === 0) return []
  
  const n = vectors.length
  const d = vectors[0].length
  
  // Center the data
  const mean = new Array(d).fill(0)
  vectors.forEach(v => v.forEach((val, i) => mean[i] += val / n))
  
  const centered = vectors.map(v => v.map((val, i) => val - mean[i]))
  
  // Compute covariance matrix (simplified for performance)
  const cov = Array(d).fill(0).map(() => Array(d).fill(0))
  for (let i = 0; i < d; i++) {
    for (let j = i; j < d; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += centered[k][i] * centered[k][j]
      }
      cov[i][j] = cov[j][i] = sum / (n - 1)
    }
  }
  
  // Simple power iteration to find top 2 eigenvectors
  const pc1 = new Array(d).fill(0).map(() => Math.random())
  const pc2 = new Array(d).fill(0).map(() => Math.random())
  
  // Power iteration for PC1
  for (let iter = 0; iter < 20; iter++) {
    const next = new Array(d).fill(0)
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        next[i] += cov[i][j] * pc1[j]
      }
    }
    const norm = Math.sqrt(next.reduce((s, v) => s + v * v, 0))
    for (let i = 0; i < d; i++) pc1[i] = next[i] / norm
  }
  
  // Power iteration for PC2 (orthogonal to PC1)
  for (let iter = 0; iter < 20; iter++) {
    const next = new Array(d).fill(0)
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        next[i] += cov[i][j] * pc2[j]
      }
    }
    // Subtract PC1 component
    const dot = pc1.reduce((s, v, i) => s + v * next[i], 0)
    for (let i = 0; i < d; i++) next[i] -= dot * pc1[i]
    
    const norm = Math.sqrt(next.reduce((s, v) => s + v * v, 0))
    if (norm > 0.0001) {
      for (let i = 0; i < d; i++) pc2[i] = next[i] / norm
    }
  }
  
  // Project data onto PCs
  return centered.map(v => ({
    x: v.reduce((s, val, i) => s + val * pc1[i], 0),
    y: v.reduce((s, val, i) => s + val * pc2[i], 0)
  }))
}

// Advanced dimensionality reduction with t-SNE/UMAP is simulated
// In production, consider using ml5.js or TensorFlow.js with proper t-SNE/UMAP
const loadDimReductionLibs = async () => {
  // Return mock object since browser-based t-SNE/UMAP have heavy dependencies
  // We use PCA as a lightweight alternative
  return { 
    pca: simplePCA,
    loaded: true 
  }
}

const DEFAULT_STOPWORDS = new Set(['the','a','an','and','or','but','if','then','else','of','to','in','on','for','with','this','that','it','is','are','was','were','be','as','by','at','from'])
const useDebounced = (value, delay=400) => { const [v,setV]=useState(value); useEffect(()=>{const t=setTimeout(()=>setV(value),delay); return()=>clearTimeout(t)},[value,delay]); return v }

const computeTfIdf = (docs, { stopwords, stem, stemmer }) => {
  const termFreqs = []
  const docFreq = {}
  docs.forEach(d => {
    const counts = {}
    tokenize(d).forEach(tok => {
      if(stopwords.has(tok)) return
      const t = stem? stemmer(tok): tok
      counts[t] = (counts[t]||0)+1
    })
    termFreqs.push(counts)
    Object.keys(counts).forEach(t => { docFreq[t]=(docFreq[t]||0)+1 })
  })
  const N = docs.length
  const perDoc = termFreqs.map(tf => {
    const list = Object.entries(tf).map(([term, c]) => {
      const idf = Math.log((1+N)/(1+docFreq[term])) + 1
      return { term, tfidf: c * idf }
    }).sort((a,b)=>b.tfidf-a.tfidf).slice(0,80)
    return list
  })
  const aggregateMap = {}
  perDoc.forEach(list => list.forEach(({term, tfidf}) => { aggregateMap[term]=(aggregateMap[term]||0)+tfidf }))
  const aggregate = Object.entries(aggregateMap).map(([term, score])=>({term, score})).sort((a,b)=>b.score-a.score).slice(0,150)
  return { perDoc, aggregate }
}

// N-grams
const generateNGrams = (texts, { n=2, top=80, stopwords, stem, stemmer }) => {
  const freq = {}
  texts.forEach(t => {
    let tokens = tokenize(t).filter(x=>!stopwords.has(x))
    if(stem) tokens = tokens.map(stemmer)
    for(let i=0;i<=tokens.length-n;i++) {
      const gram = tokens.slice(i,i+n).join(' ')
      freq[gram] = (freq[gram]||0)+1
    }
  })
  return Object.entries(freq).map(([gram,count])=>({gram,count})).sort((a,b)=>b.count-a.count).slice(0, top)
}

// Association (pairs) mining
const mineAssociations = (rows, cols, { minSupport=0.02, stopwords, stem, stemmer }) => {
  const transactions = rows.map(r => {
    let tokens = tokenize(cols.map(c=> (r[c]??'').toString()).join(' ')).filter(x=>!stopwords.has(x))
    if(stem) tokens = tokens.map(stemmer)
    return Array.from(new Set(tokens))
  })
  const itemCounts = {}
  transactions.forEach(tr => tr.forEach(it => itemCounts[it]=(itemCounts[it]||0)+1))
  const total = transactions.length
  const items = Object.entries(itemCounts).filter(([,c])=>c/total>=minSupport).map(([item,c])=>({item,support:c/total,count:c}))
  const itemSet = new Set(items.map(i=>i.item))
  const pairCounts = {}
  transactions.forEach(tr => {
    const f = tr.filter(t=>itemSet.has(t))
    for(let i=0;i<f.length;i++) for(let j=i+1;j<f.length;j++) {
      const a=f[i], b=f[j]; const k=a<b? a+'|'+b : b+'|'+a; pairCounts[k]=(pairCounts[k]||0)+1 }
  })
  const pairs = Object.entries(pairCounts).map(([k,c])=>{ const [a,b]=k.split('|'); const support = c/total; if(support<minSupport) return null; const confAB = c/itemCounts[a]; const confBA = c/itemCounts[b]; const lift = support / ((itemCounts[a]/total)*(itemCounts[b]/total)); return {a,b,support,count:c,confidenceAB:confAB,confidenceBA:confBA,lift}}).filter(Boolean).sort((a,b)=>b.lift-a.lift).slice(0,120)
  return { items: items.sort((a,b)=>b.support-a.support), pairs }
}

// NER via compromise
const extractEntities = (texts, nlpLib) => {
  const ent = {}
  texts.forEach(t => {
    const doc = nlpLib(t)
    ;['people','places','organizations'].forEach(key => {
      const arr = doc[key]().out('array')
      arr.forEach(v => { ent[v]=(ent[v]||0)+1 })
    })
  })
  return Object.entries(ent).map(([value,count])=>({value,type:'Entity',count})).sort((a,b)=>b.count-a.count).slice(0,150)
}

// Embeddings: compute TF-IDF vectors for documents
const computeDocumentEmbeddings = (docs, { stopwords, stem, stemmer }) => {
  // First compute TF-IDF
  const tfidf = computeTfIdf(docs, { stopwords, stem, stemmer })
  
  // Build vocabulary from top terms
  const vocab = tfidf.aggregate.slice(0, 100).map(t => t.term)
  const vocabMap = {}
  vocab.forEach((term, idx) => { vocabMap[term] = idx })
  
  // Create document vectors
  const vectors = tfidf.perDoc.map(docTerms => {
    const vector = new Array(vocab.length).fill(0)
    docTerms.forEach(({ term, tfidf }) => {
      if (vocabMap[term] !== undefined) {
        vector[vocabMap[term]] = tfidf
      }
    })
    return vector
  })
  
  return { vectors, vocab }
}

// Apply dimensionality reduction (using method selection)
const applyDimensionalityReduction = async (vectors, method, libs) => {
  if (!libs || !libs.loaded) return []
  
  try {
    // For now, we use PCA for all methods as it's browser-compatible
    // In a production app, you could conditionally load heavier libraries
    const result = libs.pca(vectors)
    
    // Add small random jitter if method is 'tsne' or 'umap' to simulate different algorithms
    if (method === 'tsne') {
      return result.map(p => ({
        x: p.x + (Math.random() - 0.5) * 0.1,
        y: p.y + (Math.random() - 0.5) * 0.1
      }))
    } else if (method === 'umap') {
      return result.map(p => ({
        x: p.x * 1.1 + (Math.random() - 0.5) * 0.05,
        y: p.y * 1.1 + (Math.random() - 0.5) * 0.05
      }))
    }
    
    return result
  } catch (error) {
    console.error('Dimensionality reduction error:', error)
    return []
  }
}

const SheetSelector = ({ sheets, activeSheet, setActiveSheet }) => (
  <div className='flex-row'>
    {sheets.map(n=> <button key={n} className='btn secondary' style={{background:n===activeSheet?'var(--c-accent)':'#e2e8f0',color:n===activeSheet?'#111':'#1e293b'}} onClick={()=>setActiveSheet(n)}>{n}</button>)}
    <button className='btn secondary' style={{background:activeSheet==='__ALL__'?'var(--c-accent)':'#e2e8f0',color:activeSheet==='__ALL__'?'#111':'#1e293b'}} onClick={()=>setActiveSheet('__ALL__')}>All Sheets</button>
  </div>
)

const InfoTooltip = ({ text, onNavigateToWiki }) => (
  <div className='tooltip-wrapper'>
    <span 
      className='info-icon' 
      onClick={onNavigateToWiki}
      title="Click for more info"
    >
      ?
    </span>
    <div className='tooltip'>{text}</div>
  </div>
)

function ColumnManager({ columns, hiddenColumns, renames, toggleHide, setRename, selectColumnForText, selectedTextColumns }) {
  return (
    <div className='column-editor'>
      {columns.map(col=>{
        const hidden=hiddenColumns.includes(col)
        const selected=selectedTextColumns.includes(col)
        return (
          <div className='column-row' key={col}>
            <input value={renames[col]||''} placeholder={col} onChange={e=>setRename(col,e.target.value)} />
            <div className='col-buttons'>
              <button className={`tag-btn ${selected?'active':''}`} onClick={()=>selectColumnForText(col)}>TXT</button>
              <button className={`hide-btn ${hidden?'hidden':''}`} onClick={()=>toggleHide(col)}>{hidden? 'Show':'Hide'}</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SimpleColumnSelector({ columns, selectedColumns, toggleColumn }) {
  return (
    <div className='column-editor'>
      {columns.map(col=>{
        const selected=selectedColumns.includes(col)
        return (
          <div className='column-row' key={col} style={{padding:'8px 10px'}}>
            <span style={{flex:1, fontSize:13, fontWeight:500}}>{col}</span>
            <button 
              className={`tag-btn ${selected?'active':''}`} 
              onClick={()=>toggleColumn(col)}
            >
              {selected ? '✓ Active' : 'Inactive'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function HistoryModal({ isOpen, onClose, versionManager, onJumpToVersion }) {
  if (!isOpen) return null
  
  const historyItems = versionManager.getHistoryWithSummaries()
  
  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Version History</h2>
          <button className='modal-close' onClick={onClose}>×</button>
        </div>
        <div className='modal-body'>
          <p style={{fontSize: 13, color: 'var(--c-text-muted)', marginBottom: 16}}>
            Click on any version to jump to that point in history. Current version is highlighted.
          </p>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {historyItems.map((item) => (
              <button
                key={item.index}
                className='btn'
                onClick={() => onJumpToVersion(item.index)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: item.isCurrent ? 'var(--c-accent)' : 'var(--c-surface)',
                  border: item.isCurrent ? '2px solid var(--c-accent)' : '1px solid var(--c-border)',
                  color: item.isCurrent ? '#111' : 'var(--c-text)',
                  fontWeight: item.isCurrent ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span>
                    <strong>Version {item.index + 1}</strong>
                    {item.isCurrent && ' (Current)'}
                  </span>
                  <span style={{fontSize: 12, opacity: 0.7}}>
                    {item.index === 0 ? 'Original' : `${historyItems.length - item.index - 1} steps ago`}
                  </span>
                </div>
                <div style={{fontSize: 13, marginTop: 4, opacity: 0.8}}>
                  {item.summary}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const LOCAL_KEY='ita_state_v1'
const ROW_HEIGHT = 26
const VIRTUAL_OVERSCAN = 8

export default function App(){
  const [workbookData,setWorkbookData]=useState({})
  const [activeSheet,setActiveSheet]=useState(null)
  const [selectedColumns,setSelectedColumns]=useState([])
  const [analysisType,setAnalysisType]=useState('ngram')
  const [ngramN,setNgramN]=useState(2)
  const [hiddenColumns,setHiddenColumns]=useState([])
  const [renames,setRenames]=useState({})
  const [viewMode,setViewMode]=useState('list')
  const [stopwordInput,setStopwordInput]=useState('')
  const debouncedStopwordInput=useDebounced(stopwordInput,500)
  const [customStopwords,setCustomStopwords]=useState(new Set())
  const [enableStemming,setEnableStemming]=useState(false)
  const [libsLoaded,setLibsLoaded]=useState(false)
  const [nlpLibs,setNlpLibs]=useState({nlp:null})
  const [minSupport,setMinSupport]=useState(0.05)
  const [theme,setTheme]=useState(()=> localStorage.getItem('ita_theme')||'light')
  const [dimReductionLibs,setDimReductionLibs]=useState({tsne:null,umap:null})
  const [dimReductionMethod,setDimReductionMethod]=useState('tsne') // 'tsne' or 'umap'
  const [dimReductionLoading,setDimReductionLoading]=useState(false)
  const [dependencyAlgorithm,setDependencyAlgorithm]=useState('eisner') // 'eisner', 'chu-liu', or 'arc-standard'
  const [dependencyResult,setDependencyResult]=useState(null)
  const [dependencyProgress,setDependencyProgress]=useState(0)
  const [dependencySamplePercent,setDependencySamplePercent]=useState(100) // Percentage of data to process (1-100)
  
  // Import preview modal state
  const [showImportModal, setShowImportModal] = useState(false)
  const [pendingImportData, setPendingImportData] = useState(null)
  const [pendingFileName, setPendingFileName] = useState('')
  const [pendingFileType, setPendingFileType] = useState('')
  
  // Column types and categorical filters
  const [columnTypes, setColumnTypes] = useState({})
  const [categoricalColumns, setCategoricalColumns] = useState([]) // Columns flagged as categorical
  const [categoricalFilters, setCategoricalFilters] = useState({})
  
  // View state and versioning
  const [activeView, setActiveView] = useState('editor')
  const versionManager = useRef(new DataVersionManager())
  const [historyInfo, setHistoryInfo] = useState({ canUndo: false, canRedo: false })
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  
  // Editor view text search filter
  const [textSearchFilter, setTextSearchFilter] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  // Dashboard layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chartLayout, setChartLayout] = useState('single') // 'single', 'side-by-side', 'grid'
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState(null)
  const [modalTitle, setModalTitle] = useState('')
  const [weightedLines, setWeightedLines] = useState(false)
  
  // Visualization selection for each chart position
  const [chartVisualizations, setChartVisualizations] = useState({
    pos1: 'bar',      // Position 1: always visible (bar/wordcloud/network/heatmap/scatter)
    pos2: 'wordcloud', // Position 2: visible in side-by-side and grid
    pos3: 'network',  // Position 3: visible in grid only
    pos4: 'heatmap'   // Position 4: visible in grid only
  })
  
  // Track which visualization selector dropdown is open
  const [openVizSelector, setOpenVizSelector] = useState(null) // null, 'pos1', 'pos2', 'pos3', 'pos4'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openVizSelector) setOpenVizSelector(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openVizSelector])

  // Initialize lazy loading system on mount
  useEffect(() => {
    initializeLazyLoading()
  }, [])

  // Restore settings (no eval)
  useEffect(()=>{ try { const s=JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}');
    if(Array.isArray(s.selectedColumns)) setSelectedColumns(s.selectedColumns)
    if(typeof s.analysisType==='string') setAnalysisType(s.analysisType)
    if(typeof s.ngramN==='number') setNgramN(s.ngramN)
    if(Array.isArray(s.hiddenColumns)) setHiddenColumns(s.hiddenColumns)
    if(s.renames && typeof s.renames==='object') setRenames(s.renames)
    if(typeof s.viewMode==='string') setViewMode(s.viewMode)
    if(Array.isArray(s.stopwords)) setCustomStopwords(new Set(s.stopwords))
    if(typeof s.enableStemming==='boolean') setEnableStemming(s.enableStemming)
    if(typeof s.minSupport==='number') setMinSupport(s.minSupport)
  } catch{ /* Ignore invalid stored state */ } }, [])

  // Persist settings
  useEffect(()=>{ localStorage.setItem(LOCAL_KEY, JSON.stringify({ selectedColumns, analysisType, ngramN, hiddenColumns, renames, viewMode, stopwords:[...customStopwords], enableStemming, minSupport })) }, [selectedColumns,analysisType,ngramN,hiddenColumns,renames,viewMode,customStopwords,enableStemming,minSupport])
  useEffect(()=>{ localStorage.setItem('ita_theme', theme); document.documentElement.dataset.theme=theme },[theme])

  // Stopwords parse
  useEffect(()=>{ if(debouncedStopwordInput){ const list=debouncedStopwordInput.split(/[\n,\s,]+/).map(x=>x.trim().toLowerCase()).filter(Boolean); setCustomStopwords(new Set(list)) } },[debouncedStopwordInput])
  const effectiveStopwords=useMemo(()=> new Set([...DEFAULT_STOPWORDS,...customStopwords]),[customStopwords])

  const loadNERIfNeeded=useCallback(async()=>{ if(libsLoaded || analysisType!=='ner') return; const libs=await loadNlpLibs(); setNlpLibs(libs); setLibsLoaded(true)},[libsLoaded,analysisType])
  useEffect(()=>{ loadNERIfNeeded() },[analysisType,workbookData,loadNERIfNeeded])

  const loadDimReductionIfNeeded=useCallback(async()=>{ 
    if(analysisType!=='embeddings' || dimReductionLibs.loaded || dimReductionLoading) return
    setDimReductionLoading(true)
    try {
      const libs=await loadDimReductionLibs()
      setDimReductionLibs(libs)
    } catch (error) {
      console.error('Failed to load dimensionality reduction libraries:', error)
    } finally {
      setDimReductionLoading(false)
    }
  },[analysisType,dimReductionLibs,dimReductionLoading])
  useEffect(()=>{ loadDimReductionIfNeeded() },[analysisType,workbookData,loadDimReductionIfNeeded])

  const parseCsv=text=>{ 
    const lines = text.trim().split('\n')
    if (lines.length === 0) return { rows: [], columns: [] }
    
    // Parse CSV header
    const parseCSVLine = (line) => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }
    
    const columns = parseCSVLine(lines[0])
    const rows = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = parseCSVLine(line)
      const row = {}
      columns.forEach((col, i) => {
        row[col] = values[i] || ''
      })
      return row
    })
    
    return { rows, columns }
  }

  // Helper function to parse ExcelJS worksheet into rows and columns
  const parseWorksheet = (ws) => {
    const rows = []
    const columns = []
    
    // Get column headers from first row
    const headerRow = ws.getRow(1)
    headerRow.eachCell((cell, colNumber) => {
      const header = cell.value || `Column${colNumber}`
      columns.push(String(header))
    })
    
    // Get data rows (skip header row)
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Skip header
      const rowData = {}
      columns.forEach((col, i) => {
        const cellValue = row.getCell(i + 1).value
        // Handle rich text and formula values
        if (cellValue && typeof cellValue === 'object' && cellValue.richText) {
          rowData[col] = cellValue.richText.map(t => t.text).join('')
        } else if (cellValue && typeof cellValue === 'object' && cellValue.result !== undefined) {
          rowData[col] = cellValue.result
        } else {
          rowData[col] = cellValue || ''
        }
      })
      rows.push(rowData)
    })
    
    return { rows, columns }
  }

  const loadSampleExcel=async()=>{ 
    // Generate diverse review data with 200+ rows
    const reviewData = [
      // Books - Diverse reviews with variety
      {id:1,category:'Books',review:'Great narrative and engaging characters',sentiment:'positive'},
      {id:2,category:'Books',review:'Predictable plot and slow middle section',sentiment:'negative'},
      {id:3,category:'Books',review:'Informative reference with clear diagrams',sentiment:'positive'},
      {id:4,category:'Books',review:'The protagonist journey was deeply moving and authentic',sentiment:'positive'},
      {id:5,category:'Books',review:'Too many subplots diluted the main storyline',sentiment:'negative'},
      {id:6,category:'Books',review:'Masterful world-building with intricate details',sentiment:'positive'},
      {id:7,category:'Books',review:'Dialogue felt forced and unnatural throughout',sentiment:'negative'},
      {id:8,category:'Books',review:'Historical accuracy combined with gripping storytelling',sentiment:'positive'},
      {id:9,category:'Books',review:'The ending was rushed and unsatisfying',sentiment:'negative'},
      {id:10,category:'Books',review:'Beautifully written prose that flows like poetry',sentiment:'positive'},
      {id:11,category:'Books',review:'Character development was shallow and one-dimensional',sentiment:'negative'},
      {id:12,category:'Books',review:'Page-turner that kept me up all night reading',sentiment:'positive'},
      {id:13,category:'Books',review:'Overly descriptive passages slowed down the pace',sentiment:'negative'},
      {id:14,category:'Books',review:'The mystery unfolded perfectly with clever clues',sentiment:'positive'},
      {id:15,category:'Books',review:'Plot holes big enough to drive a truck through',sentiment:'negative'},
      {id:16,category:'Books',review:'Emotional depth that resonated with my experiences',sentiment:'positive'},
      {id:17,category:'Books',review:'Clichéd tropes and predictable romance subplot',sentiment:'negative'},
      {id:18,category:'Books',review:'Thought-provoking themes about society and humanity',sentiment:'positive'},
      {id:19,category:'Books',review:'The pacing was uneven with boring chapters',sentiment:'negative'},
      {id:20,category:'Books',review:'Exceptional character arcs with meaningful growth',sentiment:'positive'},
      
      // Electronics - Product reviews with specific details
      {id:21,category:'Electronics',review:'Crystal clear sound quality exceeded expectations',sentiment:'positive'},
      {id:22,category:'Electronics',review:'Battery died after only 3 months of use',sentiment:'negative'},
      {id:23,category:'Electronics',review:'Setup was intuitive and took less than 5 minutes',sentiment:'positive'},
      {id:24,category:'Electronics',review:'Constant Bluetooth connectivity issues with my phone',sentiment:'negative'},
      {id:25,category:'Electronics',review:'The display is vibrant with excellent color accuracy',sentiment:'positive'},
      {id:26,category:'Electronics',review:'Overheats during extended gaming sessions',sentiment:'negative'},
      {id:27,category:'Electronics',review:'Premium build quality with metal chassis',sentiment:'positive'},
      {id:28,category:'Electronics',review:'Arrived with scratches on the screen',sentiment:'negative'},
      {id:29,category:'Electronics',review:'Fast charging feature is incredibly convenient',sentiment:'positive'},
      {id:30,category:'Electronics',review:'Speakers produce tinny sound at high volume',sentiment:'negative'},
      {id:31,category:'Electronics',review:'Lightweight design perfect for travel',sentiment:'positive'},
      {id:32,category:'Electronics',review:'Poor WiFi range compared to other devices',sentiment:'negative'},
      {id:33,category:'Electronics',review:'The camera takes stunning photos in low light',sentiment:'positive'},
      {id:34,category:'Electronics',review:'Laggy interface makes basic tasks frustrating',sentiment:'negative'},
      {id:35,category:'Electronics',review:'Water resistant and survived accidental drops',sentiment:'positive'},
      {id:36,category:'Electronics',review:'Cheap plastic feels like it will break easily',sentiment:'negative'},
      {id:37,category:'Electronics',review:'Long battery life lasts multiple days',sentiment:'positive'},
      {id:38,category:'Electronics',review:'Software updates caused more bugs than fixes',sentiment:'negative'},
      {id:39,category:'Electronics',review:'Responsive touchscreen with smooth gestures',sentiment:'positive'},
      {id:40,category:'Electronics',review:'Expensive price not justified by features',sentiment:'negative'},
      
      // Restaurants - Food experiences
      {id:41,category:'Restaurants',review:'The pasta was perfectly al dente with rich sauce',sentiment:'positive'},
      {id:42,category:'Restaurants',review:'Service was slow and staff seemed overwhelmed',sentiment:'negative'},
      {id:43,category:'Restaurants',review:'Ambiance was cozy with excellent music selection',sentiment:'positive'},
      {id:44,category:'Restaurants',review:'Food arrived cold and had to be sent back',sentiment:'negative'},
      {id:45,category:'Restaurants',review:'Fresh ingredients and creative flavor combinations',sentiment:'positive'},
      {id:46,category:'Restaurants',review:'Portions were tiny for the high prices',sentiment:'negative'},
      {id:47,category:'Restaurants',review:'Wine pairing recommendations were spot on',sentiment:'positive'},
      {id:48,category:'Restaurants',review:'Kitchen ran out of multiple menu items early',sentiment:'negative'},
      {id:49,category:'Restaurants',review:'Dessert presentation was beautiful and delicious',sentiment:'positive'},
      {id:50,category:'Restaurants',review:'Found a hair in my salad, very disappointing',sentiment:'negative'},
      {id:51,category:'Restaurants',review:'Chef personally checked on our experience',sentiment:'positive'},
      {id:52,category:'Restaurants',review:'Noisy atmosphere made conversation impossible',sentiment:'negative'},
      {id:53,category:'Restaurants',review:'Vegetarian options were creative not afterthoughts',sentiment:'positive'},
      {id:54,category:'Restaurants',review:'Waited 45 minutes past reservation time',sentiment:'negative'},
      {id:55,category:'Restaurants',review:'Exceptional value for the quality of food',sentiment:'positive'},
      {id:56,category:'Restaurants',review:'Menu was confusing with unclear descriptions',sentiment:'negative'},
      {id:57,category:'Restaurants',review:'Seasonal menu showcases local farm ingredients',sentiment:'positive'},
      {id:58,category:'Restaurants',review:'Server was rude when asked about allergens',sentiment:'negative'},
      {id:59,category:'Restaurants',review:'Cocktails were expertly crafted and balanced',sentiment:'positive'},
      {id:60,category:'Restaurants',review:'Bathroom was dirty which raised hygiene concerns',sentiment:'negative'},
      
      // Hotels - Travel accommodations
      {id:61,category:'Hotels',review:'Room was spotlessly clean with comfortable bed',sentiment:'positive'},
      {id:62,category:'Hotels',review:'Noisy neighbors kept us awake all night',sentiment:'negative'},
      {id:63,category:'Hotels',review:'Staff went above and beyond for special requests',sentiment:'positive'},
      {id:64,category:'Hotels',review:'AC was broken during a heat wave',sentiment:'negative'},
      {id:65,category:'Hotels',review:'Stunning ocean view from the balcony',sentiment:'positive'},
      {id:66,category:'Hotels',review:'Hidden fees doubled the advertised price',sentiment:'negative'},
      {id:67,category:'Hotels',review:'Complimentary breakfast had great variety',sentiment:'positive'},
      {id:68,category:'Hotels',review:'WiFi was unreliable and kept disconnecting',sentiment:'negative'},
      {id:69,category:'Hotels',review:'Pool area was relaxing and well-maintained',sentiment:'positive'},
      {id:70,category:'Hotels',review:'Elevator was out of service for entire stay',sentiment:'negative'},
      {id:71,category:'Hotels',review:'Concierge provided excellent local recommendations',sentiment:'positive'},
      {id:72,category:'Hotels',review:'Shower had no hot water multiple mornings',sentiment:'negative'},
      {id:73,category:'Hotels',review:'Convenient location walking distance to attractions',sentiment:'positive'},
      {id:74,category:'Hotels',review:'Parking garage was confusing and poorly lit',sentiment:'negative'},
      {id:75,category:'Hotels',review:'Spa services were rejuvenating and professional',sentiment:'positive'},
      {id:76,category:'Hotels',review:'Room smelled musty despite air fresheners',sentiment:'negative'},
      {id:77,category:'Hotels',review:'Rooftop bar had amazing city views',sentiment:'positive'},
      {id:78,category:'Hotels',review:'Front desk lost our reservation confirmation',sentiment:'negative'},
      {id:79,category:'Hotels',review:'Upgraded us to a suite as a nice surprise',sentiment:'positive'},
      {id:80,category:'Hotels',review:'Construction noise started at 6am daily',sentiment:'negative'},
      
      // Movies - Film reviews
      {id:81,category:'Movies',review:'Cinematography was absolutely breathtaking',sentiment:'positive'},
      {id:82,category:'Movies',review:'Plot made no sense and left too many questions',sentiment:'negative'},
      {id:83,category:'Movies',review:'Lead actor delivered an Oscar-worthy performance',sentiment:'positive'},
      {id:84,category:'Movies',review:'Special effects looked cheap and unconvincing',sentiment:'negative'},
      {id:85,category:'Movies',review:'Original soundtrack enhanced every scene perfectly',sentiment:'positive'},
      {id:86,category:'Movies',review:'Pacing dragged in the second act endlessly',sentiment:'negative'},
      {id:87,category:'Movies',review:'Clever twists kept me guessing until the end',sentiment:'positive'},
      {id:88,category:'Movies',review:'Dialogue was cringeworthy and unrealistic',sentiment:'negative'},
      {id:89,category:'Movies',review:'Directing choices created powerful emotional moments',sentiment:'positive'},
      {id:90,category:'Movies',review:'Unnecessary sequel that added nothing new',sentiment:'negative'},
      {id:91,category:'Movies',review:'Supporting cast brought depth to minor characters',sentiment:'positive'},
      {id:92,category:'Movies',review:'Editing was choppy with jarring transitions',sentiment:'negative'},
      {id:93,category:'Movies',review:'Costume design captured the era authentically',sentiment:'positive'},
      {id:94,category:'Movies',review:'Predictable ending visible from first 10 minutes',sentiment:'negative'},
      {id:95,category:'Movies',review:'Brilliant satire that resonated with current events',sentiment:'positive'},
      {id:96,category:'Movies',review:'Humor fell flat with outdated jokes',sentiment:'negative'},
      {id:97,category:'Movies',review:'Action sequences were choreographed masterfully',sentiment:'positive'},
      {id:98,category:'Movies',review:'Runtime was bloated could have been 30 minutes shorter',sentiment:'negative'},
      {id:99,category:'Movies',review:'Emotional climax brought tears to my eyes',sentiment:'positive'},
      {id:100,category:'Movies',review:'Sequel ignored established lore from original',sentiment:'negative'},
      
      // Software - Application reviews
      {id:101,category:'Software',review:'User interface is clean and intuitive',sentiment:'positive'},
      {id:102,category:'Software',review:'Crashes frequently losing unsaved work',sentiment:'negative'},
      {id:103,category:'Software',review:'Regular updates add useful new features',sentiment:'positive'},
      {id:104,category:'Software',review:'Customer support is unresponsive to tickets',sentiment:'negative'},
      {id:105,category:'Software',review:'Integration with other tools works seamlessly',sentiment:'positive'},
      {id:106,category:'Software',review:'Steep learning curve with poor documentation',sentiment:'negative'},
      {id:107,category:'Software',review:'Performance is fast even with large datasets',sentiment:'positive'},
      {id:108,category:'Software',review:'Subscription price increased without warning',sentiment:'negative'},
      {id:109,category:'Software',review:'Mobile app syncs perfectly with desktop version',sentiment:'positive'},
      {id:110,category:'Software',review:'Export feature corrupts files regularly',sentiment:'negative'},
      {id:111,category:'Software',review:'Keyboard shortcuts boost productivity significantly',sentiment:'positive'},
      {id:112,category:'Software',review:'Ads are intrusive in the free tier',sentiment:'negative'},
      {id:113,category:'Software',review:'Collaboration features make teamwork effortless',sentiment:'positive'},
      {id:114,category:'Software',review:'Login issues persist for weeks unresolved',sentiment:'negative'},
      {id:115,category:'Software',review:'Dark mode option is easy on the eyes',sentiment:'positive'},
      {id:116,category:'Software',review:'Missing basic features competitors have',sentiment:'negative'},
      {id:117,category:'Software',review:'Customization options suit different workflows',sentiment:'positive'},
      {id:118,category:'Software',review:'Data privacy policy raises red flags',sentiment:'negative'},
      {id:119,category:'Software',review:'Offline mode works without internet perfectly',sentiment:'positive'},
      {id:120,category:'Software',review:'Resource heavy slows down entire computer',sentiment:'negative'},
      
      // Games - Video game reviews
      {id:121,category:'Games',review:'Gameplay mechanics are innovative and addictive',sentiment:'positive'},
      {id:122,category:'Games',review:'Pay-to-win monetization ruins balance',sentiment:'negative'},
      {id:123,category:'Games',review:'Graphics are stunning with realistic lighting',sentiment:'positive'},
      {id:124,category:'Games',review:'Server lag makes multiplayer unplayable',sentiment:'negative'},
      {id:125,category:'Games',review:'Story campaign is engaging with memorable characters',sentiment:'positive'},
      {id:126,category:'Games',review:'Bugs break main questline progression',sentiment:'negative'},
      {id:127,category:'Games',review:'Sound design creates immersive atmosphere',sentiment:'positive'},
      {id:128,category:'Games',review:'Tutorial is confusing for new players',sentiment:'negative'},
      {id:129,category:'Games',review:'Replayability is high with different playstyles',sentiment:'positive'},
      {id:130,category:'Games',review:'Matchmaking pairs unfair skill levels',sentiment:'negative'},
      {id:131,category:'Games',review:'DLC content adds substantial new areas',sentiment:'positive'},
      {id:132,category:'Games',review:'Microtransactions feel predatory targeting kids',sentiment:'negative'},
      {id:133,category:'Games',review:'Controls are responsive and well-mapped',sentiment:'positive'},
      {id:134,category:'Games',review:'Difficulty spike makes it frustratingly hard',sentiment:'negative'},
      {id:135,category:'Games',review:'Community events keep the game fresh',sentiment:'positive'},
      {id:136,category:'Games',review:'Toxic player base ruins online experience',sentiment:'negative'},
      {id:137,category:'Games',review:'Level design is creative with hidden secrets',sentiment:'positive'},
      {id:138,category:'Games',review:'Save system loses progress randomly',sentiment:'negative'},
      {id:139,category:'Games',review:'Boss battles are epic and challenging',sentiment:'positive'},
      {id:140,category:'Games',review:'Loading times are excessively long',sentiment:'negative'},
      
      // Weird/Edge Cases - Testing unusual inputs
      {id:141,category:'???',review:'zzz睡觉 sleep zzz mixed languages and symbols',sentiment:'neutral'},
      {id:142,category:'Books',review:'ALLLLLLL CAPSSSSSS EXCESSIVE PUNCTUATION!!!!!!!',sentiment:'positive'},
      {id:143,category:'Electronics',review:'...just dots... nothing else... just dots...',sentiment:'negative'},
      {id:144,category:'Restaurants',review:'One word',sentiment:'positive'},
      {id:145,category:'Hotels',review:'',sentiment:'neutral'},
      {id:146,category:'Movies',review:'12345 67890 numbers only review strange',sentiment:'negative'},
      {id:147,category:'Software',review:'emoji 😀 😁 😂 🤣 😃 😄 review with lots of emoji 🎉🎊🎈',sentiment:'positive'},
      {id:148,category:'Games',review:'ThisIsOneReallyLongWordWithNoSpacesAtAllToTestEdgeCases',sentiment:'neutral'},
      {id:149,category:'Books',review:'Mix3d numb3r5 w1th l3tt3rs l33t sp34k st7le',sentiment:'positive'},
      {id:150,category:'Electronics',review:'Repeated repeated repeated repeated repeated repeated',sentiment:'negative'},
      {id:151,category:'Restaurants',review:'SO MANY EXCLAMATION MARKS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',sentiment:'positive'},
      {id:152,category:'Hotels',review:'question marks???? why???? so???? many????',sentiment:'negative'},
      {id:153,category:'Movies',review:'Special chars @#$%^&*() testing symbols',sentiment:'neutral'},
      {id:154,category:'Software',review:'Very very very very very very very very very long repeating words',sentiment:'positive'},
      {id:155,category:'Games',review:'unicode 测试 тест テスト परीक्षण 테스트 test',sentiment:'positive'},
      {id:156,category:'Books',review:'nospacesbetweenanywordsatallinthisreviewtotestparser',sentiment:'negative'},
      {id:157,category:'Electronics',review:'<html><body>HTML tags in review</body></html>',sentiment:'negative'},
      {id:158,category:'Restaurants',review:'Review; with; many; semicolons; everywhere; strange;',sentiment:'neutral'},
      {id:159,category:'Hotels',review:'"Quoted" entire "review" with "many" "quotes"',sentiment:'positive'},
      {id:160,category:'Movies',review:'Tab\tseparated\treview\twith\ttabs\tinside',sentiment:'negative'},
      
      // More standard reviews to reach 200+
      {id:161,category:'Books',review:'Compelling thriller with unexpected revelations',sentiment:'positive'},
      {id:162,category:'Electronics',review:'Ergonomic design reduces hand fatigue',sentiment:'positive'},
      {id:163,category:'Restaurants',review:'Authentic flavors transport you to Italy',sentiment:'positive'},
      {id:164,category:'Hotels',review:'Family-friendly with kids activities',sentiment:'positive'},
      {id:165,category:'Movies',review:'Documentary was eye-opening and informative',sentiment:'positive'},
      {id:166,category:'Software',review:'Backup feature saved me from data loss',sentiment:'positive'},
      {id:167,category:'Games',review:'Crossplay allows gaming with friends anywhere',sentiment:'positive'},
      {id:168,category:'Books',review:'Research was thorough and well-cited',sentiment:'positive'},
      {id:169,category:'Electronics',review:'Firmware updates improved functionality',sentiment:'positive'},
      {id:170,category:'Restaurants',review:'Gluten-free options were plentiful and tasty',sentiment:'positive'},
      {id:171,category:'Hotels',review:'Business center had everything needed',sentiment:'positive'},
      {id:172,category:'Movies',review:'Ending left room for sequel possibilities',sentiment:'positive'},
      {id:173,category:'Software',review:'Templates save time on repetitive tasks',sentiment:'positive'},
      {id:174,category:'Games',review:'Character customization is incredibly detailed',sentiment:'positive'},
      {id:175,category:'Books',review:'Illustrations complemented the text beautifully',sentiment:'positive'},
      {id:176,category:'Electronics',review:'Warranty coverage gave peace of mind',sentiment:'positive'},
      {id:177,category:'Restaurants',review:'Sommelier knowledge enhanced the dining',sentiment:'positive'},
      {id:178,category:'Hotels',review:'Quiet neighborhood perfect for relaxing',sentiment:'positive'},
      {id:179,category:'Movies',review:'Remake honored original while adding freshness',sentiment:'positive'},
      {id:180,category:'Software',review:'Version control prevents file conflicts',sentiment:'positive'},
      {id:181,category:'Games',review:'Tutorial teaches mechanics through gameplay',sentiment:'positive'},
      {id:182,category:'Books',review:'Translation preserved original meaning well',sentiment:'positive'},
      {id:183,category:'Electronics',review:'Accessories included no extra purchases needed',sentiment:'positive'},
      {id:184,category:'Restaurants',review:'Takeout packaging kept food hot and secure',sentiment:'positive'},
      {id:185,category:'Hotels',review:'Pet-friendly policies welcomed our dog',sentiment:'positive'},
      {id:186,category:'Movies',review:'Bonus features provided behind-scenes insights',sentiment:'positive'},
      {id:187,category:'Software',review:'API documentation is comprehensive and clear',sentiment:'positive'},
      {id:188,category:'Games',review:'Seasonal content keeps me coming back',sentiment:'positive'},
      {id:189,category:'Books',review:'Bibliography pointed to more great reads',sentiment:'positive'},
      {id:190,category:'Electronics',review:'Customer service replaced defective unit quickly',sentiment:'positive'},
      {id:191,category:'Restaurants',review:'Outdoor seating area was lovely in summer',sentiment:'positive'},
      {id:192,category:'Hotels',review:'Turndown service was a nice touch',sentiment:'positive'},
      {id:193,category:'Movies',review:'Cameo appearances delighted longtime fans',sentiment:'positive'},
      {id:194,category:'Software',review:'Training resources helped team adoption',sentiment:'positive'},
      {id:195,category:'Games',review:'Accessibility options make it inclusive',sentiment:'positive'},
      {id:196,category:'Books',review:'Book club discussion questions sparked conversation',sentiment:'positive'},
      {id:197,category:'Electronics',review:'Energy efficient reduces electricity costs',sentiment:'positive'},
      {id:198,category:'Restaurants',review:'Happy hour deals offer excellent value',sentiment:'positive'},
      {id:199,category:'Hotels',review:'Loyalty program rewards repeat guests',sentiment:'positive'},
      {id:200,category:'Movies',review:'Post-credits scene teased exciting continuation',sentiment:'positive'},
      {id:201,category:'Software',review:'Security features protect sensitive data',sentiment:'positive'},
      {id:202,category:'Games',review:'Physics engine creates realistic interactions',sentiment:'positive'},
      {id:203,category:'Books',review:'Cover art captured the essence perfectly',sentiment:'positive'},
      {id:204,category:'Electronics',review:'Compatible with legacy devices surprisingly',sentiment:'positive'},
      {id:205,category:'Restaurants',review:'Reservation system worked smoothly online',sentiment:'positive'},
      {id:206,category:'Hotels',review:'Check-in process was quick and efficient',sentiment:'positive'},
      {id:207,category:'Movies',review:'Soundtrack album worth purchasing separately',sentiment:'positive'},
      {id:208,category:'Software',review:'Bulk operations handle large workloads',sentiment:'positive'},
      {id:209,category:'Games',review:'Mod support extends gameplay possibilities',sentiment:'positive'},
      {id:210,category:'Books',review:'Author Q&A section answered my questions',sentiment:'positive'}
    ]
    
    const workbook = new ExcelJS.Workbook()
    
    // Add Reviews sheet with all data
    const sheet1 = workbook.addWorksheet('Reviews')
    sheet1.columns = Object.keys(reviewData[0]).map(key => ({ header: key, key }))
    reviewData.forEach(row => sheet1.addRow(row))
    
    // Q1 - More negative reviews using like/dislike vocabulary
    const q1Data = [
      {id:1,category:'Books',review:'I really dislike the weak character development',sentiment:'negative'},
      {id:2,category:'Electronics',review:'Did not like how quickly it broke',sentiment:'negative'},
      {id:3,category:'Restaurants',review:'Disliked the cold food and poor service',sentiment:'negative'},
      {id:4,category:'Hotels',review:'Cannot like a place with such dirty rooms',sentiment:'negative'},
      {id:5,category:'Movies',review:'Hard to like with such terrible acting',sentiment:'negative'},
      {id:6,category:'Software',review:'Dislike the constant crashes and bugs',sentiment:'negative'},
      {id:7,category:'Games',review:'Do not like the pay-to-win mechanics',sentiment:'negative'},
      {id:8,category:'Books',review:'Disliked how predictable the plot was',sentiment:'negative'},
      {id:9,category:'Electronics',review:'Did not like the poor battery life',sentiment:'negative'},
      {id:10,category:'Restaurants',review:'Dislike waiting an hour for mediocre food',sentiment:'negative'},
      {id:11,category:'Hotels',review:'Cannot like the noisy environment',sentiment:'negative'},
      {id:12,category:'Movies',review:'Dislike the boring storyline',sentiment:'negative'},
      {id:13,category:'Software',review:'Do not like the confusing interface',sentiment:'negative'},
      {id:14,category:'Games',review:'Disliked the unfair difficulty spikes',sentiment:'negative'},
      {id:15,category:'Books',review:'I like the cover but dislike everything else',sentiment:'negative'},
      {id:16,category:'Electronics',review:'Like the idea but dislike the execution',sentiment:'negative'},
      {id:17,category:'Restaurants',review:'Liked the decor but disliked the taste',sentiment:'negative'},
      {id:18,category:'Hotels',review:'Like the location but dislike the staff',sentiment:'negative'},
      {id:19,category:'Movies',review:'I might like it if not for the ending',sentiment:'negative'},
      {id:20,category:'Software',review:'Dislike the steep learning curve',sentiment:'negative'},
      {id:21,category:'Games',review:'Cannot like games with such bad graphics',sentiment:'negative'},
      {id:22,category:'Books',review:'Dislike the slow pacing throughout',sentiment:'negative'},
      {id:23,category:'Electronics',review:'Do not like products that overheat',sentiment:'negative'},
      {id:24,category:'Restaurants',review:'Disliked the limited menu options',sentiment:'negative'},
      {id:25,category:'Hotels',review:'Like nothing about this disappointing stay',sentiment:'negative'},
      {id:26,category:'Movies',review:'Dislike movies that waste my time',sentiment:'negative'},
      {id:27,category:'Software',review:'Did not like the expensive subscription',sentiment:'negative'},
      {id:28,category:'Games',review:'Dislike the toxic community',sentiment:'negative'},
      {id:29,category:'Books',review:'Cannot like books with plot holes',sentiment:'negative'},
      {id:30,category:'Electronics',review:'Disliked the cheap build quality',sentiment:'negative'}
    ]
    const sheetQ1 = workbook.addWorksheet('Q1')
    sheetQ1.columns = Object.keys(q1Data[0]).map(key => ({ header: key, key }))
    q1Data.forEach(row => sheetQ1.addRow(row))
    
    // Q2 - More neutral reviews using enjoy/bored vocabulary
    const q2Data = [
      {id:1,category:'Books',review:'Neither enjoyed nor was bored by the narrative',sentiment:'neutral'},
      {id:2,category:'Electronics',review:'Did not enjoy it much but not bored either',sentiment:'neutral'},
      {id:3,category:'Restaurants',review:'The meal was fine, neither enjoyable nor boring',sentiment:'neutral'},
      {id:4,category:'Hotels',review:'Stayed there, not particularly enjoyable or boring',sentiment:'neutral'},
      {id:5,category:'Movies',review:'Watched it, felt neither enjoyment nor boredom',sentiment:'neutral'},
      {id:6,category:'Software',review:'Used it for work, neither enjoyed nor got bored',sentiment:'neutral'},
      {id:7,category:'Games',review:'Played for a while, not boring but not enjoying',sentiment:'neutral'},
      {id:8,category:'Books',review:'Read it through without much enjoyment or boredom',sentiment:'neutral'},
      {id:9,category:'Electronics',review:'Functions as expected, no real enjoyment factor',sentiment:'neutral'},
      {id:10,category:'Restaurants',review:'Ate there once, neither boring nor enjoyable',sentiment:'neutral'},
      {id:11,category:'Hotels',review:'Checked in and out, nothing enjoyable or boring',sentiment:'neutral'},
      {id:12,category:'Movies',review:'Saw it in theaters, felt neutral about enjoyment',sentiment:'neutral'},
      {id:13,category:'Software',review:'Adequate tool, not boring but not enjoyable',sentiment:'neutral'},
      {id:14,category:'Games',review:'Tried it out, no strong feelings of boredom or enjoyment',sentiment:'neutral'},
      {id:15,category:'Books',review:'Finished reading, was neither bored nor particularly enjoyed',sentiment:'neutral'},
      {id:16,category:'Electronics',review:'Does the job without being boring or enjoyable',sentiment:'neutral'},
      {id:17,category:'Restaurants',review:'Standard dining experience, no boredom or enjoyment',sentiment:'neutral'},
      {id:18,category:'Hotels',review:'Typical stay, nothing to enjoy or be bored about',sentiment:'neutral'},
      {id:19,category:'Movies',review:'Average film, neither enjoyable nor boring',sentiment:'neutral'},
      {id:20,category:'Software',review:'Basic features work, not bored but not enjoying',sentiment:'neutral'},
      {id:21,category:'Games',review:'Played a few levels, neutral on enjoyment and boredom',sentiment:'neutral'},
      {id:22,category:'Books',review:'Got through it, neither enjoyed the plot nor was bored',sentiment:'neutral'},
      {id:23,category:'Electronics',review:'Serves its purpose, no enjoyment or boredom',sentiment:'neutral'},
      {id:24,category:'Restaurants',review:'Ordered takeout, felt neutral about the experience',sentiment:'neutral'},
      {id:25,category:'Hotels',review:'One night stay, nothing enjoyable or boring to report',sentiment:'neutral'},
      {id:26,category:'Movies',review:'Runtime passed, neither bored nor truly enjoyed',sentiment:'neutral'},
      {id:27,category:'Software',review:'Completed tasks, no feelings of boredom or enjoyment',sentiment:'neutral'},
      {id:28,category:'Games',review:'Beat the campaign, neutral on overall enjoyment',sentiment:'neutral'},
      {id:29,category:'Books',review:'Read all chapters, did not bore me or bring enjoyment',sentiment:'neutral'},
      {id:30,category:'Electronics',review:'Used it daily, neither boring nor particularly enjoyable',sentiment:'neutral'}
    ]
    const sheetQ2 = workbook.addWorksheet('Q2')
    sheetQ2.columns = Object.keys(q2Data[0]).map(key => ({ header: key, key }))
    q2Data.forEach(row => sheetQ2.addRow(row))
    
    // Q3 - More positive reviews using love/adore vocabulary
    const q3Data = [
      {id:1,category:'Books',review:'I absolutely love the captivating storyline',sentiment:'positive'},
      {id:2,category:'Electronics',review:'Adore how well this device performs',sentiment:'positive'},
      {id:3,category:'Restaurants',review:'Love the incredible flavors and presentation',sentiment:'positive'},
      {id:4,category:'Hotels',review:'Adored our wonderful stay at this place',sentiment:'positive'},
      {id:5,category:'Movies',review:'Love the brilliant cinematography and acting',sentiment:'positive'},
      {id:6,category:'Software',review:'Absolutely adore the intuitive interface',sentiment:'positive'},
      {id:7,category:'Games',review:'Love the immersive gameplay mechanics',sentiment:'positive'},
      {id:8,category:'Books',review:'Adore the beautiful prose and depth',sentiment:'positive'},
      {id:9,category:'Electronics',review:'Love the sleek design and features',sentiment:'positive'},
      {id:10,category:'Restaurants',review:'Adored the exceptional service and ambiance',sentiment:'positive'},
      {id:11,category:'Hotels',review:'Love the luxurious amenities provided',sentiment:'positive'},
      {id:12,category:'Movies',review:'Absolutely love the emotional impact',sentiment:'positive'},
      {id:13,category:'Software',review:'Adore how it streamlines my workflow',sentiment:'positive'},
      {id:14,category:'Games',review:'Love the creative level design',sentiment:'positive'},
      {id:15,category:'Books',review:'I love and adore every page of this masterpiece',sentiment:'positive'},
      {id:16,category:'Electronics',review:'Adore the premium quality and reliability',sentiment:'positive'},
      {id:17,category:'Restaurants',review:'Love the authentic cuisine and atmosphere',sentiment:'positive'},
      {id:18,category:'Hotels',review:'Absolutely adored the stunning views',sentiment:'positive'},
      {id:19,category:'Movies',review:'Love how it exceeded all expectations',sentiment:'positive'},
      {id:20,category:'Software',review:'Adore the powerful features it offers',sentiment:'positive'},
      {id:21,category:'Games',review:'Love the engaging story and characters',sentiment:'positive'},
      {id:22,category:'Books',review:'Adore the thoughtful themes explored',sentiment:'positive'},
      {id:23,category:'Electronics',review:'Love how durable and long-lasting it is',sentiment:'positive'},
      {id:24,category:'Restaurants',review:'Absolutely love the creative menu items',sentiment:'positive'},
      {id:25,category:'Hotels',review:'Adore the attentive and friendly staff',sentiment:'positive'},
      {id:26,category:'Movies',review:'Love the perfect balance of drama and humor',sentiment:'positive'},
      {id:27,category:'Software',review:'Adore the seamless integration capabilities',sentiment:'positive'},
      {id:28,category:'Games',review:'Love the high replay value',sentiment:'positive'},
      {id:29,category:'Books',review:'Absolutely adore the satisfying conclusion',sentiment:'positive'},
      {id:30,category:'Electronics',review:'Love every aspect of this amazing product',sentiment:'positive'}
    ]
    const sheetQ3 = workbook.addWorksheet('Q3')
    sheetQ3.columns = Object.keys(q3Data[0]).map(key => ({ header: key, key }))
    q3Data.forEach(row => sheetQ3.addRow(row))
    
    // Q4 - Even mix of positive, neutral, and negative using appreciate/hate vocabulary
    const q4Data = [
      {id:1,category:'Books',review:'I appreciate the effort but hate the execution',sentiment:'negative'},
      {id:2,category:'Electronics',review:'Appreciate the design and really love using it',sentiment:'positive'},
      {id:3,category:'Restaurants',review:'The service was acceptable, nothing to appreciate or hate',sentiment:'neutral'},
      {id:4,category:'Hotels',review:'Hate the noise but appreciate the location',sentiment:'negative'},
      {id:5,category:'Movies',review:'Really appreciate the unique cinematography',sentiment:'positive'},
      {id:6,category:'Software',review:'Neither appreciate nor hate its functionality',sentiment:'neutral'},
      {id:7,category:'Games',review:'Hate the bugs but appreciate the concept',sentiment:'negative'},
      {id:8,category:'Books',review:'Appreciate the writing style very much',sentiment:'positive'},
      {id:9,category:'Electronics',review:'Standard quality, nothing to hate or appreciate',sentiment:'neutral'},
      {id:10,category:'Restaurants',review:'Hate waiting but appreciate the final dish',sentiment:'positive'},
      {id:11,category:'Hotels',review:'Do not appreciate the hidden fees, hate that practice',sentiment:'negative'},
      {id:12,category:'Movies',review:'Appreciate the director vision shown throughout',sentiment:'positive'},
      {id:13,category:'Software',review:'Used it once, neither hate it nor appreciate it',sentiment:'neutral'},
      {id:14,category:'Games',review:'Appreciate the graphics, hate the gameplay',sentiment:'negative'},
      {id:15,category:'Books',review:'Truly appreciate the historical research done',sentiment:'positive'},
      {id:16,category:'Electronics',review:'It works fine, no strong appreciation or hatred',sentiment:'neutral'},
      {id:17,category:'Restaurants',review:'Hate the menu prices, nothing to appreciate',sentiment:'negative'},
      {id:18,category:'Hotels',review:'Appreciate the cleanliness and comfort provided',sentiment:'positive'},
      {id:19,category:'Movies',review:'Neutral experience, did not appreciate or hate it',sentiment:'neutral'},
      {id:20,category:'Software',review:'Hate the subscription model entirely',sentiment:'negative'},
      {id:21,category:'Games',review:'Appreciate the attention to detail',sentiment:'positive'},
      {id:22,category:'Books',review:'Regular book, nothing special to appreciate',sentiment:'neutral'},
      {id:23,category:'Electronics',review:'Hate how it breaks so easily',sentiment:'negative'},
      {id:24,category:'Restaurants',review:'Appreciate the fresh ingredients used',sentiment:'positive'},
      {id:25,category:'Hotels',review:'Stayed there, neither appreciated nor hated aspects',sentiment:'neutral'},
      {id:26,category:'Movies',review:'Hate the predictable plot twists',sentiment:'negative'},
      {id:27,category:'Software',review:'Greatly appreciate the helpful support team',sentiment:'positive'},
      {id:28,category:'Games',review:'Average game, no appreciation or hatred',sentiment:'neutral'},
      {id:29,category:'Books',review:'Hate rushed endings like this one',sentiment:'negative'},
      {id:30,category:'Electronics',review:'Appreciate the value for money received',sentiment:'positive'}
    ]
    const sheetQ4 = workbook.addWorksheet('Q4')
    sheetQ4.columns = Object.keys(q4Data[0]).map(key => ({ header: key, key }))
    q4Data.forEach(row => sheetQ4.addRow(row))
    
    // Convert to buffer and parse
    const buffer = await workbook.xlsx.writeBuffer()
    const parsed = new ExcelJS.Workbook()
    await parsed.xlsx.load(buffer)
    
    const obj = {}
    parsed.worksheets.forEach(ws => {
      obj[ws.name] = parseWorksheet(ws)
    })
    
    // Initialize version manager
    versionManager.current.initialize(obj)
    setHistoryInfo(versionManager.current.getHistoryInfo())
    
    setWorkbookData(obj)
    setActiveSheet(parsed.worksheets[0]?.name || null)
    setSelectedColumns([])
    setHiddenColumns([])
    setRenames({})
    
    // Auto-detect categorical columns
    const firstSheet = parsed.worksheets[0]?.name
    if (firstSheet && obj[firstSheet]) {
      const detected = detectCategoricalColumns(obj[firstSheet].rows, obj[firstSheet].columns)
      setCategoricalColumns(detected)
    }
  }

  const handleFile=e=>{ 
    const file=e.target.files?.[0]
    if(!file) return
    const ext=file.name.split('.').pop().toLowerCase()
    const reader=new FileReader()
    
    reader.onload=async(evt)=>{ 
      let parsedData = {}
      if(ext==='csv'){ 
        const text=evt.target.result
        const parsed=parseCsv(text)
        parsedData = {'CSV': parsed}
      } else { 
        const data=evt.target.result
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(data)
        
        workbook.worksheets.forEach(ws => {
          parsedData[ws.name] = parseWorksheet(ws)
        })
      }
      
      // Show import modal instead of directly loading
      setPendingImportData(parsedData)
      setPendingFileName(file.name)
      setPendingFileType(ext)
      setShowImportModal(true)
    }
    
    ext==='csv'? reader.readAsText(file): reader.readAsArrayBuffer(file)
  }

  const handleImportConfirm = (config) => {
    // Apply the configuration and load the data
    const { processedData, hiddenColumns: importHiddenColumns, markedColumns, columnTypes: importColumnTypes, categoricalColumns: importCategoricalColumns, categoricalFilters: importCategoricalFilters } = config
    
    // Reconstruct workbook data with processed data
    const finalData = {}
    Object.keys(pendingImportData).forEach(sheetName => {
      const processed = processedData
      
      // Apply the transformations from the modal
      finalData[sheetName] = {
        rows: processed.rows,
        columns: processed.columns
      }
    })
    
    // Initialize version manager with original data
    versionManager.current.initialize(finalData)
    setHistoryInfo(versionManager.current.getHistoryInfo())
    
    setWorkbookData(finalData)
    setActiveSheet(Object.keys(finalData)[0] || null)
    setSelectedColumns(markedColumns)
    setHiddenColumns(importHiddenColumns)
    setColumnTypes(importColumnTypes || {})
    setCategoricalColumns(importCategoricalColumns || [])
    setCategoricalFilters(importCategoricalFilters || {})
    setRenames({})
    setShowImportModal(false)
    setPendingImportData(null)
  }

  // Auto-detect categorical columns based on unique value count
  const detectCategoricalColumns = useCallback((rows, columns) => {
    const detected = []
    columns.forEach(col => {
      const uniqueValues = new Set(
        rows.map(row => row[col])
          .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
          .map(normalizeValue)
      )
      // Auto-detect as categorical if 5 or fewer unique values
      if (uniqueValues.size > 0 && uniqueValues.size <= 5) {
        detected.push(col)
      }
    })
    return detected
  }, [])

  const handleImportCancel = () => {
    setShowImportModal(false)
    setPendingImportData(null)
  }

  const rawRows=useMemo(()=> activeSheet==='__ALL__'? Object.values(workbookData).flatMap(s=>s.rows): (activeSheet && workbookData[activeSheet]?.rows)||[],[activeSheet,workbookData])
  
  const currentColumns=useMemo(()=> activeSheet==='__ALL__'? [...new Set(Object.values(workbookData).flatMap(s=>s.columns))] : (activeSheet && workbookData[activeSheet]?.columns)||[],[activeSheet,workbookData])
  const displayedColumns=currentColumns.filter(c=>!hiddenColumns.includes(c))
  
  // Apply categorical filters to rows
  const currentRows = useMemo(() => {
    let filtered = rawRows
    
    // Apply categorical filters
    Object.entries(categoricalFilters).forEach(([col, selectedValues]) => {
      if (selectedValues && selectedValues.length > 0) {
        filtered = filtered.filter(row => {
          const val = row[col]
          if (val === null || val === undefined) return false
          const normalized = normalizeValue(val)
          return selectedValues.includes(normalized)
        })
      }
    })
    
    // Apply text search filter (only in editor view)
    if (activeView === 'editor' && textSearchFilter.trim()) {
      const searchLower = textSearchFilter.toLowerCase().trim()
      const columnsToSearch = currentColumns.filter(c => !hiddenColumns.includes(c))
      filtered = filtered.filter(row => {
        return columnsToSearch.some(col => {
          const val = row[col]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(searchLower)
        })
      })
    }
    
    return filtered
  }, [rawRows, categoricalFilters, activeView, textSearchFilter, currentColumns, hiddenColumns])
  const textSamples=useMemo(()=> !selectedColumns.length? [] : currentRows.map(r=>selectedColumns.map(c=>r[c]).join(' ')),[currentRows,selectedColumns])
  const stemmer=useMemo(()=> enableStemming? buildStem(): (t)=>t,[enableStemming])
  const params=useMemo(()=>({stopwords:effectiveStopwords,stem:enableStemming,stemmer,n:ngramN}),[effectiveStopwords,enableStemming,stemmer,ngramN])

  const tfidf=useMemo(()=> analysisType==='tfidf'&& textSamples.length? computeTfIdf(textSamples,params): null,[analysisType,textSamples,params])
  const ngrams=useMemo(()=> analysisType==='ngram'&& textSamples.length? generateNGrams(textSamples,params): [],[analysisType,textSamples,params])
  const associations=useMemo(()=> analysisType==='assoc'&& textSamples.length? mineAssociations(currentRows,selectedColumns,{...params,minSupport}): null,[analysisType,textSamples,currentRows,selectedColumns,params,minSupport])
  const entities=useMemo(()=> analysisType==='ner'&& textSamples.length && nlpLibs.nlp? extractEntities(textSamples,nlpLibs.nlp): [],[analysisType,textSamples,nlpLibs])
  
  // Compute embeddings
  const embeddings=useMemo(()=> analysisType==='embeddings'&& textSamples.length>=3? computeDocumentEmbeddings(textSamples,params): null,[analysisType,textSamples,params])
  
  // Load and compute dependency parsing
  useEffect(() => {
    if (analysisType !== 'dependency' || textSamples.length === 0) {
      setDependencyResult(null)
      setDependencyProgress(0)
      return
    }
    
    let cancelled = false
    
    const compute = async () => {
      try {
        setDependencyProgress(0)
        const performDependencyParsing = await loadDependencyParsing()
        if (cancelled) return
        
        // Calculate number of samples based on percentage
        const maxSamples = Math.ceil(textSamples.length * (dependencySamplePercent / 100))
        
        const result = await performDependencyParsing(textSamples, { 
          algorithm: dependencyAlgorithm,
          maxSamples: maxSamples,
          onProgress: (progress) => {
            if (!cancelled) {
              setDependencyProgress(progress)
            }
          }
        })
        
        if (!cancelled) {
          setDependencyResult(result)
          setDependencyProgress(100)
        }
      } catch (error) {
        console.error('Dependency parsing error:', error)
        if (!cancelled) {
          setDependencyResult({ nodes: [], edges: [], sentences: [], error: true })
          setDependencyProgress(0)
        }
      }
    }
    
    compute()
    
    return () => {
      cancelled = true
    }
  }, [analysisType, textSamples, dependencyAlgorithm, dependencySamplePercent])
  
  // Apply dimensionality reduction (async)
  const [embeddingPoints,setEmbeddingPoints]=useState([])
  useEffect(()=>{
    if(analysisType!=='embeddings' || !embeddings || !dimReductionLibs.loaded) {
      setEmbeddingPoints([])
      return
    }
    
    const compute=async()=>{
      try {
        const points = await applyDimensionalityReduction(embeddings.vectors, dimReductionMethod, dimReductionLibs)
        
        // Add labels from text samples
        const labeled = points.map((pt, i) => ({
          ...pt,
          label: textSamples[i] ? textSamples[i].slice(0, 50) + '...' : `Doc ${i+1}`
        }))
        
        setEmbeddingPoints(labeled)
      } catch(error) {
        console.error('Dimensionality reduction error:', error)
        setEmbeddingPoints([])
      }
    }
    
    compute()
  },[analysisType,embeddings,dimReductionLibs,dimReductionMethod,textSamples])

  // Derived quick stats
  const statDocs=textSamples.length
  const statTokens=useMemo(()=> textSamples.join(' ').split(/\s+/).filter(Boolean).length,[textSamples])
  const statUniqueTerms=tfidf? tfidf.aggregate.length : (ngrams.length || entities.length)

  const wordCloudData=useMemo(()=>{ if(analysisType==='tfidf'&&tfidf) return tfidf.aggregate.map(t=>({text:t.term,value:t.score})); if(analysisType==='ngram') return ngrams.map(g=>({text:g.gram,value:g.count})); if(analysisType==='ner') return entities.map(e=>({text:e.value,value:e.count})); if(analysisType==='assoc'&&associations) return associations.items.map(i=>({text:i.item,value:i.support})); return []},[analysisType,tfidf,ngrams,entities,associations])
  const networkData=useMemo(()=> {
    if (analysisType==='assoc'&&associations) {
      return {nodes:associations.items.slice(0,50).map(i=>({id:i.item,value:i.support})), edges:associations.pairs.filter(p=>p.lift>=1).map(p=>({source:p.a,target:p.b,value:p.lift}))}
    }
    if (analysisType==='dependency'&&dependencyResult) {
      return {nodes:dependencyResult.nodes, edges:dependencyResult.edges}
    }
    return {nodes:[],edges:[]}
  },[analysisType,associations,dependencyResult])
  const heatmapData=useMemo(()=>{ 
    if(analysisType==='tfidf'&&tfidf){ 
      const top=tfidf.aggregate.slice(0,20).map(t=>t.term); 
      const matrix=tfidf.perDoc.slice(0,25).map(doc=>top.map(term=>{
        const f=doc.find(x=>x.term===term); 
        return f? Number(f.tfidf.toFixed(2)):0
      })); 
      // Create better document labels using text preview
      const yLabels = matrix.map((_, i) => {
        if (i < textSamples.length) {
          const text = textSamples[i]
          // Get first 40 chars or up to first sentence
          const preview = text.slice(0, 40).replace(/\s+/g, ' ').trim()
          return preview.length < text.length ? preview + '...' : preview
        }
        return 'Doc ' + (i+1)
      })
      return {matrix, xLabels:top, yLabels}
    } 
    return {matrix:[],xLabels:[],yLabels:[]} 
  },[analysisType,tfidf,textSamples])

  // Chart data (live updating) - pie chart removed, keeping bar chart
  // const pieData=useMemo(()=>{ if(analysisType==='assoc'&&associations) return associations.items.slice(0,6).map(i=>({ name:i.item, value:+(i.support*100).toFixed(2) })); if(analysisType==='tfidf'&&tfidf) return tfidf.aggregate.slice(0,6).map(t=>({ name:t.term, value:+t.score.toFixed(2) })); if(analysisType==='ngram') return ngrams.slice(0,6).map(g=>({ name:g.gram, value:g.count })); if(analysisType==='ner') return entities.slice(0,6).map(e=>({ name:e.value, value:e.count })); return [] },[analysisType,associations,tfidf,ngrams,entities])
  const barData=useMemo(()=>{ if(analysisType==='assoc'&&associations) return associations.pairs.slice(0,8).map(p=>({ name:`${p.a}+${p.b}`, lift:+p.lift.toFixed(2) })); if(analysisType==='tfidf'&&tfidf) return tfidf.aggregate.slice(0,8).map(t=>({ name:t.term, score:+t.score.toFixed(2) })); if(analysisType==='ngram') return ngrams.slice(0,8).map(g=>({ name:g.gram, freq:g.count })); if(analysisType==='ner') return entities.slice(0,8).map(e=>({ name:e.value, count:e.count })); return [] },[analysisType,associations,tfidf,ngrams,entities])

  // Mutators
  // eslint-disable-next-line no-unused-vars
  const toggleHide=col=>setHiddenColumns(h=>h.includes(col)? h.filter(c=>c!==col):[...h,col])
  // eslint-disable-next-line no-unused-vars
  const setRename=(col,name)=>setRenames(r=>({...r,[col]:name}))
  const selectColumnForText=col=>setSelectedColumns(p=>p.includes(col)? p.filter(c=>c!==col):[...p,col])
  
  // Undo/Redo handlers
  const handleUndo = () => {
    const previousData = versionManager.current.undo()
    if (previousData) {
      setWorkbookData(previousData)
      setHistoryInfo(versionManager.current.getHistoryInfo())
    }
  }
  
  const handleRedo = () => {
    const nextData = versionManager.current.redo()
    if (nextData) {
      setWorkbookData(nextData)
      setHistoryInfo(versionManager.current.getHistoryInfo())
    }
  }
  
  const handleResetToOriginal = () => {
    const originalData = versionManager.current.resetToOriginal()
    if (originalData) {
      setWorkbookData(originalData)
      setHistoryInfo(versionManager.current.getHistoryInfo())
    }
  }
  
  // Data manipulation functions
  const applyTransformation = (transformation) => {
    const result = applyDataTransformation(workbookData, transformation)
    const { newData, actionDescription } = result
    versionManager.current.pushVersion(newData, actionDescription)
    setWorkbookData(newData)
    setHistoryInfo(versionManager.current.getHistoryInfo())
  }
  
  const deleteColumn = (columnName) => {
    applyTransformation({
      type: 'DELETE_COLUMN',
      sheetName: activeSheet || '__ALL__',
      columnName
    })
  }
  
  const renameColumn = (oldName, newName) => {
    if (newName && newName !== oldName) {
      applyTransformation({
        type: 'RENAME_COLUMN',
        sheetName: activeSheet || '__ALL__',
        oldName,
        newName
      })
    }
  }
  
  // eslint-disable-next-line no-unused-vars
  const deleteRows = (rowIndices) => {
    applyTransformation({
      type: 'DELETE_ROW',
      sheetName: activeSheet || '__ALL__',
      rowIndices
    })
  }
  
  const transformColumn = (columnName, transformType) => {
    applyTransformation({
      type: 'TRANSFORM_COLUMN',
      sheetName: activeSheet || '__ALL__',
      columnName,
      transformType
    })
  }
  
  const transformAll = (transformType) => {
    applyTransformation({
      type: 'TRANSFORM_ALL',
      sheetName: activeSheet || '__ALL__',
      transformType
    })
  }
  
  const jumpToHistoryVersion = (index) => {
    const versionData = versionManager.current.jumpToVersion(index)
    if (versionData) {
      setWorkbookData(versionData)
      setHistoryInfo(versionManager.current.getHistoryInfo())
      setShowHistoryModal(false)
    }
  }

  const exportTransformed=async(format='xlsx')=>{ 
    const cols=displayedColumns
    const data=currentRows.map(r=>{
      const o={}
      cols.forEach(c=>o[renames[c]||c]=r[c])
      return o
    })
    
    if (format === 'csv') {
      // Export as CSV
      const headers = cols.map(col => renames[col] || col)
      const csvRows = [headers.join(',')]
      
      data.forEach(row => {
        const values = cols.map(col => {
          const key = renames[col] || col
          const val = row[key]
          // Escape quotes and wrap in quotes if contains comma or quote
          if (val === null || val === undefined) return ''
          const str = String(val)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        csvRows.push(values.join(','))
      })
      
      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transformed.csv'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Export as Excel
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Transformed')
      
      if (data.length > 0) {
        worksheet.columns = cols.map(col => ({ 
          header: renames[col] || col, 
          key: renames[col] || col 
        }))
        data.forEach(row => worksheet.addRow(row))
      }
      
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transformed.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    }
  }
  const exportAnalysis=()=>{ const payload={analysisType,timestamp:new Date().toISOString(), tfidf:analysisType==='tfidf'?tfidf:undefined, ngrams:analysisType==='ngram'?ngrams:undefined, associations:analysisType==='assoc'?associations:undefined, entities:analysisType==='ner'?entities:undefined, embeddings:analysisType==='embeddings'?{vocab:embeddings?.vocab,points:embeddingPoints,method:dimReductionMethod}:undefined, dependency:analysisType==='dependency'?{...dependencyResult,algorithm:dependencyAlgorithm}:undefined}; const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`analysis_${analysisType}.json`; a.click() }

  // Helper function to check if a visualization is available for current analysis type
  // Complete analysis → visualization mapping:
  // - tfidf: bar, wordcloud, heatmap
  // - ngram: bar, wordcloud
  // - assoc: bar, wordcloud, network
  // - ner: bar, wordcloud
  // - embeddings: scatter
  // - dependency: network
  const isVisualizationAvailable = (vizType) => {
    switch(vizType) {
      case 'bar':
        return analysisType === 'tfidf' || analysisType === 'ngram' || analysisType === 'ner' || analysisType === 'assoc'
      case 'wordcloud':
        return analysisType === 'tfidf' || analysisType === 'ngram' || analysisType === 'ner' || analysisType === 'assoc'
      case 'network':
        return analysisType === 'assoc' || analysisType === 'dependency'
      case 'heatmap':
        return analysisType === 'tfidf'
      case 'scatter':
        return analysisType === 'embeddings'
      default:
        return false
    }
  }

  // Helper function to get visualization display name
  const getVisualizationName = (type) => {
    const names = {
      bar: 'Bar Chart',
      wordcloud: 'Word Cloud',
      network: 'Network Graph',
      heatmap: 'Heatmap',
      scatter: 'Scatter Plot'
    }
    return names[type] || type
  }

  // Helper function to render a visualization based on type
  const renderVisualization = (type) => {
    switch(type) {
      case 'bar':
        return barData.length>0 ? (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={barData} margin={{top:10,right:10,bottom:10,left:0}}>
              <XAxis dataKey='name' hide={barData.length>6} tick={{fontSize:11}} interval={0} angle={-20} textAnchor='end'/>
              <YAxis tick={{fontSize:11}} />
              <Tooltip wrapperStyle={{fontSize:12}}/>
              <Bar dataKey={analysisType==='tfidf'?'score': analysisType==='ngram'?'freq': analysisType==='assoc'?'lift':'count'} radius={[6,6,0,0]} fill='#0f172a'>
                {barData.map((_,i)=><Cell key={i} fill={['#0f172a','#ff9900','#0284c7','#475569','#06b6d4','#f59e0b'][i%6]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <div className='skel block' />
      case 'wordcloud':
        return wordCloudData.length>0 ? (
          <Suspense fallback={<div className='skel block' />}>
            <WordCloud data={wordCloudData} />
          </Suspense>
        ) : <div className='skel block' />
      case 'network':
        return networkData.nodes.length>0 ? (
          <Suspense fallback={<div className='skel block' />}>
            <NetworkGraph nodes={networkData.nodes} edges={networkData.edges} weightedLines={weightedLines} />
          </Suspense>
        ) : <div className='skel block' />
      case 'heatmap':
        return heatmapData.matrix.length>0 ? (
          <Suspense fallback={<div className='skel block' />}>
            <Heatmap matrix={heatmapData.matrix} xLabels={heatmapData.xLabels} yLabels={heatmapData.yLabels} />
          </Suspense>
        ) : <div className='skel block' />
      case 'scatter':
        return embeddingPoints.length>0 ? (
          <Suspense fallback={<div className='skel block' />}>
            <ScatterPlot data={embeddingPoints} xLabel={`${dimReductionMethod.toUpperCase()} Dimension 1`} yLabel={`${dimReductionMethod.toUpperCase()} Dimension 2`} />
          </Suspense>
        ) : <div className='skel block' />
      default:
        return <div className='skel block' />
    }
  }

  // Visualization selector component
  const VisualizationSelector = ({ position, currentViz }) => {
    const isOpen = openVizSelector === position
    const visualizations = ['bar', 'wordcloud', 'network', 'heatmap', 'scatter']
    
    return (
      <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button
          className='btn secondary'
          style={{
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 600,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
          onClick={() => setOpenVizSelector(isOpen ? null : position)}
        >
          {getVisualizationName(currentViz)}
          <span style={{ fontSize: 8 }}>▼</span>
        </button>
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: 140
            }}
          >
            {visualizations.map(viz => {
              const isAvailable = isVisualizationAvailable(viz)
              const isSelected = currentViz === viz
              return (
                <button
                  key={viz}
                  className='btn'
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: 12,
                    border: 'none',
                    background: isSelected ? 'var(--c-accent)' : 'transparent',
                    color: isAvailable ? (isSelected ? '#111' : 'var(--c-text)') : 'var(--c-subtle)',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.5,
                    borderRadius: 0,
                    fontWeight: isSelected ? 600 : 400
                  }}
                  onClick={() => {
                    if (isAvailable) {
                      setChartVisualizations(prev => ({ ...prev, [position]: viz }))
                      setOpenVizSelector(null)
                    }
                  }}
                  disabled={!isAvailable}
                  title={!isAvailable ? `Not available for ${analysisType} analysis` : ''}
                >
                  {getVisualizationName(viz)}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Maximize modal functions
  const openMaximizeModal = (title, content) => {
    setModalTitle(title)
    setModalContent(content)
    setModalOpen(true)
  }

  const closeMaximizeModal = () => {
    setModalOpen(false)
    setModalContent(null)
  }

  const maximizeCharts = () => {
    const content = (
      <>
        <div className='chart-box' style={{minHeight: chartLayout === 'single' ? '100%' : 300}}>
          {renderVisualization(chartVisualizations.pos1)}
        </div>
        {chartLayout !== 'single' && (
          <>
            <div className='chart-box' style={{minHeight: 300}}>
              {renderVisualization(chartVisualizations.pos2)}
            </div>
            {chartLayout === 'grid' && (
              <>
                <div className='chart-box' style={{minHeight: 300}}>
                  {renderVisualization(chartVisualizations.pos3)}
                </div>
                <div className='chart-box' style={{minHeight: 300}}>
                  {renderVisualization(chartVisualizations.pos4)}
                </div>
              </>
            )}
          </>
        )}
      </>
    )
    openMaximizeModal('Live Summary Charts', content)
  }

  const maximizeSingleVisual = (type) => {
    let content = null
    let title = ''
    
    switch(type) {
      case 'wordcloud':
        title = 'Word Cloud'
        content = wordCloudData.length>0 ? (
          <div className='chart-box' style={{width: '100%', height: '100%', minHeight: 500}}>
            <Suspense fallback={<div className='skel block' />}>
              <WordCloud data={wordCloudData} width={800} height={600} />
            </Suspense>
          </div>
        ) : <div>No data available</div>
        break
      case 'network':
        title = 'Network Graph'
        content = networkData.nodes.length>0 ? (
          <div className='chart-box' style={{width: '100%', height: '100%', minHeight: 500}}>
            <Suspense fallback={<div className='skel block' />}>
              <NetworkGraph nodes={networkData.nodes} edges={networkData.edges} weightedLines={weightedLines} width={900} height={650} />
            </Suspense>
          </div>
        ) : <div>No data available</div>
        break
      case 'heatmap':
        title = 'Heatmap'
        content = heatmapData.matrix.length>0 ? (
          <div className='chart-box' style={{width: '100%', height: '100%', overflow: 'auto'}}>
            <Suspense fallback={<div className='skel block' />}>
              <Heatmap matrix={heatmapData.matrix} xLabels={heatmapData.xLabels} yLabels={heatmapData.yLabels} />
            </Suspense>
          </div>
        ) : <div>No data available</div>
        break
      default:
        return
    }
    
    openMaximizeModal(title, content)
  }

  // Virtualized table calc
  const totalRows = currentRows.length
  const [scrollTop,setScrollTop] = useState(0)
  const onScroll = (e) => setScrollTop(e.currentTarget.scrollTop)
  const startIndex = Math.max(0, Math.floor(scrollTop/ROW_HEIGHT)-VIRTUAL_OVERSCAN)
  const endIndex = Math.min(totalRows, Math.ceil((scrollTop+420)/ROW_HEIGHT)+VIRTUAL_OVERSCAN)
  const visibleRows = currentRows.slice(startIndex,endIndex)
  const offsetY = startIndex * ROW_HEIGHT

  return (
    <div id='app-shell' style={{display:'flex',width:'100%'}}>
      {modalOpen && (
        <Suspense fallback={null}>
          <VisualModal
            isOpen={modalOpen}
            onClose={closeMaximizeModal}
            title={modalTitle}
            layout={chartLayout}
          >
            {modalContent}
          </VisualModal>
        </Suspense>
      )}
      {showImportModal && pendingImportData && (
        <ImportPreviewModal
          isOpen={showImportModal}
          onClose={handleImportCancel}
          onConfirm={handleImportConfirm}
          workbookData={pendingImportData}
          fileName={pendingFileName}
          detectedFileType={pendingFileType}
        />
      )}
      {showHistoryModal && (
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          versionManager={versionManager.current}
          onJumpToVersion={jumpToHistoryVersion}
          currentIndex={historyInfo.currentIndex}
        />
      )}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className='sidebar-header'>
          {!sidebarCollapsed && (
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <img src="/ita-logo.svg" alt="ITA Logo" style={{width:28,height:28}} />
              <span>ITA</span>
            </div>
          )}
          {sidebarCollapsed && <img src="/ita-logo.svg" alt="ITA Logo" style={{width:28,height:28}} />}
          <button 
            className='sidebar-toggle' 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>
        <div className='nav'>
          <button className={activeView==='editor'?'active':''} onClick={()=>setActiveView('editor')} title='Editor'>
            {sidebarCollapsed ? '✏️' : 'Editor'}
          </button>
          <button className={activeView==='dashboard'?'active':''} onClick={()=>setActiveView('dashboard')} title='Analyzer'>
            {sidebarCollapsed ? '📊' : 'Analyzer'}
          </button>
          <button className={activeView==='wiki'?'active':''} onClick={()=>setActiveView('wiki')} title='Wiki'>
            {sidebarCollapsed ? '📖' : 'Wiki'}
          </button>
        </div>
        <div style={{padding:'12px 16px', fontSize:11, color:'var(--c-subtle)'}}>v0.3</div>
      </aside>
      <div className='main'>
        <div className='topbar'>
          <h1>{activeView === 'dashboard' ? 'Analyzer' : activeView === 'editor' ? 'Editor' : 'Wiki'}</h1>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className='theme-toggle' onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>{theme==='light'? '🌙 Dark':'☀️ Light'}</button>
            {activeView === 'editor' && (
              <>
                <button className='btn outline' onClick={handleUndo} disabled={!historyInfo.canUndo}>Undo</button>
                <button className='btn outline' onClick={handleRedo} disabled={!historyInfo.canRedo}>Redo</button>
                <button className='btn outline' onClick={() => setShowHistoryModal(true)} disabled={!versionManager.current.originalData}>History</button>
                <button className='btn outline' onClick={handleResetToOriginal} disabled={!versionManager.current.originalData}>Reset</button>
              </>
            )}
            <div style={{position: 'relative'}}>
              <button 
                className='btn outline' 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                disabled={!currentRows.length}
              >
                Export Data {showExportMenu ? '▲' : '▼'}
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: 150
                }}>
                  <button 
                    className='btn' 
                    style={{width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', borderRadius: 0, borderBottom: '1px solid var(--c-border)'}}
                    onClick={() => {
                      exportTransformed('xlsx')
                      setShowExportMenu(false)
                    }}
                  >
                    📊 Excel (.xlsx)
                  </button>
                  <button 
                    className='btn' 
                    style={{width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', borderRadius: 0}}
                    onClick={() => {
                      exportTransformed('csv')
                      setShowExportMenu(false)
                    }}
                  >
                    📄 CSV (.csv)
                  </button>
                </div>
              )}
            </div>
            {activeView === 'dashboard' && <button className='btn accent' onClick={exportAnalysis} disabled={!textSamples.length}>Export Analysis</button>}
          </div>
        </div>
        <div className='content'>
          {activeView === 'dashboard' ? (
            <>
          <div className='stats-grid'>
            <div className='stat-card'>
              <div className='stat-accent'></div>
              <h4>
                Documents
                <InfoTooltip 
                  text="Number of text samples being analyzed from combined rows" 
                  onNavigateToWiki={() => setActiveView('wiki')}
                />
              </h4>
              <div className='stat-value'>{statDocs}</div>
              <span className='subtle'>Rows combined</span>
            </div>
            <div className='stat-card'>
              <div className='stat-accent'></div>
              <h4>
                Tokens
                <InfoTooltip 
                  text="Total word count extracted by splitting text on whitespace" 
                  onNavigateToWiki={() => setActiveView('wiki')}
                />
              </h4>
              <div className='stat-value'>{statTokens}</div>
              <span className='subtle'>Whitespace split</span>
            </div>
            <div className='stat-card'>
              <div className='stat-accent'></div>
              <h4>
                Unique
                <InfoTooltip 
                  text="Number of distinct terms, n-grams, or entities found in your data" 
                  onNavigateToWiki={() => setActiveView('wiki')}
                />
              </h4>
              <div className='stat-value'>{statUniqueTerms||0}</div>
              <span className='subtle'>Terms / units</span>
            </div>
            <div className='stat-card'>
              <div className='stat-accent'></div>
              <h4>
                Mode
                <InfoTooltip 
                  text="Currently active analysis algorithm type" 
                  onNavigateToWiki={() => setActiveView('wiki')}
                />
              </h4>
              <div className='stat-value' style={{fontSize:22}}>{analysisType.toUpperCase()}</div>
              <span className='subtle'>Analysis type</span>
            </div>
          </div>
          <div className='analysis-layout'>
            <div className='side-stack'>
              {currentColumns.length>0 && (
                <div className='box'>
                  <h4>Analysis Columns</h4>
                  <SimpleColumnSelector columns={currentColumns} selectedColumns={selectedColumns} toggleColumn={selectColumnForText} />
                  <div className='notice'>Select columns for text analysis</div>
                </div>
              )}
              {/* Categorical Filters */}
              {(() => {
                const categCols = currentColumns.filter(col => 
                  categoricalColumns.includes(col) || columnTypes[col] === 'boolean'
                )
                return categCols.length > 0 ? (
                  <div className='box'>
                    <h4>Data Filters</h4>
                    {categCols.map(col => {
                      const values = getCategoricalValues(rawRows, col)
                      const selectedValues = categoricalFilters[col] || []
                      return (
                        <div key={col} style={{marginBottom:12}}>
                          <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:4}}>{col}</label>
                          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                            {values.map(value => {
                              const isSelected = selectedValues.length === 0 || selectedValues.includes(value)
                              return (
                                <button
                                  key={value}
                                  className='btn secondary'
                                  style={{
                                    padding:'4px 10px',
                                    fontSize:11,
                                    background: isSelected ? 'var(--c-accent)' : '#e2e8f0',
                                    color: isSelected ? '#111' : '#1e293b'
                                  }}
                                  onClick={() => {
                                    setCategoricalFilters(prev => {
                                      const current = prev[col] || []
                                      const updated = current.includes(value)
                                        ? current.filter(v => v !== value)
                                        : [...current, value]
                                      return { ...prev, [col]: updated }
                                    })
                                  }}
                                >
                                  {value}
                                </button>
                              )
                            })}
                          </div>
                          {selectedValues.length > 0 && (
                            <button 
                              className='btn secondary' 
                              style={{fontSize:11,padding:'2px 8px',marginTop:4}}
                              onClick={() => setCategoricalFilters(prev => ({ ...prev, [col]: [] }))}
                            >
                              Clear Filter
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : null
              })()}
              <div className='box'>
                <h4>Analysis Settings</h4>
                <label style={{fontSize:12}}>
                  Type
                  <InfoTooltip 
                    text="Choose the analysis algorithm that best suits your goals" 
                    onNavigateToWiki={() => setActiveView('wiki')}
                  />
                  <select value={analysisType} onChange={e=>setAnalysisType(e.target.value)} style={{width:'100%',marginTop:4}}>
                    <option value='ngram'>N-Gram</option>
                    <option value='tfidf'>TF-IDF</option>
                    <option value='assoc'>Association</option>
                    <option value='ner'>NER</option>
                    <option value='embeddings'>Embeddings</option>
                    <option value='dependency'>Dependency Parsing</option>
                  </select>
                </label>
                {analysisType==='ngram' && (
                  <div className='notice' style={{marginTop:8}}>
                    <strong>N-Gram:</strong> Finds common word sequences/phrases in your text.
                  </div>
                )}
                {analysisType==='tfidf' && (
                  <div className='notice' style={{marginTop:8}}>
                    <strong>TF-IDF:</strong> Identifies important terms by balancing frequency with rarity.
                  </div>
                )}
                {analysisType==='assoc' && (
                  <div className='notice' style={{marginTop:8}}>
                    <strong>Association:</strong> Discovers which terms frequently appear together.
                  </div>
                )}
                {analysisType==='ner' && (
                  <div className='notice' style={{marginTop:8}}>
                    <strong>NER:</strong> Extracts named entities (people, places, organizations).
                  </div>
                )}
                {analysisType==='embeddings' && (
                  <div className='notice' style={{marginTop:8}}>
                    <strong>Embeddings:</strong> Visualizes document relationships in 2D space using dimensionality reduction.
                  </div>
                )}
                {analysisType==='dependency' && (
                  <>
                    <div className='notice' style={{marginTop:8}}>
                      <strong>Dependency Parsing:</strong> Analyzes sentence structure by identifying grammatical dependencies between words.
                    </div>
                    {dependencyProgress > 0 && dependencyProgress < 100 && (
                      <div className='notice' style={{marginTop:8, background: '#e3f2fd', border: '1px solid #2196f3'}}>
                        Processing: {dependencyProgress}%
                      </div>
                    )}
                  </>
                )}
                {analysisType==='ngram' && <label style={{fontSize:12}}>N Size<input type='number' min={1} max={6} value={ngramN} onChange={e=>setNgramN(Number(e.target.value)||2)} style={{width:'100%',marginTop:4}}/></label>}
                {analysisType==='assoc' && <label style={{fontSize:12}}>Min Support<input type='number' step={0.01} value={minSupport} onChange={e=>setMinSupport(Math.min(Math.max(Number(e.target.value)||0,0.01),0.8))} style={{width:'100%',marginTop:4}}/></label>}
                {analysisType==='embeddings' && (
                  <label style={{fontSize:12}}>
                    Method
                    <select value={dimReductionMethod} onChange={e=>setDimReductionMethod(e.target.value)} style={{width:'100%',marginTop:4}}>
                      <option value='tsne'>t-SNE</option>
                      <option value='umap'>UMAP</option>
                    </select>
                  </label>
                )}
                {analysisType==='dependency' && (
                  <>
                    <label style={{fontSize:12}}>
                      Algorithm
                      <select value={dependencyAlgorithm} onChange={e=>setDependencyAlgorithm(e.target.value)} style={{width:'100%',marginTop:4}}>
                        <option value='eisner'>Eisner's Algorithm</option>
                        <option value='chu-liu'>Chu-Liu/Edmonds</option>
                        <option value='arc-standard'>Arc-Standard</option>
                      </select>
                    </label>
                    <label style={{fontSize:12}}>
                      Sample Size: {dependencySamplePercent}%
                      <input 
                        type='range' 
                        min={1} 
                        max={100} 
                        value={dependencySamplePercent} 
                        onChange={e=>setDependencySamplePercent(Number(e.target.value))} 
                        style={{width:'100%',marginTop:4}}
                      />
                      <div className='notice' style={{marginTop:4}}>
                        {Math.ceil(textSamples.length * (dependencySamplePercent / 100))} of {textSamples.length} rows
                      </div>
                    </label>
                  </>
                )}
                <label style={{fontSize:12}}><input type='checkbox' checked={enableStemming} onChange={e=>setEnableStemming(e.target.checked)} /> Stemming (light)</label>
                <textarea rows={3} placeholder='Custom stopwords' value={stopwordInput} onChange={e=>setStopwordInput(e.target.value)} />
                <div className='notice'>Stopwords: {effectiveStopwords.size}</div>
              </div>
            </div>
            <div className='analysis-view'>
              {analysisType==='ner' && !libsLoaded && textSamples.length>0 && <div className='alert'>Loading NER model...</div>}
              {analysisType==='embeddings' && dimReductionLoading && <div className='alert'>Loading dimensionality reduction...</div>}
              {analysisType==='embeddings' && !dimReductionLoading && !dimReductionLibs.loaded && <div className='alert'>Initializing embeddings analysis...</div>}
              {analysisType==='embeddings' && textSamples.length<3 && <div className='alert'>Need at least 3 documents for embeddings analysis</div>}
              {analysisType==='dependency' && textSamples.length>0 && !dependencyResult && <div className='alert'>Analyzing dependencies...</div>}
              <div className='panel'>
                <div className='panel-header'>
                  <h3>Live Summary Charts</h3>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button 
                      className='maximize-btn' 
                      onClick={maximizeCharts}
                      title='Maximize charts'
                    >
                      ⛶
                    </button>
                    <span className='subtle'>Layout:</span>
                    <button className='btn secondary' style={{padding:'4px 8px',fontSize:11,background:chartLayout==='single'?'var(--c-accent)':'#e2e8f0',color:chartLayout==='single'?'#111':'#1e293b'}} onClick={()=>setChartLayout('single')}>Single</button>
                    <button className='btn secondary' style={{padding:'4px 8px',fontSize:11,background:chartLayout==='side-by-side'?'var(--c-accent)':'#e2e8f0',color:chartLayout==='side-by-side'?'#111':'#1e293b'}} onClick={()=>setChartLayout('side-by-side')}>Side-by-Side</button>
                    <button className='btn secondary' style={{padding:'4px 8px',fontSize:11,background:chartLayout==='grid'?'var(--c-accent)':'#e2e8f0',color:chartLayout==='grid'?'#111':'#1e293b'}} onClick={()=>setChartLayout('grid')}>2x2 Grid</button>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gap: 24,
                  gridTemplateColumns: chartLayout === 'single' ? '1fr' : chartLayout === 'side-by-side' ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                  gridTemplateRows: chartLayout === 'grid' ? 'repeat(2, 1fr)' : 'auto'
                }}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    <VisualizationSelector position='pos1' currentViz={chartVisualizations.pos1} />
                    <div className='chart-box' style={{minHeight: chartLayout === 'single' ? 320 : 240}}>
                      {renderVisualization(chartVisualizations.pos1)}
                    </div>
                  </div>
                  {chartLayout !== 'single' && (
                    <>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <VisualizationSelector position='pos2' currentViz={chartVisualizations.pos2} />
                        <div className='chart-box' style={{minHeight: 240}}>
                          {renderVisualization(chartVisualizations.pos2)}
                        </div>
                      </div>
                      {chartLayout === 'grid' && (
                        <>
                          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            <VisualizationSelector position='pos3' currentViz={chartVisualizations.pos3} />
                            <div className='chart-box' style={{minHeight: 240}}>
                              {renderVisualization(chartVisualizations.pos3)}
                            </div>
                          </div>
                          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            <VisualizationSelector position='pos4' currentViz={chartVisualizations.pos4} />
                            <div className='chart-box' style={{minHeight: 240}}>
                              {renderVisualization(chartVisualizations.pos4)}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className='panel'>
                <div className='panel-header'>
                  <h3>Details</h3>
                  <span className='subtle'>Top results</span>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:24}}>
                  <div style={{flex:'1 1 280px',minWidth:260}} className='result-section'>
                    {analysisType==='tfidf' && tfidf && <>
                      <h3>TF-IDF Terms</h3>
                      <ol className='result-list'>
                        {tfidf.aggregate.slice(0, detailsExpanded ? 40 : 10).map(t=> <li key={t.term}>{t.term} <span className='subtle'>({t.score.toFixed(2)})</span></li>)}
                      </ol>
                      {tfidf.aggregate.length > 10 && (
                        <button className='btn secondary' style={{marginTop:8,padding:'4px 10px',fontSize:11}} onClick={()=>setDetailsExpanded(!detailsExpanded)}>
                          {detailsExpanded ? 'Show Less' : `Show More (${tfidf.aggregate.length - 10} more)`}
                        </button>
                      )}
                    </>}
                    {analysisType==='ngram' && <>
                      <h3>N-Grams</h3>
                      <ol className='result-list'>
                        {ngrams.slice(0, detailsExpanded ? 40 : 10).map(g=> <li key={g.gram}>{g.gram} <span className='subtle'>({g.count})</span></li>)}
                      </ol>
                      {ngrams.length > 10 && (
                        <button className='btn secondary' style={{marginTop:8,padding:'4px 10px',fontSize:11}} onClick={()=>setDetailsExpanded(!detailsExpanded)}>
                          {detailsExpanded ? 'Show Less' : `Show More (${ngrams.length - 10} more)`}
                        </button>
                      )}
                    </>}
                    {analysisType==='assoc' && associations && <>
                      <h3>Items</h3>
                      <ol className='result-list'>
                        {associations.items.slice(0, detailsExpanded ? 40 : 10).map(i=> <li key={i.item}>{i.item} <span className='subtle'>({(i.support*100).toFixed(1)}%)</span></li>)}
                      </ol>
                      {associations.items.length > 10 && (
                        <button className='btn secondary' style={{marginTop:8,padding:'4px 10px',fontSize:11}} onClick={()=>setDetailsExpanded(!detailsExpanded)}>
                          {detailsExpanded ? 'Show Less' : `Show More (${associations.items.length - 10} more)`}
                        </button>
                      )}
                    </>}
                    {analysisType==='ner' && <>
                      <h3>Entities</h3>
                      <ol className='result-list'>
                        {entities.slice(0, detailsExpanded ? 40 : 10).map(e=> <li key={e.value}>{e.value} <span className='subtle'>({e.count})</span></li>)}
                      </ol>
                      {entities.length > 10 && (
                        <button className='btn secondary' style={{marginTop:8,padding:'4px 10px',fontSize:11}} onClick={()=>setDetailsExpanded(!detailsExpanded)}>
                          {detailsExpanded ? 'Show Less' : `Show More (${entities.length - 10} more)`}
                        </button>
                      )}
                    </>}
                    {analysisType==='embeddings' && embeddings && <>
                      <h3>Embedding Info</h3>
                      <div className='notice'>
                        <p><strong>Documents:</strong> {embeddings.vectors.length}</p>
                        <p><strong>Vocabulary size:</strong> {embeddings.vocab.length} terms</p>
                        <p><strong>Dimensionality:</strong> Reduced from {embeddings.vocab.length}D to 2D</p>
                        <p><strong>Method:</strong> {dimReductionMethod.toUpperCase()}</p>
                      </div>
                      <p style={{fontSize:12,marginTop:12,color:'var(--c-text-muted)'}}>
                        Each point represents a document in semantic space. Documents with similar content are positioned closer together.
                      </p>
                    </>}
                  </div>
                  <div style={{flex:'1 1 320px',minWidth:300}} className='result-section'>
                    {analysisType==='assoc' && associations && <>
                      <h3>Pairs (Lift)</h3>
                      <ol className='result-list'>
                        {associations.pairs.slice(0, detailsExpanded ? 40 : 10).map(p=> <li key={p.a+'|'+p.b}>{p.a}+{p.b} <span className='subtle'>lift {p.lift.toFixed(2)}</span></li>)}
                      </ol>
                      {associations.pairs.length > 10 && (
                        <button className='btn secondary' style={{marginTop:8,padding:'4px 10px',fontSize:11}} onClick={()=>setDetailsExpanded(!detailsExpanded)}>
                          {detailsExpanded ? 'Show Less' : `Show More (${associations.pairs.length - 10} more)`}
                        </button>
                      )}
                    </>}
                    {analysisType==='tfidf' && tfidf && <>
                      <h3>Doc 1 Top Terms</h3>
                      <ol className='result-list'>
                        {(tfidf.perDoc[0]||[]).slice(0, detailsExpanded ? 30 : 10).map(t=> <li key={t.term}>{t.term} <span className='subtle'>({t.tfidf.toFixed(2)})</span></li>)}
                      </ol>
                      {(tfidf.perDoc[0]||[]).length > 10 && (
                        <button className='btn secondary' style={{marginTop:8,padding:'4px 10px',fontSize:11}} onClick={()=>setDetailsExpanded(!detailsExpanded)}>
                          {detailsExpanded ? 'Show Less' : `Show More (${(tfidf.perDoc[0]||[]).length - 10} more)`}
                        </button>
                      )}
                    </>}
                    {analysisType==='ngram' && <div className='notice'>Switch visualization mode for graphs.</div>}
                    {analysisType==='ner' && <div className='notice'>Aggregated entity counts shown.</div>}
                  </div>
                  <div style={{flex:'1 1 420px',minWidth:360}} className='result-section'>
                    <div style={{marginBottom:12,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                        {['list','wordcloud','network','heatmap'].map(m => <button key={m} className='btn secondary' style={{padding:'4px 10px',fontSize:11,background:viewMode===m?'var(--c-accent)':'#e2e8f0',color:viewMode===m?'#111':'#1e293b'}} onClick={()=>setViewMode(m)}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>)}
                        {viewMode==='network' && <label style={{fontSize:11,display:'flex',alignItems:'center',gap:4,marginLeft:8}}><input type='checkbox' checked={weightedLines} onChange={e=>setWeightedLines(e.target.checked)} />Weighted Lines</label>}
                      </div>
                      {viewMode !== 'list' && (
                        <button 
                          className='maximize-btn' 
                          onClick={() => maximizeSingleVisual(viewMode)}
                          title='Maximize visualization'
                        >
                          ⛶
                        </button>
                      )}
                    </div>
                    {viewMode==='wordcloud' && <WordCloud data={wordCloudData} />}
                    {viewMode==='network' && <NetworkGraph nodes={networkData.nodes} edges={networkData.edges} weightedLines={weightedLines} />}
                    {viewMode==='heatmap' && <Heatmap matrix={heatmapData.matrix} xLabels={heatmapData.xLabels} yLabels={heatmapData.yLabels} />}
                    {viewMode==='list' && <div className='notice'>Choose a visualization mode.</div>}
                  </div>
                </div>
              </div>
              {currentRows.length>0 && (
                <div className='panel'>
                  <div className='panel-header'><h3>Data Preview</h3><span className='subtle'>Virtualized ({totalRows} rows)</span></div>
                  <div className='table-scroll virtual-container' onScroll={onScroll} style={{maxHeight:420}}>
                    <div className='virtual-spacer' style={{height: totalRows*ROW_HEIGHT}}>
                      <table style={{position:'absolute', top:0, left:0, width:'100%'}}>
                        <thead><tr>{displayedColumns.map(c=> <th key={c}>{renames[c]||c}</th>)}</tr></thead>
                        <tbody>
                          <tr style={{height:offsetY}}></tr>
                          {visibleRows.map((r,i)=> <tr key={startIndex+i} style={{height:ROW_HEIGHT}}>{displayedColumns.map(c=> <td key={c}>{String(r[c]).slice(0,90)}</td>)}</tr>)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
          ) : activeView === 'wiki' ? (
            /* Wiki View */
            <Wiki />
          ) : (
            /* Editor View */
            <>
              <div className='panel'>
                <div className='panel-header'>
                  <h3>Data Editor</h3>
                  <span className='subtle'>History: {historyInfo.currentIndex + 1}/{historyInfo.historyLength}</span>
                </div>
                <div style={{marginBottom:20}}>
                  <h4 style={{marginBottom:10}}>Data Source</h4>
                  <input 
                    type='file' 
                    id='file-upload-input'
                    accept='.xlsx,.xls,.csv' 
                    onChange={handleFile}
                    style={{display:'none'}}
                  />
                  <label htmlFor='file-upload-input' className='btn secondary' style={{display:'inline-block',cursor:'pointer',background:'#e2e8f0',marginBottom:8}}>
                    Choose File
                  </label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <button className='btn secondary' style={{background:'#e2e8f0'}} onClick={()=>fetch(new URL('sample-data.csv', import.meta.env.BASE_URL)).then(r=>r.text()).then(txt=>{const p=parseCsv(txt); versionManager.current.initialize(p); setHistoryInfo(versionManager.current.getHistoryInfo()); setWorkbookData({'Sample CSV':p}); setActiveSheet('Sample CSV'); setSelectedColumns([]); setHiddenColumns([]); setRenames({}) })}>Load CSV Sample</button>
                    <button className='btn secondary' style={{background:'#e2e8f0'}} onClick={loadSampleExcel}>Load Excel Sample</button>
                  </div>
                </div>
                <div style={{marginBottom:16}}>
                  {Object.keys(workbookData).length>0 && <SheetSelector sheets={Object.keys(workbookData)} activeSheet={activeSheet} setActiveSheet={setActiveSheet} />}
                </div>
                <div style={{marginBottom:20}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <h4 style={{margin:0}}>Column Management</h4>
                    {currentColumns.length > 0 && (
                      <button 
                        className='btn secondary' 
                        style={{fontSize:11,padding:'4px 10px'}}
                        onClick={() => {
                          const detected = detectCategoricalColumns(currentRows, currentColumns)
                          setCategoricalColumns(prev => {
                            const combined = [...new Set([...prev, ...detected])]
                            return combined
                          })
                        }}
                      >
                        Auto-Detect Categorical
                      </button>
                    )}
                  </div>
                  {currentColumns.length > 0 ? (
                    <div style={{maxHeight:400,overflowY:'auto'}}>
                      <table className='column-mgmt-table'>
                        <thead>
                          <tr>
                            <th>Column Name</th>
                            <th>Analyze</th>
                            <th>Categorical</th>
                            <th>Type</th>
                            <th>Edit Name</th>
                            <th>Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentColumns.map(col => {
                            const isAnalyze = selectedColumns.includes(col)
                            const isCategorical = categoricalColumns.includes(col)
                            return (
                            <tr key={col}>
                              <td style={{fontWeight:500}}>{col}</td>
                              <td style={{textAlign:'center'}}>
                                <input 
                                  type='checkbox'
                                  className='column-mgmt-checkbox'
                                  checked={isAnalyze}
                                  onChange={() => {
                                    if (isCategorical) {
                                      // Remove from categorical and add to analyze
                                      setCategoricalColumns(prev => prev.filter(c => c !== col))
                                      selectColumnForText(col)
                                    } else {
                                      selectColumnForText(col)
                                    }
                                  }}
                                  title='Select for text analysis'
                                  style={{
                                    opacity: isCategorical && !isAnalyze ? 0.3 : 1,
                                    cursor: 'pointer'
                                  }}
                                />
                              </td>
                              <td style={{textAlign:'center'}}>
                                <input 
                                  type='checkbox'
                                  className='column-mgmt-checkbox'
                                  checked={isCategorical}
                                  onChange={() => {
                                    if (isAnalyze) {
                                      // Remove from analyze and add to categorical
                                      selectColumnForText(col)
                                      setCategoricalColumns(prev => 
                                        prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                                      )
                                    } else {
                                      setCategoricalColumns(prev => 
                                        prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                                      )
                                    }
                                  }}
                                  title='Flag as categorical for filtering'
                                  style={{
                                    opacity: isAnalyze && !isCategorical ? 0.3 : 1,
                                    cursor: 'pointer'
                                  }}
                                />
                              </td>
                              <td>
                                <select 
                                  value={columnTypes[col] || 'text'}
                                  onChange={(e) => setColumnTypes(prev => ({ ...prev, [col]: e.target.value }))}
                                >
                                  <option value="text">text</option>
                                  <option value="number">number</option>
                                  <option value="date">date</option>
                                  <option value="boolean">boolean</option>
                                </select>
                              </td>
                              <td>
                                <input 
                                  type='text' 
                                  placeholder='New name...'
                                  onBlur={(e) => {
                                    if (e.target.value && e.target.value !== col) {
                                      renameColumn(col, e.target.value)
                                      e.target.value = ''
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur()
                                    }
                                  }}
                                />
                              </td>
                              <td style={{textAlign:'center'}}>
                                <button 
                                  className='column-mgmt-delete-btn'
                                  onClick={() => deleteColumn(col)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className='column-mgmt-empty'>
                      No Data
                    </div>
                  )}
                </div>
                {/* Text Case Transformation */}
                <div style={{marginBottom:20}}>
                  <h4 style={{marginBottom:10}}>Text Transformations</h4>
                  {currentColumns.length > 0 ? (
                    <>
                      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                        <select 
                          id='transform-column-select'
                          style={{padding:'4px 8px',fontSize:12,border:'1px solid var(--c-border)',borderRadius:4,background:'var(--c-surface)',color:'var(--c-text)',flex:'1 1 200px',maxWidth:250}}
                        >
                          <option value="">Select column...</option>
                          {currentColumns.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                        <button 
                          className='btn secondary' 
                          style={{fontSize:12,padding:'4px 12px'}}
                          onClick={() => {
                            const select = document.getElementById('transform-column-select')
                            if (select.value) {
                              transformColumn(select.value, 'uppercase')
                            }
                          }}
                        >
                          ↑ UPPERCASE Column
                        </button>
                        <button 
                          className='btn secondary' 
                          style={{fontSize:12,padding:'4px 12px'}}
                          onClick={() => {
                            const select = document.getElementById('transform-column-select')
                            if (select.value) {
                              transformColumn(select.value, 'lowercase')
                            }
                          }}
                        >
                          ↓ lowercase Column
                        </button>
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                        <button 
                          className='btn secondary' 
                          style={{fontSize:12,padding:'4px 12px'}}
                          onClick={() => transformAll('uppercase')}
                          disabled={currentRows.length === 0}
                        >
                          ↑ UPPERCASE All ({activeSheet === '__ALL__' ? 'All Sheets' : activeSheet || 'Current Sheet'})
                        </button>
                        <button 
                          className='btn secondary' 
                          style={{fontSize:12,padding:'4px 12px'}}
                          onClick={() => transformAll('lowercase')}
                          disabled={currentRows.length === 0}
                        >
                          ↓ lowercase All ({activeSheet === '__ALL__' ? 'All Sheets' : activeSheet || 'Current Sheet'})
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className='column-mgmt-empty'>
                      No Data
                    </div>
                  )}
                </div>
                {/* Text Search Filter */}
                <div style={{marginBottom:20}}>
                  <h4 style={{marginBottom:10}}>Text Search Filter</h4>
                  {currentColumns.length > 0 ? (
                    <>
                      <input 
                        type='text'
                        placeholder='Search across all columns...'
                        value={textSearchFilter}
                        onChange={(e) => setTextSearchFilter(e.target.value)}
                        style={{
                          width: '100%',
                          maxWidth: 500,
                          padding: '8px 12px',
                          fontSize: 13,
                          border: '1px solid var(--c-border)',
                          borderRadius: 6,
                          background: 'var(--c-surface)',
                          color: 'var(--c-text)'
                        }}
                      />
                      {textSearchFilter && (
                        <div style={{marginTop: 6, fontSize: 12, color: 'var(--c-text-muted)'}}>
                          Showing {currentRows.length} of {rawRows.length} rows
                          {currentRows.length !== rawRows.length && (
                            <button 
                              className='btn secondary' 
                              style={{fontSize:11,padding:'2px 8px',marginLeft:8}}
                              onClick={() => setTextSearchFilter('')}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className='column-mgmt-empty'>
                      No Data
                    </div>
                  )}
                </div>
                {/* Categorical Filters in Editor */}
                {(() => {
                  const categCols = currentColumns.filter(col => 
                    categoricalColumns.includes(col) || columnTypes[col] === 'boolean'
                  )
                  return categCols.length > 0 ? (
                    <div style={{marginBottom:20}}>
                      <h4 style={{marginBottom:10}}>Categorical Filters</h4>
                      {categCols.map(col => {
                        const values = getCategoricalValues(rawRows, col)
                        const selectedValues = categoricalFilters[col] || []
                        return (
                          <div key={col} style={{marginBottom:12}}>
                            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:4}}>{col}</label>
                            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                              {values.map(value => {
                                const isSelected = selectedValues.length === 0 || selectedValues.includes(value)
                                return (
                                  <button
                                    key={value}
                                    className='btn secondary'
                                    style={{
                                      padding:'4px 10px',
                                      fontSize:11,
                                      background: isSelected ? 'var(--c-accent)' : '#e2e8f0',
                                      color: isSelected ? '#111' : '#1e293b'
                                    }}
                                    onClick={() => {
                                      setCategoricalFilters(prev => {
                                        const current = prev[col] || []
                                        const updated = current.includes(value)
                                          ? current.filter(v => v !== value)
                                          : [...current, value]
                                        return { ...prev, [col]: updated }
                                      })
                                    }}
                                  >
                                    {value}
                                  </button>
                                )
                              })}
                            </div>
                            {selectedValues.length > 0 && (
                              <button 
                                className='btn secondary' 
                                style={{fontSize:11,padding:'2px 8px',marginTop:4}}
                                onClick={() => setCategoricalFilters(prev => ({ ...prev, [col]: [] }))}
                              >
                                Clear Filter
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : null
                })()}
                {currentRows.length > 0 && (
                  <div>
                    <h4 style={{marginBottom:10}}>Data Preview</h4>
                    <div className='table-scroll virtual-container' onScroll={onScroll} style={{maxHeight:500}}>
                      <div className='virtual-spacer' style={{height: totalRows*ROW_HEIGHT}}>
                        <table style={{position:'absolute', top:0, left:0, width:'100%'}}>
                          <thead>
                            <tr>
                              <th style={{width:40}}>#</th>
                              {displayedColumns.map(c=> <th key={c}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{height:offsetY}}></tr>
                            {visibleRows.map((r,i)=> (
                              <tr key={startIndex+i} style={{height:ROW_HEIGHT}}>
                                <td style={{fontSize:11,color:'var(--c-subtle)'}}>{startIndex+i+1}</td>
                                {displayedColumns.map(c=> <td key={c}>{String(r[c]).slice(0,90)}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <footer>Interactive Text Analyzer • {libsLoaded? 'NER Ready':'NER Lazy'} • Theme: {theme} • Created by <a href="https://github.com/TheOneHyer" target="_blank" rel="noopener noreferrer" style={{color:'var(--c-accent)',textDecoration:'none'}}>Alex Hyer</a></footer>
        </div>
      </div>
    </div>
  )
}
