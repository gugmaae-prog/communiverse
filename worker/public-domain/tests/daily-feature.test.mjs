import test from 'node:test';import assert from 'node:assert/strict';
import {featuredArtistIndex} from '../public-domain/daily-feature.mjs';
test('featured artist changes at Dubai midnight, not UTC midnight',()=>{
 const before=Date.parse('2026-10-28T19:59:59.999Z'),after=before+1;
 assert.equal(featuredArtistIndex(after,6),(featuredArtistIndex(before,6)+1)%6);
 assert.equal(featuredArtistIndex(Date.parse('2026-10-28T00:00:00Z'),6),featuredArtistIndex(before,6));
 assert.equal(featuredArtistIndex(Date.parse('2026-10-27T20:00:00Z'),6),featuredArtistIndex(before,6));
});
test('each artist receives one day in every complete rotation, across month/year boundaries',()=>{
 for(const start of ['2026-10-28T20:00:00Z','2026-12-29T20:00:00Z','2028-02-26T20:00:00Z']){
  const first=Date.parse(start),indices=Array.from({length:6},(_,i)=>featuredArtistIndex(first+i*86400000,6));
  assert.equal(new Set(indices).size,6);assert.equal(featuredArtistIndex(first+6*86400000,6),indices[0]);
 }
 assert.equal(featuredArtistIndex(Date.now(),1),0);assert.throws(()=>featuredArtistIndex(Date.now(),0),RangeError);
});
test('an open page refreshes its single featured artist at midnight and on return',async()=>{
 const {readFile}=await import('node:fs/promises'),{runInNewContext}=await import('node:vm');
 let now=Date.parse('2026-10-28T19:59:59.999Z'),pending,delay,replacements=0;
 const choices=Array.from({length:6},(_,i)=>String(i)),listeners={};
 let current={dataset:{featureIndex:String(featuredArtistIndex(now,6))},contains:()=>false,replaceWith(value){replacements++;current={...this,dataset:{featureIndex:value}}}};
 const document={hidden:false,activeElement:null,getElementById(id){return id==='cv-feed'?{}:id==='cv-daily-feature-data'?{textContent:JSON.stringify(choices)}:id==='cv-featured-artist'?current:null},createElement(){return {set innerHTML(value){this.content=value}}},addEventListener(name,fn){listeners[name]=fn}};
 const source=(await readFile('public-domain/feed-discovery.js.txt','utf8')).replace('/* DAILY_INDEX */',featuredArtistIndex.toString());
 runInNewContext(source,{document,window:{},Date:{now:()=>now},clearTimeout(){},setTimeout(fn,ms){pending=fn;delay=ms;return 1}});
 assert.equal(replacements,0);assert.equal(delay,101);
 now+=101;pending();assert.equal(replacements,1);assert.equal(Number(current.dataset.featureIndex),featuredArtistIndex(now,6));
 now+=2*86400000;listeners.visibilitychange();assert.equal(replacements,2);assert.equal(Number(current.dataset.featureIndex),featuredArtistIndex(now,6));
 listeners.visibilitychange();assert.equal(replacements,2);
});
