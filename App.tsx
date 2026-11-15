import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Save, Download, Sparkles, Eye, EyeOff, ZoomIn, ZoomOut, Brain, Timer, Lightbulb, PenLine, BookOpen, Layers, Target, MousePointer2, Check, X, ChevronRight, GraduationCap, ArrowDown, ClipboardPaste, Wand2, Camera, ScanText, ListOrdered } from "lucide-react";

type NodeT = { id:string; text:string; x:number; y:number; color:string; parentId:string|null };
type StudyMap = { id:string; title:string; subject:string; difficulty:string; nodes:NodeT[]; updatedLabel:string };
type SavedMap = StudyMap & { recordId:string };

const COLORS = [
  { name:"Viola", value:"#6C4CF1" }, { name:"Corallo", value:"#FF5A8A" }, { name:"Turchese", value:"#00B7A6" },
  { name:"Ambra", value:"#FFB020" }, { name:"Blu", value:"#2E86FF" }, { name:"Lime", value:"#65B32E" },
];
const SUBJECTS = ["Italiano","Storia","Scienze","Matematica","Inglese","Geografia","Filosofia","Altro"];
const DIFFICULTY = ["Facile","Medio","Difficile"];

function nid(){ return `n-${Math.random().toString(36).slice(2,8)}-${Date.now().toString(36)}`; }
function mk(title:string, subject:string, difficulty:string, spec:[string,number,number,string,string|null][]): StudyMap {
  return { id:nid(), title, subject, difficulty, updatedLabel:"Esempio pronto da aprire", nodes: spec.map(([text,x,y,color,parent],i)=>({id:`${title}-${i}`, text, x, y, color, parentId: parent==="root"?null:parent})) };
}
const EXAMPLES: StudyMap[] = [
  mk("Rivoluzione Francese","Storia","Medio",[
    ["Rivoluzione Francese",600,330,"#6C4CF1","root"],
    ["Cause",320,150,"#FF5A8A","Rivoluzione Francese-0"],["Crisi economica",130,70,"#FF5A8A","Rivoluzione Francese-1"],["Privilegi nobiliari",150,220,"#FF5A8A","Rivoluzione Francese-1"],
    ["Eventi chiave",880,130,"#00B7A6","Rivoluzione Francese-0"],["Presa della Bastiglia",1040,60,"#00B7A6","Rivoluzione Francese-3"],["Dichiarazione dei diritti",1060,200,"#00B7A6","Rivoluzione Francese-3"],
    ["Idee nuove",900,500,"#FFB020","Rivoluzione Francese-0"],["Libertà",1060,440,"#FFB020","Rivoluzione Francese-6"],["Uguaglianza",1065,570,"#FFB020","Rivoluzione Francese-6"],
    ["Conseguenze",310,510,"#2E86FF","Rivoluzione Francese-0"],["Fine dell'assolutismo",115,560,"#2E86FF","Rivoluzione Francese-9"],["Nuova cittadinanza",150,430,"#2E86FF","Rivoluzione Francese-9"],
  ]),
  mk("Apparato Digerente","Scienze","Facile",[
    ["Apparato Digerente",600,330,"#00B7A6","root"],
    ["Bocca",320,150,"#FF5A8A","Apparato Digerente-0"],["Masticazione",140,90,"#FF5A8A","Apparato Digerente-1"],["Saliva",145,230,"#FF5A8A","Apparato Digerente-1"],
    ["Stomaco",880,150,"#FFB020","Apparato Digerente-0"],["Succhi gastrici",1050,100,"#FFB020","Apparato Digerente-3"],["Chimo",1040,230,"#FFB020","Apparato Digerente-3"],
    ["Intestino",880,500,"#6C4CF1","Apparato Digerente-0"],["Assorbimento",1055,450,"#6C4CF1","Apparato Digerente-5"],["Villi intestinali",1065,570,"#6C4CF1","Apparato Digerente-5"],
    ["Fegato e pancreas",310,500,"#2E86FF","Apparato Digerente-0"],["Bile",130,550,"#2E86FF","Apparato Digerente-7"],["Enzimi",135,430,"#2E86FF","Apparato Digerente-7"],
  ]),
  mk("Verbi Inglesi","Inglese","Medio",[
    ["Verbi Inglesi",600,330,"#2E86FF","root"],
    ["Present Simple",320,150,"#FF5A8A","Verbi Inglesi-0"],["Abitudini",130,80,"#FF5A8A","Verbi Inglesi-1"],["I / you / we / they",140,220,"#FF5A8A","Verbi Inglesi-1"],
    ["Past Simple",880,150,"#00B7A6","Verbi Inglesi-0"],["Azioni finite",1050,90,"#00B7A6","Verbi Inglesi-3"],["Verbi irregolari",1060,230,"#00B7A6","Verbi Inglesi-3"],
    ["Present Continuous",880,500,"#FFB020","Verbi Inglesi-0"],["Azioni in corso",1060,450,"#FFB020","Verbi Inglesi-5"],["to be + -ing",1050,570,"#FFB020","Verbi Inglesi-5"],
    ["Future",310,510,"#6C4CF1","Verbi Inglesi-0"],["will",130,570,"#6C4CF1","Verbi Inglesi-7"],["going to",130,430,"#6C4CF1","Verbi Inglesi-7"],
  ]),
  mk("Seconda Guerra Mondiale","Storia","Difficile",[
    ["Seconda Guerra Mondiale",600,330,"#FF5A8A","root"],
    ["Cause",320,150,"#6C4CF1","Seconda Guerra Mondiale-0"],["Crisi del '29",130,80,"#6C4CF1","Seconda Guerra Mondiale-1"],["Trattato di Versailles",145,220,"#6C4CF1","Seconda Guerra Mondiale-1"],
    ["Fronti",880,140,"#00B7A6","Seconda Guerra Mondiale-0"],["Europa",1035,80,"#00B7A6","Seconda Guerra Mondiale-3"],["Pacifico",1045,220,"#00B7A6","Seconda Guerra Mondiale-3"],
    ["Alleati e Asse",880,510,"#FFB020","Seconda Guerra Mondiale-0"],["Alleati",1045,450,"#FFB020","Seconda Guerra Mondiale-5"],["Asse",1045,580,"#FFB020","Seconda Guerra Mondiale-5"],
    ["Conseguenze",310,510,"#2E86FF","Seconda Guerra Mondiale-0"],["ONU",125,560,"#2E86FF","Seconda Guerra Mondiale-7"],["Guerra Fredda",140,430,"#2E86FF","Seconda Guerra Mondiale-7"],
  ]),
];

