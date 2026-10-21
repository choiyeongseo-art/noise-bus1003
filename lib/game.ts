export const members = {
 nox:{name:'녹스',en:'NOX',role:'LEADER · RAPPER · PRODUCER',quote:'세상엔 소음이어도, 우리끼리는 신호가 된다.',color:'#839eff'},
 rov:{name:'로브',en:'ROV',role:'ALL-ROUNDER',quote:'누나, 우리 다음엔 어디로 가요?',color:'#a8d1e5'},
 venn:{name:'벤',en:'VENN',role:'MAIN DANCER',quote:'무대 위에선 말보다 몸이 먼저야.',color:'#c7a1b9'},
 eln:{name:'엘른',en:'ELN',role:'MAIN VOCAL · VISUAL',quote:'조용한 곳에서도 노래는 들려.',color:'#b2bce0'},
};
export type Member = keyof typeof members;
export type Stat = 'vocal'|'rap'|'dance'|'visual'|'mental';
export const statNames:Record<Stat,string>={vocal:'보컬',rap:'랩',dance:'댄스',visual:'비주얼',mental:'멘탈'};
export type Stats = Record<Stat,number>;
export type Job={member:Member;type:'training'|'route';stat:Stat;gain:number;mental:number;ends:number;started:number;label:string;route?:number};
export type Game={version:1;name:string;style:string;beat:number;gold:number;shards:number;fans:number;signal:number;noise:number;complaint:number;frequency:number;scene:number;history:{scene:number;choice:number}[];stats:Record<Member,Stats>;joined:Member[];jobs:Job[];liveCount:number;letterAt:number[];restAt:Partial<Record<Member,number>>;suspendedUntil:number;lastAt:number;energyAt:number;noiseAt:number;notes:string[];demo:boolean;routeDone:number[];friendship:number;personals:Partial<Record<Member,string[]>>};
export const clamp=(v:number,min=0,max=100)=>Math.max(min,Math.min(max,v));
export function initialGame(demo=true,now=Date.now()):Game{return {version:1,name:'매니저',style:'신중형',beat:100,gold:50,shards:0,fans:3,signal:0,noise:0,complaint:0,frequency:30,scene:0,history:[],stats:{nox:{vocal:20,rap:35,dance:20,visual:25,mental:15},rov:{vocal:25,rap:25,dance:25,visual:25,mental:25},venn:{vocal:15,rap:15,dance:35,visual:25,mental:25},eln:{vocal:40,rap:15,dance:15,visual:30,mental:20}},joined:['nox'],jobs:[],liveCount:0,letterAt:[0,0,0],restAt:{},suspendedUntil:0,lastAt:now,energyAt:now,noiseAt:now,notes:['녹스의 메모 · 내일 아침 9시, 광안리 연습실. 늦지 마.'],demo,routeDone:[],friendship:0,personals:{}}}
export const gameSpeed=(g:Game)=>g.demo?60:1;
export function settle(input:Game,now=Date.now()):Game {
 const g=structuredClone(input); const speed=gameSpeed(g); const interval=600000/speed;
 const recovery=Math.floor(Math.max(0,now-g.energyAt)/interval);g.beat=clamp(g.beat+recovery);if(recovery)g.energyAt+=recovery*interval;
 const days=Math.floor(Math.max(0,now-g.noiseAt)/(86400000/speed));if(days){g.noise=clamp(g.noise-days*3);g.noiseAt+=days*86400000/speed;}
 for(const j of g.jobs.filter(j=>j.ends<=now)){
  if(j.type==='training'){const s=g.stats[j.member];const efficiency=s.mental>=60?1:s.mental>=30?.85:.65;const blue=j.member==='nox'&&g.frequency>=80?1.1:1;const curve=s[j.stat]<40?1:s[j.stat]<60?.7:.5; s[j.stat]=clamp(s[j.stat]+j.gain*efficiency*blue*curve,0,40);s.mental=clamp(s.mental-j.mental);g.notes.unshift(`${members[j.member].name} · ${j.label} 완료. ${statNames[j.stat]} 실력이 올랐습니다.`);}
  else {g.stats[j.member][j.stat]=clamp(g.stats[j.member][j.stat]+j.gain,0,40);g.gold+=[25,50,100][j.route||0];g.stats[j.member].mental=clamp(g.stats[j.member].mental+5);if(j.route===2)g.noise=clamp(g.noise+5);if(!g.routeDone.includes(j.route||0))g.routeDone.push(j.route||0);g.notes.unshift(`${j.label} 파견 완료 · 새로운 신호를 가져왔어요.`);}
 }g.jobs=g.jobs.filter(j=>j.ends>now);g.lastAt=now;g.notes=g.notes.slice(0,25);return g;
}
export type Effect=Partial<Record<'frequency'|'signal'|'noise'|'gold'|'fans'|'shards'|'friendship'|'mental',number>>;
export type Choice={text:string;effect:Effect;minFrequency?:number};
export type Scene={id:number;title:string;location:string;time:string;narration:string;lines:[Member|'you',string][];choices:Choice[]};
export function choose(input:Game,index:number,now=Date.now()):Game {
 const g=settle(input,now); const scene=scenes[g.scene];if(!scene)throw Error('1챕터를 모두 읽었습니다. 다음 이야기는 준비 중입니다.');const c=scene.choices[index];if(!c)throw Error('선택지를 골라 주세요.');if(c.minFrequency&&g.frequency<c.minFrequency)throw Error('주파수 80 이상에서 선택할 수 있습니다.');const cost=g.scene===4?0:2;if(g.beat<cost)throw Error('비트가 부족해요. 잠시 쉬었다가 다시 만나요.');
 g.beat-=cost;if(g.scene===7){g.noise=Math.max(g.noise,42);g.complaint=35;}for(const [k,v] of Object.entries(c.effect)){if(k==='mental')g.stats.nox.mental=clamp(g.stats.nox.mental+v);else if(k==='frequency'||k==='signal'||k==='noise')g[k]=clamp(g[k]+v);else if(k==='gold')g.gold=Math.max(0,g.gold+v);else (g as any)[k]+=v;}
 if(g.scene===12&&!g.joined.includes('rov')){g.joined.push('rov');g.notes.unshift('ROV 합류 · 로브가 연습실로 돌아왔습니다.');}
 g.history.push({scene:g.scene,choice:index});g.scene++;if(g.scene===15)g.notes.unshift(`1챕터 엔딩 · ${ending(g)}`);return g;
}
export function ending(g:Game){return g.frequency>=80?'블루 아워':g.frequency>=50?'선명한 신호':'잡음 속 보류'}
export function act(input:Game,type:string,args:any={},now=Date.now()):Game {
 const g=settle(input,now);const m:Member=args.member||'nox';if(!g.joined.includes(m))throw Error('아직 합류하지 않은 멤버입니다.');
 const spend=(beat:number,gold=0)=>{if(g.beat<beat)throw Error('비트가 부족해요. 10분마다 1비트가 회복됩니다.');if(g.gold<gold)throw Error('골드가 부족해요. 거리 라이브나 파견으로 모아 주세요.');g.beat-=beat;g.gold-=gold;};
 const available=()=>{if(g.jobs.some(j=>j.member===m))throw Error('이 멤버는 일정을 진행 중이에요. 완료 후 다시 배정해 주세요.');};
 if(type==='train'){available();const grade=args.grade||0;const costs=[5,15,35],gold=[10,40,120],mins=[10,60,240],gains=[2,5,12],mental=[1,3,8];if(!['vocal','rap','dance','visual'].includes(args.stat))throw Error('훈련할 능력을 선택하세요.');if(g.stats[m][args.stat as Stat]>=40)throw Error('거리 라이브 단계의 능력 상한 40에 도달했어요.');spend(costs[grade],gold[grade]);g.jobs.push({member:m,type:'training',stat:args.stat,gain:gains[grade],mental:mental[grade],started:now,ends:now+mins[grade]*60000/gameSpeed(g),label:['기초','중급','고급'][grade]+' '+statNames[args.stat as Stat]});}
 else if(type==='rest'){available();if(now-(g.restAt[m]||0)<600000/gameSpeed(g))throw Error('조금 전 휴식했어요. 10분 뒤 다시 쉬어 주세요.');g.stats[m].mental=clamp(g.stats[m].mental+15);g.restAt[m]=now;g.notes.unshift(`${members[m].name} · 따뜻한 음료와 짧은 휴식. 멘탈 +15`);}
 else if(type==='live'){available();if(g.suspendedUntil>now)throw Error('민원으로 공연이 정지됐어요. 남은 정지 기간을 확인해 주세요.');spend(25);const audience=3+Math.floor(Math.random()*13);const fans=audience*(1+Math.round(Math.random()))+Math.round(g.signal/20);g.fans+=fans;g.gold+=audience*5;g.signal=clamp(g.signal+3);g.liveCount++;if(g.noise>=40&&Math.random()<.2){g.complaint=clamp(g.complaint+25);g.notes.unshift('주변 상인의 공연 민원이 도착했습니다.');}if(g.complaint>=100)g.suspendedUntil=now+259200000/gameSpeed(g);g.notes.unshift(`거리 라이브 #${g.liveCount} · 관객 ${audience}명, Listener +${fans}, 골드 +${audience*5}`);if(g.liveCount%10===0)g.notes.unshift('팬레터 도착 · 열 번의 공연을 함께한 팬의 편지가 도착했어요.');}
 else if(type==='route'){available();const r=args.route||0;spend([10,20,30][r]);g.jobs.push({member:m,type:'route',stat:r===0?'visual':'dance',gain:r===0?3:5,mental:0,started:now,ends:now+[30,60,120][r]*60000/gameSpeed(g),label:['해운대 A 노선','서면 B 노선','부산 순환 C 노선'][r],route:r});}
 else if(type==='letter'){const n=args.slot||0;if(now-g.letterAt[n]<86400000/gameSpeed(g))throw Error('오늘은 이미 답장을 보냈어요. 내일 다시 만나요.');spend(3);g.letterAt[n]=now;if(args.kind==='ghost'){g.signal=clamp(g.signal+1);g.noise=clamp(g.noise+1);if(Math.random()<.2){g.signal=clamp(g.signal-5);g.fans=Math.max(0,g.fans-1);g.notes.unshift('대필이 알려졌어요. 신호 -5, Listener -1');}}else{g.signal=clamp(g.signal+3);g.fans+=5;}g.notes.unshift('팬레터 답장 · 작은 신호가 전해졌습니다.');}
 else if(type==='complaint'){spend(5);g.noise=clamp(g.noise+(args.kind==='fight'?8:-5));g.complaint=clamp(g.complaint+(args.kind==='fight'?10:-25));g.notes.unshift(args.kind==='fight'?'녹스의 맞대응 · 노이즈 +8':'직접 사과 · 공연 시간을 조정했어요. 노이즈 -5');if(g.complaint>=100)g.suspendedUntil=now+259200000/gameSpeed(g);}
 else if(type==='personal'){if((g.personals[m]||[]).length>=3)throw Error('오늘 준비된 대화는 여기까지예요.');const lines=m==='nox'?['연습 끝났어. 네가 보낸 일정 봤고.','아까 그 말… 별뜻 없어. 그냥 고맙다고.','늦었으니까 집에 도착하면 연락해.']:m==='rov'?['누나!! 연습실 가는 길인데 뭐 사 갈까요?','형 몰래 간식 챙겨왔어요. 같이 먹어요!','누나 덕분에 돌아올 곳이 있다는 게 좋아요.']:['합류 이야기는 다음 챕터에서 이어집니다.'];spend(2);g.personals[m]=[...(g.personals[m]||[]),lines[(g.personals[m]||[]).length]];if(m==='rov')g.friendship++;else g.stats[m].mental=clamp(g.stats[m].mental+3);}
 else throw Error('알 수 없는 활동입니다.');return g;
}
export function validGame(v:any):v is Game {
 try {
  const num=(n:any,max=1e14)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;
  const arr=(x:any,max:number)=>Array.isArray(x)&&x.length<=max;
  if(!v||v.version!==1||typeof v.name!=='string'||v.name.length>30||!['직진형','신중형','유쾌형'].includes(v.style)||typeof v.demo!=='boolean')return false;
  if(!['beat','gold','fans','signal','noise','frequency','scene','lastAt','energyAt','noiseAt','complaint','shards','liveCount','suspendedUntil','friendship'].every(k=>num(v[k])))return false;
  if(v.beat>100||v.signal>100||v.noise>100||v.frequency>100||v.complaint>100||!Number.isInteger(v.scene)||v.scene>15)return false;
  if(!arr(v.history,15)||!v.history.every((h:any,i:number)=>h.scene===i&&Number.isInteger(h.choice)&&!!scenes[h.scene]?.choices[h.choice])||v.history.length!==v.scene)return false;
  if(!arr(v.joined,4)||!v.joined.includes('nox')||new Set(v.joined).size!==v.joined.length||!v.joined.every((k:string)=>k in members))return false;
  if(!Object.keys(members).every(m=>v.stats?.[m]&&Object.keys(statNames).every(k=>num(v.stats[m][k],100))))return false;
  if(!arr(v.jobs,4)||!v.jobs.every((j:any)=>v.joined.includes(j.member)&&['training','route'].includes(j.type)&&j.stat in statNames&&['gain','mental','ends','started'].every(k=>num(j[k]))&&j.ends>=j.started&&typeof j.label==='string'&&j.label.length<100&&(j.type!=='route'||[0,1,2].includes(j.route))))return false;
  if(!arr(v.letterAt,3)||v.letterAt.length!==3||!v.letterAt.every((x:any)=>num(x))||!arr(v.routeDone,3)||!v.routeDone.every((x:any)=>[0,1,2].includes(x)))return false;
  if(!v.restAt||!Object.entries(v.restAt).every(([k,x])=>k in members&&num(x))||!arr(v.notes,25)||!v.notes.every((s:any)=>typeof s==='string'&&s.length<500))return false;
  if(!v.personals||!Object.entries(v.personals).every(([k,x])=>k in members&&arr(x,3)&&(x as any[]).every(s=>typeof s==='string'&&s.length<500)))return false;
  return true;
 }catch{return false;}
}
export const scenes:Scene[]=[
  {
    "id": 1,
    "title": "밤 10시 40분",
    "location": "해운대 정류장",
    "time": "22:40",
    "narration": "막차 방송이 끊기고 여주가 벤치에 앉아 있다. 검은 레더 재킷을 입은 남자가 옆에 앉는다. 이어폰 한쪽을 빼고 있다.",
    "lines": [
      [
        "nox",
        "이거 네가 쓴 거야? '목적지 없는 버스'? 쓸데없이 솔직하네."
      ],
      [
        "you",
        "그거 돌려주세요."
      ],
      [
        "nox",
        "이름도 없는 기획을 왜 혼자 끙끙대."
      ]
    ],
    "choices": [
      {
        "text": "\"그냥 혼자 해본 거예요. 누가 보라고 쓴 건 아니니까요.\"",
        "effect": {
          "frequency": 3
        }
      },
      {
        "text": "\"남의 노트 읽는 건 예의가 아니에요.\"",
        "effect": {
          "frequency": -2
        }
      },
      {
        "text": "수첩을 낚아채 일어선다.",
        "effect": {
          "frequency": -5
        }
      }
    ]
  },
  {
    "id": 2,
    "title": "같은 시각",
    "location": "정류장",
    "time": "22:44",
    "narration": "(녹스가 잠깐 주머니에 손을 넣었다 뺀다. 1003번 버스 헤드라이트가 보인다.)",
    "lines": [
      [
        "nox",
        "나 지금 매니저 없어. 임시로라도 해. 내일 아침 9시, 광안리 연습실."
      ],
      [
        "you",
        "제가 왜요. 방금 회사에서 잘렸어요."
      ],
      [
        "nox",
        "그래서 하라는 거야. 회사 없는 사람이 더 쓸모 있거든."
      ],
      [
        "nox",
        "안 오면 이 수첩 내가 가진다."
      ]
    ],
    "choices": [
      {
        "text": "\"연습실 주소부터 보내 주세요.\"",
        "effect": {
          "frequency": 5
        }
      },
      {
        "text": "\"조건이 있어요. 제 기획을 그대로 쓰지 않으면 안 해요.\"",
        "effect": {
          "frequency": 2
        }
      },
      {
        "text": "\"싫어요.\" → 녹스가 웃는다. \"그럼 이건 내가 가진다.\"",
        "effect": {
          "frequency": -2
        }
      }
    ]
  },
  {
    "id": 3,
    "title": "다음 날 아침 9시",
    "location": "광안리 연습실",
    "time": "09:00",
    "narration": "반지하에 가까운 2층 연습실. 바닥에는 전단지가 흩어져 있고, 벽에 마커로 적은 멤버 보드가 있다. 보드: NOX — 소속 / ROV — 해외 체류 중 / VENN, ELN — 연락 대기 (정적. 녹스가 말을 끊는다.)",
    "lines": [
      [
        "nox",
        "회사 없어. 연습실은 이번 달 말까지. 팬은 세 명. 그중 한 명은 나 보러 온 게 아니래."
      ],
      [
        "you",
        "그럼 지금 가진 건 뭐예요?"
      ],
      [
        "nox",
        "곡 몇 개. 그리고… 너."
      ],
      [
        "nox",
        "…말이 헛나왔다. 잊어."
      ],
      [
        "you",
        "매니저로 쓰실 거면 말을 똑바로 하세요."
      ]
    ],
    "choices": [
      {
        "text": "보드의 이름을 짚으며 \"얘네는 언제 와요?\"",
        "effect": {
          "signal": 2
        }
      },
      {
        "text": "\"아무것도 없는 데서 시작하는 거, 저는 괜찮아요.\"",
        "effect": {
          "frequency": 5
        }
      }
    ]
  },
  {
    "id": 4,
    "title": "녹스의 요구 세 가지",
    "location": "연습실",
    "time": "09:15",
    "narration": "(여주가 수첩을 펼친다. 같은 말이 적혀 있다.)",
    "lines": [
      [
        "nox",
        "매니저면 할 일이 세 개. 하나, 연습실 계약 연장. 둘, 공개할 첫 콘텐츠 기획. 셋, BUS 1003 촬영."
      ],
      [
        "you",
        "1003이요?"
      ],
      [
        "nox",
        "우리 노래가 그 버스에서 시작됐어. 목적지 없는 마지막 버스."
      ],
      [
        "nox",
        "…그거 쓴 사람이 해."
      ]
    ],
    "choices": [
      {
        "text": "계약부터 해결한다. \"건물주 찾아가 볼게요.\"",
        "effect": {
          "gold": 30,
          "frequency": 3
        }
      },
      {
        "text": "콘텐츠 기획부터 한다. \"오늘 밤 거리 공연부터 해봐요.\"",
        "effect": {
          "signal": 2,
          "shards": 1
        }
      },
      {
        "text": "1003 촬영을 우선한다. \"거리에서 찍어요. 허가 없이 찍으면 민원 들어와요.\"",
        "effect": {
          "noise": 3,
          "signal": 3
        }
      }
    ]
  },
  {
    "id": 5,
    "title": "첫 거리 라이브 (튜토리얼, 비트 소모 없음)",
    "location": "해운대 방파제 앞",
    "time": "20:30",
    "narration": "관객은 세 명. 한 명은 휴대폰을 보고 있다. 녹스의 목소리가 처음엔 작고 떨린다. (노래가 시작된다. 두 번째 관객이 발걸음을 멈춘다.)",
    "lines": [
      [
        "you",
        "（앰프 전원을 켜며） 마이크 가까이요. 숨 말고 소리로 끌어요."
      ],
      [
        "nox",
        "시끄러워. 사람 모이면 불편해."
      ]
    ],
    "choices": [
      {
        "text": "여주가 관객 쪽으로 다가가 말을 건다. \"방금 그 곡, 한 번 더 할까요?\"",
        "effect": {
          "fans": 2,
          "signal": 3
        }
      },
      {
        "text": "여주는 뒤에서 지켜본다.",
        "effect": {
          "fans": 1,
          "signal": 1
        }
      }
    ]
  },
  {
    "id": 6,
    "title": "첫 팬레터",
    "location": "공연 후",
    "time": "21:10",
    "narration": "관객 중 한 명이 메모지를 건넨다. \"노래할 때 숨 쉬는 소리가 좋았어요. 다음에 또 해주세요.\"",
    "lines": [
      [
        "nox",
        "…이거 답장해야 돼?"
      ],
      [
        "you",
        "팬이 신호를 보낸 거예요."
      ],
      [
        "nox",
        "나 그런 거 못 써."
      ]
    ],
    "choices": [
      {
        "text": "녹스가 직접 짧게 답장한다. \"직접 쓴 거니까 틀려도 내 거야.\"",
        "effect": {
          "signal": 3,
          "shards": 1,
          "frequency": 3
        }
      },
      {
        "text": "여주가 대신 써 주고 녹스가 확인한다. \"대필 티 나면 신호 깨져요.\"",
        "effect": {
          "signal": 1,
          "noise": 1
        }
      },
      {
        "text": "답장하지 않는다.",
        "effect": {}
      }
    ]
  },
  {
    "id": 7,
    "title": "밤 11시",
    "location": "연습실",
    "time": "23:00",
    "narration": "녹스가 바닥에 누워 있다. 여주가 찾던 수첩이 녹스의 가슴 위에 얹혀 있다.",
    "lines": [
      [
        "nox",
        "네 기획, 이 페이지만 읽었어. 종점 없는 버스라니. 그런 노래는 아무도 안 써."
      ],
      [
        "you",
        "근데요?"
      ],
      [
        "nox",
        "근데 난 쓰고 싶었어."
      ]
    ],
    "choices": [
      {
        "text": "\"그럼 같이 써요.\"",
        "effect": {
          "frequency": 8
        }
      },
      {
        "text": "\"그냥 재밌으라고 한 말이에요.\"",
        "effect": {
          "frequency": -3
        }
      }
    ]
  },
  {
    "id": 8,
    "title": "민원 알림",
    "location": "연습실",
    "time": "15:00",
    "narration": "다음 날 오후. 휴대폰에 민원 알림이 뜬다. \"주변 상인 민원: 야간 공연 소음.\" (민원 게이지가 표시된다. 노이즈 42.)",
    "lines": [
      [
        "nox",
        "시끄럽다는 얘기야? 우리 소리가 원래 그래."
      ],
      [
        "you",
        "민원이 누적되면 공연이 정지돼요. 이번 주에만 세 번째예요."
      ]
    ],
    "choices": [
      {
        "text": "여주가 상인을 찾아가 사과하고 공연 시간을 바꾼다.",
        "effect": {
          "gold": -10,
          "noise": -5,
          "frequency": 2
        }
      },
      {
        "text": "녹스가 직접 찾아가 맞선다. \"그럼 조용한 데서 하면 되잖아.\"",
        "effect": {
          "noise": 8,
          "frequency": -5
        }
      },
      {
        "text": "공연 장소를 방파제 쪽으로 옮긴다.",
        "effect": {
          "noise": -3,
          "signal": 2
        }
      }
    ]
  },
  {
    "id": 9,
    "title": "촬영 전날 밤",
    "location": "방파제",
    "time": "23:20",
    "narration": "녹스가 사라졌다. 멤버들은 \"원래 이래\"라며 신경 쓰지 않는다. 여주는 방파제에 앉은 녹스를 찾는다.",
    "lines": [
      [
        "nox",
        "여기 오지 마. 혼자 있을 때 말 걸면 못 참아."
      ],
      [
        "you",
        "내일 촬영이잖아요."
      ],
      [
        "nox",
        "사람들이 우리 노래 듣고 그냥 시끄럽대. 신호가 아니라."
      ]
    ],
    "choices": [
      {
        "text": "\"시끄러워도 들어주는 사람이 있으니까 계속 가는 거잖아요.\"",
        "effect": {
          "frequency": 5,
          "signal": 2
        }
      },
      {
        "text": "말없이 옆에 앉는다.",
        "effect": {
          "frequency": 3
        }
      },
      {
        "text": "\"그럼 그만두면 되죠.\"",
        "effect": {
          "frequency": -8
        }
      }
    ]
  },
  {
    "id": 10,
    "title": "종점 없는 버스",
    "location": "방파제",
    "time": "23:40",
    "narration": "(바람이 세게 분다. 녹스가 말없이 재킷을 벗어 여주 어깨에 걸쳐 준다.)",
    "lines": [
      [
        "nox",
        "넌 목적지를 정하지 말자고 했지."
      ],
      [
        "you",
        "네. 그냥 같이 타는 영상이요. 종점 없이."
      ],
      [
        "nox",
        "감기 걸리면 촬영 못 하니까. 착각하지 마."
      ]
    ],
    "choices": [
      {
        "text": "\"그 말투 진짜 안 고칠 거예요?\"",
        "effect": {
          "frequency": 15
        },
        "minFrequency": 80
      },
      {
        "text": "\"노이즈로 보여도 괜찮아요. 우리가 신호로 만들면 되니까.\"",
        "effect": {
          "frequency": 10,
          "noise": -5,
          "signal": 3
        }
      },
      {
        "text": "재킷만 돌려준다.",
        "effect": {}
      }
    ]
  },
  {
    "id": 11,
    "title": "촬영 당일 새벽 6시",
    "location": "연습실",
    "time": "06:00",
    "narration": "여주의 휴대폰에 메시지가 뜬다.",
    "lines": [
      [
        "rov",
        "누나!! 저 내일 아침 공항 도착이에요. 연습실 아직 있죠?"
      ],
      [
        "nox",
        "（한숨） 해외 간다고 한 지 두 달 됐어. 재능은 있어. 돌아올 생각을 하는지가 문제지."
      ]
    ],
    "choices": [
      {
        "text": "\"그럼 데리러 가요.\"",
        "effect": {
          "frequency": 3,
          "friendship": 1
        }
      },
      {
        "text": "\"촬영부터 해요. 오면 오는 거예요.\"",
        "effect": {
          "frequency": 2
        }
      }
    ]
  },
  {
    "id": 12,
    "title": "촬영",
    "location": "1003번 버스",
    "time": "07:15",
    "narration": "버스 안, 승객 몇 명. 녹스가 창가에 앉아 흥얼거린다. 여주가 카메라를 든다. (앞자리 할머니가 녹스를 보고 웃는다. 짧은 순간.)",
    "lines": [
      [
        "nox",
        "찍어. 근데 얼굴 말고 손으로 찍어."
      ],
      [
        "you",
        "손이요?"
      ],
      [
        "nox",
        "내 목소리는 손에서 나오는 거야."
      ]
    ],
    "choices": [
      {
        "text": "그 장면을 살려 컷으로 쓴다.",
        "effect": {
          "signal": 5,
          "shards": 1
        }
      },
      {
        "text": "녹스 얼굴을 끝까지 찍는다.",
        "effect": {
          "noise": 3,
          "signal": 1
        }
      }
    ]
  },
  {
    "id": 13,
    "title": "정차 — ROV 귀국 (영입 확정)",
    "location": "1003번 버스",
    "time": "07:30",
    "narration": "버스 문이 열린다. 캐리어를 끌고 뛰어 올라오는 남자. 로브가 여행에서 산 엽서를 여주에게 내민다. (여주의 얼굴이 조금 빨개진다.)",
    "lines": [
      [
        "rov",
        "누나~! 저 왔어요! 이거 선물. 해외 바다 사진이에요."
      ],
      [
        "nox",
        "야, 버스 세우지 마."
      ],
      [
        "rov",
        "형도 있네요! 우리 다 모였다."
      ],
      [
        "rov",
        "어? 누나 얼굴 빨개요~ 추워서죠? 아니면… 아 농담이에요!"
      ]
    ],
    "choices": [
      {
        "text": "\"농담하지 마요.\" 웃으며 엽서를 받는다.",
        "effect": {
          "friendship": 1
        }
      },
      {
        "text": "\"빨개진 거 아니거든요?\"",
        "effect": {
          "friendship": 1
        }
      }
    ]
  },
  {
    "id": 14,
    "title": "촬영 마무리",
    "location": "버스",
    "time": "08:00",
    "narration": "",
    "lines": [
      [
        "nox",
        "마지막 컷 어때."
      ],
      [
        "rov",
        "누나 편집 잘하던데요. 누나 이름 크레딧에 넣어요!"
      ],
      [
        "nox",
        "…매니저 이름 넣어."
      ]
    ],
    "choices": [
      {
        "text": "녹스의 말을 그냥 듣는다.",
        "effect": {
          "frequency": 5
        }
      },
      {
        "text": "\"지금 웃는 거예요?\"",
        "effect": {
          "frequency": 3
        }
      }
    ]
  },
  {
    "id": 15,
    "title": "안내방송",
    "location": "엔딩",
    "time": "BLUE HOUR",
    "narration": "버스가 종점 없는 순환 노선을 돈다. (안내방송: \"다음 정류장은 종점이 없습니다.\")",
    "lines": [
      [
        "nox",
        "네 수첩 말이야. 나 아직 안 돌려줬어."
      ],
      [
        "you",
        "돌려주세요."
      ],
      [
        "nox",
        "다음 주까지 곡 하나 같이 쓰면."
      ]
    ],
    "choices": [
      {
        "text": "우리의 첫 번째 밤을 기록한다.",
        "effect": {}
      }
    ]
  }
];

