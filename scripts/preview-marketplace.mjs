import { createServer } from 'node:http';
import marketplace from '../worker/marketplace/index.js';

const port = Number(process.env.PORT || 43125);
createServer(async (incoming, outgoing) => {
  const url = new URL(incoming.url || '/', `http://127.0.0.1:${port}`);
  if (url.pathname.startsWith('/communiverse/_public/media/') || url.pathname.startsWith('/communiverse/media/gallery-20261007/')) {
    outgoing.writeHead(302, { Location: `https://espacios.me${url.pathname}` });
    outgoing.end();
    return;
  }
  if (url.pathname === '/communiverse/api/waitlist') {
    outgoing.writeHead(501, {'Content-Type': 'application/json'});
    outgoing.end(JSON.stringify({error:'Local preview does not submit requests.'}));
    return;
  }
  const request = new Request(url, {method:incoming.method,headers:incoming.headers});
  try {
    const response = await marketplace.fetch(request);
    outgoing.writeHead(response.status,Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    outgoing.writeHead(500);
    outgoing.end('Preview error');
  }
}).listen(port,'127.0.0.1',()=>console.log(`Communiverse marketplace preview: http://127.0.0.1:${port}/communiverse/`));
