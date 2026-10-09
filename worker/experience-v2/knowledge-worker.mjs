/* Communiverse assigned-ambassador read API.
   Independent Worker, no HTML proxy, no D1 writes, no production runtime replacement.
   Server authorizes through the existing workspace/pipeline endpoint first.
*/
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
const goodID=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(value);
const clean=(value,max=160)=>typeof value==='string'?value.trim().slice(0,max):'';
const sql="SELECT a.artist_id, a.ambassador_id, a.updated_at, s.name, s.profile_slug, p.photo_url FROM cv_artist_assignments a JOIN cv_staff s ON s.id=a.ambassador_id AND s.status='active' LEFT JOIN cv_identity_profiles p ON p.identity_id=s.id";
export default{
 async fetch(request,env){
  const u=new URL(request.url);
  if(u.pathname==='/communiverse/__cv-qa-health')return json({ok:true,release:'20261009-qa',environment:'staging'});
  if(u.pathname!=='/communiverse/api/knowledge/artist-assignments')return json({error:'Not found'},404);
  if(request.method!=='GET')return json({error:'Use GET'},405);
  if(!env.MARKETPLACE||!env.COMMUNIVERSE_DB)return json({error:'Knowledge service is not configured'},503);
  try{
   const upstream=new URL(request.url);upstream.protocol='https:';upstream.host='espacios.me';upstream.pathname='/communiverse/api/workspace/pipeline';upstream.search='';
   const auth=await env.MARKETPLACE.fetch(new Request(upstream,request));
   if(!auth.ok)return json({error:auth.status===401?'Please sign in.':auth.status===403?'Access denied.':'Workspace not available.'},[401,403].includes(auth.status)?auth.status:503);
   const projection=await auth.json();
   if(!Array.isArray(projection.artists))return json({error:'Workspace response was incomplete'},503);
   const allow=new Set(projection.artists.map(a=>a.id).filter(goodID));
   const q=await env.COMMUNIVERSE_DB.prepare(sql).all();
   const assignments=(q.results||[]).filter(r=>allow.has(r.artist_id)).map(r=>({
    artistId:r.artist_id,
    relationship:'assigned ambassador',
    person:{id:r.ambassador_id,name:clean(r.name,100),profile_slug:goodID(r.profile_slug)?r.profile_slug:null,photo_url:typeof r.photo_url==='string'&&r.photo_url.startsWith('/communiverse/')?r.photo_url:null},
    assignedAt:clean(r.updated_at,40),
    verifiedOnboarder:false
   }));
   return json({schema:'communiverse.artist-assignments.v1',assignments,visibleArtists:allow.size,source:'cv_artist_assignments',provenance:'assignment—not original onboarding'});
  }catch{return json({error:'Artist assignments are temporarily unavailable.'},503)}
 }
};
