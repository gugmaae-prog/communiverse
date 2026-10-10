export function cleanDisplay(value){
 return String(value??'')
  .replace(/[0-9#*]\uFE0F?\u20E3/gu,'')
  .replace(/\p{Extended_Pictographic}(?:[\uFE0E\uFE0F]|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:[\uFE0E\uFE0F]|\p{Emoji_Modifier})?)*/gu,s=>['©','®','™'].includes(s)?s:'')
  .replace(/\p{Regional_Indicator}{1,2}|\p{Emoji_Presentation}/gu,'')
  .replace(/[\u2190-\u21FF\u23E9-\u23FA\u25B2-\u25C3\u2794-\u27FF\u2900-\u297F\u2713\u2714](?:\uFE0F)?/gu,'');
}
