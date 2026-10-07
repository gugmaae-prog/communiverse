import test from 'node:test';
import assert from 'node:assert/strict';
import marketplace from './index.js';

const origin = 'https://espacios.me';
const request = (route, method = 'GET') => new Request(origin + route, {method});

test('new public routes render real media and honest empty states', async () => {
  const home = await marketplace.fetch(request('/communiverse/'));
  const html = await home.text();
  assert.equal(home.status, 200);
  assert.match(html,/The world/);
  assert.match(html,/ceramic-repair-poster\.jpg/);
  assert.match(html,/\/communiverse\/plug\//);
  for (const route of ['/communiverse/artists/','/communiverse/works/','/communiverse/workshops/']) {
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
  assert.match(html,/Object enquiry: blue-vase/);
  assert.match(html,/About blue-vase/);
  const unsafe=await marketplace.fetch(request('/communiverse/join/?kind=works&ref=%3Cscript%3E'));
  assert.doesNotMatch(await unsafe.text(),/About &lt;script&gt;/);
});
