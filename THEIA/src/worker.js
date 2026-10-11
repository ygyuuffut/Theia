let game=null,core=null;
self.onmessage=async({data})=>{
 const {id,operation}=data;
 try{
  let result;
  if(operation==='game'){
   game=null;core=null;const bytes=new Uint8Array(data.bytes);insist(bytes.length<=LIMITS.game,'Game file exceeds 64 MiB');
   const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes),info=detectGame(text);insist(!info.injected,'This file already contains SYNODIC. Select the original game.');
   game={text,hash:await sha256(bytes),...info};result={hash:game.hash,version:game.version,declared:game.declared,bytes:bytes.length};
  }else if(operation==='package'){
   core=null;const candidate=await verifyPackage(new Uint8Array(data.bytes),data.expected);
   insist(game,'Select the original game first');const supported=candidate.manifest.games.find(g=>g.version===game.version);insist(supported,'This Core does not support the declared game version. Force load cannot bypass version compatibility.');
   const forced=!supported.raw_sha256.includes(game.hash);insist(!forced||data.forceFingerprint===true,'This Core does not support the selected game fingerprint. For a modified game, enable Force load in Modified game options, accept the warning, then select the Core again.');
   core={...candidate,forced};result={manifest:core.manifest,zipHash:core.zipHash,originVerified:core.originVerified,forced};
  }else if(operation==='install'){
   insist(game&&core,'Select a compatible Core first');
   insist(!core.forced||data.forceFingerprint===true,'Force load confirmation is required for this modified game.');
   const output=await injectCore(game.text,core.payload);const bytes=utf8(output),outputHash=await sha256(bytes);
   result={bytes:bytes.buffer,hash:outputHash,version:core.manifest.release_version};self.postMessage({id,result},[bytes.buffer]);return;
  }else if(operation==='clear-package'){core=null;result=true;}
  else if(operation==='validate-manifest'){result=validateManifest(data.manifest);}
  else throw Error('Unknown installer operation');
  self.postMessage({id,result});
 }catch(error){self.postMessage({id,error:error.message||String(error)});}
};
