import assert from 'node:assert/strict';
import {readTutorial,writeTutorial,tutorialSteps} from '../lib/onboarding.ts';

assert.deepEqual(readTutorial(null,0),{phase:'story',step:0},'A new player reads the first conversation before touring');
assert.deepEqual(readTutorial(null,7),{phase:'invitation',step:0},'Existing players keep their story progress and choose when to tour');
for(const raw of ['{bad json','null','{"version":1,"phase":"tour","step":-1}','{"version":1,"phase":"tour","step":99}','{"version":1,"phase":"tour","step":1.5}']){
 assert.deepEqual(readTutorial(raw,0),{phase:'story',step:0});
}
assert.deepEqual(readTutorial(writeTutorial({phase:'story',step:0}),1),{phase:'invitation',step:0},'Refreshing just after the first reply must not lose access to the tutorial');
assert.deepEqual(readTutorial(writeTutorial({phase:'tour',step:4}),3),{phase:'tour',step:4},'An interrupted tour resumes its saved step');
for(const scene of [0,1,15])assert.deepEqual(readTutorial(writeTutorial({phase:'complete',step:5}),scene),{phase:'complete',step:5},'Completed or skipped tours do not auto-repeat');
assert.deepEqual(new Set(tutorialSteps.map(step=>step.view)),new Set(['story','studio','letters','archive']),'The guide covers all four menus');
console.log('PASS: first visit, existing saves, invalid tutorial state, interrupted reply, tour resume, completion persistence and menu coverage.');
