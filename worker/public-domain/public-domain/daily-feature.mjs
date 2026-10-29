// Dubai stays on UTC+4 year-round. Use the same calendar day on server and client.
export function featuredArtistIndex(now,count){
 if(!Number.isInteger(count)||count<1)throw new RangeError('An artist is required');
 const day=Math.floor((Number(now)+4*60*60*1000)/(24*60*60*1000));
 return ((day%count)+count)%count;
}
