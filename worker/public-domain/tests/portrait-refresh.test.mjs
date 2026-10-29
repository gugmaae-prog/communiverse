import test from 'node:test';
import assert from 'node:assert/strict';
import {PORTRAITS as previous} from '../public-domain/retained/artist-portrait-policy.mjs';
import {portraits,portraitData,portraitText} from '../public-domain/portrait-refresh.mjs';
import {rewrite,ORIGIN} from '../public-domain/urls.mjs';
test('shared portrait update reaches embedded hydration records, responsive HTML and JSON without replacing future uploads',()=>{
 for(const[id,p]of Object.entries(portraits)){
  const old=previous[id];
  assert.deepEqual(portraitData({image:old.url,avatar:old.url,portrait:old}),{image:p.url,avatar:p.url,portrait:p});
  const client='const PORTRAITS='+JSON.stringify(previous)+';';
  assert(portraitText(client).includes(JSON.stringify(p)));
  const html=rewrite('<img src="'+old.url+'" srcset="'+old.variants.map(v=>v.url+' '+v.width+'w').join(', ')+'">',ORIGIN);
  for(const v of p.variants)assert(html.includes(v.url));
  assert(!html.includes(old.url));
  const upload={...old,url:'/communiverse/_public/user-upload/new-portrait.webp',variants:[{url:'/communiverse/_public/user-upload/new-portrait.webp',width:2048,height:2048}]};
  assert.deepEqual(portraitData(upload),upload);
 }
 for(const[id,p]of Object.entries(previous))if(!portraits[id])assert.deepEqual(portraitData(p),p);
});
