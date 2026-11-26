'use client';

import {useEffect, useRef, useState} from 'react';
import {BrainCircuit, Grid2X2, Hourglass, Sparkles, Timer, ChevronLeft, Download, Copy, Check} from 'lucide-react';
import {tests, iq, memory, mental} from '../lib/tests.js';

const questions = {iq,memory,'mental-age':mental};
const icons = {iq:BrainCircuit,memory:Grid2X2,'mental-age':Hourglass};

function TestIcon({test}) {
  const Icon = icons[test];
  return <span className="card-icon" aria-hidden="true"><Icon size={26} strokeWidth={1.85}/></span>;
}

const initials = ['A','B','C','D','E'];

const warmups = {
  iq:{label:'Spot the pattern', prompt:'What comes next?  3, 6, 12, 24, …', choices:['30','36','48'], correct:2, note:'Each number doubles. The answer is 48.'},
  memory:{label:'Test your recall', prompt:'Which shape was in the middle?', choices:['●','◆','▲'], correct:1, note:'The diamond was in the middle.'},
  'mental-age':{label:'Explore your habits', prompt:'Your plans fall through. What sounds best?', choices:['Explore','Make a plan','Relax'], note:'Mental Age explores how you make everyday choices.'}
};

function Brand() {
  return <a className="brand" href="/" aria-label="MindTest home"><img src="/mindtest-mark.svg" alt="" width="34" height="34"/>MindTest<span className="brand-dot">.</span></a>;
}

function Warmup({test}) {
  const [answer,setAnswer] = useState(null);
  const [phase,setPhase] = useState('idle');
  useEffect(()=>{
    if(phase!=='memorize') return;
    const timer=setTimeout(()=>setPhase('recall'),2400);
    return ()=>clearTimeout(timer);
  },[phase]);
  const item=warmups[test];
  const isMemory=test==='memory';
  return <div className="warmup-card">
    <span className="warmup-label"><Sparkles size={16} aria-hidden="true"/> Quick warm-up</span>
    <p>{isMemory && phase!=='recall' ? 'Remember three shapes' : item.prompt}</p>
    {isMemory && phase==='idle' ? <button className="warmup-option" onClick={()=>setPhase('memorize')}>Show shapes</button> :
      isMemory && phase==='memorize' ? <div className="warmup-shapes" aria-label="Circle, diamond, triangle">● ◆ ▲</div> :
      <div className="warmup-options">{item.choices.map((choice,i)=><button key={choice} className="warmup-option" aria-pressed={answer===i} onClick={()=>setAnswer(i)}>{choice}</button>)}</div>}
    {answer!==null && <small role="status">{item.correct!==undefined && (answer===item.correct?'Correct! ':'Nice try. ')}{item.note}</small>}
  </div>;
}

function Landing() {
  const [active,setActive] = useState('iq');
  return <>
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow"><Sparkles size={16} aria-hidden="true"/> THE PLAYFUL BRAIN LAB</span>
      <h1>Meet your<br/> <em>curious mind.</em></h1>
      <p>Spot a pattern. Recall a detail. See where your curiosity takes you.</p>
      <div className="hero-switch" aria-label="Choose a warm-up">{Object.entries(warmups).map(([id,item])=>{
        const Icon=icons[id];
        return <button key={id} aria-pressed={active===id} onClick={()=>setActive(id)}><Icon size={17} aria-hidden="true"/>{item.label}</button>;
      })}</div>
      <a className="button primary" href={'?test='+active}>Start {tests[active].title}</a></div>
      <div className="hero-art"><img src="/momo.jpg" alt="Momo, a lavender brain mascot sitting on a Saturn ring"/><Warmup test={active} key={active}/></div>
    </section>
    <section id="tests" className="test-section">
      <div className="section-heading"><h2>Pick a test</h2><p>What are you curious about today?</p></div>
      <div className="test-grid">{Object.entries(tests).map(([id,t]) =>
        <article className={'test-card '+t.color} key={id}>
          <div className="card-top"><TestIcon test={id}/><span className="duration"><Timer size={15} aria-hidden="true"/>{t.time}</span></div>
          <h3>{t.title}</h3><p>{t.description}</p>
          <a className="button card-button" href={'?test='+id}>Start test<span className="sr-only">{' — '+t.title}</span></a>
        </article>
      )}</div>
    </section>
  </>;
}

