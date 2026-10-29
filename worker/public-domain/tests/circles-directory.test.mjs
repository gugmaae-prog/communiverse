import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {circlePeople,directoryHTML,removedPeople} from '../public-domain/circles-directory.mjs';
import {link} from '../public-domain/urls.mjs';
test('directory removes only the requested circles and preserves every artist and photographed Elferah',async()=>{
 const data=circlePeople(await fs.readFile('public-domain/pages/circles.txt','utf8'));assert.equal(data.length,14);assert.equal(data.filter(p=>p.category==='artists').length,6);assert(data.some(p=>p.slug==='cv-elferah-saidil'));
 for(const p of data)assert(!removedPeople.has(p.slug));
 assert(data.find(p=>p.slug==='artist-gemma-gallagher').image.includes('20261028-v2'));
 const html=directoryHTML(data,new URL('https://communiverseclubs.com/circles/?filter=artists&person=artist-gemma-gallagher'));
 assert(html.includes('6 people'));assert(html.includes('class="cv-person is-selected"'));assert.equal((html.match(/data-person-id=/g)||[]).length,14);
 for(const id of removedPeople)assert(!html.includes(id));
 const hostile=directoryHTML([{...data[0],name:'<img src=x onerror=alert(1)>',summary:'</script><script>alert(1)</script>'}],new URL('https://communiverseclubs.com/circles/'));
 assert(!hostile.includes('</script><script>alert'));assert(hostile.includes('\\u003c/script>'));
});
test('old artist directory links preserve selection, search and fragments',()=>{
 assert.equal(link('/artists/?artist=artist-gemma-gallagher&q=Gemma#works'),'/circles/?q=Gemma&filter=artists&person=artist-gemma-gallagher#works');
 assert.equal(link('/communiverse/artists/'),'/circles/?filter=artists');
 assert.equal(link('/artist/?id=artist-gemma-gallagher'),'/artists/gemma-gallagher/');
});
