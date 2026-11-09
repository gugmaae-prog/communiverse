#!/usr/bin/env python3
"""Extract the pinned baseline from an existing authorized multipart archive.

This command makes no network requests and never reads credentials. The final
bundled Worker cannot be used to recover the original baseline's exact bytes.
"""
import argparse
from email.parser import BytesParser
from email.policy import default
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
LIMIT = 64 * 1024 * 1024


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-multipart', type=Path, required=True)
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args()
    expected = json.loads((ROOT / 'baseline.json').read_text())
    if args.input_multipart.stat().st_size > LIMIT:
        raise ValueError('Multipart archive exceeds the 64 MiB limit.')
    body = args.input_multipart.read_bytes()
    first = body.splitlines()[0] if body else b''
    if not first.startswith(b'--'):
        raise ValueError('Input must be an archived multipart Worker response body.')
    boundary = first[2:].decode('ascii')
    header = ('MIME-Version: 1.0\r\nContent-Type: multipart/form-data; boundary="' + boundary + '"\r\n\r\n').encode('ascii')
    message = BytesParser(policy=default).parsebytes(header + body)
    if not message.is_multipart():
        raise ValueError('Input did not parse as multipart.')
    data = None
    for part in message.iter_parts():
        name = part.get_param('name', header='content-disposition') or part.get_filename()
        if name not in {expected['source_part'], expected['module'], Path(expected['module']).name}:
            continue
        candidate = part.get_payload(decode=True)
        if candidate is not None and len(candidate) == expected['size'] and hashlib.sha256(candidate).hexdigest() == expected['sha256']:
            data = candidate
            break
    if data is None:
        raise ValueError('Pinned baseline bytes were not found; do not substitute another release.')
    if not args.verify_only:
        output = ROOT / expected['module']
        if output.exists() and output.read_bytes() != data:
            raise ValueError('Output exists with different bytes; refusing to overwrite it.')
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(data)
        print('Wrote:', expected['module'])
    print('Verified baseline:', expected['version_id'])
    print('SHA-256:', expected['sha256'])
    print('Bytes:', len(data))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as error:
        print('Archive extraction failed: ' + str(error), file=sys.stderr)
        raise SystemExit(1)