const TIPS = [
  { icon:Brain, title:"Parti dal centro, non dai dettagli", text:"Scrivi prima l'idea principale al centro. I dettagli arrivano dopo: così il cervello costruisce una struttura, non una lista da mandare a memoria." },
  { icon:Timer, title:"Ripassa in 3 momenti", text:"Riguarda la mappa dopo 1 giorno, dopo 3 giorni e prima della verifica. In Modalità Ripasso copri i nodi foglia e prova a ricordarli a voce alta." },
  { icon:Lightbulb, title:"Usa poche parole chiave", text:"Un nodo = un'idea. Evita frasi lunghe: tre parole ben scelte si ricordano meglio di un paragrafo copiato dal libro." },
  { icon:Target, title:"Collega, non accumulare", text:"Ogni ramo deve rispondere a una domanda: perché? Come? E poi? Se un nodo non si collega a niente, forse merita una mappa tutta sua." },
];

const SAMPLE_TEXT = `La Rivoluzione Francese è un periodo di grandi cambiamenti in Francia. La causa principale è la crisi economica, perché il popolo paga troppe tasse mentre i nobili hanno privilegi. Prima della rivoluzione la società è divisa in tre ordini e il re ha un potere assoluto. Dopo la crisi, il popolo si ribella e la Bastiglia diventa il simbolo della rivolta. Inoltre le nuove idee parlano di libertà e di uguaglianza per tutti i cittadini. La rivoluzione comprende quindi tre conseguenze importanti: la fine dell'assolutismo, una nuova cittadinanza e nuove leggi uguali per tutti. Un esempio concreto è la Dichiarazione dei diritti dell'uomo, che afferma che tutti nascono liberi e uguali.`;

const STOPWORDS = new Set(["della","dello","delle","degli","nella","nello","nelle","negli","alla","allo","alle","agli","dalla","dallo","dalle","dagli","come","quando","dove","cosa","questo","questa","questi","queste","quello","quella","quelli","quelle","sono","siamo","siete","stato","stata","stati","state","essere","avere","molto","molti","molte","anche","ancora","dopo","prima","sopra","sotto","tra","fra","con","per","che","non","più","tutti","tutte","ogni","solo","alla","del","dei","della","di","da","in","a","e","il","lo","la","i","gli","le","un","uno","una","dei","degli","delle","nel","nella","sul","sulla","perché","perche","quindi","inoltre","mentre","però","perche"]);
const SMALL_STOP = new Set(["il","lo","la","i","gli","le","un","uno","una","di","a","da","in","con","su","per","tra","fra","che","e","è","sono","non","di","della","dello","delle","degli","nel","nella","negli","nelle","al","alla","allo","alle","agli","dal","dalla","dallo","dalle","dagli","sul","sulla","sugli","sulle","come","quando","dove","cosa","questo","questa","questi","queste","quello","quella","molto","molti","molte","anche","ancora","più","tutti","tutte","ogni","solo"]);

function cleanSentence(s:string){ return s.replace(/\s+/g," ").trim(); }
function wordsOf(s:string){ return s.toLowerCase().replace(/[^a-zàèéìòù' ]/g," ").split(/\s+/).filter(w=>w.length>=4 && !STOPWORDS.has(w)); }
function shortenSentence(s:string, maxWords=5){
  const clean = cleanSentence(s).replace(/[.!?;:,]+$/,"");
  if(clean.length<=52) return clean.charAt(0).toUpperCase()+clean.slice(1);
  const kept = clean.split(/\s+/).filter(w=>!SMALL_STOP.has(w.toLowerCase().replace(/[^a-zàèéìòù]/g,"")));
  const phrase = (kept.length?kept:clean.split(/\s+/)).slice(0,maxWords).join(" ");
  return phrase.charAt(0).toUpperCase()+phrase.slice(1);
}
function titleFromText(text:string){
  const first = cleanSentence(text.split(/(?<=[.!?])\s+/)[0]||text);
  const words = first.replace(/[.!?]+$/,"").split(/\s+/).filter(Boolean).slice(0,6).join(" ");
  return words.charAt(0).toUpperCase()+words.slice(1);
}

const BRANCH_CATS = [
  { label:"Cause", keys:["causa","cause","motivo","origine","crisi","dovuto","provoca","scatena","perché","perche"] },
  { label:"Eventi chiave", keys:["prima","dopo","poi","infine","accadde","avvenne","battaglia","rivolta","presa","evento","succede","ribella","rivoluzione"] },
  { label:"Conseguenze", keys:["quindi","conseguenza","conseguenze","risultato","effetto","porta","cambia","diventa","fine"] },
  { label:"Esempi", keys:["esempio","esempi","per esempio","ad esempio"] },
  { label:"Personaggi", keys:["re","regina","popolo","nobili","borghesia","contadini","protagonisti","cittadini","luigi"] },
  { label:"Luoghi e date", keys:["francia","parigi","roma","europa","italia","luogo","città","anno","secolo","bastiglia"] },
  { label:"Idee nuove", keys:["idea","idee","libertà","uguaglianza","concetto","teoria","pensiero","nuovo","nuova","diritti"] },
  { label:"Cos'è", keys:["è","sono","significa","definizione","comprende","consiste","rappresenta","diviso"] },
];

async function api(action:string, args:any){
  const res = await fetch("actions", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ action, args }) });
  const json = await res.json().catch(()=>({}));
  if(!res.ok || json.error) throw new Error(json.error || `Errore ${res.status}`);
  return json.data;
}

