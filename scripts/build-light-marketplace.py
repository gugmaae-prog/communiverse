"""Pin the Communiverse light theme without replacing retained or cached assets."""
import hashlib, json, pathlib, shutil, sys

repo = pathlib.Path(__file__).resolve().parents[1]
snapshot = pathlib.Path(sys.argv[1]).resolve()
out = pathlib.Path(sys.argv[2]).resolve()
manifest = json.loads((snapshot / 'manifest.json').read_text())
assert len(manifest) == 125, 'Reconcile the current retained module inventory first'
expected = {
    'social-entry.js': '9c9421210fe99d68870c94293ed2fa597ab9e56ac59ea89b4dc53f4ff63b815e',
    'social.css': '3c3c7850db6fa536e548e75292fda2cdb6645b905e597822e5680e8c2cf04620',
    'social-focus.txt': '1e221c1c5f4548dc738f7374757e6aef6dff550f6965f22008889bdc65ff7f5e',
}
for m in manifest:
    digest = hashlib.sha256((snapshot / 'original' / m['name']).read_bytes()).hexdigest()
    assert digest == m['sha256'], 'Snapshot changed: ' + m['name']
    if m['name'] in expected:
        assert digest == expected[m['name']], 'Reconcile changed ' + m['name']
shutil.copytree(snapshot / 'original', out, dirs_exist_ok=True)

def replace(s, a, b):
    assert s.count(a) == 1, 'Ambiguous retained source transform: ' + a[:80]
    return s.replace(a, b)

css = (out / 'social.css').read_text()
marker = '/* Communiverse shared web glass system.'
assert css.count(marker) == 1
# The shared system is the final, inline stylesheet; all earlier styles stay intact.
css = css[:css.index(marker)] + (repo / 'worker/design-system/glass.css').read_text()
(out / 'social.css').write_text(css)

focus = (out / 'social-focus.txt').read_text()
focus = replace(focus, 'themeMeta.content = dark.matches ? "#161c28" : "#f3f6fb";',
                'themeMeta.content = document.documentElement.hasAttribute("data-cv-social") ? "#edf2f8" : dark.matches ? "#161c28" : "#f3f6fb";')
(out / 'social-light-focus.txt').write_text(focus)

entry = (out / 'social-entry.js').read_text()
entry = replace(entry, "import CHAT_SCRIPT from './social-chat-heads.txt';",
                "import LIGHT_FOCUS from './social-light-focus.txt';import CHAT_SCRIPT from './social-chat-heads.txt';")
route = " if(path==='/communiverse/_public/20261011-light-focus.js'){if(!read.has(request.method))return new Response('Method not allowed',{status:405});return new Response(request.method==='HEAD'?null:LIGHT_FOCUS,{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});}\n"
entry = replace(entry, " if(path==='/communiverse/_public/20261011-chat-heads.js'", route + " if(path==='/communiverse/_public/20261011-chat-heads.js'")
entry = replace(entry, "el.setAttribute(key,PREFIX+'-focus.js')", "el.setAttribute(key,'/communiverse/_public/20261011-light-focus.js')")
entry = replace(entry, ".on('head',{element(el){el.append(`<style data-cv-social=", ".on('meta[name=\"theme-color\"]',{element(el){el.remove()}}).on('head',{element(el){el.append(`<meta name=\"theme-color\" content=\"#edf2f8\"><style data-cv-social=")
(out / 'social-entry.js').write_text(entry)
manifest.append({'name': 'social-light-focus.txt', 'type': 'text/plain'})
for m in manifest:
    m['sha256'] = hashlib.sha256((out / m['name']).read_bytes()).hexdigest()
(snapshot / 'candidate-manifest.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps({'modules': len(manifest), 'originalModulesPreserved': 123,
                  'modified': ['social.css', 'social-entry.js'], 'new': ['social-light-focus.txt']}))
