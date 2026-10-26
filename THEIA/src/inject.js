/* Text projection derived from the unchanged Python injector; compare final bytes in tests. */
async function sha256(bytes) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
const utf8 = text => new TextEncoder().encode(text);
function detectGame(text) {
  const invalid = message => Object.assign(Error(message), {code:'INVALID_STG'});
  if (!text.includes('<tw-storydata') || !text.includes('format="SugarCube"')) throw invalid('Not a recognized STG SugarCube export');
  const scripts = [...text.matchAll(/<script\b[^>]*\bid=["']twine-user-script["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== 1) throw invalid('Missing or duplicate native game script');
  const versions = [...scripts[0][1].matchAll(/window\.STG_VERSION\s*=\s*(['"])(.*?)\1/g)].map(m => m[2]);
  if (versions.length !== 1 || !isGameVersion(versions[0].replace(/^v/, ''))) throw invalid('Missing, duplicate or unsupported STG version declaration');
  const injected = /<!-- STG-[A-Z-]+:(?:START|END) -->|id=["'](?:LUNAR-|MOONSHINE-|lunar\.|moonshine\.)/.test(text);
  return {declared: versions[0], version: versions[0].replace(/^v/, ''), injected};
}
// Python read_text() uses universal newlines; retain this only in the oracle experiment.
function normalizeText(text) { return text.replace(/\r\n?/g, '\n'); }
function restoreFonts(text) {
  const saved = text.match(/<script type="application\/json" id="LUNAR-font-original-imports">([\s\S]*?)<\/script>/);
  if (saved) JSON.parse(saved[1]).forEach((rule, i) => {
    const token = `/* SYNODIC-FONT-IMPORT-${i} */`;
    if (text.split(token).length !== 2) throw Error('Font projection is not reversible');
    text = text.replace(token, () => rule);
  });
  return text;
}
function nativeText(text) {
  return restoreFonts(normalizeText(text)).replace(/<!-- STG-[A-Z-]+:START -->[\s\S]*?<!-- STG-[A-Z-]+:END -->\n?/g, '');
}
// Match json.dumps separators and escaping used by the Python oracle.
function pythonJSON(value, ascii = false) {
  let s;
  if (value === null || typeof value !== 'object') s = JSON.stringify(value);
  else if (Array.isArray(value)) s = '[' + value.map(v => pythonJSON(v, ascii)).join(', ') + ']';
  else s = '{' + Object.entries(value).map(([k,v]) => pythonJSON(k,ascii) + ': ' + pythonJSON(v,ascii)).join(', ') + '}';
  if (ascii) s = s.replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4,'0'));
  return s;
}
const safeJSON = (value, ascii=false) => pythonJSON(value,ascii).replaceAll('<','\\u003c').replaceAll('&','\\u0026');
function replaceJSON(block, id, update, ascii=false) {
  const pattern = new RegExp('(<script type="application/json" id="'+id+'">)([\\s\\S]*?)(</script>)');
  if (!pattern.test(block)) throw Error('Missing compiled JSON '+id);
  return block.replace(pattern,(_all,start,json,end) => start+safeJSON(update(JSON.parse(json)),ascii)+end);
}
function insert(text, name, block, anchor) {
  const index = text.toLowerCase().lastIndexOf(anchor);
  if (index < 0) throw Error('Missing anchor '+anchor);
  return text.slice(0,index)+`<!-- STG-${name}:START -->\n${block.trimEnd()}\n<!-- STG-${name}:END -->\n`+text.slice(index);
}
async function injectCore(source, payload) {
  const detection = detectGame(source);
  if (detection.injected) throw Error('Already injected; supply original game');
  if(payload.schema !== 1 || payload.kind !== 'SYNODIC-compiled-core') throw Error('Unsupported Core payload');
  let text = nativeText(source), original = text;
  const fingerprint = await sha256(utf8(text)), originals=[];
  text=text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, style=>style.replace(/@import\s+url\([^)]*\)[^;]*;/gi,rule=>{
    if(!rule.includes('fonts.googleapis.com')||!payload.nativeImportFamilies.some(f=>rule.includes(f)))return rule;
    originals.push(rule);return `/* SYNODIC-FONT-IMPORT-${originals.length-1} */`;
  }));
  const blocks = {...payload.blocks};
  blocks['LUNAR-FONT-RESOURCES']=replaceJSON(blocks['LUNAR-FONT-RESOURCES'],'LUNAR-font-original-imports',()=>originals);
  blocks['LUNAR-DIAGNOSTIC-CONFIG']=replaceJSON(blocks['LUNAR-DIAGNOSTIC-CONFIG'],'LUNAR-diagnostic-config',v=>({...v,gameVersion:detection.declared,gameFingerprint:fingerprint}));
  // Keep source URL discovery and deferred fallback identical to image_variants/inject.
  const assetJSON=blocks['LUNAR-ASSET-MANIFEST'].match(/(<script type="application\/json" id="LUNAR-asset-manifest">)([\s\S]*?)(<\/script>)/);
  const assets=JSON.parse(assetJSON[2]),added=[];
  const known = new Set(assets.assets.map(row=>row.source));
  const urls=[...new Set(text.match(/https:\/\/static\.wixstatic\.com\/media\/[^\s"'<>;)]+?\.(?:png|jpe?g|webp)(?:\?[^\s"'<>;)]*)?/g)||[])].sort();
  for(const source of urls) if(!known.has(source)) added.push({id:'native.'+(await sha256(utf8(source))).slice(0,12),source,pack:'deferred',critical:false,readiness:'decorative',kind:'cg',failurePolicy:'continue',profiles:{mobile:source}});
  if(added.length){
    // Preserve precompiled Python numeric formatting (e.g. 1.0); append only rows.
    const raw=assetJSON[2],begin=raw.indexOf('[',raw.indexOf('"assets":'));
    let end=begin,depth=0,inString=false,escaped=false;
    for(;end<raw.length;end++){const c=raw[end];if(inString){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')inString=false;}else if(c==='"')inString=true;else if(c==='[')depth++;else if(c===']'&&--depth===0)break;}
    const json=raw.slice(0,end)+(assets.assets.length?', ':'')+added.map(v=>safeJSON(v,true)).join(', ')+raw.slice(end);
    blocks['LUNAR-ASSET-MANIFEST']=blocks['LUNAR-ASSET-MANIFEST'].replace(assetJSON[0],()=>assetJSON[1]+json+assetJSON[3]);
  }
  for(const name of payload.head)text=insert(text,name,blocks[name],'</head>');
  for(const name of payload.body)text=insert(text,name,blocks[name],'</body>');
  const anchor=text.match(/<meta\s+name=["']viewport["'][^>]*>/i)||text.match(/<meta\s+charset=[^>]*>/i);
  if(!anchor)throw Error('Charset declaration required');
  const at=anchor.index+anchor[0].length;
  text=text.slice(0,at)+`<!-- STG-BOOTSTRAP:START -->\n${blocks.BOOTSTRAP}\n<!-- STG-BOOTSTRAP:END -->\n`+text.slice(at);
  if(nativeText(text)!==original)throw Error('Native integrity failed');
  for(const name of [...payload.head,...payload.body,'BOOTSTRAP'])if(text.split(`<!-- STG-${name}:START -->`).length!==2)throw Error('Duplicate or missing block '+name);
  return text;
}
