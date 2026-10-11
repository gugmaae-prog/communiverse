"""Add distinct conversation avatars to the retained light-theme/chat runtime."""
import hashlib,json,pathlib,shutil,sys
repo=pathlib.Path(__file__).resolve().parents[1];snapshot=pathlib.Path(sys.argv[1]).resolve();out=pathlib.Path(sys.argv[2]).resolve();manifest=json.loads((snapshot/'manifest.json').read_text())
assert len(manifest)==126,'Reconcile the retained runtime first'
for m in manifest:assert hashlib.sha256((snapshot/'original'/m['name']).read_bytes()).hexdigest()==m['sha256']
assert hashlib.sha256((snapshot/'original/social-entry.js').read_bytes()).hexdigest()=='442e99489497c220749124c198fa4123232c7cc20c8f4c886cd130e0c8d36f0b'
shutil.copytree(snapshot/'original',out,dirs_exist_ok=True)
def replace(s,a,b):
 assert s.count(a)==1,'Ambiguous transform: '+a[:80]
 return s.replace(a,b)
s=(out/'social-entry.js').read_text();s=replace(s,"import LIGHT_FOCUS from './social-light-focus.txt';","import CONVERSATION_HEADS from './social-conversation-heads.txt';import LIGHT_FOCUS from './social-light-focus.txt';")
route=" if(path==='/communiverse/_public/20261012-conversation-heads.js'){if(!read.has(request.method))return new Response('Method not allowed',{status:405});return new Response(request.method==='HEAD'?null:CONVERSATION_HEADS,{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});}\n"
s=replace(s," if(path==='/communiverse/_public/20261011-light-focus.js')",route+" if(path==='/communiverse/_public/20261011-light-focus.js')")
s=replace(s,'<script defer src="/communiverse/_public/20261011-chat-heads.js"></script>','<script defer src="/communiverse/_public/20261012-conversation-heads.js"></script>');(out/'social-entry.js').write_text(s)
shutil.copyfile(repo/'worker/chat-heads/client.js',out/'social-conversation-heads.txt');manifest.append({'name':'social-conversation-heads.txt','type':'text/plain'})
for m in manifest:m['sha256']=hashlib.sha256((out/m['name']).read_bytes()).hexdigest()
(snapshot/'candidate-manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({'modules':len(manifest),'unchangedOriginalModules':125,'new':'social-conversation-heads.txt','modified':'social-entry.js'}))
