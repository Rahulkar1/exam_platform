"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const GFONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap');`;

const DARK = { bg:"#080D15",surface:"#0E1623",card:"#131F2E",border:"#1D2E40",border2:"#263D55",indigo:"#5B7FFF",green:"#22D3A0",red:"#FF4D6A",amber:"#FFB340",purple:"#A855F7",text:"#E8EDF5",muted:"#6B7E96",dim:"#2E4055",inputBg:"#0E1623",label:"#94A3B8" };
const LIGHT = { bg:"#F1F5F9",surface:"#FFFFFF",card:"#FFFFFF",border:"#E2E8F0",border2:"#CBD5E1",indigo:"#4F46E5",green:"#059669",red:"#DC2626",amber:"#D97706",purple:"#7C3AED",text:"#0F172A",muted:"#64748B",dim:"#CBD5E1",inputBg:"#F8FAFC",label:"#475569" };

const uid  = () => Math.random().toString(36).slice(2,8);
const fmtT = s => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60; return h>0?`${h}:${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`; };

const SEED = {
  id:"e1", title:"General Aptitude Test", duration:1800, passMark:60, negMark:false, negValue:1, status:"published",
  sections:[
    { id:"s1", name:"Quantitative", questions:[
      {id:"q1",text:"A train travels 360 km in 4 hours. What is its speed in km/h?",opts:["80","90","100","120"],correct:1,marks:4},
      {id:"q2",text:"If 8 workers complete a task in 12 days, how many days for 6 workers?",opts:["14","16","18","20"],correct:1,marks:4},
      {id:"q3",text:"Ratio of two numbers is 3:5. Sum is 96. Find the larger number.",opts:["36","48","60","72"],correct:2,marks:4},
    ]},
    { id:"s2", name:"Reasoning", questions:[
      {id:"q4",text:"Find the odd one out: 2, 5, 10, 17, 26, 37, 51",opts:["26","37","51","17"],correct:2,marks:4},
      {id:"q5",text:"If MOUSE = 57, then HORSE = ?",opts:["64","68","72","70"],correct:1,marks:4},
    ]},
  ],
};

const SEC_COLORS = ["#5B7FFF","#22D3A0","#A855F7","#FFB340"];
let darkRef = true;

const STYLES = (T, dark) => `
  ${GFONTS} *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:${T.bg};color:${T.text};}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes urgBlink{0%,100%{opacity:1}50%{opacity:.6}}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:${T.dim};border-radius:2px;}
  .opt-row:hover{border-color:${T.indigo}88!important;background:${dark?"rgba(91,127,255,.07)":"rgba(79,70,229,.05)"}!important;}
`;

