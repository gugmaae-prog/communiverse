import test from 'node:test';
import assert from 'node:assert/strict';
import {circleLayout} from '../public-domain/circles-layout.mjs';
const viewports=[[296,318],[366,580],[744,730],[820,178],[1256,560],[1000,510]];
test('every current circle fits its screen with separated, accessible targets',()=>{
 for(const [width,height] of viewports)for(let count=1;count<=13;count++){
  const p=circleLayout(width,height,count),label=`${width}x${height}/${count}`;
  assert.equal(p.nodes.length,count,label);assert(!p.height||p.height<=height,label+' overflow');assert(p.diameter>=44,label);
  p.nodes.forEach((a,i)=>{
   assert(a.x-a.w/2>=0&&a.x+a.w/2<=width&&a.y-a.h/2>=0&&a.y+a.h/2<=height,label+' bounds');
   for(const b of [...p.nodes.slice(i+1),...(p.core?[p.core]:[])])assert(Math.abs(a.x-b.x)>=(a.w+b.w)/2+7.99||Math.abs(a.y-b.y)>=(a.h+b.h)/2+7.99,label+' touching');
  });
  assert.deepEqual(p,circleLayout(width,height,count),'stable on selection');
 }
});
test('six artist positions are staggered on phone and landscape',()=>{
 for(const [w,h] of [[366,580],[820,178]]){
  const p=circleLayout(w,h,6);
  assert(new Set(p.nodes.map(n=>Math.round(n.y))).size>=4);
  assert(new Set(p.nodes.map(n=>Math.round(n.x))).size>=4);
 }
});
test('extremely short accessible windows grow rather than losing circles',()=>{
 const p=circleLayout(296,120,13);assert(p.height>120);assert.equal(p.nodes.length,13);assert(p.diameter>=44);
});
