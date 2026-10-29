export const artworkBatchSize=18;
export function interleaveArtworks(records){const artists=new Map();for(const work of records){const key=work.artist||work.artistName||work.id;if(!artists.has(key))artists.set(key,[]);artists.get(key).push(work);}const result=[];while(result.length<records.length)for(const queue of artists.values())if(queue.length)result.push(queue.shift());return result;}
