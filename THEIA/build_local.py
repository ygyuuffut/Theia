"""Build one self-contained local HTML; no network, STG or Core is included."""
import base64
import hashlib
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
def read(name):
    return (ROOT/name).read_text(encoding='utf-8')

def build():
    version = json.loads(read('package.json'))['version']
    styles = read('src/style.css')
    for token, name in [('GOOGLE', 'google-sans'), ('MONO', 'mono'), ('EMOJI', 'noto-emoji'), ('ICONS', 'material-outlined'), ('INFO', 'material-info')]:
        styles = styles.replace(f'/*__{token}_FONT__*/', base64.b64encode((ROOT/f'assets/fonts/{name}.woff2').read_bytes()).decode())
    worker = '\n'.join(read(p) for p in ['vendor/jszip.min.js', 'src/versions.js', 'src/inject.js', 'src/package.js', 'src/worker.js'])
    app = '\n'.join(read(p) for p in ['src/versions.js', 'src/release-notes.js', 'src/distribution.js', 'src/app.js'])
    notices = ['LICENSE.md', 'COPYING', 'THIRD-PARTY-NOTICES.md', 'vendor/JSZip-LICENSE.md', 'assets/fonts/JetBrains-Mono-LICENSE.txt', 'assets/fonts/Google-Sans-LICENSE.txt', 'assets/fonts/Google-Sans-TRADEMARKS.md', 'assets/fonts/Noto-Emoji-LICENSE.txt', 'assets/fonts/Material-Icons-LICENSE.txt']
    licenses = '\n\n'.join(read(p) for p in notices)
    brand = base64.b64encode((ROOT/'assets/brand/theia-header.svg').read_bytes()).decode()
    hyperion = base64.b64encode((ROOT/'assets/brand/hyperion-header.svg').read_bytes()).decode()
    artifact = read('src/index.html').replace('/*__VERSION__*/', version).replace('/*__STYLES__*/', styles).replace('/*__BRAND__*/', brand).replace('/*__HYPERION__*/', hyperion).replace('/*__WORKER__*/', base64.b64encode(worker.encode()).decode()).replace('/*__APP__*/', app.replace('</script', '<\\/script')).replace('/*__LICENSES__*/', html.escape(licenses))
    if '/*__' in artifact:
        raise ValueError('Unresolved template placeholder')
    output = ROOT/f'dist/THEIA-{version}.html'
    output.parent.mkdir(exist_ok=True)
    data = artifact.encode('utf-8')
    output.write_bytes(data)
    inputs = ['build_local.py', 'package.json', 'src/index.html', 'src/style.css', 'src/app.js', 'src/versions.js', 'src/distribution.js', 'src/release-notes.js', 'src/inject.js', 'src/package.js', 'src/worker.js', 'vendor/jszip.min.js', 'assets/brand/theia-header.svg', 'assets/brand/hyperion-header.svg', 'assets/fonts/google-sans.woff2', 'assets/fonts/mono.woff2', 'assets/fonts/noto-emoji.woff2', 'assets/fonts/material-outlined.woff2', 'assets/fonts/ui-font-provenance.json'] + notices
    source_hashes = {name: hashlib.sha256((ROOT/name).read_bytes()).hexdigest() for name in inputs}
    source_hashes['assets/fonts/material-info.woff2'] = hashlib.sha256((ROOT/'assets/fonts/material-info.woff2').read_bytes()).hexdigest()
    report = dict(version=version, license='GPL-3.0-or-later', artifact=str(output.relative_to(ROOT)), bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), selfContained=True, includesGame=False, includesCore=False, sourceHashes=source_hashes)
    (ROOT/'dist/build.json').write_text(json.dumps(report, indent=2)+'\n')
    (ROOT/f'dist/THEIA-{version}-build.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    build()
