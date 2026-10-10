const json = (value,status=200) => new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const categories = new Set(['artisan_introduction','story_published','experience_hosted']);

export async function ambassadorMetrics(env) {
  if (!env.COMMUNIVERSE_DB) return {available:false,rows:[]};
  try {
    const result = await env.COMMUNIVERSE_DB.prepare(`SELECT p.slug,p.display_name,p.public_profile_url,p.city,
      COUNT(CASE WHEN a.category='artisan_introduction' THEN 1 END) AS artisans_introduced,
      COUNT(CASE WHEN a.category='story_published' THEN 1 END) AS stories_published,
      COUNT(CASE WHEN a.category='experience_hosted' THEN 1 END) AS experiences_hosted
      FROM cv_ambassador_profiles p LEFT JOIN cv_ambassador_activity a
      ON a.ambassador_slug=p.slug AND a.status='approved'
      WHERE p.status='active' GROUP BY p.slug ORDER BY p.display_name`).all();
    return {available:true,rows:result.results||[]};
  } catch { return {available:false,rows:[]}; }
}

export async function submitAmbassadorActivity(request,env,url) {
  if (request.method!=='POST') return json({error:'Method not allowed.'},405);
  if (!env.COMMUNIVERSE_DB) return json({error:'Activity reporting is temporarily unavailable.'},503);
  const origin=request.headers.get('Origin');
  if (origin && origin!==url.origin) return json({error:'Submit from Communiverse.'},403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'Expected JSON.'},415);
  const auth=request.headers.get('Authorization')||'';
  if (!/^Bearer [A-Za-z0-9._~-]+$/.test(auth)) return json({error:'Sign in with your approved ambassador account.'},401);
  const raw=await request.text();if(raw.length>2500)return json({error:'Please shorten the details.'},413);
  let body;try{body=JSON.parse(raw)}catch{return json({error:'Check the activity details.'},400)}
  const slug=String(body.slug||'').trim(),category=String(body.category||''),title=String(body.title||'').trim(),date=String(body.occurred_on||''),evidence=String(body.evidence_url||'').trim();
  if(!/^[a-z0-9-]{1,80}$/.test(slug)||!categories.has(category)||title.length<5||title.length>120||!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>new Date().toISOString().slice(0,10))return json({error:'Check the activity, title and date.'},400);
  try{const u=new URL(evidence);if(u.protocol!=='https:'||evidence.length>600)throw Error();}catch{return json({error:'Use a public HTTPS evidence link.'},400)}
  let email='';
  try{
    const response=await fetch('https://espacios.me/api/auth/me',{headers:{Authorization:auth,Accept:'application/json'},signal:AbortSignal.timeout(5000)});
    if(!response.ok)return json({error:'Sign in again.'},401);
    const data=await response.json();email=String((data.user||data.account||data).email||'').trim().toLowerCase();
    if(!email)return json({error:'Your sign-in did not provide an email address.'},401);
  }catch{return json({error:'Could not verify your sign-in.'},503)}
  try{
    const profile=await env.COMMUNIVERSE_DB.prepare("SELECT slug FROM cv_ambassador_profiles WHERE slug=? AND status='active' AND lower(verified_email)=?").bind(slug,email).first();
    if(!profile)return json({error:'Your account is not yet linked to this ambassador profile. Contact the team to connect it.'},403);
    const count=await env.COMMUNIVERSE_DB.prepare("SELECT count(*) AS n FROM cv_ambassador_activity WHERE ambassador_slug=? AND submitted_by_email=? AND created_at>=datetime('now','-1 day')").bind(slug,email).first();
    if(Number(count?.n||0)>=5)return json({error:'You have reached today’s reporting limit.'},429);
    const id=crypto.randomUUID();
    await env.COMMUNIVERSE_DB.prepare('INSERT INTO cv_ambassador_activity(id,ambassador_slug,category,title,evidence_url,occurred_on,submitted_by_email) VALUES (?,?,?,?,?,?,?)').bind(id,slug,category,title,evidence,date,email).run();
    return json({reference:id,status:'pending',message:'Saved for review. Public metrics update after approval.'},202);
  }catch{return json({error:'Could not save the activity. Try again later.'},503)}
}

