/**
 * Communiverse knowledge tools (pure functions, no database access).
 *
 * Callers MUST authorize and scope records on the server before passing data
 * to these helpers. A model prompt is not an access-control boundary.
 */
export const version = "2026-10-09.1";
export const kinds = Object.freeze(["task_collection","artist_assignments","related_works","answer","draft","error"]);
const arr = v => Array.isArray(v) ? v : [];
const clean = (v,n=250) => typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,n) : "";
const valid = v => typeof v === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(v);
const avatar = p => valid(p?.profile_slug) ? "/communiverse/_public/avatar/"+encodeURIComponent(p.profile_slug) : null;
const url = (route,id) => "/communiverse/"+route+encodeURIComponent(id);
export function taskCollection(authorizedOverview,{ownerOnly=false,limit=80}={}) {
 const o=authorizedOverview||{},me=o.person,projects=new Map(arr(o.projects).filter(p=>valid(p.id)).map(p=>[p.id,p]));
 const people=new Map(arr(o.team).filter(p=>valid(p.id)).map(p=>[p.id,p]));
 if(valid(me?.id))people.set(me.id,{...people.get(me.id),...me});
 let list=arr(o.tasks).filter(t=>valid(t.id)&&projects.has(t.project_id)&&t.status!=="archived");
 if(ownerOnly)list=valid(me?.id)?list.filter(t=>t.owner_id===me.id):[];
 const order={blocked:0,review:1,todo:2,in_progress:3,done:4};
 list.sort((a,b)=>(order[a.status]??5)-(order[b.status]??5)||String(a.due_date||"9999").localeCompare(String(b.due_date||"9999")));
 return {schema:"communiverse.knowledge.v1",kind:"task_collection",scope:ownerOnly?"my_tasks":"authorized_tasks",count:list.length,
 cards:list.slice(0,Math.max(1,Math.min(limit,200))).map(t=>{
  const project=projects.get(t.project_id),ids=[...new Set([t.owner_id,t.created_by,project.owner_id].filter(Boolean))];
  return {kind:"task",id:t.id,title:clean(t.title,180),description:clean(t.description,400),status:clean(t.status,40),priority:clean(t.priority,40),
   dueDate:/^\d{4}-\d{2}-\d{2}$/.test(t.due_date||"")?t.due_date:null,requiresApproval:!!t.approval_required,
   project:{id:project.id,title:clean(project.title,130)},
   people:ids.map(id=>{const p=people.get(id)||{};return{id,name:clean(p.name||id,100),relationship:id===t.owner_id?"Owner":id===t.created_by?"Created by":"Project lead",avatar:avatar(p),profile:valid(p.profile_slug)?url("plug/?person=",p.profile_slug):null};}),
   link:url("workspace/?task=",t.id),source:{collection:"cv_tasks",id:t.id,observedAt:t.updated_at||null}};
 }),source:"authorized:/communiverse/api/workspace/overview",truncated:list.length>Math.min(limit,200)};
}
export function artistAssignmentCollection(authorizedArtists,authorizedAssignments,staff) {
 const assigned=new Map(arr(authorizedAssignments).filter(a=>valid(a.artist_id)).map(a=>[a.artist_id,a]));
 const persons=new Map(arr(staff).filter(p=>valid(p.id)).map(p=>[p.id,p]));
 return {schema:"communiverse.knowledge.v1",kind:"artist_assignments",
  cards:arr(authorizedArtists).filter(a=>valid(a.id)).map(a=>{const link=assigned.get(a.id),p=persons.get(link?.ambassador_id);
   const onboarder=persons.get(a.onboardedBy);
   return {artistId:a.id,artist:clean(a.title,140),assignedAmbassador:p?{id:p.id,name:clean(p.name,100),avatar:avatar(p)}:null,
    onboardedBy:onboarder?{id:onboarder.id,name:clean(onboarder.name,100),avatar:avatar(onboarder)}:null,
    provenance:onboarder?"verified":"unverified",source:{collection:"cv_artist_assignments",id:a.id}};
  })};
}
export function relatedWorks(seed,publicWorks,{limit=8}={}) {
 if(!seed?.id)return {kind:"related_works",items:[]};
 const tags=new Set(arr(seed.tags).map(x=>clean(x,60).toLowerCase()));
 const found=new Set();
 const items=arr(publicWorks).filter(w=>{if(!w?.id||w.id===seed.id||w.status==="hidden"||w.isPublished===false||found.has(w.id))return false;found.add(w.id);return true;})
 .map(w=>{const overlap=arr(w.tags).filter(t=>tags.has(clean(t,60).toLowerCase())).length;
  const sameArtist=!!seed.artist&&w.artist===seed.artist,sameRegion=!!seed.region&&w.region===seed.region;
  return {id:w.id,title:clean(w.title,180),image:clean(w.image,500),artistName:clean(w.artistName,130),score:4*overlap+(sameArtist?5:0)+(sameRegion?2:0),
   reason:overlap?"Shared materials or interests":sameArtist?"More from this artist":sameRegion?"Same region":"Explore another work",
   link:url("?work=",w.id),availability:w.available===true?"verified":"unverified"};});
 return {schema:"communiverse.knowledge.v1",kind:"related_works",seed:seed.id,
  items:items.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,Math.max(1,Math.min(limit,24)))};
}
export function envelope(kind,data,principal,sources=[]) {
 if(!kinds.includes(kind))throw Error("Unknown response type");
 return {schema:"communiverse.knowledge.v1",kind,data,access:{kind:principal?.kind||"visitor",role:principal?.role||"anonymous"},sources:arr(sources),provenanceRequired:true};
}
