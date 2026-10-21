'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {supabase} from './supabase';
import {Game,initialGame,validGame,settle} from './game';
const key=(id?:string)=>`noise-v1-${id||'guest'}`;
export function useGame(){
 const [game,setGame]=useState<Game|null>(null);const [user,setUser]=useState<User|null>(null);const [authReady,setAuthReady]=useState(false);const [ready,setReady]=useState(false);const [status,setStatus]=useState('불러오는 중');const [loadError,setLoadError]=useState('');const [conflict,setConflict]=useState(false);const [reload,setReload]=useState(0);
 const revision=useRef(0),generation=useRef(0);const loadedFor=useRef<string|null>(null);const pending=useRef<Game|null>(null);const writing=useRef(false);const current=useRef<Game|null>(null);current.current=game;
 useEffect(()=>{if(!supabase){setAuthReady(true);return;}supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setAuthReady(true);});const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{setUser(s?.user||null);setAuthReady(true);});return()=>subscription.unsubscribe();},[]);
 useEffect(()=>{if(!authReady)return;let cancelled=false;generation.current++;loadedFor.current=null;setReady(false);setLoadError('');setConflict(false);pending.current=null;
  (async()=>{try{let state:Game|undefined;let rev=0;if(user&&supabase){const {data,error}=await supabase.from('game_saves').select('state,revision').eq('user_id',user.id).maybeSingle();if(error)throw error;if(data){if(!validGame(data.state))throw Error('저장 데이터 형식을 확인해 주세요. 백업으로 복구할 수 있습니다.');state=data.state;rev=data.revision;}try{const cache=JSON.parse(localStorage.getItem(key(user.id))||'null');if(cache?.pending&&cache.revision===rev&&validGame(cache.state))state=cache.state;}catch{}}else{try{const raw=localStorage.getItem(key());if(raw){const v=JSON.parse(raw);if(validGame(v))state=v;}}catch{}}
   if(cancelled)return;revision.current=rev;loadedFor.current=user?.id||'guest';setGame(settle(state||initialGame(!user)));setReady(true);setStatus(user?'클라우드 연결됨':'이 기기에 자동 저장');
  }catch(e:any){if(!cancelled){setLoadError(e.message||'저장 데이터를 불러오지 못했습니다.');setStatus('연결 확인 필요');}}})();return()=>{cancelled=true;};
 },[authReady,user?.id,reload]);
 const flush=useCallback(async()=>{if(!user)return true;if(!supabase||conflict||loadedFor.current!==user.id)return false;const epoch=generation.current;while(writing.current){await new Promise(resolve=>setTimeout(resolve,50));if(epoch!==generation.current)return false;}writing.current=true;
  try{while(pending.current&&epoch===generation.current&&loadedFor.current===user.id){const snapshot=pending.current;pending.current=null;setStatus('클라우드 저장 중…');const {data,error}=await supabase.rpc('save_game',{p_state:snapshot,p_revision:revision.current});if(epoch!==generation.current)return false;if(error){pending.current=current.current;if(error.message.includes('SAVE_CONFLICT')){setConflict(true);setStatus('다른 기기의 기록이 있어요');}else setStatus('저장 대기 · 재시도 필요');return false;}revision.current=data.revision;try{const latest=pending.current||current.current||snapshot;localStorage.setItem(key(user.id),JSON.stringify({state:latest,revision:data.revision,pending:latest!==snapshot}));}catch{}setStatus('클라우드 저장 완료');}return !pending.current;}
  finally{writing.current=false;}
 },[user?.id,conflict]);
 useEffect(()=>{if(!ready||!game||conflict||loadedFor.current!==(user?.id||'guest'))return;try{localStorage.setItem(key(user?.id),JSON.stringify(user?{state:game,revision:revision.current,pending:true}:game));}catch{setStatus('기기 저장 공간을 확인해 주세요');}if(!user)return;pending.current=game;const timer=setTimeout(flush,700);return()=>clearTimeout(timer);},[game,ready,user?.id,conflict,flush]);
 useEffect(()=>{const retry=()=>{void flush();};window.addEventListener('online',retry);const timer=setInterval(retry,30000);return()=>{window.removeEventListener('online',retry);clearInterval(timer);};},[flush]);
 useEffect(()=>{if(!ready)return;const timer=setInterval(()=>{setGame(old=>{if(!old)return old;const next=settle(old);return next.beat!==old.beat||next.jobs.length!==old.jobs.length||next.noise!==old.noise?next:old;});},1000);return()=>clearInterval(timer);},[ready]);
 return {game,setGame,user,ready,status,loadError,conflict,reload:()=>setReload(n=>n+1),flush};
}