export async function reviewAmbassadorActivity(request,env,url) {
  if (!['GET','POST'].includes(request.method)) return json({error:'Method not allowed.'},405);
  if (!env.COMMUNIVERSE_DB) return json({error:'Review is temporarily unavailable.'},503);
  const auth=request.headers.get('Authorization')||'';
  if (!/^Bearer [A-Za-z0-9._~-]+$/.test(auth)) return json({error:'Sign in to review activity.'},401);
  let email='';
  try {
    const response=await fetch('https://espacios.me/api/auth/me',{headers:{Authorization:auth,Accept:'application/json'},signal:AbortSignal.timeout(5000)});
    if (!response.ok) return json({error:'Sign in again.'},401);
    const data=await response.json();
    email=String((data.user||data.account||data).email||'').trim().toLowerCase();
    if (!email) return json({error:'Your sign-in did not provide an email address.'},401);
  } catch { return json({error:'Could not verify your sign-in.'},503); }
  try {
    const reviewer=await env.COMMUNIVERSE_DB.prepare("SELECT email FROM cv_staff_reviewers WHERE email=? AND status='active'").bind(email).first();
    if (!reviewer) return json({error:'This account does not have review access.'},403);
    if (request.method==='GET') {
      const pending=await env.COMMUNIVERSE_DB.prepare(`SELECT a.id,a.ambassador_slug,p.display_name,a.category,a.title,a.evidence_url,a.occurred_on,a.created_at
        FROM cv_ambassador_activity a JOIN cv_ambassador_profiles p ON p.slug=a.ambassador_slug
        WHERE a.status='pending' ORDER BY a.created_at ASC LIMIT 100`).all();
      const profiles=await env.COMMUNIVERSE_DB.prepare("SELECT slug,display_name,city,verified_email FROM cv_ambassador_profiles WHERE status='active' ORDER BY display_name").all();
      return json({pending:pending.results||[],profiles:profiles.results||[]});
    }
    const origin=request.headers.get('Origin');
    if (origin && origin!==url.origin) return json({error:'Submit from Communiverse.'},403);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'Expected JSON.'},415);
    const raw=await request.text();if (raw.length>1000) return json({error:'Request too long.'},413);
    let body;try{body=JSON.parse(raw)}catch{return json({error:'Check the review details.'},400)}
    if (body.action==='link') {
      const slug=String(body.slug||'').trim(),memberEmail=String(body.email||'').trim().toLowerCase();
      if (!/^[a-z0-9-]{1,80}$/.test(slug)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)||memberEmail.length>254) return json({error:'Enter a valid profile and email.'},400);
      const result=await env.COMMUNIVERSE_DB.prepare("UPDATE cv_ambassador_profiles SET verified_email=? WHERE slug=? AND status='active'").bind(memberEmail,slug).run();
      if (!result.meta?.changes) return json({error:'Profile not found.'},404);
      return json({status:'linked'});
    }
    if (!['approve','reject'].includes(body.action)||!/^[-0-9a-f]{36}$/i.test(String(body.id||''))) return json({error:'Choose an activity and decision.'},400);
    const status=body.action==='approve'?'approved':'rejected';
    const result=await env.COMMUNIVERSE_DB.prepare("UPDATE cv_ambassador_activity SET status=?,reviewed_at=CURRENT_TIMESTAMP,reviewed_by_email=? WHERE id=? AND status='pending'").bind(status,email,body.id).run();
    if (!result.meta?.changes) return json({error:'This activity is no longer pending.'},409);
    return json({status});
  } catch { return json({error:'Could not complete the review.'},503); }
}
