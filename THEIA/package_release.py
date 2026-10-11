"""Build explicit publisher assets; never publish or include private game fixtures."""
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
version = json.loads((ROOT/'package.json').read_text())['version']
for script in ['build_local.py', 'package_source.py']:
    subprocess.run([sys.executable, str(ROOT/script)], check=True)

def write_zip(destination, files):
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, data in files:
            entry = zipfile.ZipInfo(name, (2026, 10, 10, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, data)

dist = ROOT/'dist'
html = dist/f'THEIA-{version}.html'
write_zip(dist/f'THEIA-{version}.zip', [(html.name, html.read_bytes())])
folder = dist/f'THEIA-{version}-release'
folder.mkdir(exist_ok=True)
names = [html.name, f'THEIA-{version}.zip', f'THEIA-{version}-source.zip', f'THEIA-{version}-build.json', f'THEIA-{version}-source-archive.json']
for name in names:
    shutil.copyfile(dist/name, folder/name)
notes = (ROOT/f'docs/release-{version}.md').read_bytes()
(folder/'RELEASE-NOTES.md').write_bytes(notes)
names += ['RELEASE-NOTES.md']
sums = ''.join(hashlib.sha256((folder/name).read_bytes()).hexdigest()+'  '+name+'\n' for name in names)
(folder/'SHA256SUMS.txt').write_text(sums)
names += ['SHA256SUMS.txt']
assert {p.name for p in folder.iterdir()} == set(names), 'Unexpected file in release folder'
bundle = dist/f'THEIA-{version}-release.zip'
write_zip(bundle, [(folder.name+'/'+name, (folder/name).read_bytes()) for name in names])
print(json.dumps({'version': version, 'bundle': str(bundle.relative_to(ROOT)), 'bundle_sha256': hashlib.sha256(bundle.read_bytes()).hexdigest(), 'assets': names, 'published': False, 'includesGame': False, 'includesCore': False}, indent=2))
