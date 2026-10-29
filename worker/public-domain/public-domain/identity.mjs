import {PORTRAITS} from './retained/artist-portrait-policy.mjs';
import {portraits} from './portrait-refresh.mjs';
export const identities=Object.fromEntries(Object.entries({...PORTRAITS,...portraits}).map(([id,p])=>[id,{url:p.url,variants:p.variants,position:p.position||'50% 50%',previousHash:p.previousHash}]));
for(const id of ['keiffer','luna'])identities['cv-'+id]={url:'/communiverse/_circles/20261022-v1/'+id+'-1024.webp',position:'50% 50%'};
export const peopleText=s=>s.replace(/\bCool Kids\b/gi,'People');
export const roleCards=`<div class="cv-role-grid" role="group" aria-label="Choose your role"><button type="button" data-cv-role="people" aria-pressed="false"><strong>People</strong><span>Discover art, join clubs and meet people.</span></button><button type="button" data-cv-role="artist" aria-pressed="false"><strong>Artist</strong><span>Share your work and build your artist profile.</span></button><button type="button" data-cv-role="ambassador" aria-pressed="false"><strong>Ambassador</strong><span>Connect people and help shape your local art scene.</span></button></div><section class="cv-onboarding-guide" id="cv-onboarding-guide" hidden aria-live="polite"></section>`;