function Btn({ children, onClick, variant="default", size="md", disabled=false, full=false, style={} }) {
  const [h,setH]=useState(false);
  const p={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,borderRadius:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",transition:"all .15s",border:"none",opacity:disabled?.45:1,width:full?"100%":undefined,padding:size==="sm"?"6px 14px":size==="lg"?"13px 28px":"9px 20px",fontSize:size==="sm"?12:size==="lg"?15:13};
  const v={default:{bg:"transparent",hbg:"rgba(255,255,255,.06)",color:"#94A3B8",border:"1px solid #1D2E40"},primary:{bg:"#5B7FFF",hbg:"#4A6FEF",color:"#fff",border:"none"},success:{bg:"#22D3A0",hbg:"#1AB88A",color:"#fff",border:"none"},danger:{bg:"#FF4D6A",hbg:"#E03055",color:"#fff",border:"none"},ghost:{bg:"transparent",hbg:"rgba(91,127,255,.1)",color:"#5B7FFF",border:"1px solid #5B7FFF44"},subtle:{bg:"#131F2E",hbg:"#1D2E40",color:"#E8EDF5",border:"1px solid #1D2E40"}};
  const vv=v[variant]||v.default;
  return <button disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={disabled?undefined:onClick} style={{...p,background:h?vv.hbg:vv.bg,color:vv.color,border:vv.border,...style}}>{children}</button>;
}

function Badge({children,color="#5B7FFF"}){return <span style={{display:"inline-flex",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:`${color}22`,color,border:`1px solid ${color}44`}}>{children}</span>;}
function TCard({children,T,style={},onClick}){const[h,setH]=useState(false);return <div onClick={onClick} onMouseEnter={()=>onClick&&setH(true)} onMouseLeave={()=>onClick&&setH(false)} style={{background:T.card,border:`1px solid ${h?T.border2:T.border}`,borderRadius:16,padding:22,cursor:onClick?"pointer":undefined,transition:"border-color .15s",...style}}>{children}</div>;}
function TInput({label,value,onChange,type="text",placeholder="",min,max,T,style={}}){const[f,setF]=useState(false);return <div style={{display:"flex",flexDirection:"column",gap:6}}>{label&&<label style={{fontSize:12,color:T.label,fontWeight:500}}>{label}</label>}<input type={type} value={value} min={min} max={max} placeholder={placeholder} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{background:T.inputBg,border:`1px solid ${f?T.indigo:T.border}`,borderRadius:9,padding:"10px 14px",color:T.text,fontSize:13,width:"100%",fontFamily:"'Inter',sans-serif",outline:"none",transition:"border-color .15s",...style}}/></div>;}
function TTArea({label,value,onChange,placeholder="",rows=3,T}){const[f,setF]=useState(false);return <div style={{display:"flex",flexDirection:"column",gap:6}}>{label&&<label style={{fontSize:12,color:T.label,fontWeight:500}}>{label}</label>}<textarea value={value} rows={rows} placeholder={placeholder} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{background:T.inputBg,border:`1px solid ${f?T.indigo:T.border}`,borderRadius:9,padding:"10px 14px",color:T.text,fontSize:13,width:"100%",fontFamily:"'Inter',sans-serif",outline:"none",resize:"vertical",transition:"border-color .15s"}}/></div>;}
function Modal({open,onClose,title,children,T,width=520}){if(!open)return null;return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{background:T.card,border:`1px solid ${T.border2}`,borderRadius:20,padding:32,width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",animation:"scaleIn .2s ease"}}>{title&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h3 style={{fontSize:17,fontWeight:700,fontFamily:"'Syne',sans-serif",color:T.text}}>{title}</h3><button onClick={onClose} style={{background:"transparent",border:"none",color:T.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button></div>}{children}</div></div>;}
function Toast({msg,visible}){if(!visible)return null;return <div style={{position:"fixed",top:20,right:20,zIndex:2000,background:"#22D3A0",color:"#fff",padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(34,211,160,.3)",animation:"fadeUp .3s ease"}}>{msg}</div>;}
function ThemeBtn({dark,onToggle}){return <button onClick={onToggle} style={{background:dark?"#1D2E40":"#E2E8F0",border:`1px solid ${dark?"#263D55":"#CBD5E1"}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:dark?"#94A3B8":"#475569"}}>{dark?"☀️ Light":"🌙 Dark"}</button>;}
function Topbar({T,dark,onToggle,right,center}){return <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 22px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,flexShrink:0}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#5B7FFF,#7B5FFF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div><span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:T.text}}>ExamPortal</span></div>{center&&<div style={{display:"flex",gap:6}}>{center}</div>}<div style={{display:"flex",alignItems:"center",gap:10}}><ThemeBtn dark={dark} onToggle={onToggle}/>{right}</div></div>;}

function LoginScreen({T,dark,onToggle,exams,onLogin}){
  const[id,setId]=useState(""),[ pass,setPass]=useState(""),[ err,setErr]=useState("");
  const pub=exams.filter(e=>e.status==="published");
  const handle=()=>{
    if(id==="admin"&&pass==="admin123"){onLogin("admin",null);return;}
    if(id.trim()&&pass==="exam123"){onLogin("candidate",{name:id});return;}
    setErr("Invalid credentials. Try admin/admin123 or YourName/exam123");
  };
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter',sans-serif"}}>
      <style>{STYLES(T,dark)}</style>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 22px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#5B7FFF,#7B5FFF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div><span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:T.text}}>ExamPortal</span></div>
        <ThemeBtn dark={dark} onToggle={onToggle}/>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,minHeight:"calc(100vh - 52px)"}}>
        <div style={{width:"100%",maxWidth:400,animation:"fadeUp .5s ease"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{width:68,height:68,borderRadius:18,background:"linear-gradient(135deg,#5B7FFF,#7B5FFF)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:30,boxShadow:"0 20px 60px rgba(91,127,255,.3)"}}>⚡</div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:T.text,letterSpacing:-1}}>ExamPortal Pro</h1>
            <p style={{color:T.muted,fontSize:13,marginTop:6}}>AI-Powered Examination System</p>
          </div>
          <TCard T={T} style={{padding:32}}>
            <div style={{background:dark?"rgba(91,127,255,.1)":"#EEF2FF",border:`1px solid ${dark?"rgba(91,127,255,.2)":"#C7D2FE"}`,borderRadius:10,padding:"10px 14px",marginBottom:22,fontSize:12,color:dark?"#7B97FF":"#4338CA",lineHeight:1.7}}>
              <strong>Admin:</strong> admin / admin123<br/><strong>Candidate:</strong> Any name / exam123
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:18}}>
              <TInput label="Name / ID" value={id} onChange={v=>{setId(v);setErr("");}} placeholder="Enter your name or admin" T={T}/>
              <TInput label="Password" type="password" value={pass} onChange={v=>{setPass(v);setErr("");}} placeholder="Enter password" T={T}/>
            </div>
            {err&&<div style={{color:T.red,fontSize:12,marginBottom:14}}>⚠️ {err}</div>}
            <button onClick={handle} style={{width:"100%",padding:"12px",borderRadius:11,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#5B7FFF,#7B5FFF)",color:"#fff",fontSize:15,fontWeight:700,fontFamily:"'Inter',sans-serif",boxShadow:"0 8px 24px rgba(91,127,255,.35)"}}>Login →</button>
          </TCard>
          {pub.length>0&&<TCard T={T} style={{marginTop:16,padding:20}}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:.5,fontWeight:600,marginBottom:12}}>Available Exams</div>{pub.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:T.surface,borderRadius:9,marginBottom:6,border:`1px solid ${T.border}`}}><span style={{fontSize:13,color:T.text}}>{e.title}</span><span style={{fontSize:12,color:T.muted}}>⏱ {fmtT(e.duration)}</span></div>)}</TCard>}
        </div>
      </div>
    </div>
  );
}

function QModal({open,onClose,initial,onSave,T,dark}){
  const blank={text:"",opts:["","","",""],correct:0,marks:4};
  const[q,setQ]=useState(blank);
  const[err,setErr]=useState("");
  useEffect(()=>{if(open){setQ(initial?{...initial,opts:[...initial.opts]}:blank);setErr("");}}, [open]);
  const setOpt=(i,v)=>setQ(p=>{const o=[...p.opts];o[i]=v;return{...p,opts:o};});
  const save=()=>{
    if(!q.text.trim()){setErr("Question text required.");return;}
    if(q.opts.some(o=>!o.trim())){setErr("All 4 options required.");return;}
    onSave(q);setErr("");
  };
  return(
    <Modal open={open} onClose={onClose} title={initial?"Edit Question":"Add Question"} T={T} width={560}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <TTArea label="Question Text *" value={q.text} onChange={v=>setQ(p=>({...p,text:v}))} placeholder="Enter your question..." rows={3} T={T}/>
        <div>
          <label style={{fontSize:12,color:T.label,fontWeight:500,display:"block",marginBottom:10}}>Options — select correct answer</label>
          {q.opts.map((o,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
              <input type="radio" name="qcorrect" checked={q.correct===i} onChange={()=>setQ(p=>({...p,correct:i}))} style={{width:16,height:16,accentColor:T.green,cursor:"pointer",flexShrink:0}}/>
              <input value={o} onChange={e=>setOpt(i,e.target.value)} placeholder={`Option ${["A","B","C","D"][i]}`} style={{flex:1,background:q.correct===i?(dark?"rgba(34,211,160,.12)":"#D1FAE5"):T.inputBg,border:`1px solid ${q.correct===i?T.green+"66":T.border}`,borderRadius:9,padding:"9px 14px",color:T.text,fontSize:13,outline:"none",fontFamily:"'Inter',sans-serif"}}/>
              {q.correct===i&&<span style={{color:T.green,fontSize:16}}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <TInput label="Marks" type="number" value={q.marks} onChange={v=>setQ(p=>({...p,marks:Number(v)}))} min={1} T={T}/>
          <div style={{display:"flex",alignItems:"flex-end"}}><div style={{background:dark?"rgba(34,211,160,.12)":"#D1FAE5",border:`1px solid ${T.green}44`,borderRadius:9,padding:"10px 14px",fontSize:13,color:T.green,width:"100%"}}>Correct: Option {["A","B","C","D"][q.correct]}</div></div>
        </div>
        {err&&<div style={{color:T.red,fontSize:12}}>⚠️ {err}</div>}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:6}}>
          <Btn variant="default" onClick={onClose}>Cancel</Btn>
          <Btn variant="success" onClick={save}>{initial?"Update Question":"Add Question"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

function AdminPanel({T,dark,onToggle,exams,setExams,onLogout}){
  darkRef=dark;
  const[view,setView]=useState("list");
  const[editExam,setEditExam]=useState(null);
  const[editSecIdx,setEditSecIdx]=useState(0);
  const[tab,setTab]=useState("questions");
  const[qModal,setQModal]=useState(false);
  const[editQ,setEditQ]=useState(null);
  const[newSec,setNewSec]=useState("");
  const[toastMsg,setToastMsg]=useState("");
  const[toastVis,setToastVis]=useState(false);
  const toast=msg=>{setToastMsg(msg);setToastVis(true);setTimeout(()=>setToastVis(false),2400);};
  const saveExam=ex=>{setExams(p=>p.map(e=>e.id===ex.id?ex:e));setEditExam({...ex});toast("Saved ✓");};
  const createExam=()=>{const e={id:uid(),title:"New Exam",duration:1800,passMark:60,negMark:false,negValue:1,status:"draft",sections:[{id:uid(),name:"Section 1",questions:[]}]};setExams(p=>[e,...p]);setEditExam(e);setEditSecIdx(0);setTab("questions");setView("builder");};
  const deleteExam=id=>{if(window.confirm("Delete?"))setExams(p=>p.filter(e=>e.id!==id));};
  const publishExam=id=>{setExams(p=>p.map(e=>e.id===id?{...e,status:"published"}:e));if(editExam?.id===id)setEditExam(p=>({...p,status:"published"}));toast("Published ✓");};
  const addSection=()=>{if(!newSec.trim())return;const u={...editExam,sections:[...editExam.sections,{id:uid(),name:newSec,questions:[]}]};setEditExam(u);saveExam(u);setEditSecIdx(u.sections.length-1);setNewSec("");};
  const saveQ=q=>{const secs=editExam.sections.map((s,i)=>{if(i!==editSecIdx)return s;const qs=editQ?s.questions.map(qq=>qq.id===q.id?q:qq):[...s.questions,{...q,id:uid()}];return{...s,questions:qs};});const u={...editExam,sections:secs};setEditExam(u);saveExam(u);setQModal(false);setEditQ(null);};
  const deleteQ=qid=>{const secs=editExam.sections.map((s,i)=>i===editSecIdx?{...s,questions:s.questions.filter(q=>q.id!==qid)}:s);const u={...editExam,sections:secs};setEditExam(u);saveExam(u);};
  const curSec=editExam?.sections[editSecIdx];
  const CSS=`${STYLES(T,dark)}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`;

  if(view==="list")return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter',sans-serif"}}>
      <style>{CSS}</style>
      <Toast msg={toastMsg} visible={toastVis}/>
      <Topbar T={T} dark={dark} onToggle={onToggle} right={<><Badge color={T.indigo}>Admin</Badge><Btn variant="default" size="sm" onClick={onLogout}>Logout</Btn></>}/>
      <div style={{padding:28,maxWidth:1000,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
          {[["Total Exams",exams.length,T.indigo,"📋"],["Published",exams.filter(e=>e.status==="published").length,T.green,"✅"],["Draft",exams.filter(e=>e.status==="draft").length,T.amber,"📝"],["Questions",exams.reduce((a,e)=>a+e.sections.reduce((b,s)=>b+s.questions.length,0),0),T.purple,"❓"]].map(([l,v,c,ic])=>(
            <div key={l} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{l}</div><div style={{fontSize:28,fontWeight:700,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div></div>
                <span style={{fontSize:22}}>{ic}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:T.text}}>Exam Library</h2>
          <Btn variant="primary" onClick={createExam}>＋ New Exam</Btn>
        </div>
        {exams.length===0&&<TCard T={T} style={{textAlign:"center",padding:48}}><p style={{color:T.muted}}>No exams yet.</p></TCard>}
        {exams.map(exam=>{const qc=exam.sections.reduce((a,s)=>a+s.questions.length,0);return(
          <TCard key={exam.id} T={T} style={{display:"flex",alignItems:"center",gap:18,marginBottom:10,padding:"18px 22px"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}><span style={{fontWeight:700,fontSize:15,color:T.text}}>{exam.title}</span><Badge color={exam.status==="published"?T.green:T.amber}>{exam.status==="published"?"PUBLISHED":"DRAFT"}</Badge></div>
              <div style={{display:"flex",gap:16,fontSize:12,color:T.muted,flexWrap:"wrap"}}><span>⏱ {fmtT(exam.duration)}</span><span>📋 {exam.sections.length} sections</span><span>❓ {qc} questions</span><span>🎯 Pass: {exam.passMark}%</span>{exam.negMark&&<span style={{color:T.red}}>⚠️ Neg: -{exam.negValue}</span>}</div>
            </div>
            <div style={{display:"flex",gap:7}}>
              <Btn size="sm" variant="subtle" onClick={()=>{setEditExam({...exam});setEditSecIdx(0);setTab("questions");setView("builder");}}>✏️ Edit</Btn>
              {exam.status==="draft"&&<Btn size="sm" variant="success" onClick={()=>publishExam(exam.id)}>🚀 Publish</Btn>}
              <Btn size="sm" variant="danger" onClick={()=>deleteExam(exam.id)}>🗑</Btn>
            </div>
          </TCard>
        );})}
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif"}}>
      <style>{CSS}</style>
      <Toast msg={toastMsg} visible={toastVis}/>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 22px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Btn size="sm" variant="ghost" onClick={()=>setView("list")}>← Back</Btn>
          <input value={editExam.title} onChange={e=>setEditExam(p=>({...p,title:e.target.value}))} style={{background:"transparent",border:"none",color:T.text,fontSize:16,fontWeight:700,fontFamily:"'Syne',sans-serif",width:260,outline:"none"}}/>
          <Badge color={editExam.status==="published"?T.green:T.amber}>{editExam.status==="published"?"PUBLISHED":"DRAFT"}</Badge>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <ThemeBtn dark={dark} onToggle={onToggle}/>
          <Btn size="sm" variant="subtle" onClick={()=>saveExam(editExam)}>💾 Save</Btn>
          {editExam.status==="draft"&&<Btn size="sm" variant="success" onClick={()=>{const u={...editExam,status:"published"};setEditExam(u);saveExam(u);}}>🚀 Publish</Btn>}
        </div>
      </div>
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{width:210,borderRight:`1px solid ${T.border}`,background:T.surface,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Sections</div>
          <div style={{flex:1,overflowY:"auto"}}>
            {editExam.sections.map((s,i)=>(
              <div key={s.id} onClick={()=>setEditSecIdx(i)} style={{padding:"11px 16px",cursor:"pointer",borderBottom:`1px solid ${T.border}`,background:i===editSecIdx?`${T.indigo}18`:"transparent",borderLeft:`3px solid ${i===editSecIdx?T.indigo:"transparent"}`}}>
                <div style={{fontSize:13,fontWeight:600,color:i===editSecIdx?T.indigo:T.text}}>{s.name}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.questions.length} questions</div>
              </div>
            ))}
          </div>
          <div style={{padding:12,borderTop:`1px solid ${T.border}`}}>
            <input value={newSec} onChange={e=>setNewSec(e.target.value)} placeholder="New section name" onKeyDown={e=>e.key==="Enter"&&addSection()} style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",color:T.text,fontSize:12,outline:"none",marginBottom:8,fontFamily:"'Inter',sans-serif"}}/>
            <Btn full variant="primary" size="sm" onClick={addSection}>＋ Add Section</Btn>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:22}}>
            {["questions","settings"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"9px 20px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===t?T.indigo:"transparent"}`,fontSize:13,fontWeight:600,cursor:"pointer",textTransform:"capitalize",color:tab===t?T.indigo:T.muted,fontFamily:"'Inter',sans-serif"}}>{t}</button>)}
          </div>
          {tab==="questions"&&curSec&&(
            <div style={{animation:"fadeUp .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:T.text}}>{curSec.name} — {curSec.questions.length} questions</h3>
                <Btn variant="primary" onClick={()=>{setEditQ(null);setQModal(true);}}>＋ Add Question</Btn>
              </div>
              {curSec.questions.length===0&&<TCard T={T} style={{textAlign:"center",padding:36}}><p style={{color:T.muted}}>No questions yet.</p></TCard>}
              {curSec.questions.map((q,i)=>(
                <TCard key={q.id} T={T} style={{marginBottom:10,padding:"18px 22px"}}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}><Badge color={T.indigo}>Q{i+1}</Badge><Badge color={T.green}>+{q.marks} marks</Badge></div>
                      <p style={{fontSize:14,color:T.text,lineHeight:1.65,marginBottom:12}}>{q.text}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{q.opts.map((o,oi)=><span key={oi} style={{fontSize:12,padding:"3px 11px",borderRadius:7,fontWeight:oi===q.correct?700:400,background:oi===q.correct?(dark?"rgba(34,211,160,.18)":"#D1FAE5"):T.surface,color:oi===q.correct?T.green:T.muted,border:`1px solid ${oi===q.correct?T.green+"44":T.border}`}}>{["A","B","C","D"][oi]}. {o}{oi===q.correct?" ✓":""}</span>)}</div>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <Btn size="sm" variant="subtle" onClick={()=>{setEditQ(q);setQModal(true);}}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={()=>deleteQ(q.id)}>🗑</Btn>
                    </div>
                  </div>
                </TCard>
              ))}
            </div>
          )}
          {tab==="settings"&&(
            <TCard T={T} style={{maxWidth:480,animation:"fadeUp .3s ease"}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:T.text,marginBottom:20}}>Exam Settings</h3>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <TInput label="Exam Title" value={editExam.title} T={T} onChange={v=>setEditExam(p=>({...p,title:v}))}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <TInput label="Duration (seconds)" type="number" value={editExam.duration} T={T} onChange={v=>setEditExam(p=>({...p,duration:Number(v)}))}/>
                  <TInput label="Pass Mark (%)" type="number" value={editExam.passMark} min={1} max={100} T={T} onChange={v=>setEditExam(p=>({...p,passMark:Number(v)}))}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <input type="checkbox" id="neg" checked={editExam.negMark} onChange={e=>setEditExam(p=>({...p,negMark:e.target.checked}))} style={{width:16,height:16,accentColor:T.indigo}}/>
                  <label htmlFor="neg" style={{fontSize:13,color:T.text}}>Enable Negative Marking</label>
                </div>
                {editExam.negMark&&<TInput label="Marks deducted per wrong answer" type="number" value={editExam.negValue} T={T} min={0.25} onChange={v=>setEditExam(p=>({...p,negValue:Number(v)}))}/>}
                <div style={{background:dark?"rgba(255,179,64,.1)":"#FEF3C7",border:`1px solid ${dark?"rgba(255,179,64,.25)":"#FCD34D"}`,borderRadius:10,padding:"11px 14px",fontSize:13,color:T.amber}}>
                  ⏱ Duration: {Math.floor(editExam.duration/3600)}h {Math.floor((editExam.duration%3600)/60)}m {editExam.duration%60}s
                </div>
                <Btn variant="success" onClick={()=>saveExam(editExam)} style={{alignSelf:"flex-start"}}>💾 Save Settings</Btn>
              </div>
            </TCard>
          )}
        </div>
      </div>
      <QModal open={qModal} onClose={()=>{setQModal(false);setEditQ(null);}} initial={editQ} onSave={saveQ} T={T} dark={dark}/>
    </div>
  );
}

function ExamSelect({T,dark,onToggle,exams,candidate,onStart,onLogout}){
  const pub=exams.filter(e=>e.status==="published");
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter',sans-serif"}}>
      <style>{STYLES(T,dark)}</style>
      <Topbar T={T} dark={dark} onToggle={onToggle} right={<><span style={{fontSize:13,color:T.muted}}>Hi, {candidate.name}</span><Btn size="sm" variant="default" onClick={onLogout}>Logout</Btn></>}/>
      <div style={{padding:32,maxWidth:720,margin:"0 auto"}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,color:T.text,marginBottom:22}}>Available Exams</h2>
        {pub.length===0&&<TCard T={T} style={{textAlign:"center",padding:48}}><p style={{color:T.muted}}>No published exams available.</p></TCard>}
        {pub.map(exam=>{const qc=exam.sections.reduce((a,s)=>a+s.questions.length,0);const ms=exam.sections.flatMap(s=>s.questions).reduce((a,q)=>a+q.marks,0);return(
          <TCard key={exam.id} T={T} style={{marginBottom:14,padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
              <div>
                <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,color:T.text,marginBottom:10}}>{exam.title}</h3>
                <div style={{display:"flex",gap:14,fontSize:12,color:T.muted,flexWrap:"wrap"}}><span>⏱ {fmtT(exam.duration)}</span><span>❓ {qc} questions</span><span>📋 {exam.sections.length} sections</span><span>🏆 Max: {ms} marks</span><span>🎯 Pass: {exam.passMark}%</span>{exam.negMark&&<span style={{color:T.red}}>⚠️ Negative: -{exam.negValue}</span>}</div>
              </div>
              <Btn variant="success" onClick={()=>onStart(exam)}>Start Exam →</Btn>
            </div>
          </TCard>
        );})}
      </div>
    </div>
  );
}

