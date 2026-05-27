import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   FULL EXAM PLATFORM  —  Admin + Candidate, all functions live
═══════════════════════════════════════════════════════════════ */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap');`;

const C = {
  bg:      "#080C14",
  surface: "#0D1320",
  card:    "#111927",
  border:  "#1C2A3A",
  border2: "#243447",
  indigo:  "#5B7FFF",
  indigo2: "#7B97FF",
  green:   "#22D3A0",
  red:     "#FF4D6A",
  amber:   "#FFB340",
  purple:  "#A855F7",
  text:    "#E8EDF5",
  muted:   "#6B7E96",
  dim:     "#3A4D63",
};

const css = `
  ${FONTS}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};font-family:'Inter',sans-serif;color:${C.text};}
  button{cursor:pointer;font-family:'Inter',sans-serif;}
  input,textarea,select{font-family:'Inter',sans-serif;}
  input:focus,textarea:focus,select:focus{outline:none;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:${C.surface};}
  ::-webkit-scrollbar-thumb{background:${C.dim};border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{background:${C.red}22}50%{background:${C.red}44}}
  @keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  .fade-up{animation:fadeUp .4s ease both;}
  .slide-in{animation:slideIn .25s ease both;}
  .scale-in{animation:scaleIn .2s ease both;}
  .opt:hover{border-color:${C.indigo}88!important;background:${C.indigo}0A!important;}
  .nav-btn:hover{background:${C.border}!important;}
  .act-btn:hover{opacity:.85!important;}
  .tab-btn:hover{color:${C.text}!important;}
`;

// ── tiny helpers ──────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const fmtTime = s => {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return h > 0
    ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
    : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};

// ── seed exam ─────────────────────────────────────────────────────────────
const seedExam = {
  id: uid(), title: "General Aptitude Test", duration: 1800,
  passMark: 60, negMark: true, negValue: 1, status: "published",
  sections: [{
    id: uid(), name: "Quantitative",
    questions: [
      { id: uid(), text: "A train travels 360 km in 4 hours. What is its speed in km/h?",
        opts: ["80","90","100","120"], correct: 1, marks: 4 },
      { id: uid(), text: "If 8 workers complete a task in 12 days, how many days for 6 workers?",
        opts: ["14","16","18","20"], correct: 1, marks: 4 },
      { id: uid(), text: "The ratio of two numbers is 3:5. Their sum is 96. Find the larger number.",
        opts: ["36","48","60","72"], correct: 2, marks: 4 },
    ]
  },{
    id: uid(), name: "Reasoning",
    questions: [
      { id: uid(), text: "Find the odd one out: 2, 5, 10, 17, 26, 37, 51",
        opts: ["26","37","51","17"], correct: 2, marks: 4 },
      { id: uid(), text: "If MOUSE = 57, then HORSE = ?",
        opts: ["64","68","72","70"], correct: 1, marks: 4 },
    ]
  }]
};

// ══════════════════════════════════════════════════════════════════════════
// SHARED UI
// ══════════════════════════════════════════════════════════════════════════
const Btn = ({ children, onClick, variant="primary", size="md", disabled, style={} }) => {
  const base = {
    border: "none", borderRadius: 10, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex", alignItems: "center", gap: 7, transition: "opacity .15s",
    opacity: disabled ? .5 : 1, fontFamily: "'Inter',sans-serif",
    padding: size === "sm" ? "7px 14px" : size === "lg" ? "13px 28px" : "10px 20px",
    fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 13,
  };
  const variants = {
    primary:  { background: `linear-gradient(135deg,${C.indigo},#7B5FFF)`, color: "#fff" },
    success:  { background: `linear-gradient(135deg,${C.green},#1AB88A)`,  color: "#fff" },
    danger:   { background: `linear-gradient(135deg,${C.red},#E03050)`,    color: "#fff" },
    ghost:    { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    subtle:   { background: C.card, color: C.text, border: `1px solid ${C.border}` },
  };
  return <button onClick={disabled ? undefined : onClick} className="act-btn"
    style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
};

const Badge = ({ children, color = C.indigo }) => (
  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
    background: `${color}22`, color, border: `1px solid ${color}44` }}>
    {children}
  </span>
);

const Input = ({ label, value, onChange, type="text", placeholder="", min, max, style={} }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    {label && <label style={{ fontSize:12, color:C.muted, fontWeight:500 }}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max}
      style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:9,
        padding:"10px 14px", color:C.text, fontSize:13, width:"100%", ...style }} />
  </div>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16,
    padding:24, ...style }}>{children}</div>
);

const Modal = ({ open, onClose, children, title, width=520 }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"#000B", backdropFilter:"blur(6px)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="scale-in" style={{ background:C.card, border:`1px solid ${C.border2}`,
        borderRadius:20, padding:32, width:"100%", maxWidth:width, maxHeight:"90vh", overflowY:"auto" }}>
        {title && <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h3 style={{ fontSize:17, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"transparent", border:"none",
            color:C.muted, fontSize:20, cursor:"pointer" }}>✕</button>
        </div>}
        {children}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ADMIN — EXAM BUILDER
