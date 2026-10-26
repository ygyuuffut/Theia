/* Session-only release discovery. No embedded token, storage, game upload or backend. */
const TheiaDistribution=(()=>{
 const hosts=new Set(['api.github.com','github.com','raw.githubusercontent.com','release-assets.githubusercontent.com']);
 const hashPattern=/^[a-f0-9]{64}$/;
 function allowedURL(value){
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.port||!hosts.has(u.hostname))throw Error('Use a public HTTPS GitHub release or static source.');
  return u.href;
 }
 function tagVersion(tag){const value=String(tag).replace(/^v/,'');parseVersion(value);return value;}
 function failure(message,code){return Object.assign(Error(message),{code});}
 function createClient(){
  const cache=new Map();let apiRetryAt=0;
  async function bytes(url,{limit=16*1024*1024,accept='application/octet-stream',signal,onProgress}={}){
   const source=allowedURL(url),api=new URL(source).hostname==='api.github.com';
   if(api&&Date.now()<apiRetryAt)throw failure('GitHub API is cooling down. Retry after '+new Date(apiRetryAt).toLocaleTimeString()+'. You can import a local Core ZIP.','RATE_LIMIT');
   const controller=new AbortController(),abort=()=>controller.abort();
   if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
   let timedOut=false;const timer=setTimeout(()=>{timedOut=true;controller.abort();},25000);
   try{
    const r=await fetch(source,{credentials:'omit',signal:controller.signal,headers:{Accept:accept}});
    if(!r.ok){
     const remaining=r.headers.get('x-ratelimit-remaining'),reset=Number(r.headers.get('x-ratelimit-reset')),retry=r.headers.get('retry-after');
     const rate=r.status===429||r.status===403&&(remaining==='0'||!!retry);
     if(rate){
      const seconds=Number(retry),date=Date.parse(retry||'');
      const wait=retry?(Number.isFinite(seconds)?Date.now()+Math.max(1,seconds)*1000:date):reset*1000;
      const until=Number.isFinite(wait)&&wait>Date.now()?wait:Date.now()+60000;if(api)apiRetryAt=until;
      throw failure('GitHub request unavailable ('+r.status+'). Retry after '+new Date(until).toLocaleTimeString()+'. You can import a local Core ZIP.','RATE_LIMIT');
     }
     throw failure('Source request failed ('+r.status+'). Try again later or import a local Core ZIP.','HTTP');
    }
    const total=Number(r.headers.get('content-length'));if(total>limit)throw failure('Download exceeds the supported size limit.','SIZE');
    const reader=r.body?.getReader();if(!reader)throw failure('This browser cannot read the download stream. Import the Core ZIP locally.','NETWORK');
    const chunks=[];let count=0;
    for(;;){const {done,value}=await reader.read();if(done)break;count+=value.length;if(count>limit){await reader.cancel();throw failure('Download exceeds the supported size limit.','SIZE');}chunks.push(value);onProgress?.(count,total>0?total:null);}
    const out=new Uint8Array(count);let at=0;for(const chunk of chunks){out.set(chunk,at);at+=chunk.length;}return out;
   }catch(error){
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    if(timedOut)throw failure('The request timed out. Retry or import the Core ZIP locally.','NETWORK');
    if(error instanceof TypeError)throw failure('The browser could not read this source (network or CORS). Import the Core ZIP locally.','NETWORK');
    throw error;
   }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  async function json(url,options={}){return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await bytes(url,{accept:'application/vnd.github+json',...options})));}
  function digest(asset){return /^sha256:[a-f0-9]{64}$/.test(asset?.digest||'')?asset.digest.slice(7):null;}
  async function list({repository,indexURL='',signal,validateManifest,refresh=false,onStatus=()=>{}}){
   const key=repository+'\n'+indexURL,old=cache.get(key);
   if(!refresh&&old&&Date.now()-old.at<300000)return {...old.result,cached:true};
   let indexWarning='';
   if(indexURL){
    try{
     onStatus('Reading the publisher distribution index…');
     const catalog=await json(indexURL,{signal,limit:4*1024*1024});
     if(catalog.schema_version!==1||catalog.repository!==repository||!Array.isArray(catalog.releases)||catalog.releases.length>1000)throw Error('The static index does not match this SYNODIC repository.');
     const choices=[],tags=new Set(),officialDigests=[];
     for(const entry of catalog.releases){
      if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
      if(tags.has(entry.tag)||typeof entry.manifest_text!=='string'||new TextEncoder().encode(entry.manifest_text).length>256*1024||!hashPattern.test(entry.zip_sha256))throw Error('Invalid or duplicate static index entry.');
      tags.add(entry.tag);const manifest=await validateManifest(JSON.parse(entry.manifest_text));
      if(tagVersion(entry.tag)!==manifest.release_version)throw Error('Static index Tag and Manifest version do not match.');
      const zipURL=allowedURL(entry.zip_url),preview=['rc','beta'].includes(manifest.channel);
      const releaseURL='https://github.com/'+repository+'/releases/tag/'+encodeURIComponent(entry.tag);
      choices.push({id:entry.tag,tag:entry.tag,version:manifest.release_version,preview,manifest,manifestText:entry.manifest_text,zipURL,downloadURL:zipURL,zipHash:entry.zip_sha256,notes:typeof entry.release_notes==='string'?entry.release_notes:'',releaseURL,verifiedMetadata:true});
      officialDigests.push({tag:entry.tag,version:manifest.release_version,asset:manifest.asset_name,hash:entry.zip_sha256,preview});
     }
     const result={choices,officialDigests,incomplete:false,source:'index',warning:'',cached:false};cache.set(key,{at:Date.now(),result});return result;
    }catch(error){if(signal?.aborted)throw error;indexWarning='Static index unavailable: '+error.message+' ';}
   }
   try{
    onStatus(indexWarning+'Reading GitHub releases…');
    const releases=[];let complete=false;
    for(let page=1;page<=10;page++){
     const rows=await json('https://api.github.com/repos/'+repository+'/releases?per_page=100&page='+page,{signal,limit:8*1024*1024});
     if(!Array.isArray(rows))throw Error('Invalid GitHub release list.');releases.push(...rows);if(rows.length<100){complete=true;break;}
    }
    if(!complete)throw Error('The release list exceeds the supported limit. Import a Core ZIP locally.');
    const choices=[],officialDigests=[];let failures=0,incomplete=false;
    for(const release of releases){
     if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
     if(release.draft)continue;
     let version;try{version=tagVersion(release.tag_name);}catch{continue;}
     const assets=Array.isArray(release.assets)?release.assets:[],zips=assets.filter(a=>/^synodic-core-.+\.zip$/.test(a.name));if(zips.length!==1)continue;
     const zip=zips[0],preview=release.prerelease===true;
     if(preview!==!!parseVersion(version).pre.length){incomplete=true;continue;}
     const zipHash=digest(zip);if(zipHash)officialDigests.push({tag:release.tag_name,version,asset:zip.name,hash:zipHash,preview});
     const candidate={id:release.tag_name,tag:release.tag_name,version,preview,manifest:null,manifestText:null,zipURL:allowedURL(zip.url),downloadURL:allowedURL(zip.browser_download_url),zipHash,notes:typeof release.body==='string'?release.body:'',releaseURL:'https://github.com/'+repository+'/releases/tag/'+encodeURIComponent(release.tag_name),verifiedMetadata:false};
     const asset=assets.find(a=>a.name==='manifest.json');
     try{
      if(!asset||failures>=3)throw failure('Manifest is unavailable. Compatibility will be checked after importing the Core ZIP.','NETWORK');
      onStatus('Reading '+release.tag_name+' metadata…');
      const raw=await bytes(asset.url,{signal,limit:256*1024}),text=new TextDecoder('utf-8',{fatal:true}).decode(raw);
      const manifest=await validateManifest(JSON.parse(text));
      if(manifest.release_version!==version||['rc','beta'].includes(manifest.channel)!==preview||manifest.asset_name!==zip.name)throw Error('Release Tag, channel or asset does not match its Manifest.');
      Object.assign(candidate,{manifest,manifestText:text,verifiedMetadata:true});
     }catch(error){
      if(signal?.aborted)throw error;incomplete=true;failures++;
      if(!['NETWORK','HTTP','RATE_LIMIT'].includes(error.code)){candidate.blocked=true;candidate.metadataError=error.message;}else candidate.metadataError=error.message;
     }
     choices.push(candidate);
    }
    const result={choices,officialDigests,incomplete,source:'github',warning:indexWarning+(incomplete?'Some release metadata could not be verified. This is not proof that no compatible release exists.':''),cached:false};cache.set(key,{at:Date.now(),result});return result;
   }catch(error){
    if(signal?.aborted)throw error;
    if(old)return {...old.result,cached:true,stale:true,incomplete:true,warning:'Using this session’s cached release list. Refresh failed: '+error.message};
    throw error;
   }
  }
  return {bytes,list,clearCache:()=>cache.clear()};
 }
 return {allowedURL,tagVersion,createClient};
})();
