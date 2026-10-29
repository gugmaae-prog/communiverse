import {platformCopy,brandResponse} from './brand-copy.mjs';
import STYLE from './identity-style.css.txt';
import CLIENT from './identity-client.js.txt';
import {identities,peopleText,roleCards} from './identity.mjs';
import {CLIENT_BASE,ORIGIN,OLD,link} from './urls.mjs';
export {CLIENT};
const portraits={
 '.cv-person-photo>img':'orbit',
 '#cv-social-header .cv-profile-chip img,.cv-avatar img,.cv-team-avatar img,img.cv-ws-avatar':'small',
 '.cv-card-artist img,.cv-work-artist img,.cv-artwork-maker img,.cv-artwork-context img':'medium',
 '.cv-featured-artist img,.cv-event-artist img,.cv-event-person img,.cv-workshop-host img':'card',
 '.cv-artist-profile>img,.cv-artist-hero img,.cv-artist-portrait,.cv-photo-form img,.cv-profile-hero img':'profile'
};
export async function identityResponse(response,request){
 if(!['GET','HEAD'].includes(request.method)||!response.headers.get('Content-Type')?.includes('text/html'))return response;
 const original=await response.text(),url=new URL(request.url);if(!url.hostname.endsWith('communiverseclubs.com')&&!url.pathname.startsWith('/communiverse/'))return new Response(original,response);const html=platformCopy(peopleText(original));if(!html.includes('cv-social-header')&&!html.includes('cv-workspace'))return new Response(html,response);
 const h=new Headers(response.headers);for(const k of ['content-length','content-encoding','etag'])h.delete(k);h.set('Cache-Control','private, no-store');
 const authPath=new URL(request.url).pathname;
 const oldHost=new URL(request.url).origin===OLD;
 const recovery=/\/sign-in\/?$/.test(authPath)?`<script>if(/^[a-f0-9]{64}$/.test(location.hash.slice(1))){window.__cvRecoveryToken=location.hash.slice(1);history.replaceState(null,'',location.pathname+location.search);}</script>`:'';
 let rewriter=new HTMLRewriter().on('head',{element(e){e.prepend(recovery+'<style data-cv-identity>'+STYLE+'</style><script type="application/json" id="cv-identity-registry">'+JSON.stringify(identities).replaceAll('<','\\u003c')+'</script><script defer src="'+CLIENT_BASE+'identity.js"></script>',{html:true});}})
 .on('#cv-social-header nav a[href*="artists"]',{element(e){e.remove();}})
 .on('#cv-social-header a[href],footer a[href]',{element(e){if(oldHost)e.setAttribute('href',new URL(link(e.getAttribute('href'),ORIGIN),ORIGIN).href);}})
 .on('.cv4-search-symbol,.cv4-ai-sparkle',{element(e){e.setAttribute('width','18');e.setAttribute('height','18');}})
 .on('#cv-social-join',{element(e){e.before('<div class="cv-sso-options"><a class="cv-quiet-button" href="/communiverse/auth/google">Continue with Google</a><a class="cv-quiet-button" href="/communiverse/auth/linkedin">Continue with LinkedIn</a></div><p class="cv-muted">Or create an account with email and password.</p>',{html:true});}})
 .on('.cv-role-grid',{element(e){e.replace(roleCards,{html:true});}})
 .on('#cv-account-login input[name="username"]',{element(e){e.setAttribute('maxlength','254');e.setAttribute('placeholder','Email or username');}})
 .on('#cv-account-login label',{text(t){if(t.text.trim()==='Username')t.replace(t.text.replace('Username','Email or username'));}})
 .on('.cv-account-page > p',{text(t){if(t.text.includes('Or use your username and password'))t.replace('Or sign in with email and password');}})
 .on('.cv-account-recovery p',{element(e){e.setInnerContent('Open the link we send to your email, then choose a new password.');}});
 for(const[selector,size]of Object.entries(portraits))rewriter=rewriter.on(selector,{element(e){e.setAttribute('data-cv-avatar',size);}});
 return brandResponse(rewriter.transform(new Response(html,{status:response.status,headers:h})));
}