// ══════════════════════════════════════════════════════════════════════════
function AdminPanel({ exams, setExams, onLogout }) {
  const [view, setView]         = useState("list");   // list | builder | monitor
  const [editExam, setEditExam] = useState(null);
  const [tab, setTab]           = useState("questions"); // questions | settings
  const [qModal, setQModal]     = useState(false);
  const [editQ, setEditQ]       = useState(null);
  const [editSecIdx, setEditSecIdx] = useState(0);
  const [newSecName, setNewSecName] = useState("");
  const [toast, setToast]       = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const createExam = () => {
    const e = { id:uid(), title:"New Exam "+Date.now().toString().slice(-4),
      duration:1800, passMark:60, negMark:false, negValue:1,
      status:"draft", sections:[{ id:uid(), name:"Section 1", questions:[] }] };
    setExams(p => [e, ...p]);
    setEditExam(e);
    setView("builder");
  };

  const saveExam = (updated) => {
    setExams(p => p.map(e => e.id === updated.id ? updated : e));
    setEditExam(updated);
    showToast("Exam saved ✓");
  };

  const deleteExam = id => setExams(p => p.filter(e => e.id !== id));

  const publishExam = id => {
    setExams(p => p.map(e => e.id===id ? {...e, status:"published"} : e));
    showToast("Exam published ✓");
  };

  const openBuilder = exam => { setEditExam({...exam}); setView("builder"); setEditSecIdx(0); };

  // Question modal save
  const saveQuestion = (q) => {
    const sec = editExam.sections[editSecIdx];
    let newSecs;
    if (editQ) {
      newSecs = editExam.sections.map((s,i) => i===editSecIdx
        ? { ...s, questions: s.questions.map(qq => qq.id===q.id ? q : qq) } : s);
    } else {
      newSecs = editExam.sections.map((s,i) => i===editSecIdx
        ? { ...s, questions: [...s.questions, { ...q, id:uid() }] } : s);
    }
    const updated = { ...editExam, sections: newSecs };
    setEditExam(updated);
    saveExam(updated);
    setQModal(false);
    setEditQ(null);
  };

  const deleteQuestion = (qid) => {
    const newSecs = editExam.sections.map((s,i) => i===editSecIdx
      ? { ...s, questions: s.questions.filter(q=>q.id!==qid) } : s);
    const updated = { ...editExam, sections: newSecs };
    setEditExam(updated); saveExam(updated);
  };

  const addSection = () => {
    if (!newSecName.trim()) return;
    const updated = { ...editExam, sections: [...editExam.sections, { id:uid(), name:newSecName, questions:[] }] };
    setEditExam(updated); saveExam(updated); setNewSecName("");
  };

  const totalQ = exams.reduce((a,e) => a + e.sections.reduce((b,s)=>b+s.questions.length,0), 0);

  // ── LIST VIEW ─────────────────────────────────────────────────────────
  if (view === "list") return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <style>{css}</style>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000,
        background:C.green, color:"#fff", padding:"10px 20px", borderRadius:10,
        fontSize:13, fontWeight:600 }}>{toast}</div>}

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:"0 28px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:36, height:36, borderRadius:10,
            background:`linear-gradient(135deg,${C.indigo},#7B5FFF)`,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:16 }}>⚡</span>
          </div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800 }}>ExamPortal</div>
            <div style={{ fontSize:10, color:C.muted }}>Admin Dashboard</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Badge color={C.green}>Admin</Badge>
          <Btn variant="ghost" size="sm" onClick={onLogout}>Logout</Btn>
        </div>
      </div>

      <div style={{ padding:28, maxWidth:1100, margin:"0 auto" }}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
          {[
            ["Total Exams", exams.length, C.indigo, "📋"],
            ["Published",   exams.filter(e=>e.status==="published").length, C.green, "✅"],
            ["Draft",       exams.filter(e=>e.status==="draft").length,     C.amber, "📝"],
            ["Questions",   totalQ, C.purple, "❓"],
          ].map(([label,val,color,icon]) => (
            <Card key={label} style={{ padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:.5 }}>{label}</div>
                  <div style={{ fontSize:30, fontWeight:800, color, fontFamily:"'JetBrains Mono',monospace" }}>{val}</div>
                </div>
                <span style={{ fontSize:22 }}>{icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Exam list */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700 }}>Exam Library</h2>
          <Btn onClick={createExam}>＋ New Exam</Btn>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {exams.length === 0 && (
            <Card style={{ textAlign:"center", padding:48, color:C.muted }}>
              No exams yet. Click "New Exam" to create one.
            </Card>
          )}
          {exams.map(exam => {
            const qCount = exam.sections.reduce((a,s)=>a+s.questions.length,0);
            return (
              <Card key={exam.id} style={{ display:"flex", alignItems:"center", gap:20, padding:"18px 24px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>{exam.title}</span>
                    <Badge color={exam.status==="published"?C.green:C.amber}>
                      {exam.status === "published" ? "PUBLISHED" : "DRAFT"}
                    </Badge>
                  </div>
                  <div style={{ display:"flex", gap:16, fontSize:12, color:C.muted }}>
                    <span>⏱ {fmtTime(exam.duration)}</span>
                    <span>📋 {exam.sections.length} sections</span>
                    <span>❓ {qCount} questions</span>
                    <span>🎯 Pass: {exam.passMark}%</span>
                    {exam.negMark && <span>⚠️ Negative: -{exam.negValue}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn size="sm" variant="subtle" onClick={() => openBuilder(exam)}>✏️ Edit</Btn>
                  {exam.status === "draft" && (
                    <Btn size="sm" variant="success" onClick={() => publishExam(exam.id)}>🚀 Publish</Btn>
                  )}
                  <Btn size="sm" variant="danger" onClick={() => deleteExam(exam.id)}>🗑</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── BUILDER VIEW ──────────────────────────────────────────────────────
  const curSec = editExam?.sections[editSecIdx];
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column" }}>
      <style>{css}</style>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000,
        background:C.green, color:"#fff", padding:"10px 20px", borderRadius:10,
        fontSize:13, fontWeight:600 }}>{toast}</div>}

      {/* Builder Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Btn size="sm" variant="ghost" onClick={()=>setView("list")}>← Back</Btn>
          <input value={editExam.title} onChange={e => setEditExam(p=>({...p,title:e.target.value}))}
            style={{ background:"transparent", border:"none", color:C.text,
              fontSize:16, fontWeight:700, fontFamily:"'Syne',sans-serif", width:280 }} />
          <Badge color={editExam.status==="published"?C.green:C.amber}>
            {editExam.status==="published"?"PUBLISHED":"DRAFT"}
          </Badge>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn size="sm" variant="subtle" onClick={() => saveExam(editExam)}>💾 Save</Btn>
          {editExam.status==="draft" && (
            <Btn size="sm" variant="success" onClick={()=>{ const u={...editExam,status:"published"}; setEditExam(u); saveExam(u); }}>
              🚀 Publish
            </Btn>
          )}
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Sidebar — sections */}
        <div style={{ width:220, borderRight:`1px solid ${C.border}`, background:C.surface,
          display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`,
            fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>
            Sections
          </div>
          <div style={{ flex:1, overflow:"auto" }}>
            {editExam.sections.map((s,i) => (
              <div key={s.id} onClick={()=>setEditSecIdx(i)} style={{
                padding:"12px 16px", cursor:"pointer", borderBottom:`1px solid ${C.border}`,
                background: i===editSecIdx ? `${C.indigo}22` : "transparent",
                borderLeft: i===editSecIdx ? `3px solid ${C.indigo}` : "3px solid transparent",
              }}>
                <div style={{ fontSize:13, fontWeight:600, color: i===editSecIdx?C.indigo:C.text }}>
                  {s.name}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.questions.length} questions</div>
              </div>
            ))}
          </div>
          <div style={{ padding:12, borderTop:`1px solid ${C.border}` }}>
            <input value={newSecName} onChange={e=>setNewSecName(e.target.value)}
              placeholder="New section name" onKeyDown={e=>e.key==="Enter"&&addSection()}
              style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`,
                borderRadius:8, padding:"8px 10px", color:C.text, fontSize:12, marginBottom:8 }} />
            <Btn style={{ width:"100%" }} size="sm" onClick={addSection}>＋ Add Section</Btn>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex:1, overflow:"auto", padding:24 }}>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:`1px solid ${C.border}`, paddingBottom:0 }}>
            {["questions","settings"].map(t => (
              <button key={t} className="tab-btn" onClick={()=>setTab(t)} style={{
                padding:"10px 20px", background:"transparent", border:"none",
                fontSize:13, fontWeight:600, cursor:"pointer",
                color: tab===t ? C.indigo : C.muted,
                borderBottom: tab===t ? `2px solid ${C.indigo}` : "2px solid transparent",
                textTransform:"capitalize",
              }}>{t}</button>
            ))}
          </div>

          {tab === "questions" && curSec && (
            <div className="fade-up">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>
                  {curSec.name} — Questions ({curSec.questions.length})
                </h3>
                <Btn onClick={()=>{ setEditQ(null); setQModal(true); }}>＋ Add Question</Btn>
              </div>

              {curSec.questions.length === 0 && (
                <Card style={{ textAlign:"center", padding:40, color:C.muted }}>
                  No questions yet. Click "Add Question" to create one.
                </Card>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {curSec.questions.map((q,i) => (
                  <Card key={q.id} style={{ padding:"18px 22px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                          <div style={{ background:`${C.indigo}22`, color:C.indigo,
                            borderRadius:7, padding:"3px 10px", fontSize:12, fontWeight:700 }}>
                            Q{i+1}
                          </div>
                          <Badge color={C.green}>+{q.marks} marks</Badge>
                        </div>
                        <p style={{ fontSize:14, lineHeight:1.6, marginBottom:12 }}>{q.text}</p>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                          {q.opts.map((o,oi) => (
                            <span key={oi} style={{
                              fontSize:12, padding:"4px 12px", borderRadius:7,
                              background: oi===q.correct ? `${C.green}22` : C.surface,
                              color: oi===q.correct ? C.green : C.muted,
                              border: `1px solid ${oi===q.correct ? C.green+"44" : C.border}`,
                              fontWeight: oi===q.correct ? 700 : 400,
                            }}>
                              {["A","B","C","D"][oi]}. {o} {oi===q.correct && "✓"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                        <Btn size="sm" variant="subtle" onClick={()=>{ setEditQ(q); setQModal(true); }}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={()=>deleteQuestion(q.id)}>Del</Btn>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="fade-up">
              <Card style={{ maxWidth:520 }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:20 }}>Exam Settings</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <Input label="Exam Title" value={editExam.title}
                    onChange={v => setEditExam(p=>({...p,title:v}))} />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <Input label="Duration (seconds)" type="number" value={editExam.duration}
                      onChange={v => setEditExam(p=>({...p,duration:Number(v)}))} min={60} />
                    <Input label="Pass Mark (%)" type="number" value={editExam.passMark}
                      onChange={v => setEditExam(p=>({...p,passMark:Number(v)}))} min={1} max={100} />
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <input type="checkbox" id="neg" checked={editExam.negMark}
                      onChange={e=>setEditExam(p=>({...p,negMark:e.target.checked}))}
                      style={{ width:16, height:16 }} />
                    <label htmlFor="neg" style={{ fontSize:13, color:C.text }}>Enable Negative Marking</label>
                  </div>
                  {editExam.negMark && (
                    <Input label="Negative Marks per wrong answer" type="number" value={editExam.negValue}
                      onChange={v => setEditExam(p=>({...p,negValue:Number(v)}))} min={0.25} />
                  )}
                  <div style={{ padding:14, background:`${C.amber}11`,
                    border:`1px solid ${C.amber}44`, borderRadius:10, fontSize:13, color:C.amber }}>
                    ⏱ Duration: {Math.floor(editExam.duration/3600)}h {Math.floor((editExam.duration%3600)/60)}m {editExam.duration%60}s
                  </div>
                  <Btn variant="success" onClick={()=>saveExam(editExam)} style={{ alignSelf:"flex-start" }}>
                    💾 Save Settings
                  </Btn>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal open={qModal} onClose={()=>{setQModal(false);setEditQ(null);}}
        initial={editQ} onSave={saveQuestion} />
    </div>
  );
}

// ── Question Modal ────────────────────────────────────────────────────────
function QuestionModal({ open, onClose, initial, onSave }) {
  const blank = { text:"", opts:["","","",""], correct:0, marks:4 };
  const [q, setQ] = useState(initial || blank);
  useEffect(() => { setQ(initial || blank); }, [open, initial]);

  const setOpt = (i,v) => setQ(p => { const o=[...p.opts]; o[i]=v; return {...p,opts:o}; });
  const valid  = q.text.trim() && q.opts.every(o=>o.trim());

  return (
    <Modal open={open} onClose={onClose} title={initial?"Edit Question":"Add Question"} width={560}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label style={{ fontSize:12, color:C.muted, fontWeight:500, display:"block", marginBottom:6 }}>
            Question Text *
          </label>
          <textarea value={q.text} onChange={e=>setQ(p=>({...p,text:e.target.value}))}
            rows={3} placeholder="Enter your question here..."
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:9, padding:"10px 14px", color:C.text, fontSize:13, resize:"vertical" }} />
        </div>

        <div>
          <label style={{ fontSize:12, color:C.muted, fontWeight:500, display:"block", marginBottom:10 }}>
            Options — click radio to set correct answer
          </label>
          {q.opts.map((o,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <input type="radio" name="correct" checked={q.correct===i}
                onChange={()=>setQ(p=>({...p,correct:i}))}
                style={{ width:16, height:16, accentColor:C.green, cursor:"pointer" }} />
              <div style={{ flex:1, position:"relative" }}>
                <input value={o} onChange={e=>setOpt(i,e.target.value)}
                  placeholder={`Option ${["A","B","C","D"][i]}`}
                  style={{ width:"100%", background: q.correct===i?`${C.green}11`:C.surface,
                    border:`1px solid ${q.correct===i?C.green+"66":C.border}`,
                    borderRadius:8, padding:"9px 14px", color:C.text, fontSize:13 }} />
                {q.correct===i && <span style={{ position:"absolute", right:10, top:"50%",
                  transform:"translateY(-50%)", fontSize:16 }}>✓</span>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:C.muted, fontWeight:500, display:"block", marginBottom:6 }}>Marks</label>
            <input type="number" value={q.marks} min={1}
              onChange={e=>setQ(p=>({...p,marks:Number(e.target.value)}))}
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:9, padding:"10px 14px", color:C.text, fontSize:13 }} />
          </div>
          <div style={{ display:"flex", alignItems:"flex-end" }}>
            <div style={{ padding:"10px 14px", background:`${C.green}11`,
              border:`1px solid ${C.green}44`, borderRadius:9, fontSize:13, color:C.green, width:"100%" }}>
              Correct: Option {["A","B","C","D"][q.correct]}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="success" disabled={!valid} onClick={()=>onSave(q)}>
            {initial ? "Update Question" : "Add Question"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CANDIDATE — EXAM ENGINE
// ══════════════════════════════════════════════════════════════════════════
function ExamEngine({ exam, candidate, onFinish }) {
  // Flatten all questions with section info
  const allQ = exam.sections.flatMap((s,si) =>
    s.questions.map((q,qi) => ({ ...q, secName:s.name, secIdx:si, secColor:["#5B7FFF","#22D3A0","#A855F7","#FFB340"][si%4] }))
  );

  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState({});   // qid -> optionIndex
  const [marked, setMarked]   = useState({});   // qid -> bool
  const [timeLeft, setTimeLeft] = useState(exam.duration);
  const [saving, setSaving]   = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const saveRef = useRef(null);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setSubmitModal(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const triggerSave = useCallback(() => {
    setSaving(true);
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => setSaving(false), 1000);
  }, []);

  const selectAnswer = (qid, opt) => {
    setAnswers(p => ({ ...p, [qid]: opt }));
    triggerSave();
  };

  const toggleMark = qid => setMarked(p => ({ ...p, [qid]: !p[qid] }));

  const navigate = dir => {
    if (dir === "next" && idx < allQ.length-1) setIdx(idx+1);
    if (dir === "prev" && idx > 0)             setIdx(idx-1);
  };

  const calcScore = () => {
    let score=0, correct=0, wrong=0, unattempted=0;
    allQ.forEach(q => {
      const a = answers[q.id];
      if (a === undefined) { unattempted++; return; }
      if (a === q.correct) { score += q.marks; correct++; }
      else if (exam.negMark) { score -= exam.negValue; wrong++; }
      else wrong++;
    });
    const maxScore = allQ.reduce((a,q)=>a+q.marks,0);
    return { score:Math.max(0,score), maxScore, correct, wrong, unattempted,
      pct: Math.round((Math.max(0,score)/maxScore)*100) };
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    onFinish(calcScore(), answers);
  };

  const q = allQ[idx];
  const ans = answers[q.id];
  const urgent  = timeLeft < 300;
  const warning = timeLeft < 600;
  const timePct = (timeLeft / exam.duration) * 100;
  const timerColor = urgent ? C.red : warning ? C.amber : C.green;

  // status for palette
  const getStatus = (qq) => {
    if (marked[qq.id]) return "marked";
    if (answers[qq.id] !== undefined) return "answered";
    return "unattempted";
  };

  const statusStyle = { answered:C.green, marked:C.purple, unattempted:C.dim };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:"0 20px", height:56, display:"flex", alignItems:"center",
        justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:32, height:32, borderRadius:9,
            background:`linear-gradient(135deg,${C.indigo},#7B5FFF)`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{exam.title}</div>
            <div style={{ fontSize:10, color:C.muted }}>{candidate.name}</div>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display:"flex", gap:6 }}>
          {exam.sections.map((s,si) => {
            const color = ["#5B7FFF","#22D3A0","#A855F7","#FFB340"][si%4];
            const active = q.secIdx === si;
            return (
              <button key={s.id} onClick={()=>{ const first=allQ.findIndex(qq=>qq.secIdx===si); setIdx(first); }}
                style={{ padding:"5px 14px", borderRadius:8, border:"none", fontSize:12, fontWeight:700,
                  background: active ? color : C.card,
                  color: active ? "#fff" : C.muted, cursor:"pointer" }}>
                {s.name}
              </button>
            );
          })}
        </div>

        {/* Timer + Save + Submit */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {/* Save indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11,
            color: saving ? C.amber : C.green }}>
            <div style={{ width:6, height:6, borderRadius:"50%",
              background: saving ? C.amber : C.green,
              animation: saving ? "pulse .8s infinite" : "none" }} />
            {saving ? "Saving..." : "Saved"}
          </div>

          {/* Timer */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px",
            borderRadius:10, border:`1px solid ${timerColor}44`,
            background: urgent ? `${C.red}11` : `${timerColor}0A`,
            animation: urgent ? "blink 1s infinite" : "none" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke={timerColor} strokeWidth={2.5}>
              <circle cx={12} cy={12} r={10}/><path d="M12 6v6l4 2"/>
            </svg>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:15,
              fontWeight:700, color:timerColor, letterSpacing:1 }}>
              {fmtTime(timeLeft)}
            </span>
          </div>

          {/* Timer progress bar */}
          <div style={{ width:80, height:5, background:C.border, borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${timePct}%`,
              background:timerColor, borderRadius:3, transition:"width 1s linear, background .5s" }} />
          </div>

          <Btn size="sm" variant="primary" onClick={()=>setSubmitModal(true)}>Submit Exam</Btn>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Question area */}
        <div style={{ flex:1, overflow:"auto", padding:28 }}>
          <div className="slide-in" key={idx}>
            {/* Q header */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <div style={{ background:`${q.secColor}22`, color:q.secColor,
                borderRadius:9, padding:"5px 14px", fontSize:13, fontWeight:800,
                fontFamily:"'JetBrains Mono',monospace" }}>
                Q{idx+1}/{allQ.length}
              </div>
              <Badge color={C.green}>+{q.marks} marks</Badge>
              {exam.negMark && <Badge color={C.red}>-{exam.negValue} wrong</Badge>}
              <span style={{ fontSize:12, color:C.muted }}>{q.secName}</span>

              <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                <Btn size="sm" variant={marked[q.id]?"primary":"ghost"}
                  onClick={()=>toggleMark(q.id)}>
                  {marked[q.id]?"🔖 Marked":"🔖 Mark"}
                </Btn>
                {ans !== undefined && (
                  <Btn size="sm" variant="ghost"
                    onClick={()=>setAnswers(p=>{ const n={...p}; delete n[q.id]; return n; })}>
                    ✕ Clear
                  </Btn>
                )}
              </div>
            </div>

            {/* Question text */}
            <Card style={{ marginBottom:22, padding:28 }}>
              <p style={{ fontSize:17, lineHeight:1.75, fontWeight:400 }}>{q.text}</p>
            </Card>

            {/* Options */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
              {q.opts.map((opt,oi) => {
                const sel = ans === oi;
                return (
                  <button key={oi} className="opt"
                    onClick={()=>selectAnswer(q.id, oi)}
                    style={{ padding:"15px 20px", borderRadius:12, textAlign:"left",
                      background: sel ? `${q.secColor}18` : C.card,
                      border: `2px solid ${sel ? q.secColor : C.border}`,
                      color: sel ? C.text : C.muted,
                      display:"flex", alignItems:"center", gap:14,
                      transition:"all .15s", width:"100%",
                    }}>
                    <div style={{ width:32, height:32, borderRadius:8, flexShrink:0,
                      background: sel ? q.secColor : C.surface,
                      color: sel ? "#fff" : C.dim,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                      transition:"all .15s" }}>
                      {["A","B","C","D"][oi]}
                    </div>
                    <span style={{ fontSize:14, fontWeight: sel?600:400, color: sel?C.text:C.muted }}>
                      {opt}
                    </span>
                    {sel && <span style={{ marginLeft:"auto", color:q.secColor, fontSize:18 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              paddingTop:20, borderTop:`1px solid ${C.border}` }}>
              <Btn variant="ghost" onClick={()=>navigate("prev")} disabled={idx===0}>
                ← Previous
              </Btn>
              <span style={{ fontSize:12, color:C.muted }}>
                {Object.keys(answers).length} / {allQ.length} answered
              </span>
              <Btn variant="primary" onClick={()=>navigate("next")} disabled={idx===allQ.length-1}>
                Save & Next →
              </Btn>
            </div>
          </div>
        </div>

        {/* Sidebar — palette */}
        <div style={{ width:260, borderLeft:`1px solid ${C.border}`, background:C.surface,
          display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
          {/* Mini timer ring */}
          <div style={{ padding:"18px 16px", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {/* SVG ring */}
              <div style={{ position:"relative", width:64, height:64 }}>
                <svg width={64} height={64} style={{ transform:"rotate(-90deg)" }}>
                  <circle cx={32} cy={32} r={26} fill="none" stroke={C.border} strokeWidth={5}/>
                  <circle cx={32} cy={32} r={26} fill="none" stroke={timerColor} strokeWidth={5}
                    strokeDasharray={2*Math.PI*26}
                    strokeDashoffset={2*Math.PI*26*(1-timePct/100)}
                    style={{ transition:"stroke-dashoffset 1s linear, stroke .5s" }}/>
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex",
                  alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:700, color:timerColor,
                  fontFamily:"'JetBrains Mono',monospace" }}>
                  {fmtTime(timeLeft)}
                </div>
              </div>
              <div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Progress</div>
                <div style={{ fontSize:22, fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>
                  {Object.keys(answers).length}<span style={{ fontSize:14, color:C.muted, fontWeight:400 }}>/{allQ.length}</span>
                </div>
                <div style={{ fontSize:11, color:C.green }}>answered</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`,
            display:"flex", gap:14 }}>
            {[["answered",C.green],["marked",C.purple],["unattempted",C.dim]].map(([l,c])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:C.muted }}>
                <div style={{ width:8, height:8, borderRadius:2, background:c }}/>
                {l}
              </div>
            ))}
          </div>

          {/* Palette */}
          <div style={{ flex:1, overflow:"auto", padding:14 }}>
            {exam.sections.map((s,si) => {
              const sColor = ["#5B7FFF","#22D3A0","#A855F7","#FFB340"][si%4];
              const sQs = allQ.filter(qq=>qq.secIdx===si);
              return (
                <div key={s.id} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, color:sColor, fontWeight:700, marginBottom:8,
                    textTransform:"uppercase", letterSpacing:.5 }}>
                    {s.name}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5 }}>
                    {sQs.map((qq,qi) => {
                      const globalIdx = allQ.indexOf(qq);
                      const st = getStatus(qq);
                      const isCurrent = globalIdx === idx;
                      return (
                        <button key={qq.id} onClick={()=>setIdx(globalIdx)}
                          style={{ aspectRatio:"1", borderRadius:7, border:"none",
                            background: isCurrent ? sColor :
                              st==="answered" ? `${C.green}33` :
                              st==="marked"   ? `${C.purple}33` : C.card,
                            color: isCurrent ? "#fff" :
                              st==="answered" ? C.green :
                              st==="marked"   ? C.purple : C.dim,
                            fontSize:11, fontWeight:700, cursor:"pointer",
                            outline: isCurrent ? `2px solid ${sColor}` : "none",
                            outlineOffset:1,
                            fontFamily:"'JetBrains Mono',monospace",
                          }}>
                          {qi+1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {submitModal && (() => {
        const s = calcScore();
        const answered = Object.keys(answers).length;
        return (
          <Modal open title="Submit Exam?" onClose={()=>setSubmitModal(false)} width={420}>
            <div style={{ marginBottom:20, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {[["Answered",answered,C.green],["Unanswered",allQ.length-answered,C.amber],
                ["Marked",Object.values(marked).filter(Boolean).length,C.purple]].map(([l,v,c])=>(
                <div key={l} style={{ textAlign:"center", background:C.surface,
                  borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:24, fontWeight:800, color:c,
                    fontFamily:"'JetBrains Mono',monospace" }}>{v}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
            {timeLeft === 0 && (
              <div style={{ background:`${C.red}22`, border:`1px solid ${C.red}44`,
                borderRadius:10, padding:12, marginBottom:16, fontSize:13, color:C.red, textAlign:"center" }}>
                ⏰ Time's up! Exam auto-submitted.
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              {timeLeft > 0 && <Btn variant="ghost" style={{ flex:1 }} onClick={()=>setSubmitModal(false)}>
                Continue Exam
              </Btn>}
              <Btn variant="success" style={{ flex:1 }} onClick={handleSubmit}>
                ✓ Confirm Submit
              </Btn>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// RESULT SCREEN
// ══════════════════════════════════════════════════════════════════════════
function ResultScreen({ exam, score, onBack }) {
  const pass = score.pct >= exam.passMark;
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
      alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{css}</style>
      <div className="fade-up" style={{ maxWidth:500, width:"100%" }}>
        <Card style={{ textAlign:"center", padding:44 }}>
          <div style={{ fontSize:64, marginBottom:16 }}>{pass?"🏆":"😔"}</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, marginBottom:8 }}>
            {pass ? "Congratulations!" : "Better luck next time"}
          </h1>
          <p style={{ color:C.muted, fontSize:14, marginBottom:32 }}>
            {exam.title} — Result
          </p>

          {/* Score ring */}
          <div style={{ position:"relative", width:140, height:140, margin:"0 auto 28px" }}>
            <svg width={140} height={140} style={{ transform:"rotate(-90deg)" }}>
              <circle cx={70} cy={70} r={58} fill="none" stroke={C.border} strokeWidth={10}/>
              <circle cx={70} cy={70} r={58} fill="none"
                stroke={pass?C.green:C.red} strokeWidth={10}
                strokeDasharray={2*Math.PI*58}
                strokeDashoffset={2*Math.PI*58*(1-score.pct/100)}
                style={{ transition:"stroke-dashoffset 1.5s ease" }}/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex",
              flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:32, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                color:pass?C.green:C.red }}>
                {score.pct}%
              </span>
              <span style={{ fontSize:11, color:C.muted }}>score</span>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:28 }}>
            {[
              ["Score", `${score.score}/${score.maxScore}`, C.indigo],
              ["Percentage", `${score.pct}%`, pass?C.green:C.red],
              ["Correct", score.correct, C.green],
              ["Wrong", score.wrong, C.red],
            ].map(([l,v,c])=>(
              <div key={l} style={{ background:C.surface, borderRadius:12, padding:16 }}>
                <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{l}</div>
                <div style={{ fontSize:24, color:c, fontWeight:800,
                  fontFamily:"'JetBrains Mono',monospace" }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ padding:14, borderRadius:10, marginBottom:24,
            background: pass?`${C.green}22`:`${C.red}22`,
            border:`1px solid ${pass?C.green+"44":C.red+"44"}`,
            color:pass?C.green:C.red, fontWeight:700, fontSize:14 }}>
            {pass ? `✅ PASSED — Required ${exam.passMark}%` : `❌ FAILED — Required ${exam.passMark}%`}
          </div>

          <Btn variant="primary" style={{ width:"100%" }} onClick={onBack}>
            ← Back to Exam List
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════════════
function LoginScreen({ exams, onLogin }) {
  const [id, setId]     = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState("");

  const handle = () => {
    if (id === "admin" && pass === "admin123") { onLogin("admin", null); return; }
    const exam = exams.find(e => e.status === "published");
    if (id.trim() && pass === "exam123") {
      onLogin("candidate", { name: id || "Candidate", id });
      return;
    }
    setErr("Invalid credentials. Try admin/admin123 or YourName/exam123");
  };

  const published = exams.filter(e=>e.status==="published");

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
      alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{css}</style>
      <div className="fade-up" style={{ width:"100%", maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", width:72, height:72, borderRadius:20,
            background:`linear-gradient(135deg,${C.indigo},#7B5FFF)`,
            alignItems:"center", justifyContent:"center", marginBottom:18,
            boxShadow:`0 20px 60px ${C.indigo}33` }}>
            <span style={{ fontSize:32 }}>⚡</span>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800, letterSpacing:-1 }}>
            ExamPortal
          </h1>
          <p style={{ color:C.muted, fontSize:13, marginTop:6 }}>AI-Powered Examination System</p>
        </div>

        <Card style={{ padding:32 }}>
          <div style={{ marginBottom:20, padding:12, background:`${C.indigo}11`,
            border:`1px solid ${C.indigo}33`, borderRadius:10, fontSize:12, color:C.muted }}>
            <strong style={{ color:C.indigo }}>Admin:</strong> admin / admin123<br/>
            <strong style={{ color:C.green }}>Candidate:</strong> YourName / exam123
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
            <Input label="Name / ID" value={id} onChange={v=>{setId(v);setErr("");}}
              placeholder="Enter your name or admin" />
            <Input label="Password" type="password" value={pass}
              onChange={v=>{setPass(v);setErr("");}} placeholder="Enter password" />
          </div>

          {err && <div style={{ color:C.red, fontSize:12, marginBottom:14, display:"flex",
            gap:6, alignItems:"center" }}>⚠️ {err}</div>}

          <Btn variant="primary" style={{ width:"100%", justifyContent:"center" }}
            onClick={handle} size="lg">
            Login →
          </Btn>

          {published.length > 0 && (
            <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:10, textTransform:"uppercase", letterSpacing:.5 }}>
                Available Exams
              </div>
              {published.map(e=>(
                <div key={e.id} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"8px 12px", background:C.surface,
                  borderRadius:8, marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.text }}>{e.title}</span>
                  <span style={{ fontSize:11, color:C.muted }}>⏱ {fmtTime(e.duration)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// EXAM SELECT (candidate picks which exam)
// ══════════════════════════════════════════════════════════════════════════
function ExamSelect({ exams, candidate, onSelect, onLogout }) {
  const published = exams.filter(e=>e.status==="published");
  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <style>{css}</style>
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:"0 28px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800 }}>⚡ ExamPortal</div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:13, color:C.muted }}>Welcome, {candidate.name}</span>
          <Btn size="sm" variant="ghost" onClick={onLogout}>Logout</Btn>
        </div>
      </div>
      <div style={{ padding:40, maxWidth:700, margin:"0 auto" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, marginBottom:24 }}>
          Available Exams
        </h2>
        {published.length === 0 && (
          <Card style={{ textAlign:"center", padding:48, color:C.muted }}>
            No published exams available yet.
          </Card>
        )}
        {published.map(e=>{
          const qCount = e.sections.reduce((a,s)=>a+s.questions.length,0);
          const maxScore = e.sections.flatMap(s=>s.questions).reduce((a,q)=>a+q.marks,0);
          return (
            <Card key={e.id} style={{ marginBottom:14, padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, marginBottom:10 }}>
                    {e.title}
                  </h3>
                  <div style={{ display:"flex", gap:14, fontSize:12, color:C.muted, flexWrap:"wrap" }}>
                    <span>⏱ {fmtTime(e.duration)}</span>
                    <span>❓ {qCount} questions</span>
                    <span>📋 {e.sections.length} sections</span>
                    <span>🎯 Max: {maxScore} marks</span>
                    <span>✅ Pass: {e.passMark}%</span>
                    {e.negMark && <span style={{color:C.red}}>⚠️ Negative marking: -{e.negValue}</span>}
                  </div>
                </div>
                <Btn variant="success" onClick={()=>onSelect(e)}>Start Exam →</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [exams, setExams]       = useState([seedExam]);
  const [screen, setScreen]     = useState("login");   // login|admin|examSelect|exam|result
  const [role, setRole]         = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  const [result, setResult]     = useState(null);

  const handleLogin = (r, cand) => {
    setRole(r);
    if (r === "admin") { setScreen("admin"); return; }
    setCandidate(cand);
    setScreen("examSelect");
  };

  const handleLogout = () => { setRole(null); setCandidate(null); setScreen("login"); };

  const handleStartExam = exam => { setActiveExam(exam); setScreen("exam"); };

  const handleFinish = (score, answers) => {
    setResult({ score, answers });
    setScreen("result");
  };

  if (screen === "login")
    return <LoginScreen exams={exams} onLogin={handleLogin}/>;

  if (screen === "admin")
    return <AdminPanel exams={exams} setExams={setExams} onLogout={handleLogout}/>;

  if (screen === "examSelect")
    return <ExamSelect exams={exams} candidate={candidate}
      onSelect={handleStartExam} onLogout={handleLogout}/>;

  if (screen === "exam" && activeExam)
    return <ExamEngine exam={activeExam} candidate={candidate} onFinish={handleFinish}/>;

  if (screen === "result" && result)
    return <ResultScreen exam={activeExam} score={result.score}
      onBack={()=>setScreen("examSelect")}/>;

  return null;
}
