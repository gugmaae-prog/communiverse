import test from 'node:test';import assert from 'node:assert/strict';import {circlePreview} from '../public-domain/circles-preview.mjs';import {circleMotion} from '../public-domain/circles-motion.mjs';
test('Circles limits initial previews and direct links to three without mutating the complete portfolio',()=>{
 for(const n of [0,1,2,3,11,26]){const works=Array.from({length:n},(_,i)=>({id:'work'+i,title:'Work '+i,src:'/image'+i+'.jpg',url:'/work'+i+'/'})),p={slug:'artist-tamer-karam',name:'Tamer Karam',role:'Artist',category:'artists',workPhotos:works};const copy=JSON.stringify(works);for(const id of [null,'unknown',works.at(-1)?.id]){const shown=circlePreview(works,id);assert.equal(shown.length,Math.min(3,n));if(id&&id!=='unknown'&&n)assert(shown.some(w=>w.id===id));}assert.equal(JSON.stringify(works),copy);}
});
test('motion uses a clear corridor and falls back inside the reserved gutter when a path is occupied',()=>{
 const from={x:0,y:0,w:100,h:120},to={x:300,y:0,w:100,h:120};assert.deepEqual(circleMotion(from,to),{dx:-300,dy:0,mode:'glide'});const guarded=circleMotion(from,to,[{x:150,y:0,w:100,h:120}]);assert.equal(guarded.mode,'settle');assert(Math.abs(guarded.dx)<=8&&Math.abs(guarded.dy)<=8);assert.equal(circleMotion(from,to,[{x:408,y:0,w:100,h:120}]).mode,'settle');assert.deepEqual(circleMotion(null,to),{dx:0,dy:8,mode:'enter'});
 assert.equal(circleMotion({x:40,y:28,w:104,h:152},{x:0,y:0,w:162,h:210},[{x:192,y:199,w:280,h:487}]).mode,'settle');
 // An interruption starts from the currently visible rectangle, not an old
 // transform accumulated on the previous animation's destination.
 assert.deepEqual(circleMotion({x:210,y:25,w:100,h:120},{x:250,y:20,w:100,h:120}),{dx:-40,dy:5,mode:'glide'});
});
