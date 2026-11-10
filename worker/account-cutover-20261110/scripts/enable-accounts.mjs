// Keep the exact captured Worker as an immutable input. This patch removes only
// its public account pause when the existing two-part branded cutover gate is on.
const unique = (source, before, after, label) => {
  if (source.split(before).length !== 2) throw Error(`Unexpected ${label} anchor`);
  return source.replace(before, after);
};

export function enableAccounts(source) {
  source = unique(
    source,
    'if(pausedAccountPage(request)||pausedAccountAPI(request))return accountPausedResponse(request);',
    'let accountReady=accountConfiguration(env).enabled;if(!accountReady&&(pausedAccountPage(request)||pausedAccountAPI(request)))return accountPausedResponse(request);',
    'account pause',
  );
  source = unique(
    source,
    'if(isPublicExperience(request))return accountPausedSupport(await footerResponse(await publicExperience.fetch(request,env,ctx),request),request);',
    'if(isPublicExperience(request)){let publicResponse=await footerResponse(await publicExperience.fetch(request,env,ctx),request);return accountReady?publicResponse:accountPausedSupport(publicResponse,request)}',
    'public response',
  );
  source = unique(
    source,
    'return accountPageRequest(request)&&response.status>=500?footerResponse(accountFailure(request),request):accountPausedSupport(await footerResponse(response,request),request)',
    'return accountPageRequest(request)&&response.status>=500?footerResponse(accountFailure(request),request):accountReady?footerResponse(response,request):accountPausedSupport(await footerResponse(response,request),request)',
    'account response',
  );
  source = unique(
    source,
    'try{let response=await entry_default.fetch(request,env,ctx);return accountPageRequest(request)',
    'try{let response=await(accountReady?application:entry_default).fetch(request,env,ctx);return accountPageRequest(request)',
    'ready router',
  );
  source = unique(
    source,
    'core.has(endpoint3)?api(r,dataEnv,ctx):first_render_gateway_default.fetch(r,scoped,ctx)',
    'core.has(endpoint3)?api(r,dataEnv,ctx):/^\\/communiverse\\/(?:sign-in|signin|join|workspace|profile|onboarding|auth)(?:\\/|$)/.test(new URL(r.url).pathname)?(()=>{let legacyRoute=new URL(r.url);if(!/^\\/communiverse\\/auth(?:\\/|$)/.test(legacyRoute.pathname))legacyRoute.host="espacios.me";return scoped.MARKETPLACE.fetch(new Request(legacyRoute,r))})():first_render_gateway_default.fetch(r,scoped,ctx)',
    'account service route',
  );
  return source;
}
