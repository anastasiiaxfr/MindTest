'use client';

import {useEffect, useRef, useState} from 'react';
import {BrainCircuit, CalendarDays, Grid2X2, Hourglass, ListChecks, MessagesSquare, Timer, ChevronLeft, Download, Copy, Check} from 'lucide-react';
import {tests, iq, memory, mental} from '../lib/tests.js';
import Footer, {Brand} from './footer.js';
import {describeFigure,iqQuestionVersion} from '../lib/iq-questions.js';

const questions = {iq,memory,'mental-age':mental};
const icons = {iq:BrainCircuit,memory:Grid2X2,'mental-age':Hourglass};
const mentalAgeIcons = {Routine: CalendarDays, Planning: ListChecks, Reflection: MessagesSquare};
const memoryShapes = {
  '●': ['circle', 'filled circle'],
  '▲': ['triangle', 'filled triangle'],
  '◆': ['diamond', 'filled diamond'],
  '◇': ['diamond', 'outlined diamond'],
  '■': ['square', 'filled square'],
  '✦': ['star', 'four-pointed star']
};

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

function Shape({kind, fill}) {
  const outline = {fill, stroke: '#222', strokeWidth: 2, strokeLinejoin: 'round'};
  switch (kind) {
    case 'circle': return <circle r="17" {...outline}/>;
    case 'square': return <rect x="-15" y="-15" width="30" height="30" {...outline}/>;
    case 'diamond': return <polygon points="0,-19 19,0 0,19 -19,0" {...outline}/>;
    case 'triangle': return <polygon points="0,-19 18,14 -18,14" {...outline}/>;
    case 'star': return <polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" {...outline}/>;
  }
}

function Figure({figure}) {
  const blue = '#0082ce';
  switch (figure.kind) {
    case 'arrow':
      return <path d="M0 -19 15 -3 H6 V17 H-6 V-3 H-15 Z" transform={'rotate('+figure.angle*90+')'}
        fill={blue} stroke="#222" strokeWidth="2" strokeLinejoin="round"/>;
    case 'dots':
      return Array.from({length: figure.count}, (_, i) => {
        const row = Math.floor(i / 2);
        const rowSize = Math.min(2, figure.count - row * 2);
        return <circle key={i} cx={(i % 2 - (rowSize - 1) / 2) * 14}
          cy={(row - (Math.ceil(figure.count / 2) - 1) / 2) * 14}
          r="4.5" fill={blue} stroke="#222"/>;
      });
    case 'corner':
    case 'tile': {
      const marked = figure.kind === 'corner' ? [[0,1,3,2][figure.angle]] : figure.cells;
      return [0,1,2,3].map(i => <rect key={i} x={i % 2 * 16 - 16} y={Math.floor(i / 2) * 16 - 16}
        width="16" height="16" fill={marked.includes(i) ? blue : 'white'} stroke="#222"/>);
    }
    case 'pair':
      return <>
        <Shape kind={figure.outer} fill="white"/>
        <g transform={figure.outer === 'triangle' ? 'translate(0 4) scale(.4)' : 'scale(.4)'}>
          <Shape kind={figure.inner} fill={blue}/>
        </g>
      </>;
    default:
      return <Shape kind={figure.kind} fill={figure.outline ? 'white' : blue}/>;
  }
}

function Puzzle({puzzle}) {
  const matrix = puzzle.cells.length === 9;
  const width = matrix ? 280 : 460;
  const height = matrix ? 252 : 160;
  const step = width / puzzle.cols;
  const description = puzzle.cells.map(figure => figure ? describeFigure(figure) : 'Missing tile').join('; ');
  return <svg className={'figure-board '+(matrix ? 'figure-matrix' : '')} viewBox={'0 0 '+width+' '+height}
    role="img" aria-label={description}>
    {matrix && <path d="M94 0v252M186 0v252M0 84h280M0 168h280" stroke="#d4d4d4"/>}
    {puzzle.cells.map((figure, i) => <g key={i}
      transform={'translate('+((i % puzzle.cols + .5) * step)+' '+(matrix ? Math.floor(i / puzzle.cols) * 84 + 42 : height / 2)+')'}>
      {figure ? <Figure figure={figure}/> :
        <text y="12" textAnchor="middle" fill="#d21b24" fontFamily="Arial, sans-serif" fontSize="38" fontWeight="700">?</text>}
    </g>)}
  </svg>;
}

function MemoryBoard({sequence}) {
  const items = sequence.trim().split(/\s+/);
  const spacing = 460 / items.length;
  return <svg className="figure-board" viewBox="0 0 460 160" role="img"
    aria-label={items.map(item => memoryShapes[item]?.[1] ?? item).join(', ')}>
    {items.map((item, i) => <g key={i} transform={'translate('+((i + .5) * spacing)+' 80)'}>
      {memoryShapes[item]
        ? <Shape kind={memoryShapes[item][0]} fill={item === '◇' ? 'white' : '#0082ce'}/>
        : <text className="memory-token" textAnchor="middle" dominantBaseline="central">{item}</text>}
    </g>)}
  </svg>;
}

