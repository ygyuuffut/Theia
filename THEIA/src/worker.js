let game=null,core=null,forceAcknowledged=false;
function compatibility(){
 insist(game&&core,'Select a game and import a verified Core first.');
 const row=core.manifest.games.find(g=>g.version===game.version);
 const versionMatch=!!row,fingerprintMatch=!!row?.raw_sha256.includes(game.hash);
 return {compatible:versionMatch&&fingerprintMatch,versionMatch,fingerprintMatch,reason:!versionMatch?'version':!fingerprintMatch?'fingerprint':null,supportedVersions:core.manifest.games.map(g=>g.version)};
}
self.onmessage=async({data})=>{
 const {id,operation}=data;
 try{
  let result;
  if(operation==='game'){
   game=null;core=null;forceAcknowledged=false;const bytes=new Uint8Array(data.bytes);insist(bytes.length<=LIMITS.game,'Game file exceeds 64 MiB');
   const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes),info=detectGame(text);insist(!info.injected,'This file already contains SYNODIC. Select the original game.');
   game={text,hash:await sha256(bytes),...info};result={hash:game.hash,version:game.version,declared:game.declared,bytes:bytes.length};
  }else if(operation==='package'){
   core=null;forceAcknowledged=false;const candidate=await verifyPackage(new Uint8Array(data.bytes),data.expected);
   insist(game,'Select the game first');
   // Package integrity belongs to step two; game compatibility is checked in step three.
   core=candidate;result={manifest:core.manifest,zipHash:core.zipHash,originVerified:core.originVerified};
  }else if(operation==='compatibility'){
   result=compatibility();
  }else if(operation==='force-install'){
   insist(game&&core,'Select a game and import a verified Core first.');
   insist(data.enabled===false||data.enabled===true&&data.acknowledged===true,'Force Install risk confirmation is required.');
   forceAcknowledged=data.enabled===true;result={enabled:forceAcknowledged};
  }else if(operation==='install'){
   const match=compatibility();
   insist(match.compatible||forceAcknowledged&&data.forceInstall===true,match.reason==='version'?'This Core does not support this STG version. Enable FORCE INSTALL and accept the risk to proceed.':'The game fingerprint does not match. Enable FORCE INSTALL and accept the risk to proceed.');
   const output=await injectCore(game.text,core.payload);const bytes=utf8(output),outputHash=await sha256(bytes);
   result={bytes:bytes.buffer,hash:outputHash,version:core.manifest.release_version,forced:!match.compatible,compatibility:match};self.postMessage({id,result},[bytes.buffer]);return;
  }else if(operation==='clear-package'){core=null;forceAcknowledged=false;result=true;}
  else if(operation==='validate-manifest'){result=validateManifest(data.manifest);}
  else throw Error('Unknown installer operation');
  self.postMessage({id,result});
 }catch(error){self.postMessage({id,error:error.message||String(error),code:error.code||null});}
};
