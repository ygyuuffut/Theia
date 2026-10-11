/* THEIA local installer: classic script and Blob worker; no localhost or runtime imports. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),states=['unavailable','ready','working','complete','error'];
let worker=null,sequence=0,pending=new Map(),generation=0,game=null,selected=null,output=null,outputURL=null,busy=false,controller=null,repo='ygyuuffut/Synodic',indexURL='',forceFingerprint=false,choices=[],releaseIssues=[],localChoice=null,officialDigests=[];
function setState(step,state){if(!states.includes(state))throw Error('Invalid UI state');const el=$(step+'-step');el.dataset.state=state;el.querySelector('.status-symbol').setAttribute('aria-label',state[0].toUpperCase()+state.slice(1));el.setAttribute('aria-busy',String(state==='working'));}
function message(text,error=false){$('message').textContent=text;$('message').dataset.error=String(error);}
function placeholder(step,text){$(step+'-placeholder').textContent=text;$(step+'-placeholder').hidden=false;$(step+'-content').hidden=true;}
function content(step,title,description){$(step+'-placeholder').hidden=true;$(step+'-content').hidden=false;$(step+'-title').textContent=title;$(step+(step==='game'?'-version':'-description')).textContent=description;}
function clearOutput(){output=null;if(outputURL){URL.revokeObjectURL(outputURL);outputURL=null;}}
function outputName(){return game?.name.toLowerCase()==='stg-synodic.html'?'STG-SYNODIC-installed.html':'STG-SYNODIC.html';}
function makeWorker(){
 const source=new TextDecoder().decode(Uint8Array.from(atob($('theia-worker').textContent.trim()),c=>c.charCodeAt(0)));
 const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);
 worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.error?p.reject(Error(data.error)):p.resolve(data.result);};
 worker.onerror=()=>{for(const p of pending.values())p.reject(Error('Local processing failed. Please select the game again.'));pending.clear();};
}
function stopWorker(){if(worker)worker.terminate();worker=null;for(const p of pending.values())p.reject(Error('Cancelled'));pending.clear();}
function rpc(operation,data={},transfer=[]){if(!worker)makeWorker();return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});worker.postMessage({id,operation,...data},transfer);});}
function setBusy(value){busy=value;$('cancel-button').hidden=!value;$('game-button').disabled=value;$('release-button').disabled=value||!game;$('install-button').disabled=value||!selected;$('import-button').disabled=value;$('refresh-button').disabled=value;$('save-sources').disabled=value;$('show-preview').disabled=value;$('force-load').disabled=value||!game;}
function invalidatePackage(){selected=null;clearOutput();setState('install','unavailable');placeholder('install','Select a compatible Core first');$('install-button').disabled=true;}
function allowedURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)throw Error('Use a public HTTPS GitHub source');if(!['api.github.com','github.com','raw.githubusercontent.com','release-assets.githubusercontent.com'].includes(u.hostname))throw Error('Only GitHub static/release sources are supported');return u.href;}
async function fetchBytes(url,limit=16*1024*1024,accept='application/octet-stream'){
 const requestController=controller,timeout=setTimeout(()=>requestController.abort(),25000);
 try{const r=await fetch(allowedURL(url),{credentials:'omit',signal:requestController.signal,headers:{Accept:accept}});
  if(!r.ok){if(r.status===403||r.status===429){const reset=r.headers.get('x-ratelimit-reset');throw Error('GitHub request unavailable ('+r.status+'). '+(reset?'Retry after '+new Date(Number(reset)*1000).toLocaleTimeString()+'. ':'')+'You can import a local Core ZIP.');}throw Error('GitHub request failed ('+r.status+'). You can import a local Core ZIP.');}
  const declared=Number(r.headers.get('content-length'));if(declared>limit)throw Error('Download exceeds the supported limit');
  const reader=r.body.getReader(),chunks=[];let count=0;for(;;){const {done,value}=await reader.read();if(done)break;count+=value.length;if(count>limit){await reader.cancel();throw Error('Download exceeds the supported limit');}chunks.push(value);}
  const bytes=new Uint8Array(count);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length;}return bytes;
 }finally{clearTimeout(timeout);}
}
async function fetchJSON(url,limit=2*1024*1024){return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await fetchBytes(url,limit,'application/vnd.github+json')));}
function fingerprintMatches(m){return !!m.games.find(g=>g.version===game.version)?.raw_sha256.includes(game.hash);}
function suitable(m){return !!m.games.find(g=>g.version===game.version)&&(forceFingerprint||fingerprintMatches(m));}
function resetForce(){forceFingerprint=false;$('force-load').checked=false;$('force-warning').hidden=true;$('force-options').open=false;}
function changeForce(){
 if(busy||!game){$('force-load').checked=forceFingerprint;return;}
 const enabled=$('force-load').checked;if(enabled===forceFingerprint)return;
 if(enabled&&!window.confirm('Force load modified game?\n\nThis skips ONLY the original-game fingerprint check. Modified games may have broken card effects, ghost choices, story errors or unusable saves. Compatibility is not guaranteed. Back up your game and saves. Use at your own risk.\n\nCore integrity, declared game version and duplicate-injection checks remain required.')){$('force-load').checked=false;return;}
 generation++;controller?.abort();forceFingerprint=enabled;$('force-warning').hidden=!enabled;invalidatePackage();localChoice=null;choices=[];releaseIssues=[];rpc('clear-package').catch(()=>{});setState('release','ready');placeholder('release',enabled?'Select Core for forced loading':'Select compatible release or import ZIP');renderChoices();message(enabled?'Force load enabled at your own risk. Select or import the Core again. Modified-game compatibility is unverified.':'Force load disabled. Select or import a Core again; the original-game fingerprint is required.');
}
function releaseFallback(r,reason){
 const assets=(r.assets||[]).filter(a=>/^synodic-core-.+\.zip$/.test(a.name));
 let downloadURL=null;if(assets.length===1){try{downloadURL=allowedURL(assets[0].browser_download_url);}catch{}}
 return {tag:r.tag_name,preview:!!r.prerelease,releaseURL:`https://github.com/${repo}/releases/tag/${encodeURIComponent(r.tag_name)}`,downloadURL,reason};
}
function renderChoices(){
 const list=$('release-list');list.replaceChildren();const preview=$('show-preview').checked;
 const visible=choices.filter(c=>preview||!['rc','beta'].includes(c.manifest.channel)).sort((a,b)=>(a.manifest.channel==='stable'?0:1)-(b.manifest.channel==='stable'?0:1)||compareVersions(b.manifest.release_version,a.manifest.release_version));
 for(const c of visible){const b=document.createElement('button');b.type='button';b.className='release-choice';const title=document.createElement('strong'),detail=document.createElement('span');title.textContent=c.manifest.display_version||'v'+c.manifest.release_version;detail.textContent=c.local?(c.info.forced?'Local ZIP · forced load · game compatibility unverified':'Local ZIP · file integrity checked'):c.forced?c.manifest.channel.toUpperCase()+' · Force load candidate · STG '+game.version+' · game compatibility unverified':c.manifest.channel.toUpperCase()+' · Compatible with STG '+game.version+(c.recommended?' · Recommended':'');b.append(title,detail);b.disabled=busy;b.addEventListener('click',()=>choose(c));list.append(b);}
 const issues=releaseIssues.filter(r=>preview||!r.preview),hiddenPreviews=new Set([...choices.filter(c=>!c.local&&['rc','beta'].includes(c.manifest.channel)).map(c=>'v'+c.manifest.release_version),...releaseIssues.filter(r=>r.preview).map(r=>r.tag)]).size;
 $('preview-note').hidden=preview||!hiddenPreviews;$('preview-note').textContent=`${hiddenPreviews} published RC/Beta release(s) hidden. Enable “Show RC & Beta releases” to view them.`;
 if(!visible.length){const p=document.createElement('p');p.className='muted';p.textContent=!preview&&hiddenPreviews?'Preview releases are available. Enable “Show RC & Beta releases” above.':issues.length?'Published releases are listed below. Compatibility will be checked when you import the ZIP.':'No readable compatible Core found. Import a Core ZIP or check GitHub releases.';list.append(p);}
 if(issues.length){const heading=document.createElement('p');heading.className='muted compact';heading.textContent='Published releases requiring local import';list.append(heading);}
 for(const r of issues){
  const row=document.createElement('div');row.className='release-fallback';const title=document.createElement('strong'),detail=document.createElement('p'),actions=document.createElement('div');title.textContent=r.tag+(r.preview?' · Preview':'');detail.className='muted compact';detail.textContent=r.reason+' Compatibility has not been confirmed.';actions.className='dialog-actions';
  const link=document.createElement('a');link.href=r.downloadURL||r.releaseURL;link.target='_blank';link.rel='noopener noreferrer';link.textContent=r.downloadURL?'Download Core ZIP…':'Open Release…';const button=document.createElement('button');button.type='button';button.textContent='Import Core ZIP…';button.disabled=busy;button.addEventListener('click',()=>$('core-file').click());actions.append(link,button);row.append(title,detail,actions);list.append(row);
 }
}
async function findReleases(){
 if(!game||busy)return;const current=++generation;controller=new AbortController();setBusy(true);setState('release','working');$('release-note').textContent='Checking GitHub releases…';message('Finding compatible releases…');
 try{
  let releases=[],page=1;for(;page<=10;page++){const rows=await fetchJSON(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`,8*1024*1024);if(!Array.isArray(rows))throw Error('Invalid GitHub release list');releases.push(...rows);if(rows.length<100)break;}if(page>10)throw Error('Release list is incomplete. Use a local ZIP.');
  officialDigests=releases.filter(r=>!r.draft).flatMap(r=>(r.assets||[]).filter(a=>/^sha256:[a-f0-9]{64}$/.test(a.digest||'')).map(a=>({tag:r.tag_name,prerelease:r.prerelease,asset:a.name,hash:a.digest.slice(7)})));
  let catalog=null;if(indexURL){catalog=await fetchJSON(indexURL);if(catalog.schema_version!==1||catalog.repository!==repo||!Array.isArray(catalog.releases))throw Error('Distribution index does not match this repository');}
  const found=[],issues=[];let unreadable=0;
  for(const r of releases){if(r.draft)continue;const entry=catalog?.releases.find(e=>e.tag===r.tag_name);let manifestText=null,manifest=null,zipURL=null,zipHash=null;
   try{
    if(entry){if(!/^[a-f0-9]{64}$/.test(entry.zip_sha256))throw Error('Missing catalog ZIP hash');manifestText=entry.manifest_text;if(typeof manifestText!=='string')throw Error('Missing exact Manifest text');manifest=await rpc('validate-manifest',{manifest:JSON.parse(manifestText)});zipURL=allowedURL(entry.zip_url);zipHash=entry.zip_sha256;}
    else{const asset=r.assets.find(a=>a.name==='manifest.json');if(!asset){if((r.assets||[]).some(a=>/^synodic-core-.+\.zip$/.test(a.name)))throw Error('Release has no manifest.json asset.');continue;}const bytes=await fetchBytes(asset.url,256*1024,'application/octet-stream');manifestText=new TextDecoder('utf-8',{fatal:true}).decode(bytes);manifest=await rpc('validate-manifest',{manifest:JSON.parse(manifestText)});const zip=r.assets.find(a=>a.name===manifest.asset_name);if(!zip)throw Error('Manifest Core ZIP asset is missing.');zipURL=zip.url;zipHash=/^sha256:[a-f0-9]{64}$/.test(zip.digest||'')?zip.digest.slice(7):null;if(!zipHash)throw Error('Missing official ZIP digest');}
    if(r.tag_name!=='v'+manifest.release_version)throw Error('Release Tag '+r.tag_name+' does not match Manifest version '+manifest.release_version+'.');
    if(r.prerelease!==['rc','beta'].includes(manifest.channel))throw Error('Release prerelease flag does not match the Manifest channel.');
    if(!suitable(manifest))continue;
    found.push({manifest,manifestText,zipURL,zipHash,local:false,forced:!fingerprintMatches(manifest)});
   }catch(e){if(controller.signal.aborted)throw e;issues.push(releaseFallback(r,e instanceof TypeError?'Manifest could not be read (network/CORS). Download the Core ZIP and import it locally.':e.message));unreadable++;if(unreadable>=3)break;}
  }
  if(current!==generation)return;const recommended=unreadable?null:found.filter(c=>c.manifest.channel==='stable'&&!c.forced).sort((a,b)=>compareVersions(b.manifest.release_version,a.manifest.release_version))[0];if(recommended)recommended.recommended=true;choices=[...(localChoice?[localChoice]:[]),...found];releaseIssues=issues;renderChoices();
  $('release-note').textContent=releases.length===0?'SYNODIC has no published releases yet. Import a local Core ZIP when available.':unreadable?'Published releases were found, but online verification is unavailable or their metadata does not match. See the local-import options below. The compatible list is incomplete.':found.some(c=>c.forced)?'Choose a Core for forced loading. Modified-game compatibility is unverified.':found.length?'Choose a compatible version to confirm.':'No compatible release was found for this game fingerprint.';
  setState('release',selected?'complete':'ready');if(!selected)placeholder('release',found.some(c=>c.forced)?'Select Core for forced loading':found.length?'Select a compatible version':'Import Core ZIP or find releases');
  const hiddenPreview=!$('show-preview').checked&&(found.some(c=>['rc','beta'].includes(c.manifest.channel))||issues.some(r=>r.preview));
  message(releases.length===0?'No published SYNODIC Core yet. You can import a local ZIP.':hiddenPreview&&!found.some(c=>c.manifest.channel==='stable')?'Published RC/Beta found. Open SYNODIC Release and enable “Show RC & Beta releases”. Download and import the Core ZIP if online verification is unavailable.':found.some(c=>c.forced)?'Core candidates found for forced loading. Modified-game compatibility is unverified. Confirm a Core to continue.':found.length?'Compatible releases found. Confirm a version to continue.':issues.length?'Published releases found. Open SYNODIC Release to download and import a Core ZIP. Online compatibility could not be confirmed.':'No readable compatible Core found. Import a local ZIP.');
 }catch(e){if(current!==generation)return;setState('release',selected?'complete':'error');$('release-note').textContent=e.message;message(e.name==='AbortError'?'GitHub request timed out or was cancelled. Import a local ZIP or retry.':e.message,true);}
 finally{if(current===generation){setBusy(false);renderChoices();}}
}
async function choose(c){
 if(busy)return;if(c.local){await loadCore(c.file);return;}
 const current=++generation;controller=new AbortController();invalidatePackage();setBusy(true);setState('release','working');message('Downloading and verifying SYNODIC Core…');
 try{const bytes=await fetchBytes(c.zipURL);const info=await rpc('package',{bytes:bytes.buffer,forceFingerprint,expected:{zipHash:c.zipHash,manifestText:c.manifestText,releaseVersion:c.manifest.release_version}},[bytes.buffer]);if(current!==generation)return;activate({...c,info});}
 catch(e){if(current!==generation)return;setState('release','error');message('Core download or verification failed. Download the ZIP from GitHub and import it locally. '+e.message,true);}
 finally{if(current===generation){setBusy(false);renderChoices();}}
}
function activate(c){
 selected=c;clearOutput();const description=c.local?(c.info.originVerified?'Local ZIP · matches GitHub Release digest':'Local ZIP · integrity checked; origin not verified'):c.recommended?'Recommended Compatible Release · verified':'Core integrity verified · '+c.manifest.channel+' release';
 content('release',c.manifest.display_version||'v'+c.manifest.release_version,c.info.forced?'Forced load · '+description+' · game compatibility unverified':description);setState('release','complete');content('install','Export: '+outputName(),c.info.forced?'Forced load · use at your own risk':'Original file will not be overwritten');$('install-hint').textContent=c.info.forced?'Click to install at your own risk':'Click to install';setState('install','ready');$('install-button').disabled=false;$('release-dialog').close();message(c.info.forced?'Core integrity checked. Forced loading at your own risk; modified-game compatibility is unverified.':'Compatible Core selected. Ready to install.');
}
async function loadGame(file){
 if(!file)return;const current=++generation;controller?.abort();stopWorker();resetForce();game=null;localChoice=null;choices=[];releaseIssues=[];officialDigests=[];invalidatePackage();placeholder('install','Game must be selected first');setBusy(true);setState('game','working');setState('release','unavailable');placeholder('game','Reading game…');placeholder('release','Game must be selected first');message('Reading the original game locally…');
 try{if(file.size>64*1024*1024)throw Error('Game file exceeds 64 MiB');const bytes=await file.arrayBuffer();const info=await rpc('game',{bytes},[bytes]);if(current!==generation)return;game={...info,name:file.name};content('game','Game File: '+file.name,'Version: '+info.version);setState('game','complete');setState('release','ready');placeholder('release','Select compatible release or import ZIP');message('Game read locally. Choose a compatible SYNODIC Core.');}
 catch(e){if(current!==generation)return;setState('game','error');placeholder('game','Select another original game');message(e.message,true);}
 finally{if(current===generation){setBusy(false);if(game)findReleases();}}
}
async function loadCore(file){
 if(!file||!game)return;const current=++generation;controller?.abort();invalidatePackage();localChoice=null;choices=choices.filter(c=>!c.local);setBusy(true);setState('release','working');message('Verifying local Core ZIP…');
 try{if(file.size>16*1024*1024)throw Error('Core ZIP exceeds 16 MiB');let bytes=await file.arrayBuffer(),info=await rpc('package',{bytes,forceFingerprint},[bytes]);if(current!==generation)return;const digest=officialDigests.find(d=>d.tag==='v'+info.manifest.release_version&&d.asset===info.manifest.asset_name&&d.prerelease===['rc','beta'].includes(info.manifest.channel));if(digest){bytes=await file.arrayBuffer();info=await rpc('package',{bytes,forceFingerprint,expected:{zipHash:digest.hash,releaseVersion:info.manifest.release_version}},[bytes]);}if(current!==generation)return;localChoice={manifest:info.manifest,info,file,local:true};choices.unshift(localChoice);activate(localChoice);}
 catch(e){if(current!==generation)return;setState('release','error');placeholder('release','Import a compatible Core ZIP');if(e.message.includes('game fingerprint'))$('force-options').open=true;message(e.message,true);}
 finally{if(current===generation){setBusy(false);renderChoices();}}
}
function download(){if(!outputURL)return;const a=document.createElement('a');a.href=outputURL;a.download=outputName();a.hidden=true;document.body.append(a);a.click();a.remove();message(selected.info.forced?'Forced-load HTML generated. Download requested; game compatibility is unverified. Your original file was not changed.':'New HTML verified. Download requested; your original file was not changed.');}
async function install(){
 if(!selected||busy)return;if(output){download();return;}const current=++generation;setBusy(true);setState('install','working');message('Installing LUNAR + MOONSHINE locally…');
 try{const result=await rpc('install',{forceFingerprint});if(current!==generation)return;output={hash:result.hash,version:result.version};outputURL=URL.createObjectURL(new Blob([result.bytes],{type:'text/html;charset=utf-8'}));setState('install','complete');content('install','Export: '+outputName(),selected.info.forced?'HTML generated · forced load · original file unchanged':'New HTML verified · original file unchanged');$('install-hint').textContent='Click again to download';download();}
 catch(e){if(current!==generation)return;clearOutput();setState('install','error');$('install-hint').textContent='Click to retry installation';message('Installation failed; no output was exported. '+e.message,true);}
 finally{if(current===generation)setBusy(false);}
}
$('game-button').addEventListener('click',()=>$('game-file').click());$('game-file').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';loadGame(f);});
$('release-button').addEventListener('click',()=>{renderChoices();$('release-dialog').showModal();});$('install-button').addEventListener('click',install);
$('import-button').addEventListener('click',()=>$('core-file').click());$('core-file').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';loadCore(f);});$('refresh-button').addEventListener('click',findReleases);$('show-preview').addEventListener('change',renderChoices);
$('force-load').addEventListener('change',changeForce);
$('settings-button').addEventListener('click',()=>$('settings-dialog').showModal());
$('save-sources').addEventListener('click',()=>{try{const value=$('repository').value.trim();if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value))throw Error('Enter owner/repository');const nextIndex=$('index-url').value.trim();if(nextIndex)allowedURL(nextIndex);repo=value;indexURL=nextIndex;officialDigests=[];choices=localChoice?[localChoice]:[];releaseIssues=[];if(selected&&!selected.local){invalidatePackage();rpc('clear-package').catch(()=>{});setState('release',game?'ready':'unavailable');placeholder('release',game?'Select compatible release or import ZIP':'Game must be selected first');}message('Sources updated.');$('settings-dialog').close();}catch(e){message(e.message,true);}});
$('cancel-button').addEventListener('click',()=>{generation++;controller?.abort();stopWorker();resetForce();game=null;selected=null;localChoice=null;choices=[];releaseIssues=[];clearOutput();setState('game','ready');setState('release','unavailable');setState('install','unavailable');placeholder('game','Select Game…');placeholder('release','Game must be selected first');placeholder('install','Game must be selected first');setBusy(false);message('Cancelled. Select the original game to start again.');});
window.addEventListener('pagehide',()=>{controller?.abort();stopWorker();clearOutput();});
try{if(typeof Worker!=='function'||!crypto.subtle)throw Error('This browser does not support local verification. Use a current browser with Web Crypto and Worker support.');makeWorker();}catch(e){$('game-button').disabled=true;message(e.message,true);}
})();