function Quiz({test}) {
  const [answers,setAnswers] = useState([]);
  const [selected,setSelected] = useState(null);
  const [reveal,setReveal] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const attempt = useRef(null);
  const index = answers.length;
  const list = questions[test], info = tests[test];
  const done = index === list.length;
  useEffect(() => {
    if (test !== 'memory' || done) return;
    const timer = setTimeout(() => setReveal(true), 2800);
    return () => clearTimeout(timer);
  },[test,index,done]);
  function advance() {
    if (selected === null) return;
    setAnswers(current => [...current,selected]);
    setSelected(null);
    setReveal(false);
  }
  async function checkout() {
    setBusy(true);
    setError('');
    try {
      attempt.current ||= crypto.randomUUID();
      const r = await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({test,answers,attempt:attempt.current})});
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (data.resultUrl) {location.assign(data.resultUrl);return;}
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://secure.wayforpay.com/pay';
      for (const [key,value] of Object.entries(data.fields)) {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = key; input.value = value;
        form.append(input);
      }
      document.body.append(form);
      form.submit();
    } catch (e) {
      setError(e.message || 'Try again in a moment.');
      setBusy(false);
    }
  }
  const [prompt,values] = list[index] || [];
  const memorizing = test === 'memory' && !reveal;
  return <section className={'panel '+info.color}>
    <a className="back" href="/"><ChevronLeft size={18} aria-hidden="true"/>All tests</a>
    <div className="quiz-label"><TestIcon test={test}/>{info.title}<span>{done ? 'Finished' : (index+1)+' / '+list.length}</span></div>
    <progress aria-label="Questions answered" value={index} max={list.length}/>
    {done ? <>
      <h1>Your result is ready.</h1>
      <p>Unlock your score, a breakdown by category, and a downloadable certificate.</p>
      <div className="checkout"><div><strong>$1.00</strong><small>One-time payment · USD</small></div><button className="button primary" onClick={checkout} disabled={busy}>{busy?'Opening checkout…':'Unlock my result'}</button></div>
      <p className="methods">WayForPay · Card · Apple Pay · Google Pay</p>
      {error && <p role="alert" className="error">{error}</p>}
    </> : <>
      <h1>{memorizing ? 'Remember this' : prompt}</h1>
      {memorizing ? <div className="memory-display" key={index}>{values[0]}</div> :
      <div className="answers">{(test==='memory'?values.slice(1):values).map((value,i)=>
        <button key={i} className={'answer '+(selected===i?'chosen':'')} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{initials[i]}</span>{value}</button>
      )}</div>}
      <button className="button primary next" disabled={memorizing || selected===null} onClick={advance}>{index+1===list.length?'Finish test':'Continue'}</button>
    </>}
  </section>;
}

function certificate(test,result,paidAt) {
  const canvas = document.createElement('canvas');
  canvas.width=1440;canvas.height=1000;
  const c=canvas.getContext('2d');
  const fill=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  const write=(str,size,color,x,y,weight=500)=>{c.fillStyle=color;c.font=weight+' '+size+'px Arial';c.fillText(str,x,y);};
  fill('#21194c',0,0,1440,1000);
  fill('#f6f3ff',26,26,1388,948);
  fill('#e8e0ff',55,55,1330,890);
  fill('#faf8ff',59,59,1322,882);
  fill('#ded4ff',800,165,485,630);
  c.save();
  c.translate(143,139);
  c.scale(.73,.73);
  c.fillStyle='#633ad8';
  c.fill(new Path2D('M18 19h8a6 6 0 1 1 12 0h8a4 4 0 0 1 4 4v8a6 6 0 1 1 0 12v6a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V23a4 4 0 0 1 4-4Z'));
  c.strokeStyle='#fff';
  c.lineWidth=3.6;
  c.lineCap='round';
  c.lineJoin='round';
  c.stroke(new Path2D('M23 44V29l9 10 9-10v15'));
  c.restore();
  write('MINDTEST',32,'#6139cf',199,173,800);
  write('Certificate',85,'#21194c',140,322,800);
  write('of completion',70,'#21194c',142,408,800);
  write(tests[test].title,37,'#6139cf',146,488,700);
  write(result.score+' '+result.unit,124,'#21194c',137,651,800);
  write('Completed '+new Date(paidAt).toISOString().slice(0,10),24,'#574c72',146,790);
  write('FOR PERSONAL EXPLORATION',19,'#675b83',146,868,700);
  write('Result breakdown',35,'#21194c',850,251,800);
  result.groups.forEach(({label,percent},i)=>{
    const y=335+i*105;
    write(label,24,'#21194c',850,y,700);
    write(percent+'%',23,'#6139cf',1165,y,700);
    fill('#f5f0ff',850,y+20,380,15);
    fill('#7549e6',850,y+20,380*percent/100,15);
  });
  return canvas.toDataURL('image/png');
}

