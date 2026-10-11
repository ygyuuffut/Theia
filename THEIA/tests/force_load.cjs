/* Actual Worker/package/injector, real card-workshop edit; no game code execution. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto,createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'prototypes/generated/local'),{Project}=require(path.join(root,'../card-editor/core.js'));
const original=fs.readFileSync(path.join(root,'../STG 0.2PC.html')),zip=fs.readFileSync(path.join(out,'live-core.zip'));
const p=new Project(original.toString('utf8'),'STG.html'),blast=p.cards.find(c=>c.name==='Blast'),cost=blast.data.cost+1;p.updateCard(blast,{cost},true);
const modified=Buffer.from(p.exportHTML(),'utf8');fs.writeFileSync(path.join(out,'workshop-modified.html'),modified);
const hash=b=>createHash('sha256').update(b).digest('hex'),checks=[];
function check(name,value){assert.ok(value,name);checks.push(name);}
function worker(){
 let response;const self={postMessage(value){response=value;}},ctx=vm.createContext({self,JSZip:require('jszip'),crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,DataView,ArrayBuffer,setTimeout,clearTimeout,Promise});
 for(const name of ['src/versions.js','src/inject.js','src/package.js','src/worker.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx);
 return {ctx,async call(operation,data={}){response=null;await self.onmessage({data:{id:1,operation,...data}});assert.ok(response);return response;}};
}
const array=b=>Uint8Array.from(b).buffer;
(async()=>{
 let w=worker(),r=await w.call('game',{bytes:array(modified)});check('workshop edit retains declared version but changes fingerprint',!r.error&&r.result.version==='0.2001'&&r.result.hash!==hash(original));
 r=await w.call('package',{bytes:array(zip)});check('modified game rejected by default',r.error?.includes('game fingerprint'));
 r=await w.call('install',{forceFingerprint:true});check('failed package leaves no installable Core',r.error?.includes('Select a compatible Core'));
 r=await w.call('package',{bytes:array(zip),forceFingerprint:'true'});check('override requires explicit boolean true',r.error?.includes('game fingerprint'));
 r=await w.call('package',{bytes:array(zip),forceFingerprint:true});check('force permits modified game after complete Core verification',!r.error&&r.result.forced===true);
 r=await w.call('install');check('forced Core still requires force authorization at export',r.error?.includes('confirmation is required'));
 r=await w.call('install',{forceFingerprint:true});check('force export succeeds',!r.error&&r.result.bytes instanceof ArrayBuffer);
 const output=Buffer.from(r.result.bytes);fs.writeFileSync(path.join(out,'workshop-forced-installed.html'),output);
 w.ctx.source=modified.toString('utf8');w.ctx.installed=output.toString('utf8');check('entire modified native game survives injection',vm.runInContext('nativeText(installed)===nativeText(source)',w.ctx));
 check('workshop card cost survives export',new Project(output.toString('utf8'),'installed.html').cards.filter(c=>c.name==='Blast').every(c=>c.data.cost===cost));
 await w.call('clear-package');r=await w.call('install',{forceFingerprint:true});check('clearing package revokes forced export',!!r.error);
 await w.call('game',{bytes:array(modified)});r=await w.call('package',{bytes:array(zip)});check('reload restores default fingerprint requirement',r.error?.includes('game fingerprint'));
 await w.call('game',{bytes:array(original)});r=await w.call('package',{bytes:array(zip),forceFingerprint:true});check('known original is not falsely marked forced',!r.error&&r.result.forced===false);
 r=await w.call('install');check('known original exports without override',!r.error);
 check('normal RC output bytes remain unchanged',Buffer.from(r.result.bytes).equals(fs.readFileSync(path.join(out,'pc-rc1-installed.html'))));
 const wrongVersion=modified.toString('utf8').replace(/(window\.STG_VERSION\s*=\s*['"])v?0\.2001/, '$1v0.2002');assert.notEqual(wrongVersion,modified.toString('utf8'));await w.call('game',{bytes:array(Buffer.from(wrongVersion))});r=await w.call('package',{bytes:array(zip),forceFingerprint:true});check('force cannot bypass declared-version compatibility',r.error?.includes('declared game version'));
 r=await w.call('game',{bytes:array(output)});check('force cannot bypass duplicate injection',r.error?.includes('already contains SYNODIC'));
 r=await w.call('game',{bytes:array(Buffer.from('<html>not STG</html>'))});check('force cannot accept malformed/non-STG input',!!r.error);
 await w.call('game',{bytes:array(modified)});const corrupt=Buffer.from(zip);corrupt[100]^=1;r=await w.call('package',{bytes:array(corrupt),forceFingerprint:true,expected:{zipHash:hash(zip)}});check('force cannot bypass ZIP digest',r.error?.includes('SHA-256 mismatch'));
 r=await w.call('package',{bytes:array(zip),forceFingerprint:true,expected:{manifestText:'{}'}});check('force cannot bypass external/internal Manifest equality',r.error?.includes('Manifest mismatch'));
 r=await w.call('package',{bytes:array(zip),forceFingerprint:true,expected:{releaseVersion:'9.9.9'}});check('force cannot bypass package release-version binding',r.error?.includes('version mismatch'));
 r=await w.call('install',{forceFingerprint:true});check('failed forced verification revokes old Core',!!r.error);
 const broken=modified.toString('utf8').replace(/<meta\s+(?:name=["']viewport["']|charset=)[^>]*>/gi,'');await w.call('game',{bytes:array(Buffer.from(broken))});r=await w.call('package',{bytes:array(zip),forceFingerprint:true});assert.ok(!r.error);r=await w.call('install',{forceFingerprint:true});check('force cannot bypass injection integrity/required anchors',r.error?.includes('Charset declaration required'));
 const report={pass:true,checks:checks.length,scope:'Node Worker integration using real RC ZIP and card-workshop export; no browser or gameplay execution.',inputSha256:hash(modified),outputSha256:hash(output),card:'Blast',modifiedCost:cost,names:checks};fs.writeFileSync(path.join(root,'research/evidence/force-load-tests.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
