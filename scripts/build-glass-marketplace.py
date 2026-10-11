"""Patch a verified full retained marketplace export. Never replace it with the legacy checkout."""
import hashlib,json,pathlib,shutil,sys
repo=pathlib.Path(__file__).resolve().parents[1]
snapshot=pathlib.Path(sys.argv[1]).resolve()
out=pathlib.Path(sys.argv[2]).resolve()
manifest=json.loads((snapshot/'manifest.json').read_text())
assert len(manifest)==120,'Reconcile changed production module inventory first'
for m in manifest:
    assert hashlib.sha256((snapshot/'original'/m['name']).read_bytes()).hexdigest()==m['sha256']
expected={'social-entry.js':'764dd329c00ec0773516a6872154927c21bab24316798e3ee06771e02a070b10','social.css':'7f14b249f23f45db2dd080cf6698c664f2d44bf34552ab10158f0a7345124669','social.txt':'2608a8a00b6c12703ad58c368c7535f926180ead7d26612186f7d5e85cfb0b53'}
for f,sha in expected.items():assert hashlib.sha256((snapshot/'original'/f).read_bytes()).hexdigest()==sha,'Reconcile changed '+f
shutil.copytree(snapshot/'original',out,dirs_exist_ok=True)
def replace(s,a,b):
    assert s.count(a)==1,'Ambiguous source transform: '+a[:90]
    return s.replace(a,b)
entry=(out/'social-entry.js').read_text()
entry=replace(entry,"import CONTROLS_SCRIPT from './social-controls.txt';","import GLASS_SCRIPT from './social-glass.txt';import CONTROLS_SCRIPT from './social-controls.txt';")
entry=replace(entry," if(path===PREFIX+'-controls-20261011b.js')", " if(path==='/communiverse/_public/20261011-glass2.js'){if(!read.has(request.method))return new Response('Method not allowed',{status:405});return new Response(request.method==='HEAD'?null:GLASS_SCRIPT,{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});}\n if(path===PREFIX+'-controls-20261011b.js')")
entry=replace(entry,'<script defer src="${PREFIX}.js"></script>','<script defer src="${PREFIX}.js?v=20261011-glass"></script><script defer src="/communiverse/_public/20261011-glass2.js"></script>')
(out/'social-entry.js').write_text(entry)
with (out/'social.css').open('a') as f:f.write('\n'+(repo/'worker/design-system/glass.css').read_text())
shutil.copyfile(repo/'worker/design-system/glass.js',out/'social-glass.txt')
script=(out/'social.txt').read_text()
script=replace(script,'function tile(i){items.set(i.id,i);','function tile(i,omitMedia=false){items.set(i.id,i);')
start=script.index('function tile(');end=script.index('function invitation(',start)
tile=script[start:end]
tile=replace(tile,'${i.video?`<video data-film=', '${i.video&&!omitMedia?`<video data-film=')
tile=replace(tile,':i.image?`<img ${imageAttrs(i.image)}', ':i.image&&!omitMedia?`<img ${imageAttrs(i.image)}')
script=script[:start]+tile+script[end:]
script=replace(script,'async function loadFeed(reset=false){','function feedMediaKey(i){return i?.video||cached(i?.image||\'\').replace(/-(320|720|1280)\\.webp(?:\\?.*)?$/,\'-asset.webp\')}\nasync function loadFeed(reset=false){')
script=replace(script,"let markup='';for(const i of d.items){if(seen.has(i.id))continue;markup+=tile(i);seen.add(i.id);", "const mediaSeen=new Set([...seen].map(id=>feedMediaKey(items.get(id))).filter(Boolean));let markup='';for(const i of d.items){if(seen.has(i.id))continue;const media=feedMediaKey(i);markup+=tile(i,!!media&&mediaSeen.has(media));if(media)mediaSeen.add(media);seen.add(i.id);")
(out/'social.txt').write_text(script)
manifest.append({'name':'social-glass.txt','type':'text/plain','sha256':hashlib.sha256((out/'social-glass.txt').read_bytes()).hexdigest()})
(snapshot/'candidate-manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps({'modules':len(manifest),'changed':['social-entry.js','social.css','social.txt'],'added':['social-glass.txt'],'preserved':117}))
