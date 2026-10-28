import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,X} from 'lucide-react';
import {tutorialSteps} from '../lib/onboarding';

type Box={left:number;top:number;width:number;height:number};
export default function MenuTutorial({step,onStep,onFinish}:{step:number;onStep:(step:number)=>void;onFinish:(skipped:boolean)=>void}){
 const current=tutorialSteps[step];const card=useRef<HTMLDivElement>(null);const next=useRef<HTMLButtonElement>(null);
 const [hole,setHole]=useState<Box|null>(null);const [placement,setPlacement]=useState({left:16,top:16,width:340});
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[]);
 useLayoutEffect(()=>{
  const target=document.querySelector<HTMLElement>(current.target);if(!target)return;
  target.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
  const measure=()=>{
   const bounds=target.getBoundingClientRect();const shell=document.querySelector('.app-shell')!.getBoundingClientRect();
   const vh=window.visualViewport?.height||window.innerHeight;const vw=window.innerWidth;const width=Math.min(360,shell.width-32,vw-32);
   const box={left:Math.max(8,bounds.left-7),top:Math.max(8,bounds.top-7),width:Math.min(vw-16,bounds.width+14),height:Math.min(vh-16,bounds.height+14)};
   box.width=Math.min(box.width,vw-8-box.left);box.height=Math.min(box.height,vh-8-box.top);
   const height=card.current?.offsetHeight||240;const above=box.top-height-18;const below=box.top+box.height+18;
   const top=above>=16?above:below+height<=vh-16?below:Math.max(16,vh-height-16);
   setHole(box);setPlacement({left:Math.max(16,Math.min(vw-width-16,shell.left+(shell.width-width)/2)),top,width});
  };
  measure();next.current?.focus({preventScroll:true});
  const observer=new ResizeObserver(measure);observer.observe(target);if(card.current)observer.observe(card.current);
  window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);window.visualViewport?.addEventListener('resize',measure);
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);window.visualViewport?.removeEventListener('resize',measure);};
 },[step,current.target]);
 return <div className={`menu-tutorial ${hole?'':'is-measuring'}`} role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-copy" onKeyDown={event=>{
  if(event.key==='Escape'){event.preventDefault();onFinish(true);}
  if(event.key==='Tab'){const buttons=Array.from(card.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]);const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
 }}>
  {hole&&<div className="tutorial-spotlight" style={hole} aria-hidden="true"/>}
  <div ref={card} className="tutorial-card" style={placement} key={step}>
   <div className="tutorial-topline"><span>{current.label}</span><button aria-label="튜토리얼 건너뛰기" onClick={()=>onFinish(true)}><X size={17}/></button></div>
   <h2 id="tour-title">{current.title}</h2><p id="tour-copy">{current.body}</p>
   <div className="tutorial-progress" aria-label={`${tutorialSteps.length}단계 중 ${step+1}단계`}>{tutorialSteps.map((_,i)=><i key={i} className={i===step?'active':i<step?'done':''}/>)}<span>{step+1} / {tutorialSteps.length}</span></div>
   <div className="tutorial-controls"><button className="tutorial-back" disabled={step===0} onClick={()=>onStep(step-1)}><ArrowLeft size={14}/>이전</button><button className="tutorial-skip" onClick={()=>onFinish(true)}>건너뛰기</button><button ref={next} className="tutorial-next" onClick={()=>step===tutorialSteps.length-1?onFinish(false):onStep(step+1)}>{step===tutorialSteps.length-1?'시작할게요':'다음'}{step===tutorialSteps.length-1?<Check size={15}/>:<ArrowRight size={15}/>}</button></div>
  </div>
 </div>;
}