function Result({id}) {
  const [data,setData] = useState(null);
  const [error,setError] = useState('');
  const [copied,setCopied] = useState(false);
  const [png,setPng] = useState('');
  useEffect(()=>{
    let stopped=false, timer;
    const controller=new AbortController();
    async function fetchResult(){
      try {
        const r=await fetch('/api/result?id='+encodeURIComponent(id),{signal:controller.signal});
        const value=await r.json();
        if(stopped)return;
        if(r.status===404) {setError(value.error);return;}
        if(!r.ok) throw new Error(value.error);
        setError('');
        setData(value);
        if(value.result) setPng(certificate(value.test,value.result,value.paid_at));
        else if (!['Declined','Expired','Refunded','Voided'].includes(value.payment_status)) timer=setTimeout(fetchResult,2000);
      } catch(e) {
        if(stopped)return;
        setError(e.message);
        timer=setTimeout(fetchResult,4000);
      }
    }
    fetchResult();
    return()=>{stopped=true;controller.abort();clearTimeout(timer);};
  },[id]);
  const result=data?.result;
  const terminal=['Declined','Expired','Refunded','Voided'].includes(data?.payment_status);
  if(!result) return <section className="panel">
    <a className="back" href="/"><ChevronLeft size={18} aria-hidden="true"/>All tests</a>
    <h1>{terminal?'Payment incomplete':'Checking your payment'}</h1>
    <p role="status">{error || (terminal?'Go back to choose a test and try again.':'Your result will appear here as soon as WayForPay confirms the payment.')}</p>
  </section>;
  const share=new URL('/?test='+data.test,location.origin).href;
  const encoded=encodeURIComponent(share);
  return <section className="panel results">
    <a className="back" href="/"><ChevronLeft size={18} aria-hidden="true"/>All tests</a>
    <h1>Your {tests[data.test].title} result</h1>
    <p>{data.test==='mental-age'?'Your playful profile reflects the habits you picked.':'Your score reflects correct answers on this quiz.'} For personal exploration.</p>
    {png && <><img className="certificate" src={png} alt={tests[data.test].title+' certificate with score '+result.score+' '+result.unit}/><a className="button primary" href={png} download={'mindtest-'+data.test+'.png'}><Download size={18} aria-hidden="true"/>Download certificate</a></>}
    <h2>Share this test</h2>
    <div className="share">
      <a href={'https://www.linkedin.com/sharing/share-offsite/?url='+encoded} target="_blank" rel="noreferrer">LinkedIn</a>
      <a href={'https://www.facebook.com/sharer/sharer.php?u='+encoded} target="_blank" rel="noreferrer">Facebook</a>
      <a href={'https://twitter.com/intent/tweet?url='+encoded} target="_blank" rel="noreferrer">X / Twitter</a>
      <button onClick={async()=>{try{await navigator.clipboard.writeText(share);setCopied(true);}catch{setCopied(false);}}}>{copied?<Check size={16} aria-hidden="true"/>:<Copy size={16} aria-hidden="true"/>}{copied?'Copied!':'Copy link'}</button>
    </div>
    <input className="share-url" readOnly value={share} aria-label="Test link" onFocus={event=>event.target.select()}/>
  </section>;
}

export default function Experience() {
  const [route,setRoute] = useState(null);
  useEffect(()=>{
    const params=new URLSearchParams(location.search);
    setRoute({test:params.get('test'),result:params.get('result')});
  },[]);
  const test=route?.test && Object.hasOwn(tests,route.test) ? route.test:null;
  return <>
    <header><div className="shell nav"><Brand/><a className="nav-link" href="/#tests">Tests</a><a className="button nav-button" href="/#tests">Choose a test</a></div></header>
    <main className="shell">{route?.result ? <Result id={route.result}/> : test ? <Quiz key={test} test={test}/> : <Landing/>}</main>
    <footer className="shell"><Brand/><p>Quizzes for personal exploration.</p></footer>
  </>;
}
