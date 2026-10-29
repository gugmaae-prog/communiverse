const PAGE_SIZE=18;
export function isDubai(event){return ['dubai','دبي'].includes(String(event?.city||'').normalize('NFKC').trim().toLowerCase())}
// Filter before pagination so counts and next-page offsets describe Dubai only.
// Read through the retained API to preserve hosted events, workshops and date rules.
export async function dubaiEvents(request,readPage){
 const url=new URL(request.url),offset=Math.min(10000,Math.max(0,Math.trunc(Number(url.searchParams.get('offset')))||0));
 url.searchParams.set('region','uae');url.searchParams.set('city','Dubai');url.searchParams.set('tz','Asia/Dubai');url.searchParams.set('offset','0');
 let first,headers,upstreamOffset=0;
 const seenPages=new Set(),seenIds=new Set(),events=[];
 while(true){
  if(seenPages.has(upstreamOffset))throw Error('Repeated event page');seenPages.add(upstreamOffset);
  url.searchParams.set('offset',String(upstreamOffset));
  const response=await readPage(new Request(url,request));
  if(!response.ok)return response;
  const data=await response.json();
  if(!Array.isArray(data.events))throw Error('Invalid event response');
  if(!first){first=data;headers=new Headers(response.headers)}
  for(const event of data.events)if(isDubai(event)&&!seenIds.has(event.id)){seenIds.add(event.id);events.push(event)}
  if(data.next===null)break;
  if(!Number.isInteger(data.next)||data.next<=upstreamOffset||data.next>10000)throw Error('Invalid event pagination');
  upstreamOffset=data.next;
 }
 for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);
 headers.set('cache-control','no-store');
 return Response.json({...first,events:events.slice(offset,offset+PAGE_SIZE),total:events.length,next:offset+PAGE_SIZE<events.length?offset+PAGE_SIZE:null,city:'Dubai'},{headers});
}
