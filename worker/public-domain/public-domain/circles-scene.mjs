// Collision-free rectangle packing. The selected portrait is fixed first; other
// entities retain their preferred positions where space allows. Overflow grows
// the document, never compresses targets or places one card over another.
export function circleScene(width, minimumHeight, entities) {
 const pad=12,gap=28,placed=[],positions={};let height=Math.max(240,minimumHeight);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const clear=r=>placed.every(p=>r.x+r.w+gap<=p.x||p.x+p.w+gap<=r.x||r.y+r.h+gap<=p.y||p.y+p.h+gap<=r.y);
 for(const e of entities){
  const w=Math.min(e.w,width-pad*2),h=e.h,px=clamp(e.x,pad,width-pad-w),py=Math.max(pad,e.y);
  let r={x:px,y:py,w,h};height=Math.max(height,e.fixed?py+h+pad:0);
  if(!e.fixed){
   let found=null;
   for(let attempt=0;!found&&attempt<100;attempt++){
    const xs=new Set([pad,width-pad-w,px]),ys=new Set([pad,py]);
    for(const p of placed){[p.x-w-gap,p.x,p.x+p.w-w,p.x+p.w+gap].forEach(x=>xs.add(x));[p.y-h-gap,p.y,p.y+p.h-h,p.y+p.h+gap].forEach(y=>ys.add(y));}
    let score=Infinity;
    for(const y of ys)for(const x of xs){
     if(x<pad||y<pad||x+w>width-pad+.01||y+h>height-pad+.01)continue;
     const candidate={x,y,w,h};if(!clear(candidate))continue;
     const distance=(x-px)**2+(y-py)**2*1.15;
     if(distance<score){found=candidate;score=distance;}
    }
    if(!found)height+=Math.max(120,h+gap);
   }
   if(!found)throw new Error('Circle scene could not find clear space');r=found;
  }
  positions[e.id]=r;placed.push(r);height=Math.max(height,r.y+r.h+pad);
 }
 return {positions,height,gap};
}
