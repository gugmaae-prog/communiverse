// A deterministic packing plan shared by the browser and geometry tests.
// The central space is reserved before selection, so nobody is pushed out of view.
export function circleLayout(width, height, count) {
 const pad=6, gap=8;
 const core=width>=700&&height>=380?{x:width/2,y:height/2,w:Math.min(440,width*.48),h:240}:null;
 const separated=(a,b)=>Math.abs(a.x-b.x)>=(a.w+b.w)/2+gap||Math.abs(a.y-b.y)>=(a.h+b.h)/2+gap;
 if(!count)return {nodes:[],core,diameter:44};
 if(!core&&count>=3&&count<=7){
  const portrait=height>=width;
  for(let diameter=138;diameter>=44;diameter-=2){
   const w=Math.max(56,diameter+8),h=diameter+24,nodes=[];
   if(w+2*pad>width||h+2*pad>height)continue;
   for(let i=0;i<count;i++){
    const t=i/(count-1),across=(i%2?.90:.10)+Math.sin(i*1.8)*.045;
    nodes.push({x:pad+w/2+(width-2*pad-w)*(portrait?across:t),y:pad+h/2+(height-2*pad-h)*(portrait?t:across),w,h});
   }
   if(nodes.every((a,i)=>nodes.slice(i+1).every(b=>separated(a,b))))return {nodes,core:null,diameter};
  }
 }
 if(!core){
  let best=null;
  for(let rows=1;rows<=count;rows++){
   const cols=Math.ceil(count/rows),cw=(width-2*pad)/cols,ch=(height-2*pad)/rows;
   const diameter=Math.floor(Math.min(138,cw-gap-8,ch-gap-24));
   if(diameter<44||cw<56+gap)continue;
   if(!best||diameter>best.diameter)best={rows,cols,cw,ch,diameter};
  }
  if(best){
   const {rows,cw,ch,diameter}=best,nodes=[],w=Math.max(56,diameter+8),h=diameter+24;
   for(let row=0;row<rows;row++){
    const n=Math.floor((row+1)*count/rows)-Math.floor(row*count/rows),step=(width-2*pad)/n;
    for(let col=0;col<n;col++){
     const dx=Math.max(0,(step-w-gap)/2)*Math.sin(row*2.4+col*1.7)*.78;
     const dy=Math.max(0,(ch-h-gap)/2)*Math.sin(col*2.2+row*1.3)*.82;
     nodes.push({x:pad+step*(col+.5)+dx,y:pad+ch*(row+.5)+dy,w,h});
    }
   }
   return {nodes,core:null,diameter};
  }
 }
 const max=Math.min(138,width/(count<4?3:4),height/(count<7?3:4));
 for(let diameter=Math.floor(max);diameter>=44;diameter-=2){
  const w=Math.max(56,diameter+8),h=diameter+24,candidates=[];
  const left=pad+w/2,top=pad+h/2,right=width-left,bottom=height-top;
  for(let row=0;row<=20;row++)for(let col=0;col<=22;col++){
   const x=left+(right-left)*col/22,y=top+(bottom-top)*row/20;
   const p={x,y,w,h};if(!core||separated(p,core))candidates.push(p);
  }
  // Farthest-point sampling spreads circles across the whole free area. The
  // deterministic perturbation breaks rows without changing between clicks.
  let best=[];
  for(const seed of [0,7,17,29]){
   const nodes=[];let pool=candidates.slice();
   while(pool.length&&nodes.length<count){
    let chosen=0,score=-Infinity;
    for(let i=0;i<pool.length;i++){
     const p=pool[i],distance=nodes.length?Math.min(...nodes.map(n=>((p.x-n.x)/w)**2+((p.y-n.y)/h)**2)):((p.x-width*.26)**2+(p.y-height*.22)**2)*-1;
     const value=distance+Math.sin(p.x*.07+p.y*.11+seed)*.07;
     if(value>score){score=value;chosen=i;}
    }
    const p=pool[chosen];nodes.push(p);pool=pool.filter(q=>separated(p,q));
   }
   if(nodes.length>best.length)best=nodes;
   if(nodes.length===count)break;
  }
  if(best.length===count){
   // Stable clockwise order is readable with both keyboard and pointer.
   best.sort((a,b)=>Math.atan2(a.y-height/2,a.x-width/2)-Math.atan2(b.y-height/2,b.x-width/2));
   return {nodes:best,core,diameter};
  }
 }
 // Very short windows or large text zoom retain accessible targets; the page
 // can scroll rather than shrinking faces and controls below 44px.
 const larger=circleLayout(width,height+40,count);
 return {...larger,height:larger.height||height+40};
}
