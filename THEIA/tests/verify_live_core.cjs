/* Verify a downloaded public Core and project its text; never execute package/game scripts. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{webcrypto,createHash}=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'prototypes/generated/local');
const rows=JSON.parse(fs.readFileSync(path.join(out,'live-releases.json'),'utf8')),manifestText=fs.readFileSync(path.join(out,'live-manifest.json'),'utf8'),manifest=JSON.parse(manifestText);
const release=rows.find(r=>r.assets.some(a=>a.name===manifest.asset_name)),asset=release?.assets.find(a=>a.name===manifest.asset_name);
assert.ok(asset&&/^sha256:[a-f0-9]{64}$/.test(asset.digest));
const sandbox=vm.createContext({JSZip:require('jszip'),crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,DataView,ArrayBuffer,setTimeout,clearTimeout,Promise});
for(const name of ['src/versions.js','src/inject.js','src/package.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),sandbox);
sandbox.bytes=new Uint8Array(fs.readFileSync(path.join(out,'live-core.zip')));sandbox.expected={zipHash:asset.digest.slice(7),manifestText,releaseVersion:manifest.release_version};
const digest=b=>createHash('sha256').update(b).digest('hex');
(async()=>{
 const core=await vm.runInContext('verifyPackage(bytes,expected)',sandbox);sandbox.payload=core.payload;
 const report={scope:'Downloaded public Core verified by actual consumer; text injection only, no browser/gameplay execution.',tag:release.tag_name,manifestVersion:manifest.release_version,tagMatchesManifest:release.tag_name==='v'+manifest.release_version,zipHash:core.zipHash,externalInternalManifestIdentical:true,zipMatchesGitHubAssetDigest:true,blocks:Object.keys(core.payload.blocks).length,games:[]};
 for(const [source,name] of [['STG 0.2PC.html','pc-rc1-installed.html'],['STG 0.2PC.C2.html','pc-c2-rc1-installed.html']]){
  const bytes=fs.readFileSync(path.join(root,'..',source)),hash=digest(bytes);assert.ok(manifest.games.some(g=>g.raw_sha256.includes(hash)));
  sandbox.source=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
  const text=await vm.runInContext('injectCore(source,payload)',sandbox);sandbox.outputText=text;
  assert.ok(vm.runInContext('nativeText(outputText)===nativeText(source)',sandbox));
  const output=Buffer.from(text,'utf8');fs.writeFileSync(path.join(out,name),output);
  report.games.push({input:source,inputSha256:hash,output:name,outputBytes:output.length,outputSha256:digest(output),nativeTextUnchanged:true});
 }
 fs.writeFileSync(path.join(root,'research/evidence/live-rc-core.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
