/* Actual browser cross-origin requests. No game bytes, credentials or write API. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../research/evidence/cors-browser.json');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage();const logs=[],responses=[];
 page.on('console',m=>{if(m.type()==='error')logs.push(m.text());});
 page.on('response',async r=>{if(/api.github.com|releases\/download|release-assets/.test(r.url()))responses.push({url:r.url(),status:r.status(),headers:await r.allHeaders()});});
 const result={testedAt:new Date().toISOString(),browser:browser.version(),note:'Public third-party repositories are transport fixtures; no SYNODIC repository was supplied.',cases:[]};
 try{
 await page.goto('https://mdn.github.io/dom-examples/',{waitUntil:'domcontentloaded',timeout:30000});
 result.origin=await page.evaluate(()=>location.origin);
 const request=async(label,url,accept='application/vnd.github+json',kind='json')=>{
  const row=await page.evaluate(async({label,url,accept,kind})=>{
   const start=performance.now();try{const r=await fetch(url,{headers:{Accept:accept},credentials:'omit',signal:AbortSignal.timeout(20000)});
    const bytes=new Uint8Array(await r.arrayBuffer());const text=new TextDecoder().decode(bytes);
    let data=null;if(kind==='json'&&r.ok)try{data=JSON.parse(text);}catch{}
    return {label,url,ok:r.ok,status:r.status,type:r.type,finalUrl:r.url,bytes:bytes.length,first4:[...bytes.slice(0,4)],contentType:r.headers.get('content-type'),remaining:r.headers.get('x-ratelimit-remaining'),reset:r.headers.get('x-ratelimit-reset'),digest:bytes.length?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join(''):null,data,elapsedMs:performance.now()-start};
   }catch(e){return {label,url,ok:false,error:e.name+': '+e.message,elapsedMs:performance.now()-start};}
  },{label,url,accept,kind}); result.cases.push(row);return row;
 };
 const list=await request('release-list','https://api.github.com/repos/cli/cli/releases?per_page=3');
 if(Array.isArray(list.data)){
  result.releases=list.data.map(r=>({tag:r.tag_name,prerelease:r.prerelease,draft:r.draft,assets:r.assets.map(a=>({id:a.id,name:a.name,size:a.size,digest:a.digest,browser_download_url:a.browser_download_url,url:a.url}))}));
  const assets=list.data[0].assets;
  const manifest=assets.find(a=>/checksums.*\.txt$/.test(a.name));
  const zip=assets.filter(a=>a.name.endsWith('.zip')).sort((a,b)=>a.size-b.size)[0];
  if(manifest){await request('independent-text-asset-direct',manifest.browser_download_url,'text/plain','bytes');await request('independent-text-asset-api',manifest.url,'application/octet-stream','bytes');}
  if(zip){await request('release-zip-direct',zip.browser_download_url,'application/zip','bytes');await request('release-zip-api',zip.url,'application/octet-stream','bytes');}
 }
 await request('pages-static-file','https://mdn.github.io/dom-examples/streams/simple-pump/','text/html','bytes');
 await request('raw-static-manifest-fixture','https://raw.githubusercontent.com/Stuk/jszip/v3.10.1/package.json','application/json');
 const refs=await request('static-zip-fixture-discovery','https://api.github.com/repos/Stuk/jszip/contents/test/ref?ref=v3.10.1');
 if(Array.isArray(refs.data)){
  result.staticZipFixtures=refs.data.filter(r=>r.name.endsWith('.zip')).map(r=>({name:r.name,size:r.size}));
  const zip=refs.data.filter(r=>r.name.endsWith('.zip')&&r.size>22&&r.size<1048576).sort((a,b)=>b.size-a.size)[0];
  if(zip){const row=await request('raw-static-zip-bytes',zip.download_url,'application/zip','bytes');row.fixtureName=zip.name;}
 }
 const preview=await request('prerelease-metadata-fixture','https://api.github.com/repos/godotengine/godot-builds/releases?per_page=5');
 if(Array.isArray(preview.data))result.previewFixtures=preview.data.map(r=>({tag:r.tag_name,draft:r.draft,prerelease:r.prerelease}));
 for(const row of result.cases)delete row.data;
 }catch(e){result.failure=e.stack;}
 finally{result.consoleErrors=logs;result.responses=responses;fs.writeFileSync(out,JSON.stringify(result,null,2));await browser.close();}
 console.log(JSON.stringify({origin:result.origin,browser:result.browser,cases:result.cases.map(({label,ok,status,bytes,error})=>({label,ok,status,bytes,error})),failure:result.failure},null,2));
})();
