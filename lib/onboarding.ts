export type TutorialPhase='story'|'invitation'|'tour'|'complete';
export type TutorialProgress={phase:TutorialPhase;step:number};
export const tutorialSteps=[
 {view:'story',target:'[data-tour="messages"]',title:'이야기는 메시지에서 시작돼요',body:'그룹 채팅에서 이야기를 이어가고, 멤버에게 개인적인 안부도 전할 수 있어요. 답장 선택에 따라 서로의 관계가 달라집니다.',label:'메시지'},
 {view:'studio',target:'[data-tour="studio-actions"]',title:'작은 연습이 무대를 만들어요',body:'훈련으로 능력을 키우고, 거리 라이브로 팬을 만나고, 심야 노선 파견으로 보상을 얻어요. 활동에는 BEAT가 필요합니다.',label:'아이돌 키우기'},
 {view:'studio',target:'[data-tour="character-details"]',title:'멤버의 컨디션도 챙겨 주세요',body:'상세 능력에서 능력치와 현재 일정, 훈련 효율을 확인해요. 멘탈이 낮을 땐 쉬어 가기로 회복시켜 주세요.',label:'상세 능력'},
 {view:'letters',target:'[data-tour="fan-letter"] .letter-actions',title:'팬의 마음에 답장을 보내요',body:'팬레터에 직접 답장하면 신호와 팬이 늘어요. 각 편지에는 하루 한 번 답장할 수 있고, 이곳에서 공연 민원도 살펴볼 수 있어요.',label:'팬레터'},
 {view:'archive',target:'[data-tour="archive-chapter"] .meter',title:'함께한 이야기를 모아 두었어요',body:'챕터 진행 상황과 지나온 대화를 확인하는 곳이에요. 아래에서는 우리의 신호와 노이즈도 살펴볼 수 있어요.',label:'이야기 보관함'},
 {view:'archive',target:'[data-tour="archive-goals"] .showcase-conditions',title:'우리의 다음 목적지는 쇼케이스',body:'멤버 영입, 팬, 신호와 노이즈, 멘탈 조건을 한눈에 확인해요. 네 명이 함께 설 무대는 다음 챕터에서 이어집니다.',label:'데뷔 쇼케이스'},
] as const;

export function readTutorial(raw:string|null,scene:number):TutorialProgress{
 try{
  const value=JSON.parse(raw||'null');
  if(value?.version===1&&['story','invitation','tour','complete'].includes(value.phase)&&Number.isInteger(value.step)&&value.step>=0&&value.step<tutorialSteps.length){
   // A reply saved just before a refresh must still unlock the tour.
   return {phase:value.phase==='story'&&scene>0?'invitation':value.phase,step:value.step};
  }
 }catch{}
 return {phase:scene===0?'story':'invitation',step:0};
}

export function writeTutorial(progress:TutorialProgress){return JSON.stringify({version:1,phase:progress.phase,step:progress.step});}
