import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react'
import './App.css'
import * as XLSX from 'xlsx'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts'

// Code-split heavy visualization pieces
const WordCloud = lazy(()=>import('./components/WordCloud'))
const NetworkGraph = lazy(()=>import('./components/NetworkGraph'))
const Heatmap = lazy(()=>import('./components/Heatmap'))

// Lightweight tokenization utilities (replace heavy natural for ngram + assoc)
const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)
const buildStem = () => { const cache=new Map(); return w=>{ if(cache.has(w)) return cache.get(w); const s=w.replace(/(ing|ed|ly|s)$/,''); cache.set(w,s); return s } }

// Lazy load only compromise for NER when needed
let compromiseRef=null
const loadNlpLibs = async () => { if(!compromiseRef) compromiseRef = (await import('compromise')).default || (await import('compromise')); return { nlp: compromiseRef } }

const DEFAULT_STOPWORDS = new Set(['the','a','an','and','or','but','if','then','else','of','to','in','on','for','with','this','that','it','is','are','was','were','be','as','by','at','from'])
const useDebounced = (value, delay=400) => { const [v,setV]=useState(value); useEffect(()=>{const t=setTimeout(()=>setV(value),delay); return()=>clearTimeout(t)},[value,delay]); return v }

// TF-IDF (simplified)
const computeTfIdf = (docs,{stopwords,stem,stemmer})=>{ const termFreqs=[]; const docFreq={}; docs.forEach(d=>{const counts={}; tokenize(d).forEach(tok=>{if(stopwords.has(tok))return; const t=stem?stemmer(tok):tok; counts[t]=(counts[t]||0)+1}); termFreqs.push(counts); Object.keys(counts).forEach(t=>{docFreq[t]=(docFreq[t]||0)+1})}); const N=docs.length; const perDoc=termFreqs.map(tf=>{return Object.entries(tf).map(([term,c])=>{const idf=Math.log((1+N)/(1+docFreq[term]))+1; return {term, tfidf:c*idf}}).sort((a,b)=>b.tfidf-a.tfidf).slice(0,80)}); const aggMap={}; perDoc.forEach(list=>list.forEach(({term,tfidf})=>{aggMap[term]=(aggMap[term]||0)+tfidf})); const aggregate=Object.entries(aggMap).map(([term,score])=>({term,score})).sort((a,b)=>b.score-a.score).slice(0,150); return { perDoc, aggregate } }
const generateNGrams=(texts,{n=2,top=80,stopwords,stem,stemmer})=>{ const freq={}; texts.forEach(t=>{let tokens=tokenize(t).filter(x=>!stopwords.has(x)); if(stem) tokens=tokens.map(stemmer); for(let i=0;i<=tokens.length-n;i++){const g=tokens.slice(i,i+n).join(' '); freq[g]=(freq[g]||0)+1}}); return Object.entries(freq).map(([gram,count])=>({gram,count})).sort((a,b)=>b.count-a.count).slice(0,top)}
const mineAssociations=(rows,cols,{minSupport=0.02,stopwords,stem,stemmer})=>{ const tx=rows.map(r=>{let tokens=tokenize(cols.map(c=>(r[c]??'').toString()).join(' ')).filter(x=>!stopwords.has(x)); if(stem) tokens=tokens.map(stemmer); return Array.from(new Set(tokens))}); const itemCounts={}; tx.forEach(tr=>tr.forEach(it=>itemCounts[it]=(itemCounts[it]||0)+1)); const total=tx.length; const items=Object.entries(itemCounts).filter(([,c])=>c/total>=minSupport).map(([item,c])=>({item,support:c/total,count:c})); const itemSet=new Set(items.map(i=>i.item)); const pairCounts={}; tx.forEach(tr=>{const f=tr.filter(t=>itemSet.has(t)); for(let i=0;i<f.length;i++) for(let j=i+1;j<f.length;j++){const a=f[i],b=f[j]; const k=a<b? a+'|'+b : b+'|'+a; pairCounts[k]=(pairCounts[k]||0)+1}}); const pairs=Object.entries(pairCounts).map(([k,c])=>{const [a,b]=k.split('|'); const support=c/total; if(support<minSupport) return null; const confAB=c/itemCounts[a]; const confBA=c/itemCounts[b]; const lift=support/((itemCounts[a]/total)*(itemCounts[b]/total)); return {a,b,support,count:c,confidenceAB:confAB,confidenceBA:confBA,lift}}).filter(Boolean).sort((a,b)=>b.lift-a.lift).slice(0,200); return { items:items.sort((a,b)=>b.support-a.support), pairs } }
const extractEntities=(texts,nlp)=>{ const ent={}; texts.forEach(t=>{const doc=nlp(t); ['people','places','organizations'].forEach(k=> doc[k]().out('array').forEach(v=>{ent[v]=(ent[v]||0)+1}))}); return Object.entries(ent).map(([value,count])=>({value,type:'Entity',count})).sort((a,b)=>b.count-a.count).slice(0,150) }

