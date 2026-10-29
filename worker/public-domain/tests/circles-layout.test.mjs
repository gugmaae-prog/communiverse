import test from 'node:test';
import assert from 'node:assert/strict';
import {circleLayout} from '../public-domain/circles-layout.mjs';
const widths=[296,327,366,640,744,820,1000,1256,1376];
test('community field preserves usable portraits and separated targets as the community grows',()=>{
 for(const width of widths)for(const count of [0,1,2,6,14,31,60]){
  const p=circleLayout(width,178,count),label=`${width}/${count}`;
  assert.equal(p.nodes.length,count,label);assert(p.diameter>=76,label);
  p.nodes.forEach((a,i)=>{
   assert(a.left>=0&&a.left+a.w<=width&&a.top>=0&&a.top+a.h<=p.height,label+' bounds');
   for(const b of p.nodes.slice(i+1))assert(Math.abs(a.x-b.x)>=(a.w+b.w)/2+23.99||Math.abs(a.y-b.y)>=(a.h+b.h)/2+23.99,label+' touching');
  });
  assert.deepEqual(p,circleLayout(width,900,count),'viewport height and selection do not scramble portraits');
 }
});
test('measured bands stagger profiles without shrinking an expanding community into the viewport',()=>{
 for(const width of [366,820,1376]){
  const p=circleLayout(width,178,14);assert(p.height>178);assert(new Set(p.nodes.map(n=>n.top)).size>=3);assert(p.rows.every(r=>r.bottom>r.top));
  const grown=circleLayout(width,178,60);assert(grown.height>p.height);assert.deepEqual(grown.nodes.slice(0,8),circleLayout(width,178,31).nodes.slice(0,8));
 }
});
