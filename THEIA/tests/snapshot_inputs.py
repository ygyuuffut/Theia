"""Read-only inventory of protected projects. Run before and after experiments."""
import hashlib, json, sys
from pathlib import Path
root = Path(__file__).resolve().parents[2]
files = [p for p in root.rglob('*') if p.is_file() and 'THEIA' not in p.relative_to(root).parts
         and not any(x in p.parts for x in ('__pycache__', 'node_modules', '.git'))
         and p.name != '.DS_Store' and not p.name.endswith('~lock~')]
inventory = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}
baseline_name = sys.argv[sys.argv.index('--baseline')+1] if '--baseline' in sys.argv else 'protected-before.json'
target = root/'THEIA/research/evidence'/baseline_name
if '--check' in sys.argv:
    before = json.loads(target.read_text())
    changed = [p for p, value in before.items() if inventory.get(p) != value]
    added = [p for p in inventory if p not in before]
    result = dict(pass_=not changed and not added, file_count=len(before), changed=changed, added=added)
    after_name = baseline_name.replace('before', 'after')
    (target.parent/after_name).write_text(json.dumps(result, indent=2))
    print(json.dumps(result))
    assert result['pass_']
else:
    target.write_text(json.dumps(inventory, indent=2))
    print(f'Protected baseline: {len(inventory)} files')
