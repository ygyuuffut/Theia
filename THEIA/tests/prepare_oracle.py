"""Compile research-only Core payload with the unchanged Python injector.

All writes are beneath THEIA. No native game bytes enter core.zip.
"""
import sys
sys.dont_write_bytecode = True
import hashlib, json, re, shutil, zipfile
from pathlib import Path
theia = Path(__file__).resolve().parents[1]
root = theia.parent/'SYNODIC'
sys.path.insert(0, str(root))
from inject_mobile import inject, restore_font_imports
generated = theia/'prototypes/generated'
generated.mkdir(exist_ok=True)
strip = lambda text: re.sub(r'<!-- STG-[A-Z-]+:START -->.*?<!-- STG-[A-Z-]+:END -->\n?', '', restore_font_imports(text), flags=re.S)
digest = lambda data: hashlib.sha256(data).hexdigest()
seed = generated/'synthetic.html'
seed.write_text('<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body><tw-storydata format="SugarCube"></tw-storydata><script>window.STG_VERSION = "THEIA_SEED";</script></body></html>')
compiled = generated/'synthetic-injected.html'
inject(seed, compiled, root)
text = compiled.read_text()
pattern = r'<!-- STG-([A-Z-]+):START -->\n(.*?)\n<!-- STG-\1:END -->'
blocks = {m[1]:m[2] for m in re.finditer(pattern,text,re.S)}
split = text.index('</head>')
head = [m[1] for m in re.finditer(pattern,text,re.S) if m.start()<split and m[1]!='BOOTSTRAP']
body = [m[1] for m in re.finditer(pattern,text,re.S) if m.start()>split]
registry = json.loads((root/'lunar/lunar.fonts.manifest.json').read_text())
payload = dict(schema=0,kind='THEIA-throwaway-python-oracle-payload',injectorSha256=digest((root/'inject_mobile.py').read_bytes()),head=head,body=body,blocks=blocks,nativeImportFamilies=registry['nativeImportFamilies'])
payload_bytes = json.dumps(payload,ensure_ascii=False).encode()
(generated/'payload.json').write_bytes(payload_bytes)
manifest = dict(schema_version='0-research',release_version='b6.9-research',channel='research',payload_sha256=digest(payload_bytes),warning='Local experiment. Not a public release or final manifest.')
manifest_bytes = json.dumps(manifest,indent=2).encode()
(generated/'manifest.json').write_bytes(manifest_bytes)
with zipfile.ZipFile(generated/'core.zip','w',zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('manifest.json',manifest_bytes)
    archive.writestr('payload.json',payload_bytes)
    archive.writestr('RESEARCH-NOT-FOR-DISTRIBUTION.txt','No STG or HECATE. Local validation only; license choice pending.\n')
# Test a deliberately inconsistent inner/outer manifest.
with zipfile.ZipFile(generated/'mismatch.zip','w',zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('manifest.json',json.dumps(dict(manifest,release_version='tampered')))
    archive.writestr('payload.json',payload_bytes)
results = {}
sources = dict(pc=theia.parent/'STG 0.2PC.html',pc_c2=theia.parent/'STG 0.2PC.C2.html',accepted_b5=theia.parent/'STG 0.2m-b5.html',accepted_b69=root/'builds/STG 0.2m-b6.9.html')
for key, source in sources.items():
    oracle = generated/(key+'-oracle.html')
    inject(source,oracle,root)
    native = strip(source.read_text())
    (generated/(key+'-native.html')).write_text(native)
    results[key] = dict(source=str(source.relative_to(theia.parent)),bytes=source.stat().st_size,rawSha256=digest(source.read_bytes()),nativeTextSha256=digest(native.encode()),oracleSha256=digest(oracle.read_bytes()),oracleBytes=oracle.stat().st_size)
results['core'] = dict(bytes=(generated/'core.zip').stat().st_size,sha256=digest((generated/'core.zip').read_bytes()),payloadBytes=len(payload_bytes),payloadSha256=digest(payload_bytes),blocks=len(blocks),headBlocks=len(head),bodyBlocks=len(body),injectorSha256=payload['injectorSha256'])
(generated/'expected.json').write_text(json.dumps(results,indent=2))
(theia/'research/evidence/oracle-inputs.json').write_text(json.dumps(results,indent=2))
shutil.copyfile(Path(__import__('os').environ['THEIA_JSZIP']),generated/'jszip.min.js')
print(json.dumps(results,indent=2))
