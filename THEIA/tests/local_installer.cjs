/* Actual file:// end-to-end test. Routed responses test unpublished package wiring only. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'prototypes/generated/local'),evidence=path.join(root,'research/evidence/local-installer.json');
const report={testedAt:new Date().toISOString(),scope:'Actual file:// Chrome; deterministic GitHub responses are simulated. Actual remote CORS is recorded separately.',checks:[],requests:[],errors:[]};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
let browser;
const check=(name,value)=>{assert.ok(value,name);report.checks.push({name,pass:true});};
(async()=>{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 report.browser=browser.version();const context=await browser.newContext({acceptDownloads:true,viewport:{width:1280,height:724}}),page=await context.newPage();
 const releaseURL='https://api.github.com/repos/ygyuuffut/Synodic/releases';
 let releases=[],catalog={},apiStatus=200,holdAPI=false,expected=JSON.parse(fs.readFileSync(path.join(out,'expected.json'),'utf8'));
 let zipBytes=fs.readFileSync(path.join(out,'core.zip'));
 page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>report.requests.push({url:r.url().slice(0,200),method:r.method()}));
 await page.route(releaseURL+'*',async r=>{if(holdAPI)await new Promise(resolve=>setTimeout(resolve,2000));return r.fulfill({status:apiStatus,contentType:'application/json',body:JSON.stringify(releases),headers:{'Access-Control-Allow-Origin':'*'}}).catch(()=>{});});
 await page.route('https://raw.githubusercontent.com/ygyuuffut/Synodic/test/catalog.json',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(catalog),headers:{'Access-Control-Allow-Origin':'*'}}));
 await page.route('https://raw.githubusercontent.com/ygyuuffut/Synodic/test/core.zip',r=>r.fulfill({status:200,contentType:'application/zip',body:zipBytes,headers:{'Access-Control-Allow-Origin':'*'}}));
 await page.goto(pathToFileURL(path.join(root,'dist/THEIA-'+JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version+'.html')).href);await page.evaluate(()=>document.fonts.ready);
 check('delivery runs under file://',await page.evaluate(()=>location.protocol==='file:'&&isSecureContext&&!!crypto.subtle));
 check('ready game is distinct from complete',await page.locator('#game-step').getAttribute('data-state')==='ready');
 check('downstream actions unavailable initially',await page.locator('#install-button').isDisabled()&&await page.locator('#release-button').isDisabled());
 await page.screenshot({path:path.join(out,'ui-empty-desktop.png')});
 const selectGame=async(file=path.join(root,'../STG 0.2PC.html'))=>{await page.locator('#game-file').setInputFiles(file);await page.waitForFunction(()=>document.querySelector('#game-step').dataset.state==='complete'&&!document.querySelector('#game-button').disabled);};
 await selectGame();
 check('declared native version is read',await page.locator('#game-version').textContent()==='Version: 0.2001');
 check('unpublished release list leaves release ready',await page.locator('#release-step').getAttribute('data-state')==='ready');
 await page.locator('#release-button').click();
 const importZip=async(name)=>{await page.locator('#core-file').setInputFiles(path.join(out,name));await page.waitForFunction(()=>!document.querySelector('#game-button').disabled);};
 await importZip('core.zip');
 check('local package verified and selection complete',await page.locator('#release-step').getAttribute('data-state')==='complete');
 check('install is ready before export',await page.locator('#install-step').getAttribute('data-state')==='ready');
 check('local hash validation does not claim publisher authenticity',(await page.locator('#release-description').textContent()).includes('origin not verified'));
 await page.screenshot({path:path.join(out,'ui-ready-desktop.png')});
 const exportHTML=async(name)=>{const pending=page.waitForEvent('download');await page.locator('#install-button').click();const dl=await pending;check('export always uses a new filename '+name,dl.suggestedFilename()==='STG-SYNODIC.html');const target=path.join(out,name);await dl.saveAs(target);return fs.readFileSync(target);};
 let result=await exportHTML('pc-installed.html');
 check('final installer output equals Python oracle bytes',result.equals(fs.readFileSync(path.join(root,'prototypes/generated/pc-oracle.html'))));
 report.output={bytes:result.length,sha256:hash(result)};
 check('complete follows verified HTML generation',await page.locator('#install-step').getAttribute('data-state')==='complete');
 check('repeat download is identical',(await exportHTML('pc-installed-again.html')).equals(result));
 // Replacing a valid package with a bad one must revoke the previous export.
 for(const file of ['corrupt.zip','traversal.zip','duplicate.zip','unknown.zip','unlisted.zip','forged-size.zip','private-module.zip']){
  await importZip(file);check('reject '+file,await page.locator('#release-step').getAttribute('data-state')==='error'&&await page.locator('#install-button').isDisabled());
  report.checks.at(-1).message=await page.locator('#message').textContent();
 }
 await selectGame(path.join(root,'../STG 0.2PC.C2.html'));await importZip('core.zip');
 result=await exportHTML('pc-c2-installed.html');check('C2 output equals separate Python oracle',result.equals(fs.readFileSync(path.join(root,'prototypes/generated/pc_c2-oracle.html'))));
 await page.locator('#game-file').setInputFiles(path.join(out,'pc-installed.html'));await page.waitForFunction(()=>!document.querySelector('#game-button').disabled);
 check('duplicate injection rejected',await page.locator('#game-step').getAttribute('data-state')==='error'&&(await page.locator('#message').textContent()).includes('already contains'));
 const unknown=path.join(out,'STG 0.2001.html');fs.writeFileSync(unknown,fs.readFileSync(path.join(root,'../STG 0.2PC.html'),'utf8')+'\n<!-- altered -->');await selectGame(unknown);await importZip('core.zip');
 check('matching declared version and filename cannot bypass fingerprint',await page.locator('#release-step').getAttribute('data-state')==='error');
 // Simulated public 1.0.0 wrapping existing b6.9 bytes is strictly a test, never published.
 const JSZip=require('jszip'),zip=await JSZip.loadAsync(fs.readFileSync(path.join(out,'core.zip'))),m=JSON.parse(expected.manifest_text);m.release_version='1.0.0';m.channel='stable';delete m.display_version;const manifestText=JSON.stringify(m,null,2);zip.file('manifest.json',manifestText);zipBytes=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
 releases=[{tag_name:'v1.0.0',prerelease:false,draft:false,assets:[]}];catalog={schema_version:1,repository:'ygyuuffut/Synodic',releases:[{tag:'v1.0.0',manifest_text:manifestText,zip_sha256:hash(zipBytes),zip_url:'https://raw.githubusercontent.com/ygyuuffut/Synodic/test/core.zip'}]};
 await selectGame();await importZip('core.zip');await page.locator('#settings-button').click();await page.locator('#index-url').fill('https://raw.githubusercontent.com/ygyuuffut/Synodic/test/catalog.json');await page.locator('#save-sources').click();await page.locator('#release-button').click();await page.locator('#refresh-button').click();await page.waitForFunction(()=>!document.querySelector('#refresh-button').disabled);
 await page.getByRole('button',{name:'v1.0.0 STABLE'}).click();await page.waitForFunction(()=>!document.querySelector('#game-button').disabled);
 check('static mirror plus API pairing verifies ZIP and exact manifest',await page.locator('#release-title').textContent()==='v1.0.0'&&(await page.locator('#release-description').textContent()).toLowerCase().includes('verified'));
 check('simulated online package retains injector semantics',(await exportHTML('online-installed.html')).equals(fs.readFileSync(path.join(root,'prototypes/generated/pc-oracle.html'))));
 await page.locator('#release-button').click();await page.getByRole('button',{name:'Internal b6.9'}).click();await page.waitForFunction(()=>!document.querySelector('#game-button').disabled);
 check('reselecting local ZIP restores worker package',(await page.locator('#release-title').textContent()).includes('Internal b6.9'));
 check('restored local package exports original bytes',(await exportHTML('restored-local.html')).equals(fs.readFileSync(path.join(root,'prototypes/generated/pc-oracle.html'))));
 // Wrong ZIP bytes even with a plausible catalog must prevent installation.
 zipBytes=Buffer.from(zipBytes);zipBytes[zipBytes.length-1]^=1;await page.locator('#release-button').click();await page.getByRole('button',{name:'v1.0.0 STABLE'}).click();await page.waitForFunction(()=>!document.querySelector('#game-button').disabled);
 check('online hash failure disables export',await page.locator('#release-step').getAttribute('data-state')==='error'&&await page.locator('#install-button').isDisabled());
 zipBytes=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});catalog.releases[0].manifest_text=manifestText+'\n';await page.locator('#refresh-button').click();await page.waitForFunction(()=>!document.querySelector('#refresh-button').disabled);await page.getByRole('button',{name:'v1.0.0 STABLE'}).click();await page.waitForFunction(()=>!document.querySelector('#game-button').disabled);
 check('external and internal manifest must match exactly',await page.locator('#release-step').getAttribute('data-state')==='error'&&(await page.locator('#message').textContent()).includes('Manifest mismatch'));
 catalog.releases[0].manifest_text=manifestText;releases[0].assets=[{name:'core.zip',digest:'sha256:'+hash(zipBytes)}];await page.locator('#refresh-button').click();await page.waitForFunction(()=>!document.querySelector('#refresh-button').disabled);
 fs.writeFileSync(path.join(out,'official-simulated.zip'),zipBytes);await importZip('official-simulated.zip');
 check('local download can match trusted release API digest',(await page.locator('#release-description').textContent()).includes('matches GitHub Release digest'));
 await importZip('core.zip');
 for(const [w,h] of [[320,568],[360,800],[400,760],[768,1024],[1280,724],[1920,1080]]){await page.setViewportSize({width:w,height:h});check('adaptive width '+w,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(w===360)await page.screenshot({path:path.join(out,'ui-ready-mobile.png'),fullPage:true});}
 await page.setViewportSize({width:1280,height:724});await page.screenshot({path:path.join(out,'ui-ready-desktop.png')});
 apiStatus=429;await selectGame();check('rate limit is reported recoverably',await page.locator('#release-step').getAttribute('data-state')==='error'&&(await page.locator('#message').textContent()).includes('429'));
 await importZip('core.zip');check('local import works after rate limit',await page.locator('#install-step').getAttribute('data-state')==='ready');
 holdAPI=true;await page.locator('#game-file').setInputFiles(path.join(root,'../STG 0.2PC.html'));await page.locator('#cancel-button').click();holdAPI=false;await page.waitForFunction(()=>!document.querySelector('#game-button').disabled);
 check('cancel stops worker and clears dependent selections',await page.locator('#game-step').getAttribute('data-state')==='ready'&&await page.locator('#install-button').isDisabled());
 const sameName=path.join(out,'STG-SYNODIC.html');fs.copyFileSync(path.join(root,'../STG 0.2PC.html'),sameName);await selectGame(sameName);await importZip('core.zip');const dlPromise=page.waitForEvent('download');await page.locator('#install-button').click();const differentName=await dlPromise;check('suggested export name differs even from renamed original',differentName.suggestedFilename()!==path.basename(sameName));
 check('installer never sends game bytes externally',report.requests.every(r=>r.method==='GET'));
 check('no localhost or external script/font dependencies',report.requests.every(r=>!r.url.includes('localhost')&&!r.url.includes('127.0.0.1')&&!/https:.*\.(?:js|woff2)(?:\?|$)/.test(r.url)));
 check('no page runtime errors',report.errors.length===0);report.pass=true;await browser.close();
})().catch(e=>{report.pass=false;report.failure=e.stack;process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();fs.writeFileSync(evidence,JSON.stringify(report,null,2));console.log(JSON.stringify({pass:report.pass,checks:report.checks.length,failure:report.failure}));});
