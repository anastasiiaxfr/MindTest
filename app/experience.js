'use client';

import {useEffect, useRef, useState} from 'react';
import {BrainCircuit, Grid2X2, Hourglass, Timer, ChevronLeft, Download, Copy, Check} from 'lucide-react';
import {tests, iq, memory, mental} from '../lib/tests.js';
import Footer, {Brand} from './footer.js';
import {describeFigure,iqQuestionVersion} from '../lib/iq-questions.js';

const questions = {iq,memory,'mental-age':mental};
const icons = {iq:BrainCircuit,memory:Grid2X2,'mental-age':Hourglass};

function TestIcon({test}) {
  const Icon = icons[test];
  return <span className="card-icon" aria-hidden="true"><Icon size={26} strokeWidth={1.85}/></span>;
}

const initials = ['A','B','C','D','E'];

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="shell hero-stage">
      <div className="hero-copy">
        <h1 id="hero-title">Meet your curious mind.</h1>
        <p>Three quick tests for logic, memory, and the way you see the world.</p>
        <a className="button hero-cta" href="#tests">Explore the tests</a>
      </div>
      <div className="hero-visual">
        <img className="hero-mascot" src="/momo.png" alt="Momo, a lavender brain mascot sitting on a Saturn ring" width="1080" height="720" fetchPriority="high"/>
        <nav className="hero-tests" aria-label="Start a test">
          {Object.entries(tests).map(([id,test])=>{
            const Icon=icons[id];
            return <a key={id} className={'hero-test '+test.color} href={'?test='+id}><Icon size={23} aria-hidden="true"/>{test.title}</a>;
          })}
        </nav>
      </div>
    </div>
  </section>;
}

function Landing() {
  return <>
    <Hero/>
    <section id="tests" className="shell test-section">
      <div className="section-heading"><h2>Pick a test</h2><p>What are you curious about today?</p></div>
      <div className="test-grid">{Object.entries(tests).map(([id,t]) =>
        <article className={'test-card '+t.color} key={id}>
          <div className="card-top"><img className="test-art" src={'/'+id+'.png'} alt="" width="224" height="180" loading="lazy"/><span className="duration"><Timer size={15} aria-hidden="true"/>{t.time}</span></div>
          <h3>{t.title}</h3><p>{t.description}</p>
          <a className="button card-button" href={'?test='+id}>Start test<span className="sr-only">{' — '+t.title}</span></a>
        </article>
      )}</div>
    </section>
  </>;
}

function Figure({figure}) {
  if (figure.kind === 'arrow') {
    return <span className="figure-arrow" style={{transform:'rotate('+figure.angle*90+'deg)'}} aria-hidden="true">↑</span>;
  }
  if (figure.kind === 'dots') {
    return <span className="figure-dots" aria-hidden="true">{Array.from({length:figure.count},(_,i)=><i key={i}/>)}</span>;
  }
  if (figure.kind === 'corner' || figure.kind === 'tile') {
    const marked = figure.kind==='corner' ? [[0,1,3,2][figure.angle]] : figure.cells;
    return <span className="figure-block" aria-hidden="true">{[0,1,2,3].map(i=><i key={i} className={marked.includes(i)?'marked':''}/>)}</span>;
  }
  if (figure.kind === 'pair') {
    return <span className="figure-pair" aria-hidden="true">
      <i className={'figure-shape shape-'+figure.outer+' outline'}/>
      <i className={'figure-shape shape-'+figure.inner}/>
    </span>;
  }
  return <span className={'figure-shape shape-'+figure.kind+(figure.outline?' outline':'')} aria-hidden="true"/>;
}

function Puzzle({puzzle}) {
  return <div className={'figure-board '+(puzzle.cells.length===9?'figure-matrix':'figure-sequence')} style={{'--cols':puzzle.cols}} aria-label="Puzzle tiles">
    {puzzle.cells.map((figure,i)=><div className={'figure-cell '+(!figure?'figure-missing':'')} key={i}>
      <span className="sr-only">{figure?describeFigure(figure):'Missing tile'}</span>
      {figure?<Figure figure={figure}/>:<span aria-hidden="true">?</span>}
    </div>)}
  </div>;
}

