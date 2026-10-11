/* Node DOM harness: release discovery/error UI only, no browser or game execution. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..'),gameHash='a'.repeat(64),checks=[];
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.attributes={};this.listeners={};this.checked=false;this.disabled=false;this.hidden=false;this.textContent='';this.value='';this.clicks=0;}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=[...nodes];}setAttribute(k,v){this.attributes[k]=v;}
 querySelector(){return this.symbol??=new Element('span');}addEventListener(k,f){this.listeners[k]=f;}click(){this.clicks++;this.listeners.click?.();}showModal(){}close(){}
}
function manifest(version='1.0.0-rc.1',channel='rc'){
 return {schema_version:1,kind:'synodic-core',release_version:version,channel,asset_name:'synodic-core-'+version+'.zip',injection_contract:'synodic-python-text-v1',payload_path:'payload.json',games:[{version:'0.2001',raw_sha256:[gameHash]}],components:[{id:'lunar'},{id:'moonshine'}],files:[{path:'payload.json',size:1,sha256:'b'.repeat(64)}]};
}
function release(m=manifest(),tag='v'+m.release_version){return {tag_name:tag,prerelease:m.channel==='rc',draft:false,assets:[{name:'manifest.json',url:'https://api.github.com/assets/'+tag},{name:m.asset_name,url:'https://api.github.com/core/'+tag,browser_download_url:'https://github.com/ygyuuffut/Synodic/releases/download/'+tag+'/'+m.asset_name,digest:'sha256:'+'c'.repeat(64)}]};}
function harness(rows,manifests,{blocked=false,catalog=null,confirmForce=true}={}){
 const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};el('theia-worker').textContent=Buffer.from('// test worker').toString('base64');el('install-button').disabled=true;
 let context;class Worker{postMessage(data){queueMicrotask(()=>{try{context.manifestInput=data.manifest;const result=vm.runInContext('validateManifest(manifestInput)',context);this.onmessage({data:{id:data.id,result}});}catch(e){this.onmessage({data:{id:data.id,error:e.message}});}});}terminate(){}}
 context=vm.createContext({document:{getElementById:el,createElement:t=>new Element(t)},window:{addEventListener(){},confirm(){return confirmForce;}},Worker,crypto:webcrypto,Blob,URL,AbortController,TextEncoder,TextDecoder,Uint8Array,DataView,ArrayBuffer,TypeError,setTimeout,clearTimeout,atob,fetch:async url=>{
  if(url.includes('/releases?'))return new Response(JSON.stringify(rows));
  if(url==='https://raw.githubusercontent.com/ygyuuffut/Synodic/main/distribution/catalog.json')return new Response(JSON.stringify(catalog));
  if(blocked)throw new TypeError('Failed to fetch');
  const m=manifests[url];assert.ok(m,'unexpected request '+url);return new Response(JSON.stringify(m));
 }});
 for(const p of ['src/versions.js','src/package.js'])vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),context);
 const code=fs.readFileSync(path.join(root,'src/app.js'),'utf8').replace(/\}\)\(\);\s*$/,'globalThis.test={findReleases,renderChoices,setGame(){game={version:"0.2001",hash:"'+gameHash+'",name:"STG.html"};},setIndex(){indexURL="https://raw.githubusercontent.com/ygyuuffut/Synodic/main/distribution/catalog.json";},activateForced(){activate({manifest:manifestInput,info:{forced:true,originVerified:false},local:true});},getState(){return {choices,releaseIssues,selected,forceFingerprint,output};}};})();');
 vm.runInContext(code,context);context.test.setGame();return {api:context.test,el,tree:()=>flatten(el('release-list'))};
}
function flatten(node){return [node,...node.children.flatMap(flatten)];}
function check(name,condition){assert.ok(condition,name);checks.push(name);}
(async()=>{
 let m=manifest(),r=release(m),h=harness([r],{},{blocked:true});await h.api.findReleases();
 check('blocked Manifest still reports a published preview',h.el('message').textContent.includes('Published RC/Beta found'));
 check('hidden preview count is visible',!h.el('preview-note').hidden&&h.el('preview-note').textContent.startsWith('1 '));
 check('fallback preview requires explicit opt-in',!h.tree().some(n=>n.tagName==='a'));
 h.el('show-preview').checked=true;h.api.renderChoices();
 check('blocked Manifest exposes actual Core download',h.tree().some(n=>n.tagName==='a'&&n.href===r.assets[1].browser_download_url));
 check('fallback never claims confirmed compatibility',h.tree().some(n=>n.textContent.includes('Compatibility has not been confirmed')));
 h.tree().find(n=>n.tagName==='button'&&n.textContent==='Import Core ZIP…').click();
 check('fallback import invokes existing file picker',h.el('core-file').clicks===1);
 check('unverified Release cannot activate installation',h.api.getState().selected===null&&h.el('install-button').disabled);
 m=manifest('1.0.0-rc1');r=release(m,'v1.0.0-rc.1');h=harness([r],{[r.assets[0].url]:m});await h.api.findReleases();
 check('actual RC tag spelling mismatch remains rejected',h.api.getState().choices.length===0&&h.api.getState().releaseIssues[0].reason.includes('does not match Manifest version 1.0.0-rc1'));
 m=manifest();r=release(m);h=harness([r],{[r.assets[0].url]:m});await h.api.findReleases();
 check('valid compatible RC is discovered',h.api.getState().choices.length===1&&h.api.getState().releaseIssues.length===0);
 check('RC is never automatically recommended or selected',!h.api.getState().choices[0].recommended&&h.api.getState().selected===null);
 check('valid RC initially hidden with actionable hint',h.el('message').textContent.includes('enable “Show RC & Beta releases”')&&!h.tree().some(n=>n.className==='release-choice'));
 h.el('show-preview').checked=true;h.api.renderChoices();check('explicit preview opt-in shows selectable compatible RC',h.tree().some(n=>n.className==='release-choice'));
 r=release(m);r.prerelease=false;h=harness([r],{[r.assets[0].url]:m});await h.api.findReleases();check('channel/API mismatch is diagnosed',h.api.getState().releaseIssues[0].reason.includes('prerelease flag'));
 m=manifest();m.games[0].raw_sha256=['d'.repeat(64)];r=release(m);h=harness([r],{[r.assets[0].url]:m});await h.api.findReleases();check('game fingerprint mismatch does not produce compatible choice',h.api.getState().choices.length===0);
 m=manifest('1.0.0','stable');r=release(m);const preview=manifest('1.1.0-rc.1'),pr=release(preview);h=harness([pr,r],{[pr.assets[0].url]:preview,[r.assets[0].url]:m});await h.api.findReleases();check('stable remains recommended while newer RC stays hidden',h.api.getState().choices.find(c=>c.manifest.channel==='stable').recommended&&h.tree().filter(n=>n.className==='release-choice').length===1);
 r=release();r.assets[1].browser_download_url='javascript:alert(1)';h=harness([r],{},{blocked:true});await h.api.findReleases();h.el('show-preview').checked=true;h.api.renderChoices();check('unsafe download URL falls back to HTTPS Release page',h.tree().find(n=>n.tagName==='a').href.startsWith('https://github.com/ygyuuffut/Synodic/releases/tag/'));
 m=manifest();r=release(m);r.assets.shift();h=harness([r],{});await h.api.findReleases();check('missing Manifest is reported without losing public Core link',h.api.getState().releaseIssues[0].reason.includes('no manifest.json')&&!!h.api.getState().releaseIssues[0].downloadURL);
 r=release(m);r.assets.pop();h=harness([r],{[r.assets[0].url]:m});await h.api.findReleases();check('missing Core asset is diagnosed and never selectable',h.api.getState().choices.length===0&&h.api.getState().releaseIssues[0].reason.includes('asset is missing'));
 m=manifest('1.0.0-rc1');r=release(m,'v1.0.0-rc.1');const catalog={schema_version:1,repository:'ygyuuffut/Synodic',releases:[{tag:r.tag_name,manifest_text:JSON.stringify(m),zip_sha256:'c'.repeat(64),zip_url:'https://raw.githubusercontent.com/ygyuuffut/Synodic/commit/core.zip'}]};h=harness([r],{},{catalog});h.api.setIndex();await h.api.findReleases();check('static catalog cannot bypass Tag/Manifest mismatch',h.api.getState().choices.length===0&&h.api.getState().releaseIssues[0].reason.includes('does not match'));
 m=manifest();r=release(m);catalog.releases[0].manifest_text=JSON.stringify(m);h=harness([r],{},{catalog});h.api.setIndex();await h.api.findReleases();check('valid static catalog discovers Core without Asset fetch',h.api.getState().choices.length===1&&h.api.getState().releaseIssues.length===0);
 m=manifest('1.0.0','stable');m.games[0].raw_sha256=['d'.repeat(64)];r=release(m);h=harness([r],{[r.assets[0].url]:m});await h.api.findReleases();
 check('forced loading is off by default',!h.api.getState().forceFingerprint&&h.api.getState().choices.length===0);
 h.el('force-load').checked=true;h.el('force-load').listeners.change();await h.api.findReleases();
 check('explicit force consent permits same-version modified-game candidate',h.api.getState().forceFingerprint&&h.api.getState().choices[0].forced);
 check('forced candidate is never recommended as compatible',!h.api.getState().choices[0].recommended&&h.tree().some(n=>n.textContent.includes('game compatibility unverified')));
 check('force warning remains visible',!h.el('force-warning').hidden);
 h.api.activateForced();check('selected forced Core is visibly at own risk',h.el('release-description').textContent.includes('Forced load')&&h.el('install-description').textContent.includes('own risk'));
 h.el('force-load').checked=false;h.el('force-load').listeners.change();
 check('turning force off revokes selected Core and export',!h.api.getState().selected&&!h.api.getState().output&&h.el('install-button').disabled&&h.el('force-warning').hidden);
 await h.api.findReleases();check('normal fingerprint gate returns after disabling force',h.api.getState().choices.length===0);
 h=harness([r],{[r.assets[0].url]:m},{confirmForce:false});h.el('force-load').checked=true;h.el('force-load').listeners.change();check('cancelled consent leaves force disabled',!h.api.getState().forceFingerprint&&!h.el('force-load').checked);
 m=manifest('1.0.0','stable');m.games[0].version='0.2002';r=release(m);h=harness([r],{[r.assets[0].url]:m});h.el('force-load').checked=true;h.el('force-load').listeners.change();await h.api.findReleases();check('force does not bypass declared-version selection',h.api.getState().choices.length===0);
 h.el('cancel-button').listeners.click();check('cancel resets force session',!h.api.getState().forceFingerprint&&!h.el('force-load').checked);
 m=manifest('1.0.0-rc1');r=release(m,'v1.0.0-rc.1');h=harness([r],{[r.assets[0].url]:m});h.el('force-load').checked=true;h.el('force-load').listeners.change();await h.api.findReleases();check('force does not bypass Release Tag validation',h.api.getState().choices.length===0&&h.api.getState().releaseIssues[0].reason.includes('does not match'));
 h=harness([],{});await h.api.findReleases();check('genuinely empty Release list still reports no releases',h.el('message').textContent.includes('No published SYNODIC Core yet'));
 console.log(JSON.stringify({pass:true,checks:checks.length,scope:'Node DOM harness; simulated responses; no file:// browser certification',names:checks},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
