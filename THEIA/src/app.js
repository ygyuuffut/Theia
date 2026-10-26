/* THEIA 1.0.3: three-step local wizard. Input/package code is never executed here. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const screens=['game-screen','core-screen','catalog-screen','install-screen'];
const client=TheiaDistribution.createClient();
let worker=null,sequence=0,pending=new Map(),generation=0,viewEpoch=0,productEpoch=0;
let game=null,selected=null,compatibility=null,forceInstall=false,output=null,outputURL=null;
let step=1,product='theia',screen='game-screen',catalogOpen=false,busy=false,controller=null;
let repo='ygyuuffut/Synodic',indexURL='',catalog=null,catalogError='',highlighted=null;
let phase='ready',compatibilityWarned=false;
let productSwitching=false,switchChain=Promise.resolve();
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
function translated(english,chinese){
 const nav=globalThis.navigator;
 const language=nav?.languages?.[0]||nav?.language||'en';
 return /^zh(?:-|$)/i.test(language)?chinese:english;
}
function productLabels(){
 const other=product==='theia'?'hyperion':'theia';
 for(const [id,value] of [['switch-label-previous',other],['switch-label-current',product],['switch-label-next',other]]){
  const label=$(id),word=document.createElement('b'),moon=document.createElement('span');
  label.dataset.product=value;word.className='synodic-word';moon.className='moon-dot';
  word.append('SYN',moon,'DIC');label.replaceChildren(word,document.createTextNode(value==='theia'?' Installer':' Mods'));
 }
}

function message(text='',kind=''){
 $('message').textContent=text;
 $('message').dataset.error=String(kind==='error');
 $('message').dataset.warning=String(kind==='warning');
}
function clearOutput(){
 output=null;if(outputURL){URL.revokeObjectURL(outputURL);outputURL=null;}
 phase='ready';
}
function outputName(){
 return game?.name.toLowerCase()==='stg-synodic.html'?'STG-SYNODIC-installed.html':'STG-SYNODIC.html';
}
function resetForce(){
 forceInstall=false;$('force-install').checked=false;compatibilityWarned=false;
}
function forgetCore(){
 selected=null;compatibility=null;resetForce();clearOutput();
 $('fallback-download').hidden=true;
}
function makeWorker(){
 const source=new TextDecoder().decode(Uint8Array.from(atob($('theia-worker').textContent.trim()),c=>c.charCodeAt(0)));
 const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
 let instance;
 try{instance=new Worker(url);worker=instance;}finally{URL.revokeObjectURL(url);}
 worker.onmessage=({data})=>{
  if(instance!==worker)return;
  const p=pending.get(data.id);if(!p)return;pending.delete(data.id);
  data.error?p.reject(Object.assign(Error(data.error),{code:data.code})):p.resolve(data.result);
 };
 worker.onerror=()=>{
  if(instance!==worker)return;
  generation++;
  for(const p of pending.values())p.reject(Error('Local processing failed. Select the game again.'));
  pending.clear();worker?.terminate();worker=null;game=null;forgetCore();step=1;catalogOpen=false;
  setBusy(false);showScreen('game-screen');message('Local processing stopped. Select your game again.','error');
 };
}
function stopWorker(){
 worker?.terminate();worker=null;
 for(const p of pending.values())p.reject(new DOMException('Cancelled','AbortError'));
 pending.clear();
}
function rpc(operation,data={},transfer=[]){
 if(!worker)makeWorker();
 return new Promise((resolve,reject)=>{
  const id=++sequence;pending.set(id,{resolve,reject});
  try{worker.postMessage({id,operation,...data},transfer);}catch(error){pending.delete(id);reject(error);}
 });
}
function paint(){
 const locked=busy||productSwitching;
 $('game-plus').hidden=!!game;$('game-summary').hidden=!game;
 if(game){$('game-name').textContent=game.name;$('game-version').textContent=game.version;}
 $('core-options').hidden=!!selected;$('core-candidate').hidden=!selected;
 if(selected){
  $('core-version').textContent='SYNODIC - '+selected.info.manifest.release_version;
  $('core-source').textContent=selected.local?'Installing From Local Zip File':'Installing From Web';
  $('install-core-version').textContent='SYNODIC - '+selected.info.manifest.release_version;
 }
 $('export-name').textContent=outputName();
 $('compatibility-label').textContent=compatibility?(compatibility.compatible?'Compatible':'Not Compatible'):'Checking…';
 $('compatibility-label').dataset.compatible=compatibility?String(compatibility.compatible):'unknown';
 $('force-install').checked=forceInstall;
 $('install-heading').textContent=phase==='complete'?'SYNODIC Installed':phase==='error'?'Installation Failed':phase==='working'?'Installing SYNODIC…':'Ready for Installation';
 document.body.dataset.result=step===3?phase:'ready';
 document.body.dataset.working=String(busy);
 $('wizard-card').setAttribute('aria-busy',String(busy));
 $('step-number').textContent=step+'/3';
 $('step-progress').setAttribute('aria-valuenow',String(step));
 $('step-progress').setAttribute('aria-valuetext','Step '+step+' of 3'+(busy?' — working':''));
 $('step-progress-fill').style.width=(step/3*100)+'%';
 $('previous-button').textContent=step===1?'This is the Start':'Previous Step';
 $('previous-button').disabled=locked||step===1;
 $('continue-button').textContent=step===3?'Install & Save As':'Continue';
 $('continue-button').dataset.action=step===3?'install':'continue';
 $('continue-button').disabled=locked||(step===1?!game:step===2?!selected:!selected||!compatibility||!compatibility.compatible&&!forceInstall);
 for(const id of ['game-button','catalog-button','import-button','core-candidate','refresh-button','show-preview','catalog-close','save-sources'])$(id).disabled=locked;
 for(const id of ['product-previous','product-next'])$(id).disabled=busy;
 $('force-install').disabled=locked||!selected||!compatibility;
 $('obtain-button').disabled=locked||!highlighted||highlighted.blocked===true;
 $('cancel-button').hidden=!busy;
}
function setBusy(value){busy=value;paint();}
async function showScreen(id){
 const token=++viewEpoch;
 const previous=$(screen);screen=id;
 if(previous.id===id&&!previous.hidden){previous.classList.add('is-active');previous.inert=false;return;}
 previous.classList.remove('is-active');previous.inert=true;
 if(!reducedMotion())await delay(180);
 if(token!==viewEpoch)return;
 for(const name of screens){$(name).hidden=name!==id;$(name).inert=name!==id;$(name).classList.remove('is-active');}
 void $(id).offsetWidth;$(id).classList.add('is-active');
}
async function changeStep(next){
 if(busy||next<1||next>3||next>1&&!game||next>2&&!selected)return;
 step=next;catalogOpen=false;paint();
 showScreen(next===1?'game-screen':next===2?'core-screen':'install-screen');
 if(next===3)await checkCompatibility();
}
function switchProduct(direction=1){
 if(busy)return Promise.resolve();
 const job=switchChain.then(()=>animateProduct(direction));
 switchChain=job.catch(error=>{productSwitching=false;paint();message(error.message,'error');});
 return job;
}
async function animateProduct(direction){
 if(busy)return;
 productSwitching=true;paint();
 const epoch=++productEpoch,old=$(product==='theia'?'installer-page':'hyperion-page');
 const track=$('switch-title-track');
 track.style.transition='none';track.style.transform='translateX(-33.333333%)';productLabels();void track.offsetWidth;
 track.style.transition='';track.style.transform=direction<0?'translateX(-66.666667%)':'translateX(0%)';
 product=product==='theia'?'hyperion':'theia';
 document.body.dataset.product=product;
 $('product-title').textContent=product==='theia'?'THEIA — SYNODIC Installer':'HYPERION — SYNODIC Mods';
 old.style.opacity='0';old.inert=true;
 if(!reducedMotion())await delay(180);
 if(epoch!==productEpoch){productSwitching=false;paint();return;}
 for(const name of ['installer-page','hyperion-page']){$(name).hidden=true;$(name).inert=true;}
 const target=$(product==='theia'?'installer-page':'hyperion-page');
 target.hidden=false;target.style.opacity='0';void target.offsetWidth;target.inert=false;target.style.opacity='1';
 if(!reducedMotion())await delay(320);
 if(epoch===productEpoch){track.style.transition='none';productLabels();track.style.transform='translateX(-33.333333%)';void track.offsetWidth;track.style.transition='';}
 productSwitching=false;paint();
}
async function loadGame(file){
 if(!file||busy)return;
 const current=++generation;controller?.abort();stopWorker();game=null;forgetCore();
 step=1;catalogOpen=false;highlighted=null;catalogError='';setBusy(true);showScreen('game-screen');
 message('Reading your game locally…');
 try{
  if(file.size>64*1024*1024)throw Error('Game file exceeds 64 MiB.');
  const bytes=await file.arrayBuffer();if(current!==generation)return;
  const info=await rpc('game',{bytes},[bytes]);
  if(current!==generation)return;
  game={...info,name:file.name};message();
 }catch(error){
  if(current!==generation)return;
  const text=error.code==='INVALID_STG'?translated('This file does not look right: no STG header was found. Please select another file.','文件不對勁，沒有STG的抬頭，需要重新選擇'):error.message;
  message(text,'error');window.alert(text);
 }finally{if(current===generation)setBusy(false);}
}
async function resetCore(){
 if(busy)return;const current=++generation;forgetCore();catalogOpen=false;setBusy(true);
 try{await rpc('clear-package');if(current!==generation)return;message();}
 catch(error){if(current===generation)message(error.message,'error');}
 finally{if(current===generation){setBusy(false);showScreen('core-screen');}}
}
async function importBytes(bytes,expected){
 return rpc('package',{bytes,expected},[bytes]);
}
function activate(info,local){
 selected={info,local};compatibility=null;resetForce();clearOutput();catalogOpen=false;
 $('fallback-download').hidden=true;
 message(info.originVerified?'':'Core integrity checked; package origin is not independently verified.','warning');
 paint();showScreen('core-screen');
}
async function loadCore(file){
 if(!file||!game||busy)return;const current=++generation;forgetCore();setBusy(true);
 message('Checking SYNODIC Core ZIP integrity…');
 try{
  await rpc('clear-package');if(current!==generation)return;
  if(file.size>16*1024*1024)throw Error('Core ZIP exceeds 16 MiB.');
  let bytes=await file.arrayBuffer();if(current!==generation)return;
  let info=await importBytes(bytes);
  if(current!==generation)return;
  const manifest=info.manifest;
  const digest=catalog?.officialDigests.find(d=>d.version===manifest.release_version&&d.asset===manifest.asset_name&&d.preview===['rc','beta'].includes(manifest.channel));
  if(digest){bytes=await file.arrayBuffer();if(current!==generation)return;info=await importBytes(bytes,{zipHash:digest.hash,releaseVersion:manifest.release_version});}
  if(current!==generation)return;activate(info,true);
 }catch(error){
  if(current!==generation)return;
  forgetCore();catalogOpen=false;showScreen('core-screen');
  const text=translated('This ZIP is not a usable SYNODIC Core, or its integrity check failed. Please select another ZIP.','這個 ZIP 不是可用的 SYNODIC Core，或完整性檢查失敗，請重新選擇。')+'\n\n'+error.message;
  message(text,'error');window.alert(text);
 }finally{if(current===generation)setBusy(false);}
}
function compatibleCandidates(){
 const all=catalog?.choices||[];
 return all.filter(c=>!c.manifest||c.manifest.games.some(g=>g.version===game?.version)).sort((a,b)=>compareVersions(b.version,a.version));
}
function releaseNotes(candidate){
 if(candidate){
  TheiaNotes.render($('release-notes'),candidate.notes,{repository:repo,tag:candidate.tag});
  return;
 }
 const text=catalogError?'The release source could not be read. Retry later, check your connection, or import a local Core ZIP.':
  'Using a Beta/RC version means accepting the risk of visual artifacts, glitches and other preview-version issues.\n\nIf you believe a version is missing, check the SYNODIC releases before submitting a ticket using ISSUES at the bottom of this page.';
 TheiaNotes.render($('release-notes'),text,{repository:repo});
}
function renderCatalog({focus=false}={}){
 const all=compatibleCandidates(),visible=all.filter(c=>$('show-preview').checked||!c.preview);
 if(!visible.some(c=>c.id===highlighted?.id)){
  highlighted=visible.find(c=>c.verifiedMetadata&&!c.preview&&!c.blocked)||visible.find(c=>c.verifiedMetadata&&!c.blocked)||null;
 }
 const list=$('release-list');list.replaceChildren();
 const firstSelectable=visible.find(c=>!c.blocked);
 $('catalog-heading').textContent=visible.some(c=>!c.verifiedMetadata)?'Published Versions':'Compatible Versions';
 for(const candidate of visible){
  const button=document.createElement('button');button.type='button';button.className='release-choice';
  button.setAttribute('role','option');button.setAttribute('aria-selected',String(candidate.id===highlighted?.id));
  button.setAttribute('tabindex',candidate.id===highlighted?.id||!highlighted&&candidate===firstSelectable?'0':'-1');
  button.disabled=busy||candidate.blocked===true;
  const title=document.createElement('span');title.textContent='SYNODIC - '+candidate.version;button.append(title);
  button.setAttribute('aria-label',title.textContent+(!candidate.verifiedMetadata?translated(' — compatibility not verified',' — 相容性尚未確認'):''));
  function choose(){highlighted=candidate;renderCatalog({focus:true});}
  button.addEventListener('click',choose);
  button.addEventListener('keydown',event=>{
   if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;event.preventDefault();
   const enabled=visible.filter(c=>!c.blocked),at=enabled.findIndex(c=>c.id===candidate.id);
   highlighted=enabled[event.key==='Home'?0:event.key==='End'?enabled.length-1:(at+(event.key==='ArrowUp'?-1:1)+enabled.length)%enabled.length]||null;
   renderCatalog({focus:true});
  });
  list.append(button);
 }
 if(!visible.length){
  const box=document.createElement('div');box.className='empty-catalog';
  const lines=catalogError?['The catalog could not be loaded.','Check your connection or import a local Core ZIP.']:
   !$('show-preview').checked&&all.some(c=>c.preview)?['It appears that there is no stable SYNODIC release for your STG.','But there are Beta/RC versions available.',':)']:
   ['Oops, no matching SYNODIC for your STG at the moment.',':('];
  for(const text of lines){const p=document.createElement('p');p.textContent=text;box.append(p);}list.append(box);
 }
 const note=catalogError||catalog?.warning||'';
 const details=[...new Set([note,highlighted?.metadataError,...(catalog?.choices||[]).filter(c=>!c.verifiedMetadata).map(c=>c.metadataError)].filter(Boolean))].slice(0,4).join('\n\n');
 $('catalog-status').textContent=note;
 $('catalog-info-wrap').hidden=!details;
 $('catalog-info-tooltip').textContent=details?translated('Some release information could not be read. Connection or CORS restrictions, GitHub rate limits, or a temporary source problem may be responsible. Unreadable metadata does not mean your game is unsupported. Compatibility is checked after import.','部分版本資訊無法讀取，可能與連線、CORS 限制、GitHub 查詢限額或來源暫時異常有關。讀不到資訊不代表遊戲不受支援；匯入後仍會檢查相容性。')+'\n\n'+details:'';
 releaseNotes(highlighted);paint();
 if(focus)list.querySelector('[aria-selected="true"]')?.focus();
}
async function findReleases(refresh=false){
 if(!game||busy)return;catalogOpen=true;showScreen('catalog-screen');
 const current=++generation;controller=new AbortController();catalogError='';setBusy(true);message();
 $('catalog-info-wrap').hidden=true;$('catalog-status').textContent='Reading the catalog…';
 try{
  const result=await client.list({repository:repo,indexURL,signal:controller.signal,refresh,
   validateManifest:manifest=>rpc('validate-manifest',{manifest}),
   onStatus:text=>{if(current===generation)$('catalog-status').textContent=text;}
  });
  if(current!==generation)return;catalog=result;highlighted=null;message();
 }catch(error){if(current!==generation)return;catalogError=error.message;catalog=null;highlighted=null;}
 finally{if(current===generation){setBusy(false);renderCatalog();}}
}
function manualDownload(candidate){
 const href=TheiaDistribution.allowedURL(candidate.downloadURL);
 const link=$('fallback-download');link.href=href;link.hidden=false;
 link.download=candidate.manifest?.asset_name||decodeURIComponent(new URL(href).pathname.split('/').pop());
 // A cross-origin download attribute is a hint; keep a real link if the browser blocks this click.
 link.click();
}
async function obtain(){
 const candidate=highlighted;if(!candidate||candidate.blocked||busy||!game)return;
 const current=++generation;controller=new AbortController();forgetCore();setBusy(true);
 message('Downloading SYNODIC Core…');
 try{
  const data=await client.bytes(candidate.zipURL,{signal:controller.signal,onProgress:(count,total)=>{
   if(current===generation)message('Downloading SYNODIC Core… '+(total?Math.min(100,Math.floor(count/total*100))+'%':Math.ceil(count/1024)+' KiB'));
  }});
  if(current!==generation)return;
  message('Verifying SYNODIC Core…');
  const expected={releaseVersion:candidate.version};
  if(candidate.zipHash)expected.zipHash=candidate.zipHash;
  if(candidate.manifestText!==null)expected.manifestText=candidate.manifestText;
  const info=await importBytes(data.buffer,expected);
  if(current!==generation)return;activate(info,false);
 }catch(error){
  if(current!==generation)return;forgetCore();catalogOpen=false;showScreen('core-screen');
  if(['NETWORK','HTTP','RATE_LIMIT'].includes(error.code)){
   message('Automatic import is unavailable. Download the Core ZIP, then choose Browse Locally. '+error.message,'warning');
   manualDownload(candidate);
   window.alert(translated('Automatic download and import is unavailable. A Core ZIP download was requested. If the browser blocked it, click Download Core ZIP. Then choose Browse Locally to import the downloaded ZIP.','無法自動下載並匯入。已嘗試開啟 Core ZIP 下載；若瀏覽器阻擋，請點擊 Download Core ZIP。下載後請選 Browse Locally 手動匯入。'));
  }else{
   message('Core verification failed. No package was loaded. '+error.message,'error');
   window.alert(translated('SYNODIC Core verification failed. Please select a valid Core ZIP.','SYNODIC Core 驗證失敗，請重新選擇有效的 Core ZIP。')+'\n\n'+error.message);
  }
 }finally{if(current===generation)setBusy(false);}
}
async function checkCompatibility(){
 if(!selected||!game)return;
 const current=++generation;compatibility=null;setBusy(true);
 try{
  const result=await rpc('compatibility');if(current!==generation)return;compatibility=result;
  if(!result.compatible){
   const why=result.reason==='version'?translated('This SYNODIC Core does not declare support for STG '+game.version+'.','這個 SYNODIC Core 未聲明支援 STG '+game.version+'。'):translated('The game fingerprint does not match this Core. The STG HTML may have been modified.','遊戲指紋與 Core 不符，STG HTML 可能已被修改。');
   message(why+' Enable FORCE INSTALL only if you accept the risks.','warning');
   if(!compatibilityWarned){compatibilityWarned=true;window.alert(why+'\n\n'+translated('Installation is disabled. To proceed at your own risk, enable FORCE INSTALL.','目前已停用安裝；若願意自負風險繼續，請啟用 FORCE INSTALL。'));}
  }else if(!selected.info.originVerified)message('Game compatibility matches. Package origin has not been independently verified.','warning');
  else message();
 }catch(error){if(current===generation){compatibility=null;message(error.message,'error');}}
 finally{if(current===generation)setBusy(false);}
}
async function changeForce(){
 const enabled=$('force-install').checked;$('force-install').checked=forceInstall;
 if(busy||!selected||!compatibility||enabled===forceInstall)return;
 if(enabled&&!window.confirm(translated('Enable FORCE INSTALL?\n\nThis permits installing a verified SYNODIC Core on a modified game or a different STG version. It may break card effects, story choices or saves. Back up your game and saves. Use at your own risk.\n\nCore package integrity, STG identity, duplicate-injection and native-content preservation checks remain mandatory.','啟用 FORCE INSTALL？\n\n這會允許把已驗證的 SYNODIC Core 安裝到修改版或不同版本的 STG，可能造成卡牌效果、劇情選項或存檔損壞。請先備份遊戲與存檔，後果自負。\n\nCore 完整性、STG 身份、重複注入與原生內容保留檢查仍不可略過。')))return;
 const current=++generation;clearOutput();setBusy(true);
 try{
  await rpc('force-install',{enabled,acknowledged:enabled});
  if(current!==generation)return;forceInstall=enabled;
  message(enabled?'FORCE INSTALL enabled. Game compatibility remains unverified; use at your own risk.':compatibility.compatible?'':'Installation is disabled until FORCE INSTALL is enabled.','warning');
 }catch(error){if(current===generation){forceInstall=false;message(error.message,'error');}}
 finally{if(current===generation)setBusy(false);}
}
function downloadOutput(){
 if(!outputURL)throw Error('No verified output is available.');
 const a=document.createElement('a');a.href=outputURL;a.download=outputName();a.hidden=true;document.body.append(a);
 try{a.click();}finally{a.remove();}
}
async function install(){
 if(busy||!selected||!compatibility||!compatibility.compatible&&!forceInstall)return;
 if(output){try{downloadOutput();}catch(error){clearOutput();phase='error';message(error.message,'error');paint();}return;}
 const current=++generation;clearOutput();phase='working';setBusy(true);
 message('Installing LUNAR + MOONSHINE locally…');
 try{
  const result=await rpc('install',{forceInstall});if(current!==generation)return;
  outputURL=URL.createObjectURL(new Blob([result.bytes],{type:'text/html;charset=utf-8'}));
  output={hash:result.hash,version:result.version,forced:result.forced};
  downloadOutput();phase='complete';
  message(result.forced?'HTML generated and download requested. Forced installation does not confirm game compatibility. Your original was not changed.':'New HTML verified and download requested. Your original game was not changed.');
 }catch(error){
  if(current!==generation)return;clearOutput();phase='error';
  message('Installation failed; no output was exported. '+error.message,'error');
 }finally{if(current===generation)setBusy(false);}
}
function cancel(){
 generation++;controller?.abort();stopWorker();game=null;forgetCore();step=1;catalogOpen=false;highlighted=null;
 setBusy(false);showScreen('game-screen');message('Cancelled. Select your game to start again.');
}
async function saveSources(){
 if(busy)return;
 try{
  const repository=$('repository').value.trim(),index=$('index-url').value.trim();
  if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository))throw Error('Enter owner/repository.');
  if(index)TheiaDistribution.allowedURL(index);
  repo=repository;indexURL=index;client.clearCache();catalog=null;highlighted=null;catalogError='';
  if(game){await resetCore();step=2;catalogOpen=false;showScreen('core-screen');}
  $('settings-dialog').close();message('Sources updated for this session.');paint();
 }catch(error){message(error.message,'error');window.alert(error.message);}
}
$('game-button').addEventListener('click',()=>$('game-file').click());
$('game-file').addEventListener('change',event=>{const file=event.target.files[0];event.target.value='';loadGame(file);});
$('import-button').addEventListener('click',()=>$('core-file').click());
$('core-file').addEventListener('change',event=>{const file=event.target.files[0];event.target.value='';loadCore(file);});
$('catalog-button').addEventListener('click',()=>findReleases());
$('refresh-button').addEventListener('click',()=>findReleases(true));
$('catalog-close').addEventListener('click',()=>{if(!busy){catalogOpen=false;showScreen('core-screen');}});
$('show-preview').addEventListener('change',()=>renderCatalog());
$('obtain-button').addEventListener('click',obtain);
$('core-candidate').addEventListener('click',resetCore);
$('previous-button').addEventListener('click',()=>changeStep(step-1));
$('continue-button').addEventListener('click',()=>step===3?install():changeStep(step+1));
$('force-install').addEventListener('change',changeForce);
$('product-previous').addEventListener('click',()=>switchProduct(-1));
$('product-next').addEventListener('click',()=>switchProduct(1));
for(const id of ['refresh-button','catalog-close','catalog-info']){
 const button=$(id);
 button.addEventListener('keydown',event=>{if(event.key==='Escape')button.parentElement.dataset.dismissed='true';});
 for(const event of ['pointerenter','focus'])button.addEventListener(event,()=>{button.parentElement.dataset.dismissed='false';});
}
$('game-name').addEventListener('click',event=>{if($('game-name').scrollHeight>$('game-name').clientHeight+1)event.stopPropagation();});
$('license-button').addEventListener('click',()=>$('license-dialog').showModal());
$('license-close').addEventListener('click',()=>$('license-dialog').close());
$('settings-button').addEventListener('click',()=>{$('license-dialog').close();$('settings-dialog').showModal();});
$('settings-close').addEventListener('click',()=>$('settings-dialog').close());
$('save-sources').addEventListener('click',saveSources);
$('cancel-button').addEventListener('click',cancel);
window.addEventListener('pagehide',()=>{controller?.abort();stopWorker();clearOutput();});
try{
 if(typeof Worker!=='function'||!crypto.subtle)throw Error('Use a current browser with Web Crypto and Worker support.');
 $('refresh-tooltip').textContent=translated('Refresh catalog','重新整理版本清單');$('refresh-button').setAttribute('aria-label',$('refresh-tooltip').textContent);
 $('close-tooltip').textContent=translated('Close catalog','關閉版本清單');$('catalog-close').setAttribute('aria-label',$('close-tooltip').textContent);
 $('catalog-info').setAttribute('aria-label',translated('Catalog reading information','版本資訊讀取問題'));
 productLabels();makeWorker();paint();
}catch(error){$('game-button').disabled=true;message(error.message,'error');}
})();
