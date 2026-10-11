"""Explicit source archive. Never recursively package private generated game files."""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parent
version=json.loads((ROOT/'package.json').read_text())['version']
files=[ROOT/p for p in ['README.md','AGENTS.md','package.json','.gitignore','build_local.py','package_source.py','package_release.py','LICENSE.md','COPYING','CHANGELOG.md','THIRD-PARTY-NOTICES.md']]
for directory in ['src','vendor','assets/fonts','assets/brand','docs','tests']:
    files += sorted(p for p in (ROOT/directory).iterdir() if p.is_file() and p.suffix in {'.js','.html','.css','.md','.woff2','.txt','.py','.cjs','.mjs','.svg'})
files += [ROOT/p for p in ['research/manifest-candidate.toml','research/REPRODUCING.md','research/SOURCES.md']]
assert len(set(files))==len(files)
assert all(p.is_relative_to(ROOT) and 'generated' not in p.parts and 'SYNODIC' not in p.parts for p in files)
destination=ROOT/f'dist/THEIA-{version}-source.zip'
with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED) as archive:
    for p in files:
        entry=zipfile.ZipInfo('THEIA/'+str(p.relative_to(ROOT)),(2026,10,10,0,0,0))
        entry.compress_type=zipfile.ZIP_DEFLATED
        entry.external_attr=0o100644<<16
        archive.writestr(entry,p.read_bytes())
report=dict(version=version,archive=str(destination.relative_to(ROOT)),bytes=destination.stat().st_size,sha256=hashlib.sha256(destination.read_bytes()).hexdigest(),files=[str(p.relative_to(ROOT)) for p in files],includesGame=False,includesCore=False,licenseSelection='GPL-3.0-or-later')
(ROOT/'dist/source-archive.json').write_text(json.dumps(report,indent=2)+'\n')
(ROOT/f'dist/THEIA-{version}-source-archive.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='files'},indent=2))
