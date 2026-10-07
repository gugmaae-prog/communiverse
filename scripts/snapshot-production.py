#!/usr/bin/env python3
"""Read-only Cloudflare module snapshot. Never deploys or exports database/secret values."""
from __future__ import annotations
import email.policy
from email.parser import BytesParser
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = Path('production')
ACCOUNT = 'b1b843ec85bc39a3a4d370ba4f84f17a'
ENTRY = 'shared-plug-ui-20261007-entry.js'
SOURCES = {
    ENTRY: 'worker/releases/shared-plug-ui-20261007/entry.js',
    'shared-plug-ui-20261007.css': 'worker/releases/shared-plug-ui-20261007/shared-plug-ui-20261007.css',
    'shared-plug-ui-20261007.txt': 'worker/releases/shared-plug-ui-20261007/shared-plug-ui-20261007.txt',
}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def safe_name(name):
    p = PurePosixPath(name)
    if not name or p.is_absolute() or '..' in p.parts or '\\' in name or '\0' in name:
        raise RuntimeError('Unsafe module filename')
    return str(p)

def guard(data, name):
    patterns = [rb'(?:ghp_|github_pat_|sk_live_|sk-proj-)[A-Za-z0-9_\-]{24,}', rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', rb'xox[baprs]-[A-Za-z0-9\-]{24,}']
    if any(re.search(p, data) for p in patterns):
        raise RuntimeError('Possible credential; refusing snapshot: ' + name)
    if b'window.RAL_SRC = ' in data or b'window.RAL_SRC=' in data:
        raise RuntimeError('Possible internal payload; refusing snapshot: ' + name)

def capture():
    request = json.loads(Path('.github/production-sync-request.json').read_text())
    expected, live = request['version'], request['live_version']
    token = os.environ.get('CLOUDFLARE_API_TOKEN')
    if not token:
        raise RuntimeError('Missing repository Actions secret CLOUDFLARE_API_TOKEN; no Cloudflare reads performed')
    account = os.environ.get('CLOUDFLARE_ACCOUNT_ID') or ACCOUNT
    if account != ACCOUNT:
        raise RuntimeError('Cloudflare account mismatch')
    base = f'https://api.cloudflare.com/client/v4/accounts/{account}/workers/scripts/communiverse'
    def get(suffix, raw=False):
        req = urllib.request.Request(base + suffix, headers={'Authorization': 'Bearer ' + token, 'User-Agent': 'CommuniverseProductionSync/1'})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                data, headers = r.read(), r.headers
        except urllib.error.HTTPError as exc:
            raise RuntimeError(f'Cloudflare read failed: HTTP {exc.code} at {suffix}') from None
        if raw:
            return data, headers
        obj = json.loads(data)
        if not obj.get('success'):
            raise RuntimeError('Cloudflare rejected read: ' + suffix)
        return obj['result']
    deployment = get('/deployments')['deployments'][0]
    active = [v for v in deployment['versions'] if v['percentage'] > 0]
    if active != [{'version_id': live, 'percentage': 100}]:
        raise RuntimeError('Live traffic changed since approval')
    if get('/versions')['items'][0]['id'] != expected:
        raise RuntimeError('Latest uploaded version changed; download would be ambiguous')
    settings = get('/settings')
    data, headers = get('/content/v2', True)
    content_type = headers.get('Content-Type', '')
    if not content_type.startswith('multipart/'):
        raise RuntimeError('Expected raw multipart response; no lossy fallback used')
    envelope = ('MIME-Version: 1.0\r\nContent-Type: ' + content_type + '\r\n\r\n').encode() + data
    mime = BytesParser(policy=email.policy.default).parsebytes(envelope)
    if not mime.is_multipart():
        raise RuntimeError('Cannot parse multipart Worker download')
    parts = {}
    for part in mime.iter_parts():
        name = part.get_param('name', header='Content-Disposition') or part.get_filename()
        if not name or name == 'metadata':
            continue
        name = safe_name(name)
        if name in parts:
            raise RuntimeError('Duplicate module: ' + name)
        blob = part.get_payload(decode=True)
        if blob is None:
            raise RuntimeError('Undecodable module: ' + name)
        ctype = part.get_content_type()
        text = ctype.startswith('text/') or 'javascript' in ctype or ctype == 'application/json'
        if text:
            blob.decode('utf-8', errors='strict')
            guard(blob, name)
        parts[name] = (ctype, blob, text)
    binary = sum(not v[2] for v in parts.values())
    if len(parts) != request['expected_modules'] or binary != request['expected_binary_modules'] or ENTRY not in parts:
        raise RuntimeError(f'Unexpected module inventory: {len(parts)} total; {binary} binary')
    for name, source in SOURCES.items():
        if parts[name][1] != Path(source).read_bytes():
            raise RuntimeError('Candidate differs from approved GitHub file: ' + name)
    allowed = {'ASSETS', 'WAITLIST_DB', 'WAITLIST_LIMITER', 'WAITLIST_NETWORK_LIMITER'}
    bindings = []
    for binding in settings.get('bindings', []):
        if binding['name'] not in allowed or binding['type'] not in {'assets', 'd1', 'ratelimit'}:
            raise RuntimeError('Unexpected binding; review before publishing configuration')
        bindings.append({k: binding[k] for k in ['type', 'name', 'database_id', 'namespace_id', 'simple'] if k in binding})
    if {b['name'] for b in bindings} != allowed:
        raise RuntimeError('Required production binding missing')
    if get('/deployments')['deployments'][0]['id'] != deployment['id'] or get('/versions')['items'][0]['id'] != expected:
        raise RuntimeError('Cloudflare changed during snapshot')
    rows = []
    for name, (ctype, blob, text) in sorted(parts.items()):
        p = ROOT / 'modules' / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(blob)
        rows.append({'name': name, 'content_type': ctype, 'bytes': len(blob), 'sha256': sha(blob), 'text': text})
    metadata = {'main_module': ENTRY, 'keep_assets': True, 'compatibility_date': settings['compatibility_date'], 'compatibility_flags': settings.get('compatibility_flags', []), 'bindings': bindings}
    manifest = {'worker': 'communiverse', 'release': request['release'], 'worker_version_id': expected, 'deployment_at_capture': {'id': deployment['id'], 'versions': deployment['versions']}, 'module_count': len(rows), 'binary_module_count': binary, 'metadata': metadata, 'observability': settings.get('observability', {}), 'modules': rows, 'static_assets': {'mode': 'retain-existing-ASSETS-collection', 'included_in_snapshot': False, 'note': 'content/v2 exports Worker modules, not the separate ASSETS collection. Existing repository public/ remains retained. API redeployment must use keep_assets=true. This is not a full-account disaster-recovery backup.'}, 'data': 'No D1/Supabase records, credentials or secret values exported.', 'scope': 'Shared typography/palette/header; prior gallery/media/people/forms modules preserved.'}
    (ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Captured {len(rows)} exact Worker modules including {binary} binary modules.')
    verify()

def verify():
    m = json.loads((ROOT / 'manifest.json').read_text())
    names = set()
    for row in m['modules']:
        name = safe_name(row['name'])
        if name in names:
            raise RuntimeError('Duplicate snapshot module')
        names.add(name)
        b = (ROOT / 'modules' / name).read_bytes()
        if len(b) != row['bytes'] or sha(b) != row['sha256']:
            raise RuntimeError('Checksum mismatch: ' + name)
        if row.get('text'):
            guard(b, name)
        if row['content_type'] == 'application/javascript+module':
            subprocess.run(['node', '--input-type=module', '--check'], input=b, check=True, capture_output=True)
    actual = {str(p.relative_to(ROOT / 'modules')) for p in (ROOT / 'modules').rglob('*') if p.is_file()}
    if actual != names or len(names) != m['module_count']:
        raise RuntimeError('Snapshot contains missing or untracked modules')
    for name, source in SOURCES.items():
        if (ROOT / 'modules' / name).read_bytes() != Path(source).read_bytes():
            raise RuntimeError('Approved source mismatch: ' + name)
    print(f'PASS: {len(names)} SHA-256 checksums, JavaScript syntax and shared-UI source equality.')

if __name__ == '__main__':
    try:
        mode = sys.argv[1] if len(sys.argv) == 2 else ''
        if mode == 'capture':
            capture()
        elif mode == 'verify':
            verify()
        else:
            raise RuntimeError('Usage: snapshot-production.py capture|verify')
    except (RuntimeError, OSError, ValueError, subprocess.CalledProcessError) as exc:
        raise SystemExit('Production source validation failed: ' + str(exc)) from None
