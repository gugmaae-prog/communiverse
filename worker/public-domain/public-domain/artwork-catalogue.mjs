import {workPath} from './record-routes.mjs';
import CACHE from './public-cache.txt';
import HD from './artwork-hd.txt';
import {portraitData} from './portrait-refresh.mjs';
const cache=portraitData(JSON.parse(CACHE)),hd=JSON.parse(HD);
export const artworkRecords=cache.works.map(work=>({...work,...cache.details[work.id]?.item,...(hd[work.id]?{highResolution:hd[work.id]}:{})}));
export const artworkById=new Map(artworkRecords.map(w=>[w.id,w]));
export function artistWorks(id){return artworkRecords.filter(w=>w.artist===id).map(w=>({id:w.id,title:w.title,src:w.image,alt:w.title,medium:w.medium||'',size:w.size||'',year:w.year||'',description:w.description||'',url:workPath(w.id),highResolution:w.highResolution||null}));}
export const artworkContext=Object.fromEntries(artworkRecords.map(w=>[w.id,{id:w.id,url:workPath(w.id),title:w.title,artist:w.artist,artistName:w.artistName,image:w.image,highResolution:w.highResolution||null,originalImage:w.originalImage||null,imageProvenance:w.imageProvenance||'',titleProvenance:w.titleProvenance||'',description:w.description||'',artistPortrait:cache.artists.find(a=>a.id===w.artist)?.portrait?.url||'',artistSummary:cache.artists.find(a=>a.id===w.artist)?.description||'',artistFocus:cache.artists.find(a=>a.id===w.artist)?.tags||[]}]));