const iqProfileQuestions = [
  ['How old are you?', ['Under 20', '20s', '30s', '40s', '50+']],
  ['What is your education level?', [
    'Some High School', 'High School Diploma', 'Some College',
    'Bachelor’s Degree or Trade School', 'Master’s Degree', 'Doctoral / PhD / MD Degree'
  ]],
  ['Do you prefer numbers, or words?', ['Words', 'Numbers']],
  ['Do you like puzzles?', ['Yes', 'Not really', 'No']],
  ['Do you have trouble focusing?', ['Yes, often', 'Sometimes', 'Almost never']]
];

function IqPreparation({onStart}) {
  const [profile, setProfile] = useState([]);
  const step = profile.length;
  const question = iqProfileQuestions[step];

  return <section className={'panel '+tests.iq.color}>
    <a className="back" href="/"><ChevronLeft size={18} aria-hidden="true"/>All tests</a>
    <div className="quiz-label"><TestIcon test="iq"/>{tests.iq.title}<span>
      {question ? (step + 1)+' / '+iqProfileQuestions.length : 'Ready to start'}
    </span></div>
    <progress aria-label="Introductory questions answered" value={step} max={iqProfileQuestions.length}/>
    <h1>{question ? question[0] : 'Put your reasoning to the test'}</h1>
    {question ? <>
      <p>Your test will be personalized based on the information you provide.</p>
      <div className="answers" key={step}>{question[1].map((option, index) =>
        <button type="button" key={option} className="answer" onClick={() => setProfile(current =>
          current.length === step ? [...current, index] : current
        )}>{option}</button>
      )}</div>
    </> : <>
      <p>Work through {iq.length} questions, from simple sequences to grids with multiple rules. You can skip a question and return to it before finishing.</p>
      <p>{profile[2] === 0
        ? 'Try describing each pattern in a few words before choosing an answer.'
        : 'Try counting repeated elements or turns when you look for a pattern.'}
      {profile[4] < 2 && ' If you lose focus on a question, skip it and come back later.'}</p>
      <button className="button primary next" onClick={onStart}>Start IQ Test</button>
    </>}
    {step > 0 && <button type="button" className="button skip-question" onClick={() =>
      setProfile(current => current.slice(0, -1))
    }>Back</button>}
  </section>;
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
  const [prompt,values,category,,puzzle] = list[index] || [];
  const memorizing = test === 'memory' && !reveal;
  const ScenarioIcon = test === 'mental-age' ? mentalAgeIcons[category] : null;
  if (!started) return <IqPreparation onStart={() => setStarted(true)}/>;
  return <section className={'panel '+info.color}>
    <a className="back" href="/"><ChevronLeft size={18} aria-hidden="true"/>All tests</a>
    <div className="quiz-label"><TestIcon test={test}/>{info.title}<span>{done ? 'Finished' : (index+1)+' / '+list.length}</span></div>
    <progress aria-label="Questions answered" value={answered} max={list.length}/>
    {done ? <>
      <h1>Your result is ready.</h1>
      <p>Unlock your score, a breakdown by category, and a downloadable certificate.</p>
      <div className="checkout"><div><strong>$1.00</strong><small>One-time payment · USD</small></div><button className="button primary" onClick={checkout} disabled={busy}>{busy?'Opening checkout…':'Unlock my result'}</button></div>
      <p className="methods">WayForPay · Card · Apple Pay · Google Pay</p>
      {error && <p role="alert" className="error">{error}</p>}
    </> : <>
      <h1>{memorizing ? 'Remember this' : prompt}</h1>
      {puzzle && <Puzzle puzzle={puzzle}/>}
      {ScenarioIcon && <div className="scenario-figure" aria-hidden="true"><ScenarioIcon size={64} strokeWidth={1.5}/></div>}
      {memorizing ? <MemoryBoard sequence={values[0]}/> :
      <div className={'answers '+(puzzle || test === 'memory' ? 'figure-answers' : 'scenario-answers')}>
        {(test === 'memory' ? values.slice(1) : values).map((value, i) => {
          const shape = test === 'memory' ? memoryShapes[value] : null;
          const description = puzzle ? describeFigure(value) : shape?.[1];
          return <button key={i} className={'answer '+(selected === i ? 'chosen' : '')} aria-pressed={selected === i}
            aria-label={description ? initials[i]+': '+description : undefined} onClick={() => setSelected(i)}>
            <span className="answer-letter">{initials[i]}</span>
            {puzzle || shape ? <svg className="figure-option" viewBox="-24 -24 48 48" aria-hidden="true">
              {puzzle ? <Figure figure={value}/> : <Shape kind={shape[0]} fill={value === '◇' ? 'white' : '#0082ce'}/>}
            </svg> : value}
          </button>;
        })}
      </div>}
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
