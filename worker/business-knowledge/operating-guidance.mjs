/* Curated workflow guidance is neither company policy nor evidence of a completed action. */
export function operatingGuidance(query, guides, checkedAt) {
  const q=String(query||'').toLowerCase().slice(0,2000);
  return guides.map(guide=>({guide,score:guide.terms.reduce((n,term)=>n+(new RegExp('\\b'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(q)?term.includes(' ')?5:2:0),0)}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(({guide})=>({
      id:guide.id,title:guide.title,summary:guide.summary,questions:guide.questions,steps:guide.steps,
      status:'general-guidance',authority:'General operating guidance; not company policy, approved terms, or a live record.',
      source:{collection:'communiverse_operating_guides',id:guide.id,title:guide.title,status:'general-guidance',version:'20261011',checkedAt},
    }));
}
