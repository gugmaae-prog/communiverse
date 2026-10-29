import test from 'node:test';import assert from 'node:assert/strict';
import {circleScene} from '../public-domain/circles-scene.mjs';
test('selected portrait stays anchored and variable cards never touch at phone, tablet or desktop widths',()=>{
 for(const width of [296,366,744,820,1256,1376])for(const works of [0,1,3,11,26]){
  const anchor={id:'selected',x:width*.3,y:180,w:Math.min(166,width-24),h:180,fixed:true};
  const entities=[anchor,{id:'about',x:width*.6,y:280,w:Math.min(280,width-24),h:460},...Array.from({length:works},(_,i)=>({id:'work'+i,x:(i%3)*250,y:30+Math.floor(i/3)*340,w:Math.min(260,width-24),h:318})),...Array.from({length:13},(_,i)=>({id:'person'+i,x:(i%5)*170,y:70+Math.floor(i/5)*140,w:112,h:120}))];
  const result=circleScene(width,620,entities),rects=Object.values(result.positions);assert.equal(rects.length,entities.length);assert.equal(result.positions.selected.y,anchor.y);assert.equal(result.positions.selected.x,Math.max(12,Math.min(width-12-anchor.w,anchor.x)));
  for(const [i,a]of rects.entries()){assert(a.x>=12&&a.y>=12&&a.x+a.w<=width-12+.01&&a.y+a.h<=result.height-12+.01);for(const b of rects.slice(i+1))assert(a.x+a.w+23.99<=b.x||b.x+b.w+23.99<=a.x||a.y+a.h+23.99<=b.y||b.y+b.h+23.99<=a.y);}
  assert.deepEqual(result,circleScene(width,620,entities));
 }
});
