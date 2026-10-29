// Full travel is reserved for clear corridors. Otherwise a short local settle
// stays inside the scene's 28px gutters instead of flying through another card.
export function circleMotion(from,to,obstacles=[]){
 if(!from)return {dx:0,dy:8,mode:'enter'};
 const dx=from.x-to.x,dy=from.y-to.y;
 const sweep={x:Math.min(from.x,to.x),y:Math.min(from.y,to.y),w:Math.max(from.x+to.w,to.x+to.w)-Math.min(from.x,to.x),h:Math.max(from.y+to.h,to.y+to.h)-Math.min(from.y,to.y)};
 const clear=obstacles.every(p=>sweep.x+sweep.w+20<=p.x||p.x+p.w+20<=sweep.x||sweep.y+sweep.h+20<=p.y||p.y+p.h+20<=sweep.y);
 return clear?{dx,dy,mode:'glide'}:{dx:Math.max(-8,Math.min(8,dx)),dy:Math.max(-8,Math.min(8,dy)),mode:'settle'};
}