function ExamEngine({T,dark,onToggle,exam,candidate,onFinish}){
  const allQ=exam.sections.flatMap((s,si)=>s.questions.map(q=>({...q,secName:s.name,secIdx:si,secColor:SEC_COLORS[si%SEC_COLORS.length]})));
  const[idx,setIdx]=useState(0);
  const[answers,setAnswers]=useState({});
  const[marked,setMarked]=useState({});
  const[timeLeft,setTimeLeft]=useState(exam.duration);
  const[saving,setSaving]=useState(false);
  const[submitOpen,setSubmitOpen]=useState(false);
  const[timedOut,setTimedOut]=useState(false);
  const timerRef=useRef(null);
  const saveRef=useRef(null);
  useEffect(()=>{timerRef.current=setInterval(()=>{setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);setTimedOut(true);setSubmitOpen(true);return 0;}return t-1;});},1000);return()=>clearInterval(timerRef.current);},[]);
  const triggerSave=useCallback(()=>{setSaving(true);clearTimeout(saveRef.current);saveRef.current=window.setTimeout(()=>setSaving(false),1000);},[]);
  const selectAns=(qid,opt)=>{setAnswers(p=>({...p,[qid]:opt}));triggerSave();};
  const clearAns=qid=>setAnswers(p=>{const n={...p};delete n[qid];return n;});
  const toggleMark=qid=>setMarked(p=>({...p,[qid]:!p[qid]}));
  const navQ=dir=>{const n=idx+dir;if(n>=0&&n<allQ.length)setIdx(n);};
  const calcScore=()=>{let score=0,correct=0,wrong=0;allQ.forEach(q=>{const a=answers[q.id];if(a===undefined)return;if(a===q.correct){score+=q.marks;correct++;}else if(exam.negMark){score-=exam.negValue;wrong++;}else wrong++;});const ms=allQ.reduce((a,q)=>a+q.marks,0);return{score:Math.max(0,score),maxScore:ms,correct,wrong,pct:Math.round((Math.max(0,score)/ms)*100)};};
  const confirmSubmit=()=>{clearInterval(timerRef.current);onFinish(calcScore());};
  const q=allQ[idx];const ans=answers[q?.id];
  const urgent=timeLeft<300,warning=timeLeft<600;
  const timerColor=urgent?T.red:warning?T.amber:T.green;
  const timePct=(timeLeft/exam.duration)*100;
  const answered=Object.keys(answers).length;
  const getQSt=qq=>marked[qq.id]?"marked":answers[qq.id]!==undefined?"answered":"pending";
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif"}}>
      <style>{STYLES(T,dark)}</style>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
          <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:"linear-gradient(135deg,#5B7FFF,#7B5FFF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
          <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:160}}>{exam.title}</div><div style={{fontSize:10,color:T.muted}}>{candidate.name}</div></div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>
          {exam.sections.map((s,si)=>{const sc=SEC_COLORS[si%SEC_COLORS.length];const active=q?.secIdx===si;return <button key={s.id} onClick={()=>{const fi=allQ.findIndex(qq=>qq.secIdx===si);setIdx(fi>=0?fi:0);}} style={{padding:"4px 12px",borderRadius:7,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s",background:active?sc:`${sc}22`,color:active?"#fff":sc}}>{s.name}</button>;})}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <ThemeBtn dark={dark} onToggle={onToggle}/>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:6,height:6,borderRadius:"50%",background:saving?T.amber:T.green,animation:saving?"pulse .8s infinite":"none"}}/><span style={{color:saving?T.amber:T.muted}}>{saving?"Saving...":"Saved"}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 12px",borderRadius:10,border:`1px solid ${timerColor}44`,background:urgent?`${T.red}11`:`${timerColor}0A`,animation:urgent?"urgBlink 1s infinite":"none"}}><span style={{fontSize:13}}>⏱</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:timerColor,letterSpacing:1}}>{fmtT(timeLeft)}</span></div>
          <div style={{width:70,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${timePct}%`,background:timerColor,borderRadius:2,transition:"width 1s linear,background .5s"}}/></div>
          <Btn variant="primary" size="sm" onClick={()=>setSubmitOpen(true)}>Submit</Btn>
        </div>
      </div>
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          {q&&<div key={idx} style={{animation:"slideIn .22s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              <div style={{background:`${q.secColor}22`,color:q.secColor,borderRadius:9,padding:"4px 13px",fontSize:13,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>Q{idx+1}/{allQ.length}</div>
              <Badge color={T.green}>+{q.marks} marks</Badge>
              {exam.negMark&&<Badge color={T.red}>-{exam.negValue} wrong</Badge>}
              <span style={{fontSize:12,color:T.muted}}>{q.secName}</span>
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <Btn size="sm" variant={marked[q.id]?"primary":"default"} onClick={()=>toggleMark(q.id)}>🔖 {marked[q.id]?"Marked":"Mark"}</Btn>
                {ans!==undefined&&<Btn size="sm" variant="default" onClick={()=>clearAns(q.id)}>✕ Clear</Btn>}
              </div>
            </div>
            <TCard T={T} style={{marginBottom:22,padding:26}}><p style={{fontSize:17,lineHeight:1.75,color:T.text}}>{q.text}</p></TCard>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:28}}>
              {q.opts.map((opt,oi)=>{const sel=ans===oi;return(
                <button key={oi} className="opt-row" onClick={()=>selectAns(q.id,oi)} style={{padding:"14px 18px",borderRadius:12,textAlign:"left",background:sel?`${q.secColor}18`:T.card,border:`2px solid ${sel?q.secColor:T.border}`,display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"all .15s",width:"100%"}}>
                  <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:sel?q.secColor:T.surface,color:sel?"#fff":T.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",transition:"all .15s"}}>{["A","B","C","D"][oi]}</div>
                  <span style={{fontSize:14,color:sel?T.text:T.muted,fontWeight:sel?600:400}}>{opt}</span>
                  {sel&&<span style={{marginLeft:"auto",color:q.secColor,fontSize:18}}>✓</span>}
                </button>
              );})}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:18,borderTop:`1px solid ${T.border}`}}>
              <Btn variant="default" onClick={()=>navQ(-1)} disabled={idx===0}>← Previous</Btn>
              <span style={{fontSize:12,color:T.muted}}>{answered}/{allQ.length} answered</span>
              <Btn variant="primary" onClick={()=>navQ(1)} disabled={idx===allQ.length-1}>Save & Next →</Btn>
            </div>
          </div>}
        </div>
        <div style={{width:250,borderLeft:`1px solid ${T.border}`,background:T.surface,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>
          <div style={{padding:"18px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:14}}>
            <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
              <svg width={64} height={64} style={{transform:"rotate(-90deg)"}}>
                <circle cx={32} cy={32} r={26} fill="none" stroke={T.border} strokeWidth={5}/>
                <circle cx={32} cy={32} r={26} fill="none" stroke={timerColor} strokeWidth={5} strokeDasharray={163.36} strokeDashoffset={163.36*(1-timePct/100)} style={{transition:"stroke-dashoffset 1s linear,stroke .5s"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,fontWeight:700,color:timerColor,fontFamily:"'JetBrains Mono',monospace"}}>{fmtT(timeLeft)}</span></div>
            </div>
            <div><div style={{fontSize:11,color:T.muted,marginBottom:4}}>Progress</div><div style={{fontSize:22,fontWeight:700,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{answered}<span style={{fontSize:14,color:T.muted,fontWeight:400}}>/{allQ.length}</span></div><div style={{fontSize:11,color:T.green}}>answered</div></div>
          </div>
          <div style={{padding:"10px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:12,flexWrap:"wrap"}}>
            {[["answered",T.green],["marked",T.purple],["pending",T.dim]].map(([l,c])=><div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.muted}}><div style={{width:8,height:8,borderRadius:2,background:c}}/>{l}</div>)}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:14}}>
            {exam.sections.map((s,si)=>{const sc=SEC_COLORS[si%SEC_COLORS.length];const sqs=allQ.filter(qq=>qq.secIdx===si);return <div key={s.id} style={{marginBottom:16}}><div style={{fontSize:11,color:sc,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{s.name}</div><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>{sqs.map(qq=>{const gi=allQ.indexOf(qq);const st=getQSt(qq);const isCur=gi===idx;return <button key={qq.id} onClick={()=>setIdx(gi)} style={{aspectRatio:"1",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",transition:"all .12s",outline:isCur?`2px solid ${sc}`:"none",outlineOffset:1,background:isCur?sc:st==="answered"?`${T.green}33`:st==="marked"?`${T.purple}33`:T.card,color:isCur?"#fff":st==="answered"?T.green:st==="marked"?T.purple:T.muted}}>{sqs.indexOf(qq)+1}</button>;})}</div></div>;})}
          </div>
        </div>
      </div>
      <Modal open={submitOpen} onClose={()=>!timedOut&&setSubmitOpen(false)} T={T} width={420} title={timedOut?"Time's Up!":"Submit Exam?"}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
          {[["Answered",answered,T.green],["Unanswered",allQ.length-answered,T.amber],["Marked",Object.values(marked).filter(Boolean).length,T.purple]].map(([l,v,c])=><div key={l} style={{textAlign:"center",background:T.surface,borderRadius:12,padding:14,border:`1px solid ${T.border}`}}><div style={{fontSize:24,fontWeight:700,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div><div style={{fontSize:11,color:T.muted,marginTop:4}}>{l}</div></div>)}
        </div>
        {timedOut&&<div style={{background:`${T.red}18`,border:`1px solid ${T.red}44`,borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:T.red,textAlign:"center"}}>⏰ Time expired — please submit now.</div>}
        <div style={{display:"flex",gap:10}}>
          {!timedOut&&<Btn full variant="default" onClick={()=>setSubmitOpen(false)}>Continue Exam</Btn>}
          <Btn full variant="success" onClick={confirmSubmit}>✓ Confirm Submit</Btn>
        </div>
      </Modal>
    </div>
  );
}

function ResultScreen({T,dark,onToggle,exam,score,onBack}){
  const pass=score.pct>=exam.passMark;
  const[animated,setAnimated]=useState(false);
  useEffect(()=>{const t=window.setTimeout(()=>setAnimated(true),200);return()=>window.clearTimeout(t);},[]);
  const r=50,c=2*Math.PI*r;
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif"}}>
      <style>{STYLES(T,dark)}</style>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 22px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#5B7FFF,#7B5FFF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div><span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:T.text}}>ExamPortal</span></div>
        <ThemeBtn dark={dark} onToggle={onToggle}/>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{width:"100%",maxWidth:500,animation:"fadeUp .5s ease"}}>
          <TCard T={T} style={{padding:40,textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:14}}>{pass?"🏆":"😔"}</div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:T.text,marginBottom:6}}>{pass?"Congratulations!":"Better luck next time"}</h1>
            <p style={{color:T.muted,fontSize:14,marginBottom:28}}>{exam.title}</p>
            <div style={{position:"relative",width:130,height:130,margin:"0 auto 26px"}}>
              <svg width={130} height={130} style={{transform:"rotate(-90deg)"}}>
                <circle cx={65} cy={65} r={r} fill="none" stroke={T.border} strokeWidth={9}/>
                <circle cx={65} cy={65} r={r} fill="none" stroke={pass?T.green:T.red} strokeWidth={9} strokeDasharray={c} strokeDashoffset={animated?c*(1-score.pct/100):c} style={{transition:"stroke-dashoffset 1.6s ease"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:pass?T.green:T.red}}>{score.pct}%</span><span style={{fontSize:11,color:T.muted}}>score</span></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
              {[["Score",`${score.score}/${score.maxScore}`,T.indigo],["Percentage",`${score.pct}%`,pass?T.green:T.red],["Correct",score.correct,T.green],["Wrong",score.wrong,T.red]].map(([l,v,c])=><div key={l} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}><div style={{fontSize:11,color:T.muted,marginBottom:6}}>{l}</div><div style={{fontSize:24,fontWeight:700,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div></div>)}
            </div>
            <div style={{background:pass?`${T.green}18`:`${T.red}18`,border:`1px solid ${pass?T.green+"44":T.red+"44"}`,borderRadius:11,padding:14,marginBottom:24,color:pass?T.green:T.red,fontWeight:700,fontSize:14}}>
              {pass?`✅ PASSED — Required ${exam.passMark}%`:`❌ FAILED — Required ${exam.passMark}%`}
            </div>
            <Btn full variant="primary" size="lg" onClick={onBack}>← Back to Exam List</Btn>
          </TCard>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const[dark,setDark]=useState(true);
  const[exams,setExams]=useState([SEED]);
  const[screen,setScreen]=useState("login");
  const[role,setRole]=useState(null);
  const[candidate,setCand]=useState(null);
  const[activeExam,setActiveExam]=useState(null);
  const[result,setResult]=useState(null);
  const T=dark?DARK:LIGHT;
  darkRef=dark;
  const toggle=()=>setDark(d=>!d);
  const handleLogin=(r,cand)=>{setRole(r);if(r==="admin"){setScreen("admin");return;}setCand(cand);setScreen("select");};
  const handleLogout=()=>{setRole(null);setCand(null);setScreen("login");};
  const handleStart=exam=>{setActiveExam(exam);setScreen("exam");};
  const handleFinish=score=>{setResult(score);setScreen("result");};
  return(
    <>
      {screen==="login"  &&<LoginScreen  T={T} dark={dark} onToggle={toggle} exams={exams} onLogin={handleLogin}/>}
      {screen==="admin"  &&<AdminPanel   T={T} dark={dark} onToggle={toggle} exams={exams} setExams={setExams} onLogout={handleLogout}/>}
      {screen==="select" &&<ExamSelect   T={T} dark={dark} onToggle={toggle} exams={exams} candidate={candidate} onStart={handleStart} onLogout={handleLogout}/>}
      {screen==="exam"   &&<ExamEngine   T={T} dark={dark} onToggle={toggle} exam={activeExam} candidate={candidate} onFinish={handleFinish}/>}
      {screen==="result" &&<ResultScreen T={T} dark={dark} onToggle={toggle} exam={activeExam} score={result} onBack={()=>setScreen("select")}/>}
    </>
  );
}