const SheetSelector=({sheets,activeSheet,setActiveSheet})=> (<div className='flex-row'>{sheets.map(n=> <button key={n} className='btn secondary' style={{background:n===activeSheet?'var(--c-accent)':'#e2e8f0',color:n===activeSheet?'#111':'#1e293b'}} onClick={()=>setActiveSheet(n)}>{n}</button>)}<button className='btn secondary' style={{background:activeSheet==='__ALL__'?'var(--c-accent)':'#e2e8f0',color:activeSheet==='__ALL__'?'#111':'#1e293b'}} onClick={()=>setActiveSheet('__ALL__')}>All Sheets</button></div>)

function ColumnManager({columns,hiddenColumns,renames,toggleHide,setRename,selectColumnForText,selectedTextColumns}){ return (<div className='column-editor'>{columns.map(col=>{const hidden=hiddenColumns.includes(col); const selected=selectedTextColumns.includes(col); return (<div className='column-row' key={col}><input value={renames[col]||''} placeholder={col} onChange={e=>setRename(col,e.target.value)} /><div className='col-buttons'><button className={`tag-btn ${selected?'active':''}`} onClick={()=>selectColumnForText(col)}>TXT</button><button className={`hide-btn ${hidden?'hidden':''}`} onClick={()=>toggleHide(col)}>{hidden? 'Show':'Hide'}</button></div></div>)})}</div>) }

const LOCAL_KEY='ita_state_v1'
const ROW_HEIGHT=26
const VIRTUAL_OVERSCAN=8

