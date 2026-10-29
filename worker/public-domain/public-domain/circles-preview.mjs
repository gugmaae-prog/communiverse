// Keep the full catalogue intact. A linked work outside the first three takes
// the third preview slot, so even a direct artwork URL never opens a fourth.
export function circlePreview(works=[],selectedId=null){
 const shown=works.slice(0,3),selected=works.find(w=>w.id===selectedId);
 if(selected&&!shown.some(w=>w.id===selectedId))shown.splice(2,1,selected);
 return shown;
}
