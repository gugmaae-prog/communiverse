// Members follow measured, alternating arcs. Added members extend the flow;
// there is no random sampling, force simulation or scroll-driven positioning.
export function circleLayout(width,_height,count){
 const pad=12,mobile=width<700,diameter=mobile?76:96;
 const w=Math.min(mobile?136:148,width-24),h=diameter+76,gap=24,bend=mobile?32:64;
 const capacity=Math.max(1,Math.min(8,Math.floor((width-2*pad+gap)/(w+gap)))),nodes=[],rows=[];
 let y=pad;
 for(let start=0,row=0;start<count;start+=capacity,row++){
  const n=Math.min(capacity,count-start);
  const inset=n===1?0:row%2?Math.min(mobile?16:64,Math.max(0,(width-2*pad-n*w-(n-1)*gap)/2)):0;
  const left=pad+inset,right=width-pad-inset-w;
  for(let i=0;i<n;i++){
   const t=n===1?.5:i/(n-1),wave=n===2?(row%2?1-t:t):row%2?1-4*t*(1-t):4*t*(1-t);
   const x=n===1?(width-w)/2:left+(right-left)*t,top=y+wave*bend;
   nodes.push({x:x+w/2,y:top+h/2,left:x,top,w,h,row});
  }
  const group=nodes.slice(start),first=group[0],last=group.at(-1),middle=(first.x+last.x)/2;
  const faceY=y+8+diameter/2,controlY=faceY+(row%2?-bend:bend)*2;
  rows.push({top:y,bottom:y+h+bend,path:n>1?'M '+first.x+' '+(first.top+8+diameter/2)+' Q '+middle+' '+controlY+' '+last.x+' '+(last.top+8+diameter/2):''});
  y+=h+bend+gap+8;
 }
 return {nodes,rows,diameter,core:null,height:Math.max(count?y-gap:120,120)};
}
