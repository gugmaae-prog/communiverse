// A stable editorial field reserves space for surrounding artwork on wide
// screens. Narrow views use measured staggered bands and grow down the page.
export function circleLayout(width,_height,count){
 if(width>=1280&&count>=8){
  const diameter=84,w=128,h=132,pad=12,span=width-2*(pad+w/2),left=pad+w/2;
  const slots=[[0,80],[.136,80],[.47,60],[.864,60],[1,60],[.864,224],[1,314],[.864,492],[1,656],[.526,492],[.39,492],[.254,492],[.126,656],[.5,260]];
  const nodes=slots.slice(0,count).map(([t,y])=>{const x=left+span*t,top=y-50;return {x,y,left:x-w/2,top,w,h,row:0};});
  let y=820;const capacity=Math.max(1,Math.floor((width-24+24)/(w+24)));
  for(let start=14;start<count;start+=capacity){const n=Math.min(capacity,count-start);for(let i=0;i<n;i++){const x=n===1?width/2:left+span*i/(n-1),top=y+(i%2)*28;nodes.push({x,y:top+50,left:x-w/2,top,w,h,row:1+Math.floor((start-14)/capacity)});}y+=h+80;}
  return {nodes,rows:[],diameter,core:null,height:Math.max(740,...nodes.map(n=>n.top+n.h+24))};
 }
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
