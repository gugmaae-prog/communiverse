/* Browser-only read/synthetic UI tests. Do not send AI requests or submit forms. */
(()=>{'use strict';
 const list=[],add=(name,value,detail='')=>list.push({name,pass:!!value,detail:String(detail).slice(0,120)});
 const pause=t=>new Promise(r=>setTimeout(r,t));
 const wait=async(fn,timeout=6500)=>{const start=Date.now();while(Date.now()-start<timeout){const v=fn();if(v)return v;await pause(60)}return null};
 async function run(){
  const fixture=location.pathname.endsWith('__cvsearch_v4_fixture');
  const pick=[
   '#cv-feed-search','#cv-artist-search','#cv-product-search',
   '#cv-events-filters input[type=search][name=q]',
   '#cv-circle-filters input[type=search][name=q]',
   '.cv-plug-browse input[type=search]'
  ];
  try{
   const client=await wait(()=>window.__cvSearchV4?.ready,6000);
   add('Shared search enhancement initialized',!!client);
   const search=await wait(()=>document.querySelector(pick.join(',')),6500);
   add('Original search input retained',!!search);
   if(search){
    const label=search.closest('label'),wrap=await wait(()=>label?.querySelector(':scope > .cv4-search-inner'),6000);
    add('Search input has one structured wrapper',!!wrap&&label.querySelectorAll(':scope>.cv4-search-inner').length===1);
    add('Original input stays within its label',!!wrap&&wrap.contains(search));
    add('Accessible search name is present',!!search.getAttribute('aria-label')||!!label?.textContent.trim());
    add('Magnifier uses subtle, non-emoji vector icon',!!wrap?.querySelector('svg.cv4-search-symbol'));
    const rect=wrap?.getBoundingClientRect(),styles=wrap?getComputedStyle(wrap):null;
    add('Search field consistent 52px height',!!rect&&rect.height>=49&&rect.height<=55,rect?.height);
    add('Search bar respects available parent width',!!rect&&rect.width<=label.getBoundingClientRect().width+2);
    add('Search field contains no horizontal overflow',!!wrap&&wrap.scrollWidth<=wrap.clientWidth+2);
    const parent=label?.parentElement,toolbar=parent?.classList.contains('cv4-toolbar');
    add('Contextual filters share the toolbar layout',toolbar);
    const filters=[...(parent?.querySelectorAll('select')||[])];
    if(filters.length){
     add('Existing native filter selects are preserved',filters.every(x=>x.options.length>0));
     const tall=filters.map(x=>x.getBoundingClientRect().height);
     add('Filter control heights are aligned',tall.every(h=>h>=49&&h<=55),JSON.stringify(tall));
     if(parent&&innerWidth>=800&&filters.length<3){
      const fr=filters[0].getBoundingClientRect();
      add('Desktop search and filter share a row',Math.abs(fr.top-rect.top)<6,'search='+rect.top+',filter='+fr.top);
     }
    }
    const input=search;
    const ai=wrap?.querySelector('button.cv4-ai-button');
    if(ai&&!ai.hidden){
     const ib=ai.getBoundingClientRect(),wr=wrap.getBoundingClientRect(),as=getComputedStyle(ai);
     add('AI action stays completely inside its search field',ib.left>=wr.left+2&&ib.right<=wr.right-2&&ib.top>=wr.top+2&&ib.bottom<=wr.bottom-2,'AI '+ib.x.toFixed(1)+','+ib.y.toFixed(1)+'..'+ib.right.toFixed(1)+','+ib.bottom.toFixed(1)+' field '+wr.x.toFixed(1)+','+wr.y.toFixed(1)+'..'+wr.right.toFixed(1)+','+wr.bottom.toFixed(1)+' label '+label.getBoundingClientRect().width.toFixed(1));
     add('AI action is a compact 44px control',ib.width>=40&&ib.width<=48&&ib.height>=30&&ib.height<=38,ib.width+'x'+ib.height);
     add('AI action does not add another outlined pill',as.borderTopWidth==='0px'&&as.boxShadow==='none'&&as.backgroundColor==='rgba(0, 0, 0, 0)','border='+as.borderTopWidth+', shadow='+as.boxShadow+', bg='+as.backgroundColor);
     add('AI action has small restrained type',parseFloat(as.fontSize)<=12,'font='+as.fontSize);
     add('AI action icon and text are not cut off',!!ai.querySelector('svg.cv4-ai-sparkle')&&ai.textContent.trim()==='AI'&&ai.scrollWidth<=ai.clientWidth+2);
     add('AI and search input do not overlap',!!input&&input.getBoundingClientRect().right<=ib.left+2);
    }
    const panels=label?.querySelectorAll(':scope > .cv-ai-search-results')||[];
    if(fixture&&panels.length&&wrap){
      const pop=panels[0],wasHidden=pop.hidden;pop.hidden=false;
      const frame=pop.getBoundingClientRect(),wr=wrap.getBoundingClientRect();
      add('AI result list aligns below search field',frame.top>=wr.bottom+4&&frame.left>=wr.left-3&&frame.right<=wr.right+3,'left='+frame.left+', right='+frame.right);
      pop.hidden=wasHidden;
    }
    const searchToolbar=label?.parentElement;
    if(searchToolbar){
      const direct=[...searchToolbar.children].filter(el=>el.tagName==='LABEL'&&getComputedStyle(el).display!=='none');
      const intersects=(a,b)=>a.left<b.right-3&&b.left<a.right-3&&a.top<b.bottom-3&&b.top<a.bottom-3;
      const overlap=direct.some((a,i)=>direct.slice(i+1).some(b=>intersects(a.getBoundingClientRect(),b.getBoundingClientRect())));
      add('No search or filter controls overlap',!overlap);
    }
    add('No search layout causes horizontal page scrolling',document.documentElement.scrollWidth<=innerWidth+3,'extra px='+(document.documentElement.scrollWidth-innerWidth));
    if(fixture){
     const btn=await wait(()=>wrap?.querySelector('button.cv4-ai-button'),3000);
     add('Delayed original AI button moves into input row',!!btn);
     add('AI button retains accessible semantic label',btn?.getAttribute('aria-label')==='Search with AI');
     if(btn){btn.click();add('Original AI button event listener survives',window.__fixtureAIClicked===1)}
     search.value='a material';search.dispatchEvent(new Event('input',{bubbles:true}));
     add('Original keyword search event listener survives',window.__fixtureInputEvents===1);
     const s=document.querySelector('#cv-feed-region');if(s){s.value='uae';s.dispatchEvent(new Event('change',{bubbles:true}));add('Existing region select remains editable',s.value==='uae')}
     add('Original artwork gallery remains present',document.querySelectorAll('#cv-feed .tile').length===5);
    }else{
     const ai=wrap?.querySelector('button.cv4-ai-button');
     add('AI control integrates when available',!!ai||!label.querySelector(':scope>button.cv-ai-search-button'));
     const panel=label?.querySelector(':scope>.cv-ai-search-results');
     add('Existing AI results panel stays associated',!panel||panel.getAttribute('role')==='region');
    }
   }
  }catch(err){add('Unexpected script error',false,err?.message||String(err))}
  const tag=document.createElement('pre');tag.id='cv4-search-qa-report';tag.dataset.ok=String(list.every(x=>x.pass));tag.textContent=JSON.stringify({passed:list.filter(x=>x.pass).length,total:list.length,viewport:innerWidth,fixture,tests:list});document.body.appendChild(tag);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();