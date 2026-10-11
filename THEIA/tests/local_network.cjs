/* Real network, final file:// artifact; no routes and no security overrides. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const report={testedAt:new Date().toISOString(),browser:browser.version(),scope:'Real file:// artifact and unmodified browser web security; public static ZIP is a transport fixture, not SYNODIC Core.'};
 try{
  const page=await browser.newPage();await page.goto(pathToFileURL(path.join(root,'dist/THEIA-'+JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version+'.html')).href);await page.locator('#game-file').setInputFiles(path.join(root,'../STG 0.2PC.html'));await page.waitForFunction(()=>!document.querySelector('#game-button').disabled,{},{timeout:60000});
  report.finalUI={message:await page.locator('#message').textContent(),game:await page.locator('#game-step').getAttribute('data-state'),release:await page.locator('#release-step').getAttribute('data-state'),installDisabled:await page.locator('#install-button').isDisabled()};
  report.staticZIP=await page.evaluate(async()=>{
   const source=new TextDecoder().decode(Uint8Array.from(atob(document.querySelector('#theia-worker').textContent.trim()),c=>c.charCodeAt(0)));
   // Test-only worker command uses the exact bundled JSZip and Web Crypto code.
   const test='self.onmessage=async()=>{try{const url="https://raw.githubusercontent.com/Stuk/jszip/v3.10.1/test/ref/text.zip";const r=await fetch(url,{credentials:"omit"});if(!r.ok)throw Error("HTTP "+r.status);const bytes=new Uint8Array(await r.arrayBuffer());const zip=await JSZip.loadAsync(bytes,{checkCRC32:true});const files={};for(const [name,file] of Object.entries(zip.files))if(!file.dir)files[name]=await file.async("string");self.postMessage({url,status:r.status,bytes:[...bytes],sha256:await sha256(bytes),files});}catch(e){self.postMessage({error:e.message});}};';
   const url=URL.createObjectURL(new Blob([source+'\n'+test],{type:'text/javascript'})),worker=new Worker(url);URL.revokeObjectURL(url);
   return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{worker.terminate();reject(Error('Network fixture timed out'));},25000);worker.onmessage=({data})=>{clearTimeout(timer);worker.terminate();resolve(data);};worker.postMessage(true);});
  });
  if(!report.staticZIP.error){const b=Buffer.from(report.staticZIP.bytes);delete report.staticZIP.bytes;report.staticZIP.independentHashMatches=crypto.createHash('sha256').update(b).digest('hex')===report.staticZIP.sha256;}
  report.pass=report.finalUI.game==='complete'&&report.finalUI.installDisabled&&!report.staticZIP.error&&report.staticZIP.independentHashMatches&&Object.keys(report.staticZIP.files).length>0;
 }catch(e){report.pass=false;report.error=e.stack;}
 finally{await browser.close();fs.writeFileSync(path.join(root,'research/evidence/local-network.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1;}
})();