export default function App(){
  const [workbookData,setWorkbookData]=useState({})
  const [activeSheet,setActiveSheet]=useState(null)
  const [selectedColumns,setSelectedColumns]=useState([])
  const [analysisType,setAnalysisType]=useState('ngram')
  const [ngramN,setNgramN]=useState(2)
  const [hiddenColumns,setHiddenColumns]=useState([])
  const [renames,setRenames]=useState({})
  const [stopwordInput,setStopwordInput]=useState('')
  const debouncedStopwordInput=useDebounced(stopwordInput,500)
  const [customStopwords,setCustomStopwords]=useState(new Set())
  const [enableStemming,setEnableStemming]=useState(false)
  const [libsLoaded,setLibsLoaded]=useState(false)
  const [nlpLibs,setNlpLibs]=useState({nlp:null})
  const [minSupport,setMinSupport]=useState(0.05)
  const [theme,setTheme]=useState(()=>localStorage.getItem('ita_theme')||'light')
  const [showBarLabels,setShowBarLabels]=useState(true)
  const [networkMinLift,setNetworkMinLift]=useState(1)
  const [dashboardLayout,setDashboardLayout]=useState('2') // '1','2','4'
  const [visSlots,setVisSlots]=useState(['bar','wordcloud','network','heatmap'])

  // Restore settings (no eval)
  useEffect(()=>{ try{ const s=JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}'); if(Array.isArray(s.selectedColumns)) setSelectedColumns(s.selectedColumns); if(typeof s.analysisType==='string') setAnalysisType(s.analysisType); if(typeof s.ngramN==='number') setNgramN(s.ngramN); if(Array.isArray(s.hiddenColumns)) setHiddenColumns(s.hiddenColumns); if(s.renames && typeof s.renames==='object') setRenames(s.renames); if(Array.isArray(s.stopwords)) setCustomStopwords(new Set(s.stopwords)); if(typeof s.enableStemming==='boolean') setEnableStemming(s.enableStemming); if(typeof s.minSupport==='number') setMinSupport(s.minSupport); if(typeof s.showBarLabels==='boolean') setShowBarLabels(s.showBarLabels); if(typeof s.networkMinLift==='number') setNetworkMinLift(s.networkMinLift); if(typeof s.dashboardLayout==='string') setDashboardLayout(s.dashboardLayout); if(Array.isArray(s.visSlots)) setVisSlots(v=> s.visSlots.concat(v).slice(0,4)) }catch{} },[])
  // Persist settings
  useEffect(()=>{ localStorage.setItem(LOCAL_KEY, JSON.stringify({ selectedColumns, analysisType, ngramN, hiddenColumns, renames, stopwords:[...customStopwords], enableStemming, minSupport, showBarLabels, networkMinLift, dashboardLayout, visSlots })) },[selectedColumns,analysisType,ngramN,hiddenColumns,renames,customStopwords,enableStemming,minSupport,showBarLabels,networkMinLift,dashboardLayout,visSlots])
  useEffect(()=>{ localStorage.setItem('ita_theme',theme); document.documentElement.dataset.theme=theme },[theme])

  // Stopwords parse
  useEffect(()=>{ if(debouncedStopwordInput){ const list=debouncedStopwordInput.split(/[\n,\s,]+/).map(x=>x.trim().toLowerCase()).filter(Boolean); setCustomStopwords(new Set(list)) }},[debouncedStopwordInput])
  const effectiveStopwords=useMemo(()=> new Set([...DEFAULT_STOPWORDS,...customStopwords]),[customStopwords])

  const loadNERIfNeeded=useCallback(async()=>{ if(libsLoaded || analysisType!=='ner') return; const libs=await loadNlpLibs(); setNlpLibs(libs); setLibsLoaded(true)},[libsLoaded,analysisType])
  useEffect(()=>{ loadNERIfNeeded() },[analysisType,workbookData,loadNERIfNeeded])

  const parseCsv=text=>{ const wb=XLSX.read(text,{type:'string',raw:false}); const sn=wb.SheetNames[0]; const ws=wb.Sheets[sn]; const json=XLSX.utils.sheet_to_json(ws,{defval:''}); const columns=[...new Set(json.flatMap(r=>Object.keys(r)))]; return {rows:json,columns} }

  const loadSampleExcel=()=>{ const s1=[{id:1,category:'Books',review:'Great narrative and engaging characters',sentiment:'positive'}]; const s2=[{id:1,product:'Headphones',notes:'Crisp sound quality but fragile hinges',rating:4}]; const s3=[{ticket:101,channel:'Email',message:'Cannot reset password after multiple attempts'}]; const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(s1),'Reviews'); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(s2),'Products'); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(s3),'Support'); const out=XLSX.write(wb,{bookType:'xlsx',type:'array'}); const parsed=XLSX.read(out,{type:'array'}); const obj={}; parsed.SheetNames.forEach(n=>{const ws=parsed.Sheets[n]; const json=XLSX.utils.sheet_to_json(ws,{defval:''}); const columns=[...new Set(json.flatMap(r=>Object.keys(r)))]; obj[n]={rows:json,columns}}); setWorkbookData(obj); setActiveSheet(parsed.SheetNames[0]); setSelectedColumns([]); setHiddenColumns([]); setRenames({}) }

  const handleFile=e=>{ const file=e.target.files?.[0]; if(!file)return; const ext=file.name.split('.').pop().toLowerCase(); const reader=new FileReader(); reader.onload=evt=>{ if(ext==='csv'){ const text=evt.target.result; const parsed=parseCsv(text); setWorkbookData({'CSV':parsed}); setActiveSheet('CSV') } else { const data=new Uint8Array(evt.target.result); const wb=XLSX.read(data,{type:'array'}); const obj={}; wb.SheetNames.forEach(n=>{const ws=wb.Sheets[n]; const json=XLSX.utils.sheet_to_json(ws,{defval:''}); const columns=[...new Set(json.flatMap(r=>Object.keys(r)))]; obj[n]={rows:json,columns}}); setWorkbookData(obj); setActiveSheet(wb.SheetNames[0]||null) } setSelectedColumns([]); setHiddenColumns([]); setRenames({}) }; ext==='csv'? reader.readAsText(file): reader.readAsArrayBuffer(file) }

  const currentRows=useMemo(()=> activeSheet==='__ALL__'? Object.values(workbookData).flatMap(s=>s.rows): (activeSheet && workbookData[activeSheet]?.rows)||[],[activeSheet,workbookData])
  const currentColumns=useMemo(()=> activeSheet==='__ALL__'? [...new Set(Object.values(workbookData).flatMap(s=>s.columns))] : (activeSheet && workbookData[activeSheet]?.columns)||[],[activeSheet,workbookData])
  const displayedColumns=currentColumns.filter(c=>!hiddenColumns.includes(c))
  const textSamples=useMemo(()=> !selectedColumns.length? [] : currentRows.map(r=>selectedColumns.map(c=>r[c]).join(' ')),[currentRows,selectedColumns])
  const stemmer=useMemo(()=> enableStemming? buildStem(): t=>t,[enableStemming])
  const params=useMemo(()=>({stopwords:effectiveStopwords,stem:enableStemming,stemmer,n:ngramN}),[effectiveStopwords,enableStemming,stemmer,ngramN])

  const tfidf=useMemo(()=> analysisType==='tfidf'&&textSamples.length? computeTfIdf(textSamples,params): null,[analysisType,textSamples,params])
  const ngrams=useMemo(()=> analysisType==='ngram'&&textSamples.length? generateNGrams(textSamples,params): [],[analysisType,textSamples,params])
  const associations=useMemo(()=> analysisType==='assoc'&&textSamples.length? mineAssociations(currentRows,selectedColumns,{...params,minSupport}): null,[analysisType,textSamples,currentRows,selectedColumns,params,minSupport])
  const entities=useMemo(()=> analysisType==='ner'&&textSamples.length&&nlpLibs.nlp? extractEntities(textSamples,nlpLibs.nlp): [],[analysisType,textSamples,nlpLibs])

  // Derived quick stats
  const statDocs=textSamples.length
  const statTokens=useMemo(()=> textSamples.join(' ').split(/\s+/).filter(Boolean).length,[textSamples])
  const statUniqueTerms=tfidf? tfidf.aggregate.length : (ngrams.length || entities.length)

  const barData=useMemo(()=>{ if(analysisType==='assoc'&&associations) return associations.pairs.slice(0,25).map(p=>({ name:`${p.a}+${p.b}`.slice(0,28), metric:+p.lift.toFixed(2), raw:p.count })); if(analysisType==='tfidf'&&tfidf) return tfidf.aggregate.slice(0,25).map(t=>({ name:t.term, metric:+t.score.toFixed(2), raw:+t.score.toFixed(2) })); if(analysisType==='ngram') return ngrams.slice(0,25).map(g=>({ name:g.gram, metric:g.count, raw:g.count })); if(analysisType==='ner') return entities.slice(0,25).map(e=>({ name:e.value, metric:e.count, raw:e.count })); return [] },[analysisType,associations,tfidf,ngrams,entities])
  const networkData=useMemo(()=>{ if(!(analysisType==='assoc'&&associations)) return {nodes:[],edges:[]}; const allowed=new Set(associations.items.slice(0,60).map(i=>i.item)); const edges=associations.pairs.filter(p=> p.lift>=networkMinLift && allowed.has(p.a) && allowed.has(p.b)).map(p=>({source:p.a,target:p.b,value:p.lift})); const nodeSet=new Set(); edges.forEach(e=>{nodeSet.add(e.source); nodeSet.add(e.target)}); const nodes=[...nodeSet].map(id=>{ const meta=associations.items.find(i=>i.item===id); return {id,value:meta?meta.support:0.01} }); return {nodes,edges} },[analysisType,associations,networkMinLift])
  const wordCloudData=useMemo(()=>{ if(analysisType==='tfidf'&&tfidf) return tfidf.aggregate.map(t=>({text:t.term,value:t.score})); if(analysisType==='ngram') return ngrams.map(g=>({text:g.gram,value:g.count})); if(analysisType==='ner') return entities.map(e=>({text:e.value,value:e.count})); if(analysisType==='assoc'&&associations) return associations.items.map(i=>({text:i.item,value:i.support})); return [] },[analysisType,tfidf,ngrams,entities,associations])
  const heatmapData=useMemo(()=>{ if(analysisType==='tfidf'&&tfidf){ const top=tfidf.aggregate.slice(0,20).map(t=>t.term); const matrix=tfidf.perDoc.slice(0,25).map(doc=>top.map(term=>{const f=doc.find(x=>x.term===term); return f? Number(f.tfidf.toFixed(2)):0})); return {matrix,xLabels:top,yLabels:matrix.map((_,i)=>'Doc '+(i+1))}} return {matrix:[],xLabels:[],yLabels:[]} },[analysisType,tfidf])

  // Chart data (live updating)
  /*const pieData=useMemo(()=>{ if(analysisType==='assoc'&&associations) return associations.items.slice(0,6).map(i=>({ name:i.item, value:+(i.support*100).toFixed(2) })); if(analysisType==='tfidf'&&tfidf) return tfidf.aggregate.slice(0,6).map(t=>({ name:t.term, value:+t.score.toFixed(2) })); if(analysisType==='ngram') return ngrams.slice(0,6).map(g=>({ name:g.gram, value:g.count })); if(analysisType==='ner') return entities.slice(0,6).map(e=>({ name:e.value, value:e.count })); return [] },[analysisType,associations,tfidf,ngrams,entities])
  const barData=useMemo(()=>{ if(analysisType==='assoc'&&associations) return associations.pairs.slice(0,8).map(p=>({ name:`${p.a}+${p.b}`, lift:+p.lift.toFixed(2) })); if(analysisType==='tfidf'&&tfidf) return tfidf.aggregate.slice(0,8).map(t=>({ name:t.term, score:+t.score.toFixed(2) })); if(analysisType==='ngram') return ngrams.slice(0,8).map(g=>({ name:g.gram, freq:g.count })); if(analysisType==='ner') return entities.slice(0,8).map(e=>({ name:e.value, count:e.count })); return [] },[analysisType,associations,tfidf,ngrams,entities])*/

  // Mutators
  const toggleHide=col=>setHiddenColumns(h=>h.includes(col)? h.filter(c=>c!==col):[...h,col])
  const setRename=(col,name)=>setRenames(r=>({...r,[col]:name}))
  const selectColumnForText=col=>setSelectedColumns(p=>p.includes(col)? p.filter(c=>c!==col):[...p,col])

  const exportTransformed=()=>{ const cols=displayedColumns; const data=currentRows.map(r=>{const o={}; cols.forEach(c=>o[renames[c]||c]=r[c]); return o}); const ws=XLSX.utils.json_to_sheet(data); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Transformed'); XLSX.writeFile(wb,'transformed.xlsx') }
  const exportAnalysis=()=>{ const payload={analysisType,timestamp:new Date().toISOString(), tfidf:analysisType==='tfidf'?tfidf:undefined, ngrams:analysisType==='ngram'?ngrams:undefined, associations:analysisType==='assoc'?associations:undefined, entities:analysisType==='ner'?entities:undefined}; const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`analysis_${analysisType}.json`; a.click() }

  // Virtualized table calc
  const totalRows = currentRows.length
  const [scrollTop,setScrollTop]=useState(0)
  const onScroll = e => setScrollTop(e.currentTarget.scrollTop)
  const startIndex = Math.max(0, Math.floor(scrollTop/ROW_HEIGHT)-VIRTUAL_OVERSCAN)
  const endIndex = Math.min(totalRows, Math.ceil((scrollTop+420)/ROW_HEIGHT)+VIRTUAL_OVERSCAN)
  const visibleRows = currentRows.slice(startIndex,endIndex)
  const offsetY = startIndex * ROW_HEIGHT

  const visibleSlotCount = dashboardLayout==='1'?1: dashboardLayout==='2'?2:4
  const visTypes=['bar','wordcloud','network','heatmap']
  const updateSlot=(i,val)=> setVisSlots(s=>{ const copy=[...s]; copy[i]=val; return copy })

  const renderVis=(type)=>{
    if(type==='bar') return barData.length? <ResponsiveContainer width='100%' height='100%'><BarChart data={barData} margin={{top:10,right:10,bottom:10,left:0}}><XAxis dataKey='name' tick={{fontSize:10}} interval={0} angle={-25} textAnchor='end'/><YAxis tick={{fontSize:11}} /><Tooltip wrapperStyle={{fontSize:12}}/><Legend wrapperStyle={{fontSize:11}} /><Bar dataKey='metric' name={analysisType==='tfidf'? 'TF-IDF': analysisType==='ngram'? 'Frequency': analysisType==='assoc'? 'Lift':'Count'} fill='#0f172a' radius={[6,6,0,0]}>{showBarLabels && <LabelList dataKey='metric' position='top' style={{fontSize:10, fill:'var(--c-text)'}} />}</Bar></BarChart></ResponsiveContainer>: <div className='notice'>No bar data</div>
    if(type==='wordcloud') return <Suspense fallback={<div className='skel block' /> }><WordCloud data={wordCloudData} /></Suspense>
    if(type==='network') return <Suspense fallback={<div className='skel block' /> }><NetworkGraph nodes={networkData.nodes} edges={networkData.edges} /></Suspense>
    if(type==='heatmap') return <Suspense fallback={<div className='skel block' /> }><Heatmap matrix={heatmapData.matrix} xLabels={heatmapData.xLabels} yLabels={heatmapData.yLabels} /></Suspense>
    return <div />
  }

  return (
    <div id='app-shell' style={{display:'flex',width:'100%'}}>
      <aside className='sidebar'>
        <div className='sidebar-header'>?? Analyzer</div>
        <div className='nav'>
          <button className='active'>Dashboard</button>
          <button disabled style={{opacity:.4,cursor:'not-allowed'}}>Reports</button>
          <button disabled style={{opacity:.4,cursor:'not-allowed'}}>Admin</button>
        </div>
        <div style={{padding:'12px 16px', fontSize:11, color:'var(--c-subtle)'}}>v0.3</div>
      </aside>
      <div className='main'>
        <div className='topbar'>
          <h1>Dashboard</h1>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className='theme-toggle' onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>{theme==='light'? '?? Dark':'?? Light'}</button>
            <button className='btn outline' onClick={exportTransformed} disabled={!currentRows.length}>Export Data</button>
            <button className='btn accent' onClick={exportAnalysis} disabled={!textSamples.length}>Export Analysis</button>
          </div>
        </div>
        <div className='content'>
          <div className='stats-grid'>
            <div className='stat-card'><div className='stat-accent'></div><h4>Documents</h4><div className='stat-value'>{statDocs}</div><span className='subtle'>Rows combined</span></div>
            <div className='stat-card'><div className='stat-accent'></div><h4>Tokens</h4><div className='stat-value'>{statTokens}</div><span className='subtle'>Whitespace split</span></div>
            <div className='stat-card'><div className='stat-accent'></div><h4>Unique</h4><div className='stat-value'>{statUniqueTerms||0}</div><span className='subtle'>Terms / units</span></div>
            <div className='stat-card'><div className='stat-accent'></div><h4>Mode</h4><div className='stat-value' style={{fontSize:22}}>{analysisType.toUpperCase()}</div><span className='subtle'>Analysis type</span></div>
          </div>
          <div className='analysis-layout'>
            <div className='side-stack'>
              <div className='box'>
                <h4>Data Source</h4>
                <input type='file' accept='.xlsx,.xls,.csv' onChange={handleFile} />
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <button className='btn secondary' style={{background:'#e2e8f0'}} onClick={()=>fetch(new URL('sample-data.csv', import.meta.env.BASE_URL)).then(r=>r.text()).then(txt=>{const p=parseCsv(txt); setWorkbookData({'Sample CSV':p}); setActiveSheet('Sample CSV'); setSelectedColumns([]); setHiddenColumns([]); setRenames({}) })}>Load CSV Sample</button>
                  <button className='btn secondary' style={{background:'#e2e8f0'}} onClick={loadSampleExcel}>Load Excel Sample</button>
                </div>
                {Object.keys(workbookData).length>0 && <SheetSelector sheets={Object.keys(workbookData)} activeSheet={activeSheet} setActiveSheet={setActiveSheet} />}
              </div>
              {currentColumns.length>0 && (
                <div className='box'>
                  <h4>Columns</h4>
                  <ColumnManager columns={currentColumns} hiddenColumns={hiddenColumns} renames={renames} toggleHide={toggleHide} setRename={setRename} selectColumnForText={selectColumnForText} selectedTextColumns={selectedColumns} />
                  <div className='notice'>TXT toggles inclusion</div>
                </div>
              )}
              <div className='box'>
                <h4>Analysis Settings</h4>
                <label style={{fontSize:12}}>Type<select value={analysisType} onChange={e=>setAnalysisType(e.target.value)} style={{width:'100%',marginTop:4}}><option value='ngram'>N-Gram</option><option value='tfidf'>TF-IDF</option><option value='assoc'>Association</option><option value='ner'>NER</option></select></label>
                {analysisType==='ngram' && <label style={{fontSize:12}}>N Size<input type='number' min={1} max={6} value={ngramN} onChange={e=>setNgramN(Number(e.target.value)||2)} style={{width:'100%',marginTop:4}}/></label>}
                {analysisType==='assoc' && <label style={{fontSize:12}}>Min Support<input type='number' step={0.01} value={minSupport} onChange={e=>setMinSupport(Math.min(Math.max(Number(e.target.value)||0,0.01),0.8))} style={{width:'100%',marginTop:4}}/></label>}
                {analysisType==='assoc' && <label style={{fontSize:12}}>Edge Lift ? {networkMinLift.toFixed(2)}<input type='range' min={0.5} max={5} step={0.1} value={networkMinLift} onChange={e=>setNetworkMinLift(Number(e.target.value))} style={{width:'100%',marginTop:4}}/></label>}
                <label style={{fontSize:12}}><input type='checkbox' checked={enableStemming} onChange={e=>setEnableStemming(e.target.checked)} /> Stemming (light)</label>
                <label style={{fontSize:12}}><input type='checkbox' checked={showBarLabels} onChange={e=>setShowBarLabels(e.target.checked)} /> Show bar labels</label>
                <textarea rows={3} placeholder='Custom stopwords' value={stopwordInput} onChange={e=>setStopwordInput(e.target.value)} />
                <div className='notice'>Stopwords: {effectiveStopwords.size}</div>
              </div>
              <div className='box'>
                <h4>Dashboard Layout</h4>
                <label style={{fontSize:12}}>Layout<select value={dashboardLayout} onChange={e=>setDashboardLayout(e.target.value)} style={{width:'100%',marginTop:4}}><option value='1'>Single</option><option value='2'>Two Side-by-Side</option><option value='4'>Four Grid</option></select></label>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {Array.from({length:visibleSlotCount}).map((_,i)=> <select key={i} value={visSlots[i]} onChange={e=>updateSlot(i,e.target.value)} style={{width:'100%'}}>{visTypes.map(v=> <option key={v} value={v} disabled={(v==='network'&&analysisType!=='assoc') || (v==='heatmap'&&analysisType!=='tfidf')}>{v}</option>)}</select>)}
                </div>
              </div>
            </div>
            <div className='analysis-view'>
              {analysisType==='ner' && !libsLoaded && textSamples.length>0 && <div className='alert'>Loading NER model...</div>}
              <div className='panel'>
                <div className='panel-header'><h3>Visual Dashboard</h3><span className='subtle'>Custom layout</span></div>
                <div style={{display:'grid',gap:16, gridTemplateColumns: dashboardLayout==='4'? '1fr 1fr': dashboardLayout==='2'? '1fr 1fr':'1fr'}}>
                  {Array.from({length:visibleSlotCount}).map((_,i)=> <div key={i} style={{minHeight: dashboardLayout==='1'? 420: 300}} className='result-section'>{renderVis(visSlots[i])}</div>)}
                </div>
              </div>
              <div className='panel'>
                <div className='panel-header'><h3>Details Lists</h3><span className='subtle'>Top terms / items</span></div>
                <div style={{display:'flex',flexWrap:'wrap',gap:24}}>
                  <div style={{flex:'1 1 320px',minWidth:260}} className='result-section'>
                    {analysisType==='tfidf' && tfidf && <><h3>TF-IDF Terms</h3><ol className='result-list'>{tfidf.aggregate.slice(0,50).map(t=> <li key={t.term}>{t.term} <span className='subtle'>({t.score.toFixed(2)})</span></li>)}</ol></>}
                    {analysisType==='ngram' && <><h3>N-Grams</h3><ol className='result-list'>{ngrams.slice(0,50).map(g=> <li key={g.gram}>{g.gram} <span className='subtle'>({g.count})</span></li>)}</ol></>}
                    {analysisType==='assoc' && associations && <><h3>Items</h3><ol className='result-list'>{associations.items.slice(0,50).map(i=> <li key={i.item}>{i.item} <span className='subtle'>({(i.support*100).toFixed(1)}%)</span></li>)}</ol></>}
                    {analysisType==='ner' && <><h3>Entities</h3><ol className='result-list'>{entities.slice(0,50).map(e=> <li key={e.value}>{e.value} <span className='subtle'>({e.count})</span></li>)}</ol></>}
                  </div>
                  {analysisType==='assoc' && associations && (
                    <div style={{flex:'1 1 320px',minWidth:260}} className='result-section'>
                      <h3>Pairs (Lift)</h3>
                      <ol className='result-list'>{associations.pairs.filter(p=>p.lift>=networkMinLift).slice(0,60).map(p=> <li key={p.a+'|'+p.b}>{p.a}+{p.b} <span className='subtle'>lift {p.lift.toFixed(2)}</span></li>)}</ol>
                    </div>
                  )}
                  {analysisType==='tfidf' && tfidf && (
                    <div style={{flex:'1 1 320px',minWidth:260}} className='result-section'>
                      <h3>Doc 1 Top Terms</h3>
                      <ol className='result-list'>{(tfidf.perDoc[0]||[]).slice(0,40).map(t=> <li key={t.term}>{t.term} <span className='subtle'>({t.tfidf.toFixed(2)})</span></li>)}</ol>
                    </div>
                  )}
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
          <footer>Interactive Text Analyzer · {libsLoaded? 'NER Ready':'NER Lazy'} · Theme: {theme}</footer>
        </div>
      </div>
    </div>
  )
}