function Quiz({test}) {
  const [answers,setAnswers] = useState([]);
  const [started,setStarted] = useState(test!=='iq');
  const [iqIndex,setIqIndex] = useState(0);
  const [selected,setSelected] = useState(null);
  const [reveal,setReveal] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const attempt = useRef(null);
  const list = questions[test], info = tests[test];
  const isIQ = test === 'iq';
  const answered = answers.filter(Number.isInteger).length;
  const done = answered === list.length;
  const index = isIQ ? iqIndex : answered;
  useEffect(() => {
    if (test !== 'memory' || done) return;
    const timer = setTimeout(() => setReveal(true), 2800);
    return () => clearTimeout(timer);
  },[test,index,done]);
  function advance() {
    if (selected === null) return;
    if (isIQ) {
      const updated = [...answers];
      updated[index] = selected;
      setAnswers(updated);
      const next = nextUnanswered(updated);
      if (next !== -1) setIqIndex(next);
    } else {
      setAnswers(current => [...current,selected]);
    }
    setSelected(null);
    setReveal(false);
  }
  function nextUnanswered(current) {
    for (let offset=1; offset<list.length; offset++) {
      const candidate=(index+offset)%list.length;
      if (!Number.isInteger(current[candidate])) return candidate;
    }
    return -1;
  }
  function skip() {
    const next=nextUnanswered(answers);
    if (next === -1) return;
    setIqIndex(next);
    setSelected(null);
  }
  async function checkout() {
    setBusy(true);
    setError('');
    try {
      attempt.current ||= crypto.randomUUID();
      const r = await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({test,answers,attempt:attempt.current,version:isIQ ? iqQuestionVersion : undefined})});
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
  const [prompt,values,,,puzzle] = list[index] || [];
  const memorizing = test === 'memory' && !reveal;
  return <section className={'panel '+info.color}>
    <a className="back" href="/"><ChevronLeft size={18} aria-hidden="true"/>All tests</a>
    <div className="quiz-label"><TestIcon test={test}/>{info.title}<span>{done ? 'Finished' : (index+1)+' / '+list.length}</span></div>
    <progress aria-label="Questions answered" value={answered} max={list.length}/>
    {!started ? <>
      <h1>Put your reasoning to the test</h1>
      <p>Work through 25 questions, from simple sequences to grids with multiple rules. You can skip a question and return to it before finishing.</p>
      <button className="button primary next" onClick={()=>setStarted(true)}>Start IQ Test</button>
    </> : done ? <>
      <h1>Your result is ready.</h1>
      <p>Unlock your score, a breakdown by category, and a downloadable certificate.</p>
      <div className="checkout"><div><strong>$1.00</strong><small>One-time payment · USD</small></div><button className="button primary" onClick={checkout} disabled={busy}>{busy?'Opening checkout…':'Unlock my result'}</button></div>
      <p className="methods">WayForPay · Card · Apple Pay · Google Pay</p>
      {error && <p role="alert" className="error">{error}</p>}
    </> : <>
      <h1>{memorizing ? 'Remember this' : prompt}</h1>
      {puzzle && <Puzzle puzzle={puzzle}/>}
      {memorizing ? <div className="memory-display" key={index}>{values[0]}</div> :
      <div className={'answers '+(puzzle?'figure-answers':'')}>{(test==='memory'?values.slice(1):values).map((value,i)=>
        <button key={i} className={'answer '+(selected===i?'chosen':'')} aria-pressed={selected===i}
          aria-label={puzzle?initials[i]+': '+describeFigure(value):undefined} onClick={()=>setSelected(i)}>
          <span className="answer-letter">{initials[i]}</span>{puzzle?<Figure figure={value}/>:value}
        </button>
      )}</div>}
      <div className="quiz-actions">
        <button className="button primary next" disabled={memorizing || selected===null} onClick={advance}>{answered+1===list.length?'Finish test':'Continue'}</button>
        {isIQ && <button className="button skip-question" disabled={nextUnanswered(answers)===-1} onClick={skip}>Skip for now</button>}
      </div>
    </>}
  </section>;
}

function certificate(test,result,paidAt) {
  const canvas = document.createElement('canvas');
  canvas.width=1440;canvas.height=1000;
  const c=canvas.getContext('2d');
  const fill=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  const write=(str,size,color,x,y,weight=600)=>{c.fillStyle=color;c.font=weight+' '+size+'px Dosis, Arial';c.fillText(str,x,y);};
  fill('#21194c',0,0,1440,1000);
  fill('#f6f3ff',26,26,1388,948);
  fill('#e8e0ff',55,55,1330,890);
  fill('#faf8ff',59,59,1322,882);
  fill('#ded4ff',800,165,485,630);
  c.save();
  c.translate(143,139);
  c.scale(.73,.73);
  c.fillStyle='#633ad8';
  c.beginPath();
  c.roundRect(0,0,64,64,16);
  c.fill();
  c.strokeStyle='#fff8ff';
  c.lineWidth=3.5;
  c.lineJoin='round';
  c.stroke(new Path2D('M15 21h11a5 5 0 1 1 8 0h12v10a5.5 5.5 0 1 1 0 8v12H15Z'));
  c.lineCap='round';
  c.stroke(new Path2D('M22 43V29l8.5 9 8.5-9v14'));
  c.restore();
  write('MINDTEST',32,'#6139cf',199,173,600);
  write('Certificate',85,'#21194c',140,322,600);
  write('of completion',70,'#21194c',142,408,600);
  write(tests[test].title,37,'#6139cf',146,488,600);
  write(result.score+' '+result.unit,124,'#21194c',137,651,600);
  write('Completed '+new Date(paidAt).toISOString().slice(0,10),24,'#574c72',146,790);
  write('FOR PERSONAL EXPLORATION',19,'#675b83',146,868,600);
  write('Result breakdown',35,'#21194c',850,251,600);
  result.groups.forEach(({label,percent},i)=>{
    const y=335+i*105;
    write(label,24,'#21194c',850,y,600);
    write(percent+'%',23,'#6139cf',1165,y,600);
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
        if(value.result) {
          await document.fonts.load('600 85px "Dosis"').catch(()=>{});
          if(!stopped) setPng(certificate(value.test,value.result,value.paid_at));
        }
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
  const refunded=['Refunded','Voided'].includes(data?.payment_status);
  const terminal=refunded || ['Declined','Expired'].includes(data?.payment_status);
  if(!result) return <section className="panel">
    <a className="back" href="/"><ChevronLeft size={18} aria-hidden="true"/>All tests</a>
    <h1>{refunded?'Payment returned':terminal?'Payment incomplete':'Checking your payment'}</h1>
    <p role="status">{error || (refunded?'WayForPay returned or reversed this payment.':terminal?'Go back to choose a test and try again.':'Your result will appear here as soon as WayForPay confirms the payment.')}</p>
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
  const landing = !route?.result && !test;
  return <>
    <header className={landing?'landing-header':undefined}><div className="shell nav"><Brand/><a className="nav-link" href="/#tests">Tests</a><a className="button nav-button" href="/#tests">Choose a test</a></div></header>
    <main className={landing?undefined:'shell'}>{route?.result ? <Result id={route.result}/> : test ? <Quiz key={test} test={test}/> : <Landing/>}</main>
    <Footer/>
  </>;
}
