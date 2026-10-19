import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

// Test the actual release view module. Only unrelated Worker imports are stubbed.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourcePath=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'worker/releases/social-20261008/views.js');
const source=await fs.readFile(sourcePath,'utf8');
const stubs=`
const REGIONS=[];
const CRAFTS=[];
const bookingForm=()=>'';
const h=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const serialize=value=>JSON.stringify(value).replace(/</g,'\\u003c');
`;
const {header}=await import('data:text/javascript;base64,'+Buffer.from(stubs+source.replace(/^import[^\n]*\n/gm,'')).toString('base64'));
let assertions=0;
const check=(condition,message)=>{assert(condition,message);assertions++};
const hasHref=(html,href)=>html.includes('href="'+href+'"');
const guest=header(null,'/communiverse/discover/');
check(hasHref(guest,'/communiverse/join/'),'Guests have a Join action');
check(hasHref(guest,'/communiverse/sign-in/'),'Guests have a Sign in action');
check(!hasHref(guest,'/communiverse/workspace/'),'Guests do not have a private workspace chip');
check((guest.match(/aria-current="page"/g)||[]).length===1,'Exactly one main navigation item is selected');
check(/href="\/communiverse\/discover\/" aria-current="page"/.test(guest),'The requested navigation item is selected');
check((guest.match(/class="cv-universe-logo"/g)||[]).length===1,'The shared header has one Communiverse logo');
check(!guest.includes('<strong>Communiverse')&&!/[★⭐]/u.test(guest),'The brand remains plain text without a star');

const member=header({id:'member-id',first_name:'Lucía & Awa',photo:'/communiverse/_public/avatar/member-member-id?v=3'});
check(hasHref(member,'/communiverse/profile/'),'A public member keeps the public profile destination');
check(!hasHref(member,'/communiverse/workspace/'),'A public member is not presented as staff');
check(!hasHref(member,'/communiverse/join/')&&!hasHref(member,'/communiverse/sign-in/'),'A signed-in member has no redundant Join or Sign in actions');
check(member.includes('Lucía &amp; Awa'),'Member names are escaped without losing Unicode');

// entry.js projects identityPerson.name into the shared first_name header contract.
const staff=header({id:'haseeb',kind:'staff',role:'ceo',name:'Haseeb',first_name:'Haseeb',profile_slug:'cv-haseeb',photo:'/communiverse/_public/avatar/cv-haseeb?v=2'});
check(hasHref(staff,'/communiverse/workspace/'),'Staff open their existing workspace');
check(!hasHref(staff,'/communiverse/profile/'),'Staff do not get the public member profile route');
check(staff.includes('<img')&&staff.includes('src="/communiverse/_public/avatar/cv-haseeb?v=2"'),'Staff use their shared photo in the header');
check(staff.includes('Haseeb'),'The staff name is visible');
check(!hasHref(staff,'/communiverse/join/')&&!hasHref(staff,'/communiverse/sign-in/'),'Authenticated staff have no redundant Join or Sign in actions');
check((staff.match(/class="cv-profile-chip"/g)||[]).length===1,'The staff header contains one account chip');

const escaped=header({id:'haseeb',kind:'staff',name:'<Haseeb & "CEO">',first_name:'<Haseeb & "CEO">',photo:'/communiverse/_public/avatar/cv-haseeb?v=2&variant=small'});
check(escaped.includes('&lt;Haseeb &amp; &quot;CEO&quot;&gt;'),'Staff names are escaped for HTML');
check(!escaped.includes('<Haseeb'),'Staff names cannot become markup');
check(escaped.includes('v=2&amp;variant=small'),'Photo URL attributes are escaped');
const privateContact=header({id:'haseeb',kind:'staff',name:'Haseeb',first_name:'Haseeb',photo:'/communiverse/_public/avatar/cv-haseeb',email:'private-fixture-contact@example.invalid',phone:'+0000000000'});
check(!privateContact.includes('private-fixture-contact')&&!privateContact.includes('+0000000000'),'Private contacts are not rendered in the public header');

console.log(JSON.stringify({assertions,passed:true,source:path.relative(root,sourcePath)}));
