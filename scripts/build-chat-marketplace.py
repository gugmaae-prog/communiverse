"""Add floating chat heads to a verified retained marketplace, preserving historical assets."""
import hashlib,json,pathlib,shutil,sys
repo=pathlib.Path(__file__).resolve().parents[1];snapshot=pathlib.Path(sys.argv[1]).resolve();out=pathlib.Path(sys.argv[2]).resolve();manifest=json.loads((snapshot/'manifest.json').read_text())
assert len(manifest)==122,'Reconcile the production module inventory before building'
for m in manifest:assert hashlib.sha256((snapshot/'original'/m['name']).read_bytes()).hexdigest()==m['sha256']
assert 'social-chat-heads.txt' not in {m['name'] for m in manifest},'Chat release already present; reconcile before rebuilding'
shutil.copytree(snapshot/'original',out,dirs_exist_ok=True)
def replace(s,a,b):
 assert s.count(a)==1,'Ambiguous retained source transform: '+a[:80]
 return s.replace(a,b)
p=out/'social-entry.js';s=p.read_text();s=replace(s,"import NAV_SCRIPT from './social-navigation.txt';", "import CHAT_SCRIPT from './social-chat-heads.txt';import CHAT_STYLE from './social-chat-style.txt';import CHAT_WORKSPACE from './social-workspace-chat.txt';import NAV_SCRIPT from './social-navigation.txt';")
route=" if(path==='/communiverse/_public/20261011-chat-heads.js'||path==='/communiverse/_public/20261011-workspace-chat-heads.js'){if(!read.has(request.method))return new Response('Method not allowed',{status:405});return new Response(request.method==='HEAD'?null:path.endsWith('workspace-chat-heads.js')?CHAT_WORKSPACE:CHAT_SCRIPT,{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});}\n"
s=replace(s," if(path==='/communiverse/_public/20261011-navigation.js')",route+" if(path==='/communiverse/_public/20261011-navigation.js')")
s=replace(s,'${STYLE}${removalCSS}','${STYLE}${CHAT_STYLE}${removalCSS}')
s=replace(s,'<script defer src="/communiverse/_public/20261011-navigation.js"></script>','<script defer src="/communiverse/_public/20261011-navigation.js"></script><script defer src="/communiverse/_public/20261011-chat-heads.js"></script>')
s=replace(s,'<script defer src="${PREFIX}-workspace.js"></script>','<script defer src="/communiverse/_public/20261011-workspace-chat-heads.js"></script>');p.write_text(s)
s=(snapshot/'original/social-workspace.txt').read_text();s=replace(s,"async function openThread(id,reply=''){", "async function openThread(id,reply=''){if(window.cvChat){$('#cv-ws-dialog').close();return window.cvChat.open(id,{reply});}")
s=replace(s,"function threadForm(selected=[]){", "function threadForm(selected=[]){if(window.cvChat){$('#cv-ws-dialog').close();return window.cvChat.compose(selected);}")
(out/'social-workspace-chat.txt').write_text(s)
shutil.copyfile(repo/'worker/chat-heads/client.js',out/'social-chat-heads.txt');shutil.copyfile(repo/'worker/chat-heads/style.css',out/'social-chat-style.txt')
for name in ['social-workspace-chat.txt','social-chat-heads.txt','social-chat-style.txt']:manifest.append({'name':name,'type':'text/plain','sha256':hashlib.sha256((out/name).read_bytes()).hexdigest()})
(snapshot/'candidate-manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({'modules':len(manifest),'originalModulesPreserved':121,'modified':['social-entry.js'],'new':['social-workspace-chat.txt','social-chat-heads.txt','social-chat-style.txt']}))