export default function App(){
  const [current, setCurrent] = useState<StudyMap>(()=>EXAMPLES[0]);
  const [recordId, setRecordId] = useState<string|null>(null);
  const [saved, setSaved] = useState<SavedMap[]>([]);
  const [selectedId, setSelectedId] = useState<string>(EXAMPLES[0].nodes[0].id);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [zoom, setZoom] = useState(0.78);
  const [pan, setPan] = useState({x:0,y:0});
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [pageText, setPageText] = useState("");
  const [genSubject, setGenSubject] = useState("Storia");
  const [maxBranches, setMaxBranches] = useState(4);
  const [mapStyle, setMapStyle] = useState("Concettuale");
  const [genMessage, setGenMessage] = useState("");
  const dragRef = useRef<{kind:"node"|"pan"; id?:string; startX:number; startY:number; origX:number; origY:number; moved:boolean}|null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selected = current.nodes.find(n=>n.id===selectedId) || current.nodes[0];
  const leafIds = useMemo(()=>{ const parents=new Set(current.nodes.map(n=>n.parentId)); return new Set(current.nodes.filter(n=>!parents.has(n.id)).map(n=>n.id)); },[current]);

  async function reloadRecords(){
    const data = await api("records.list", { collection:"mappamente_maps" });
    const list = (data?.records||[]).map((r:any)=>({ ...(r.value||{}), recordId:r.id })) as SavedMap[];
    setSaved(list);
  }
  useEffect(()=>{ reloadRecords().catch((e)=>setLoadError("Le mappe salvate non sono disponibili in questa anteprima. Puoi comunque creare e modificare una mappa.")); },[]);

  function updateMap(patch:Partial<StudyMap>){ setCurrent(m=>({...m, ...patch, updatedLabel:"Modifiche non salvate"})); }
  function updateNode(id:string, patch:Partial<NodeT>){ setCurrent(m=>({...m, nodes:m.nodes.map(n=>n.id===id?{...n,...patch}:n)})); }

  function addChild(parentId?:string){
    const parent = current.nodes.find(n=>n.id===(parentId||selectedId)) || current.nodes[0];
    const siblings = current.nodes.filter(n=>n.parentId===parent.id).length;
    const angle = -60 + siblings*38;
    const rad = angle*Math.PI/180;
    const node:NodeT={ id:nid(), text:"Nuova idea", x:Math.max(90,Math.min(1110, parent.x + Math.cos(rad)*230)), y:Math.max(70,Math.min(600, parent.y + Math.sin(rad)*165)), color:parent.color, parentId:parent.id };
    updateMap({ nodes:[...current.nodes, node] });
    setSelectedId(node.id); setEditingId(node.id);
  }
  function deleteNode(id:string){
    if(current.nodes.length<=1) return;
    const toDelete=new Set<string>([id]);
    let changed=true; while(changed){ changed=false; current.nodes.forEach(n=>{ if(n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)){ toDelete.add(n.id); changed=true; } }); }
    const remain=current.nodes.filter(n=>!toDelete.has(n.id));
    if(!remain.length) return;
    updateMap({ nodes: remain });
    setSelectedId(remain[0].id);
  }
  function newMap(){
    const map:StudyMap={ id:nid(), title:"Nuova mappa senza titolo", subject:"Altro", difficulty:"Medio", updatedLabel:"Bozza nuova", nodes:[{id:nid(), text:"Argomento centrale", x:600, y:330, color:"#6C4CF1", parentId:null}] };
    setCurrent(map); setRecordId(null); setSelectedId(map.nodes[0].id); setReview(false); setZoom(.78); setPan({x:0,y:0});
    setMessage("Nuova mappa pronta: fai doppio click sul nodo centrale per rinominarlo.");
    document.getElementById("editor")?.scrollIntoView({behavior:"smooth"});
  }
  function openMap(map:StudyMap, rid:string|null){
    setCurrent(JSON.parse(JSON.stringify(map))); setRecordId(rid); setSelectedId(map.nodes[0]?.id||""); setReview(false); setMessage(`Hai aperto “${map.title}”.`);
    document.getElementById("editor")?.scrollIntoView({behavior:"smooth"});
  }
  function generateMap(){
    const text = pageText.trim();
    if(text.length < 100){
      setGenMessage("Incolla un po' più di testo, almeno 3-4 frasi, così creo una mappa migliore");
      return;
    }
    const sentences = text.split(/(?<=[.!?])\s+|\n+/).map(cleanSentence).filter(s=>s.length>8);
    if(sentences.length < 3){
      setGenMessage("Incolla un po' più di testo, almeno 3-4 frasi, così creo una mappa migliore");
      return;
    }
    const centralTitle = titleFromText(text);
    const rest = sentences.slice(1);
    type Branch = { label:string; items:string[] };
    let branches: Branch[] = [];
    if(mapStyle === "Cronologica"){
      const chunk = Math.max(1, Math.ceil(rest.length / maxBranches));
      for(let i=0;i<rest.length && branches.length<maxBranches;i+=chunk){
        branches.push({ label:`Fase ${branches.length+1}`, items: rest.slice(i, i+chunk) });
      }
    } else {
      const used = new Set<number>();
      for(const cat of BRANCH_CATS){
        const items:string[] = [];
        rest.forEach((s, idx)=>{
          if(used.has(idx)) return;
          const low = s.toLowerCase();
          if(cat.keys.some(k=>low.includes(k))){ items.push(s); used.add(idx); }
        });
        if(items.length) branches.push({ label: cat.label, items });
      }
      const freq = new Map<string, number>();
      rest.forEach((s, idx)=>{ if(!used.has(idx)) wordsOf(s).forEach(w=>freq.set(w,(freq.get(w)||0)+1)); });
      rest.forEach((s, idx)=>{ if(!used.has(idx)) wordsOf(s).forEach(w=>freq.set(w,(freq.get(w)||0)+0.2)); });
      const freqWords = [...freq.entries()].sort((a,b)=>b[1]-a[1]).map(([w])=>w).filter(w=>!branches.some(b=>b.label.toLowerCase().includes(w)));
      for(const word of freqWords){
        if(branches.length>=maxBranches) break;
        const items = rest.filter((s,idx)=>!used.has(idx) && wordsOf(s).includes(word));
        if(items.length){ items.forEach(s=>used.add(rest.indexOf(s))); branches.push({ label: word.charAt(0).toUpperCase()+word.slice(1), items }); }
      }
      const leftover = rest.filter((_,idx)=>!used.has(idx));
      if(leftover.length && branches.length<maxBranches) branches.push({ label:"Altri dettagli", items: leftover });
      if(mapStyle === "Mentale"){
        const byFreq = [...branches].sort((a,b)=>b.items.length-a.items.length);
        branches = byFreq;
      }
      branches = branches.slice(0, maxBranches);
      while(branches.length < Math.min(3, maxBranches)){
        const biggest = branches.reduce((a,b)=>a.items.length>=b.items.length?a:b);
        if(biggest.items.length<2) break;
        const half = Math.ceil(biggest.items.length/2);
        const moved = biggest.items.splice(half);
        branches.push({ label:`${biggest.label} · ancora`, items: moved });
      }
    }
    if(!branches.length){
      setGenMessage("Non sono riuscito a trovare temi chiari: prova ad aggiungere qualche frase con causa, esempio o conseguenza.");
      return;
    }
    const nodes: NodeT[] = [{ id: nid(), text: centralTitle, x: 600, y: 330, color: "#6C4CF1", parentId: null }];
    const branchColors = ["#FF5A8A","#00B7A6","#FFB020","#2E86FF","#65B32E","#6C4CF1"];
    branches.forEach((branch, bi)=>{
      const angle = (-90 + (bi * 360) / branches.length) * Math.PI / 180;
      const bx = Math.max(150, Math.min(1050, 600 + Math.cos(angle)*330));
      const by = Math.max(95, Math.min(575, 330 + Math.sin(angle)*215));
      const color = branchColors[bi % branchColors.length];
      const branchNode: NodeT = { id: nid(), text: branch.label, x: bx, y: by, color, parentId: nodes[0].id };
      nodes.push(branchNode);
      let subTexts: string[] = [];
      branch.items.forEach(s=>{
        if(s.includes(",") && s.length>70 && subTexts.length<2){
          s.split(",").map(cleanSentence).filter(p=>p.length>8).slice(0,2).forEach(p=>subTexts.push(shortenSentence(p, 4)));
        } else subTexts.push(shortenSentence(s, 5));
      });
      subTexts = [...new Set(subTexts)].slice(0,3);
      subTexts.forEach((sub, si)=>{
        const offset = (si - (subTexts.length-1)/2) * 34;
        const subAngle = angle + (offset * Math.PI / 180);
        const sx = Math.max(95, Math.min(1105, bx + Math.cos(subAngle)*205));
        const sy = Math.max(65, Math.min(610, by + Math.sin(subAngle)*125));
        nodes.push({ id: nid(), text: sub, x: sx, y: sy, color, parentId: branchNode.id });
      });
    });
    const map: StudyMap = { id: nid(), title: centralTitle, subject: genSubject, difficulty: "Medio", updatedLabel: "Generata da testo · modifiche non salvate", nodes };
    setCurrent(map); setRecordId(null); setSelectedId(map.nodes[0].id); setReview(false); setZoom(0.78); setPan({x:0,y:0});
    setGenMessage(`Mappa generata con ${branches.length} rami e ${nodes.length-1-branches.length} sotto-nodi. Ora modificala nell'editor e salvala quando ti piace.`);
    document.getElementById("editor")?.scrollIntoView({behavior:"smooth"});
  }

  function renderGenerator(variant:"full"|"compact"){
    const sentenceCount = pageText.trim() ? pageText.split(/(?<=[.!?])\s+|\n+/).filter(s=>s.trim().length>8).length : 0;
    return (
      <div className={variant==="full" ? "" : "rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4"}>
        {variant==="compact" && <p className="flex items-center gap-2 font-display text-lg font-bold"><ScanText className="h-5 w-5 text-[var(--primary)]"/> Da pagina a mappa</p>}
        <label className="mt-3 block text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]" htmlFor={variant==="full"?"testo-pagina":"testo-pagina-editor"}>Testo della pagina</label>
        <textarea id={variant==="full"?"testo-pagina":"testo-pagina-editor"} value={pageText} onChange={e=>{ setPageText(e.target.value); setGenMessage(""); }} rows={variant==="full"?7:5} placeholder="Incolla qui il testo della pagina del libro (copialo dalla foto / dal PDF)..." className="mt-2 w-full resize-y rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-semibold leading-relaxed outline-none focus:ring-2 focus:ring-violet-400"/>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[var(--muted)]"><span>{pageText.length} caratteri · circa {sentenceCount} frasi</span><span>{pageText.length<100 ? "Servono almeno 100 caratteri" : "Pronto da trasformare"}</span></div>
        <button type="button" onClick={()=>{ setPageText(SAMPLE_TEXT); setGenSubject("Storia"); setMapStyle("Concettuale"); setGenMessage("Testo di esempio inserito: ora premi “Genera la mappa automaticamente”."); }} className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold shadow-sm"><ClipboardPaste className="h-4 w-4 text-[var(--primary)]"/> Prova con un testo di esempio</button>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">Materia<select value={genSubject} onChange={e=>setGenSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2 py-2.5 font-bold">{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select></label>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">Numero max di rami<select value={maxBranches} onChange={e=>setMaxBranches(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2 py-2.5 font-bold">{[3,4,5,6].map(n=><option key={n} value={n}>{n} rami</option>)}</select></label>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">Stile mappa<select value={mapStyle} onChange={e=>setMapStyle(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2 py-2.5 font-bold">{["Concettuale","Mentale","Cronologica"].map(s=><option key={s}>{s}</option>)}</select></label>
        </div>
        <button type="button" onClick={generateMap} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-violet-300"><Wand2 className="h-5 w-5"/> Genera la mappa automaticamente</button>
        {genMessage && <p role="status" className="mt-3 rounded-xl bg-[#E9FFD8] px-3 py-2.5 text-sm font-bold text-[#356B16]">{genMessage}</p>}
        {variant==="full" && <p className="mt-3 text-xs font-semibold text-[var(--muted)]">La mappa nasce da quello che incolli: la prima frase diventa il nodo centrale, le frasi con causa, perché, quindi, inoltre, prima, dopo, esempio o comprende diventano rami e sotto-nodi. Poi puoi spostare, rinominare e colorare tutto nell'editor.</p>}
      </div>
    );
  }

  async function saveMap(){
    setBusy(true); setMessage("");
    const payload={ id:current.id, title:current.title.trim()||"Mappa senza titolo", subject:current.subject, difficulty:current.difficulty, nodes:current.nodes, updatedLabel:`Salvata il ${new Date().toLocaleDateString("it-IT")}` };
    try{
      if(recordId){ await api("records.replace", { collection:"mappamente_maps", id:recordId, value:payload }); }
      else { const created=await api("records.create", { collection:"mappamente_maps", value:payload, idempotency_key:`map-${current.id}` }); setRecordId(created.id); }
      await reloadRecords(); setCurrent(m=>({...m, title:payload.title, updatedLabel:payload.updatedLabel})); setMessage("Mappa salvata nella tua libreria.");
    }catch(e){ setMessage(e instanceof Error?`Salvataggio non riuscito: ${e.message}`:"Salvataggio non riuscito."); }
    setBusy(false);
  }
  async function deleteSaved(rid:string, title:string){
    try{ await api("records.delete", { collection:"mappamente_maps", id:rid }); await reloadRecords(); if(recordId===rid) setRecordId(null); setMessage(`“${title}” eliminata dalla libreria.`); }catch(e){ setMessage("Eliminazione non riuscita. Riprova."); }
  }
  function exportPNG(){
    const canvas=document.createElement("canvas"); canvas.width=1200; canvas.height=670; const ctx=canvas.getContext("2d"); if(!ctx) return;
    ctx.fillStyle="#FFF6E9"; ctx.fillRect(0,0,1200,670); ctx.font="800 28px Nunito, sans-serif"; ctx.fillStyle="#211A3D"; ctx.fillText(current.title, 32, 48);
    ctx.strokeStyle="#D8CBF5"; ctx.lineWidth=2;
    current.nodes.forEach(n=>{ const p=current.nodes.find(x=>x.id===n.parentId); if(!p) return; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.quadraticCurveTo((p.x+n.x)/2, (p.y+n.y)/2-35, n.x,n.y); ctx.stroke(); });
    current.nodes.forEach(n=>{ const w=Math.min(230, 46+n.text.length*8); ctx.fillStyle=n.color; ctx.beginPath(); ctx.roundRect(n.x-w/2,n.y-26,w,52,26); ctx.fill(); ctx.fillStyle="#fff"; ctx.font=`800 ${n.parentId?15:18}px Nunito, sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(n.text.slice(0,28), n.x, n.y); });
    canvas.toBlob(blob=>{ if(!blob) return; const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${current.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}.png`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); setMessage("PNG esportato: controlla i download del tuo dispositivo."); });
  }
  function onPointerDown(e:React.PointerEvent, kind:"node"|"pan", node?:NodeT){
    if(editingId) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current={ kind, id:node?.id, startX:e.clientX, startY:e.clientY, origX:node?.x||pan.x, origY:node?.y||pan.y, moved:false };
    if(kind==="node" && node) setSelectedId(node.id);
  }
  function onPointerMove(e:React.PointerEvent){
    const d=dragRef.current; if(!d) return;
    const dx=(e.clientX-d.startX)/zoom, dy=(e.clientY-d.startY)/zoom;
    if(Math.abs(e.clientX-d.startX)+Math.abs(e.clientY-d.startY)>4) d.moved=true;
    if(d.kind==="node" && d.id) updateNode(d.id, { x:Math.max(70,Math.min(1130,d.origX+dx)), y:Math.max(55,Math.min(615,d.origY+dy)) });
    else if(d.kind==="pan") setPan({x:d.origX+(e.clientX-d.startX), y:d.origY+(e.clientY-d.startY)});
  }
  function onPointerUp(){ dragRef.current=null; }

  const library = showSavedOnly ? saved : [...saved, ...EXAMPLES.map(m=>({...m, recordId:""}))];

  return (
    <div data-safe-area-inset-root style={{boxSizing:"border-box", paddingTop:"var(--safe-area-inset-top)"}} className="min-h-screen bg-[var(--bg)] text-[var(--ink)] overflow-x-clip">
      <header data-safe-area-sticky-top style={{top:"var(--safe-area-inset-top)"}} className="sticky z-40 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--primary)] text-2xl">🧠</span><span className="font-display text-2xl font-extrabold tracking-tight">Mappa<span className="text-[var(--primary)]">Mente</span></span></a>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-bold"><a className="rounded-full px-3 py-2 hover:bg-[var(--surface-2)]" href="#editor">Editor</a><a className="rounded-full px-3 py-2 hover:bg-[var(--surface-2)]" href="#libreria">Le mie mappe</a><a className="rounded-full px-3 py-2 hover:bg-[var(--surface-2)]" href="#metodo">Metodo</a></nav>
          <a href="#editor" className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-extrabold text-white">Crea la tua mappa →</a>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:pt-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold shadow-sm"><Sparkles className="h-4 w-4 text-[var(--primary)]"/> PER STUDENTI · SENZA LOGIN · GRATIS DA USARE</p>
            <h1 className="font-display mt-5 text-[clamp(2.6rem,7vw,4.8rem)] font-extrabold leading-[.92] tracking-tight">Trasforma<br/>lo studio in<br/><span className="text-[var(--primary)]">una mappa</span><span className="text-[var(--primary-2)]">.</span></h1>
            <p className="mt-5 max-w-xl text-lg font-semibold text-[var(--muted)]">Costruisci mappe concettuali chiare, collegale con un click e ripassale quando vuoi. Meno pagine da rileggere, più idee che restano.</p>
            <div className="mt-7 flex flex-wrap gap-3"><a href="#da-pagina" className="rounded-full bg-[var(--primary)] px-6 py-3.5 font-extrabold text-white shadow-lg shadow-violet-300">Da pagina a mappa <ArrowDown className="inline h-4 w-4"/></a><a href="#editor" className="rounded-full bg-white px-6 py-3.5 font-extrabold shadow-sm">Crea la tua mappa</a><a href="#libreria" className="rounded-full bg-white px-6 py-3.5 font-extrabold shadow-sm">Sfoglia gli esempi</a></div>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-[#E9FFD8] px-3 py-1.5">✓ 4 esempi pronti</span><span className="rounded-full bg-[#FFE5EF] px-3 py-1.5">✓ Modalità Ripasso</span><span className="rounded-full bg-[#DFF8F5] px-3 py-1.5">✓ Esporta in PNG</span></div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-[var(--primary)] p-4 text-white shadow-xl sm:p-5">
            <div className="flex items-center justify-between"><span className="font-display text-lg font-bold">Oggi studio: Storia</span><span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Rivoluzione Francese</span></div>
            <div className="relative mt-4 grid gap-3">
              <div className="mx-auto w-fit rounded-full bg-white px-5 py-3 font-display text-base font-bold text-[var(--ink)] shadow">Rivoluzione Francese</div>
              <div className="grid grid-cols-2 gap-3 text-center text-sm font-extrabold"><div className="rounded-2xl bg-[#FF5A8A] p-3">Cause</div><div className="rounded-2xl bg-[#00B7A6] p-3">Eventi chiave</div><div className="rounded-2xl bg-[#FFB020] p-3">Idee nuove</div><div className="rounded-2xl bg-[#2E86FF] p-3">Conseguenze</div></div>
              <div className="rounded-2xl bg-white p-4 text-[var(--ink)]"><p className="text-xs font-extrabold uppercase tracking-widest text-[var(--primary)]">Prossimo ripasso</p><p className="mt-1 font-bold">Domani · 10 minuti · Modalità Ripasso attiva</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-[var(--lime)]"/></div></div>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"/>
          </div>
        </section>

        {/* VANTAGGI */}
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[{icon:"🧠",t:"Memorizza meglio",d:"Le idee collegate si ricordano più delle liste. Vedi la struttura e il cervello fa il resto."},{icon:"⚡",t:"Ripassa veloce",d:"Una mappa = una pagina. Nascondi i nodi foglia e mettiti alla prova in pochi minuti."},{icon:"🗂️",t:"Organizza idee",d:"Titolo, materia e difficoltà sempre in ordine. Ogni argomento ha il suo posto."}].map(x=>(
              <article key={x.t} className="rounded-[24px] bg-[var(--surface)] p-6 shadow-sm"><div className="text-4xl">{x.icon}</div><h2 className="font-display mt-4 text-2xl font-bold">{x.t}</h2><p className="mt-2 font-semibold leading-relaxed text-[var(--muted)]">{x.d}</p></article>
            ))}
          </div>
        </section>

        {/* DA PAGINA A MAPPA */}
        <section id="da-pagina" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-14 sm:px-6">
          <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[#6C4CF1] via-[#8A5CF6] to-[#FF5A8A] p-1.5 shadow-xl">
            <div className="rounded-[24px] bg-[var(--surface)] p-5 sm:p-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-[#EFE9FF] px-3 py-1.5 text-xs font-extrabold text-[var(--primary)]"><ScanText className="h-4 w-4"/> DA PAGINA A MAPPA · INCOLLA IL TESTO</p>
              <h2 className="font-display mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Da pagina a mappa, <span className="text-[var(--primary)]">in un minuto</span></h2>
              <p className="mt-3 max-w-3xl font-semibold leading-relaxed text-[var(--muted)]">La foto diretta non è ancora disponibile: l'app non può ancora ricevere foto o file. Ma incollando il testo funziona subito — copialo dalla foto o dal PDF e lascia che diventi una mappa.</p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-[var(--surface-2)] p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl"><Camera className="h-5 w-5 text-[var(--primary)]"/></span><p className="mt-3 font-display text-lg font-bold">1. Fotografa la pagina <span className="text-xs font-bold text-[var(--muted)]">(fuori dall'app)</span></p><p className="mt-1 text-sm font-semibold leading-relaxed text-[var(--muted)]">Scatta la foto con la fotocamera del telefono, come fai di solito. La foto resta sul tuo dispositivo.</p></div>
                <div className="rounded-2xl bg-[var(--surface-2)] p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl"><ClipboardPaste className="h-5 w-5 text-[var(--primary)]"/></span><p className="mt-3 font-display text-lg font-bold">2. Incolla il testo qui</p><p className="mt-1 text-sm font-semibold leading-relaxed text-[var(--muted)]">Copialo dalla foto o dal PDF e incollalo nel riquadro qui sotto. Bastano 3-4 frasi per iniziare.</p></div>
                <div className="rounded-2xl bg-[var(--surface-2)] p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl"><ListOrdered className="h-5 w-5 text-[var(--primary)]"/></span><p className="mt-3 font-display text-lg font-bold">3. Ottieni la mappa pronta</p><p className="mt-1 text-sm font-semibold leading-relaxed text-[var(--muted)]">Premi genera: centro, rami colorati e sotto-nodi appaiono nell'editor, pronti da modificare e salvare.</p></div>
              </div>
              <div className="mt-6">{renderGenerator("full")}</div>
            </div>
          </div>
        </section>

        {/* EDITOR */}
        <section id="editor" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[var(--primary)]">Editor interattivo</p><h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">La tua mappa, a modo tuo</h2></div><p className="max-w-md text-sm font-semibold text-[var(--muted)]">Doppio click per modificare un nodo. Trascina per spostarlo. Trascina lo sfondo per spostare la vista.</p></div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--surface)] shadow-xl">
            <div className="grid lg:grid-cols-[300px_1fr]">
              <aside className="border-b border-[var(--line)] p-4 sm:p-5 lg:border-b-0 lg:border-r">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">Titolo mappa</label>
                <input value={current.title} onChange={e=>updateMap({title:e.target.value})} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 font-bold outline-none focus:ring-2 focus:ring-violet-400" placeholder="Es. Fotosintesi"/>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">Materia<select value={current.subject} onChange={e=>updateMap({subject:e.target.value})} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-2 py-2.5 font-bold">{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select></label>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">Difficoltà<select value={current.difficulty} onChange={e=>updateMap({difficulty:e.target.value})} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-2 py-2.5 font-bold">{DIFFICULTY.map(s=><option key={s}>{s}</option>)}</select></label>
                </div>
                <p className="mt-4 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-xs font-bold">Nodi: {current.nodes.length} · Materia: {current.subject} · {current.difficulty}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={()=>addChild()} className="flex items-center justify-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-2.5 text-sm font-extrabold text-white"><Plus className="h-4 w-4"/> Aggiungi ramo</button>
                  <button onClick={()=>deleteNode(selectedId)} disabled={current.nodes.length<=1} className="flex items-center justify-center gap-1 rounded-xl bg-[#FFE8EC] px-3 py-2.5 text-sm font-extrabold text-[#B91C4D]"><Trash2 className="h-4 w-4"/> Elimina</button>
                  <button onClick={saveMap} disabled={busy} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-extrabold text-white"><Save className="h-4 w-4"/> {busy?"Salvataggio…":"Salva mappa"}</button>
                  <button onClick={exportPNG} className="flex items-center justify-center gap-1 rounded-xl border border-[var(--line)] px-2 py-2.5 text-sm font-extrabold"><Download className="h-4 w-4"/> Esporta PNG</button>
                  <button onClick={newMap} className="flex items-center justify-center gap-1 rounded-xl border border-[var(--line)] px-2 py-2.5 text-sm font-extrabold"><Sparkles className="h-4 w-4"/> Nuova mappa</button>
                </div>
                <button onClick={()=>setReview(v=>!v)} className={`mt-3 flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-extrabold ${review?"bg-[#E9FFD8] text-[#356B16]":"bg-[var(--surface-2)]"}`}><span className="flex items-center gap-2">{review?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>} Modalità Ripasso</span><span className="rounded-full bg-white px-2 py-0.5 text-xs">{review?"ON":"OFF"}</span></button>
                <p className="mt-3 text-xs leading-relaxed font-semibold text-[var(--muted)]">{review?"I nodi foglia sono coperti. Prova a ricordarli, poi disattiva la modalità per controllare.":"In Ripasso i testi dei nodi foglia si nascondono: perfetta per testarti prima di una verifica."}</p>
                {selected && <div className="mt-4 border-t border-[var(--line)] pt-4"><p className="text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">Nodo selezionato</p><p className="mt-2 truncate font-bold">{selected.text}</p><p className="mt-3 text-xs font-bold">Colore nodo</p><div className="mt-2 flex flex-wrap gap-2">{COLORS.map(c=><button key={c.value} title={c.name} aria-label={`Colore ${c.name}`} onClick={()=>updateNode(selectedId,{color:c.value})} className={`h-9 w-9 rounded-full border-4 ${selected.color===c.value?"border-black/20":"border-transparent"}`} style={{background:c.value}} />)}</div></div>}
                {message && <p role="status" className="mt-4 rounded-xl bg-[#E9FFD8] px-3 py-2 text-sm font-bold text-[#356B16]">{message}</p>}
                <div className="mt-5">{renderGenerator("compact")}</div>
                {loadError && <p className="mt-3 text-xs font-semibold text-[var(--muted)]">{loadError}</p>}
              </aside>

              <div className="relative">
                <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2"><div className="flex items-center gap-2 text-xs font-extrabold"><span className="rounded-full bg-[var(--surface-2)] px-2 py-1">{current.subject}</span><span className="rounded-full bg-[var(--surface-2)] px-2 py-1">{current.difficulty}</span><span className="hidden sm:inline text-[var(--muted)]">{current.updatedLabel}</span></div><div className="flex items-center gap-1"><button onClick={()=>setZoom(z=>Math.max(.45,z-.15))} aria-label="Zoom meno" className="rounded-lg border p-2"><ZoomOut className="h-4 w-4"/></button><span className="w-12 text-center text-xs font-extrabold">{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(1.4,z+.15))} aria-label="Zoom più" className="rounded-lg border p-2"><ZoomIn className="h-4 w-4"/></button><button onClick={()=>{setZoom(.78);setPan({x:0,y:0});}} className="ml-1 rounded-lg bg-[var(--surface-2)] px-2 py-2 text-xs font-extrabold">Centra</button></div></div>
                <div ref={canvasRef} onPointerDown={e=>onPointerDown(e,"pan")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} className="no-select relative h-[560px] touch-none overflow-hidden bg-[radial-gradient(#D8CBF5_1px,transparent_1px)] [background-size:22px_22px] sm:h-[620px]">
                  <div className="absolute left-0 top-0 h-[670px] w-[1200px] origin-top-left" style={{transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}}>
                    <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">{current.nodes.map(n=>{ const p=current.nodes.find(x=>x.id===n.parentId); if(!p) return null; const mx=(p.x+n.x)/2, my=(p.y+n.y)/2-38; return <path key={n.id} d={`M ${p.x} ${p.y} Q ${mx} ${my} ${n.x} ${n.y}`} fill="none" stroke={n.color} strokeOpacity=".58" strokeWidth="3" strokeLinecap="round"/>; })}</svg>
                    {current.nodes.map(n=>{ const isCentral=!n.parentId; const hidden=review && leafIds.has(n.id) && !isCentral; return (
                      <div key={n.id} onPointerDown={e=>{e.stopPropagation(); onPointerDown(e,"node",n);}} onDoubleClick={e=>{e.stopPropagation(); setSelectedId(n.id); setEditingId(n.id);}} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{left:n.x, top:n.y}}>
                        <div className={`node-shadow relative flex min-w-[104px] max-w-[210px] flex-col items-center rounded-[22px] px-3 py-2.5 text-center text-white ${selectedId===n.id?"ring-4 ring-black/25":""}`} style={{background:n.color}}>
                          {editingId===n.id ? <input autoFocus value={n.text} onChange={e=>updateNode(n.id,{text:e.target.value})} onBlur={()=>setEditingId(null)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape") setEditingId(null);}} onPointerDown={e=>e.stopPropagation()} className="w-full rounded-lg bg-white/95 px-2 py-1 text-center font-extrabold text-black outline-none"/> : <span className={`break-words font-extrabold leading-tight ${isCentral?"text-base sm:text-lg":"text-sm"}`}>{hidden?"•••  ?  •••":n.text}</span>}
                          {!hidden && <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">{isCentral?"Argomento":"Idea"}</span>}
                          {selectedId===n.id && <button onClick={e=>{e.stopPropagation(); addChild(n.id);}} aria-label={`Aggiungi figlio a ${n.text}`} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-lg font-black text-black shadow">+</button>}
                        </div>
                      </div>); })}
                  </div>
                  <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow">Trascina i nodi · Doppio click per modificare</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIBRERIA */}
        <section id="libreria" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[var(--primary)]">Biblioteca</p><h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">Le mie mappe</h2><p className="mt-2 max-w-xl font-semibold text-[var(--muted)]">Le mappe salvate restano qui. Apri un esempio, modificalo e salvalo come tua versione.</p></div><div className="flex gap-2"><button onClick={()=>setShowSavedOnly(false)} className={`rounded-full px-4 py-2 text-sm font-extrabold ${!showSavedOnly?"bg-[var(--ink)] text-white":"bg-white"}`}>Tutte</button><button onClick={()=>setShowSavedOnly(true)} className={`rounded-full px-4 py-2 text-sm font-extrabold ${showSavedOnly?"bg-[var(--ink)] text-white":"bg-white"}`}>Solo salvate ({saved.length})</button></div></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {library.map((m,i)=>{ const colors=["#6C4CF1","#FF5A8A","#00B7A6","#FFB020"]; const accent=colors[i%4]; return (
              <article key={`${m.recordId||"ex"}-${m.id}-${i}`} className="flex flex-col rounded-[24px] bg-[var(--surface)] p-5 shadow-sm">
                <div className="flex items-center justify-between"><span className="rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{background:accent}}>{m.subject}</span><span className="text-xs font-bold text-[var(--muted)]">{m.difficulty}</span></div>
                <h3 className="font-display mt-5 text-xl font-bold leading-tight">{m.title}</h3><p className="mt-2 flex-1 text-sm font-semibold text-[var(--muted)]">{m.nodes.length} nodi · {m.updatedLabel}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">{m.nodes.slice(0,3).map(n=><span key={n.id} className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-[11px] font-bold">{n.text}</span>)}</div>
                <div className="mt-5 flex gap-2"><button onClick={()=>openMap(m, m.recordId||null)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--ink)] px-3 py-2.5 text-sm font-extrabold text-white">Apri <ChevronRight className="h-4 w-4"/></button>{m.recordId && <button onClick={()=>deleteSaved(m.recordId,m.title)} aria-label={`Elimina ${m.title}`} className="rounded-xl bg-[#FFE8EC] px-3 text-[#B91C4D]"><Trash2 className="h-4 w-4"/></button>}</div>
              </article>); })}
          </div>
          {library.length===0 && <div className="mt-6 rounded-3xl bg-white p-8 text-center"><BookOpen className="mx-auto h-8 w-8 text-[var(--primary)]"/><h3 className="mt-3 font-display text-xl font-bold">Ancora nessuna mappa salvata</h3><p className="mt-1 font-semibold text-[var(--muted)]">Crea la prima mappa nell'editor oppure apri un esempio qui sopra.</p><button onClick={newMap} className="mt-4 rounded-full bg-[var(--primary)] px-5 py-3 font-extrabold text-white">Crea la prima mappa</button></div>}
        </section>

        {/* METODO */}
        <section id="metodo" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 sm:px-6">
          <div className="rounded-[30px] bg-[var(--ink)] p-6 text-white sm:p-9"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#B9AFFF]">Metodo MappaMente</p><h2 className="font-display mt-2 max-w-xl text-3xl font-extrabold sm:text-4xl">Come studiare con le mappe</h2></div><GraduationCap className="h-12 w-12 text-[#FFB020]"/></div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{TIPS.map((t,i)=><article key={t.title} className="rounded-3xl bg-white/10 p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl"><t.icon className="h-6 w-6 text-[var(--primary)]"/></span><p className="mt-4 text-xs font-extrabold text-[#B9AFFF]">CONSIGLIO {i+1}</p><h3 className="mt-1 font-display text-xl font-bold leading-tight">{t.title}</h3><p className="mt-2 text-sm font-semibold leading-relaxed text-white/75">{t.text}</p></article>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6"><div className="flex flex-col items-center rounded-[30px] bg-[var(--primary)] px-6 py-10 text-center text-white"><PenLine className="h-10 w-10"/><h2 className="font-display mt-3 text-3xl font-extrabold sm:text-4xl">Pronto a ricordare di più?</h2><p className="mt-2 max-w-xl font-semibold text-white/85">Apri l'editor, scegli un argomento e costruisci la tua prima mappa in cinque minuti.</p><a href="#editor" className="mt-6 rounded-full bg-white px-7 py-3.5 font-extrabold text-[var(--ink)]">Crea la tua mappa →</a></div></section>
      </main>
      <footer className="border-t border-[var(--line)] py-6 text-center text-sm font-bold text-[var(--muted)]">MappaMente · Studia a modo tuo · Fatto per studenti, senza login</footer>
    </div>
  );
}
