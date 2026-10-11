const {chromium,firefox,webkit}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),generated=path.join(root,'prototypes/generated');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const report={testedAt:new Date().toISOString(),cases:[],unavailableBrowsers:[],limitations:['Local loopback secure context, not deployed THEIA Pages','Desktop automation, not iOS/Android file picker or physical download UX','No peak process/RSS measurement; JS heap observations do not measure all buffers']};
 let browser;
 try{
 for(const [name,type] of [['firefox',firefox],['webkit',webkit]])if(!fs.existsSync(type.executablePath()))report.unavailableBrowsers.push(name+' runtime not installed');
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});report.browser=browser.version();
 const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage(),requests=[];
 page.on('request',r=>requests.push({url:r.url(),method:r.method(),resource:r.resourceType()}));
 await page.goto(origin+'/prototypes/browser/index.html');await page.waitForFunction(()=>window.theiaResearch);
 const expected=JSON.parse(fs.readFileSync(path.join(generated,'expected.json')));
 const outer=fs.readFileSync(path.join(generated,'manifest.json'),'utf8');
 const bytes=[...fs.readFileSync(path.join(generated,'core.zip'))];
 await page.evaluate(async({bytes,hash,outer})=>{window.payload=await theiaResearch.readPackage(new Uint8Array(bytes),hash,outer);},{bytes,hash:expected.core.sha256,outer});
 report.cases.push({name:'ZIP SHA-256 + CRC32 + payload hash + exact manifest pair',pass:true,zipBytes:bytes.length});
 for(const key of ['pc','pc_c2','accepted_b5','accepted_b69']){
  const source=path.resolve(root,'..',expected[key].source);
  await page.locator('#game').setInputFiles(source);
  await page.waitForFunction(hash=>document.querySelector('#result').textContent.includes(hash),expected[key].rawSha256);
  const ui=await page.locator('#result').textContent();
  if(key.startsWith('accepted'))assert.match(ui,/Already injected/);else await page.waitForFunction(()=>!document.querySelector('#install').disabled);
  const text=fs.readFileSync(source,'utf8');
  const start=Date.now();
  const output=await page.evaluate(async text=>theiaResearch.injectOracle(text,payload,{allowResearchReinject:true}),text);
  const outputBytes=Buffer.from(output);fs.writeFileSync(path.join(generated,key+'-browser.html'),outputBytes);
  const oracle=fs.readFileSync(path.join(generated,key+'-oracle.html'));
  if(!outputBytes.equals(oracle)){
   let at=0;while(outputBytes[at]===oracle[at]&&at<Math.min(outputBytes.length,oracle.length))at++;
   throw Error(key+' differs at byte '+at+' browser='+outputBytes.subarray(at,at+100)+' oracle='+oracle.subarray(at,at+100));
  }
  report.cases.push({name:key+' browser/Python exact-byte equality',pass:true,outputSha256:hash(outputBytes),bytes:outputBytes.length,elapsedHostMs:Date.now()-start,declared:'v0.2001',reinjectionTestOnly:key.startsWith('accepted')});
  const second=await page.evaluate(async text=>theiaResearch.injectOracle(text,payload,{allowResearchReinject:true}),output);
  assert.equal(second,output);report.cases.push({name:key+' reversible native preservation + idempotence',pass:true});
 }
 const base=fs.readFileSync(path.join(generated,'pc-native.html'),'utf8');
 const large=base.replace('</body>','<!--'+'x'.repeat(32*1024*1024)+'-->\n</body>');
 fs.writeFileSync(path.join(generated,'large.html'),large);
 await page.locator('#game').setInputFiles(path.join(generated,'large.html'));
 await page.waitForFunction(hash=>document.querySelector('#result').textContent.includes(hash),hash(Buffer.from(large)));
 const largeText=await page.locator('#result').textContent(),largeResult=JSON.parse(largeText.split('\nError:')[0]);assert.equal(largeResult.rawSha256,hash(Buffer.from(large)));
 report.cases.push({name:'Large File API UTF-8 decode + SHA-256',pass:true,bytes:Buffer.byteLength(large),memoryLimitClaim:false});
 await page.waitForFunction(()=>document.querySelector('#result').textContent.includes('Unknown fingerprint'));
 assert(await page.locator('#install').isDisabled());report.cases.push({name:'Modified same-version input blocked by known research fingerprints',pass:true});
 const negative=await page.evaluate(async({outer,bytes,hash,mismatchHash,mismatchBytes})=>{
  const cases=[];const rejects=async(name,fn)=>{try{await fn();cases.push({name,pass:false});}catch(e){cases.push({name,pass:true,error:e.message});}};
  await rejects('Corrupted ZIP hash',()=>theiaResearch.readPackage(new Uint8Array([0,...bytes.slice(1)]),hash,outer));
  await rejects('Inner/outer manifest mismatch',()=>theiaResearch.readPackage(new Uint8Array(mismatchBytes),mismatchHash,outer));
  const synthetic='<meta charset="utf-8"><tw-storydata format="SugarCube"></tw-storydata><script>window.STG_VERSION="v0.2001";</script>';
  await rejects('Duplicate declaration',()=>theiaResearch.detectGame(synthetic+synthetic));
  await rejects('Missing declaration',()=>theiaResearch.detectGame(synthetic.replace('STG_VERSION','OTHER')));
  await rejects('Missing closing anchors',()=>theiaResearch.injectOracle(synthetic,payload));
  await rejects('Repeated installation rejected',()=>theiaResearch.injectOracle(synthetic+'<!-- STG-BOOTSTRAP:START -->',payload));
  const bad=structuredClone(payload);delete bad.blocks['LUNAR-FONT-RESOURCES'];
  await rejects('Missing Core block',()=>theiaResearch.injectOracle(synthetic+'</head></body>',bad));
  return cases;
 },{outer,bytes,hash:expected.core.sha256,mismatchBytes:[...fs.readFileSync(path.join(generated,'mismatch.zip'))],mismatchHash:hash(fs.readFileSync(path.join(generated,'mismatch.zip')))});
 assert(negative.every(c=>c.pass));report.cases.push(...negative);
 // Real user File API path, verified ZIP, browser injection and Blob download.
 await page.locator('#game').setInputFiles({name:'fake-v9.9999.html',mimeType:'text/html',buffer:fs.readFileSync(path.resolve(root,'../STG 0.2PC.html'))});
 await page.waitForFunction(hash=>document.querySelector('#result').textContent.includes(hash)&&!document.querySelector('#install').disabled,expected.pc.rawSha256);
 assert.match(await page.locator('#result').textContent(),/v0\.2001/);report.cases.push({name:'Filename ignored; native declaration and raw bytes identify input',pass:true});
 await page.locator('#package').setInputFiles(path.join(generated,'core.zip'));
 await page.locator('#game').setInputFiles(path.resolve(root,'../STG 0.2PC.html'));
 await page.waitForFunction(hash=>document.querySelector('#result').textContent.includes(hash)&&!document.querySelector('#install').disabled,expected.pc.rawSha256);await page.locator('#install').click();await page.waitForFunction(()=>!document.querySelector('#export').disabled);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);
 const dest=path.join(generated,'downloaded.html');await download.saveAs(dest);assert.equal(hash(fs.readFileSync(dest)),expected.pc.oracleSha256);
 report.cases.push({name:'File picker -> local ZIP import -> injection -> Blob download',pass:true,nameSuggested:download.suggestedFilename(),sha256:hash(fs.readFileSync(dest))});
 assert(requests.every(r=>r.method==='GET'&&r.url.startsWith(origin)));report.cases.push({name:'Installer local processing sends no game upload/request to external origin',pass:true,requests});
 report.pass=true;
 }catch(e){report.pass=false;report.failure=e.stack;process.exitCode=1;}
 finally{fs.writeFileSync(path.join(root,'research/evidence/browser-poc.json'),JSON.stringify(report,null,2));if(browser)await browser.close();await new Promise(r=>server.close(r));}
 console.log(JSON.stringify({pass:report.pass,browser:report.browser,cases:report.cases.map(c=>({name:c.name,pass:c.pass,bytes:c.bytes})),failure:report.failure},null,2));
})();
