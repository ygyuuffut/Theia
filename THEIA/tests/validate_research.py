"""Check research schema syntax, package scope and local documentation links."""
import json, re, tomllib, zipfile, hashlib
from pathlib import Path
from urllib.parse import unquote
root = Path(__file__).resolve().parents[1]
draft = tomllib.loads((root/'research/manifest-candidate.toml').read_text())
assert draft['proposal'] is True and draft['schema_version'] == 1
assert {r['id'] for r in draft['components']} == {'lunar','moonshine'}
assert draft['supported_stg_versions'] == [r['version'] for r in draft['games']]
assert draft['license']['selection'] == 'pending'
assert draft['extensions']['mod_installation_enabled'] is False
with zipfile.ZipFile(root/'prototypes/generated/core.zip') as archive:
    assert set(archive.namelist()) == {'manifest.json','payload.json','RESEARCH-NOT-FOR-DISTRIBUTION.txt'}
    assert archive.read('manifest.json') == (root/'prototypes/generated/manifest.json').read_bytes()
    payload = json.loads(archive.read('payload.json'))
    assert not any('HECATE' in name for name in payload['blocks'])
    assert all('id="lunar.api.hecate"' not in block for block in payload['blocks'].values())
    assert '<tw-storydata' not in archive.read('payload.json').decode()
broken=[]
for doc in root.rglob('*.md'):
    if 'generated' in doc.parts: continue
    for target in re.findall(r'\]\(([^)]+)\)', doc.read_text()):
        if '://' in target or target.startswith('#'): continue
        link=unquote(target.split('#')[0].strip('<>'))
        if not (doc.parent/link).exists(): broken.append((str(doc.relative_to(root)),target))
assert not broken, broken
result=dict(pass_=True,toml_candidate_parse=True,draft_not_frozen=True,zip_no_original_game_or_hecate=True,local_documentation_links=True)
(root/'research/evidence/research-validation.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result))
