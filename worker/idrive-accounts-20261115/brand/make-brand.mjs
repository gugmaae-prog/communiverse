import { writeFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);

// The monogram is code-native so the cutouts stay sharp at favicon size.
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 100 750 650" role="img" aria-label="Communiverse mark"><path fill="#050505" fill-rule="evenodd" d="M0 0H750V750H0Z M164 750V347a66.5 66.5 0 0 1 133 0V750Z M454 750V347a66.5 66.5 0 0 1 132 0V750Z"/></svg>`;

await writeFile(new URL('mark.svg', root), mark);
console.log('Wrote Communiverse monogram SVG');
