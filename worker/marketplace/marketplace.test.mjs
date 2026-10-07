import test from 'node:test';
import assert from 'node:assert/strict';
import marketplace from './index.js';

const origin = 'https://espacios.me';
const request = (route, method = 'GET') => new Request(origin + route, {method});

test('new public routes show fictional artist previews beside real films and honest empty inventory', async () => {
  const home = await marketplace.fetch(request('/communiverse/'));
  const html = await home.text();
  assert.equal(home.status, 200);
  assert.match(html,/The world/);
  assert.match(html,/ceramic-repair-poster\.jpg/);
  assert.match(html,/Fictional preview/);
  assert.match(html,/Come for the craft/);
  assert.match(html,/\/communiverse\/plug\//);
  const artists = await marketplace.fetch(request('/communiverse/artists/'));
  const artistHtml = await artists.text();
  assert.equal((artistHtml.match(/data-artist-card/g)||[]).length,6);
  assert.match(artistHtml,/fictional previews/i);
  for (const route of ['/communiverse/works/','/communiverse/workshops/']) {
    const response = await marketplace.fetch(request(route));
    assert.equal(response.status,200,route);
    assert.match(await response.text(),/opening soon|taking shape|on their way/);
  }
  const films = await marketplace.fetch(request('/communiverse/stories/'));
  assert.equal((await films.text()).match(/<article class="film">/g)?.length,13);
});

test('unowned paths and the existing waitlist API delegate to the current Worker', async () => {
  const seen=[];
  const env={LEGACY:{fetch:async r=>{seen.push(new URL(r.url).pathname);return new Response('legacy',{status:218});}}};
  for (const route of ['/communiverse/plug/','/communiverse/ambassadors/','/communiverse/media/gallery-20261007/carved-dog.mp4','/communiverse/api/waitlist']) {
    const result=await marketplace.fetch(request(route,route.includes('/api/')?'POST':'GET'),env);
    assert.equal(result.status,218,route);
  }
  assert.equal(seen.length,4);
});

test('catalogue reads published records with a publishable key and escapes supplied text', async () => {
  const original=globalThis.fetch;
  let query;
  globalThis.fetch=async(input, init)=>{
    query=new URL(input);
    assert.deepEqual(init.headers,{apikey:'sb_publishable_example'});
    return Response.json([{slug:'someone',name:'<script>alert(1)</script>',discipline:'Ceramics',location:'Dubai',bio:'',portrait_url:'javascript:alert(1)'}]);
  };
  try {
    const response=await marketplace.fetch(request('/communiverse/artists/'),{SUPABASE_URL:'https://test.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_example'});
    const html=await response.text();
    assert.equal(query.searchParams.get('status'),'eq.published');
    assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
    assert.doesNotMatch(html,/src="javascript:/);
  } finally { globalThis.fetch=original; }
});

test('unknown profiles and unsupported methods do not create a public listing', async () => {
  assert.equal((await marketplace.fetch(request('/communiverse/artists/unknown/'))).status,404);
  assert.equal((await marketplace.fetch(request('/communiverse/join/','POST'))).status,405);
  const head=await marketplace.fetch(request('/communiverse/','HEAD'));
  assert.equal(head.status,200);
  assert.equal(await head.text(),'');
});

test('a published item enquiry keeps its context in the request subject', async () => {
  const response=await marketplace.fetch(request('/communiverse/join/?kind=works&ref=blue-vase'));
  const html=await response.text();
  assert.match(html,/apply\/client\/\?ref=blue-vase/);
  const client=await marketplace.fetch(request('/communiverse/apply/client/?ref=blue-vase'));
  assert.match(await client.text(),/Client enquiry: blue-vase/);
  const unsafe=await marketplace.fetch(request('/communiverse/join/?kind=works&ref=%3Cscript%3E'));
  assert.doesNotMatch(await unsafe.text(),/ref=%3Cscript%3E/);
});

test('all application paths ask role-specific questions and Belong reuses existing OAuth routes', async () => {
  const ambassador=await marketplace.fetch(request('/communiverse/apply/ambassador/'));
  const html=await ambassador.text();
  for(let i=1;i<=14;i++)assert.match(html,new RegExp(`${i}\\.`));
  assert.match(html,/data-flow="ambassador"/);
  const artist=await marketplace.fetch(request('/communiverse/apply/artist/'));
  assert.match(await artist.text(),/What is your main craft/);
  const client=await marketplace.fetch(request('/communiverse/apply/client/'));
  assert.match(await client.text(),/How many people will take part/);
  const belong=await marketplace.fetch(request('/communiverse/apply/belong/'));
  const belongHtml=await belong.text();
  assert.match(belongHtml,/api\/auth\/oauth\/google/);
  assert.match(belongHtml,/api\/auth\/oauth\/linkedin/);
});

test('sample profiles are clearly marked and generated image route returns JPEG', async () => {
  const profile=await marketplace.fetch(request('/communiverse/artists/amina-rahmani/'));
  assert.match(await profile.text(),/This is not a verified maker/);
  const portrait=await marketplace.fetch(request('/communiverse/_public/sample-artists/amina-rahmani.jpg'));
  assert.equal(portrait.status,200);
  assert.equal(portrait.headers.get('content-type'),'image/jpeg');
  assert.ok((await portrait.arrayBuffer()).byteLength>100_000);
});

test('ambassador page keeps legacy content but directs applications to the new form', async () => {
  const env={LEGACY:{fetch:async()=>new Response('<a href="/communiverse/contact/#contact">Express your interest</a>',{headers:{'content-type':'text/html'}})}};
  const response=await marketplace.fetch(request('/communiverse/ambassadors/'),env);
  const html=await response.text();
  assert.match(html,/\/communiverse\/apply\/ambassador\//);
  assert.match(html,/Represent your city/);
});

test('application API validates answers and stores them through the existing request handler', async () => {
  let stored;
  const env={LEGACY:{fetch:async req=>{stored=await req.json();return Response.json({reference:'test-reference'})}}};
  const body={name:'QA Artist',email:'qa@example.invalid',role:'artist',answers:{city:'Dubai, UAE',craft:'Ceramics',story:'I work by hand.',offer:'A workshop or experience',media_consent:'Yes, please ask me first',contact_consent:'yes'},requestId:'00000000-0000-4000-8000-000000000001'};
  const post=(value,origin='https://espacios.me')=>marketplace.fetch(new Request(origin+'/communiverse/api/applications',{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(value)}),env);
  assert.equal((await post({...body,answers:{...body.answers,contact_consent:''}})).status,400);
  const response=await post(body);
  assert.equal(response.status,200);
  assert.equal(stored.subject,'Artist application');
  assert.equal(stored.email,'qa@example.invalid');
  assert.equal(JSON.parse(stored.message).answers.craft,'Ceramics');
  assert.equal(stored.requestId,body.requestId);
});

test('an existing espacios.me sign-in supplies the verified membership email', async () => {
  const original=globalThis.fetch;let stored;
  globalThis.fetch=async()=>Response.json({user:{email:'verified@example.invalid'}});
  const env={LEGACY:{fetch:async req=>{stored=await req.json();return Response.json({reference:'member'})}}};
  try{
    const body={name:'Member QA',email:'unverified@example.invalid',role:'belong',answers:{city:'Dubai, UAE',interest:'I want to learn',updates:'Only reply about this request',contact_consent:'yes'}};
    const response=await marketplace.fetch(new Request(origin+'/communiverse/api/applications',{method:'POST',headers:{'content-type':'application/json',origin,authorization:'Bearer test.token.value'},body:JSON.stringify(body)}),env);
    assert.equal(response.status,200);
    assert.equal(stored.email,'verified@example.invalid');
    assert.equal(JSON.parse(stored.message).verified_by,'espacios.me');
  }finally{globalThis.fetch=original}
});
