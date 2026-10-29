import {PORTRAITS as previous} from './retained/artist-portrait-policy.mjs';

// Match only the two reviewed prior release portraits; later artist uploads win.
const base=id=>'/communiverse/_portraits/'+(id==='artist-gemma-gallagher'?'20261028-v2':'20261028-v1')+'/';
export const portraits=Object.fromEntries(['artist-gemma-gallagher','artist-sophiko'].map(id=>[id,{
 ...previous[id],url:base(id)+id+'-1024.webp',
 variants:[384,768,1024].map(width=>({url:base(id)+id+'-'+width+'.webp',width,height:width})),
 originalWidth:id==='artist-gemma-gallagher'?1142:1254,originalHeight:id==='artist-gemma-gallagher'?1008:1254,
 editedMasterWidth:1254,editedMasterHeight:1254,
 source:id==='artist-gemma-gallagher'?'Photograph identified as Gemma and supplied by the user on 28 October 2026.':previous[id].source,
 processing:id==='artist-gemma-gallagher'?'Edited from the supplied photograph with the built-in image editor: plain neutral background and restrained photographic restoration; reviewed against the supplied image. Responsive crops are resized exports.':'Existing portrait edited to fill the circular cutout in the lower shawl corners; square photographic export.',
 framing:id==='artist-gemma-gallagher'?{eyeLevel:.34,crop:{left:303,top:60,width:600,height:600}}:{eyeLevel:.34,crop:{left:0,top:0,width:1254,height:1254}}
}]));
const replacements=Object.entries(portraits).flatMap(([id,p])=>previous[id].variants.map((v,i)=>[v.url,p.variants[i].url]));
export function portraitText(source){
 for(const[id,p]of Object.entries(portraits))source=source.replaceAll(JSON.stringify(previous[id]),JSON.stringify(p));
 for(const[old,url]of replacements){source=source.replaceAll(old,url).replaceAll(old.replaceAll('/','\\/'),url.replaceAll('/','\\/'));}
 return source;
}
export function portraitData(value){
 if(typeof value==='string')return portraitText(value);
 if(Array.isArray(value))return value.map(portraitData);
 if(value&&typeof value==='object'){
  for(const[id,p]of Object.entries(portraits))if(value.kind==='photo'&&value.url===previous[id].url)return p;
  return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,portraitData(v)]));
 }
 return value;
}
