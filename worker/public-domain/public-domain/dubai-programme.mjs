import REFRESH from './event-refresh.txt';
import {dateWindow,inWindow} from './retained/read-feed-social-data.js';
export const programme=JSON.parse(REFRESH);
const refresh=new Map(programme.map(e=>[e.id,e]));
const additions=programme.filter(e=>/^(?:event|venue)-dubai-/.test(e.id));
export function eventMedia(e){const r=refresh.get(e?.id);return r?{...e,image:r.image,originalImage:r.originalImage||e.originalImage}:e;}
export async function programmeResponse(request,readPage){const u=new URL(request.url),endpoint=u.pathname.split('/').filter(Boolean).at(-1);
 if(endpoint==='event'){const newItem=additions.find(e=>e.id===u.searchParams.get('id'));if(newItem)return Response.json({event:newItem},{headers:{'Cache-Control':'no-store'}});const response=await readPage(request);if(!response.ok)return response;const data=await response.json();return Response.json({...data,event:eventMedia(data.event)},{headers:{'Cache-Control':'no-store'}});}
 const offset=Math.min(10000,Math.max(0,Math.trunc(Number(u.searchParams.get('offset')))||0)),all=new Map();let first,next=0;const seen=new Set();
 do{if(seen.has(next))throw Error('Repeated event page');seen.add(next);u.searchParams.set('offset',String(next));const r=await readPage(new Request(u,request));if(!r.ok)return r;const d=await r.json();if(!Array.isArray(d.events))throw Error('Invalid event response');first||=d;for(const e of d.events)all.set(e.id,eventMedia(e));next=d.next;if(next!==null&&(!Number.isInteger(next)||next<0||next>10000))throw Error('Invalid event pagination');}while(next!==null);
 const state=first.state||'upcoming',bucket=state==='now'?'today':state,bounds=first.window||dateWindow(bucket,new Date(),'Asia/Dubai'),q=(u.searchParams.get('q')||'').toLowerCase();
 for(const e of additions)if(!all.has(e.id)&&(!u.searchParams.get('type')||e.type===u.searchParams.get('type'))&&!u.searchParams.get('gallery')&&(!q||[e.title,e.city,e.organizer,...e.tags].join(' ').toLowerCase().includes(q))&&inWindow(e,bucket,bounds))all.set(e.id,{...e,state,bucket,displayDate:bucket==='past'?(e.start||e.end):bucket==='today'?bounds.today:e.start<bounds.from?bounds.from:e.start,ongoing:!!e.start&&e.start<bounds.today&&!!e.end&&e.end>=bounds.today});
 const events=[...all.values()].filter(e=>String(e.city).toLowerCase()==='dubai');events.sort((a,b)=>state==='past'?(b.end||b.start||'').localeCompare(a.end||a.start||''):(a.displayDate||'9999').localeCompare(b.displayDate||'9999'));
 return Response.json({...first,events:events.slice(offset,offset+18),total:events.length,next:offset+18<events.length?offset+18:null,city:'Dubai'},{headers:{'Cache-Control':'no-store'}});
}
