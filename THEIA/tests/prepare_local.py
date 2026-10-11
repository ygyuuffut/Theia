"""Private validation fixture, compiled from the prior Python oracle. Never distribute."""
import hashlib
import json
import struct
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'prototypes/generated/local'
OUT.mkdir(parents=True, exist_ok=True)
sha = lambda b: hashlib.sha256(b).hexdigest()
payload = json.loads((ROOT/'prototypes/generated/payload.json').read_bytes())
payload.update(schema=1, kind='SYNODIC-compiled-core')
data = json.dumps(payload, ensure_ascii=False).encode()
games = [ROOT.parent/'STG 0.2PC.html', ROOT.parent/'STG 0.2PC.C2.html']
manifest = dict(schema_version=1, kind='synodic-core', release_version='0.0.0-b6.9', display_version='Internal b6.9 · validation fixture', channel='legacy', injection_contract='synodic-python-text-v1', games=[dict(version='0.2001', raw_sha256=[sha(g.read_bytes()) for g in games])], components=[dict(id='lunar',version='internal-b6.9'),dict(id='moonshine',version='internal-b6.9')], payload_path='payload.json', asset_name='core.zip', files=[dict(path='payload.json', size=len(data), sha256=sha(data))], license=dict(direction='GPLv3', choice='pending', third_party_game_included=False), warning='Private validation fixture; not public SYNODIC 1.0.0. Never distribute.')
manifest_text=json.dumps(manifest, ensure_ascii=False, indent=2)
def archive(name, m=manifest_text, p=data, extra=None):
    with zipfile.ZipFile(OUT/name, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('manifest.json', m)
        z.writestr('payload.json', p)
        if extra:
            z.writestr(extra, 'malformed fixture')
archive('core.zip')
archive('corrupt.zip', p=data[:-1]+b'!')
archive('traversal.zip', extra='../outside.txt')
archive('duplicate.zip', extra='payload.json')
archive('unknown.zip', m=json.dumps(dict(manifest, games=[dict(version='0.2001',raw_sha256=['1'*64])])))
archive('unlisted.zip', extra='unexpected.txt')
private_payload=json.loads(data)
module=next(name for name,block in private_payload['blocks'].items() if 'id="lunar.api.moonshine"' in block)
private_payload['blocks'][module]=private_payload['blocks'][module].replace('id="lunar.api.moonshine"', 'id="hecate.panel.test"')
private_bytes=json.dumps(private_payload,ensure_ascii=False).encode()
private_manifest=dict(manifest,files=[dict(path='payload.json',size=len(private_bytes),sha256=sha(private_bytes))])
archive('private-module.zip',m=json.dumps(private_manifest),p=private_bytes)
b=bytearray((OUT/'core.zip').read_bytes())
# Forge manifest expansion size in the central directory; extraction must stop early.
p=b.find(b'PK\x01\x02')
struct.pack_into('<I',b,p+24,1)
(OUT/'forged-size.zip').write_bytes(b)
(OUT/'manifest.json').write_text(manifest_text)
(OUT/'payload.json').write_bytes(data)
report=dict(zip_sha256=sha((OUT/'core.zip').read_bytes()), manifest_text=manifest_text)
(OUT/'expected.json').write_text(json.dumps(report, indent=2))
print(json.dumps(dict(path=str(OUT.relative_to(ROOT)), zip_bytes=(OUT/'core.zip').stat().st_size, zip_sha256=report['zip_sha256'])))
